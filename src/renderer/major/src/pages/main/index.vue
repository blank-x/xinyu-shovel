<template>
  <div >
    <C1 :model-value="da" @update:modelValue="update" />111
    <el-button @click="getAllUpdate">获取总量更新</el-button>
    <el-button @click="getRenderUpdate">获取热更新</el-button>
    <pre>{{updateString}}</pre>
    <div class="w-32 h-32 bg-blue-500"></div>
  </div>
</template>

<script setup lang="ts">
import {defineProps, defineEmits, defineComponent, ref} from 'vue'
const { onUpdate, triggerRenderUpdate, triggerAllUpdate } = (window as unknown as MainWindow).electron;
import C1 from '../../components/C1.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: []
  }
})

const updateString = ref('')


onUpdate(function (ev, msg) {
  console.log(msg)
  updateString.value += msg
  updateString.value += '\n'
})

const da = ref([1,2,3])

const update = (v) => {
  console.log(v)
}
const getRenderUpdate = () => {
  triggerRenderUpdate()
}

const getAllUpdate = () => {
  updateString.value = ''
  triggerAllUpdate()
}
</script>

