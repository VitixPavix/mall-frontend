<template>
  <el-container class="panel-container">
    <!-- 左侧菜单栏 -->
    <el-aside width="220px" class="sidebar">
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        background-color="#161a18"
        text-color="#fff"
        active-text-color="#cfec4e"
        router
      >
        <el-menu-item index="/admin/home">
          <el-icon><House /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item 
          index="/admin/admin" 
          v-if="isSuperAdmin"
        >
          <el-icon><UserFilled /></el-icon>
          <span>管理员管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/user">
          <el-icon><User /></el-icon>
          <span>用户</span>
        </el-menu-item>
        <el-menu-item index="/admin/shopDetail">
          <el-icon><Shop /></el-icon>
          <span>店铺</span>
        </el-menu-item>
        <el-sub-menu index="product">
          <template #title>
            <el-icon><Box /></el-icon>
            <span>商品管理</span>
          </template>
          <el-menu-item index="/admin/product/category">商品分类</el-menu-item>
          <el-menu-item index="/admin/product/info">商品信息</el-menu-item>
          <el-menu-item index="/admin/product/collection">商品收藏</el-menu-item>
          <el-menu-item index="/admin/product/browsingRecord">商品浏览历史</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/admin/address">
          <el-icon><Location /></el-icon>
          <span>收货地址</span>
        </el-menu-item>
        <el-menu-item index="/admin/cart">
          <el-icon><ShoppingCart /></el-icon>
          <span>购物车</span>
        </el-menu-item>
        <el-sub-menu index="order">
          <template #title>
            <el-icon><ShoppingCartFull /></el-icon>
            <span>订单管理</span>
          </template>
          <el-menu-item index="/admin/order/list">商品订单</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/admin/shop-favorite">
          <el-icon><Star /></el-icon>
          <span>店铺收藏</span>
        </el-menu-item>
        <el-sub-menu index="marketing">
          <template #title>
            <el-icon><Promotion /></el-icon>
            <span>营销管理</span>
          </template>
          <el-menu-item index="/admin/marketing/ad">广告位</el-menu-item>
          <el-menu-item index="/admin/marketing/carousel">轮播图</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <!-- 右侧主体区域 -->
    <el-container class="main-wrapper">
      <!-- 顶部导航栏 -->
      <el-header class="top-header">
        <div class="back-home-btn" @click="goToMall">
          <el-icon class="back-icon"><ShoppingBag /></el-icon>
          <span class="back-text">回到商城</span>
        </div>
        <div class="user-dropdown-wrapper">
          <el-dropdown @command="handleCommand" trigger="hover">
            <span class="user-dropdown-trigger">
              <el-avatar :size="32" :src="avatarUrl || defaultAvatar" class="user-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="user-name">{{ username }}</span>
              <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>个人信息
                </el-dropdown-item>
                <el-dropdown-item command="password">
                  <el-icon><Lock /></el-icon>修改密码
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容展示区 -->
      <el-main class="content-area">
        <router-view />
      </el-main>

      <!-- 底部信息栏 -->
      <el-footer class="page-footer">
        <el-divider>Helping Farmer Mall</el-divider>
        <div class="footer-text">
          Farmer Mall ©2025 Created by zhy | 玉林师范学院
        </div>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ElContainer,
  ElAside,
  ElHeader,
  ElMain,
  ElFooter,
  ElMenu,
  ElMenuItem,
  ElSubMenu,
  ElAvatar,
  ElDivider,
  ElIcon,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem
} from 'element-plus'
import { 
  House, 
  Box, 
  ShoppingCart,
  ShoppingCartFull,
  ShoppingBag,
  User,
  UserFilled,
  Shop,
  Location,
  Star,
  Promotion,
  ArrowDown,
  Lock,
  SwitchButton
} from '@element-plus/icons-vue'
import useUserInfoStore from '@/stores/userInfo.js'
import { useTokenStore } from '@/stores/token.js'
import defaultAvatar from '@/assets/default.png'
// 如果有管理员信息接口，可以在这里导入
// import { adminInfoService } from '@/api/admin'

