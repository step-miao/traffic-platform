<template>
  <div class="recover-page">
    <div class="left-panel">
      <router-link to="/academic" class="back">← 返回首页</router-link>

      <h1>路径恢复</h1>
      <p class="desc">
        输入出发时间、终止时间、起点与终点经纬度，系统将在总时间约束下加入速度波动，恢复每一分钟的位置。
      </p>

      <div class="section">
        <h2>普通版：路径恢复</h2>

        <input v-model="startTime" type="time" />
        <input v-model="endTime" type="time" />

        <div class="coord-row">
          <input v-model="startLng" type="number" placeholder="起点经度" />
          <select v-model="startLngDir">
            <option value="E">东经 E</option>
            <option value="W">西经 W</option>
          </select>
        </div>

        <div class="coord-row">
          <input v-model="startLat" type="number" placeholder="起点纬度" />
          <select v-model="startLatDir">
            <option value="N">北纬 N</option>
            <option value="S">南纬 S</option>
          </select>
        </div>

        <div class="coord-row">
          <input v-model="endLng" type="number" placeholder="终点经度" />
          <select v-model="endLngDir">
            <option value="E">东经 E</option>
            <option value="W">西经 W</option>
          </select>
        </div>

        <div class="coord-row">
          <input v-model="endLat" type="number" placeholder="终点纬度" />
          <select v-model="endLatDir">
            <option value="N">北纬 N</option>
            <option value="S">南纬 S</option>
          </select>
        </div>

        <label class="label">速度波动强度：{{ speedFluctuation }}</label>
        <input v-model="speedFluctuation" type="range" min="0" max="1" step="0.1" />

        <button @click="recoverPath">恢复路径</button>
      </div>

      <div v-if="recoverResult" class="result">
        <h3>恢复结果</h3>
        <p><strong>总时间：</strong>{{ recoverResult.totalMinutes }} 分钟</p>
        <p><strong>路径总长度：</strong>{{ recoverResult.distance }} km</p>
        <p><strong>平均速度：</strong>{{ recoverResult.avgSpeed }} km/h</p>
        <p><strong>fluctuation：</strong>速度波动强度，建议 0 到 1</p>
      </div>

      <div v-if="minutePoints.length > 0" class="result minute-table">
        <h3>每分钟路径点</h3>

        <div class="table-header">
            <span>时间</span>
            <span>经度</span>
            <span>纬度</span>
            <span>速度</span>
        </div>

        <div
          v-for="point in minutePoints"
          :key="point.time"
          class="table-row"
        >
          <span>{{ point.time }}</span>
          <span>{{ formatLng(point.lng) }}</span>
          <span>{{ formatLat(point.lat) }}</span>
          <span>{{ point.speed }} km/h</span>
        </div>
      </div>


      <div class="section">
      <h2>专业版：批量路径恢复</h2>

      <div class="result format-info">
        <h3>输入文件格式说明</h3>
        <p>上传 CSV 文件需包含以下字段：</p>
        <p><strong>track_id：</strong>轨迹编号</p>
        <p><strong>start_time：</strong>出发时间，例如 08:00</p>
        <p><strong>end_time：</strong>终止时间，例如 08:30</p>
        <p><strong>start_lng / start_lng_dir：</strong>起点经度数值与方向 E/W</p>
        <p><strong>start_lat / start_lat_dir：</strong>起点纬度数值与方向 N/S</p>
        <p><strong>end_lng / end_lng_dir：</strong>终点经度数值与方向 E/W</p>
        <p><strong>end_lat / end_lat_dir：</strong>终点纬度数值与方向 N/S</p>
        <p><strong>fluctuation：</strong>速度波动强度，建议 0 到 1</p>
      </div>

      <input type="file" accept=".csv" @change="handleFileUpload" />

      <button @click="batchRecover">批量恢复</button>

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

    <div v-if="batchRecoverResults.length > 0" class="result export-info">
      <h3>输出结果说明</h3>
      <p>导出结果以轨迹点形式展开，每一行表示某条轨迹在某一分钟的位置。</p>
      <p><strong>track_id：</strong>轨迹编号，同一条轨迹编号相同</p>
      <p><strong>time：</strong>真实时间，例如 08:11</p>
      <p><strong>longitude：</strong>经度，带 E/W</p>
      <p><strong>latitude：</strong>纬度，带 N/S</p>
      <p><strong>minute：</strong>从出发开始计算的第几分钟</p>
      <p><strong>speed_kmh：</strong>该分钟对应速度，单位 km/h</p>
    </div>

    <div v-if="batchRecoverResults.length > 0" class="result batch-table">
      <h3>批量路径恢复结果</h3>

      <div class="table-header">
        <span>轨迹编号</span>
        <span>时间</span>
        <span>经度</span>
        <span>纬度</span>
        <span>速度</span>
      </div>

      <div
        v-for="item in batchRecoverResults.slice(0, 100)"
        :key="item.track_id + item.time"
        class="table-row"
      >
        <span>{{ item.track_id }}</span>
        <span>{{ item.time }}</span>
        <span>{{ item.longitude }}</span>
        <span>{{ item.latitude }}</span>
        <span>{{ item.speed_kmh }} km/h</span>
      </div>

      <p class="table-tip">
        页面仅预览前 100 条结果，完整数据请通过导出文件查看。
      </p>

      <p>
        fluctuation 越大，车辆速度波动越明显；
        0 表示接近匀速，
        1 表示速度变化非常剧烈。
      </p>
    </div>
      </div>
    </div>

    <div class="right-map">
      <div id="recover-map"></div>
    </div>
     </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Papa from 'papaparse'
