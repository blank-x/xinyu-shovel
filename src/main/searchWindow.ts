import {app, BrowserWindow, globalShortcut, ipcMain, Menu, protocol} from 'electron';
import path from "path";
import fs from "fs";
import {writeFile} from 'node:fs/promises';

const {isBinaryFile} = require('isbinaryfile');

import os from "os";
import plist from 'plist';

const bplist = require('bplist-parser');
import {EventEmitter} from "events";
import {spawn, execSync} from "child_process";
import {pinyin} from "pinyin-pro";
import iconutil from 'iconutil';

const util = require('util');

const toIconset = util.promisify(iconutil.toIconset);


import {is} from "@utils";

class SearchWindow extends EventEmitter {
  private win: BrowserWindow;
  private iconDir = path.join(os.tmpdir(), 'com.playground/appicon');
  private translateDir = path.join(os.tmpdir(), 'com.playground/translate');
  private searchDirs: string[] = ['/Applications', '/System/Applications', '/System/Library/CoreServices', '/System/Library/PreferencePanes'];
  static instance = null;
  private localApps: any[];

  static create() {
    if (!SearchWindow.instance) {
      SearchWindow.instance = new SearchWindow();
    }
    return SearchWindow.instance;
  }

  constructor() {
    super()
    this.win = null;

    this.init();
  }

  async init() {

    this.bindShortCut();
    this.localApps = await this.utils().getApps();
    await this.utils().initTmpDir();
    await this.utils().preCreateAppIcon();
    // this.localApps = this.localApps.filter(item => item.icon);
    await this.utils().createTranslate();
  }

  bindAppEvent() {
    app.on('before-quit', (ev) => {
      this.win?.close()
      globalShortcut.unregister('Command+L')
    })
  }

  bindWinEvent() {
    this.win.on('close', (e) => {
      this.win = null // 释放内存
    })

    this.win.on('blur', (e) => {
      this.win?.hide() // 失去焦点时隐藏
    })
    this.win.on('ready-to-show', async () => {
      const contentHeight = await this.win.webContents.executeJavaScript(`document.body.scrollHeight`)
      // 调整窗口高度以适应内容
      this.win.setSize(800, contentHeight)
      this.win.show() // 初始化后再显示
    })
  }

  bindShortCut() {
    globalShortcut.register('Command+L', this.showSearchBar.bind(this))
  }

  showSearchBar() {
    if (this.win) {
      if (this.win?.isVisible()) {
        this.win?.hide()
      } else {
        this.win?.show()
      }
    } else {
      this.createWindow()
    }
    this.win.setAlwaysOnTop(true, 'pop-up-menu')
    if (process.platform === 'darwin') {
      app.dock.hide(); // 隐藏 Dock 栏图标
      Menu.setApplicationMenu(null); // 替换菜单栏为一个空的菜单, 这样就不会有菜单栏了
    }
  }

