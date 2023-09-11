import { app, Menu, BrowserWindow, MenuItemConstructorOptions, ipcMain } from "electron";
import path from "path";
import { checkUpdate } from './update';
const isMac = process.platform === "darwin";



 
export default (win: BrowserWindow)=>{
  const template = [
    // { label: '' },
    {
      label: "xinyu",
      submenu: [
        { role: "about" , label: "关于xinyu"  },
        { role: "hide" , label: "隐藏" },
        { role: "hideOthers", label: "隐藏其他" },
        { type: "separator" },
        { role: "quit", label: "退出"  },
      ],
    },
    {
      label: "文件",
      submenu: [isMac ? { role: "close", label: '关闭' } : { role: "quit", label: "退出" }],
    },
   
    // { role: 'viewMenu' }
    {
      label: "查看",
      submenu: [
        { role: "reload", label: '重新加载' },
        { role: "forceReload", label: '强制重新加载' },
        { role: "toggleDevTools", label: '开发者工具', accelerator: 'F12', },
        { type: "separator" },
        { role: "zoomIn", label: '缩小' },
        { role: "zoomOut", label: '放大' },
        { type: "separator" },
        { role: "togglefullscreen", label: '全屏' },
      ],
    },
    {
      label: "窗口",
      submenu: [
        { role: "minimize", label: '最小化' },
        { role: "zoom", label: '放大' },
      ],
    },
    {
      role: 'help',
      label: "帮助",
      submenu: [
        {
          label: "打开百度",
          click: async () => {
            const { shell } = require("electron");
            await shell.openExternal("https://www.baidu.com");
          },
        },{
          label: "获取更新",
          click: async () => {
            if(win){
              checkUpdate({win})
            }
            // ipcMain.invoke('updateCheck')
          },
        },
      ],
    },
  ] as MenuItemConstructorOptions[];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}


console.log(isMac);
console.log(app.name);
