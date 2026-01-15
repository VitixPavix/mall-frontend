<template>
  <div class="shop-home">
    <h2 class="page-title">店铺数据概览</h2>

    <!-- 数据卡片区域 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card card-products" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Box /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">商品总数</div>
              <div class="stat-value">{{ overviewData.totalProducts || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card card-today" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">今日订单</div>
              <div class="stat-value">{{ overviewData.todayOrders || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card card-sales" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">本月销售额</div>
              <div class="stat-value">¥{{ formatMoney(overviewData.monthSales) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card card-favorites" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Star /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">店铺收藏数</div>
              <div class="stat-value">{{ overviewData.shopFavorites || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-section">
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">商品销售排行 Top 5</span>
              <el-button type="primary" text @click="loadProductRank">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>
          <div ref="productChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="goToProducts" class="action-btn">
              <el-icon><Box /></el-icon>
              <span>商品管理</span>
            </el-button>
            <el-button type="success" @click="goToOrders" class="action-btn">
              <el-icon><ShoppingCart /></el-icon>
              <span>订单管理</span>
            </el-button>
            <el-button type="warning" @click="goToProfile" class="action-btn">
              <el-icon><User /></el-icon>
              <span>店铺信息</span>
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Box, Calendar, Money, Star, Refresh, ShoppingCart, User } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getShopOverviewService, getProductRankService } from '@/api/statistics'

const router = useRouter()

// 数据
const overviewData = ref({
  totalProducts: 0,
  todayOrders: 0,
  monthSales: 0,
  shopFavorites: 0
})

const productChartRef = ref(null)
let productChart = null

// 格式化金额
const formatMoney = (value) => {
  if (!value) return '0.00'
  return Number(value).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 加载概览数据
const loadOverview = async () => {
  try {
    const res = await getShopOverviewService()
    overviewData.value = res.data
  } catch (error) {
    ElMessage.error('加载概览数据失败')
    console.error(error)
  }
}

// 加载商品销售排行
const loadProductRank = async () => {
  try {
    const res = await getProductRankService()
    initProductChart(res.data)
  } catch (error) {
    ElMessage.error('加载商品排行数据失败')
    console.error(error)
  }
}

// 初始化商品销售排行柱状图
const initProductChart = (data) => {
  if (!productChartRef.value) return

  if (!productChart) {
    productChart = echarts.init(productChartRef.value)
  }

  const names = data.map(item => item.name)
  const values = data.map(item => item.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: {
        interval: 0,
        rotate: 30,
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      name: '销售数量'
    },
    series: [
      {
        name: '销售数量',
        type: 'bar',
        data: values,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ]),
          borderRadius: [8, 8, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#2378f7' },
              { offset: 0.7, color: '#2378f7' },
              { offset: 1, color: '#83bff6' }
            ])
          }
        }
      }
    ]
  }

  productChart.setOption(option)
}

// 快捷操作
const goToProducts = () => {
  router.push('/shop-manage/product/info')
}

const goToOrders = () => {
  router.push('/shop-manage/order/list')
}

const goToProfile = () => {
  router.push('/shop-manage/userInfo')
}

// 窗口大小改变时重新渲染图表
const handleResize = () => {
  if (productChart) {
    productChart.resize()
  }
}

onMounted(() => {
  loadOverview()
  loadProductRank()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (productChart) {
    productChart.dispose()
  }
})
</script>

<style scoped>
.shop-home {
  padding: 0;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 24px;
}

/* 数据卡片区域 */
.stats-cards {
  margin-bottom: 24px;
}

.stat-card {
  margin-bottom: 20px;
  transition: all 0.3s ease;
  border: none;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-right: 20px;
}

.card-products .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-today .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.card-sales .stat-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.card-favorites .stat-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

/* 图表区域 */
.chart-section {
  margin-top: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-container {
  width: 100%;
  height: 400px;
}

/* 快捷操作 */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 0;
  
}

.action-btn {
  width: 100%;
  height: 60px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 !important;
  padding-left: 20px !important;
  padding-right: 20px !important;
}

.action-btn .el-icon {
  font-size: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stat-value {
    font-size: 24px;
  }

  .chart-container {
    height: 300px;
  }

  .action-btn {
    height: 50px;
    font-size: 14px;
  }
}
</style>
