<template>
  <div class="w-auto flex-1" style="background-color: #F8FAFC;">
    <!-- <C1 :model-value="da" @update:modelValue="update" />111 -->
    <!-- <div class="w-32 h-32 bg-blue-500"></div> -->
    <Update />
    <Card @click="clickHandler" />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, defineComponent, ref, render, watch } from 'vue'
import Update from '@home/components/update/index.vue';
import Card from '@home/components/card/index.vue';
import C1 from '../../components/C1.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: []
  }
})

const clickHandler = () => {
  console.log('click');
  window.homeExpose.openWindow('player');

}



</script>

