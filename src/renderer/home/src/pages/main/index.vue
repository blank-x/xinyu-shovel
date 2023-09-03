<template>
  <div >
    <C1 :model-value="da" @update:modelValue="update" />111
    <el-button @click="getUpdate">获取更新</el-button>
    <div class="w-32 h-32 bg-blue-500"></div>
    <a href="https://github.com/blank-x/xinyu-shovel/releases/download/0.1.0/xinyu-shovel-1.0.4.dmg">xinyu-shovel-1.0.4.dmg</a>
  </div>
</template>

<script setup lang="ts">
import {defineProps, defineEmits, defineComponent, ref, render} from 'vue'

import { triggerUpdate, onUpdate } from 'constants/ipc';


import C1 from '../../components/C1.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: []
  }
})

const updateString = ref('')


window.homeExpose[onUpdate](function (ev, msg) {
  console.log(msg)
  updateString.value += msg
  updateString.value += '\n'
})

const da = ref([1,2,3])

const update = (v) => {
  console.log(v)
}
const getUpdate = async () => {
  window.homeExpose[triggerUpdate]();  
}

</script>

