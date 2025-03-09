import L, { point, popup } from 'Leaflet'
import { getMapPointDetail } from './api'
import { EventManager } from './event-manager'
interface AreaNameConfig {
  lat: number
  lng: number
  name: string
  children: any[]
}

interface PointConfig {
  lat: number
  lng: number
  icon: string
  pointId: number
  name: string
}

export interface GuideUIItem {
  lat: number
  lng: number
  icon: string
  angle: number
}

interface Vector {
  x: number
  y: number
}

export class MapManager {
  private map: L.Map
  private areaNameLayerGroup: L.LayerGroup | undefined
  private pointLayerGroup: L.LayerGroup | undefined
  private mapAnchorList: AreaNameConfig[] = []
  private preZoom = 0
  private lastActivePointId = -1
  private pointList: PointConfig[] = []

  constructor(domId: string) {
    const bounds = L.latLngBounds(L.latLng(0, 0), L.latLng(-256, 256))

    this.map = L.map(domId, {
      zoomControl: false,
      attributionControl: false,
      maxBounds: bounds,
      center: [-102, 148],
      crs: L.CRS.Simple,
      zoom: 5,
    })

    this.preZoom = this.map.getZoom()

    L.tileLayer('images/map/{z}/{x}/{y}.png', {
      bounds: bounds,
      maxZoom: 7,
      minZoom: 4,
    }).addTo(this.map)

    this.map.on('zoom', () => {
      const preRenderFlag = this.preZoom >= 6
      const currentRenderFlag = this.map.getZoom() >= 6
      if (preRenderFlag !== currentRenderFlag) {
        this.renderAreaNames()
        this.preZoom = this.map.getZoom()
      }
    })

    this.map.on('click', this.onMapClick.bind(this))

    this.map.on('moveend', this.onMapMoveEnd.bind(this))
  }
  onMapMoveEnd() {
    this.calcOutScreenPoints()
  }

  onMapClick() {
    const lastActivePoint = document.getElementById(`mapPointItem${this.lastActivePointId}`)
    lastActivePoint?.classList.remove('active')
    this.lastActivePointId = -1
  }

  setMapAnchorList(configList: AreaNameConfig[]) {
    this.mapAnchorList = configList
  }

  renderAreaNames() {
    this.areaNameLayerGroup?.clearLayers()
    let markers: L.Marker[] = []
    if (this.map.getZoom() >= 6) {
      this.mapAnchorList.forEach((val) => {
        let childrenList: L.Marker[] = []
        childrenList = val.children.map(this.getAreaNameMakerItem)
        markers = markers.concat(childrenList)
      })
    } else {
      markers = this.mapAnchorList.map(this.getAreaNameMakerItem)
    }

    this.areaNameLayerGroup = L.layerGroup(markers)
    this.areaNameLayerGroup.addTo(this.map)
  }

  getAreaNameMakerItem(config: AreaNameConfig) {
    let { lat = 0, lng = 0, name } = config
    return L.marker(L.latLng(lat, lng), {
      icon: L.divIcon({
        className: 'map-marker-item',
        html: `<div class="area-mark-item">${name}</div>`,
      }),
    })
  }

  renderPoints(pointList: PointConfig[]) {
    this.pointList = pointList
    this.pointLayerGroup?.clearLayers()

    let pointMarkers = pointList.map((item) => {
      let { lat, lng, icon, pointId, name } = item

      const pointMarker = L.marker(L.latLng(lat, lng), {
        icon: L.divIcon({
          className: 'map-point-item',
          html: `<div class="point-item-container" id="mapPointItem${pointId}">
              <div class="point-pic" style='background-image: url(${icon})'></div>
              <div class="arrow-icon lt"></div>
              <div class="arrow-icon lb"></div>
              <div class="arrow-icon rt"></div>
              <div class="arrow-icon rb"></div>
              </div>`,
          iconSize: [37, 40],
          iconAnchor: [19, 20],
        }),
      })
      pointMarker.on('click', () => {
        if (this.lastActivePointId === pointId) return
        const lastActivePoint = document.getElementById(`mapPointItem${this.lastActivePointId}`)
        lastActivePoint?.classList.remove('active')

        const curPoint = document.getElementById(`mapPointItem${pointId}`)
        curPoint?.classList.add('active')

        this.lastActivePointId = pointId
      })

      pointMarker.bindPopup(
        L.popup({
          content: this.calcPopupContent({ info: {}, correct_user_list: [], last_update_time: '' }),
        }),
      )
      pointMarker.on('popupopen', async () => {
        const res = await getMapPointDetail(pointId)
        const popupData = { ...res.data, name: name }
        pointMarker.setPopupContent(this.calcPopupContent(popupData))
      })

      return pointMarker
    })

    this.pointLayerGroup = L.layerGroup(pointMarkers)
    this.pointLayerGroup.addTo(this.map)
    this.calcOutScreenPoints()
  }

