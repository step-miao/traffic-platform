<template>
  <div class="plan-page">
    <div class="left-panel">
      <router-link to="/academic" class="back">← 返回首页</router-link>

      <h1>路线规划</h1>
      <p class="desc">
        输入起点和终点的经纬度坐标，系统将调用高德路线规划接口，在右侧地图中绘制行驶路线。
      </p>

      <div class="section">
        <h2>普通版：经纬度路线规划</h2>

        <div class="coord-row">
        <input v-model="startLng" type="number" placeholder="起点经度，例如：104.066541" />
        <select v-model="startLngDir">
            <option value="E">东经 E</option>
            <option value="W">西经 W</option>
        </select>
        </div>

        <div class="coord-row">
        <input v-model="startLat" type="number" placeholder="起点纬度，例如：30.572269" />
        <select v-model="startLatDir">
            <option value="N">北纬 N</option>
            <option value="S">南纬 S</option>
        </select>
        </div>

        <div class="coord-row">
        <input v-model="endLng" type="number" placeholder="终点经度，例如：104.141000" />
        <select v-model="endLngDir">
            <option value="E">东经 E</option>
            <option value="W">西经 W</option>
        </select>
        </div>

        <div class="coord-row">
        <input v-model="endLat" type="number" placeholder="终点纬度，例如：30.631000" />
        <select v-model="endLatDir">
            <option value="N">北纬 N</option>
            <option value="S">南纬 S</option>
        </select>
        </div>

        <button @click="planRoute">规划路线</button>
      </div>

      <div v-if="planResult" class="result">
        <h3>规划结果</h3>

        <p><strong>起点经度：</strong>{{ formatLng(planResult.start.lng) }}</p>
        <p><strong>起点纬度：</strong>{{ formatLat(planResult.start.lat) }}</p>

        <hr />

        <p><strong>终点经度：</strong>{{ formatLng(planResult.end.lng) }}</p>
        <p><strong>终点纬度：</strong>{{ formatLat(planResult.end.lat) }}</p>

        <hr />

        <p><strong>路径长度：</strong>{{ planResult.distance }} km</p>
        <p><strong>预计耗时：</strong>{{ planResult.duration }} 分钟</p>
      </div>
    <div v-if="minutePoints.length > 0" class="result minute-table">
    <h3>每分钟路径点</h3>

    <div class="table-header">
        <span>时间</span>
        <span>经度</span>
        <span>纬度</span>
    </div>

    <div
        v-for="point in minutePoints"
        :key="point.minute"
        class="table-row"
    >
        <span>第 {{ point.minute }} 分钟</span>
        <span>{{ formatLng(point.lng) }}</span>
        <span>{{ formatLat(point.lat) }}</span>
    </div>
    </div>

      <div class="section">
        <h2>专业版：批量路线规划</h2>

        <div class="result format-info">
        <h3>输入文件格式说明</h3>

        <p>上传文件需为 CSV 格式，并包含以下字段：</p>

        <div class="table-header">
            <span>字段名</span>
            <span>含义</span>
        </div>

        <div class="table-row">
            <span>start_lng</span>
            <span>起点经度数值</span>
        </div>

        <div class="table-row">
            <span>start_lng_dir</span>
            <span>起点经度方向（E/W）</span>
        </div>

        <div class="table-row">
            <span>start_lat</span>
            <span>起点纬度数值</span>
        </div>

        <div class="table-row">
            <span>start_lat_dir</span>
            <span>起点纬度方向（N/S）</span>
        </div>

        <div class="table-row">
            <span>end_lng</span>
            <span>终点经度数值</span>
        </div>

        <div class="table-row">
            <span>end_lng_dir</span>
            <span>终点经度方向（E/W）</span>
        </div>

        <div class="table-row">
            <span>end_lat</span>
            <span>终点纬度数值</span>
        </div>

        <div class="table-row">
            <span>end_lat_dir</span>
            <span>终点纬度方向（N/S）</span>
        </div>
