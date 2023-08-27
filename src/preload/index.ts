import {contextBridge, ipcRenderer} from 'electron';


if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', {
      onUpdate: (cb) => ipcRenderer.on('message', cb),
      triggerRenderUpdate: () => ipcRenderer.invoke('main:triggerRenderUpdate'),
      triggerAllUpdate: () => ipcRenderer.invoke('main:triggerAllUpdate'),

    })

  } catch (error) {
    console.error(error)
  }
}
