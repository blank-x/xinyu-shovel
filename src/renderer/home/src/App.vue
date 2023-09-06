<template>
  <Header />
  <router-view v-slot="{ Component }">
    <transition name="fade-transform" mode="out-in">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script lang="ts" setup>
import Header from '@home/src/components/header/index.vue'

</script>

<style lang="scss">
.app {
  height: 100%;
}
</style>
