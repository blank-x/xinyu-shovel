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
import MainWindow from "./mainWindow";
import SearchWindow from "./searchWindow";

log.info("App starting...");

class App {
  constructor() {}
  async devStart() {
    await app.whenReady();
    const searchWindowFn = function () {
      const searchWindow = SearchWindow.create();
      searchWindow.on("create", (win) => {
        // moveSecondScreen(win);
        win.webContents.openDevTools({ mode: "undocked" });
        win.removeAllListeners("blur");
      });
    };

    const mainWindowFn = () => {
      const mainWindowInstance = MainWindow.create();
      const win = mainWindowInstance.getWin();
      // moveSecondScreen(win);
      win.webContents.openDevTools({ mode: "detach" });
    };
    mainWindowFn();
    // searchWindowFn()
    // updateRender()
  }
  async start() {
    await app.whenReady();
    // 开发环境，调试使用
    const mainWindowInstance = MainWindow.create();
    const win = mainWindowInstance.getWin();
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

new App().startSingleApp();
