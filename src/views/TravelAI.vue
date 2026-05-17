<script setup>
import { ref } from 'vue'

const userInput = ref('')

const messages = ref([
  {
    role: 'ai',
    content:
      '你好，我是原子旅行家 🎒\n可以帮你规划路线、推荐景点、估算预算。'
  }
])

async function sendMessage() {
  if (!userInput.value.trim()) return

  const text = userInput.value

  messages.value.push({
    role: 'user',
    content: text
  })

  userInput.value = ''

try {
  const res = await fetch('/api/travel-ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: text
    })
  })

  const data = await res.json()

  messages.value.push({
    role: 'ai',
    content: data.reply
  })
} catch (err) {
    messages.value.push({
      role: 'ai',
      content: '旅行家暂时离线了，请稍后再试。'
    })
  }
}
</script>

<template>
  <div class="travel-ai">
    <div class="ai-header">
      <div>
        <h1>原子旅行家</h1>
        <p>AI 智能旅游助手</p>
      </div>
      <div class="header-right">
  <router-link to="/travel" class="back-btn">
     返回旅游首页
  </router-link>
  </div>
      <div class="ai-avatar">
        🎒
      </div>
    </div>

    <div class="chat-box">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="[
          'message-item',
          msg.role === 'user'
            ? 'user-message'
            : 'ai-message'
        ]"
      >
        {{ msg.content }}
      </div>
    </div>

    <div class="input-area">
      <textarea
        v-model="userInput"
        placeholder="请输入旅游问题..."
      ></textarea>

      <button @click="sendMessage">
        发送
      </button>
    </div>
  </div>
</template>

<style scoped>
.travel-ai {
  min-height: 100vh;
  padding: 40px;

  background:
    linear-gradient(135deg, #e9f7ff, #fff5df);
}

.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 30px;
}

.ai-header h1 {
  font-size: 52px;
  color: #1da1f2;
  font-weight: 800;
}

.ai-header p {
  margin-top: 10px;
  color: #666;
  font-size: 20px;
}

.ai-avatar {
  width: 90px;
  height: 90px;

  border-radius: 50%;

  background:
    linear-gradient(135deg, #6dd5fa, #2980ff);

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 42px;

  color: white;

  box-shadow: 0 12px 30px rgba(41, 128, 255, 0.3);
}

.chat-box {
  height: 620px;

  overflow-y: auto;

  padding: 30px;

  border-radius: 30px;

  background: rgba(255,255,255,0.75);

  backdrop-filter: blur(10px);
}

.message-item {
  max-width: 70%;

  padding: 18px 22px;

  border-radius: 24px;

  margin-bottom: 20px;

  line-height: 1.8;

  white-space: pre-wrap;

  font-size: 17px;
}

.user-message {
  margin-left: auto;

  background:
    linear-gradient(135deg, #1da1f2, #4facfe);

  color: white;
}

.ai-message {
  background: white;

  color: #333;

  box-shadow: 0 6px 20px rgba(0,0,0,0.06);
}

.input-area {
  margin-top: 26px;

  display: flex;
  gap: 20px;
}

.input-area textarea {
  flex: 1;

  height: 90px;

  border: none;

  border-radius: 24px;

  padding: 20px;

  font-size: 16px;

  resize: none;

  outline: none;
}

.input-area button {
  width: 150px;

  border: none;

  border-radius: 24px;

  background:
    linear-gradient(135deg, #1da1f2, #2980ff);

  color: white;

  font-size: 18px;
  font-weight: 700;

  cursor: pointer;
}
.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 180px;
  height: 58px;

  border-radius: 999px;

  background: linear-gradient(
    135deg,
    #27c2ff 0%,
    #2d8fff 100%
  );

  color: white;

  text-decoration: none;

  font-size: 18px;
  font-weight: 700;

  box-shadow:
    0 7px 17.5px rgba(45,143,255,0.28);

  transition: all 0.25s ease;
}

.back-btn:hover {
  transform: translateY(-3px);

  box-shadow:
    0 14px 30px rgba(45,143,255,0.38);
}

.back-btn:hover {
  transform: translateY(-3px);

  box-shadow:
    0 14px 30px rgba(45,143,255,0.38);

  opacity: 0.92;
}
</style>