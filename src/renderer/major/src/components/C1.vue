<script setup lang="ts">

import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: []
  }
})

</script>

<template>
  <div>
    <span>
      <input :value="modelValue[0]" @input="$emit('update:modelValue', [$event.target.value])" />
    </span>
  </div>
</template>

<style scoped lang="scss">

</style>
