//导入request.js请求工具
import request from '@/utils/request.js'

//调用登录接口函数
export const adminLoginService = (loginData)=>{
    return request.post('/admin/login',loginData)
}

//调用查询用户信息接口
export const adminInfoService = ()=>{
    return request.get('/admin/adminInfo')
}

//调用修改管理员信息接口
export const adminUpdateInfoService = (updateData)=>{
    return request.put('/admin/update',updateData)
}

//调用修改管理员密码接口
export const adminUpdatePasswordService = (updateData)=>{
    return request.patch('/admin/updatePwd',updateData)
}

//-----用户管理接口-----

//调用获取管理员列表接口
export const getadminListService = (params)=>{
    return request.get('/admin/adminList', {params: params})
}

//调用获取用户列表接口
export const getUserListService = (user)=>{
    return request.post('/admin/userList',user)
}

//调用增加用户接口
export const addUserService = (user)=>{
    return request.post('/admin/addUser',user)
}

//调用修改用户接口
export const updateUserService = (user)=>{
    return request.put('/admin/updateUser',user)
}

//调用删除用户接口（支持单个或批量）
export const deleteUserService = (ids)=>{
    // 统一处理：如果传入的是单个ID，转换为数组
    const idArray = Array.isArray(ids) ? ids : [ids]
    return request.delete('/admin/deleteUser', {data: {ids: idArray}})
}

//调用重置用户密码接口
export const userResetPasswordService = (updateData)=>{
    return request.patch('/admin/userResetPassword',updateData)
}

//调用获取店铺列表接口
export const getShopListService = (shop)=>{
    return request.post('/admin/shopList',shop)
}

 //调用增加店铺接口
 export const addShopService = (shop)=>{
    return request.post('/admin/addShop',shop)
}

//调用修改店铺接口
export const updateShopService = (shop)=>{
    return request.put('/admin/updateShop',shop)
}

//调用删除店铺接口（支持单个或批量）
export const deleteShopService = (ids)=>{
    // 统一处理：如果传入的是单个ID，转换为数组
    const idArray = Array.isArray(ids) ? ids : [ids]
    return request.delete('/admin/deleteShop', {data: {ids: idArray}})
}

//调用重置店铺密码接口
export const shopResetPasswordService = (updateData)=>{
    return request.patch('/admin/shopResetPassword',updateData)
}

//---------管理员管理接口--------

//获取管理员列表
export const getAdminListService = (admin)=>{
    return request.post('/admin/adminList',admin)
}

//调用增加管理员接口
export const addAdminService = (admin)=>{
    return request.post('/admin/addAdmin',admin)
}

//调用修改管理员接口
export const updateAdminService = (admin)=>{
    return request.put('/admin/updateAdmin',admin)
}

//调用删除管理员接口（支持单个或批量）
export const deleteAdminService = (ids)=>{
    // 统一处理：如果传入的是单个ID，转换为数组
    const idArray = Array.isArray(ids) ? ids : [ids]
    return request.delete('/admin/deleteAdmin', {data: {ids: idArray}})
}

//调用重置管理员密码接口
export const adminResetPasswordService = (updateData)=>{
    return request.patch('/admin/adminResetPassword',updateData)
}