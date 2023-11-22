import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export const ipcRendererBase = {
  setStoreValue: (key: string, value: any) => {
    ipcRenderer.send("setStore", key, value)
  },

  getStoreValue(key: string) {
    const resp = ipcRenderer.sendSync("getStore", key)
    return resp
  },
}