  calcOutScreenPoints() {
    const guideUIAry: GuideUIItem[] = []
    const calcPointMap: { [key: string]: any } = {}
    const center = this.map.getCenter()
    for (let i = 0; i < this.pointList.length; i++) {
      const pointItem = this.pointList[i]
      const { name } = pointItem
      if (!calcPointMap[name]) {
        calcPointMap[name] = {}
      }
      if (calcPointMap[name].inScreen) {
        continue
      }

      const isContain = this.map.getBounds().contains(pointItem)
      if (!isContain) {
        const dist = this.map.getCenter().distanceTo(pointItem)
        if (!calcPointMap[name].pointItem) {
          calcPointMap[name] = { dist, pointItem, inScreen: false }
        } else {
          const curDist = calcPointMap[name].dist
          if (dist < curDist) {
            calcPointMap[name] = { dist, pointItem, inScreen: false }
          }
        }
      } else {
        calcPointMap[name].inScreen = true
      }
    }

    for (let key in calcPointMap) {
      const { inScreen, pointItem } = calcPointMap[key]
      if (!inScreen) {
        const { lat, lng, icon } = pointItem
        const directionVector = { x: lng - center.lng, y: lat - center.lat }
        const xVector = { x: 1, y: 0 }
        const angle = calcVectorAngle(xVector, directionVector)
        guideUIAry.push({ angle, icon, lat, lng })
      }
    }

    EventManager.emit('RenderMapGuidUI', guideUIAry)
  }

  calcPopupContent(popupData: any) {
    const { correct_user_list, info, last_update_time, name } = popupData
    const avatarElmStr = correct_user_list.map((val: any) => {
      return `<div class="avatar-item" style="background-image: url(${val.img})"></div>`
    })
    return `<div class="point-popup-container">
    <div class="popup-title">${name}</div>
    <div class="popup-pic" style="background-image: url(${info.img})"></div>
    <div class="point-name">${info.content}</div>
    <div class="contributor-container">
      <div class="contributor-label">贡献者：</div>
      <div class="avatar-container">
        ${avatarElmStr}
      </div>
    </div>
    <div class="point-time">更新时间：${last_update_time}</div>
  </div>`
  }

  flyTo(lating: L.LatLngExpression, zoom?: number) {
    this.map.flyTo(lating, zoom)
  }

  enableClickDebug() {
    this.map.on('click', (workingLayer) => {
      const cordinate = workingLayer.latlng
      console.log('cordinate', cordinate)
    })
  }
}

function calcVectorAngle(vectorA: Vector, vectorB: Vector) {
  const dotProduct = vectorA.x * vectorB.x + vectorA.y * vectorB.y
  const magnitudeA = Math.sqrt(vectorA.x * vectorA.x + vectorA.y + vectorA.y)
  const magnitudeB = Math.sqrt(vectorB.x * vectorB.x + vectorB.y + vectorB.y)
  const cosTbeta = dotProduct / (magnitudeA * magnitudeB)
  const theta = Math.acos(cosTbeta)

  const crossProduct = vectorA.x * vectorB.y - vectorA.y * vectorB.x
  const direction = crossProduct > 0 ? 1 : -1
  return direction * theta
}
