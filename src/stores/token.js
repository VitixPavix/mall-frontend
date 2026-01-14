//定义store
import {defineStore} from 'pinia'
import {ref} from 'vue'

/*
     第一个参数：名字，唯一性
    第二个参数：函数，函数的内部可以定义状态的所有内容

    返回值：函数

*/
export const useTokenStore = defineStore('token', ()=>{
    //定义状态的内容

    //1.响应式变量
    const token = ref('')
    // 存储token过期时间（时间戳）
    const tokenExpireTime = ref(null)

    //2.定义一个函数。修改token的值
    const setToken = (newToken, expireHours = 12)=>{
        token.value = newToken
        // 计算过期时间：当前时间 + 过期小时数
        tokenExpireTime.value = Date.now() + expireHours * 60 * 60 * 1000
    }

    //3.定义一个函数，移除token的值
    const removeToken = ()=>{
        token.value=''
        tokenExpireTime.value = null
    }

    //4.检查token是否过期
    const isTokenExpired = ()=>{
        if(!token.value || !tokenExpireTime.value){
            return true
        }
        // 如果当前时间大于过期时间，说明token已过期
        return Date.now() > tokenExpireTime.value
    }

    //5.清除过期的token
    const clearExpiredToken = ()=>{
        if(isTokenExpired()){
            removeToken()
            return true // 返回true表示已清除
        }
        return false // 返回false表示token未过期
    }

    return {
        token,
        tokenExpireTime,
        setToken,
        removeToken,
        isTokenExpired,
        clearExpiredToken
    }
},{
        persist:true//持久化存储
    });