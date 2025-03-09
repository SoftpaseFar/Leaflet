<script setup lang="ts">
import { useHomeStore } from '@/stores/home'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const expanded = ref(false)
const store = useHomeStore()
const { selectedFilterItem } = storeToRefs(store)

function onSelectedClick() {
  expanded.value = !expanded.value
}

function onSelectedItemClick(item: any) {
  Reflect.set(item, 'active', false)
}
</script>

<template>
  <div class="selected-area" :class="{ expanded }" v-if="selectedFilterItem.length">
    <div class="selected-count" v-if="!expanded">{{ selectedFilterItem.length }}</div>
    <div class="selected-icon" v-if="!expanded" @click="onSelectedClick"></div>
    <div class="list-container" v-else>
      <div class="up-container">
        <div class="up-icon" v-if="expanded" @click="onSelectedClick"></div>
      </div>
      <div
        class="selected-item"
        v-for="item in selectedFilterItem"
        :key="item.id"
        @click="onSelectedItemClick(item)"
      >
        <div class="item-container">
          <div
            class="item-icon"
            :style="{
              backgroundImage: `url(${item.icon})`,
            }"
          ></div>
        </div>
        <div class="icon-delete"></div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.selected-area {
  position: absolute;
  top: 136px;
  right: -30px;
  width: 40px;
  height: 40px;
  background-color: rgba(50, 57, 71, 0.8);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

  .selected-icon {
    width: 24px;
    height: 24px;
    background-image: url('../assets/images/ui/cart-icon.png');
    background-size: cover;
  }
  .selected-count {
    position: absolute;
    top: -4px;
    right: -4px;
    text-align: center;
    color: #fff;
    font-size: 11px;
    background-color: #ff5e41;
    height: 12px;
    line-height: 12px;
    border-radius: 6px;
    padding: 0 3px;
  }
  &.expanded {
    height: fit-content;
    padding: 12px 0;
  }
  .list-container {
    .up-container {
      margin-bottom: 8px;
      display: flex;
      justify-content: center;
      .up-icon {
        width: 12px;
        height: 12px;
        background-image: url('../assets/images/ui/arrow-top.png');
        background-size: cover;
      }
    }
    .selected-item {
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      position: relative;
      &:hover {
        .item-container {
          border-color: #d3bc8e;
        }
        .icon-delete {
          display: block;
        }
      }
      .item-container {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: #3b4252;
        border: 1px solid hsla(0, 0%, 100%, 0.16);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        .item-icon {
          width: 100%;
          height: 100%;
          background-image: url('../assets/images/ui/location-icon-n.png');
          background-size: cover;
        }
      }
      .icon-delete {
        display: none;
        position: absolute;
        top: 0;
        right: 2px;
        width: 12px;
        height: 12px;
        background-image: url('../assets/images/ui/delete-icon.svg');
        background-repeat: no-repeat;
        background-position: 50%;
        background-size: 100%;
      }
    }
  }
}
</style>
