//导入request.js请求工具
import request from '@/utils/request.js'

//获取店铺收藏列表
export const getShopCollectionListService = (params) => {
    return request.get('/shopCollection', { params })
}

//添加店铺收藏
export const addShopCollectionService = (collection) => {
    return request.post('/shopCollection', collection)
}

//删除店铺收藏（支持单个或批量）
export const deleteShopCollectionService = (ids) => {
    // 统一处理：如果传入的是单个ID，转换为数组
    const idArray = Array.isArray(ids) ? ids : [ids]
    return request.delete('/shopCollection', {data: {ids: idArray}})
}
