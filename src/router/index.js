import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

//定义路由关系
const routes = [
  { 
    path: '/homepage',
    component: () => import('@/views/homepage/Home.vue'),
    meta: { title: '惠农商城 - 项目介绍', icon: '/项目.svg' }
  },
  { 
    path: '/login/:type?', 
    component: () => import('@/views/Login.vue'),
    meta: { title: '用户登录 - 惠农商城', icon: '/商店.svg' }
  },
  { 
    path: '/ai-login/:type?', 
    component: () => import('@/views/ai/AiLogin.vue'),
    meta: { title: 'AI 对话登录', icon: '/在线客服.svg' }
  },
  {
    path: '/ai-chat',
    component: () => import('@/views/ai/AiConversation.vue'),
    meta: { title: 'AI 智能对话', icon: '/在线客服.svg' }
  },
  {
    path: '/',
    component: () => import('@/views/index/Layout.vue'),
    redirect: '/homepage',
    meta: { title: '惠农商城', icon: '/商店.svg' },
    children: [
      { path: '/home', component: () => import('@/views/index/Home.vue'), meta: { title: '商城首页 - 惠农商城', icon: '/商店.svg' } },
      { path: '/products', component: () => import('@/views/index/ProductList.vue'), meta: { title: '商品列表 - 惠农商城', icon: '/商店.svg' } },
      { path: '/product/:id', component: () => import('@/views/index/ProductDetail.vue'), meta: { title: '商品详情 - 惠农商城', icon: '/商店.svg' } },
      { path: '/shop/:id', component: () => import('@/views/index/ShopDetail.vue'), meta: { title: '店铺详情 - 惠农商城', icon: '/商店.svg' } },
      { path: '/cart', component: () => import('@/views/index/Cart.vue'), meta: { title: '购物车 - 惠农商城', icon: '/商店.svg' } },
      { path: '/checkout', component: () => import('@/views/index/Checkout.vue'), meta: { title: '订单结算 - 惠农商城', icon: '/商店.svg' } },
      { path: '/order', component: () => import('@/views/index/Order.vue'), meta: { title: '我的订单 - 惠农商城', icon: '/商店.svg' } },
      { path: '/order/detail', component: () => import('@/views/index/OrderDetail.vue'), meta: { title: '订单详情 - 惠农商城', icon: '/商店.svg' } },
      { path: '/userInfo', component: () => import('@/views/user/UserInfo.vue'), meta: { title: '个人信息 - 惠农商城', icon: '/商店.svg' } },
      { path: '/resetPassword', component: () => import('@/views/user/UserResetPassword.vue'), meta: { title: '修改密码 - 惠农商城', icon: '/商店.svg' } },
      { path: '/rechange', component: () => import('@/views/user/UserRechange.vue'), meta: { title: '账户充值 - 惠农商城', icon: '/商店.svg' } },
      {
        path: '/userCenter',
        component: () => import('@/views/index/UserCenter.vue'),
        redirect: '/userCenter/address',
        meta: { title: '个人中心 - 惠农商城', icon: '/商店.svg' },
        children: [
          { path: 'address', component: () => import('@/views/index/Address.vue'), meta: { title: '收货地址 - 惠农商城', icon: '/商店.svg' } },
          { path: 'productCollection', component: () => import('@/views/index/ProductCollection.vue'), meta: { title: '商品收藏 - 惠农商城', icon: '/商店.svg' } },
          { path: 'browsingHistory', component: () => import('@/views/index/BrowsingHistory.vue'), meta: { title: '浏览历史 - 惠农商城', icon: '/商店.svg' } },
          { path: 'shopCollection', component: () => import('@/views/index/ShopCollection.vue'), meta: { title: '店铺收藏 - 惠农商城', icon: '/商店.svg' } }
        ]
      }
    ]
  },
  {
    path: '/shop-manage', 
    component: () => import('@/views/shop/ControlPanel.vue'), 
    redirect: '/shop-manage/home',
    meta: { title: '商家管理 - 惠农商城', icon: '/商店.svg' },
    children: [
      { path: 'home', component: () => import('@/views/shop/Home.vue'), meta: { title: '商家首页 - 惠农商城', icon: '/商店.svg' } },
      { path: 'product/info', component: () => import('@/views/shop/ProductInfo.vue'), meta: { title: '商品管理 - 惠农商城', icon: '/商店.svg' } },
      { path: 'order/list', component: () => import('@/views/shop/OrderList.vue'), meta: { title: '订单管理 - 惠农商城', icon: '/商店.svg' } },
      { path: 'order/detail', component: () => import('@/views/shop/OrderDetail.vue'), meta: { title: '订单详情 - 惠农商城', icon: '/商店.svg' } },
      { path: 'userInfo', component: () => import('@/views/shop/UserInfo.vue'), meta: { title: '店铺信息 - 惠农商城', icon: '/商店.svg' } },
      { path: 'resetPassword', component: () => import('@/views/shop/UserResetPassword.vue'), meta: { title: '修改密码 - 惠农商城', icon: '/商店.svg' } },
    ]
  },
  {
    path: '/admin', 
    component: () => import('@/views/admin/ControlPanel.vue'), 
    redirect: '/admin/home',
    meta: { title: '管理后台 - 惠农商城', icon: '/商店.svg' },
    children: [
      { path: 'home', component: () => import('@/views/admin/Home.vue'), meta: { title: '管理首页 - 惠农商城', icon: '/商店.svg' } },
      { path: 'admin', component: () => import('@/views/admin/AdminManagement.vue'), meta: { title: '管理员管理 - 惠农商城', icon: '/商店.svg' } },
      { path: 'user', component: () => import('@/views/admin/UserManagement.vue'), meta: { title: '用户管理 - 惠农商城', icon: '/商店.svg' } },
      { path: 'shopDetail', component: () => import('@/views/admin/ShopManagement.vue'), meta: { title: '商家管理 - 惠农商城', icon: '/商店.svg' } },
      { path: 'product/info', component: () => import('@/views/admin/ProductInfo.vue'), meta: { title: '商品管理 - 惠农商城', icon: '/商店.svg' } },
      { path: 'product/category', component: () => import('@/views/admin/CategoryInfo.vue'), meta: { title: '分类管理 - 惠农商城', icon: '/商店.svg' } },
      { path: 'product/collection', component: () => import('@/views/admin/ProductCollectionInfo.vue'), meta: { title: '商品收藏管理 - 惠农商城', icon: '/商店.svg' } },
      { path: 'product/browsingRecord', component: () => import('@/views/admin/BrowsingRecordInfo.vue'), meta: { title: '浏览记录管理 - 惠农商城', icon: '/商店.svg' } },
      { path: 'address', component: () => import('@/views/admin/AddressInfo.vue'), meta: { title: '地址管理 - 惠农商城', icon: '/商店.svg' } },
      { path: 'cart', component: () => import('@/views/admin/CartInfo.vue'), meta: { title: '购物车管理 - 惠农商城', icon: '/商店.svg' } },
      { path: 'order/list', component: () => import('@/views/admin/OrderInfo.vue'), meta: { title: '订单管理 - 惠农商城', icon: '/商店.svg' } },
      { path: 'order/detail', component: () => import('@/views/admin/OrderDetail.vue'), meta: { title: '订单详情 - 惠农商城', icon: '/商店.svg' } },
      { path: 'shop-favorite', component: () => import('@/views/admin/ShopCollectionInfo.vue'), meta: { title: '店铺收藏管理 - 惠农商城', icon: '/商店.svg' } },
      { path: 'marketing/ad', component: () => import('@/views/admin/AdInfo.vue'), meta: { title: '广告管理 - 惠农商城', icon: '/商店.svg' } },
      { path: 'marketing/carousel', component: () => import('@/views/admin/CarouselInfo.vue'), meta: { title: '轮播图管理 - 惠农商城', icon: '/商店.svg' } },
      { path: 'userInfo', component: () => import('@/views/admin/UserInfo.vue'), meta: { title: '个人信息 - 惠农商城', icon: '/商店.svg' } },
      { path: 'resetPassword', component: () => import('@/views/admin/UserResetPassword.vue'), meta: { title: '修改密码 - 惠农商城', icon: '/商店.svg' } }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})

import { useTokenStore } from '@/stores/token'
import useUserInfoStore from '@/stores/userInfo'

// 动态更新页面标题和图标
const updatePageMeta = (to) => {
  // 更新标题
  if (to.meta && to.meta.title) {
    document.title = to.meta.title
  } else {
    document.title = '惠农商城'
  }

  // 更新图标
  if (to.meta && to.meta.icon) {
    let link = document.querySelector("link[rel*='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = to.meta.icon
  }
}

//路由守卫
router.beforeEach((to, from, next) => {
  const tokenStore = useTokenStore()
  const userInfoStore = useUserInfoStore()

  // 更新页面标题和图标
  updatePageMeta(to)

  // 白名单路由（无需登录即可访问）
  const isWhiteList = (path) => {
    const whiteListPaths = ['/login', '/ai-login', '/homepage', '/home', '/products', '/ai-chat']
    const whiteListPrefixes = ['/product/', '/shop/']
    
    return whiteListPaths.includes(path) || 
           whiteListPrefixes.some(prefix => path.startsWith(prefix))
  }

  // 检查 token 是否存在且未过期
  if (tokenStore.token && !tokenStore.isTokenExpired()) {
    // 已登录
    // 如果访问登录页，则根据角色重定向（但允许在登录页内部切换模式）
    if (to.path.startsWith('/login') && from.path.startsWith('/login')) {
      // 从登录页切换到注册页，或反之，允许通过
      next()
      return
    } else if (to.path.startsWith('/login')) {
      // 从其他页面访问登录页，重定向到首页
      const role = userInfoStore.info.role
      if (role === 'admin') {
        next('/admin')
      } else if (role === 'shop') {
        next('/shop-manage')
      } else {
        next('/home')
      }
      return
    }

    // AI登录页处理：已登录用户访问AI登录页时，重定向到AI聊天页
    if (to.path.startsWith('/ai-login') && from.path.startsWith('/ai-login')) {
      next()
      return
    } else if (to.path.startsWith('/ai-login')) {
      next('/ai-chat')
      return
    }

    // 角色权限检查
    const userRole = userInfoStore.info.role
    if (to.path.startsWith('/admin') && userRole !== 'admin') {
      ElMessage.error('无权访问管理员页面')
      next('/home')
      return
    } else if (to.path.startsWith('/shop-manage') && userRole !== 'shop') {
      ElMessage.error('无权访问店铺管理页面')
      next('/home')
      return
    }
    
    // 用户角色不能访问其他用户的个人页面
    if (userRole === 'user' && (to.path.startsWith('/admin') || to.path.startsWith('/shop-manage'))) {
      ElMessage.error('无权访问该页面')
      next('/home')
      return
    }

    // 允许访问
    next()
  } else {
    // 未登录或token过期
    if (isWhiteList(to.path) || to.path.startsWith('/login') || to.path.startsWith('/ai-login')) {
      // 如果token过期但访问的是白名单页面或登录页，清除token和用户信息
      if (tokenStore.token && tokenStore.isTokenExpired()) {
        tokenStore.removeToken()
        userInfoStore.removeInfo()
      }
      next()
    } else {
      // 需要登录才能访问的页面
      if (tokenStore.token && tokenStore.isTokenExpired()) {
        tokenStore.removeToken()
        userInfoStore.removeInfo()
        ElMessage.warning('登录已过期，请重新登录')
      }
      // AI聊天页面跳转到AI登录页，其他页面跳转到商城登录页
      if (to.path === '/ai-chat') {
        next('/ai-login')
      } else {
        next('/login')
      }
    }
  }
})



export default router