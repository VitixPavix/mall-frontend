import request from '@/utils/request'

// 获取广告列表
export const getAdListService = (params) => {
  return request.get('/ad', { params })
}

// 获取广告详情
export const getAdDetailService = (id) => {
  return request.get(`/ad/${id}`)
}

// 更新广告
export const updateAdService = (data) => {
  return request.put('/ad', data)
}
