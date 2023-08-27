const { app, Menu, BrowserWindow } = require('electron')
const path = require('path');
const isMac = process.platform === 'darwin'
console.log(app.name)
const template = [
  // { role: 'appMenu' }
  {
    label:'打开',
    submenu:[
        {
            label:'打开一个新的网页',
            click:()=>{
                var win = new BrowserWindow({
                    width:500,
                    height:500,
                    webPreferences:{
                        // 开启node
                        nodeIntegration:true,
                        contextIsolation:false
                    }
                })
                win.loadFile(path.resolve(__dirname, 'y.html'))
                win.on('closed',()=>{
                    win = null
                })
            }
            
        },
        {
            label:'什么也不做'
        }
    ]
},
{
    label:'只有一个菜单按钮'
},
{
    label:'新闻',
    submenu:[
        {label:'河南新闻',submenu:[{label:'娱乐新闻'},{label:'体育新闻'}]},
        {label:'河北新闻',submenu:[{label:'娱乐新闻'},{label:'体育新闻'}]},
    ]
},
  ...(isMac ? [{
    label: 'sdfsdfsdf',
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startSpeaking' },
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://electronjs.org')
        }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
// Menu.setApplicationMenu(menu)

console.log(isMac)