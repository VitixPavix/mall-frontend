//导入request.js请求工具
import request from '@/utils/request.js'

//调用注册接口函数
export const shopRegisterService = (registerData)=>{
    return request.post('/shop/register',registerData);
}


//调用登录接口函数
export const shopLoginService = (loginData)=>{
    return request.post('/shop/login',loginData)
}

//调用查询店铺信息接口
export const shopInfoService = ()=>{
    return request.get('/shop/shopInfo')
}

//调用修改店铺信息接口
export const shopUpdateInfoService = (updateData)=>{
    return request.put('/shop/update',updateData)
}

//调用修改店铺密码接口
export const shopUpdatePasswordService = (updateData)=>{
    return request.patch('/shop/updatePwd',updateData)
}

//获取店铺信息（公开接口，通过ID获取）
export const getShopInfoService = (shopId)=>{
    return request.get(`/shop/${shopId}`)
}

