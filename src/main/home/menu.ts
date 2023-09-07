import { app, Menu, BrowserWindow, MenuItemConstructorOptions } from "electron";
import path from "path";
const isMac = process.platform === "darwin";

const template = [
  // { role: 'appMenu' }
  {
    label: "打开",
    submenu: [
      {
        label: "打开一个新的网页",
        click: () => {
          var win: BrowserWindow | null = new BrowserWindow({
            width: 500,
            height: 500,
            webPreferences: {
              // 开启node
              nodeIntegration: true,
              contextIsolation: false,
            },
          });
          win.loadFile(path.resolve(__dirname, "y.html"));
          win.on("closed", () => {
            win = null;
          });
        },
      },
      {
        label: "什么也不做",
      },
    ],
  },
  {
    label: "只有一个菜单按钮",
  },
  {
    label: "新闻",
    submenu: [
      {
        label: "河南新闻",
        submenu: [{ label: "娱乐新闻" }, { label: "体育新闻" }],
      },
      {
        label: "河北新闻",
        submenu: [{ label: "娱乐新闻" }, { label: "体育新闻" }],
      },
    ],
  },
  ...(isMac
    ? [
        {
          label: "sdfsdfsdf",
          submenu: [
            { role: "about", },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideOthers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
          ],
        },
      ]
    : []),
  // { role: 'fileMenu' }
  {
    label: "文件",
    submenu: [isMac ? { role: "close", label:  } : { role: "quit" }],
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
      },
    ],
  },
] as MenuItemConstructorOptions[];

 
export default ()=>{
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}


console.log(isMac);
console.log(app.name);
