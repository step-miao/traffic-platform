<template>
  <div class="login-page">
    <div class="login-card">
      <div class="left">
        <h1>游迹空间</h1>
        <p>请输入授权密钥进入系统。付费后可获取登录密钥。</p>

        <input
          v-model="secretKey"
          type="password"
          placeholder="请输入登录密钥"
        />

        <button @click="login">登录</button>

        <div class="platform-intro">
          <h3>平台功能简介</h3>

          <div class="intro-item">
            <strong>📊 学术模式：</strong>
            获取地图数据、地点经纬度、路线详情、路径规划与轨迹恢复数据，
            支持批量处理与数据导出。
          </div>

          <div class="intro-item">
            <strong>🌍 旅游模式：</strong>
            查询热门景点信息，
            结合 AI 进行个性化旅游路线规划与行程推荐。
          </div>
        </div>

        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
      </div>

      <div class="right">
        <h2>付费获取密钥</h2>
        <p>请扫码支付后联系管理员获取登录密钥</p>

        <img
          src="../assets/payment-code.jpg"
          alt="收款码"
          class="pay-code"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const secretKey = ref('')
const errorMsg = ref('')

const correctKey = 'Love_yourself'

function login() {
  if (!secretKey.value) {
    errorMsg.value = '请输入登录密钥'
    return
  }

  if (secretKey.value === correctKey) {
    localStorage.setItem('isLogin', 'true')
    router.push('/mode-select')
  } else {
    errorMsg.value = '密钥错误，请重新输入'
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  background-image:
    linear-gradient(rgba(15, 23, 42, 0.35), rgba(15, 23, 42, 0.35)),
    url('../assets/login-bg.jpg');

  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.login-card {
  width: 900px;
  min-height: 520px;

  background: rgba(255, 255, 255, 0.55);

  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  border-radius: 20px;

  display: grid;
  grid-template-columns: 1.2fr 1fr;

  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);

  overflow: hidden;
}

.left {
  padding: 60px;
}

.left h1 {
  font-size: 36px;
  color: #1f2937;
  margin-bottom: 20px;
}

.left p {
  color: #666;
  margin-bottom: 30px;
  line-height: 1.6;
}

input {
  width: 100%;
  padding: 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 16px;
  margin-bottom: 20px;
}

button {
  width: 100%;
  padding: 14px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
}

button:hover {
  background: #1d4ed8;
}

.error {
  margin-top: 16px;
  color: #dc2626;
}

.right {
  background: rgba(248, 251, 255, 0.78);

  padding: 50px;
  text-align: center;

  border-left: 1px solid rgba(255,255,255,0.3);
}

.right h2 {
  color: #2563eb;
  margin-bottom: 12px;
}

.right p {
  color: #666;
  margin-bottom: 24px;
}

.pay-code {
  width: 240px;
  height: 240px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: white;
}
</style>