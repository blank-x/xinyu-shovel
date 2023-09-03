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
} from "electron";
import { is, moveSecondScreen } from "@utils";
import log from "electron-log";
import path from "path";
import {EventEmitter} from "events";
import { triggerUpdate } from 'constants/ipc';
import { checkUpdate } from './update';
// import SearchWindow from "./searchWindow";

log.info("App starting...");

class Home extends EventEmitter {
  static instance = null;
  private win: BrowserWindow;
  private willQuitApp = false;
  static create() {
    if(!Home.instance) {
      Home.instance = new Home();
    }
    return Home.instance;
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
        preload: path.resolve(__dirname, '../preload/home.js'),
      }
    })
    // 开发环境下的渲染进程地址
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.win.loadURL(process.env['ELECTRON_RENDERER_URL']+'/home/index.html')
    } else {
      // 生产环境下的渲染进程地址
      this.win.loadFile(path.join(__dirname, '../renderer/home/index.html'))
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
    ipcMain.handle(triggerUpdate, async () => {
      // return await updateHandler(this.win)
      checkUpdate({win: this.win})
    })
  }
  async devStart() {
    await app.whenReady();
    // MainWindow.create().then(()=>{

    // });
    const mainWindowInstance = Home.create();
    mainWindowInstance.win.webContents.openDevTools({ mode: "detach" });

    // const searchWindowFn = function () {
    //   const searchWindow = SearchWindow.create();
    //   searchWindow.on("create", (win) => {
    //     // moveSecondScreen(win);

    //   });
    // };

    // const mainWindowFn = () => {
    //   const mainWindowInstance = MainWindow.create();
    //   const win = mainWindowInstance.getWin();
    //   // moveSecondScreen(win);
    //   win.webContents.openDevTools({ mode: "detach" });
    // };
    // mainWindowFn();
    // searchWindowFn()
    // updateRender()
  }
  async start() {
    await app.whenReady();
    // 开发环境，调试使用
    Home.create();
    // const win = mainWindowInstance.getWin();
    // mac 下 没有开发者账号，无法签名，实际效果未验证，先注释掉该功能

    // SearchWindow.create()
    // updateRender()
  }
  async startSingleApp() {
    const gotSingleLock = app.requestSingleInstanceLock();
    if (!gotSingleLock) {
      // 如果获取锁失败，则说明应用程序已经在运行，退出当前实例
      app.quit();
    } else {
      if (is.dev) {
        await this.devStart();
      } else {
        await this.start();
      }
      this.setTray();

      if (process.platform === "darwin") {
        app.dock.setIcon(path.resolve(__dirname, "../../public/128x128.png"));
      }
      // 处理关闭窗口的程序，mac里即使关闭了窗口，程序仍然在运行，需要手动退出； 其他系统只要所有窗口都关闭了，直接退出程序
      // 这个只是惯例，需要根据用户的使用场景来定
      app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
          app.quit();
        }
      });
    }
  }
  // 设置顶部菜单图标
  // 尺寸很重要，16x16比较合适， 并且增加2倍图，高清屏的时候会自动使用@2x的图
  // 文档 https://www.electronjs.org/docs/latest/api/native-image#high-resolution-image
  setTray() {
    const appIcon = path.resolve(__dirname, "../../public/tray.png");
    // const icon = nativeImage.createFromPath(appIcon)
    const tray = new Tray(appIcon); // 此处可以使用icon 也可以使用appIcon
    const contextMenu = Menu.buildFromTemplate([
      { label: "Item1", type: "radio" },
      { label: "Item2", type: "radio" },
      { label: "Item3", type: "radio", checked: true },
      { label: "Item4", type: "radio" },
    ]);
    tray.setToolTip("This is my application.");
    tray.setContextMenu(contextMenu);
  }
}

app.whenReady().then(()=>{
  Home.create().startSingleApp();
})

