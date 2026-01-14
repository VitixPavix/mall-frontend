import request from '@/utils/request'

// 获取轮播图列表
export const getCarouselListService = (params) => {
  return request.get('/carousel', { params })
}

// 获取轮播图详情
export const getCarouselDetailService = (id) => {
  return request.get(`/carousel/${id}`)
}

// 添加轮播图
export const addCarouselService = (data) => {
  return request.post('/carousel', data)
}

// 更新轮播图
export const updateCarouselService = (data) => {
  return request.put('/carousel', data)
}

// 删除轮播图（支持单个或批量）
export const deleteCarouselService = (ids) => {
  // 统一处理：如果传入的是单个ID，转换为数组
  const idArray = Array.isArray(ids) ? ids : [ids]
  return request.delete('/carousel', {data: {ids: idArray}})
}
