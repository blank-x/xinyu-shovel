import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { ipcRendererBase }  from './base';

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('player', {
      openSourceDialog: () => ipcRenderer.send('player:openSourceDialog'),
      onNewAudioPath: (cb: (_:string)=>any)=> ipcRenderer.on('new-audio-path', (e, filePath)=>cb(filePath)),
      ...ipcRendererBase,

      // searchEverying: (value) => ipcRenderer.invoke('search:everying', value),
      // openApp: (appPath) => ipcRenderer.invoke('search:openApp', appPath),
    })
  } catch (error) {
    console.error(error)
  }
}
