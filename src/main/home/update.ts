import {ipcMain, app, BrowserWindow, DownloadItem, } from 'electron';
import {autoUpdater} from 'electron-updater'
import https from 'https'
import path from 'path';
import { execSync } from 'child_process'
import log from "electron-log";

interface IParams{
  win: BrowserWindow,
  url?: string,
  version?: string
}

let downloadItem: DownloadItem | undefined;

export async function checkUpdate({win}: IParams){
  win.webContents.send('update', { type: 'checkUpdating' })

  await new Promise<string>((resolve,reject)=>{
    https.request(
      {
        host: 'raw.githubusercontent.com',
        method: 'GET',
        path: '/blank-x/xinyu-shovel/master/package.json'
      },
      function (res) {
        let data = ''        
        res.setEncoding('utf8');
        res.on('data', function (d) {
          data += d;
        }); // 必须监听data事件才行；否则end事件不会触发
  
        res.on('end', function () {
          const remotePkg = JSON.parse(data);
          win.webContents.send('update', { type: 'checkUpdateFinish' })   
          const localVersion = app.getVersion().split('.');
          const remoteVersionArr = remotePkg.version.split('.');
          
          // app.getVersion 获取的是本地package.json的version版本
          // 版本限定为三位, 例如 1.0.0, 1.0.1, 1.0.2
          // 小版本升级为补丁版本，代表仅需要更新app.asar 1.0.1-> 1.0.2
          // 大版本或者次版本升级，代表需要重新下载安装包 1.0.1 -> 1.1.0
          if (remoteVersionArr[0] > localVersion[0] || remoteVersionArr[1] > localVersion[1] || remoteVersionArr[2] > localVersion[2] ) {
            const version = `${remoteVersionArr[0]}.${remoteVersionArr[1]}.0`
            console.log(version);
            
            win.webContents.send('update', { type: 'versionUpdate', version })
          } else {
            // 没有更新
            win.webContents.send('update', { type: 'versionUpdate', version : ''})
          }
          resolve(remotePkg.version);
        })
      }
    ).end();
  })
}

export async function downloadUpdate({win, version='' }: IParams){
  const localVersion = app.getVersion().split('.');
  const remoteVersionArr = version.split('.');
  if (remoteVersionArr[0] > localVersion[0] || remoteVersionArr[1] > localVersion[1] ) {
    downloadApp({win, url:`https://github.com/blank-x/xinyu-shovel/releases/download/${version}/xinyu-shovel-${version}.dmg` })
  } else if( remoteVersionArr[2] > localVersion[2]){
    // requestRender(remotePkg.version)
    downloadAsar({win, url: `https://github.com/blank-x/xinyu-shovel/releases/download/${version}/app.asar`})
  }
}

export async function downloadApp({win, url=''}: IParams){
  // 目前没有代码签名，所以需要用户自己安装
  // autoUpdater.checkForUpdates()
  win.webContents.session.on('will-download', (event, item, webContents) => {
    downloadItem = item;
  // Set the save path, making Electron not to prompt a save dialog.
    const fileName = path.basename(url);
    const savePath = app.getPath('downloads')+ '/' + fileName 
    console.log(savePath);
    
    item.setSavePath(savePath)
    win.webContents.send('update', { type: 'beforeDownload', size: item.getTotalBytes() })

    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed')
        win.webContents.send('update', { type: 'interrupted' })

      } else if (state === 'progressing') {
        if (item.isPaused()) {
          win.webContents.send('update', { type: 'paused' })
        } else {
          win.webContents.send('update', { type: 'downloading', size: item.getReceivedBytes() })

        }
      }
    })
    item.once('done', (event, state) => {
      if (state === 'completed') {
        console.log('Download successfully')
        win.webContents.send('update', { type: 'downloadSuccess' })
        execSync(`open ${savePath}`)
      } else {
        win.webContents.send('update', { type: 'downloadFailed' })
      }
    })
  })
  win.webContents.downloadURL(url)

}

export async function cancelDownloadUpdate(){
  downloadItem?.cancel()
}

export async function downloadAsar({win, url}: IParams){
  // 目前没有代码签名，所以需要用户自己安装
  // autoUpdater.checkForUpdates()
  return Promise.resolve(1)
  
}

// 手动下载
export function updateAllHandlerNoSign(){}
// 仅更新app.asar
export function updateRender() {
  let data = ''
  const remotePackage = https.request(
    {
      host: 'raw.githubusercontent.com',
      method: 'GET',
      path: '/blank-x/xinyu-shovel/master/package.json'
    },
    function (res) {
      res.setEncoding('utf8');
      res.on('data', function (d) {
        data += d;
      }); // 必须监听data事件才行；否则end事件不会触发

      res.on('end', function () {
        const remotePkg = JSON.parse(data);
        const remoteVersion = remotePkg.version.split('.');
        // app.getVersion 获取的是本地package.json的version版本
        const localVersion = app.getVersion().split('.');
        // 版本限定为三位, 例如 1.0.0, 1.0.1, 1.0.2
        // 小版本升级为补丁版本，代表仅需要更新app.asar 1.0.1-> 1.0.2
        // 大版本或者次版本升级，代表需要重新下载安装包 1.0.1 -> 1.1.0
        if (remoteVersion[0] > localVersion[0] || remoteVersion[1] > localVersion[1] ) {
          console.log('提示下载安装包')
          // 请求GitHub上的包
          
        } else if( remoteVersion[2] > localVersion[2]){
          requestRender(remotePkg.version)
        } else {
          console.log('无新版本')

        }
      })
    }
  ).end();


  const requestRender = (version: string) => {
    let data = ''
    https.request(
      {
        host: 'github.com',
        method: 'GET',
        path: `/blank-x/playground/releases/download/v${version}/render.zip`
      },
      function (res) {

        if (res.statusCode === 302) {
          const redirectUrl = res.headers.location || '';
          console.log('Redirecting to:', redirectUrl);

          // 发起新的请求到重定向的目标 URL
          https.get(redirectUrl, (redirectRes) => {
            redirectRes.setEncoding('utf8');
            console.log(111)
            redirectRes.on('data', function (d) {
              data += d;
            }); // 必须监听data事件才行；否则end事件不会触发

            redirectRes.on('end', function () {
              console.log(data)
            })
          });
        }
      }
    ).end()
  }
}
