<template>
  <el-container class="layout-container">
    <!-- 头部导航栏 -->
    <el-header class="header">
      <div class="container">
        <div class="nav-container">
          <div class="logo">助农商城</div>
          <ul class="nav-menu">
            <li v-for="item in navItems" :key="item.path" class="nav-item" :class="{ active: currentNav === item.path }"
              @click="handleNavClick(item.path)">
              {{ item.label }}
            </li>
          </ul>

          <!-- 用户登录状态区域 -->
          <div class="user-area">
            <!-- 未登录状态 -->
            <div v-if="!isLoggedIn" class="auth-buttons">
              <el-button type="primary" text class="login-btn" @click="handleLogin('login')">
                登录
              </el-button>
              <el-button type="primary" class="register-btn" @click="handleRegister('register')">
                注册
              </el-button>
            </div>

            <!-- 已登录状态 -->
            <div v-else class="user-info">
              <el-dropdown @command="handleCommand" trigger="hover">
                <span class="el-dropdown-link">
                  <el-avatar :size="32" :src="userInfoStore.info.userPic ? userInfoStore.info.userPic : avatar" />
                  <span class="username">{{ userInfoStore.info.username }}</span>
                  <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <!-- 根据角色显示不同的菜单项 -->
                    <template v-if="userRole === 'admin'">
                      <el-dropdown-item command="adminPanel">
                        <el-icon>
                          <Setting />
                        </el-icon>管理后台
                      </el-dropdown-item>
                      <el-dropdown-item command="profile">
                        <el-icon>
                          <User />
                        </el-icon>个人信息
                      </el-dropdown-item>
                      <el-dropdown-item command="password">
                        <el-icon>
                          <Lock />
                        </el-icon>修改密码
                      </el-dropdown-item>
                    </template>
                    
                    <template v-else-if="userRole === 'shop'">
                      <el-dropdown-item command="shopPanel">
                        <el-icon>
                          <Shop />
                        </el-icon>店铺管理
                      </el-dropdown-item>
                      <el-dropdown-item command="profile">
                        <el-icon>
                          <User />
                        </el-icon>店铺信息
                      </el-dropdown-item>
                      <el-dropdown-item command="password">
                        <el-icon>
                          <Lock />
                        </el-icon>修改密码
                      </el-dropdown-item>
                    </template>
                    
                    <template v-else>
                      <el-dropdown-item command="profile">
                        <el-icon>
                          <User />
                        </el-icon>个人信息
                      </el-dropdown-item>
                      <el-dropdown-item command="password">
                        <el-icon>
                          <Lock />
                        </el-icon>修改密码
                      </el-dropdown-item>
                      <el-dropdown-item command="balance">
                        <el-icon>
                          <Wallet />
                        </el-icon>余额/充值
                      </el-dropdown-item>
                    </template>
                    
                    <el-dropdown-item divided command="logout">
                      <el-icon>
                        <SwitchButton />
                      </el-icon>退出登录
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>
      </div>
    </el-header>

    <!-- 主内容区域 - 通过路由切换 -->
    <el-main class="main-content">
      <router-view />
    </el-main>
    <!-- 底部区域 -->
    <el-footer>

      <el-divider>Helping Farmer Mall</el-divider>
      <div style="text-align: center;padding-bottom: 50px;"><span class="footer">Farmer Mall ©2026 Created by zhy</span></div>
    </el-footer>

    <!-- AI聊天助手 -->
    <AiChat />
  </el-container>
</template>

<script setup>
import { ref, watch } from 'vue'
import AiChat from '@/components/AiChat.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowDown,
  User,
  Lock,
  Wallet,
  SwitchButton,
  Setting,
  Shop
} from '@element-plus/icons-vue'


import avatar from '@/assets/default.png'
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// 路由相关
const router = useRouter()
const route = useRoute()

// 响应式数据
const isLoggedIn = ref(false)
//route.path 是一个响应式对象（由 Vue Router 提供）的属性，而不是一个 ref
const currentNav = ref(route.path) // 直接使用路由路径

// 获取当前用户角色
const userRole = computed(() => userInfoStore.info?.role || 'user')

// 导航菜单数据 - 简化为直接使用路径
const navItems = computed(() => {
  const baseItems = [
    { path: '/home', label: '首页' },
    { path: '/products', label: '商品列表' }
  ]
  
  // 只有普通用户登录时才显示购物车、我的订单、个人中心
  if (isLoggedIn.value && userRole.value === 'user') {
    baseItems.push(
      { path: '/cart', label: '购物车' },
      { path: '/order', label: '我的订单' },
      { path: '/userCenter', label: '个人中心' }
    )
  }
  
  return baseItems
})

import { userInfoService } from '@/api/user'
import useUserInfoStore from '@/stores/userInfo'
import { useTokenStore } from '@/stores/token'
const tokenStore = useTokenStore();
const userInfoStore = useUserInfoStore();

import { onBeforeMount } from 'vue'

