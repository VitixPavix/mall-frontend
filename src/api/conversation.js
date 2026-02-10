import request from '@/utils/request'
import { useTokenStore } from '@/stores/token'
import useUserInfoStore from '@/stores/userInfo'
import router from '@/router'

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
  const userInfoStore = useUserInfoStore()
  
  if (tokenStore.token && tokenStore.isTokenExpired()) {
    tokenStore.removeToken()
    userInfoStore.removeInfo()
    throw new Error('Token已过期，请重新登录')
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...(tokenStore.token && { Authorization: tokenStore.token })
  }

  const response = await fetch('/api/conversation/send/stream', {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    if (response.status === 401) {
      tokenStore.removeToken()
      userInfoStore.removeInfo()
      router.push('/ai-login')
      throw new Error('请先登录')
    }
    if (response.status === 403) {
      throw new Error('无权限操作')
    }
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

// 删除会话
export const deleteConversationService = (conversationId) => {
  return request.delete(`/conversation/${conversationId}`)
}

// 更新会话标题
export const updateConversationTitleService = (conversationId, title) => {
  return request.put(`/conversation/${conversationId}/title`, { title })
}
