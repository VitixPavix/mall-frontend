//导入request.js请求工具
import request from '@/utils/request.js'

//新增商品
export const addProductService = (product) => {
    return request.post('/product', product)
}

//查询商品
export const getProductListService = (params) => {
    return request.get('/product', {params:params})
}

//修改商品
export const updateProductService = (product) => {
    return request.put('/product', product)
}

//删除商品（支持单个或批量）
export const deleteProductService = (ids) => {
    // 统一处理：如果传入的是单个ID，转换为数组
    const idArray = Array.isArray(ids) ? ids : [ids]
    return request.delete('/product', {data: {ids: idArray}})
}

//获取商品详情
export const getProductDetailService = (id) => {
    return request.get(`/product/${id}`)
}

//获取商品评论
export const getProductReviewsService = (id, params) => {
    return request.get(`/product/${id}/reviews`, {params:params})
}