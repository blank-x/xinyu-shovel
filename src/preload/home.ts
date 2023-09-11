import { contextBridge, ipcRenderer } from 'electron';
import { homeExposeType } from 'types/update';
import { updateMessageTypes } from 'types/update'

const updateCheck = "updateCheck";
const updateDownload = "updateDownload";
const cancelUpdateDownload = "cancelUpdateDownload";


if (process.contextIsolated) {
  try {

    const expose: homeExposeType = {
      onUpdate: (cb: any) => ipcRenderer.on('update', cb),
      updateCheck: () => ipcRenderer.invoke(updateCheck),
      updateDownload: (arg: any) => ipcRenderer.invoke(updateDownload, arg),
      cancelUpdateDownload: () => ipcRenderer.invoke(cancelUpdateDownload),
      openWindow: () => ipcRenderer.send('openWindow', 'player')
    }
    contextBridge.exposeInMainWorld('homeExpose', expose)

  } catch (error) {
    console.error(error)
  }
}
