<template>
  <div class="product-detail-container">
    <div class="container">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-wrapper">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>

      <!-- 商品详情 -->
      <div v-else-if="product" class="product-detail">
        <!-- 面包屑导航 -->
        <el-breadcrumb separator="/" class="breadcrumb">
          <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/products' }">商品列表</el-breadcrumb-item>
          <el-breadcrumb-item 
            v-if="product.categoryName && product.categoryId"
            :to="{ path: '/products', query: { categoryId: product.categoryId } }"
          >
            {{ product.categoryName }}
          </el-breadcrumb-item>
          <el-breadcrumb-item>{{ product.name }}</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 商品主要信息 -->
        <div class="product-main">
          <!-- 左侧图片区域 -->
          <div class="product-gallery">
            <div class="main-image">
              <img :src="currentImage || defaultImage" :alt="product.name" />
              <div v-if="product.stock === 0" class="stock-out-overlay">
                <span>已售罄</span>
              </div>
            </div>
            <div v-if="imageList.length > 1" class="thumbnail-list">
              <div
                v-for="(img, index) in imageList"
                :key="index"
                class="thumbnail-item"
                :class="{ active: currentImageIndex === index }"
                @click="selectImage(img, index)"
              >
                <img :src="img" :alt="`商品图片${index + 1}`" />
              </div>
            </div>
          </div>

          <!-- 右侧信息区域 -->
          <div class="product-info">
            <h1 class="product-title">{{ product.name }}</h1>
            
            <div class="product-meta">
              <span class="meta-item">
                <el-icon><ShoppingBag /></el-icon>
                已售 {{ product.sales || 0 }}
              </span>
              <span class="meta-item">
                <el-icon><Box /></el-icon>
                库存 {{ product.stock || 0 }}
              </span>
            </div>

            <div class="price-section">
              <div class="price-label">价格</div>
              <div class="price-value">
                <span class="currency">¥</span>
                <span class="amount">{{ product.price }}</span>
              </div>
            </div>

            <div class="shop-info">
              <el-icon><Shop /></el-icon>
              <span class="shop-name">{{ product.createUserName || '官方店铺' }}</span>
              <el-button 
                size="small" 
                @click="viewShop"
                v-if="product.createUserId"
              >
                进店逛逛
              </el-button>
            </div>

            <div class="quantity-section">
              <span class="quantity-label">数量</span>
              <el-input-number
                v-model="quantity"
                :min="1"
                :max="product.stock || 1"
                :disabled="product.stock === 0"
              />
              <span class="stock-tip">库存 {{ product.stock || 0 }} 件</span>
            </div>

            <div class="action-buttons">
              <el-button
                type="primary"
                size="large"
                :disabled="product.stock === 0"
                @click="addToCart"
              >
                <el-icon><ShoppingCart /></el-icon>
                加入购物车
              </el-button>
              <el-button
                type="danger"
                size="large"
                plain
                :disabled="product.stock === 0"
                @click="buyNow"
              >
                立即购买
              </el-button>
              <el-button
                size="large"
                circle
                @click="toggleFavorite"
              >
                <el-icon :style="{ color: isFavorite ? '#f5a623' : '' }">
                  <StarFilled v-if="isFavorite" />
                  <Star v-else />
                </el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 商品详细描述 -->
        <div class="product-description">
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <el-tab-pane label="商品详情" name="detail">
              <div class="detail-content">
                <!-- 富文本详情 -->
                <div v-if="product.detailHtml" class="detail-html" v-html="product.detailHtml"></div>
                <!-- 无详情时的提示 -->
                <el-empty v-else description="暂无详细描述" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="商品参数" name="params">
              <div class="params-content">
                <div class="param-item">
                  <span class="param-label">商品名称</span>
                  <span class="param-value">{{ product.name }}</span>
                </div>
                <div class="param-item">
                  <span class="param-label">商品分类</span>
                  <span class="param-value">{{ product.categoryName || '未分类' }}</span>
                </div>
                <div class="param-item">
                  <span class="param-label">商品价格</span>
                  <span class="param-value">¥{{ product.price }}</span>
                </div>
                <div class="param-item">
                  <span class="param-label">库存数量</span>
                  <span class="param-value">{{ product.stock }} 件</span>
                </div>
                <div class="param-item">
                  <span class="param-label">销售数量</span>
                  <span class="param-value">{{ product.sales || 0 }} 件</span>
                </div>
                <div class="param-item">
                  <span class="param-label">商品状态</span>
                  <span class="param-value">
                    <el-tag :type="product.state === '上架' ? 'success' : 'info'">
                      {{ product.state }}
                    </el-tag>
                  </span>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane name="reviews">
              <template #label>
                <span>用户评价 <span v-if="reviewsTotal > 0">({{ reviewsTotal }})</span></span>
              </template>
              <div class="reviews-content">
                <!-- 加载状态 -->
                <div v-if="reviewsLoading" class="reviews-loading">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  <span>加载中...</span>
                </div>
                <!-- 评论列表 -->
                <div v-else-if="reviews.length > 0" class="reviews-list">
                  <div v-for="review in reviews" :key="review.id" class="review-item">
                    <div class="review-header">
                      <div class="user-info">
                        <el-avatar :src="review.createUserPic" :size="40">
                          {{ review.createUserName?.charAt(0) }}
                        </el-avatar>
                        <div class="user-details">
                          <div class="username">{{ review.createUserName }}</div>
                          <el-rate 
                            v-model="review.reviewStar" 
                            disabled 
                            show-score 
                            text-color="#ff9900"
                            score-template="{value}"
                          />
                        </div>
                      </div>
                      <div class="review-time">{{ review.reviewTime }}</div>
                    </div>
                    <div class="review-content">{{ review.review }}</div>
                    <div class="review-product-info">
                      <img :src="review.productCoverImg" :alt="review.productName" />
                      <div class="product-details">
                        <div class="product-name">{{ review.productName }}</div>
                        <div class="product-meta">
                          <span>数量: {{ review.num }}</span>
                          <span>单价: ¥{{ review.unitPrice }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 分页 -->
                  <div class="reviews-pagination">
                    <el-pagination
                      v-model:current-page="reviewsPage"
                      v-model:page-size="reviewsSize"
                      :total="reviewsTotal"
                      :page-sizes="[5, 10, 20]"
                      layout="total, sizes, prev, pager, next, jumper"
                      @current-change="fetchReviews"
                      @size-change="fetchReviews"
                    />
                  </div>
                </div>
                <!-- 无评论 -->
                <el-empty v-else description="暂无评价" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 商品不存在 -->
      <el-empty v-else description="商品不存在或已下架" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Loading,
  ShoppingCart,
  Star,
  StarFilled,
  ShoppingBag,
  Box,
  Shop
} from '@element-plus/icons-vue'
import { getProductDetailService, getProductReviewsService } from '@/api/product'
import { addCartService } from '@/api/cart'
import {
  getProductCollectionListService,
  addProductCollectionService,
  deleteProductCollectionService
} from '@/api/productCollection'
import { addBrowsingRecordService } from '@/api/browsingRecord'
import { useTokenStore } from '@/stores/token'

