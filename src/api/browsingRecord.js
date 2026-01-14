//导入request.js请求工具
import request from '@/utils/request.js'

//获取浏览记录列表
export const getBrowsingRecordListService = (params) => {
    return request.get('/browsingRecord', { params })
}

//添加浏览记录
export const addBrowsingRecordService = (record) => {
    return request.post('/browsingRecord', record)
}

//删除浏览记录（支持单个或批量）
export const deleteBrowsingRecordService = (ids) => {
    // 统一处理：如果传入的是单个ID，转换为数组
    const idArray = Array.isArray(ids) ? ids : [ids]
    return request.delete('/browsingRecord', {data: {ids: idArray}})
}