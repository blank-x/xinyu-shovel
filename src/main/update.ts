import {ipcMain, app} from 'electron';
import {autoUpdater} from 'electron-updater'
import https from 'https'

// 检测更新，在你想要检查更新的时候执行，renderer事件触发后的操作自行编写
export function updateAll(mainWindow) {
  let message = {
    error: 'update error',
    checking: 'updating...',
    updateAva: 'fetch new version and downloading..1.',
    updateNotAva: 'do not to update'
  }
  // const isDevelopment = process.env.NODE_ENV === 'development'
  //
  autoUpdater.forceDevUpdateConfig = true
  //
  // autoUpdater.setFeedURL(isDevelopment ? 'http://localhost:3000' : "http://localhost:3000")

  autoUpdater.on('error', function () {
    console.log('error')
    sendUpdateMessage(message.error)
  })
  autoUpdater.on('checking-for-update', function () {
    console.log('checking-for-update')
    sendUpdateMessage(message.checking)
  })
  // 版本检测结束，准备更新
  autoUpdater.on('update-available', function (info) {
    console.log('update-available')
    sendUpdateMessage(message.updateAva)
  })
  autoUpdater.on('update-not-available', function (info) {

    console.log('update-not-available')
    sendUpdateMessage(message.updateNotAva)
  })
  // 更新下载进度事件
  autoUpdater.on('download-progress', function (progressObj) {
    console.log('下载进度百分比>>>', progressObj.percent)
  })
  // 下载完成
  autoUpdater.on('update-downloaded', function () {
    // 退出且重新安装
    autoUpdater.quitAndInstall()
  })
  ipcMain.on('checkForUpdate', () => {
    // 执行自动更新检查
    autoUpdater.checkForUpdates()
  })

  // 通过main进程发送事件给renderer进程，提示更新信息
  function sendUpdateMessage(text) {
    mainWindow.webContents.send('message', text)
  }

  // Object.defineProperty(app, 'isPackaged', {
  //   get() {
  //     return true;
  //   }
  // });


}

export function updateAllHandler(){
  autoUpdater.checkForUpdates()
}

export function updateRender() {
  let data = ''
  const remotePackage = https.request(
    {
      host: 'raw.githubusercontent.com',
      method: 'GET',
      path: '/blank-x/playground/master/package.json'
    },
    function (res) {
      res.setEncoding('utf8');
      res.on('data', function (d) {
        data += d;
      }); // 必须监听data事件才行；否则end事件不会触发

      res.on('end', function () {
        const remotePkg = JSON.parse(data);
        const remoteVersion = remotePkg.version.split('.');
        const localVersion = app.getVersion().split('.');
        // 版本好限定为三位, 例如 1.0.0, 1.0.1, 1.0.2
        // 小版本升级为补丁版本，代表热更新 1.0.1-> 1.0.2
        // 大版本或者此版本升级，代表需要重新下载安装包 1.0.1 -> 1.1.0
        if (remoteVersion[0] > localVersion[0] || remoteVersion[1] > localVersion[1] ) {
          console.log('提示下载安装包')
        } else if( remoteVersion[2] > localVersion[2]){
          requestRender(remotePkg.version)
        } else {
          console.log('无新版本')

        }
      })
    }
  ).end();


  const requestRender = (version) => {
    let data = ''
    https.request(
      {
        host: 'github.com',
        method: 'GET',
        path: `/blank-x/playground/releases/download/v${version}/render.zip`
      },
      function (res) {

        if (res.statusCode === 302) {
          const redirectUrl = res.headers.location;
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
