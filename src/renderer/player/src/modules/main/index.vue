<template>
  <div  class="flex-1 flex justify-center items-center relative" style="-webkit-app-region: drag">
    <el-button v-if="!audioSrc" style="-webkit-app-region: no-drag" type="primary" @click="addSource" >添加11</el-button>
    <audio v-if="audioSrc" controls id="music-player" ref="audioRef" />

  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, defineComponent, ref, render, watch, onMounted } from 'vue'

const addSource = ()=>{  
  window.player.openSourceDialog()
}
let audioRef = ref<HTMLAudioElement>();

const audioSrc = ref('')
window.player.onNewAudioPath((filePath)=>{
  // console.log(filePath);
  // console.log(audioRef.value);
  // if(audioRef.value){
  //     audioRef.value.src = filePath;
  //     audioSrc.value = filePath
  //     audioRef.value.play();
  // }
})
onMounted(() => {
  console.log(audioRef.value);
  
})
</script>

