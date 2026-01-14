//导入request.js请求工具
import request from '@/utils/request.js'

//获取购物车列表
export const getCartListService = (params) => {
    return request.get('/cart', { params })
}

//添加购物车
export const addCartService = (cart) => {
    return request.post('/cart', cart)
}

//修改购物车商品数量
export const updateCartService = (cart) => {
    return request.put('/cart', cart)
}

//删除购物车（支持单个或批量）
export const deleteCartService = (ids) => {
    // 统一处理：如果传入的是单个ID，转换为数组
    const idArray = Array.isArray(ids) ? ids : [ids]
    return request.delete('/cart', {data: {ids: idArray}})
}
