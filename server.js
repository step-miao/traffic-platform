import express from 'express'
import cors from 'cors'
import OpenAI from 'openai'

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.static(path.join(__dirname, 'dist')))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'))
})

const app = express()

app.use(cors())
app.use(express.json())

const client = new OpenAI({
  apiKey: 'sk-blejiwhrmisynobzwhspbclihuuafchzdleevccqtuxtvaoc',
  baseURL: 'https://api.siliconflow.cn/v1'
})

app.post('/api/travel-ai', async (req, res) => {
  try {
    const { message, currentSpot = '未指定景点' } = req.body

    const completion = await client.chat.completions.create({
      model: 'deepseek-ai/DeepSeek-V3',
      messages: [
        {
          role: 'system',
          content: `你叫原子旅行家，是四川旅游规划助手。`
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

const PORT = process.env.PORT || 3001

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})