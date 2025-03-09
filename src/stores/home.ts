import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { globalDataInst } from '@/js/global-data'

export const useHomeStore = defineStore('home', () => {
  const filterTree = ref<any[]>([])
  const selectedFilterItem = ref<any[]>([])
  const mapAnchorList = ref<any[]>([])

  watch(
    filterTree,
    () => {
      calcSelectedFilterItem()
    },
    { deep: true },
  )

  function setFilterTree(data: any[]) {
    filterTree.value = data
  }

  function setMapAnchorList(data: any[]) {
    mapAnchorList.value = data
  }

  function calcSelectedFilterItem() {
    let res: any[] = []
    let pointList: any[] = []
    for (let i = 0; i < filterTree.value.length; i++) {
      const item = filterTree.value[i]
      const activeItem = item.children.filter((child: any) => child.active)

      activeItem.forEach((element: any) => {
        const points: any = element.children.map((val: any) => {
          return { ...val, icon: element.icon, name: element.name }
        })
        pointList = pointList.concat(points)
      })

      res = res.concat(activeItem)
    }
    if (globalDataInst.mapManger) {
      globalDataInst.mapManger.renderPoints(pointList)
    }
    selectedFilterItem.value = res
    console.log(selectedFilterItem.value)
  }

  return { filterTree, setFilterTree, selectedFilterItem, setMapAnchorList, mapAnchorList }
})
