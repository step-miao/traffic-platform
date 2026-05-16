import express from 'express'
import cors from 'cors'
import OpenAI from 'openai'

import path from 'path'
import { fileURLToPath } from 'url'

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors())
app.use(express.json())

// 前端静态文件
app.use(express.static(path.join(__dirname, '../dist')))

const client = new OpenAI({
  apiKey: '你的apikey',
  baseURL: 'https://api.siliconflow.cn/v1'
})

// AI接口
app.post('/api/travel-ai', async (req, res) => {
  try {
    const { message, currentSpot = '未指定景点' } = req.body

    const completion = await client.chat.completions.create({
      model: 'deepseek-ai/DeepSeek-V3',
      messages: [
        {
          role: 'system',
          content: '你叫原子旅行家，是四川旅游规划助手。'
        },
        {
          role: 'user',
          content: `
当前用户正在浏览景点：${currentSpot}

用户问题：${message}
          `
        }
      ]
    })

    res.json({
      reply: completion.choices[0].message.content
    })
  } catch (error) {
    console.log(error)

    res.status(500).json({
      reply: '原子旅行家远去了，暂时不在。'
    })
  }
})

// 前端路由
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

const PORT = process.env.PORT || 10000

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AI server running on port ${PORT}`)
})