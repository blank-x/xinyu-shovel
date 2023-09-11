<template>
  <div class="flex-col flex h-screen ">
    <Header />
    <Main></Main>
  </div>

</template>

<script lang="ts" setup>
import Main from './modules/main/index.vue';
import Header from './components/header/index.vue';
</script>

<style lang="scss">
.app {
  height: 100%;
}
</style>
