<template>
  <div class="home-content">
    <div class="container">
      <!-- 广告横幅 -->
      <div v-if="topAd" class="banner" @click="handleAdClick(topAd)">
        <img :src="topAd.image" :alt="topAd.title">
      </div>

      <!-- 搜索区域 -->
      <div class="search-area">
        <div class="search-box">
          <el-input
            v-model="searchText"
            placeholder="搜索感兴趣的商品"
            size="large"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 轮播图区域 -->
      <div class="carousel-section">
        <div v-if="leftAd" class="side-ad left-ad" @click="handleAdClick(leftAd)">
          <img :src="leftAd.image" :alt="leftAd.title">
        </div>
        
        <div class="carousel-container">
          <el-carousel 
            class="carousel" 
            height="300px" 
            :interval="4000" 
            indicator-position="outside"
            arrow="always"
          >
            <el-carousel-item v-for="item in carouselItems" :key="item.id">
              <div 
                class="carousel-item" 
                :style="{ backgroundImage: `url(${item.image})` }"
                @click="handleCarouselClick(item)"
              >
                <div class="carousel-content">
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.description }}</p>
                </div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>
        
        <div v-if="rightAd" class="side-ad right-ad" @click="handleAdClick(rightAd)">
          <img :src="rightAd.image" :alt="rightAd.title">
        </div>
      </div>

      <!-- 商品展示区域 -->
      <div class="product-section">
        <!-- 热销商品推荐 -->
        <div class="hot-products">
          <div class="section-title">
            <el-icon><TrendCharts /></el-icon>
            热销商品推荐
          </div>
          
          <div v-loading="loading" class="products-grid">
            <el-empty v-if="!loading && hotProducts.length === 0" description="暂无热销商品" />
            
            <div 
              v-else
              class="product-card" 
              v-for="product in hotProducts" 
              :key="product.id"
              @click="handleProductClick(product)"
            >
              <img :src="product.image" class="product-img" :alt="product.name">
              <div class="product-info">
                <div class="product-name" :title="product.name">{{ product.name }}</div>
                <div class="product-price">¥{{ product.price }}</div>
                <div class="product-sales">已售 {{ product.sales }}件</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 新品推荐 -->
        <div class="recommend-products">
          <div class="section-title">
            <el-icon><Star /></el-icon>
            新品推荐
          </div>
          <div class="recommend-list">
            <el-empty v-if="recommendProducts.length === 0" description="暂无新品" :image-size="80" />
            
            <div 
              v-else
              class="recommend-item" 
              v-for="product in recommendProducts" 
              :key="product.id"
              @click="handleProductClick(product)"
            >
              <img :src="product.image" class="recommend-img" :alt="product.name">
              <div class="recommend-info">
                <div class="product-name" :title="product.name">{{ product.name }}</div>
                <div class="product-price">¥{{ product.price }}</div>
                <div class="product-sales">已售 {{ product.sales }}件</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Search,
  Star,
  TrendCharts
} from '@element-plus/icons-vue'
import { getProductListService } from '@/api/product'
import { getCarouselListService } from '@/api/carousel'
import { getAdListService } from '@/api/ad'

const router = useRouter()
const defaultImage = 'https://via.placeholder.com/150x120?text=No+Image'

// 响应式数据
const searchText = ref('')
const loading = ref(false)

// 轮播图数据
const carouselItems = ref([])

// 广告位数据
const topAd = ref(null)
const leftAd = ref(null)
const rightAd = ref(null)

// 商品数据
const hotProducts = ref([])
const recommendProducts = ref([])

// 获取轮播图数据
const fetchCarouselData = async () => {
  try {
    const res = await getCarouselListService()
    if (res.code === 0) {
      // 按sort字段排序
      const sortedData = (res.data || []).sort((a, b) => (a.sort || 0) - (b.sort || 0))
      carouselItems.value = sortedData.map(item => ({
        id: item.id,
        title: item.title,
        description: item.title, // 如果没有description字段，使用title
        image: item.coverImg || 'https://via.placeholder.com/800x300/409EFF/ffffff?text=轮播图',
        link: item.link || '#'
      }))
    } else {
      console.error('获取轮播图失败:', res.message)
      // 失败时使用默认数据
      carouselItems.value = [
        { 
          title: '新品上市', 
          description: '最新款商品火热销售中',
          image: 'https://via.placeholder.com/800x300/409EFF/ffffff?text=新品上市',
          link: '#'
        }
      ]
    }
  } catch (error) {
    console.error('获取轮播图失败:', error)
    // 失败时使用默认数据
    carouselItems.value = [
      { 
        title: '新品上市', 
        description: '最新款商品火热销售中',
        image: 'https://via.placeholder.com/800x300/409EFF/ffffff?text=新品上市',
        link: '#'
      }
    ]
  }
}

