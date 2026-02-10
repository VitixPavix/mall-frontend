// 商城 AI 客服接口

// 查询可用的AI模型
export const getAiModelsService = async () => {
  const response = await fetch('/api/ai/models')
  return response.json()
}

// AI聊天（流式）- 商城客服专用
export const sendAiMessageStreamService = async (data, onChunk) => {
  const headers = {
    'Content-Type': 'application/json'
  }

  const response = await fetch('/api/ai/chat/stream', {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error('服务异常')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    
    const chunk = decoder.decode(value, { stream: true })
    if (chunk) onChunk(chunk)
  }
}
