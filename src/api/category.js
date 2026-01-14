//导入request.js请求工具
import request from '@/utils/request.js'

//获取商品分类
export const getCategoryListService = (params) => {
    return request.get('/category', {params:params})
}
// //根据名字查询商品分类
// export const getCategoryByNameService = (name) => {
//     return request.get('/category?categoryName=' + name)
// }

//根据id获取商品分类
export const getCategoryByIdService = (id) => {
    return request.get(`/category/${id}`)
}

//新增商品分类
export const addCategoryService = (category) => {
    return request.post('/category', category)
}

//修改商品分类
export const updateCategoryService = (category) => {
    return request.put(`/category/${category.id}`, category)
}

//删除商品分类（支持单个或批量）
export const deleteCategoryService = (ids) => {
    // 统一处理：如果传入的是单个ID，转换为数组
    const idArray = Array.isArray(ids) ? ids : [ids]
    return request.delete('/category', {data: {ids: idArray}})
}