onBeforeMount(() => {
  if (tokenStore.token) {
    isLoggedIn.value = true;
    // 如果刷新页面或首次进入，Pinia 里没有用户信息时兜底拉取一次
    if (!userInfoStore.info || Object.keys(userInfoStore.info).length === 0) {
      getUserInfo();
    }
  } else {
    isLoggedIn.value = false;
    // 不要强制跳转，让路由守卫处理
    // 如果当前页面需要登录，路由守卫会自动跳转到登录页
  }
})
//调用函数获取用户详细信息
const getUserInfo = async () => {
  //调用接口
  let result = await userInfoService();
  //数据存储到pinia中
  userInfoStore.setInfo(result.data);
}
// 方法定义
const handleNavClick = (path) => {
  if (path.startsWith('/')) {
    // 如果是有效路径，直接跳转
    router.push(path)
  } else {
    // 处理其他功能项
    switch (path) {
      case 'orders':
        ElMessage.info('我的订单功能开发中')
        break
    }
  }
}
//route.path 是一个响应式对象（由 Vue Router 提供）的属性，而不是一个 ref
// watch是在组件挂载后设置的 watch不需要也可以，在点击的导航栏后自己切换currentNav
// 监听路由变化，直接更新当前导航
watch(() => route.path, (newPath) => {
  // 处理二级路由，匹配父路由
  const matchedNav = navItems.value.find(item => newPath.startsWith(item.path))
  if (matchedNav) {
    currentNav.value = matchedNav.path
  } else {
    currentNav.value = newPath
  }
}, { immediate: true })
const handleLogin = (type) => {
  router.push(`/login/${type}`)
}

const handleRegister = (type) => {
  router.push(`/login/${type}`)
}

const handleCommand = (command) => {
  const role = userInfoStore.info?.role || 'user'
  
  switch (command) {
    case 'adminPanel':
      router.push('/admin')
      break
    case 'shopPanel':
      router.push('/shop-manage')
      break
    case 'profile':
      // 根据角色跳转到对应的个人信息页面
      if (role === 'admin') {
        router.push('/admin/userInfo')
      } else if (role === 'shop') {
        router.push('/shop-manage/userInfo')
      } else {
        router.push('/userInfo')
      }
      break
    case 'password':
      // 根据角色跳转到对应的修改密码页面
      if (role === 'admin') {
        router.push('/admin/resetPassword')
      } else if (role === 'shop') {
        router.push('/shop-manage/resetPassword')
      } else {
        router.push('/resetPassword')
      }
      break
    case 'balance':
      router.push('/rechange')
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '退出登录', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        isLoggedIn.value = false
        userInfoStore.removeInfo()
        tokenStore.removeToken()
        ElMessage.success('已退出登录')
        router.push('/login')
      }).catch(() => {
        ElMessage.info('取消退出')
      })
      break
  }
}

</script>

<style scoped>
/* 布局容器 */
.layout-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 头部导航栏样式 */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0;
  height: 64px;
  display: flex;
  align-items: center;
}

.container {
  width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

/* Logo 样式 */
.logo {
  font-size: 28px;
  font-weight: 800;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.4);
}

/* 导航菜单样式 */
.nav-menu {
  display: flex;
  list-style: none;
  align-items: center;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin: 0 20px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 12px 16px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.nav-item:hover::before {
  left: 100%;
}

.nav-item:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.nav-item.active {
  color: white;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 3px;
  background: linear-gradient(90deg, #f093fb, #f5576c);
  border-radius: 2px;
}

/* 用户区域容器 */
.user-area {
  display: flex;
  align-items: center;
}

/* 未登录状态 - 登录注册按钮 */
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.login-btn {
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  background: rgba(255, 255, 255, 0.1) !important;
  font-weight: 500;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.register-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
  border: none !important;
  color: white !important;
  font-weight: 600;
  transition: all 0.3s ease;
}

.register-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4);
}

/* 已登录状态 - 用户信息 */
.user-info {
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 25px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.el-dropdown-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.username {
  margin: 0 12px;
  color: white;
  font-weight: 500;
  font-size: 14px;
}

.el-icon--right {
  margin-left: 6px;
  color: white;
  transition: transform 0.3s ease;
}

.el-dropdown:hover .el-icon--right {
  transform: rotate(180deg);
}

/* 主内容区域 */
.main-content {
  padding: 20px 0;
  background-color: #f5f7fa;
  min-height: calc(100vh - 64px);
}

/* Element Plus 下拉菜单自定义样式 */
:deep(.el-dropdown-menu) {
  border: none;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  background: white;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  font-size: 14px;
  transition: all 0.3s ease;
  color: #606266;
}

:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 8px;
  font-size: 16px;
}

:deep(.el-dropdown-menu__item:hover) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateX(5px);
}

:deep(.el-dropdown-menu__item--divided) {
  border-top: 1px solid #e6e8eb;
}

:deep(.el-dropdown-menu__item--divided:hover) {
  border-top-color: transparent;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .container {
    width: 100%;
    max-width: 1200px;
  }
}

@media (max-width: 992px) {
  .nav-item {
    margin: 0 12px;
    padding: 10px 14px;
    font-size: 14px;
  }

  .logo {
    font-size: 24px;
  }
}

@media (max-width: 768px) {
  .nav-container {
    flex-wrap: wrap;
    height: auto;
    padding: 10px 0;
  }

  .nav-menu {
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: 10px;
  }

  .nav-item {
    margin: 0 8px;
    padding: 8px 12px;
    font-size: 13px;
  }

  .logo {
    font-size: 20px;
  }

  .username {
    display: none;
  }
}

@media (max-width: 576px) {
  .auth-buttons {
    flex-direction: column;
    gap: 8px;
  }
}

.footer {
  color: #878c8d;
  font-size: 20px;
}
</style>