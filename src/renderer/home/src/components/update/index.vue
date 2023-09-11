<template>
  <el-dialog v-model="dialogVisible" title="Tips" width="30%" :close-on-click-modal="false">
    <!-- <div v-if="checkUpdateing">检查更新中...</div> -->
    <div>{{ hasNewVersion ? '发现新版本' + newVersion : '未发现新版本' }}</div>
    <el-progress v-if="downloadSize > 0" :percentage="Math.floor(downloadSize / totalSize * 100)" />

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onClose">取消</el-button>

        <el-button v-if="!hasNewVersion" :loading="checkUpdateing" type="primary" @click="dialogVisible = false">
          确定
        </el-button>
        <el-button v-if="hasNewVersion" :loading="checkUpdateing" type="primary" @click="updateDownload">
          更新
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, defineComponent, ref, render, watch } from 'vue'
import useUpdate from './updateHook';
const dialogVisible = ref(false)

const {
  updateCheck,
  updateDownload,
  checkUpdateing,
  newVersion,
  totalSize,
  downloadSize,
  hasNewVersion,
  cancelUpdateDownload
} = useUpdate();

watch(checkUpdateing, (val) => {
  if (!val) {
    dialogVisible.value = true;
  }
})

const onClose = () => {
  cancelUpdateDownload()
  dialogVisible.value = false
}
</script>