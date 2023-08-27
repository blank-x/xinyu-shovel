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
