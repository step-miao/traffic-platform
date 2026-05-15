<template>
  <div class="travel-city">
    <div class="top-bar">
      <div>
        <h1>城市旅游</h1>
        <p>输入城市，查看热门景点、地图分布与路线推荐。</p>
      </div>

      <button @click="goBack">返回旅游首页</button>
    </div>

    <div class="content">
      <div class="left-panel">
        <h2>城市景点查询</h2>

        <input
          v-model="cityName"
          placeholder="请输入城市，例如：成都"
        />

        <button class="main-btn" @click="searchCity">
          查询城市景点
        </button>

        <div class="spot-list">
          <div
            v-for="spot in spots"
            :key="spot.name"
            :class="[
              'spot-item',
              isSpotSelected(spot) ? 'spot-selected' : ''
            ]"
            @click="handleSpotClick(spot)"
          >
            <span>📍</span>
            <span class="spot-name">{{ spot.name }}</span>
          </div>
        </div>
      </div>

      <div class="map-panel">
        <h2>景点地图标记区</h2>

        <div class="map-wrap">
          <div v-if="mapLoading" class="map-loading">
            <div class="map-cartoon">🗺️</div>
            <div>地图正在加载中...</div>
            <p>请稍等，旅行地图马上出现</p>
          </div>

          <div id="amap-container" class="fake-map"></div>
        </div>
      </div>
    </div>

    <div v-if="selectedSpot" class="spot-detail">
      <img
        v-if="selectedSpot.image"
        :src="selectedSpot.image"
        :alt="selectedSpot.name"
        class="spot-photo"
      />

      <div v-else class="no-photo">
        暂无景点图片
      </div>

      <div class="spot-info">
        <h2>{{ selectedSpot.name }}</h2>

        <p class="feature-text">
          {{ selectedSpot.desc }}
        </p>

        <p>景点类型：{{ selectedSpot.type }}</p>
        <p>地址：{{ selectedSpot.address }}</p>
      </div>
    </div>
    <div class="route-box">
      <h2>多景点路线规划</h2>
    <button class="main-btn" @click="toggleRouteMode">
      {{ routeSelectMode ? '结束选择景点' : '开始选择景点' }}
    </button>
      <div class="selected-route-list">

        <div
          v-for="spot in selectedRouteSpots"
          :key="spot.name"
          class="route-tag"
        >
          {{ spot.name }}
        </div>

      </div>

      <button class="main-btn" @click="planRoute">
        生成路线方案
      </button>

      <div v-if="routeResult" class="route-result-card">
        {{ routeResult }}
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AMapLoader from '@amap/amap-jsapi-loader'

const router = useRouter()

const cityName = ref('')
const routeInput = ref('')
const routeResult = ref('')

const spots = ref([])
const selectedSpot = ref(null)
const selectedRouteSpots = ref([])
const routeSelectMode = ref(false)
const mapLoading = ref(true)

let map = null
let AMap = null
let markers = []
let driving = null
function goBack() {
  router.push('/travel')
}

async function initMap() {
  if (map) return

  window._AMapSecurityConfig = {
    securityJsCode: 'b9f72ffa6d6a2e1dfba0a35de1edc125'
  }

  if (window.AMap) {
    AMap = window.AMap
  } else {
    AMap = await AMapLoader.load({
      key: 'f76f4d91a765947f68632614ef2aa6ac',
      version: '2.0',
      plugins: [
        'AMap.PlaceSearch',
        'AMap.Driving'
      ]
    })
  }

  map = new AMap.Map('amap-container', {
    zoom: 11,
    center: [104.0668, 30.5728]
  })

  map.on('complete', () => {
    mapLoading.value = false
  })
}

