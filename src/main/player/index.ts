import {
  app,
  BrowserWindow,
  Notification,
  ipcMain,
  Tray,
  Menu,
  screen,
  globalShortcut,
  nativeImage,
  dialog,
} from "electron";
import { is } from "@utils";
import log from "electron-log";
import path from "path";
import { EventEmitter } from "events";

log.transports.file.resolvePath = () => path.join(app.getPath('home'), 'xinyu-shovel-logs/main.log');


class Player extends EventEmitter {
  static instance: Player | null;
  static progressInterval: NodeJS.Timer | undefined;
  win: BrowserWindow | null;
  private willQuitApp = false;
  static create() {
    if (!Player.instance) {
      Player.instance = new Player();
    } else {
      Player.instance.win?.show()
    }
    console.log(1111);

    return Player.instance;
  }
  constructor() {
    super()
    const client = screen.getPrimaryDisplay().workArea;
    const x = Math.floor((client.width - client.width / 1.5) / 2) + 20
    const y = Math.floor((client.height - client.height / 1.5) / 2) + 20
    console.log(x, y);

    this.win = new BrowserWindow({
      // 设置宽度, 浮点数竟然在mac16寸上会有问题
      width: Math.floor(client.width / 1.5),
      // 设置高度
      height: Math.floor(client.height / 1.5),
      x,
      y,
      // 隐藏窗口标题栏，方便自定义标题栏
      titleBarStyle: 'hidden',
      // 默认展示出窗口
      show: false,
      webPreferences: {
        preload: path.resolve(__dirname, '../preload/player.js'),
      }
    })
    // 开发环境下的渲染进程地址
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.win.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/player/index.html')
    } else {
      // 生产环境下的渲染进程地址
      this.win.loadFile(path.join(__dirname, '../renderer/player/index.html'))
    }


    this.bindWinEvent();
    this.ipcBind();

  }


  bindWinEvent() {
    // 使用该事件 避免闪烁
    this.win?.on('ready-to-show', () => {
      this.win?.show()

    })
    this.win?.on('close', (e) => {
      Player.instance = null
    })
  }
  getWin() {
    return this.win;
  }
  ipcBind() {
    ipcMain.on('player:openSourceDialog', ()=>{
      console.log('player:openSourceDialog');
      if(this.win){
        const files = dialog.showOpenDialogSync(this.win, {
          properties: ['openFile'],
          filters: [{ name: 'Music', extensions: ['mp3', 'wav', 'ogg'] }]
        });
      
        if (files) {
          const filePath = files[0];
          // 在渲染进程中触发播放音乐事件
          this.win.webContents.send('new-audio-path', filePath);
        }
      }
      
    })


  }


}

export default Player;

