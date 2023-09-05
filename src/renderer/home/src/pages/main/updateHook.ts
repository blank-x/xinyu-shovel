import { ref, watch } from 'vue';
import { updateMessageTypes } from 'types/update'

const useUpdate = () => {
  const checkUpdateing = ref(false)
  const newVersion = ref('')
  const hasNewVersion = ref(false);
  const downloading = ref(false);
  const downloaded = ref(false);

  const totalSize = ref(0)
  const downloadSize = ref(0)

  const updateCheck = ()=>{
    downloadSize.value = 0;
    downloading.value = false
    window.homeExpose.updateCheck();
  }
  const updateDownload = ()=>{
    if(downloading.value){
      return;
    }
    window.homeExpose.updateDownload({version: newVersion.value});
  }

  const cancelUpdateDownload = ()=>{
    window.homeExpose.cancelUpdateDownload();
  }

  window.homeExpose.onUpdate(function (ev, msg: updateMessageTypes) {
    if(msg.type === 'checkUpdating'){
      checkUpdateing.value = true
    }
    if(msg.type === 'checkUpdateFinish'){
      checkUpdateing.value = false
    }
    if (msg.type === 'versionUpdate') {
      if(msg.version){
        hasNewVersion.value = true
      }
      newVersion.value = msg.version || ''
    }
    if(msg.type === 'beforeDownload'){
      totalSize.value = msg.size || 0
    }
    if(msg.type === 'downloading'){
      downloadSize.value = msg.size || 0
      downloading.value = true
      downloaded.value = false

    }
    if(msg.type === 'downloadSuccess'){
      downloaded.value = true
      downloading.value = false
    }
  })
 
  return {
    updateCheck,
    updateDownload,
    checkUpdateing,
    newVersion,
    totalSize,
    downloadSize,
    hasNewVersion,
    cancelUpdateDownload,
    downloading,
    downloaded,
  }
}
export default useUpdate