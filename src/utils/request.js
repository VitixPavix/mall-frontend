//定制请求的实例

//导入axios  npm install axios
import axios from 'axios';

import { ElMessage } from 'element-plus'
//定义一个变量,记录公共的前缀  ,  baseURL
//const baseURL = 'http://localhost:8080';
const baseURL = '/api';
const instance = axios.create({baseURL})

import { useTokenStore } from '@/stores/token';
import useUserInfoStore from '@/stores/userInfo'



//添加请求拦截器
instance.interceptors.request.use(
    (config)=>{
        //请求前的回调
        //添加token
        const tokenStore = useTokenStore();
        const userInfoStore = useUserInfoStore();
        
        //判断有没有token
        if(tokenStore.token){
            // 只有在有token的情况下才检查是否过期
            if(tokenStore.isTokenExpired()){
                // token已过期，清除token和用户信息
                tokenStore.removeToken();
                userInfoStore.removeInfo();
                // 不在这里跳转，让路由守卫处理
                return Promise.reject(new Error('Token已过期，请重新登录'));
            }
            config.headers.Authorization = tokenStore.token
        }
        return config;
    },
    (err)=>{
        //请求错误的回调
        Promise.reject(err)
    }
)


/* import { useRoute } from 'vue-router';
const router = useRoute(); */



import router from '@/router'

//添加响应拦截器
instance.interceptors.response.use(
    result=>{
        //判断业务状态码
        if(result.data.code===0){
                return result.data;
        }

        //操作失败
        //alert(result.data.msg?result.data.msg:'服务异常')
        ElMessage.error(result.data.message?result.data.message:'服务异常')
        //异步操作的状态转换为失败
        return Promise.reject(result.data)
    },
    err=>{
        //判断响应状态码
        if(err.response.status === 401){
            // 401: 未登录或token过期
            const tokenStore = useTokenStore();
            const userInfoStore = useUserInfoStore();
            tokenStore.removeToken();
            userInfoStore.removeInfo();
            ElMessage.error('请先登录')
            router.push('/login')
        } else if(err.response.status === 403){
            // 403: 无权限操作
            ElMessage.error('无权限操作，请联系管理员')
        } else {
            ElMessage.error('服务异常');
        }
        return Promise.reject(err);//异步的状态转化成失败的状态
    }
)

export default instance;