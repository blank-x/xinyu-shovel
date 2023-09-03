import {app, BrowserWindow, Notification, ipcMain, Tray, Menu, screen, globalShortcut} from 'electron';
import path from 'path';
function handleIPC() {
  ipcMain.handle('work1-notification', () => {
    let notice = new Notification({
      title: '任务结束',
      body: '是否开始休息',
      actions: [{text: '开始休息', type: 'button'}],
      closeButtonText: '继续工作'
    })
    notice.show()
    notice.on('action', () => {

    })
    notice.on('close', () => {
    })
  })
  const openAboutWindow = require('about-window').default;
  openAboutWindow({
  icon_path: path.join(__dirname, 'wx.png'),
  package_json_dir: path.resolve(__dirname),
  copyright: 'Copyright (c) 2023  xxxx',
  homepage: 'https://github.com/',
  bug_report_url: 'https://github.com/',
  })
}


// handleIPC()


//
// const tray = new Tray(appIcon)
//
// const contextMenu = Menu.buildFromTemplate([
//   {label: 'Item1', type: 'radio'},
//   {label: 'Item2', type: 'radio'},
//   {label: 'Item3', type: 'radio', checked: true},
//   {label: 'Item4', type: 'radio'}
// ])
// tray.setToolTip('This is my application.')
// tray.setContextMenu(contextMenu)
//



// import('../accessory/menu.js');
// 隐藏菜单栏
// win.setMenuBarVisibility(false);



// 检测更新，在你想要检查更新的时候执行，renderer事件触发后的操作自行编写
// export function updateAll(mainWindow) {
//   let message = {
//     error: 'update error',
//     checking: 'updating...',
//     updateAva: 'fetch new version and downloading..1.',
//     updateNotAva: 'do not to update'
//   }
//   //
//   autoUpdater.forceDevUpdateConfig = true
//   //
//   // const isDevelopment = process.env.NODE_ENV === 'development'
//   // autoUpdater.setFeedURL(isDevelopment ? 'http://localhost:3000' : "http://localhost:3000")

//   autoUpdater.on('error', function (error) {
//     console.log('error')
//     sendUpdateMessage(error)
//   })
//   autoUpdater.on('checking-for-update', function () {
//     console.log('checking-for-update')
//     sendUpdateMessage(message.checking)
//   })
//   // 版本检测结束，准备更新
//   autoUpdater.on('update-available', function (info) {
//     console.log('update-available')
//     sendUpdateMessage(message.updateAva)
//   })
//   autoUpdater.on('update-not-available', function (info) {

//     console.log('update-not-available')
//     sendUpdateMessage(message.updateNotAva)
//   })
//   // 更新下载进度事件
//   autoUpdater.on('download-progress', function (progressObj) {
//     console.log('下载进度百分比>>>', progressObj.percent)
//   })
//   // 下载完成
//   autoUpdater.on('update-downloaded', function () {
//     // 退出且重新安装
//     autoUpdater.quitAndInstall()
//   })
//   ipcMain.on('checkForUpdate', () => {
//     // 执行自动更新检查
//     autoUpdater.checkForUpdates()
//   })

//   // 通过main进程发送事件给renderer进程，提示更新信息
//   function sendUpdateMessage(text) {
//     mainWindow.webContents.send('message', text)
//   }

//   // Object.defineProperty(app, 'isPackaged', {
//   //   get() {
//   //     return true;
//   //   }
//   // });


// }