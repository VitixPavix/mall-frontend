import request from '@/utils/request'

// 查询可用的AI模型
export const getAiModelsService = () => {
  return request.get('/ai/models')
}

// AI聊天（完整版）
export const aiChatService = (data) => {
  return request.post('/ai/chat', data)
}

// AI聊天（简化版）
export const aiChatSimpleService = (userMessage) => {
  return request.post('/ai/chat/simple', null, {
    params: { userMessage }
  })
}
