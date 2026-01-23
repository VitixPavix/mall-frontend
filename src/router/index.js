import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

//定义路由关系
const routes = [
  { 
    path: '/login/:type?', 
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/',
    component: () => import('@/views/index/Layout.vue'),
    redirect: '/home',
    children: [
      { path: '/home', component: () => import('@/views/index/Home.vue') },
      { path: '/products', component: () => import('@/views/index/ProductList.vue') },
      { path: '/product/:id', component: () => import('@/views/index/ProductDetail.vue') },
      { path: '/shop/:id', component: () => import('@/views/index/ShopDetail.vue') },
      { path: '/cart', component: () => import('@/views/index/Cart.vue') },
      { path: '/checkout', component: () => import('@/views/index/Checkout.vue') },
      { path: '/order', component: () => import('@/views/index/Order.vue') },
      { path: '/order/detail', component: () => import('@/views/index/OrderDetail.vue') },
      { path: '/userInfo', component: () => import('@/views/user/UserInfo.vue') },
      { path: '/resetPassword', component: () => import('@/views/user/UserResetPassword.vue') },
      { path: '/rechange', component: () => import('@/views/user/UserRechange.vue') },
      {
        path: '/userCenter',
        component: () => import('@/views/index/UserCenter.vue'),
        redirect: '/userCenter/address',
        children: [
          { path: 'address', component: () => import('@/views/index/Address.vue') },
          { path: 'productCollection', component: () => import('@/views/index/ProductCollection.vue') },
          { path: 'browsingHistory', component: () => import('@/views/index/BrowsingHistory.vue') },
          { path: 'shopCollection', component: () => import('@/views/index/ShopCollection.vue') }
        ]
      }
    ]
  },
  {
    path: '/shop-manage', 
    component: () => import('@/views/shop/ControlPanel.vue'), 
    redirect: '/shop-manage/home', 
    children: [
      { path: 'home', component: () => import('@/views/shop/Home.vue') },
      { path: 'product/info', component: () => import('@/views/shop/ProductInfo.vue') },
      { path: 'order/list', component: () => import('@/views/shop/OrderList.vue') },
      { path: 'order/detail', component: () => import('@/views/shop/OrderDetail.vue') },
      { path: 'userInfo', component: () => import('@/views/shop/UserInfo.vue') },
      { path: 'resetPassword', component: () => import('@/views/shop/UserResetPassword.vue') },
    ]
  },
  {
    path: '/admin', 
    component: () => import('@/views/admin/ControlPanel.vue'), 
    redirect: '/admin/home', 
    children: [
      { path: 'home', component: () => import('@/views/admin/Home.vue') },
      { path: 'admin', component: () => import('@/views/admin/AdminManagement.vue') },
      { path: 'user', component: () => import('@/views/admin/UserManagement.vue') },
      { path: 'shopDetail', component: () => import('@/views/admin/ShopManagement.vue') },
      { path: 'product/info', component: () => import('@/views/admin/ProductInfo.vue') },
      { path: 'product/category', component: () => import('@/views/admin/CategoryInfo.vue') },
      { path: 'product/collection', component: () => import('@/views/admin/ProductCollectionInfo.vue') },
      { path: 'product/browsingRecord', component: () => import('@/views/admin/BrowsingRecordInfo.vue') },
      { path: 'address', component: () => import('@/views/admin/AddressInfo.vue') },
      { path: 'cart', component: () => import('@/views/admin/CartInfo.vue') },
      { path: 'order/list', component: () => import('@/views/admin/OrderInfo.vue') },
      { path: 'order/detail', component: () => import('@/views/admin/OrderDetail.vue') },
      { path: 'shop-favorite', component: () => import('@/views/admin/ShopCollectionInfo.vue') },
      { path: 'marketing/ad', component: () => import('@/views/admin/AdInfo.vue') },
      { path: 'marketing/carousel', component: () => import('@/views/admin/CarouselInfo.vue') },
      { path: 'userInfo', component: () => import('@/views/admin/UserInfo.vue') },
      { path: 'resetPassword', component: () => import('@/views/admin/UserResetPassword.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})

import { useTokenStore } from '@/stores/token'
import useUserInfoStore from '@/stores/userInfo'
//路由守卫
router.beforeEach((to, from, next) => {
  const tokenStore = useTokenStore()
  const userInfoStore = useUserInfoStore()

  // 白名单路由（无需登录即可访问）
  const isWhiteList = (path) => {
    const whiteListPaths = ['/login', '/home', '/products']
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
    if (isWhiteList(to.path) || to.path.startsWith('/login')) {
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
      next('/login')
    }
  }
})



export default router