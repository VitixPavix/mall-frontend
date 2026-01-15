// 统计相关 API
import request from '@/utils/request.js'

// ==================== Admin 管理后台统计接口 ====================

// 获取管理后台概览数据
export const getAdminOverviewService = () => {
  return request.get('/admin/statistics/overview')
}

// 获取订单状态分布
export const getOrderStatusService = () => {
  return request.get('/admin/statistics/order-status')
}

// ==================== Shop 店铺管理统计接口 ====================

// 获取店铺概览数据
export const getShopOverviewService = () => {
  return request.get('/shop/statistics/overview')
}

// 获取商品销售排行
export const getProductRankService = () => {
  return request.get('/shop/statistics/product-rank')
}
