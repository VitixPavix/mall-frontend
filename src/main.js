import { createApp } from 'vue'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-persistedstate-plugin'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useTokenStore } from '@/stores/token'
import useUserInfoStore from '@/stores/userInfo'

const app = createApp(App)


const pinia = createPinia()
pinia.use(createPersistedState()) 
app.use(pinia)
app.use(router)
app.use(ElementPlus, { locale: zhCn })

// 应用启动时检查token是否过期
const tokenStore = useTokenStore()
const userInfoStore = useUserInfoStore()
if(tokenStore.clearExpiredToken()){
    // 如果token已过期并被清除，同时清除用户信息
    userInfoStore.removeInfo()
}

app.mount('#app')
