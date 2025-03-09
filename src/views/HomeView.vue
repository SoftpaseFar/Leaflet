<script setup lang="ts">
import { MapManager } from '@/js/map-manager'
import FilterHeader from '@/components/FilterHeader.vue'
import LocationBtn from '@/components/LocationBtn.vue'
import SelectArea from '@/components/SelectArea.vue'
import FilterMain from '@/components/FilterMain.vue'
import { onMounted } from 'vue'
import { getMapAnchorList } from '@/js/api'
import { useHomeStore } from '@/stores/home'
import { globalDataInst } from '@/js/global-data'
import GuideMarketUI from '@/components/GuideMarketUI.vue'

const store = useHomeStore()
const { setMapAnchorList } = store

onMounted(() => {
  init()
})

async function initMapAnchorList() {
  let res = await getMapAnchorList()
  setMapAnchorList(res.data)
}

async function init() {
  await initMapAnchorList()
  globalDataInst.mapManger = new MapManager('map')
  globalDataInst.mapManger.setMapAnchorList(store.mapAnchorList)
  globalDataInst.mapManger.renderAreaNames()
}
</script>

<template>
  <div class="container">
    <div class="map-layer" id="map"></div>
    <div class="ui-layer">
      <div class="filter-container">
        <div class="filter-content">
          <div class="close-btn">
            <div class="close-icon"></div>
          </div>
          <LocationBtn />
          <SelectArea />
          <FilterHeader />
          <div class="search-container">
            <div class="search-icon"></div>
            <div class="search-tip">搜索</div>
          </div>
          <FilterMain />
        </div>
      </div>
      <GuideMarketUI />
    </div>
  </div>
</template>

<style lang="less" scoped>
.container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: red;
  .map-layer {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
  .ui-layer {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    z-index: 2;
    .filter-container {
      position: absolute;
      left: 0;
      top: 0;
      width: 415px;
      height: 100%;
      padding: 20px;
      z-index: 3;
      .filter-content {
        display: flex;
        flex-direction: column;
        background-color: #3b4354;
        width: 100%;
        height: 100%;
        border-radius: 12px;
        .close-btn {
          position: absolute;
          top: 32px;
          right: -44px;
          width: 64px;
          height: 40px;
          background-image: url('../assets/images/ui/close-bg.png');
          background-size: cover;
          display: flex;
          align-items: center;
          box-sizing: border-box;
          padding-left: 18px;
          .close-icon {
            width: 24px;
            height: 24px;
            background-image: url('../assets/images/ui/close-icon.png');
            background-size: cover;
          }
        }
        .search-container {
          width: 355px;
          height: 32px;
          display: flex;
          align-items: center;
          background-color: #323947;
          border-radius: 22px;
          box-sizing: border-box;
          padding-left: 10px;
          margin: 10px auto;
          font-size: 12px;
          color: #9b9c9f;
          .search-icon {
            width: 16px;
            height: 16px;
            background-image: url('../assets/images/ui/search-icon.png');
            background-size: cover;
            margin-right: 5px;
          }
        }
      }
    }
  }
}
</style>
