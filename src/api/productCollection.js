//导入request.js请求工具
import request from '@/utils/request.js'

//获取商品收藏列表
export const getProductCollectionListService = (params) => {
    return request.get('/productCollection', { params })
}

//添加商品收藏
export const addProductCollectionService = (collection) => {
    return request.post('/productCollection', collection)
}

//删除商品收藏（支持单个或批量）
export const deleteProductCollectionService = (ids) => {
    // 统一处理：如果传入的是单个ID，转换为数组
    const idArray = Array.isArray(ids) ? ids : [ids]
    return request.delete('/productCollection', {data: {ids: idArray}})
}
