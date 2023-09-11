<template>
  <div class="w-32 h-32 shadow-[0_0_50px_-12px_rgba(0,0,0,0.3)] m-10 text-center " @click="clickHandler">
    card
  </div>
</template>

<script type="ts" setup>
import { defineProps, defineEmits, defineComponent, ref, render, watch } from 'vue'

const emit = defineEmits({
  click(data) {
    return typeof data === 'object'
  }
})

const clickHandler = () => {
  emit('click')
}
</script>
