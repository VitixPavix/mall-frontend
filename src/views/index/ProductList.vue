<template>
  <div class="product-list-container">
    <div class="container">
      <!-- 主要内容区域 -->
      <div class="main-content">
        <!-- 左侧分类区域 -->
        <aside class="category-sidebar">
          <div class="category-header">
            <el-icon><List /></el-icon>
            <span>商品分类</span>
          </div>

          <el-menu
            :default-active="selectedCategory"
            class="category-menu"
            @select="handleCategoryChange"
          >
            <el-menu-item index="all">
              <span>全部商品</span>
              <span class="count">({{ totalCount }})</span>
            </el-menu-item>
            <el-menu-item
              v-for="category in categories"
              :key="category.id"            
              :index="String(category.id)"   
            >
            <!-- key 是 Vue 内部使用的，而 index 是 Element Plus 组件内部使用 -->
             <!-- index 会作为参数传递给 select 事件的处理函数 -->
              <span>{{ category.categoryName }}</span>
            </el-menu-item>
          </el-menu>
        </aside>

        <!-- 右侧商品展示区域 -->
        <main class="product-main">
          <!-- 搜索和筛选栏 -->
          <section class="search-section">
            <el-input
              v-model="searchKeyword"
              placeholder="请输入商品名称或关键词"
              size="large"
              clearable
              @keyup.enter="handleSearch"
              class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <template #append>
                <el-button type="primary" @click="handleSearch">搜索</el-button>
              </template>
            </el-input>

            <div class="filter-bar">
              <span class="filter-label">排序：</span>
              <el-radio-group v-model="sortType" size="small" @change="handleSortChange">
                <el-radio-button label="default">综合</el-radio-button>
                <el-radio-button label="price_asc">价格↑</el-radio-button>
                <el-radio-button label="price_desc">价格↓</el-radio-button>
                <el-radio-button label="sales">销量</el-radio-button>
              </el-radio-group>
            </div>
          </section>

          <!-- 商品列表 -->
          <section class="product-section">
            <div class="section-header">
              <span class="total-text">共 {{ totalCount }} 件商品</span>
              <div class="view-toggle">
                <el-button
                  :type="viewMode === 'grid' ? 'primary' : ''"
                  size="small"
                  circle
                  @click="viewMode = 'grid'"
                >
                  <el-icon><Grid /></el-icon>
                </el-button>
                <el-button
                  :type="viewMode === 'list' ? 'primary' : ''"
                  size="small"
                  circle
                  @click="viewMode = 'list'"
                >
                  <el-icon><List /></el-icon>
                </el-button>
              </div>
            </div>

            <!-- 加载状态 -->
            <div v-if="loading" class="loading-wrapper">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>加载中...</span>
            </div>

            <!-- 空状态 -->
            <el-empty v-else-if="products.length === 0" description="暂无商品" />

            <!-- 网格视图 -->
            <div v-else-if="viewMode === 'grid'" class="products-grid">
              <div
                v-for="product in products"
                :key="product.id"
                class="product-card"
                @click="viewProductDetail(product.id)"
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
                    <span class="sales-count">已售 {{ product.sales || 0 }}</span>
                    <span class="stock-count">库存 {{ product.stock || 0 }}</span>
                  </div>
                  <div class="product-actions">
                    <el-button type="primary" size="small" @click.stop="addToCart(product)">
                      <el-icon><ShoppingCart /></el-icon>
                      加入购物车
                    </el-button>
                    <el-button 
                      size="small"
                      circle
                      @click.stop="toggleFavorite(product)"
                    >
                      <el-icon :style="{ color: isFavorite(product.id) ? '#f5a623' : '' }">
                        <StarFilled v-if="isFavorite(product.id)" />
                        <Star v-else />
                      </el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 列表视图 -->
            <div v-else class="products-list">
              <div
                v-for="product in products"
                :key="product.id"
                class="product-list-item"
                @click="viewProductDetail(product.id)"
              >
                <div class="product-image">
                  <img :src="product.coverImg || defaultImage" :alt="product.name" />
                  <div v-if="product.stock === 0" class="stock-out-tag">已售罄</div>
                </div>
                <div class="product-content">
                  <h3 class="product-name">{{ product.name }}</h3>
                  <div class="product-meta">
                    <span class="sales-count">已售 {{ product.sales || 0 }}</span>
                    <span class="stock-count">库存 {{ product.stock || 0 }}</span>
                  </div>
                </div>
                <div class="product-right">
                  <div class="product-price">
                    <span class="current-price">¥{{ product.price }}</span>
                  </div>
                  <div class="product-actions">
                    <el-button type="primary" size="small" @click.stop="addToCart(product)">
                      <el-icon><ShoppingCart /></el-icon>
                      加入购物车
                    </el-button>
                    <el-button 
                      size="small"
                      circle
                      @click.stop="toggleFavorite(product)"
                    >
                      <el-icon :style="{ color: isFavorite(product.id) ? '#f5a623' : '' }">
                        <StarFilled v-if="isFavorite(product.id)" />
                        <Star v-else />
                      </el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div v-if="totalCount > pageSize" class="pagination-wrapper">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[12, 24, 36, 48, 60]"
                :total="totalCount"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handlePageSizeChange"
                @current-change="handlePageChange"
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, List, Grid, Star, StarFilled, ShoppingCart, Loading } from '@element-plus/icons-vue'
import { getCategoryListService } from '@/api/category'
import { getProductListService } from '@/api/product'
import { 
  getProductCollectionListService, 
  addProductCollectionService, 
  deleteProductCollectionService 
} from '@/api/productCollection'
import { addCartService } from '@/api/cart'
import { useTokenStore } from '@/stores/token'

