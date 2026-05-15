<template>
  <div class="route-page">
    <div class="left-panel">
      <router-link to="/academic" class="back">← 返回首页</router-link>

      <h1>路线详情查询</h1>
      <p class="desc">
        输入起点和终点，选择候选地点后，系统将在右侧地图中绘制路线并输出路径长度。
      </p>

      <div class="section">
        <h2>普通版：起终点查询</h2>

        <input
          v-model="startName"
          type="text"
          placeholder="请输入起点，例如：四川师范大学"
        />
        <button @click="searchStartCandidates">搜索起点</button>

        <div v-if="startCandidates.length > 0" class="candidate-list">
          <h3>起点候选</h3>
          <div
            v-for="poi in startCandidates"
            :key="poi.id"
            class="candidate-item"
            @click="selectStart(poi)"
          >
            <strong>{{ poi.name }}</strong>
            <p>{{ poi.pname }} {{ poi.cityname }} {{ poi.adname }} {{ poi.address }}</p>
          </div>
        </div>

        <input
          v-model="endName"
          type="text"
          placeholder="请输入终点，例如：成都东站"
        />
        <button @click="searchEndCandidates">搜索终点</button>

        <div v-if="endCandidates.length > 0" class="candidate-list">
          <h3>终点候选</h3>
          <div
            v-for="poi in endCandidates"
            :key="poi.id"
            class="candidate-item"
            @click="selectEnd(poi)"
          >
            <strong>{{ poi.name }}</strong>
            <p>{{ poi.pname }} {{ poi.cityname }} {{ poi.adname }} {{ poi.address }}</p>
          </div>
        </div>

        <button class="main-btn" @click="planRoute">规划路线</button>
      </div>

      <div v-if="routeResult" class="result">
        <h3>查询结果</h3>

        <p><strong>起点：</strong>{{ routeResult.start.name }}</p>
        <p>经度：{{ formatLng(routeResult.start.lng) }}</p>
        <p>纬度：{{ formatLat(routeResult.start.lat) }}</p>

        <hr />

        <p><strong>终点：</strong>{{ routeResult.end.name }}</p>
        <p>经度：{{ formatLng(routeResult.end.lng) }}</p>
        <p>纬度：{{ formatLat(routeResult.end.lat) }}</p>

        <hr />

        <p>
          <strong>规划路径长度：</strong>
          {{ routeDistance }} km
        </p>
      </div>

        <div class="section">
        <h2>专业版：批量路线查询</h2>

        <input type="file" accept=".csv,.txt" @change="handleFileUpload" />

        <button @click="batchSearch">批量查询</button>

        <div v-if="fileName" class="file-result">
            已选择文件：{{ fileName }}
        </div>

        <select v-model="exportType" class="export-select">
            <option value="csv">导出 CSV</option>
            <option value="json">导出 JSON</option>
        </select>

        <button @click="exportResult">导出结果</button>
        </div>

        <div v-if="batchMessage" class="notice">
        {{ batchMessage }}
        </div>

        <div v-if="batchRouteResults.length > 0" class="result export-info">
        <h3>导出结果说明</h3>
        <p>导出文件包含原始起点、原始终点、匹配起点、匹配终点、起终点经纬度、路径长度和预计耗时。</p>
        </div>

        <div v-if="batchRouteResults.length > 0" class="result batch-table">
        <h3>批量路线查询结果</h3>

        <div class="table-header">
            <span>起点</span>
            <span>终点</span>
            <span>距离</span>
            <span>耗时</span>
        </div>

        <div
            v-for="item in batchRouteResults"
            :key="item.start_input + item.end_input"
            class="table-row"
        >
            <span>{{ item.start_name }}</span>
            <span>{{ item.end_name }}</span>
            <span>{{ item.distance_km }} km</span>
            <span>{{ item.duration_min }} 分钟</span>
        </div>
    </div>
    </div>

    <div class="right-map">
      <div id="route-map"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  searchLocation,
  searchDrivingRoute
} from '../api/amap'
import Papa from 'papaparse'