const router = useRouter()
const route = useRoute()
const userInfoStore = useUserInfoStore()
const tokenStore = useTokenStore()

// 根据当前路由设置活跃菜单项
const activeMenu = ref(route.path)

// 从 Pinia 中衍生出"实时"的管理员名和头像
const username = computed(() => userInfoStore.info.username || userInfoStore.info.nickname || '管理员')
const avatarUrl = computed(() => userInfoStore.info.userPic || '')

// 判断是否为超级管理员
const isSuperAdmin = computed(() => {
  return userInfoStore.info.id === 1
})

// 如果需要获取管理员信息，可以在这里添加
// const loadAdminInfo = async () => {
//   try {
//     const res = await adminInfoService()
//     userInfoStore.setInfo(res.data)
//   } catch (error) {
//     console.error('获取管理员信息失败:', error)
//   }
// }

// 监听路由变化，更新活跃菜单项
watch(() => route.path, (newPath) => {
  activeMenu.value = newPath
}, { immediate: true })

onMounted(() => {
  // 没有 token 直接回首页，避免未登录访问控制台
  if (!tokenStore.token) {
    router.push('/home')
    return
  }

  // 如果 Pinia 中还没有用户信息，可以在这里拉取管理员信息
  // if (!userInfoStore.info || Object.keys(userInfoStore.info).length === 0) {
  //   loadAdminInfo()
  // }
})

const goToMall = () => {
  router.push('/home')
}

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/admin/userInfo')
      break
    case 'password':
      router.push('/admin/resetPassword')
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '退出登录', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        userInfoStore.removeInfo()
        tokenStore.removeToken()
        ElMessage.success('已退出登录')
        router.push('/home')
      }).catch(() => {
        ElMessage.info('取消退出')
      })
      break
  }
}
</script>

<style scoped>
/* ==================== 布局容器 ==================== */
/* 主容器：固定定位，紧贴浏览器边缘，全屏显示 */
.panel-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}

/* Element Plus 容器组件样式重置 */
:deep(.el-container),
:deep(.el-aside) {
  margin: 0;
  padding: 0;
}

/* ==================== 左侧菜单栏 ==================== */
/* 侧边栏容器：深色背景，隐藏滚动条但保留滚动功能 */
.sidebar {
  background-color: #000301;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar::-webkit-scrollbar {
  display: none; /* Chrome/Safari 隐藏滚动条 */
}

/* 菜单列表：深色主题，圆角菜单项 */
.sidebar-menu {
  height: 100%;
  background-color: #161a18;
  border-right: none;
  padding-top: 8px; /* 顶部留出间距 */
}

/* 菜单项基础样式 */
.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  color: rgba(255, 255, 255, 0.9);
  margin: 4px 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

/* 菜单项悬停效果 */
.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background-color: rgba(207, 236, 78, 0.2);
  color: #cfec4e;
}

/* 菜单项激活状态 */
.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #04520c;
  color: #fff;
  font-weight: 600;
}

/* 子菜单项样式 */
.sidebar-menu :deep(.el-sub-menu .el-menu-item) {
  background-color: rgba(0, 0, 0, 0.2);
  margin: 2px 8px 2px 20px;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item:hover) {
  background-color: rgba(207, 236, 78, 0.3);
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item.is-active) {
  background-color: #24c104;
}

/* ==================== 顶部导航栏 ==================== */
/* 顶部导航：白色背景，添加底部边框统一视觉 */
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

