interface SearchWindow extends Window{
    search: {
        searchResize: () => void;
        searchEverying: (searchValue: string) => Promise<any>;
        openApp: (appPath: string) => void;
    }
}

interface MainWindow extends Window{
    electron: {
        onUpdate: (cb) => void;
        triggerRenderUpdate: () => void;
        triggerAllUpdate: () => void;
    };
}