const batchRouteList = ref([])
const batchRouteResults = ref([])
const batchMessage = ref('')
const exportType = ref('csv')
const startName = ref('')
const endName = ref('')

const startCandidates = ref([])
const endCandidates = ref([])

const selectedStart = ref(null)
const selectedEnd = ref(null)

const routeResult = ref(null)
const routeDistance = ref('')
const fileName = ref('')

let map = null
let startMarker = null
let endMarker = null
let routeLine = null

onMounted(() => {
  map = new AMap.Map('route-map', {
    zoom: 11,
    center: [104.066541, 30.572269]
  })
})

function formatLng(lng) {
  return `${Math.abs(lng)}°${lng >= 0 ? 'E' : 'W'}`
}

function formatLat(lat) {
  return `${Math.abs(lat)}°${lat >= 0 ? 'N' : 'S'}`
}

async function searchStartCandidates() {
  if (!startName.value) {
    alert('请输入起点')
    return
  }

  try {
    const data = await searchLocation(startName.value)

    if (data.pois && data.pois.length > 0) {
      startCandidates.value = data.pois
    } else {
      startCandidates.value = []
      alert('未找到起点')
    }
  } catch (error) {
    console.error(error)
    alert('起点查询失败')
  }
}

async function searchEndCandidates() {
  if (!endName.value) {
    alert('请输入终点')
    return
  }

  try {
    const data = await searchLocation(endName.value)

    if (data.pois && data.pois.length > 0) {
      endCandidates.value = data.pois
    } else {
      endCandidates.value = []
      alert('未找到终点')
    }
  } catch (error) {
    console.error(error)
    alert('终点查询失败')
  }
}

function selectStart(poi) {
  selectedStart.value = parsePoi(poi)
  startName.value = poi.name
  startCandidates.value = []
  showSinglePoint(selectedStart.value.lng, selectedStart.value.lat, '起点')
}

function selectEnd(poi) {
  selectedEnd.value = parsePoi(poi)
  endName.value = poi.name
  endCandidates.value = []
  showSinglePoint(selectedEnd.value.lng, selectedEnd.value.lat, '终点')
}

function parsePoi(poi) {
  const location = poi.location.split(',')

  return {
    name: poi.name,
    address: poi.address,
    lng: Number(location[0]),
    lat: Number(location[1])
  }
}

async function planRoute() {
  if (!selectedStart.value || !selectedEnd.value) {
    alert('请先分别选择起点和终点')
    return
  }

  const start = selectedStart.value
  const end = selectedEnd.value

  routeResult.value = {
    start,
    end
  }

  try {
    const origin = `${start.lng},${start.lat}`
    const destination = `${end.lng},${end.lat}`

    const routeData = await searchDrivingRoute(origin, destination)

    if (
      routeData.route &&
      routeData.route.paths &&
      routeData.route.paths.length > 0
    ) {
      const pathInfo = routeData.route.paths[0]

      routeDistance.value = (Number(pathInfo.distance) / 1000).toFixed(2)

      showRoutePoints(start.lng, start.lat, end.lng, end.lat)
      drawRouteLine(pathInfo.steps)
    } else {
      alert('未查询到可用路线')
    }
  } catch (error) {
    console.error(error)
    alert('路线规划失败')
  }
}

function showSinglePoint(lng, lat, title) {
  const tempMarker = new AMap.Marker({
    position: [lng, lat],
    title
  })

  map.add(tempMarker)
  map.setZoomAndCenter(15, [lng, lat])
}

function showRoutePoints(startLng, startLat, endLng, endLat) {
  if (startMarker) {
    map.remove(startMarker)
  }

  if (endMarker) {
    map.remove(endMarker)
  }

  startMarker = new AMap.Marker({
    position: [startLng, startLat],
    title: '起点',
    label: {
      content: '起点',
      direction: 'top'
    }
  })

  endMarker = new AMap.Marker({
    position: [endLng, endLat],
    title: '终点',
    label: {
      content: '终点',
      direction: 'top'
    }
  })

  map.add([startMarker, endMarker])
}

