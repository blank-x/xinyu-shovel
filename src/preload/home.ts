import {contextBridge, ipcRenderer} from 'electron';
import { triggerUpdate } from 'constants/ipc';

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('homeExpose', {
      onUpdate: (cb) => ipcRenderer.on('message', cb),
      [triggerUpdate]: () => ipcRenderer.invoke(triggerUpdate),

    })

  } catch (error) {
    console.error(error)
  }
}
