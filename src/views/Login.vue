<template>
  <div class="login-page">
    <div class="login-card">
      <div class="left">
        <h1>交通数据分析平台</h1>
        <p>请输入授权密钥进入系统。付费后可获取登录密钥。</p>

        <input
          v-model="secretKey"
          type="password"
          placeholder="请输入登录密钥"
        />

        <button @click="login">登录</button>

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
  background: linear-gradient(135deg, #e0ecff, #f5f7fb);
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  width: 900px;
  min-height: 520px;
  background: white;
  border-radius: 20px;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.12);
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
  background: #f8fbff;
  padding: 50px;
  text-align: center;
  border-left: 1px solid #e5e7eb;
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