import { searchDrivingRoute } from '../api/amap'

const startTime = ref('')
const endTime = ref('')

const batchRecoverList = ref([])
const batchRecoverResults = ref([])
const batchMessage = ref('')
const exportType = ref('csv')
const startLng = ref('')
const startLat = ref('')
const endLng = ref('')
const endLat = ref('')

const startLngDir = ref('E')
const startLatDir = ref('N')
const endLngDir = ref('E')
const endLatDir = ref('N')

const speedFluctuation = ref(0.4)

const recoverResult = ref(null)
const minutePoints = ref([])
const fileName = ref('')

let map = null
let routeLine = null
let startMarker = null
let endMarker = null
let startCircle = null
let endCircle = null

onMounted(() => {
  map = new AMap.Map('recover-map', {
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

function getMinuteDiff(start, end) {
  const [startHour, startMinute] = start.split(':').map(Number)
  const [endHour, endMinute] = end.split(':').map(Number)

  let startTotal = startHour * 60 + startMinute
  let endTotal = endHour * 60 + endMinute

  if (endTotal <= startTotal) {
    endTotal += 24 * 60
  }

  return endTotal - startTotal
}

function addMinutesToTime(timeString, minutesToAdd) {
  const [hour, minute] = timeString.split(':').map(Number)

  const totalMinutes = hour * 60 + minute + minutesToAdd

  const finalHour = Math.floor((totalMinutes % (24 * 60)) / 60)
  const finalMinute = totalMinutes % 60

  return `${String(finalHour).padStart(2, '0')}:${String(finalMinute).padStart(2, '0')}`
}

async function recoverPath() {
  if (
    !startTime.value ||
    !endTime.value ||
    !startLng.value ||
    !startLat.value ||
    !endLng.value ||
    !endLat.value
  ) {
    alert('请完整填写时间和经纬度')
    return
  }

  const totalMinutes = getMinuteDiff(startTime.value, endTime.value)

  if (totalMinutes <= 0) {
    alert('终止时间必须晚于出发时间')
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
      !routeData.route ||
      !routeData.route.paths ||
      routeData.route.paths.length === 0
    ) {
      alert('未查询到真实道路路线')
      return
    }

    const pathInfo = routeData.route.paths[0]
    const realRoadPath = getRoutePath(pathInfo.steps)

    const points = generateFluctuatedPathByRoute(
      realRoadPath,
      totalMinutes,
      Number(speedFluctuation.value)
    )

    minutePoints.value = points.map((point, index) => {
    let speed = 0

    if (index > 0) {
        const distance = AMap.GeometryUtil.distance(points[index - 1], point) / 1000
        speed = distance * 60
    }

    return {
        time: addMinutesToTime(startTime.value, index),
        lng: point[0],
        lat: point[1],
        speed: speed.toFixed(2)
    }
    })

    const distance = Number(pathInfo.distance) / 1000
    const avgSpeed = distance / (totalMinutes / 60)

    recoverResult.value = {
      totalMinutes,
      distance: distance.toFixed(2),
      avgSpeed: avgSpeed.toFixed(2)
    }

    drawRecoverPath(points)
  } catch (error) {
    console.error(error)
    alert('路径恢复失败')
  }
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

function generateFluctuatedPathByRoute(path, totalMinutes, fluctuation) {
  const totalDistance = calculatePathDistance(path)

  const weights = []

  for (let i = 0; i < totalMinutes; i++) {
    const randomFactor = 1 + (Math.random() * 2 - 1) * fluctuation
    weights.push(Math.max(0.1, randomFactor))
  }

  const weightSum = weights.reduce((sum, value) => sum + value, 0)

  const result = [path[0]]

  let currentDistance = 0

  for (let i = 0; i < totalMinutes; i++) {
    currentDistance += totalDistance * (weights[i] / weightSum)

    const point = getPointByDistance(path, currentDistance)

    result.push(point)
  }

  result[result.length - 1] = path[path.length - 1]

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


function drawRecoverPath(points) {
  clearMap()

  routeLine = new AMap.Polyline({
    path: points,
    strokeColor: '#ff0000',
    strokeWeight: 6,
    strokeOpacity: 0.9,
    lineJoin: 'round',
    lineCap: 'round'
  })

  startMarker = new AMap.Marker({
    position: points[0],
    title: '起点',
    label: {
      content: '起点',
      direction: 'top'
    }
  })

  endMarker = new AMap.Marker({
    position: points[points.length - 1],
    title: '终点',
    label: {
      content: '终点',
      direction: 'top'
    }
  })

  startCircle = new AMap.CircleMarker({
    center: points[0],
    radius: 8,
    strokeColor: '#ffffff',
    strokeWeight: 3,
    fillColor: '#22c55e',
    fillOpacity: 1,
    zIndex: 200
  })

  endCircle = new AMap.CircleMarker({
    center: points[points.length - 1],
    radius: 8,
    strokeColor: '#ffffff',
    strokeWeight: 3,
    fillColor: '#ef4444',
    fillOpacity: 1,
    zIndex: 200
  })

  map.add([routeLine, startMarker, endMarker, startCircle, endCircle])
  map.setFitView([routeLine, startMarker, endMarker])
}

function clearMap() {
  if (routeLine) map.remove(routeLine)
  if (startMarker) map.remove(startMarker)
  if (endMarker) map.remove(endMarker)
  if (startCircle) map.remove(startCircle)
  if (endCircle) map.remove(endCircle)

  routeLine = null
  startMarker = null
  endMarker = null
  startCircle = null
  endCircle = null
}

function handleFileUpload(event) {
  const file = event.target.files[0]

  if (!file) return

  fileName.value = file.name

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (result) => {
      batchRecoverList.value = result.data
        .filter(row =>
          row.track_id &&
          row.start_time &&
          row.end_time &&
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
          track_id: row.track_id,
          start_time: row.start_time,
          end_time: row.end_time,
          start_lng: row.start_lng,
          start_lng_dir: row.start_lng_dir,
          start_lat: row.start_lat,
          start_lat_dir: row.start_lat_dir,
          end_lng: row.end_lng,
          end_lng_dir: row.end_lng_dir,
          end_lat: row.end_lat,
          end_lat_dir: row.end_lat_dir,
          fluctuation: Math.min(
            1,
            Math.max(0, Number(row.fluctuation || 0.4))
          )
        }))
    }
  })
}


async function batchRecover() {
  if (batchRecoverList.value.length === 0) {
    alert('请先上传路径恢复 CSV 文件')
    return
  }

  batchRecoverResults.value = []
  batchMessage.value = ''

  for (const item of batchRecoverList.value) {
    try {
      const totalMinutes = getMinuteDiff(item.start_time, item.end_time)

      if (totalMinutes <= 0) {
        continue
      }

      const sLng = convertCoordinate(item.start_lng, item.start_lng_dir)
      const sLat = convertCoordinate(item.start_lat, item.start_lat_dir)
      const eLng = convertCoordinate(item.end_lng, item.end_lng_dir)
      const eLat = convertCoordinate(item.end_lat, item.end_lat_dir)

      const origin = `${sLng},${sLat}`
      const destination = `${eLng},${eLat}`

      const routeData = await searchDrivingRoute(origin, destination)

      if (
        !routeData.route ||
        !routeData.route.paths ||
        routeData.route.paths.length === 0
      ) {
        continue
      }

      const pathInfo = routeData.route.paths[0]
      const realRoadPath = getRoutePath(pathInfo.steps)

      const points = generateFluctuatedPathByRoute(
        realRoadPath,
        totalMinutes,
        Number(item.fluctuation)
      )

      points.forEach((point, index) => {
        let speed = 0

        if (index > 0) {
          const distance = AMap.GeometryUtil.distance(points[index - 1], point) / 1000
          speed = distance * 60
        }

        batchRecoverResults.value.push({
          track_id: item.track_id,
          time: addMinutesToTime(item.start_time, index),
          longitude: formatLng(point[0]),
          latitude: formatLat(point[1]),
          minute: index,
          speed_kmh: speed.toFixed(2)
        })
      })
    } catch (error) {
      console.error(error)
    }
  }

  batchMessage.value = `批量路径恢复完成，共生成 ${batchRecoverResults.value.length} 条轨迹点数据。`
}

function exportResult() {
  if (batchRecoverResults.value.length === 0) {
    alert('暂无可导出的结果')
    return
  }

  if (exportType.value === 'csv') {
    exportCSV()
  } else {
    exportJSON()
  }

  alert(`导出成功，文件格式为 ${exportType.value.toUpperCase()}，内容包含轨迹编号、时间、经度、纬度、分钟序号和速度。`)
}

function exportCSV() {
  const csv = Papa.unparse(batchRecoverResults.value)
  downloadFile(csv, 'path_recover_result.csv', 'text/csv;charset=utf-8;')
}

function exportJSON() {
  const json = JSON.stringify(batchRecoverResults.value, null, 2)
  downloadFile(json, 'path_recover_result.json', 'application/json;charset=utf-8;')
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
.recover-page {
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

#recover-map {
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

.label {
  display: block;
  margin-bottom: 8px;
  color: #333;
}

button {
  width: 100%;
  padding: 12px 20px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 6px;
}

button:hover {
  background-color: #1d4ed8;
}

.result p {
  margin-bottom: 8px;
  color: #333;
}

.minute-table {
  max-height: 360px;
  overflow-y: auto;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
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

.table-tip {
  margin-top: 12px;
  color: #666;
  font-size: 13px;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 0.8fr 1fr 1fr 1fr 1fr;
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