const route = useRoute()
const router = useRouter()
const tokenStore = useTokenStore()

// 默认图片
const defaultImage = 'https://via.placeholder.com/600x600?text=No+Image'

// 响应式数据
const loading = ref(false)
const product = ref(null)
const quantity = ref(1)
const currentImage = ref('')
const currentImageIndex = ref(0)
const activeTab = ref('detail')
const isFavorite = ref(false)
const collectionId = ref(null)
let autoPlayTimer = null

// 评论相关数据
const reviews = ref([])
const reviewsLoading = ref(false)
const reviewsPage = ref(1)
const reviewsSize = ref(10)
const reviewsTotal = ref(0)

// 图片列表
const imageList = computed(() => {
  if (!product.value) return []
  const images = [product.value.coverImg]
  if (product.value.detailImg) {
    try {
      const detailImgs = JSON.parse(product.value.detailImg)
      if (Array.isArray(detailImgs)) {
        images.push(...detailImgs)
      }
    } catch (e) {
      console.error('解析详情图片失败:', e)
    }
  }
  return images.filter(img => img)
})

// 开始自动轮播
const startAutoPlay = () => {
  if (imageList.value.length <= 1) return
  
  stopAutoPlay() // 先清除已有的定时器
  autoPlayTimer = setInterval(() => {
    currentImageIndex.value = (currentImageIndex.value + 1) % imageList.value.length
    currentImage.value = imageList.value[currentImageIndex.value]
  }, 3000) // 每3秒切换一次
}

