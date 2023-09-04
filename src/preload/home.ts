import {contextBridge, ipcRenderer} from 'electron';
import { homeExposeType } from 'types/update';
import { updateMessageTypes } from 'types/update'

const updateCheck =  "updateCheck";
const updateDownload =  "updateDownload";


if (process.contextIsolated) {
  try {

    const expose: homeExposeType  = {
      onUpdate: (cb: any) => ipcRenderer.on('update', cb),
      updateCheck: () => ipcRenderer.invoke(updateCheck),
      updateDownload: (arg: any) => ipcRenderer.invoke(updateDownload, arg),
    }
    contextBridge.exposeInMainWorld('homeExpose', expose)

  } catch (error) {
    console.error(error)
  }
}
