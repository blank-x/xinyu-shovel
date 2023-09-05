import {ipcMain, app, BrowserWindow, DownloadItem, } from 'electron';
import {autoUpdater} from 'electron-updater'
import https from 'https'
import path from 'path';
import { execSync, spawn } from 'child_process'
import log from "electron-log";
import { existsSync,renameSync, unlinkSync } from 'fs';
log.transports.file.resolvePath = () => path.join(app.getPath('home'), 'xinyu-shovel-logs/main.log');

interface IParams{
  win: BrowserWindow,
  url?: string,
  version?: string
}

log.info(app.getAppPath())


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
            
            win.webContents.send('update', { type: 'versionUpdate', version: remotePkg.version})
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
  // Set the save path, making Electron not to prompt a save dialog.
    const fileName = item.getFilename();
    const saveTempPath = app.getPath('downloads')+ '/' + 'temp-' + fileName 
    const saveFinalPath = app.getPath('downloads')+ '/' + fileName 

    console.log(saveTempPath, saveFinalPath);
    const canResume = item.canResume()
    if(canResume){
      item.resume()
    }
    // if(!canResume && existsSync(saveTempPath)){
    //   item.cancel()
    //   return;
    // }
    console.log('saveFinalPath',existsSync(saveFinalPath));
    
    if(existsSync(saveFinalPath)){
      win.webContents.send('update', { type: 'downloadSuccess' })
      item.cancel()
      execSync(`open ${saveFinalPath}`)
      app.quit()
      return;
    }


    item.setSavePath(saveTempPath)
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
        if(existsSync(saveTempPath)){
          renameSync(saveTempPath, saveFinalPath);
          execSync(`open ${saveFinalPath}`)
          app.quit()
        }
      } else {
        win.webContents.send('update', { type: 'downloadFailed' })
      }
    })
    ipcMain.handle('cancelUpdateDownload', async () => {
      // return await updateHandler(this.win)
      item?.cancel()
    })
  })
  win.webContents.downloadURL(url)
}

 

export async function downloadAsar({win, url}: IParams){
  console.log(url);
  // 目前没有代码签名，所以需要用户自己安装
  // autoUpdater.checkForUpdates()
  win.webContents.session.on('will-download', (event, item, webContents) => {
    // Set the save path, making Electron not to prompt a save dialog.
      const fileName = item.getFilename();
      const saveTempPath = app.getPath('downloads')+ '/' + 'temp-' + fileName 
      const saveFinalPath = app.getPath('downloads')+ '/' + fileName 
  
      const canResume = item.canResume()
      if(canResume){
        item.resume()
      }
 
      log.info('saveFinalPath',existsSync(saveFinalPath));

      log.warn(process.resourcesPath);
      
      
      if(existsSync(saveFinalPath)){
        win.webContents.send('update', { type: 'downloadSuccess' })
        item.cancel()
        unlinkSync(path.resolve(process.resourcesPath, 'app.asar'))
        renameSync(saveFinalPath, path.resolve(process.resourcesPath, 'app.asar'));
        app.relaunch()
        app.exit(0)
        // execSync(`open ${saveFinalPath}`)
        // spawn('echo',['$PATH'],{
        //   stdio:['pipe','inherit','pipe'], // stdout 是inherit才能在当前命令行打印出来
        //   shell: true
        // });
        // app.quit()
        return;
      }
  
  
      item.setSavePath(saveTempPath)
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
          log.info('Download successfully')
          win.webContents.send('update', { type: 'downloadSuccess' })
          log.info('existsSync(saveTempPath)', existsSync(saveTempPath))

          if(existsSync(saveTempPath)){
            // renameSync(saveTempPath, saveFinalPath);
            // execSync(`open ${saveFinalPath}`)
            // app.quit()
            log.info('replace')

            unlinkSync(path.resolve(process.resourcesPath, 'app.asar'))
            renameSync(saveTempPath, path.resolve(process.resourcesPath, 'app.asar'));
            app.relaunch()
            app.exit(0)
          }
        } else {
          win.webContents.send('update', { type: 'downloadFailed' })
        }
      })
      ipcMain.handleOnce('cancelUpdateDownload', async () => {
        // return await updateHandler(this.win)
        item?.cancel()
      })
    })
  win.webContents.downloadURL(url)
  
}