function drawRouteLine(steps) {
  if (routeLine) {
    map.remove(routeLine)
  }

  const path = []

  steps.forEach(step => {
    const points = step.polyline.split(';')

    points.forEach(point => {
      const [lng, lat] = point.split(',').map(Number)
      path.push([lng, lat])
    })
  })

  routeLine = new AMap.Polyline({
  path,
  strokeColor: '#ff0000',
  strokeWeight: 6,
  strokeOpacity: 0.9,
  lineJoin: 'round',
  lineCap: 'round'
  })

  map.add(routeLine)
  const startCircle = new AMap.CircleMarker({
  center: path[0],
  radius: 8,
  strokeColor: '#ffffff',
  strokeWeight: 3,
  fillColor: '#22c55e',
  fillOpacity: 1,
  zIndex: 200
})

const endCircle = new AMap.CircleMarker({
  center: path[path.length - 1],
  radius: 8,
  strokeColor: '#ffffff',
  strokeWeight: 3,
  fillColor: '#ef4444',
  fillOpacity: 1,
  zIndex: 200
})

map.add([startCircle, endCircle])
  map.setFitView([startMarker, endMarker, routeLine])
}

function handleFileUpload(event) {
  const file = event.target.files[0]

  if (!file) return

  fileName.value = file.name

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (result) => {
      batchRouteList.value = result.data
        .filter(row => row.start && row.end)
        .map(row => ({
          start: row.start,
          end: row.end
        }))
    }
  })
}

async function batchSearch() {
  if (batchRouteList.value.length === 0) {
    alert('请先上传路线文件，文件中需要包含 start 和 end 两列')
    return
  }

  batchRouteResults.value = []
  batchMessage.value = ''

  for (const item of batchRouteList.value) {
    try {
      const startData = await searchLocation(item.start)
      const endData = await searchLocation(item.end)

      if (!startData.pois || startData.pois.length === 0) {
        batchRouteResults.value.push({
          start_input: item.start,
          end_input: item.end,
          start_name: '未找到起点',
          end_name: '',
          start_lng: '',
          start_lat: '',
          end_lng: '',
          end_lat: '',
          distance_km: '',
          duration_min: ''
        })
        continue
      }

      if (!endData.pois || endData.pois.length === 0) {
        batchRouteResults.value.push({
          start_input: item.start,
          end_input: item.end,
          start_name: '',
          end_name: '未找到终点',
          start_lng: '',
          start_lat: '',
          end_lng: '',
          end_lat: '',
          distance_km: '',
          duration_min: ''
        })
        continue
      }

      const startPoi = startData.pois[0]
      const endPoi = endData.pois[0]

      const [startLng, startLat] = startPoi.location.split(',').map(Number)
      const [endLng, endLat] = endPoi.location.split(',').map(Number)

      const routeData = await searchDrivingRoute(
        `${startLng},${startLat}`,
        `${endLng},${endLat}`
      )

      let distanceKm = ''
      let durationMin = ''

      if (
        routeData.route &&
        routeData.route.paths &&
        routeData.route.paths.length > 0
      ) {
        const pathInfo = routeData.route.paths[0]
        distanceKm = (Number(pathInfo.distance) / 1000).toFixed(2)
        durationMin = Math.ceil(Number(pathInfo.duration) / 60)
      }

      batchRouteResults.value.push({
        start_input: item.start,
        end_input: item.end,
        start_name: startPoi.name,
        end_name: endPoi.name,
        start_lng: formatLng(startLng),
        start_lat: formatLat(startLat),
        end_lng: formatLng(endLng),
        end_lat: formatLat(endLat),
        distance_km: distanceKm,
        duration_min: durationMin
      })
    } catch (error) {
      batchRouteResults.value.push({
        start_input: item.start,
        end_input: item.end,
        start_name: '查询失败',
        end_name: '查询失败',
        start_lng: '',
        start_lat: '',
        end_lng: '',
        end_lat: '',
        distance_km: '',
        duration_min: ''
      })
    }
  }

  batchMessage.value = `批量路线查询完成，共处理 ${batchRouteResults.value.length} 条路线数据。`
}

