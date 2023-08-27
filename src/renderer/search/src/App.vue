<template>
  <div class="app" @keydown.down.prevent="selectItem(1)" @keydown.up.prevent="selectItem(-1)">
    <input type="text" @input="onSearchChange" v-model="searchValue" @keydown.enter="openLocalAppByEnter" >

    <ul class="searchRes" v-if="searchResList.length>0" @keydown.enter="openLocalAppByEnter">
      <li class="search-item" @mouseenter="onHover(index)" @click="openLocalApp(item)" v-for="(item, index) in searchResList" :class="{'ishover': index=== hoverIndex}">
        <img class="img" alt="" :src="item.icon" />

        <div class="name">{{item.name}}</div>
        <div class="path">{{item.path}}</div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted,ref } from 'vue'
const { searchEverying, searchResize, openApp } = (window as unknown as SearchWindow).search;
export default defineComponent({
  setup() {
    console.log('search setup')
    onMounted(() => {
      searchResize()
    })
    return {}
  },
  data() {
    return {
      searchResList: [],
      searchValue: '',
      hoverIndex: 0,
    }
  },
  methods:{
    async onSearchChange(e){
      this.searchResList = await searchEverying(this.searchValue);
      searchResize()
    },
    onHover(idx){
      this.hoverIndex = idx
    },
    openLocalApp(item){
      openApp(item.renderPath)
    },
    openLocalAppByEnter(){
      const curItem = this.searchResList[this.hoverIndex];
      this.openLocalApp(curItem);
    },
    selectItem(increment){
      const target = this.hoverIndex + increment;
      if(target >= this.searchResList.length){
        this.hoverIndex = 0;
      } else if(target < 0 ){
        this.hoverIndex = this.searchResList.length -1;
      } else {
        this.hoverIndex = target
      }
    }
  },
})
</script>

<style lang="scss" scoped>
.app {
  -webkit-app-region: drag;
  cursor: move;
  width: 100%;
  background-color: rgba(255,255,255,.7);
  padding-bottom: 8px;
  padding-top: 8px;
  box-sizing: border-box;
}
input{
  width: calc(100% - 32px);
  margin-left: 16px;
  display: inline-block;
  font-size: 20px;
  line-height: 48px;
  outline: none;
  border: none;
  padding: 6px 20px 6px 20px;
  background-color: rgba(220, 220, 220);
  caret-color: red;
}
.searchRes{
  margin-left: 16px;
  margin-right: 16px;
  background-color: rgba(220, 220, 220);
  max-height: 420px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 3px;
    background-color: rgba(220, 220, 220);
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(79, 32, 111, 0.4);
  }
}
.search-item{
  height: 60px;
  //padding-left: 20px;
  font-size: 16px;
  cursor: default;
  display: grid;
  grid-template-columns: 60px auto;
  grid-template-rows: 24px 20px;
  align-items: center ;
  align-content: center;
  &.ishover{
    background-color: rgba(79, 32, 111, 0.4);
    color: #fff;
  }
  .img{
    width: 100%;
    height: auto;
    padding:6px;
    grid-row-start: 1;
    grid-row-end: 3;
  }
  .name{
    //padding-top: 3px;
    font-size: 20px;
    line-height: 20px;
  }
  .path{
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding-right: 30px;
    line-height: 20px;
    font-size: 14px;

  }
}

</style>
