<template>
  <div class="travel-home">

    <!-- 顶部 -->
    <div class="travel-header">
      <div>
        <h1>旅游模式</h1>
        <p>轻松一点，出发远一点。</p>
      </div>

      <button class="back-btn" @click="goBack">
        返回模式选择
      </button>
    </div>

    <!-- 功能模块 -->
    <div class="module-grid">

      <!-- 城市旅游 -->
      <div class="module-card city-card">
        <div class="icon">🏙️</div>

        <h2>城市旅游</h2>

        <p>
          输入城市，查看热门景点、地图分布、
          路线推荐以及景点特色介绍。
        </p>

        <button @click="goCityTravel">
          进入城市旅游
        </button>
      </div>

      <!-- 景点分析 -->
      <div class="module-card spot-card">
        <div class="icon">📍</div>

        <h2>景点分析</h2>

        <p>
          查看景点内部地图、推荐游览路线、
          预计游玩时间与旅游花销。
        </p>

        <button @click="goSpotAnalysis">
          进入景点分析
        </button>
      </div>

      <!-- AI旅行家 -->
      <div class="module-card ai-card">
        <div class="icon">🤖</div>

        <h2>原子旅行家</h2>

        <p>
          与 AI 旅行助手对话，
          自动生成个性化旅游方案。
        </p>

        <button @click="goAITravel">
          开始 AI 对话
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.push('/mode-select')
}

function goCityTravel() {
  router.push('/travel-city')
}

function goSpotAnalysis() {
  router.push('/travel-spot')
}

function goAITravel() {
  router.push('/travel-ai')
}
</script>

<style scoped>
.travel-home {
  min-height: 100vh;
  background: #f5f7fb;
  padding: 60px;
}

/* 顶部 */

.travel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 50px;
}

.travel-header h1 {
  font-size: 52px;
  color: #2563eb;
  margin-bottom: 12px;
}

.travel-header p {
  color: #666;
  font-size: 18px;
}

.back-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: white;
  color: #2563eb;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0,0,0,0.08);
}

/* 三个功能模块 */

.module-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.module-card {
  background: white;
  border-radius: 24px;
  padding: 38px;
  box-shadow: 0 10px 28px rgba(0,0,0,0.08);
  transition: 0.25s;
}

.module-card:hover {
  transform: translateY(-6px);
}

.icon {
  font-size: 56px;
  margin-bottom: 20px;
}

.module-card h2 {
  font-size: 28px;
  margin-bottom: 18px;
  color: #1f2937;
}

.module-card p {
  color: #666;
  line-height: 1.8;
  margin-bottom: 28px;
}

.module-card button {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

/* 不同颜色 */

.city-card button {
  background: #2563eb;
}

.spot-card button {
  background: #0ea5e9;
}

.ai-card button {
  background: #8b5cf6;
}

/* 卡片顶部渐变 */

.city-card {
  background: linear-gradient(180deg, #eef4ff 0%, white 35%);
}

.spot-card {
  background: linear-gradient(180deg, #eefcff 0%, white 35%);
}

.ai-card {
  background: linear-gradient(180deg, #f5efff 0%, white 35%);
}
</style>