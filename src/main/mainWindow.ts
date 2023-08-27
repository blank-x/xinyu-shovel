import {app, BrowserWindow, Notification, ipcMain, Tray, Menu, screen, globalShortcut} from 'electron';
import path from 'path';
import {EventEmitter} from "events";
import {is} from "@utils";
import appIcon from '../../resources/wx.png?asset'
import log from 'electron-log'
import { updateRender, updateAll, updateAllHandler } from './update'


class MainWindow extends EventEmitter{
  static instance = null;
  private win: BrowserWindow;
  private willQuitApp = false;
  static create() {
    if(!MainWindow.instance) {
      MainWindow.instance = new MainWindow();
    }
    return MainWindow.instance;
  }
  constructor() {
    super()
    this.win = null;
    this.init();
    this.bindAppEvent();
    this.bindWinEvent();
    this.ipcBind();

  }
  init() {
    // 获取屏幕的宽高
    const client = screen.getPrimaryDisplay().workArea;
    this.win = new BrowserWindow({
      // 设置宽度, 浮点数竟然在mac16寸上会有问题
      width: Math.floor(client.width/1.5),
      // 设置高度
      height: Math.floor(client.height/1.5),
      // 默认展示出窗口
      show: false,
      webPreferences: {
        preload: path.resolve(__dirname, '../preload/index.js'),
      }
    })
    // 开发环境下的渲染进程地址
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.win.loadURL(process.env['ELECTRON_RENDERER_URL']+'/major/index.html')
    } else {
      // 生产环境下的渲染进程地址
      this.win.loadFile(path.join(__dirname, '../renderer/major/index.html'))
    }
  }
  bindAppEvent() {
    // 新起一个程序,执行requestSingleInstanceLock的时候会触发其他程序的`second-instance`事件，这是后将第一个app的窗口打开
    app.on('second-instance', () => {
      if (this.win.isMinimized()){
        this.win.restore()
      }
      this.win?.show()
    })
    app.on('activate', () => {
      if(this.win?.isVisible()){
        this.win?.hide()
      } else {
        if (this.win?.isMinimized()){
          this.win?.restore()
        } else{
          this.win?.show()
        }
      }
    })
    // 关闭窗口会触发before-quit
    app.on('before-quit',  (ev)=> {
      this.willQuitApp = true
      this.win?.close()
    })
  }
  bindWinEvent() {
    // 使用该事件 避免闪烁
    this.win.on('ready-to-show', () => {
      this.win?.show()

    })
    this.win.on('close', (e) => {

      // 此处的willQuitApp是一个控制变量，用来标记是否要退出程序，在程序接收到要退出的信号时，在before-quit事件里被设置为true, 这时候不会做阻止退出的操作，直接退出了窗口
      if (this.willQuitApp) {
        // 不要在这里执行console.log，因为这个事件发生在程序退出的时候，这时候console.log不会打印到控制台，可以使用remote模块的console.log来实现打印
        this.win = null;
      } else {
        e.preventDefault();
        this.win.hide();
      }
    })
  }
  getWin() {
    return this.win;
  }
  ipcBind() {
    updateAll(this.win)
    ipcMain.handle('main:triggerAllUpdate', async () => {
      updateAllHandler()
    })
    ipcMain.handle('main:triggerRenderUpdate', async () => {
      updateRender()
    })
  }
}

export default MainWindow;