async function searchCity() {
  if (!cityName.value.trim()) {
    alert('请输入城市')
    return
  }

  await initMap()
  await new Promise(resolve => {
  AMap.plugin('AMap.PlaceSearch', resolve)
  })
  const placeSearch = new AMap.PlaceSearch({
    city: cityName.value,
    citylimit: true,
    pageSize: 20,
    pageIndex: 1,
    extensions: 'all'
  })

  placeSearch.search('风景名胜', (status, result) => {
    console.log('高德景点查询结果：', status, result)

    if (
      status === 'complete' &&
      result.poiList &&
      result.poiList.pois &&
      result.poiList.pois.length > 0
    ) {
    spots.value = result.poiList.pois
      .map(item => {
        return {
          name: item.name,
          location: item.location,
          address: item.address || '暂无地址',
          type: item.type || '旅游景点',

          // 评分
          rating: Number(item.biz_ext?.rating || 0),

          image:
            item.photos && item.photos.length > 0
              ? item.photos[0].url
              : '',

          desc:
            item.name +
            '是' +
            cityName.value +
            '热门旅游景点之一。'
        }
      })
      .sort((a, b) => b.rating - a.rating)

      renderMarkers()
    } else {
      spots.value = []
      alert('没有查询到该城市的景点数据')
    }
  })
}
function handleSpotClick(spot) {
  if (routeSelectMode.value) {
    addToRoute(spot)
  } else {
    selectSpot(spot)
  }
}
function addToRoute(spot) {
  const exists = selectedRouteSpots.value.find(
    item => item.name === spot.name
  )

  if (exists) return

  selectedRouteSpots.value.push(spot)
}
function isSpotSelected(spot) {
  return selectedRouteSpots.value.some(
    item => item.name === spot.name
  )
}
function renderMarkers() {
  if (!map) return

  map.clearMap()

  markers = []

  spots.value.forEach(spot => {
    if (!spot.location) return

    const marker = new AMap.Marker({
      position: [
        spot.location.lng,
        spot.location.lat
      ],
      title: spot.name,
      map
    })

    marker.on('click', () => {
      selectSpot(spot)
    })

    markers.push(marker)
  })

  if (markers.length > 0) {
    map.setFitView(markers)
  }
}

function selectSpot(spot) {
  selectedSpot.value = spot

  if (map && spot.location) {
    map.setZoomAndCenter(15, [
      spot.location.lng,
      spot.location.lat
    ])
  }
}

function toggleRouteMode() {
  routeSelectMode.value = !routeSelectMode.value

  if (!routeSelectMode.value) {
    selectedRouteSpots.value = []
  }
}
async function planRoute() {
  if (selectedRouteSpots.value.length < 2) {
    routeResult.value = '请至少选择两个景点后再生成路线。'
    return
  }

  routeResult.value = '正在生成路线，请稍等...'

  await drawRoute(selectedRouteSpots.value)
}
async function drawRoute(routeSpots) {
  if (!AMap || !map) return

  await new Promise(resolve => {
    AMap.plugin('AMap.Driving', resolve)
  })

  if (!driving) {
    driving = new AMap.Driving({
      map: map
    })
  }

  driving.clear()

  const start = [
    routeSpots[0].location.lng,
    routeSpots[0].location.lat
  ]

  const end = [
    routeSpots[routeSpots.length - 1].location.lng,
    routeSpots[routeSpots.length - 1].location.lat
  ]

  const waypoints = routeSpots
    .slice(1, routeSpots.length - 1)
    .map(item => {
      return new AMap.LngLat(
        item.location.lng,
        item.location.lat
      )
    })

  driving.search(
    start,
    end,
    {
      waypoints: waypoints
    },
    (status, result) => {
      if (
        status === 'complete' &&
        result.routes &&
        result.routes.length > 0
      ) {
        const route = result.routes[0]

        const distance = (route.distance / 1000).toFixed(1)
        const time = Math.ceil(route.time / 60)

        const routeText = routeSpots
          .map(item => item.name)
          .join(' → ')

        routeResult.value =
          '推荐路线：' +
          routeText +
          '。总距离约 ' +
          distance +
          ' km，预计驾车时间约 ' +
          time +
          ' 分钟。'
      } else {
        routeResult.value = '路线规划失败，请检查景点名称或减少途经点数量。'
      }
    }
  )
}
</script>
.spot-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

  .spot-detail {
    margin-top: 30px;
    display: flex;
    gap: 28px;
    align-items: flex-start;
    background: rgba(255,255,255,0.92);
    border-radius: 30px;
    padding: 28px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  }

.spot-photo {
  width: 320px;
  height: 220px;
  object-fit: cover;
  border-radius: 22px;
  flex-shrink: 0;
}

