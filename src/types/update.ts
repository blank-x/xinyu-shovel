export type updateMessageTypes = {
  type:  'checkUpdating' | 'checkUpdateFinish' | 'versionUpdate' |  'beforeDownload' |'downloading' | 'paused' | 'downloadFailed' | 'downloadSuccess',
  size?: number,
  version?: string,
}

export type homeExposeType = {
  // home
  onUpdate: (cb: (ev: any, msg: updateMessageTypes)=>any) => any;
  updateCheck: () => any;
  updateDownload: (arg: {version: string}) => any
  cancelUpdateDownload: () => any;
}


declare global {
  interface Window {
    searchExpose: {
      searchResize: () => void;
      searchEverying: (searchValue: string) => Promise<any>;
      openApp: (appPath: string) => void;
    };
    // search
    homeExpose: homeExposeType
  }
}

// 这个必须加上，否则会报错