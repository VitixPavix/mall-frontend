//导入request.js请求工具
import request from '@/utils/request.js'

//获取收货地址列表
export const getAddressListService = (params) => {
    return request.get('/address', { params })
}

//添加收货地址
export const addAddressService = (address) => {
    return request.post('/address', address)
}

//更新收货地址
export const updateAddressService = (address) => {
    return request.put('/address', address)
}

//删除收货地址（支持单个或批量）
export const deleteAddressService = (ids) => {
    // 统一处理：如果传入的是单个ID，转换为数组
    const idArray = Array.isArray(ids) ? ids : [ids]
    return request.delete('/address', {data: {ids: idArray}})
}
