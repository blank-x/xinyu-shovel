import { contextBridge, ipcRenderer } from 'electron';

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('player', {
      openSourceDialog: () => ipcRenderer.send('player:openSourceDialog'),
      onNewAudioPath: (cb)=> ipcRenderer.on('new-audio-path', (e, filePath)=>cb(filePath))

      // searchEverying: (value) => ipcRenderer.invoke('search:everying', value),
      // openApp: (appPath) => ipcRenderer.invoke('search:openApp', appPath),
    })
  } catch (error) {
    console.error(error)
  }
}
