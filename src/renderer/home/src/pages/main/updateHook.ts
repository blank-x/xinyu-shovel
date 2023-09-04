import { ref, watch } from 'vue';
import { updateMessageTypes } from 'types/update'

const useUpdate = () => {
  const checkUpdateing = ref(false)
  const newVersion = ref('')
  const hasNewVersion = ref(false);
  const totalSize = ref(0)
  const downloadSize = ref(0)

  const updateCheck = ()=>{
    window.homeExpose.updateCheck();
  }
  const updateDownload = ()=>{
    window.homeExpose.updateDownload({version: newVersion.value});
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
    }
  })
  // watch([num1, num2], ([num1, num2]) => {
  //   addFn(num1, num2)
  // })
 
  return {
    updateCheck,
    updateDownload,
    checkUpdateing,
    newVersion,
    totalSize,
    downloadSize,
    hasNewVersion,
  }
}
export default useUpdate