.no-photo {
  height: 190px;
  border-radius: 22px;
  background: linear-gradient(135deg, #bfdbfe, #fde68a);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #374151;
  font-weight: 700;
}

.feature-text {
  line-height: 1.8;
  color: #374151;
  margin-bottom: 12px;
}

<style scoped>
.travel-city {
  min-height: 100vh;
  padding: 50px;
  background: linear-gradient(180deg, #eef7ff 0%, #fff6eb 100%);
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 36px;
}

.top-bar h1 {
  font-size: 48px;
  color: #2563eb;
}

.top-bar p {
  margin-top: 10px;
  color: #5b6475;
  font-size: 18px;
}

.top-bar button,
.main-btn {
  padding: 14px 28px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #56ccf2, #2f80ed);
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.content {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 28px;
}

.left-panel,
.map-panel,
.route-box {
  background: rgba(255,255,255,0.9);
  border-radius: 28px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}

input,
textarea {
  width: 100%;
  padding: 16px 18px;
  border: none;
  border-radius: 18px;
  background: #f7fbff;
  margin-bottom: 16px;
  font-size: 15px;
}

textarea {
  min-height: 100px;
}

.spot-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 18px;
}

.spot-item {
  padding: 12px;
  border-radius: 16px;
  background: #eef6ff;
  font-size: 14px;
  font-weight: 600;
}

.fake-map {
  width: 100%;
  height: calc(100vh - 220px);
  min-height: 700px;

  border-radius: 24px;
  overflow: hidden;

  background: linear-gradient(135deg, #dff6ff, #fff2d9);

  display: flex;
  align-items: center;
  justify-content: center;

  color: #2563eb;
  font-weight: 700;
}

.route-box {
  margin-top: 28px;
}

.route-result-card {
  margin-top: 20px;
  padding: 18px;
  border-radius: 18px;
  background: #eef7ff;
  color: #2563eb;
  font-weight: 700;
}
.map-panel {
  display: flex;
  flex-direction: column;
}
.map-wrap {
  position: relative;

  flex: 1;

  height: 100%;
}

.map-loading {
  position: absolute;
  inset: 0;
  z-index: 10;
  border-radius: 24px;
  background: linear-gradient(135deg, #dff6ff, #fff2d9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #2563eb;
  font-size: 20px;
  font-weight: 800;
}

.map-loading p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
}

.map-cartoon {
  font-size: 54px;
  animation: mapFloat 1.6s ease-in-out infinite;
}
.spot-info {
  flex: 1;

  display: flex;

  flex-direction: column;

  justify-content: flex-start;
}

.spot-info h2 {
  font-size: 36px;

  margin-bottom: 18px;

  color: #1f2937;
}

.feature-text {
  font-size: 17px;

  line-height: 1.9;

  color: #4b5563;

  margin-bottom: 18px;
}

.spot-info p {
  margin-bottom: 10px;

  font-size: 16px;

  color: #374151;
}
.spot-info {
  flex: 1;
}

.spot-info h2 {
  font-size: 34px;
  margin-bottom: 16px;
  color: #1f2937;
}

.spot-info p {
  margin-bottom: 10px;
  font-size: 16px;
  color: #374151;
}

.feature-text {
  line-height: 1.9;
  color: #4b5563;
}
@keyframes mapFloat {
  0% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-8px);
  }

  100% {
    transform: translateY(0);
  }
}
.spot-detail {
  margin-top: 30px !important;
  display: flex !important;
  flex-direction: row !important;
  gap: 28px !important;
  align-items: flex-start !important;
  background: rgba(255,255,255,0.92) !important;
  border-radius: 30px !important;
  padding: 28px !important;
}

.spot-detail > .spot-photo {
  width: 320px !important;
  height: 220px !important;
  object-fit: cover !important;
  border-radius: 22px !important;
  flex-shrink: 0 !important;
}

.spot-detail > .spot-info {
  flex: 1 !important;
}

.spot-detail > .spot-info h2 {
  font-size: 34px !important;
  margin-bottom: 16px !important;
}

.spot-detail > .spot-info p {
  font-size: 16px !important;
  line-height: 1.9 !important;
  margin-bottom: 10px !important;
}
.selected-route-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 20px 0;
}

.route-tag {
  padding: 10px 18px;
  border-radius: 999px;
  background: linear-gradient(135deg, #56ccf2, #2f80ed);
  color: white;
  font-weight: 600;
}
.spot-selected {
  background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
  color: white !important;
  transform: scale(1.03);
  box-shadow: 0 8px 18px rgba(37,99,235,0.35);
}
</style>