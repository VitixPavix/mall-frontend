//导入request.js请求工具
import request from '@/utils/request.js'

//调用注册接口函数
export const userRegisterService = (registerData)=>{
    return request.post('/user/register',registerData);
}
//调用登录接口函数
export const userLoginService = (loginData)=>{
    return request.post('/user/login',loginData)
}
//调用查询用户信息接口
export const userInfoService = ()=>{
    return request.get('/user/userInfo')
}

//调用修改用户信息接口
export const userUpdateInfoService = (updateData)=>{
    return request.put('/user/update',updateData)
}
//调用修改用户密码接口
export const userResetPasswordService = (updateData)=>{
    return request.patch('/user/updatePwd',updateData)
}
//调用充值查询接口
export const userRechargeService = (amount)=>{
    return request.put('/user/recharge?amount=' + amount)
}