</div>

        <input type="file" @change="handleFileUpload" />

        <button @click="batchPlan">批量规划</button>

        <div class="result export-info">
        <h3>输出结果说明</h3>

        <p>导出结果包含以下字段：</p>

        <p><strong>start_longitude：</strong>起点经度（带 E/W）</p>

        <p><strong>start_latitude：</strong>起点纬度（带 N/S）</p>

        <p><strong>end_longitude：</strong>终点经度（带 E/W）</p>

        <p><strong>end_latitude：</strong>终点纬度（带 N/S）</p>

        <p><strong>distance_km：</strong>规划路径长度（公里）</p>

        <p><strong>duration_min：</strong>预计耗时（分钟）</p>

        <p><strong>minute_path：</strong>每分钟路径点序列</p>
        </div>

        <div v-if="fileName" class="file-result">
          已选择文件：{{ fileName }}
        </div>
        <select v-model="exportType" class="export-select">
          <option value="csv">导出 CSV</option>
          <option value="json">导出 JSON</option>
        </select>

        <button @click="exportResult">导出结果</button>
      </div>
    </div>

    <div class="right-map">
      <div id="plan-map"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Papa from 'papaparse'
import { searchDrivingRoute } from '../api/amap'

const minutePoints = ref([])

const startLng = ref('')
const startLat = ref('')
const endLng = ref('')
const endLat = ref('')

const startLngDir = ref('E')
const startLatDir = ref('N')
const endLngDir = ref('E')
const endLatDir = ref('N')

const planResult = ref(null)
const fileName = ref('')
const batchPlanList = ref([])
const batchPlanResults = ref([])
const batchMessage = ref('')
const exportType = ref('csv')

let map = null
let startMarker = null
let endMarker = null
let routeLine = null
let startCircle = null
let endCircle = null