/* 返回首页按钮 */
.back-home-btn {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.back-home-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-icon {
  margin-right: 8px;
  font-size: 20px;
  color: #000;
  transition: color 0.3s ease;
}

.back-home-btn:hover .back-icon {
  color: #24c104;
}

.back-text {
  font-weight: 600;
  font-size: 16px;
  color: #000;
  transition: color 0.3s ease;
}

.back-home-btn:hover .back-text {
  color: #24c104;
}

/* 用户下拉菜单容器 */
.user-dropdown-wrapper {
  display: flex;
  align-items: center;
}

/* 用户下拉菜单触发器 */
.user-dropdown-trigger {
  outline: none !important;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 25px;
  transition: all 0.3s ease;
  background: #ffffff;
  border: 1px solid transparent;
}

.user-dropdown-trigger:hover {
  background-color: rgba(0, 0, 0, 0.02);
  border-color: rgba(36, 193, 4, 0.2);
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #000;
}

.dropdown-arrow {
  margin-left: 4px;
  font-size: 12px;
  color: #000;
  transition: transform 0.3s ease;
}

.user-dropdown-wrapper:hover .dropdown-arrow {
  transform: rotate(180deg);
}

/* ==================== 内容展示区 ==================== */
/* 主内容区域：浅灰背景，可滚动 */
.content-area {
  background-color: #f5f7fa;
  padding: 24px;
  min-height: calc(100vh - 64px - 120px);
  overflow-y: auto;
}

/* ==================== 底部信息栏 ==================== */
/* 页脚容器：白色背景，分隔线 */
.page-footer {
  background-color: #fff;
  border-top: 1px solid #e8e8e8;
  padding: 20px 0;
  min-height: 80px;
}

.page-footer :deep(.el-divider) {
  margin: 10px 0;
  border-color: #e8e8e8;
}

.page-footer :deep(.el-divider__text) {
  background-color: #fff;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.footer-text {
  text-align: center;
  color: #878c8d;
  font-size: 13px;
  line-height: 1.6;
  padding-bottom: 10px;
}

/* ==================== 下拉菜单样式 ==================== */
/* 下拉菜单容器：圆角、阴影 */
:deep(.el-dropdown-menu) {
  border: none;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  background: white;
  margin-top: 8px;
}

/* 下拉菜单项 */
:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  font-size: 14px;
  color: #606266;
  transition: all 0.3s ease;
}

:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 8px;
  font-size: 16px;
}

/* 下拉菜单项悬停：绿色渐变背景 */
:deep(.el-dropdown-menu__item:hover) {
  background: linear-gradient(135deg, #cfec4e 0%, #24c104 100%);
  color: white;
  transform: translateX(5px);
}

/* 分隔线样式 */
:deep(.el-dropdown-menu__item--divided) {
  border-top: 1px solid #e6e8eb;
}

:deep(.el-dropdown-menu__item--divided:hover) {
  border-top-color: transparent;
}

/* ==================== 响应式设计 ==================== */
/* 中等屏幕适配（平板） */
@media (max-width: 992px) {
  .top-header {
    padding: 0 20px;
  }

  .content-area {
    padding: 20px;
  }

  .back-text {
    font-size: 15px;
  }
}

/* 小屏幕适配（手机） */
@media (max-width: 768px) {
  .sidebar {
    width: 200px !important;
  }

  .top-header {
    padding: 0 16px;
    height: 56px;
  }

  .content-area {
    padding: 16px;
    min-height: calc(100vh - 56px - 100px);
  }

  .back-text {
    font-size: 14px;
  }

  .user-name {
    font-size: 13px;
  }

  .page-footer {
    padding: 16px 0;
    min-height: 70px;
  }

  .footer-text {
    font-size: 12px;
    padding: 0 16px 10px;
  }
}

/* 超小屏幕适配 */
@media (max-width: 576px) {
  .back-home-btn {
    padding: 6px 12px;
  }

  .back-icon {
    font-size: 18px;
    margin-right: 6px;
  }

  .back-text {
    font-size: 13px;
  }

  .user-dropdown-trigger {
    padding: 4px 12px;
  }

  .user-name {
    display: none; /* 超小屏幕隐藏用户名，只显示头像 */
  }
}
</style>