// 默认图片
const defaultImage = 'https://via.placeholder.com/300x300?text=No+Image'

// 路由
const router = useRouter()
const route = useRoute()
const tokenStore = useTokenStore()

// 响应式数据
const loading = ref(false)
const categories = ref([])
const products = ref([])
const selectedCategory = ref('all')
const searchKeyword = ref('')
const sortType = ref('default')
const viewMode = ref('grid')
const currentPage = ref(1)
const pageSize = ref(12)
const totalCount = ref(0)
const favoriteProductIds = ref(new Set()) // 存储已收藏的商品ID

// 获取用户收藏列表
const fetchUserFavorites = async () => {
  if (!tokenStore.token) return
  
  try {
    const res = await getProductCollectionListService()
    if (res.code === 0) {
      const favorites = res.data || []
      favoriteProductIds.value = new Set(favorites.map(item => item.productId))
    }
  } catch (error) {
    console.error('获取收藏列表失败:', error)
  }
}

// 检查商品是否已收藏
const isFavorite = (productId) => {
  return favoriteProductIds.value.has(productId)
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await getCategoryListService()
    if (res.code === 0) {
      categories.value = res.data || []
    }
  } catch (error) {
    console.error('获取分类失败:', error)
    ElMessage.error('获取分类失败')
  }
}

// 获取商品列表
const fetchProducts = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value
    }

    // 添加分类筛选
    if (selectedCategory.value !== 'all') {
      params.categoryId = parseInt(selectedCategory.value)
    }

    // 添加搜索关键词
    if (searchKeyword.value.trim()) {
      params.name = searchKeyword.value.trim()
    }

    const res = await getProductListService(params)
    
    if (res.code === 0) {
      // 判断返回的是分页数据还是列表数据
      if (res.data.total) {
        // 分页数据
        products.value = res.data.items || []
        totalCount.value = res.data.total || 0
      } else if (Array.isArray(res.data)) {
        // 列表数据
        products.value = res.data
        totalCount.value = res.data.length
      } else {
        products.value = []
        totalCount.value = 0
      }

      // 前端排序（如果后端不支持排序）
      sortProducts()
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
    products.value = []
    totalCount.value = 0
  } finally {
    loading.value = false
  }
}