  createWindow() {
    this.win = new BrowserWindow({
      width: 500,
      frame: false,
      show: false,
      transparent: true,
      resizable: false,
      useContentSize: true,
      webPreferences: {
        preload: path.resolve(__dirname, '../preload/searchPreload.js'),
        devTools: true
      }
    })

    protocol.interceptFileProtocol("image", (req, callback) => {
      const url = req.url.substr(8);
      callback(decodeURI(url));
    });

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      // 开发环境下的渲染进程地址
      this.win.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/search/index.html')
    } else {
      // 生产环境下的渲染进程地址
      this.win.loadFile(path.join(__dirname, '../renderer/search/index.html'))
    }
    this.ipcBind()
    this.bindWinEvent()
    this.bindAppEvent()
    this.emit('create', this.win)
  }

  getWin() {
    return this.win;
  }

  hideWin() {
    this.win?.hide()
  }

  ipcBind() {
    ipcMain.handle('search:resize', async () => {
      const contentHeight = await this.win.webContents.executeJavaScript(`document.body.scrollHeight`)
      // 调整窗口高度以适应内容
      this.win.setSize(800, contentHeight)
    })

    ipcMain.handle('search:everying', async (e, searchValue) => {
      if (searchValue === '') {
        return []
      }
      if (!this.localApps) {
        this.localApps = await this.utils().getApps()
      }
      let lowerCaseSearchValue = pinyin(searchValue, {toneType: 'none'}).replace(/\s/, '').toLowerCase()

      return this.localApps
        .filter((app) => {
          const appPathName = app.path.split('/')?.pop()?.split('.')?.[0] || ``;
          app.pathName = appPathName;
          // pinyin
          app.pinyin = pinyin(app._name, {toneType: 'none'}).replace(/\s/, '').toLowerCase()
          return (app.pinyin.toLowerCase().indexOf(lowerCaseSearchValue) > -1 || appPathName.toLowerCase().indexOf(lowerCaseSearchValue) > -1)
            && app.path
            && this.searchDirs.some((dir) => app.path.startsWith(dir)) // 过滤掉不在搜索目录下的应用
        })
        .sort((a, b) => {
          const temp1 = a.pinyin.toLowerCase().indexOf(lowerCaseSearchValue)
          const temp2 = a.pathName.toLowerCase().indexOf(lowerCaseSearchValue)
          const temp3 = b.pinyin.toLowerCase().indexOf(lowerCaseSearchValue)
          const temp4 = b.pathName.toLowerCase().indexOf(lowerCaseSearchValue)
          return Math.min(temp1 === -1 ? 10000 : temp1, temp2 === -1 ? 10000 : temp2)
            - Math.min(temp3 === -1 ? 10000 : temp3, temp4 === -1 ? 10000 : temp4)
        })
        .map((app) => {
          // console.log(app.icon)
          return {
            name: app._name,
            icon: app.icon,
            path: app.path,
            renderPath: app.renderPath
          }
        })
    })
    ipcMain.handle('search:openApp', async (e, appPath) => {
      execSync(`open ${appPath}`)
      this.hideWin()
    })
  }

  utils() {
    return {
      getApps: async (): Promise<any[]> => {
        return new Promise((resolve, reject) => {
          let resultBuffer = Buffer.from([]);
          // /usr/sbin/system_profiler 是macos中获取系统信息的命令，
          // -xml 表示输出xml格式
          // -detailLevel mini 表示输出详细程度为最低级别
          // SPApplicationsDataType 表示输出应用程序信息
          const profilerProcess = spawn("/usr/sbin/system_profiler", [
            "-xml",
            "-detailLevel",
            "mini",
            "SPApplicationsDataType",
          ]);

          profilerProcess.stdout.on("data", (chunckBuffer) => {
            resultBuffer = Buffer.concat([resultBuffer, chunckBuffer]);
          });

          profilerProcess.on("exit", (exitCode) => {
            if (exitCode !== 0) {
              reject([]);
              return;
            }
            try {
              const [installedApps] = plist.parse(resultBuffer.toString()) as any[];
              return resolve(installedApps._items.filter(app => {
                const extname = path.extname(app.path);

                return extname === '.app' || extname === '.prefPane';
              }).map(app => {
                return {
                  ...app,
                  renderPath: app.path.replace(/ /g, '\\ '),
                }
              }))
            } catch (err) {
              reject(err);
            }
          });


          profilerProcess.on("error", (err) => {
            reject(err);
          });
        });
      },
      initTmpDir: async () => {
        const existsIcon = fs.existsSync(this.iconDir);
        if (!existsIcon) {
          fs.mkdirSync(this.iconDir, {recursive: true});
        }
        const existsTranslate = fs.existsSync(this.translateDir);
        if (!existsTranslate) {
          fs.mkdirSync(this.translateDir, {recursive: true});
        }
      },
      preCreateAppIcon: async () => {
        for (const app of this.localApps) {
          try {

            const name = app._name;
            const appPath = app.path;
            const iconpath = path.join(this.iconDir, `${name}.png`);
            const iconnone = path.join(this.iconDir, `${name}.none`);
            const exists = fs.existsSync(iconpath);
            const existsnone = fs.existsSync(iconnone);
            if (exists) {
              app.icon = 'image://' + iconpath.replace(/ /g, '\ ');
              continue;
            }
            if (existsnone) continue;
            const appName: string = appPath.split('/').pop() || '';
            const extname: string = path.extname(appName);
            const appSubStr: string = appName.split(extname)[0];
            const path1 = path.join(appPath, `/Contents/Resources/App.icns`);
            // 腾讯会议
            const path2 = path.join(appPath, `/Contents/Resources/AppIcon.icns`);
            // OneNote.app
            const path3 = path.join(appPath, `/Contents/Resources/${appSubStr}.icns`);
            // Navicat Premium.app
            const path4 = path.join(
              appPath,
              `/Contents/Resources/${appSubStr.replace(' ', '')}.icns`
            );
            let icnsPath: string = '';
            if (fs.existsSync(path1)) {
              icnsPath = path1;
            } else if (fs.existsSync(path2)) {
              icnsPath = path2;
            } else if (fs.existsSync(path3)) {
              icnsPath = path3;
            } else if (fs.existsSync(path4)) {
              icnsPath = path4;
            } else {
              // xmind.app
              // 性能最低的方式
              if (!fs.existsSync(path.join(appPath, `/Contents/Resources`))) {
                fs.writeFileSync(iconnone, '');
                continue;
              }
              let iconName = ''
              try {
                let infoObj: any = {}
                const isBinary = await isBinaryFile(path.join(appPath, `/Contents/Info.plist`))
                if (isBinary) {
                  infoObj = bplist.parseFileSync(path.join(appPath, `/Contents/Info.plist`) as any);
                } else {
                  const infoList = fs.readFileSync(path.join(appPath, `/Contents/Info.plist`), 'utf8');
                  infoObj = plist.parse(infoList) as any[];

                }
                iconName = infoObj.CFBundleIconFile || infoObj?.[0]?.CFBundleIconFile || '';
                iconName = iconName.replace(/ /g, '\ ');
                if (iconName && !path.extname(iconName)) {
                  iconName += '.icns'
                }
              } catch (e) {
                // console.log(e,1111,path.join(appPath, `/Contents/Info.plist`))
              }
              if (!iconName) {
                const resourceList = fs.readdirSync(
                  path.join(appPath, `/Contents/Resources`)
                );
                iconName = resourceList.filter(
                  (file) => path.extname(file) === '.icns'
                )[0];
              }


              if (!iconName) {
                fs.writeFileSync(iconnone, '');
                continue;
              }
              icnsPath = path.join(appPath, `/Contents/Resources/${iconName}`);
            }
            // console.log(icnsPath, 1111)

            const icnsIcons = await toIconset(icnsPath);
            // console.log('dddd')
            const buf = icnsIcons['icon_32x32@2x.png']
              || icnsIcons['icon_32x32.png']
              || icnsIcons['icon_16x16@2x.png']
              || icnsIcons['icon_16x16.png']
              || icnsIcons['icon_32x32@2x.png']
              || icnsIcons['icon_128x128.png']
              || icnsIcons['icon_128x128@2x.png']
              || icnsIcons['icon_256x256.png']
              || icnsIcons['icon_256x256@2x.png']
              || icnsIcons['icon_512x512.png']
              || icnsIcons['icon_512x512@2x.png']

            await writeFile(iconpath, buf);
            app.icon = 'image://' + iconpath.replace(/ /g, '\ ');
          } catch (e) {
            // console.log(app)
            // console.log(e, 1111);
          }
        }

      },
      clearAppIcon: async () => {
        const files = fs.readdirSync(this.iconDir);
        for (const file of files) {
          fs.unlinkSync(path.join(this.iconDir, file));
        }
      },
      createTranslate: async () => {
        const translateFile = path.join(this.translateDir, `pinyin.json`);
        const exists = fs.existsSync(translateFile);

        if (!exists) {
          fs.writeFileSync(translateFile, '{}');
        }
        // const value = this.translateMap[key];
        // return ;
      },
    }
  }
}

class Test {

  async testIcns() {

    var paths = '/Applications/TencentMeeting.app/Contents/Resources/AppIcon.icns';

    iconutil.toIconset(paths, function (err, icons) {
      console.log(icons)
      const buf = icons['icon_32x32@2x.png'];
      const iconPath = path.join(process.cwd(), 'test', `icon_32x32@2x.png`);
      console.log(iconPath)
      writeFile(iconPath, buf);
      // icons is an an object where keys are the file names
      // and the values are Buffers containing PNG files
    });
  }
}


export default SearchWindow
