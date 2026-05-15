<template>
  <div class="travel-spot">
    <div class="top-bar">
      <div>
        <h1>景点分析</h1>
        <p>搜索景点，生成景区地图、游览攻略与花销估计。</p>
      </div>

      <button @click="goBack">返回旅游首页</button>
    </div>

    <div class="spot-layout">
      <div class="search-card">
        <h2>搜索景点</h2>

        <input
          v-model="keyword"
          placeholder="请输入景点，例如：武侯祠、乐山大佛"
        />

        <button class="main-btn" @click="searchSpot">
          搜索景点
        </button>

        <div class="candidate-list">
          <div
            v-for="spot in candidates"
            :key="spot.name"
            class="candidate-item"
            @click="selectSpot(spot)"
          >
            <span>📍</span>
            <div>
              <strong>{{ spot.name }}</strong>
              <p>{{ spot.address }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="inside-map-card">
        <h2>景点游览路线示意图</h2>

        <div class="map-fill-box">
          <div
            v-if="!selectedSpot"
            class="map-placeholder"
          >
            🎒 先搜索并选择一个景点
          </div>

          <div
            v-show="selectedSpot"
            id="spot-map-container"
            class="spot-map"
          ></div>
        </div>
      </div>
    </div>

    <div v-if="selectedSpot && analysis" class="analysis-result">
      <div class="spot-hero">
        <img
          v-if="selectedSpot.image"
          :src="selectedSpot.image"
          :alt="selectedSpot.name"
        />

        <div v-else class="hero-no-photo">
          暂无景点图片
        </div>

        <div class="spot-hero-text">
          <h2>{{ selectedSpot.name }}</h2>
          <p>{{ selectedSpot.desc }}</p>

          <div class="spot-meta">
            <span>📍 {{ selectedSpot.address }}</span>
            <span>🏷️ {{ selectedSpot.type }}</span>
            <span>⭐ 推荐游玩</span>
          </div>
        </div>
      </div>

      <p class="tag">景点分析结果</p>
      <h2>{{ selectedSpot.name }}</h2>

      <div class="info-grid">
        <div class="info-card">
          <h3>推荐游览路线</h3>
          <p>{{ analysis.route }}</p>
        </div>

        <div class="info-card">
          <h3>预计游玩时间</h3>
          <p>{{ analysis.time }}</p>
        </div>

        <div class="info-card">
          <h3>路线攻略</h3>
          <p>{{ analysis.strategy }}</p>
        </div>

        <div class="info-card">
          <h3>适合人群</h3>
          <p>{{ analysis.people }}</p>
        </div>
      </div>

      <div class="cost-section">
        <h2>预计花销明细</h2>

        <div class="cost-grid">
          <div class="cost-item">
            <span>🎫 门票费用</span>
            <strong>{{ analysis.ticket }}</strong>
          </div>

          <div class="cost-item">
            <span>🚗 交通费用</span>
            <strong>{{ analysis.transport }}</strong>
          </div>

          <div class="cost-item">
            <span>🍜 餐饮费用</span>
            <strong>{{ analysis.food }}</strong>
          </div>

          <div class="cost-item">
            <span>🎧 讲解导览</span>
            <strong>{{ analysis.guide }}</strong>
          </div>

          <div class="cost-item">
            <span>🛍️ 文创购物</span>
            <strong>{{ analysis.shopping }}</strong>
          </div>

          <div class="cost-item total">
            <span>💰 预计总花销</span>
            <strong>{{ analysis.total }}</strong>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const keyword = ref('')
const candidates = ref([])
const selectedSpot = ref(null)
const analysis = ref(null)

let spotMap = null
let spotMarker = null
let spotPolygon = null
function goBack() {
  router.push('/travel')
}
async function initSpotMap() {
  if (spotMap) return

  window._AMapSecurityConfig = {
    securityJsCode: 'b9f72ffa6d6a2e1dfba0a35de1edc125'
  }

  if (window.AMap) {
    AMap = window.AMap
  } else {
    AMap = await AMapLoader.load({
      key: 'f76f4d91a765947f68632614ef2aa6ac',
      version: '2.0'
    })
  }

  spotMap = new AMap.Map('spot-map-container', {
    zoom: 15,
    center: [104.0668, 30.5728]
  })
}
async function searchSpot() {
  if (!keyword.value.trim()) {
    alert('请输入景点名称')
    return
  }



  await new Promise(resolve => {
    AMap.plugin('AMap.PlaceSearch', resolve)
  })

  const placeSearch = new AMap.PlaceSearch({
    pageSize: 10,
    pageIndex: 1,
    extensions: 'all'
  })

  placeSearch.search(keyword.value, (status, result) => {
    if (
      status === 'complete' &&
      result.poiList &&
      result.poiList.pois &&
      result.poiList.pois.length > 0
    ) {
      candidates.value = result.poiList.pois.map(item => {
        const image =
          item.photos && item.photos.length > 0
            ? item.photos[0].url
            : ''

        return {
          name: item.name,
          address: item.address || '暂无地址',
          type: item.type || '旅游景点',
          location: item.location,
          image: image,
          desc:
            item.name +
            '位于' +
            (item.address || '该区域') +
            '附近，属于' +
            (item.type || '旅游景点') +
            '类型，适合结合游玩时间、交通方式和个人兴趣进行安排。'
        }
      })
    } else {
      candidates.value = []
      alert('没有查询到相关景点')
    }
  })
}

async function selectSpot(spot) {
  selectedSpot.value = spot
  analysis.value = generateAnalysis(spot)

  await nextTick()

  if (!spot.location) {
    return
  }

  await initSpotMap()

  const lng = spot.location.lng
  const lat = spot.location.lat

  spotMap.setZoomAndCenter(15, [lng, lat])

setTimeout(() => {
  spotMap.resize()
}, 500)

  spotMap.clearMap()

  new AMap.Marker({
    position: [lng, lat],
    title: spot.name,
    map: spotMap
  })
}
function generateAnalysis(spot) {
  const name = spot.name
  const type = spot.type || spot.name

  if (
    type.includes('山') ||
    type.includes('森林') ||
    type.includes('自然') ||
    name.includes('山')
  ) {
    return {
      route: '入口服务区 → 登山步道 → 观景平台 → 核心景观点 → 休息补给区 → 出口',
      time: '约 3 - 6 小时',
      strategy: '建议提前准备饮用水和轻便装备，优先选择上午进入景区，避免下午体力消耗过大。',
      people: '自然风光游、摄影游、徒步爱好者、亲子轻徒步。',
      ticket: '30 - 120 元',
      transport: '30 - 150 元',
      food: '40 - 120 元',
      guide: '0 - 80 元',
      shopping: '0 - 100 元',
      total: '约 100 - 570 元'
    }
  }

  if (
    type.includes('博物馆') ||
    type.includes('纪念馆') ||
    type.includes('文化') ||
    name.includes('博物馆')
  ) {
    return {
      route: '入口安检 → 基础陈列区 → 核心展厅 → 专题展区 → 文创商店 → 出口',
      time: '约 1 - 2.5 小时',
      strategy: '建议按展厅顺序参观，重点关注核心展区；如有讲解服务，可优先选择讲解路线。',
      people: '文化游、研学游、亲子游、历史爱好者。',
      ticket: '0 - 60 元',
      transport: '10 - 50 元',
      food: '20 - 80 元',
      guide: '20 - 100 元',
      shopping: '0 - 150 元',
      total: '约 50 - 440 元'
    }
  }

  if (
    type.includes('商业') ||
    type.includes('步行街') ||
    type.includes('购物') ||
    name.includes('街')
  ) {
    return {
      route: '入口街区 → 特色商铺 → 美食区域 → 拍照打卡点 → 夜景观赏区 → 出口',
      time: '约 1.5 - 4 小时',
      strategy: '建议傍晚进入，先逛街区再安排晚餐和夜景拍照，注意控制购物预算。',
      people: '城市轻旅行、美食游、情侣游、摄影打卡。',
      ticket: '0 元',
      transport: '10 - 60 元',
      food: '50 - 200 元',
      guide: '0 元',
      shopping: '50 - 300 元',
      total: '约 110 - 560 元'
    }
  }

  return {
    route: '正门入口 → 标志性景观点 → 历史文化展示区 → 拍照打卡区 → 休息补给区 → 出口',
    time: '约 1.5 - 3 小时',
    strategy: '建议先参观核心景观，再前往文化展示区，最后安排拍照与休息，可避免重复绕路。',
    people: '亲子游、文化游、城市轻旅行、摄影打卡。',
    ticket: '0 - 80 元',
    transport: '10 - 50 元',
    food: '30 - 100 元',
    guide: '0 - 50 元',
    shopping: '0 - 150 元',
    total: '约 40 - 430 元'
  }
}
const cost = computed(() => {
  if (!selectedSpot.value) {
    return {}
  }

  return {
    ticket: '0 - 80 元',
    transport: '10 - 50 元',
    food: '30 - 100 元',
    guide: '0 - 50 元',
    shopping: '0 - 150 元',
    total: '约 40 - 430 元'
  }
})
</script>

<style scoped>
.travel-spot {
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
  font-size: 52px;
  color: #0ea5e9;
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
  background: linear-gradient(135deg, #38bdf8, #0ea5e9);
  color: white;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(14,165,233,0.25);
}

.spot-layout {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 28px;
  align-items: stretch;
}

.inside-map-card {
  display: flex;
  flex-direction: column;

  height: 860px;   /* 整个右侧区域高度 */

  background: white;
  border-radius: 30px;
  padding: 28px;
}

.map-fill-box {
  flex: 1;

  width: 100%;
  height: 100%;

  position: relative;

  border-radius: 26px;
  overflow: hidden;

  background: linear-gradient(135deg, #dff6ff, #fff2d9);
}

.inside-map-card .map-fill-box,
.inside-map-card .inside-map {
  flex: 1 !important;
  width: 100% !important;
  height: auto !important;
  min-height: 680px !important;
}

.search-card h2,
.inside-map-card h2 {
  margin-bottom: 20px;
}

input {
  width: 100%;
  padding: 16px 18px;
  border: none;
  border-radius: 18px;
  background: #f7fbff;
  margin-bottom: 18px;
  font-size: 15px;
}

.candidate-list {
  margin-top: 20px;
  display: grid;
  gap: 12px;
}

.candidate-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px;
  border-radius: 18px;
  background: linear-gradient(135deg, #f7fbff, #eef6ff);
  cursor: pointer;
  transition: 0.2s;
}

.candidate-item:hover {
  transform: translateY(-2px);
  background: linear-gradient(135deg, #dff1ff, #e8f0ff);
}

.candidate-item p {
  margin-top: 4px;
  color: #64748b;
  font-size: 13px;
}

.inside-map {
  height: 280px;
  position: relative;
  border-radius: 26px;
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 20%, #bfdbfe 0, transparent 26%),
    radial-gradient(circle at 80% 70%, #fde68a 0, transparent 28%),
    linear-gradient(135deg, #dff6ff, #fff2d9);
}

.map-placeholder {
  position: absolute !important;
  inset: 0 !important;
  z-index: 1 !important;

  display: flex !important;
  align-items: center !important;
  justify-content: center !important;

  color: #2563eb !important;
  font-size: 22px !important;
  font-weight: 800 !important;
  pointer-events: none !important;
}

.map-road {
  position: absolute;
  height: 12px;
  background: rgba(37,99,235,0.25);
  border-radius: 999px;
}

.road-one {
  width: 70%;
  left: 12%;
  top: 42%;
  transform: rotate(12deg);
}

.road-two {
  width: 58%;
  left: 22%;
  top: 62%;
  transform: rotate(-18deg);
}

.map-point {
  position: absolute;
  padding: 10px 16px;
  border-radius: 999px;
  background: white;
  color: #2563eb;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(37,99,235,0.18);
}

.point-one {
  left: 10%;
  top: 35%;
}

.point-two {
  left: 34%;
  top: 26%;
}

.point-three {
  left: 55%;
  top: 45%;
}

.point-four {
  left: 68%;
  top: 65%;
}

.point-five {
  left: 82%;
  top: 42%;
}

.analysis-result {
  margin-top: 20px;
}

.spot-title-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 26px;
}

.tag {
  color: #0ea5e9;
  font-weight: 700;
}

.spot-title-card h2 {
  font-size: 38px;
  margin: 8px 0;
}

.weather-badge {
  padding: 14px 22px;
  border-radius: 999px;
  background: linear-gradient(135deg, #fde68a, #bfdbfe);
  font-weight: 800;
  color: #1f2937;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.info-card {
  background: #f7fbff;
  border-radius: 22px;
  padding: 20px;
}

.info-card h3 {
  margin-bottom: 12px;
  color: #0ea5e9;
}

.info-card p {
  color: #374151;
  line-height: 1.8;
}

.cost-section {
  margin-top: 30px;
}

.cost-section h2 {
  margin-bottom: 18px;
}

.cost-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.cost-item {
  padding: 18px;
  border-radius: 20px;
  background: linear-gradient(135deg, #f7fbff, #eef6ff);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cost-item strong {
  color: #2563eb;
}

.cost-item.total {
  background: linear-gradient(135deg, #38bdf8, #2563eb);
  color: white;
}

.cost-item.total strong {
  color: white;
}


.map-placeholder {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #2563eb;
  font-size: 22px;
  font-weight: 800;
  text-align: center;
}

.map-placeholder p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
}

.placeholder-icon {
  width: 82px;
  height: 82px;
  border-radius: 50%;
  background: linear-gradient(135deg, #38bdf8, #fde68a);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42px;
  box-shadow: 0 12px 28px rgba(37,99,235,0.18);
}

.candidate-list {
  margin-top: 22px;
  display: grid;
  gap: 12px;
}

.candidate-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px;
  border-radius: 18px;
  background: linear-gradient(135deg, #f7fbff, #eef6ff);
  cursor: pointer;
  transition: 0.2s;
}

.candidate-item:hover {
  transform: translateY(-2px);
  background: linear-gradient(135deg, #dff1ff, #e8f0ff);
}

.candidate-item p {
  margin-top: 4px;
  color: #64748b;
  font-size: 13px;
}
.spot-hero {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 28px;
  align-items: center;
  margin-bottom: 30px;
  padding: 24px;
  border-radius: 26px;
  background: linear-gradient(135deg, #f7fbff, #fff7df);
}

.spot-hero img {
  width: 100%;
  height: 260px;
  object-fit: cover;
  border-radius: 22px;
}

.spot-hero-text h2 {
  font-size: 38px;
  margin-bottom: 14px;
  color: #1f2937;
}

.spot-hero-text p {
  line-height: 1.9;
  color: #374151;
  font-size: 16px;
}

.spot-meta {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.spot-meta span {
  padding: 8px 14px;
  border-radius: 999px;
  background: white;
  color: #2563eb;
  font-weight: 700;
  font-size: 14px;
}
.hero-no-photo {
  width: 100%;
  height: 260px;
  border-radius: 22px;
  background: linear-gradient(135deg, #bfdbfe, #fde68a);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  font-weight: 800;
}




.map-placeholder {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  font-size: 22px;
  font-weight: 800;
}

:deep(.spot-label) {
  padding: 8px 14px;
  border-radius: 999px;
  background: white;
  color: #2563eb;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: 0 6px 14px rgba(37,99,235,0.25);
}
.spot-layout {
  display: grid !important;
  grid-template-columns: 380px 1fr !important;
  gap: 28px !important;
  align-items: start !important;
}


.map-fill-box {
  position: relative !important;
  flex: 1 !important;
  width: 100% !important;
  height: 100% !important;
  border-radius: 26px !important;
  overflow: hidden !important;
  background: linear-gradient(135deg, #dff6ff, #fff2d9) !important;
}

.spot-map {
  width: 100%;
  height: 100%;

  border-radius: 26px;
}
</style>