// 前端排序
const sortProducts = () => {
  if (sortType.value === 'default') return

  products.value.sort((a, b) => {
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

// 分类切换
const handleCategoryChange = (categoryId) => {
  selectedCategory.value = categoryId
  currentPage.value = 1
  
  // 更新 URL query 参数
  const query = { ...route.query }
  if (categoryId === 'all') {
    delete query.categoryId
  } else {
    query.categoryId = categoryId
  }
  
  // 使用 router.push 更新 URL，但不会重新加载页面
  router.push({ path: '/products', query })
  
  fetchProducts()
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  
  // 更新 URL query 参数
  const query = { ...route.query }
  if (searchKeyword.value.trim()) {
    query.keyword = searchKeyword.value.trim()
  } else {
    delete query.keyword
  }
  
  router.push({ path: '/products', query })
  
  fetchProducts()
}

// 排序切换
const handleSortChange = () => {
  currentPage.value = 1
  fetchProducts()
}

// 分页大小改变
const handlePageSizeChange = () => {
  currentPage.value = 1
  fetchProducts()
}

// 页码改变
const handlePageChange = () => {
  fetchProducts()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 查看商品详情
const viewProductDetail = (productId) => {
  router.push(`/product/${productId}`)
}

// 提取商品描述（从HTML中提取纯文本）
const getProductDesc = (detailHtml) => {
  if (!detailHtml) return '暂无描述'
  // 移除HTML标签，只保留文本
  const text = detailHtml.replace(/<[^>]*>/g, '').trim()
  return text.substring(0, 50) + (text.length > 50 ? '...' : '')
}

// 加入购物车
const addToCart = async (product) => {
  // 检查是否登录
  if (!tokenStore.token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  if (product.stock === 0) {
    ElMessage.warning('该商品已售罄')
    return
  }

  try {
    const res = await addCartService({
      productId: product.id,
      num: 1
    })
    if (res.code === 0) {
      ElMessage.success(`${product.name} 已加入购物车`)
    } else {
      ElMessage.error(res.message || '加入购物车失败')
    }
  } catch (error) {
    console.error('加入购物车失败:', error)
    ElMessage.error('加入购物车失败')
  }
}

// 收藏/取消收藏
const toggleFavorite = async (product) => {
  // 检查是否登录
  if (!tokenStore.token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  const isCurrentlyFavorite = isFavorite(product.id)
  
  try {
    if (isCurrentlyFavorite) {
      // 取消收藏 - 需要先获取收藏记录的ID
      const res = await getProductCollectionListService({ productId: product.id })
      if (res.code === 0 && res.data && res.data.length > 0) {
        const collectionId = res.data[0].id
        await deleteProductCollectionService(collectionId)
        favoriteProductIds.value.delete(product.id)
        ElMessage.success('已取消收藏')
      }
    } else {
      // 添加收藏
      await addProductCollectionService({ productId: product.id })
      favoriteProductIds.value.add(product.id)
      ElMessage.success('已加入收藏')
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error(isCurrentlyFavorite ? '取消收藏失败' : '收藏失败')
  }
}

// 初始化
onMounted(() => {
  // 从路由查询参数获取搜索关键词和分类ID
  if (route.query.keyword) {
    searchKeyword.value = route.query.keyword
  }
  if (route.query.categoryId) {
    selectedCategory.value = String(route.query.categoryId)
  }
  
  fetchCategories()
  fetchProducts()
  fetchUserFavorites() // 获取用户收藏列表
})

// 监听路由 query 变化（支持浏览器前进/后退）当query变化时会重新获取商品列表
watch(() => route.query, (newQuery) => {
  // 更新分类选择
  if (newQuery.categoryId) {
    selectedCategory.value = String(newQuery.categoryId)
  } else {
    selectedCategory.value = 'all'
  }
  
  // 更新搜索关键词
  if (newQuery.keyword) {
    searchKeyword.value = newQuery.keyword
  } else {
    searchKeyword.value = ''
  }
  
  // 重新获取商品列表
  currentPage.value = 1
  fetchProducts()
}, { deep: true })
</script>

<style scoped>
.product-list-container {
  min-height: calc(100vh - 64px);
  background-color: #f5f7fa;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.main-content {
  display: flex;
  gap: 20px;
}

/* 左侧分类 */
.category-sidebar {
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

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 16px;
  border-radius: 8px 8px 0 0;
}

.category-menu {
  border: none;
}

.category-menu :deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, #f0f7ff 0%, #e6f4ff 100%);
  color: #409EFF;
  font-weight: 600;
}

.count {
  font-size: 12px;
  color: #909399;
}

/* 右侧主内容 */
.product-main {
  flex: 1;
  min-width: 0;
}

/* 搜索区域 */
.search-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.search-input {
  margin-bottom: 16px;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  font-weight: 500;
  color: #606266;
}

/* 商品区域 */
.product-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.total-text {
  color: #909399;
  font-size: 14px;
}

.view-toggle {
  display: flex;
  gap: 8px;
}

/* 加载状态 */
.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #909399;
  gap: 12px;
}

.loading-wrapper .el-icon {
  font-size: 32px;
}

/* 网格视图 */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.product-card {
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
  border-color: #667eea;
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
  font-weight: 600;
}

.stock-count {
  margin-left: 12px;
  color: #67C23A;
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
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  height: 2.8em;
}

.product-desc {
  font-size: 12px;
  color: #909399;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  margin-bottom: 8px;
}

.current-price {
  font-size: 18px;
  font-weight: 700;
  color: #ff5000;
  margin-right: 8px;
}

.original-price {
  font-size: 13px;
  color: #c0c4cc;
  text-decoration: line-through;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 12px;
  color: #909399;
}

.product-actions {
  display: flex;
  gap: 6px;
}

.product-actions .el-button {
  flex: 1;
  font-size: 12px;
  padding: 6px 8px;
}

/* 列表视图 */
.products-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-list-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.product-list-item:hover {
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.12);
  border-color: #667eea;
  transform: translateY(-2px);
}

.product-list-item .product-image {
  width: 120px;
  height: 120px;
  padding-top: 0;
  flex-shrink: 0;
  border-radius: 6px;
}

.product-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-content .product-name {
  font-size: 15px;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  height: auto;
}

.product-content .product-desc {
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-right {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  min-width: 160px;
}

/* 分页 */
.pagination-wrapper {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
}

/* 响应式 */
@media (max-width: 992px) {
  .main-content {
    flex-direction: column;
  }

  .category-sidebar {
    width: 100%;
    position: static;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .product-list-item {
    flex-direction: column;
  }

  .product-list-item .product-image {
    width: 100%;
    height: 180px;
  }

  .product-right {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
