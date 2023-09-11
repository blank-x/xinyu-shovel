<template>
  <div class="h-screen overflow-auto flex flex-col" >
    <Header />
    <router-view v-slot="{ Component }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </transition>
    </router-view>
  </div>
</template>

<script lang="ts" setup>
import Header from '@home/components/header/index.vue'

</script>

<style lang="scss">
.app {
  height: 100%;
}
</style>
