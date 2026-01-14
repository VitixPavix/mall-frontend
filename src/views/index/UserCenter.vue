<template>
  <div class="user-center-container">
    <div class="container">
      <div class="center-layout">
        <!-- 左侧选项栏 -->
        <aside class="sidebar">
          <div class="sidebar-header">
            <el-icon><User /></el-icon>
            <span>个人中心</span>
          </div>
          
          <el-menu
            :default-active="activeMenu"
            class="sidebar-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="address">
              <el-icon><Location /></el-icon>
              <span>收货地址</span>
            </el-menu-item>
            
            <el-menu-item index="productCollection">
              <el-icon><Star /></el-icon>
              <span>商品收藏</span>
            </el-menu-item>
            
            <el-menu-item index="browsingHistory">
              <el-icon><View /></el-icon>
              <span>浏览历史</span>
            </el-menu-item>
            
            <el-menu-item index="shopCollection">
              <el-icon><Shop /></el-icon>
              <span>关注店铺</span>
            </el-menu-item>
          </el-menu>
        </aside>

        <!-- 右侧内容区域 -->
        <main class="content-area">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Location, Star, View, Shop } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const activeMenu = ref('address')

// 监听路由变化更新激活菜单
watch(() => route.path, (newPath) => {
  if (newPath.includes('/userCenter/address')) {
    activeMenu.value = 'address'
  } else if (newPath.includes('/userCenter/productCollection')) {
    activeMenu.value = 'productCollection'
  } else if (newPath.includes('/userCenter/browsingHistory')) {
    activeMenu.value = 'browsingHistory'
  } else if (newPath.includes('/userCenter/shopCollection')) {
    activeMenu.value = 'shopCollection'
  }
}, { immediate: true })

const handleMenuSelect = (index) => {
  router.push(`/userCenter/${index}`)
}
</script>

<style scoped>
.user-center-container {
  min-height: calc(100vh - 64px);
  background-color: #f5f7fa;
  padding: 24px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.center-layout {
  display: flex;
  gap: 20px;
}

/* 左侧选项栏 */
.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  height: fit-content;
  position: sticky;
  top: 84px;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.sidebar-header .el-icon {
  font-size: 22px;
}

.sidebar-menu {
  border: none;
}

.sidebar-menu :deep(.el-menu-item) {
  height: 56px;
  line-height: 56px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
}

.sidebar-menu :deep(.el-menu-item .el-icon) {
  font-size: 18px;
  margin-right: 0;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background: linear-gradient(90deg, #f0f7ff 0%, #e6f4ff 100%);
  color: #667eea;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  position: relative;
}

.sidebar-menu :deep(.el-menu-item.is-active::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 60%;
  background: white;
  border-radius: 0 4px 4px 0;
}

/* 右侧内容区域 */
.content-area {
  flex: 1;
  min-width: 0;
}

/* 响应式 */
@media (max-width: 992px) {
  .center-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    position: static;
  }

  .sidebar-menu {
    display: flex;
    overflow-x: auto;
  }

  .sidebar-menu :deep(.el-menu-item) {
    flex-shrink: 0;
  }
}
</style>