onMounted(() => {
  map = new AMap.Map('plan-map', {
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

function convertCoordinate(value, direction) {
  const number = Math.abs(Number(value))

  if (direction === 'W' || direction === 'S') {
    return -number
  }

  return number
}

async function planRoute() {
  if (!startLng.value || !startLat.value || !endLng.value || !endLat.value) {
    alert('请完整输入起点和终点经纬度')
    return
  }

    const sLng = convertCoordinate(startLng.value, startLngDir.value)
    const sLat = convertCoordinate(startLat.value, startLatDir.value)
    const eLng = convertCoordinate(endLng.value, endLngDir.value)
    const eLat = convertCoordinate(endLat.value, endLatDir.value)

  if (
    isNaN(sLng) ||
    isNaN(sLat) ||
    isNaN(eLng) ||
    isNaN(eLat)
  ) {
    alert('经纬度格式不正确')
    return
  }

  try {
    const origin = `${sLng},${sLat}`
    const destination = `${eLng},${eLat}`

    const routeData = await searchDrivingRoute(origin, destination)

    if (
      routeData.route &&
      routeData.route.paths &&
      routeData.route.paths.length > 0
    ) {
      const pathInfo = routeData.route.paths[0]

      planResult.value = {
        start: {
          lng: sLng,
          lat: sLat
        },
        end: {
          lng: eLng,
          lat: eLat
        },
        distance: (Number(pathInfo.distance) / 1000).toFixed(2),
        duration: Math.ceil(Number(pathInfo.duration) / 60)
      }

      showRoutePoints(sLng, sLat, eLng, eLat)
      drawRouteLine(pathInfo.steps)
    } else {
      alert('未查询到可用路线')
    }
  } catch (error) {
    console.error(error)
    alert('路线规划失败')
  }
}

function showRoutePoints(sLng, sLat, eLng, eLat) {
  if (startMarker) map.remove(startMarker)
  if (endMarker) map.remove(endMarker)

  startMarker = new AMap.Marker({
    position: [sLng, sLat],
    title: '起点',
    label: {
      content: '起点',
      direction: 'top'
    }
  })

  endMarker = new AMap.Marker({
    position: [eLng, eLat],
    title: '终点',
    label: {
      content: '终点',
      direction: 'top'
    }
  })

  map.add([startMarker, endMarker])
}

function drawRouteLine(steps) {
  if (routeLine) map.remove(routeLine)
  if (startCircle) map.remove(startCircle)
  if (endCircle) map.remove(endCircle)

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

  startCircle = new AMap.CircleMarker({
    center: path[0],
    radius: 8,
    strokeColor: '#ffffff',
    strokeWeight: 3,
    fillColor: '#22c55e',
    fillOpacity: 1,
    zIndex: 200
  })

  endCircle = new AMap.CircleMarker({
    center: path[path.length - 1],
    radius: 8,
    strokeColor: '#ffffff',
    strokeWeight: 3,
    fillColor: '#ef4444',
    fillOpacity: 1,
    zIndex: 200
  })
  const durationMinutes = Number(planResult.value.duration)
  minutePoints.value = generateMinutePoints(path, durationMinutes)
  map.add([routeLine, startCircle, endCircle])
  map.setFitView([routeLine, startMarker, endMarker])
}



function handleFileUpload(event) {
  const file = event.target.files[0]

  if (!file) return

  fileName.value = file.name

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (result) => {
      batchPlanList.value = result.data
        .filter(row =>
          row.start_lng &&
          row.start_lng_dir &&
          row.start_lat &&
          row.start_lat_dir &&
          row.end_lng &&
          row.end_lng_dir &&
          row.end_lat &&
          row.end_lat_dir
        )
        .map(row => ({
          start_lng: row.start_lng,
          start_lng_dir: row.start_lng_dir,
          start_lat: row.start_lat,
          start_lat_dir: row.start_lat_dir,
          end_lng: row.end_lng,
          end_lng_dir: row.end_lng_dir,
          end_lat: row.end_lat,
          end_lat_dir: row.end_lat_dir
        }))
    }
  })
}

async function batchPlan() {
  if (batchPlanList.value.length === 0) {
    alert('请先上传路线规划 CSV 文件')
    return
  }

  batchPlanResults.value = []
  batchMessage.value = ''

  for (let i = 0; i < batchPlanList.value.length; i++) {
    const item = batchPlanList.value[i]

    try {
      const sLng = convertCoordinate(item.start_lng, item.start_lng_dir)
      const sLat = convertCoordinate(item.start_lat, item.start_lat_dir)
      const eLng = convertCoordinate(item.end_lng, item.end_lng_dir)
      const eLat = convertCoordinate(item.end_lat, item.end_lat_dir)

      const origin = `${sLng},${sLat}`
      const destination = `${eLng},${eLat}`

      const routeData = await searchDrivingRoute(origin, destination)

      if (
        routeData.route &&
        routeData.route.paths &&
        routeData.route.paths.length > 0
      ) {
        const pathInfo = routeData.route.paths[0]
        const path = getRoutePath(pathInfo.steps)

        const durationMin = Math.ceil(Number(pathInfo.duration) / 60)
        const minutePath = generateMinutePoints(path, durationMin)

        batchPlanResults.value.push({
          id: i + 1,
          start_longitude: formatLng(sLng),
          start_latitude: formatLat(sLat),
          end_longitude: formatLng(eLng),
          end_latitude: formatLat(eLat),
          distance_km: (Number(pathInfo.distance) / 1000).toFixed(2),
          duration_min: durationMin,
          minute_path: minutePath
        })
      } else {
        batchPlanResults.value.push({
          id: i + 1,
          start_longitude: formatLng(sLng),
          start_latitude: formatLat(sLat),
          end_longitude: formatLng(eLng),
          end_latitude: formatLat(eLat),
          distance_km: '',
          duration_min: '',
          minute_path: []
        })
      }
    } catch (error) {
      batchPlanResults.value.push({
        id: i + 1,
        start_longitude: '',
        start_latitude: '',
        end_longitude: '',
        end_latitude: '',
        distance_km: '',
        duration_min: '',
        minute_path: []
      })
    }
  }

  batchMessage.value = `批量路线规划完成，共处理 ${batchPlanResults.value.length} 条路线数据。`
  alert(`批量路线规划完成，共处理 ${batchPlanResults.value.length} 条路线数据。`)
}

function getRoutePath(steps) {
  const path = []

  steps.forEach(step => {
    const points = step.polyline.split(';')

    points.forEach(point => {
      const [lng, lat] = point.split(',').map(Number)
      path.push([lng, lat])
    })
  })

  return path
}

function generateMinutePoints(path, durationMinutes) {
  const result = []

  if (path.length < 2 || durationMinutes <= 0) {
    return result
  }

  const totalDistance = calculatePathDistance(path)

  for (let minute = 0; minute <= durationMinutes; minute++) {
    const targetDistance = totalDistance * (minute / durationMinutes)
    const point = getPointByDistance(path, targetDistance)

    result.push({
      minute,
      lng: point[0],
      lat: point[1]
    })
  }

  return result
}

function calculatePathDistance(path) {
  let total = 0

  for (let i = 0; i < path.length - 1; i++) {
    total += AMap.GeometryUtil.distance(path[i], path[i + 1])
  }

  return total
}

function getPointByDistance(path, targetDistance) {
  let currentDistance = 0

  for (let i = 0; i < path.length - 1; i++) {
    const start = path[i]
    const end = path[i + 1]

    const segmentDistance = AMap.GeometryUtil.distance(start, end)

    if (currentDistance + segmentDistance >= targetDistance) {
      const ratio = (targetDistance - currentDistance) / segmentDistance

      const lng = start[0] + (end[0] - start[0]) * ratio
      const lat = start[1] + (end[1] - start[1]) * ratio

      return [
        Number(lng.toFixed(6)),
        Number(lat.toFixed(6))
      ]
    }

    currentDistance += segmentDistance
  }

  return path[path.length - 1]
}

function exportResult() {
  if (batchPlanResults.value.length === 0) {
    alert('暂无可导出的结果')
    return
  }

  if (exportType.value === 'csv') {
    exportCSV()
  } else {
    exportJSON()
  }

  alert(`导出成功，文件格式为 ${exportType.value.toUpperCase()}，内容包含起终点经纬度、路径长度、预计耗时和每分钟路径点。`)
}

function getExportData() {
  const rows = []

  batchPlanResults.value.forEach(item => {
    item.minute_path.forEach(point => {
      rows.push({
        track_id: item.id,
        time: formatMinuteTime(point.minute),
        longitude: formatLng(point.lng),
        latitude: formatLat(point.lat),
        minute: point.minute
      })
    })
  })

  return rows
}

function formatMinuteTime(minute) {
  const hour = Math.floor(minute / 60)
  const min = minute % 60

  return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

function exportCSV() {
  const csv = Papa.unparse(getExportData())
  downloadFile(csv, 'route_plan_result.csv', 'text/csv;charset=utf-8;')
}

function exportJSON() {
  const json = JSON.stringify(batchPlanResults.value, null, 2)
  downloadFile(json, 'route_plan_result.json', 'application/json;charset=utf-8;')
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
.plan-page {
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

.coord-row {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.coord-row input {
  flex: 1;
  margin-bottom: 0;
}

.coord-row select {
  width: 100px;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background-color: white;
}

.minute-table {
  max-height: 360px;
  overflow-y: auto;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
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

#plan-map {
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
.result h3 {
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
}

button:hover {
  background-color: #1d4ed8;
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

.format-info,
.export-info {
  background-color: #f8fbff;
}

.format-info p,
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
  grid-template-columns: 1.4fr 1.4fr 0.8fr 0.8fr;
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