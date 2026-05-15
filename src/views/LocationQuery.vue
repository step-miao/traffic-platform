<template>
  <div class="location-page">
    <div class="left-panel">
      <router-link to="/academic" class="back">← 返回首页</router-link>

      <h1>地点经纬度查询</h1>
      <p class="desc">
        支持单个地点查询，并在右侧地图中显示位置。
      </p>

      <div class="section">
        <h2>普通版：单个地点查询</h2>

        <input
          v-model="placeName"
          type="text"
          placeholder="请输入地点名称，例如：四川师范大学"
        />

        <button @click="searchPlace">查询经纬度</button>
      </div>

      <div v-if="candidateList.length > 0" class="candidate-list">
        <h3>候选地点</h3>

        <div
          v-for="poi in candidateList"
          :key="poi.id"
          class="candidate-item"
          @click="selectCandidate(poi)"
        >
          <strong>{{ poi.name }}</strong>
          <p>{{ poi.pname }} {{ poi.cityname }} {{ poi.adname }} {{ poi.address }}</p>
        </div>
      </div>

      <div v-if="singleResult" class="result">
        <h3>查询结果</h3>
        <p>地点名称：{{ singleResult.name }}</p>
        <p v-if="singleResult.address">详细地址：{{ singleResult.address }}</p>
        <p>经度：{{ singleResult.lng }}</p>
        <p>纬度：{{ singleResult.lat }}</p>
      </div>

     <div class="section">
      <h2>专业版：批量地点查询</h2>

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

    <div v-if="batchResults.length > 0" class="result export-info">
      <h3>导出结果说明</h3>
      <p>导出文件包含以下字段：</p>
      <p><strong>place：</strong>用户输入的原始地点名称</p>
      <p><strong>name：</strong>高德地图匹配到的地点名称</p>
      <p><strong>address：</strong>匹配地点的详细地址</p>
      <p><strong>longitude：</strong>经度，已标注东经 E / 西经 W</p>
      <p><strong>latitude：</strong>纬度，已标注北纬 N / 南纬 S</p>
    </div>
    <div v-if="batchResults.length > 0" class="result batch-table">
      <h3>批量查询结果</h3>

      <div class="table-header">
        <span>原始地点</span>
        <span>匹配名称</span>
        <span>经度</span>
        <span>纬度</span>
      </div>

      <div
        v-for="item in batchResults"
        :key="item.place"
        class="table-row"
      >
        <span>{{ item.place }}</span>
        <span>{{ item.name }}</span>
        <span>{{ formatLng(item.lng) }}</span>
        <span>{{ formatLat(item.lat) }}</span>
      </div>
    </div>
    </div>

    <div class="right-map">
      <div id="map-container"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { searchLocation } from '../api/amap'
import Papa from 'papaparse'

const batchMessage = ref('')
const placeName = ref('')
const singleResult = ref(null)
const candidateList = ref([])
const fileName = ref('')
const placeList = ref([])
const batchResults = ref([])
const exportType = ref('csv')

let map = null
let marker = null

function formatLng(lng) {
  if (lng === '') return ''
  return `${Math.abs(lng)}°${lng >= 0 ? 'E' : 'W'}`
}

function formatLat(lat) {
  if (lat === '') return ''
  return `${Math.abs(lat)}°${lat >= 0 ? 'N' : 'S'}`
}

onMounted(() => {
  map = new AMap.Map('map-container', {
    zoom: 11,
    center: [104.066541, 30.572269]
  })
})

async function searchPlace() {
  if (!placeName.value) {
    alert('请输入地点名称')
    return
  }

  try {
    const data = await searchLocation(placeName.value)

    if (data.pois && data.pois.length > 0) {
      candidateList.value = data.pois
      singleResult.value = null
    } else {
      candidateList.value = []
      alert('未找到该地点')
    }
  } catch (error) {
    console.error(error)
    alert('查询失败')
  }
}

function selectCandidate(poi) {

  placeName.value = poi.name

  const location = poi.location.split(',')

  const lng = Number(location[0])
  const lat = Number(location[1])

  singleResult.value = {
    name: poi.name,
    address: poi.address,
    lng,
    lat
  }

  showLocationOnMap(lng, lat, poi.name)
}

function showLocationOnMap(lng, lat, name) {
  if (marker) {
    map.remove(marker)
  }

  marker = new AMap.Marker({
    position: [lng, lat],
    title: name
  })

  map.add(marker)
  map.setZoomAndCenter(16, [lng, lat])
}

function handleFileUpload(event) {
  const file = event.target.files[0]

  if (!file) return

  fileName.value = file.name

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (result) => {
      if (result.data.length > 0 && result.data[0].place) {
        placeList.value = result.data.map(row => row.place).filter(Boolean)
      } else {
        const reader = new FileReader()

        reader.onload = (e) => {
          placeList.value = e.target.result
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean)
        }

        reader.readAsText(file)
      }
    }
  })
}

async function batchSearch() {
  if (placeList.value.length === 0) {
    alert('请先上传地点文件')
    return
  }

  batchResults.value = []

  for (const place of placeList.value) {
    try {
      const data = await searchLocation(place)

      if (data.pois && data.pois.length > 0) {
        const poi = data.pois[0]
        const [lng, lat] = poi.location.split(',').map(Number)

        batchResults.value.push({
          place,
          name: poi.name,
          address: poi.address,
          lng,
          lat
        })
      } else {
        batchResults.value.push({
          place,
          name: '未找到',
          address: '',
          lng: '',
          lat: ''
        })
      }
    } 
   
    catch (error) {
      batchResults.value.push({
        place,
        name: '查询失败',
        address: '',
        lng: '',
        lat: ''
      })
    }
  }
   batchMessage.value = `批量查询完成，共处理 ${batchResults.value.length} 条地点数据。`
}


function exportResult() {
  if (batchResults.value.length === 0) {
    alert('暂无可导出的结果')
    return
  }

  if (exportType.value === 'csv') {
    exportCSV()
  } else {
    exportJSON()
  }

  alert(`导出成功，文件格式为 ${exportType.value.toUpperCase()}，内容包含原始地点、匹配名称、地址、经度和纬度。`)
}

function getExportData() {
  return batchResults.value.map(item => ({
    place: item.place,
    name: item.name,
    address: item.address,
    longitude: item.lng === '' ? '' : formatLng(item.lng),
    latitude: item.lat === '' ? '' : formatLat(item.lat)
  }))
}

function exportCSV() {
  const csv = Papa.unparse(getExportData())
  downloadFile(csv, 'location_result.csv', 'text/csv;charset=utf-8;')
}

function exportJSON() {
  const json = JSON.stringify(getExportData(), null, 2)
  downloadFile(json, 'location_result.json', 'application/json;charset=utf-8;')
}

function downloadFile(content, fileName, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()

  URL.revokeObjectURL(url)
}

</script>

<style scoped>
.location-page {
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
#map-container {
  width: 100%;
  height: 100%;
}

.export-select {
  width: 100%;
  padding: 12px;
  margin: 14px 0;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
}

.batch-table {
  max-height: 360px;
  overflow-y: auto;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 1.2fr 1.2fr 1fr 1fr;
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
}

button:hover {
  background-color: #1d4ed8;
}

.candidate-list {
  background: white;
  padding: 18px;
  border-radius: 12px;
  margin-bottom: 20px;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}

.candidate-item {
  padding: 12px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  background-color: #f8fbff;
  transition: 0.2s;
}

.candidate-item:hover {
  background-color: #eff6ff;
  border-color: #2563eb;
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

.file-result {
  margin-top: 12px;
  color: #555;
}
</style>