function exportResult() {
  if (batchRouteResults.value.length === 0) {
    alert('暂无可导出的结果')
    return
  }

  if (exportType.value === 'csv') {
    exportCSV()
  } else {
    exportJSON()
  }

  alert(`导出成功，文件格式为 ${exportType.value.toUpperCase()}，内容包含起终点匹配信息、经纬度、路径长度和预计耗时。`)
}

function exportCSV() {
  const csv = Papa.unparse(batchRouteResults.value)
  downloadFile(csv, 'route_detail_result.csv', 'text/csv;charset=utf-8;')
}

function exportJSON() {
  const json = JSON.stringify(batchRouteResults.value, null, 2)
  downloadFile(json, 'route_detail_result.json', 'application/json;charset=utf-8;')
}

function downloadFile(content, fileName, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  URL.revokeObjectURL(url)
}

</script>

<style scoped>
.route-page {
  display: flex;
  height: 100vh;
  background-color: #f5f7fb;
}

.left-panel {
  width: 420px;
  padding: 28px;
  overflow-y: auto;
  background-color: #f5f7fb;
  border-right: 1px solid #e5e7eb;
}

.right-map {
  flex: 1;
  height: 100vh;
}

#route-map {
  width: 100%;
  height: 100%;
}

.back {
  display: inline-block;
  margin-bottom: 22px;
  color: #2563eb;
  text-decoration: none;
}

h1 {
  color: #1f2937;
  margin-bottom: 12px;
}

.desc {
  color: #666;
  margin-bottom: 24px;
  line-height: 1.6;
}

.section,
.result {
  background: white;
  padding: 22px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}

.section h2,
.result h3,
.candidate-list h3 {
  color: #2563eb;
  margin-bottom: 16px;
}

input {
  width: 100%;
  padding: 12px;
  margin-bottom: 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 15px;
}

button {
  width: 100%;
  padding: 12px 20px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 14px;
}

button:hover {
  background-color: #1d4ed8;
}

.main-btn {
  margin-top: 6px;
  background-color: #dc2626;
}

.main-btn:hover {
  background-color: #b91c1c;
}

.candidate-list {
  background: #f8fbff;
  padding: 14px;
  border-radius: 10px;
  margin-bottom: 18px;
  max-height: 220px;
  overflow-y: auto;
  border: 1px solid #dbeafe;
}

.candidate-item {
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  background-color: white;
  transition: 0.2s;
}

.candidate-item:hover {
  background-color: #eff6ff;
}

.candidate-item strong {
  color: #2563eb;
}

.candidate-item p {
  margin-top: 6px;
  color: #666;
  font-size: 13px;
  line-height: 1.4;
}

.result p {
  margin-bottom: 8px;
  color: #333;
}

hr {
  margin: 16px 0;
  border: none;
  border-top: 1px solid #e5e7eb;
}

.file-result {
  margin-top: 12px;
  color: #555;
}
.export-select {
  width: 100%;
  padding: 12px;
  margin: 14px 0;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
}

.notice {
  background-color: #ecfdf5;
  color: #047857;
  padding: 14px;
  border-radius: 10px;
  margin-bottom: 18px;
  border: 1px solid #a7f3d0;
}

.export-info {
  background-color: #f8fbff;
}

.export-info p {
  margin-bottom: 8px;
  color: #333;
  line-height: 1.5;
}

.batch-table {
  max-height: 360px;
  overflow-y: auto;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 0.8fr 0.8fr;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
}

.table-header {
  font-weight: bold;
  color: #2563eb;
}

.table-row {
  color: #333;
}
</style>