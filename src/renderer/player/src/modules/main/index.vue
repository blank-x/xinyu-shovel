<template>
  <div  class="flex-1 flex justify-center items-center relative" style="-webkit-app-region: drag">
    <div style="-webkit-app-region: no-drag">
      <el-button v-if="!audioSrc" type="primary" @click="addSource" >添加11</el-button>
      <audio v-if="audioSrc" controls id="music-player" ref="audioRef" />
      <h1>播放列表</h1>
      <div>
        <div v-for="song in playList">{{ song }}</div>
      </div>
    </div>
   
  </div>
</template>

<script setup lang="ts">

import { defineProps, defineEmits, defineComponent, ref, render, watch, onMounted, nextTick } from 'vue'

const addSource = ()=>{  
  window.player.openSourceDialog()
}
let audioRef = ref<HTMLAudioElement>();

const audioSrc = ref('');

const playList = ref([]);





window.player.onNewAudioPath((filePath)=>{
  audioSrc.value = filePath
  nextTick(()=>{
    if(audioRef.value){
      const src = 'file://'+filePath;
      audioRef.value.src = src;
      const audioPlaylist = window.player.getStoreValue('audioPlaylist') || [];
      const newAudioPlaylist =  [...new Set([src, ...audioPlaylist])]
      window.player.setStoreValue('audioPlaylist', newAudioPlaylist);  
      playList.value = newAudioPlaylist 
      audioRef.value.play();
    }
  })

})
onMounted(() => {
  
  const audioPlaylist = window.player.getStoreValue('audioPlaylist') || [];
  playList.value = audioPlaylist 

})
</script>

