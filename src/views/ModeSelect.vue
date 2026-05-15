<template>
  <div class="mode-page">
    <h1>请选择使用模式</h1>
    <p>根据不同应用场景进入对应系统模块</p>

    <div class="mode-container">
      <div class="mode-card" @click="goAcademic">
        <h2>学术模式</h2>
        <p>进入交通数据分析平台，支持地点查询、路线详情、路线规划和路径恢复。</p>
        <button>进入学术模式</button>
      </div>

      <div class="mode-card travel-mode-card" @click="goTravelMode">
        <h2>旅游模式</h2>
        <p>
          面向旅游出行推荐、景点路线规划、景点分析与 AI 智能旅行助手。
        </p>
        <button class="travel-mode-btn">进入旅游模式</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goAcademic() {
  router.push('/academic')
}
function goTravelMode() {
  router.push('/travel')
}
</script>

<style scoped>
.mode-page {
  min-height: 100vh;
  background: #f5f7fb;
  padding: 70px;
  text-align: center;
}

h1 {
  font-size: 40px;
  color: #1f2937;
  margin-bottom: 16px;
}

.mode-page > p {
  color: #666;
  margin-bottom: 50px;
}

.mode-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  max-width: 980px;
  margin: 0 auto;
}

.mode-card {
  background: white;
  padding: 45px;
  border-radius: 18px;
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: 0.2s;
}

.mode-card:hover {
  transform: translateY(-5px);
}

.mode-card h2 {
  color: #2563eb;
  font-size: 28px;
  margin-bottom: 18px;
}

.mode-card p {
  color: #666;
  line-height: 1.7;
  margin-bottom: 30px;
}

button {
  padding: 12px 28px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.disabled:hover {
  transform: none;
}

.disabled button {
  background: #9ca3af;
  cursor: not-allowed;
}
.travel-mode-card {
  background: linear-gradient(135deg, #eef7ff, #fff4e8);
  position: relative;
  overflow: hidden;
}

.travel-mode-card::after {
  content: "✈️";
  position: absolute;
  right: 35px;
  top: 28px;
  font-size: 58px;
  opacity: 0.18;
}

.travel-mode-card h2 {
  color: #4a8cff;
}

.travel-mode-btn {
  background: linear-gradient(135deg, #56ccf2, #2f80ed);
  box-shadow: 0 10px 24px rgba(47, 128, 237, 0.25);
}

.travel-mode-btn:hover {
  transform: translateY(-2px);
}
</style>