// 获取广告位数据
const fetchAdData = async () => {
  try {
    const res = await getAdListService()
    if (res.code === 0) {
      const ads = res.data || []
      // 根据position字段分配广告位
      ads.forEach(ad => {
        const position = ad.position || ''
        if (position.includes('顶部')) {
          topAd.value = {
            id: ad.id,
            title: ad.title,
            image: ad.coverImg,
            link: ad.link || '#'
          }
        } else if (position.includes('左侧')) {
          leftAd.value = {
            id: ad.id,
            title: ad.title,
            image: ad.coverImg,
            link: ad.link || '#'
          }
        } else if (position.includes('右侧')) {
          rightAd.value = {
            id: ad.id,
            title: ad.title,
            image: ad.coverImg,
            link: ad.link || '#'
          }
        }
      })
    } else {
      console.error('获取广告位失败:', res.message)
    }
  } catch (error) {
    console.error('获取广告位失败:', error)
  }
}

// 广告位点击事件
const handleAdClick = (ad) => {
  if (ad && ad.link && ad.link !== '#') {
    if (ad.link.startsWith('http')) {
      window.open(ad.link, '_blank')
    } else {
      router.push(ad.link)
    }
  }
}
const fetchHotProducts = async () => {
  loading.value = true
  try {
    const res = await getProductListService({ type: 'hot', limit: 15 })
    if (res.code === 0) {
      hotProducts.value = (res.data || []).map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        sales: item.sales || 0,
        image: item.coverImg || defaultImage
      }))
      console.log('hotProducts:', hotProducts.value)
    } else {
      ElMessage.error(res.message || '获取热销商品失败')
    }
  } catch (error) {
    console.error('获取热销商品失败:', error)
    ElMessage.error('获取热销商品失败')
  } finally {
    loading.value = false
  }
}

// 获取新品推荐
const fetchNewProducts = async () => {
  try {
    const res = await getProductListService({ type: 'new', limit: 6 })
    if (res.code === 0) {
      recommendProducts.value = (res.data || []).map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        sales: item.sales || 0,
        image: item.coverImg || defaultImage
      }))
    } else {
      ElMessage.error(res.message || '获取新品推荐失败')
    }
  } catch (error) {
    console.error('获取新品推荐失败:', error)
    ElMessage.error('获取新品推荐失败')
  }
}

// 方法定义
const handleSearch = () => {
  if (searchText.value.trim()) {
    router.push({
      path: '/products',
      query: { keyword: searchText.value.trim() }
    })
  } else {
    ElMessage.warning('请输入搜索关键词')
  }
}

const handleCarouselClick = (item) => {
  if (item.link && item.link !== '#') {
    // 如果有有效的链接，跳转
    if (item.link.startsWith('http')) {
      window.open(item.link, '_blank')
    } else {
      router.push(item.link)
    }
  }
}

const handleProductClick = (product) => {
  router.push(`/product/${product.id}`)
}

// 初始化
onMounted(() => {
  fetchAdData()
  fetchCarouselData()
  fetchHotProducts()
  fetchNewProducts()
})
</script>

<style scoped>
.home-content {
  width: 100%;
}

.container {
  width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

/* 广告横幅 */
.banner {
  margin: 24px 0;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.banner:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.banner img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

/* 搜索区域 */
.search-area {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.search-box {
  width: 600px;
}

/* 轮播图区域 */
.carousel-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.side-ad {
  width: 200px;
  height: 300px;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.side-ad:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.side-ad img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-container {
  flex: 1;
}

.carousel {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.carousel-item {
  height: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  position: relative;
}

.carousel-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
}

.carousel-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.carousel-content h3 {
  font-size: 32px;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.carousel-content p {
  font-size: 16px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

/* 商品展示区域 */
.product-section {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.hot-products {
  flex: 3;
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  display: flex;
  align-items: center;
  color: #303133;
}

.section-title .el-icon {
  margin-right: 10px;
  color: #667eea;
  font-size: 22px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
}

.product-card {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  background: white;
  border: 1px solid #f0f0f0;
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
  border-color: #667eea;
}

.product-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.product-info {
  padding: 10px;
}

.product-name {
  font-size: 14px;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  color: #ff5000;
  font-weight: bold;
  margin: 5px 0;
  font-size: 16px;
}

.product-sales {
  font-size: 12px;
  color: #999;
}

.recommend-products {
  flex: 1;
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.recommend-item {
  display: flex;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  border: 1px solid #f0f0f0;
}

.recommend-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.15);
  border-color: #667eea;
}

.recommend-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.recommend-info {
  flex: 1;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .container {
    width: 100%;
    max-width: 1200px;
  }
}

@media (max-width: 992px) {
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .carousel-section {
    flex-direction: column;
  }
  
  .side-ad {
    width: 100%;
    height: 150px;
    margin: 10px 0;
  }
  
  .product-section {
    flex-direction: column;
  }
  
  .hot-products {
    margin-right: 0;
    margin-bottom: 20px;
  }
}

@media (max-width: 576px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .search-box {
    width: 100%;
  }
}
</style>