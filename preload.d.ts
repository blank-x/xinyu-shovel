 declare global {
  interface Window {
    searchExpose: {
      searchResize: () => void;
      searchEverying: (searchValue: string) => Promise<any>;
      openApp: (appPath: string) => void;
    };
    // search
    homeExpose: {
      // home
      onUpdate: (cb) => void;
      triggerUpdate: () => void;
    }
  

  }
}

// 这个必须加上，否则会报错
export {}