<template>
  <div class="shop-detail-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-wrapper">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <div v-else-if="shopInfo" class="shop-content">
      <!-- 店铺头部 -->
      <div class="shop-header">
        <div class="shop-banner">
          <div class="banner-overlay"></div>
        </div>
        
        <div class="shop-info-card">
          <div class="container">
            <div class="shop-main-info">
              <div class="shop-avatar">
                <el-avatar :size="100" :src="shopInfo.userPic || defaultAvatar">
                  <el-icon><Shop /></el-icon>
                </el-avatar>
              </div>
              
              <div class="shop-details">
                <h1 class="shop-name">{{ shopInfo.shopName }}</h1>
                <div class="shop-stats">
                  <div class="stat-item">
                    <span class="stat-value">{{ productCount }}</span>
                    <span class="stat-label">商品</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ followCount }}</span>
                    <span class="stat-label">关注</span>
                  </div>
                </div>
              </div>

              <div class="shop-actions">
                <el-button
                  :type="isFollowing ? 'info' : 'primary'"
                  :icon="isFollowing ? StarFilled : Star"
                  @click="toggleFollow"
                >
                  {{ isFollowing ? '已关注' : '关注店铺' }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 店铺导航 -->
      <div class="shop-nav">
        <div class="container">
          <div class="nav-tabs">
            <div
              v-for="tab in tabs"
              :key="tab.value"
              :class="['nav-tab', { active: activeTab === tab.value }]"
              @click="handleTabChange(tab.value)"
            >
              {{ tab.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- 商品列表 -->
      <div class="shop-products">
        <div class="container">
          <!-- 筛选和排序 -->
          <div class="filter-bar">
            <div class="filter-left">
              <span class="result-count">共 {{ totalCount }} 件商品</span>
            </div>
            <div class="filter-right">
              <el-radio-group v-model="sortType" size="small" @change="handleSortChange">
                <el-radio-button label="default">综合</el-radio-button>
                <el-radio-button label="sales">销量</el-radio-button>
                <el-radio-button label="price_asc">价格↑</el-radio-button>
                <el-radio-button label="price_desc">价格↓</el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <!-- 商品网格 -->
          <div v-loading="productsLoading" class="products-grid">
            <el-empty v-if="productList.length === 0" description="该店铺暂无商品" />
            
            <div
              v-else
              v-for="product in productList"
              :key="product.id"
              class="product-card"
              @click="viewProduct(product.id)"
            >
              <div class="product-image">
                <img :src="product.coverImg || defaultImage" :alt="product.name" />
                <div v-if="product.stock === 0" class="stock-out-tag">已售罄</div>
              </div>
              <div class="product-info">
                <h3 class="product-name" :title="product.name">{{ product.name }}</h3>
                <div class="product-price">
                  <span class="current-price">¥{{ product.price }}</span>
                </div>
                <div class="product-meta">
                  <span class="sales">已售 {{ product.sales || 0 }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="totalCount > pageSize" class="pagination-wrapper">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[12, 24, 36, 48]"
              :total="totalCount"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handlePageSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 店铺不存在 -->
    <el-empty v-else description="店铺不存在" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Loading,
  Shop,
  Star,
  StarFilled
} from '@element-plus/icons-vue'
import { getShopInfoService } from '@/api/shop'
import { getCategoryListService } from '@/api/category'
import { getProductListService } from '@/api/product'
import {
  getShopCollectionListService,
  addShopCollectionService,
  deleteShopCollectionService
} from '@/api/shopCollection'
import { useTokenStore } from '@/stores/token'

const route = useRoute()
const router = useRouter()
const tokenStore = useTokenStore()

// 默认图片
const defaultAvatar = 'https://via.placeholder.com/100x100?text=Shop'
const defaultImage = 'https://via.placeholder.com/300x300?text=No+Image'

// 响应式数据
const loading = ref(false)
const productsLoading = ref(false)
const shopInfo = ref(null)
const productList = ref([])
const categories = ref([])
const activeTab = ref('all')
const sortType = ref('default')
const currentPage = ref(1)
const pageSize = ref(12)
const totalCount = ref(0)
const isFollowing = ref(false)
const collectionId = ref(null)
const followCount = ref(0)

// 店铺ID
const shopId = computed(() => parseInt(route.params.id || route.query.shopId))

// 标签页 - 动态生成
const tabs = computed(() => {
  const baseTabs = [{ label: '全部商品', value: 'all' }]
  const categoryTabs = categories.value.map(cat => ({
    label: cat.categoryName,
    value: cat.id.toString()
  }))
  return [...baseTabs, ...categoryTabs]
})

// 商品数量
const productCount = computed(() => totalCount.value)

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await getCategoryListService()
    if (res.code === 0) {
      categories.value = res.data || []
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 获取店铺信息
const fetchShopInfo = async () => {
  loading.value = true
  try {
    const res = await getShopInfoService(shopId.value)
    if (res.code === 0 && res.data) {
      shopInfo.value = res.data
      // 使用后端返回的粉丝数
      followCount.value = res.data.fansNum || 0
      
      // 检查关注状态
      if (tokenStore.token) {
        await checkFollowStatus()
      }
    } else {
      ElMessage.error(res.message || '获取店铺信息失败')
    }
  } catch (error) {
    console.error('获取店铺信息失败:', error)
    ElMessage.error('获取店铺信息失败')
  } finally {
    loading.value = false
  }
}

// 获取商品列表
const fetchProducts = async () => {
  productsLoading.value = true
  try {
    const params = {
      createUserId: shopId.value,
      page: currentPage.value,
      size: pageSize.value
    }

    // 根据选中的分类筛选
    if (activeTab.value !== 'all') {
      params.categoryId = parseInt(activeTab.value)
    }

    const res = await getProductListService(params)
    if (res.code === 0) {
      if (res.data.items && Array.isArray(res.data.items)) {
        productList.value = res.data.items
        totalCount.value = res.data.total || 0
      } else if (Array.isArray(res.data)) {
        productList.value = res.data
        totalCount.value = res.data.length
      }

      // 前端排序
      sortProducts()
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    productsLoading.value = false
  }
}

// 检查关注状态
const checkFollowStatus = async () => {
  try {
    const res = await getShopCollectionListService({ shopId: shopId.value })
    if (res.code === 0 && res.data) {
      const collections = Array.isArray(res.data) ? res.data : []
      const found = collections.find(item => item.shopId === shopId.value)
      if (found) {
        isFollowing.value = true
        collectionId.value = found.id
      } else {
        isFollowing.value = false
        collectionId.value = null
      }
    }
  } catch (error) {
    console.error('获取关注状态失败:', error)
  }
}

// 切换关注
const toggleFollow = async () => {
  if (!tokenStore.token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  try {
    if (isFollowing.value) {
      // 取消关注 - 需要先确保有collectionId
      if (!collectionId.value) {
        // 如果没有collectionId，先获取
        await checkFollowStatus()
        if (!collectionId.value) {
          ElMessage.error('无法获取收藏信息')
          return
        }
      }
      
      await deleteShopCollectionService(collectionId.value)
      isFollowing.value = false
      collectionId.value = null
      followCount.value = Math.max(0, followCount.value - 1)
      ElMessage.success('已取消关注')
    } else {
      // 添加关注
      const res = await addShopCollectionService({ shopId: shopId.value })
      if (res.code === 0) {
        isFollowing.value = true
        // 从返回数据中获取收藏ID，如果没有则重新查询
        if (res.data && res.data.id) {
          collectionId.value = res.data.id
        } else {
          await checkFollowStatus()
        }
        followCount.value += 1
        ElMessage.success('关注成功')
      }
    }
  } catch (error) {
    console.error('关注操作失败:', error)
    ElMessage.error(isFollowing.value ? '取消关注失败' : '关注失败')
  }
}

// 标签页切换
const handleTabChange = (value) => {
  activeTab.value = value
  currentPage.value = 1
  fetchProducts()
}

// 排序切换
const handleSortChange = () => {
  sortProducts()
}

// 前端排序
const sortProducts = () => {
  if (sortType.value === 'default') return

  productList.value.sort((a, b) => {
    switch (sortType.value) {
      case 'price_asc':
        return parseFloat(a.price) - parseFloat(b.price)
      case 'price_desc':
        return parseFloat(b.price) - parseFloat(a.price)
      case 'sales':
        return (b.sales || 0) - (a.sales || 0)
      default:
        return 0
    }
  })
}

// 分页
const handlePageSizeChange = () => {
  currentPage.value = 1
  fetchProducts()
}

const handlePageChange = () => {
  fetchProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 查看商品
const viewProduct = (productId) => {
  router.push(`/product/${productId}`)
}

// 初始化
onMounted(() => {
  if (!shopId.value) {
    ElMessage.error('店铺ID错误')
    router.back()
    return
  }
  fetchCategories()
  fetchShopInfo()
  fetchProducts()
})
</script>

<style scoped>
.shop-detail-container {
  min-height: calc(100vh - 64px);
  background-color: #f5f7fa;
}

/* 加载状态 */
.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  color: #909399;
  gap: 12px;
}

.loading-wrapper .el-icon {
  font-size: 48px;
}

/* 店铺头部 */
.shop-header {
  position: relative;
  background: white;
  margin-bottom: 20px;
}

.shop-banner {
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
}

.shop-info-card {
  position: relative;
  margin-top: -60px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.shop-main-info {
  display: flex;
  align-items: flex-end;
  gap: 24px;
  background: white;
  padding: 20px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.shop-avatar {
  flex-shrink: 0;
  border: 4px solid white;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.shop-details {
  flex: 1;
}

.shop-name {
  margin: 0 0 12px 0;
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

.shop-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #667eea;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}

.shop-actions {
  flex-shrink: 0;
}

/* 店铺导航 */
.shop-nav {
  background: white;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.nav-tabs {
  display: flex;
  gap: 8px;
}

.nav-tab {
  padding: 16px 24px;
  cursor: pointer;
  font-size: 15px;
  color: #666;
  transition: all 0.3s;
  position: relative;
}

.nav-tab:hover {
  color: #667eea;
}

.nav-tab.active {
  color: #667eea;
  font-weight: 600;
}

.nav-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #667eea;
}

/* 商品列表 */
.shop-products {
  padding: 20px 0;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.result-count {
  color: #666;
  font-size: 14px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  min-height: 400px;
}

.product-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
}

.product-image {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  background: #f5f7fa;
}

.product-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-image img {
  transform: scale(1.08);
}

.stock-out-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
}

.product-info {
  padding: 12px;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  height: 2.8em;
}

.product-price {
  margin-bottom: 8px;
}

.current-price {
  font-size: 18px;
  font-weight: 700;
  color: #ff5000;
}

.product-meta {
  font-size: 12px;
  color: #909399;
}

/* 分页 */
.pagination-wrapper {
  margin-top: 32px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* 响应式 */
@media (max-width: 992px) {
  .shop-main-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}

@media (max-width: 768px) {
  .shop-banner {
    height: 150px;
  }

  .shop-name {
    font-size: 22px;
  }

  .filter-bar {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
