import request from '@/utils/request'
import { useTokenStore } from '@/stores/token'

// 查询可用的AI模型
export const getAiModelsService = () => {
  return request.get('/ai/models')
}

// 获取会话列表
export const getConversationListService = () => {
  return request.get('/conversation/list')
}

// 获取会话详情
export const getConversationDetailService = (conversationId) => {
  return request.get(`/conversation/${conversationId}`)
}

// 发送消息（流式）
export const sendMessageStreamService = async (data, onChunk) => {
  const tokenStore = useTokenStore()
  
  const headers = {
    'Content-Type': 'application/json'
  }
  
  if (tokenStore.token) {
    headers['Authorization'] = tokenStore.token
  }

  const response = await fetch('/api/conversation/send/stream', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('请先登录')
    }
    throw new Error('网络请求失败')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (trimmedLine.startsWith('data:')) {
        const content = trimmedLine.substring(5).trim()
        if (content) {
          onChunk(content)
        }
      }
    }
  }

  if (buffer.trim().startsWith('data:')) {
    const content = buffer.trim().substring(5).trim()
    if (content) {
      onChunk(content)
    }
  }
}

// 删除会话
export const deleteConversationService = (conversationId) => {
  return request.delete(`/conversation/${conversationId}`)
}

// 更新会话标题
export const updateConversationTitleService = (conversationId, title) => {
  return request.put(`/conversation/${conversationId}/title`, { title })
}
