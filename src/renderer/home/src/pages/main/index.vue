<template>
  <div>
    <!-- <C1 :model-value="da" @update:modelValue="update" />111 -->
    <el-button @click="check">获取更新</el-button>

    <!-- <div class="w-32 h-32 bg-blue-500"></div> -->
    <el-dialog v-model="dialogVisible" title="Tips" width="30%">
      <span>{{ checkUpdateing ? 'checkUpdateing' : '' }}</span>
      <span>{{ hasNewVersion ? '发现新版本'+ newVersion : '未发现新版本' }}</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>

          <el-button v-if="!hasNewVersion" :loading="checkUpdateing" type="primary" @click="dialogVisible = false">
            确定
          </el-button>
          <el-button v-if="hasNewVersion" :loading="checkUpdateing" type="primary" @click="updateDownload">
            更新
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, defineComponent, ref, render, watch } from 'vue'
import useUpdate from './updateHook';
import C1 from '../../components/C1.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: []
  }
})
const dialogVisible = ref(false)

const {
  updateCheck,
  updateDownload,
  checkUpdateing,
  newVersion,
  totalSize,
  downloadSize, 
  hasNewVersion,
} = useUpdate();

// watch(newVersion, (val)=>{
//   if(val){
//     dialogVisible.value = true;
//   }
// })

const check = ()=>{
  dialogVisible.value = true
  updateCheck()
}

</script>

