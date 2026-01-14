//导入request.js请求工具
import request from '@/utils/request.js'

// 创建订单（购物车结算）
export const createOrderFromCartService = (data) => {
  return request.post('/order/cart', data)
}

// 创建订单（立即购买）
export const createOrderDirectService = (data) => {
  return request.post('/order/direct', data)
}

// 支付订单
export const payOrderService = (data) => {
  return request.put('/order/pay', data)
}

// 取消订单
export const cancelOrderService = (orderNo) => {
  return request.put(`/order/cancel/${orderNo}`)
}

// 确认收货
export const receiveOrderService = (orderNo) => {
  return request.put(`/order/receive/${orderNo}`)
}

// 评价订单商品
export const reviewOrderService = (data) => {
  return request.put('/order/review', data)
}

// 查询订单详情
export const getOrderDetailService = (orderNo) => {
  return request.get(`/order/${orderNo}`)
}

// 查询订单列表
export const getOrderListService = (params) => {
  return request.get('/order', { params })
}

// 商家发货
export const shipOrderService = (data) => {
  return request.put('/order/ship', data)
}

// 删除订单（管理员，支持单个或批量）
export const deleteOrderService = (ids) => {
  // 统一处理：如果传入的是单个ID，转换为数组
  const idArray = Array.isArray(ids) ? ids : [ids]
  return request.delete('/order', {data: {ids: idArray}})
}