// 停止自动轮播
const stopAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}

// 手动切换图片
const selectImage = (img, index) => {
  currentImage.value = img
  currentImageIndex.value = index
  // 手动切换后重新开始自动轮播
  startAutoPlay()
}

// 获取商品评论
const fetchReviews = async () => {
  if (!product.value) return
  
  reviewsLoading.value = true
  try {
    const res = await getProductReviewsService(product.value.id, {
      page: reviewsPage.value,
      size: reviewsSize.value
    })
    
    if (res.code === 0 && res.data) {
      reviews.value = res.data.items || []
      reviewsTotal.value = res.data.total || 0
    }
  } catch (error) {
    console.error('获取评论失败:', error)
  } finally {
    reviewsLoading.value = false
  }
}

// 标签页切换
const handleTabChange = (tabName) => {
  if (tabName === 'reviews' && reviews.value.length === 0) {
    fetchReviews()
  }
}

// 获取商品详情
const fetchProductDetail = async () => {
  loading.value = true
  try {
    const productId = route.params.id
    const res = await getProductDetailService(productId)
    
    if (res.code === 0 && res.data) {
      product.value = res.data
      currentImage.value = res.data.coverImg || defaultImage
      currentImageIndex.value = 0
      
      // 开始自动轮播
      startAutoPlay()
      
      // 添加浏览记录（如果已登录）
      if (tokenStore.token) {
        addBrowsingRecord(productId)
        checkFavoriteStatus(productId)
      }
    } else {
      ElMessage.error(res.message || '获取商品详情失败')
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
    ElMessage.error('获取商品详情失败')
  } finally {
    loading.value = false
  }
}

// 添加浏览记录
const addBrowsingRecord = async (productId) => {
  try {
    await addBrowsingRecordService({ productId })
  } catch (error) {
    console.error('添加浏览记录失败:', error)
  }
}

// 检查收藏状态
const checkFavoriteStatus = async (productId) => {
  try {
    const res = await getProductCollectionListService()
    if (res.code === 0 && res.data) {
      const favorites = Array.isArray(res.data) ? res.data : []
      const found = favorites.find(item => item.productId === parseInt(productId))
      if (found) {
        isFavorite.value = true
        collectionId.value = found.id
      }
    }
  } catch (error) {
    console.error('获取收藏状态失败:', error)
  }
}

// 加入购物车
const addToCart = async () => {
  if (!tokenStore.token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  if (product.value.stock === 0) {
    ElMessage.warning('该商品已售罄')
    return
  }

  try {
    const res = await addCartService({
      productId: product.value.id,
      num: quantity.value
    })
    if (res.code === 0) {
      ElMessage.success('已加入购物车')
    } else {
      ElMessage.error(res.message || '加入购物车失败')
    }
  } catch (error) {
    console.error('加入购物车失败:', error)
    ElMessage.error('加入购物车失败')
  }
}

// 立即购买
const buyNow = async () => {
  if (!tokenStore.token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  if (product.value.stock === 0) {
    ElMessage.warning('该商品已售罄')
    return
  }

  // 跳转到订单结算页面
  router.push({
    path: '/checkout',
    query: {
      type: 'direct',
      productId: product.value.id,
      num: quantity.value
    }
  })
}

// 收藏/取消收藏
const toggleFavorite = async () => {
  if (!tokenStore.token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  try {
    if (isFavorite.value) {
      // 取消收藏
      await deleteProductCollectionService(collectionId.value)
      isFavorite.value = false
      collectionId.value = null
      ElMessage.success('已取消收藏')
    } else {
      // 添加收藏
      const res = await addProductCollectionService({ productId: product.value.id })
      if (res.code === 0) {
        isFavorite.value = true
        // 重新获取收藏ID
        await checkFavoriteStatus(product.value.id)
        ElMessage.success('已加入收藏')
      }
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error(isFavorite.value ? '取消收藏失败' : '收藏失败')
  }
}

// 查看店铺
const viewShop = () => {
  if (product.value.createUserId) {
    router.push(`/shop/${product.value.createUserId}`)
  }
}

// 初始化
onMounted(() => {
  fetchProductDetail()
})

// 组件销毁时清除定时器
onBeforeUnmount(() => {
  stopAutoPlay()
})
</script>

<style scoped>
.product-detail-container {
  min-height: calc(100vh - 64px);
  background-color: #f5f7fa;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
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

/* 面包屑 */
.breadcrumb {
  background: white;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* 商品主要信息 */
.product-main {
  display: flex;
  gap: 30px;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

/* 图片区域 */
.product-gallery {
  flex: 0 0 500px;
}

.main-image {
  position: relative;
  width: 100%;
  height: 500px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  background: #fafafa;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.stock-out-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stock-out-overlay span {
  background: rgba(255, 255, 255, 0.9);
  color: #f56c6c;
  padding: 12px 30px;
  border-radius: 8px;
  font-size: 24px;
  font-weight: bold;
}

.thumbnail-list {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  overflow-x: auto;
}

.thumbnail-item {
  flex: 0 0 80px;
  height: 80px;
  border: 2px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.thumbnail-item:hover,
.thumbnail-item.active {
  border-color: #409EFF;
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 信息区域 */
.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  line-height: 1.4;
}

.product-meta {
  display: flex;
  gap: 24px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 14px;
}

.price-section {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ffd4d4;
}

.price-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.price-value {
  display: flex;
  align-items: baseline;
}

.currency {
  font-size: 24px;
  color: #ff5000;
  font-weight: 600;
  margin-right: 4px;
}

.amount {
  font-size: 36px;
  color: #ff5000;
  font-weight: 700;
}

.shop-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.shop-name {
  flex: 1;
  font-weight: 500;
  color: #303133;
}

.quantity-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.quantity-label {
  font-weight: 500;
  color: #606266;
}

.stock-tip {
  font-size: 14px;
  color: #909399;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: auto;
}

.action-buttons .el-button {
  flex: 1;
}

.action-buttons .el-button:last-child {
  flex: 0 0 auto;
}

/* 商品详细描述 */
.product-description {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.detail-content {
  padding: 20px 0;
  min-height: 300px;
}

.detail-html {
  line-height: 1.8;
  color: #606266;
  font-size: 15px;
}

.detail-html :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 10px 0;
  display: block;
}

.detail-html :deep(p) {
  margin: 12px 0;
}

.detail-html :deep(h1),
.detail-html :deep(h2),
.detail-html :deep(h3) {
  margin: 20px 0 12px 0;
  color: #303133;
}

.detail-html :deep(ul),
.detail-html :deep(ol) {
  padding-left: 24px;
  margin: 12px 0;
}

.detail-html :deep(li) {
  margin: 8px 0;
}

.params-content {
  padding: 20px 0;
}

.param-item {
  display: flex;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.param-item:last-child {
  border-bottom: none;
}

.param-label {
  flex: 0 0 120px;
  color: #909399;
  font-size: 14px;
}

.param-value {
  flex: 1;
  color: #303133;
  font-size: 14px;
}

/* 评论区域 */
.reviews-content {
  padding: 20px 0;
  min-height: 400px;
}

.reviews-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #909399;
  gap: 12px;
}

.reviews-loading .el-icon {
  font-size: 36px;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  padding: 24px;
  background: #fafafa;
  border-radius: 12px;
  transition: all 0.3s;
}

.review-item:hover {
  background: #f5f7fa;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.user-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.username {
  font-weight: 600;
  color: #303133;
  font-size: 15px;
}

.review-time {
  color: #909399;
  font-size: 13px;
}

.review-content {
  color: #606266;
  line-height: 1.8;
  font-size: 14px;
  margin-bottom: 16px;
  padding: 12px 0;
}

.review-product-info {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.review-product-info img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.product-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.product-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #909399;
}

.reviews-pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

/* 响应式 */
@media (max-width: 992px) {
  .product-main {
    flex-direction: column;
  }

  .product-gallery {
    flex: none;
    width: 100%;
  }

  .main-image {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .product-main {
    padding: 20px;
  }

  .main-image {
    height: 300px;
  }

  .product-title {
    font-size: 20px;
  }

  .amount {
    font-size: 28px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .el-button:last-child {
    flex: 1;
  }
}
</style>
