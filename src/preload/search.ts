import { contextBridge, ipcRenderer } from 'electron';

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('search', {
      searchResize: () => ipcRenderer.invoke('search:resize'),
      searchEverying: (value) => ipcRenderer.invoke('search:everying', value),
      openApp: (appPath) => ipcRenderer.invoke('search:openApp', appPath),
    })
  } catch (error) {
    console.error(error)
  }
}
