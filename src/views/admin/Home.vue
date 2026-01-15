<template>
  <div class="admin-home">
    <h2 class="page-title">数据概览</h2>

    <!-- 数据卡片区域 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card card-users" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">总用户数</div>
              <div class="stat-value">{{ overviewData.totalUsers || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card card-shops" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Shop /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">总店铺数</div>
              <div class="stat-value">{{ overviewData.totalShops || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card card-orders" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><ShoppingCart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">总订单数</div>
              <div class="stat-value">{{ overviewData.totalOrders || 0 }}</div>
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
              <div class="stat-label">总销售额</div>
              <div class="stat-value">¥{{ formatMoney(overviewData.totalSales) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-section">
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">订单状态分布</span>
              <el-button type="primary" text @click="loadOrderStatus">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>
          <div ref="orderChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">数据统计说明</span>
            </div>
          </template>
          <div class="info-panel">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="总用户数">
                系统注册的所有普通用户数量
              </el-descriptions-item>
              <el-descriptions-item label="总店铺数">
                系统中所有店铺的数量
              </el-descriptions-item>
              <el-descriptions-item label="总订单数">
                系统中所有订单的总数
              </el-descriptions-item>
              <el-descriptions-item label="总销售额">
                所有已完成订单的销售总额（不含已取消订单）
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Shop, ShoppingCart, Money, Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getAdminOverviewService, getOrderStatusService } from '@/api/statistics'

// 数据
const overviewData = ref({
  totalUsers: 0,
  totalShops: 0,
  totalOrders: 0,
  totalSales: 0
})

const orderChartRef = ref(null)
let orderChart = null

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
    const res = await getAdminOverviewService()
    overviewData.value = res.data
  } catch (error) {
    ElMessage.error('加载概览数据失败')
    console.error(error)
  }
}

// 加载订单状态分布
const loadOrderStatus = async () => {
  try {
    const res = await getOrderStatusService()
    initOrderChart(res.data)
  } catch (error) {
    ElMessage.error('加载订单状态数据失败')
    console.error(error)
  }
}

// 初始化订单状态饼图
const initOrderChart = (data) => {
  if (!orderChartRef.value) return

  if (!orderChart) {
    orderChart = echarts.init(orderChartRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center'
    },
    series: [
      {
        name: '订单状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data || [],
        color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
      }
    ]
  }

  orderChart.setOption(option)
}

// 窗口大小改变时重新渲染图表
const handleResize = () => {
  if (orderChart) {
    orderChart.resize()
  }
}

onMounted(() => {
  loadOverview()
  loadOrderStatus()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (orderChart) {
    orderChart.dispose()
  }
})
</script>

<style scoped>
.admin-home {
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

.card-users .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-shops .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.card-orders .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.card-sales .stat-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
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

.info-panel {
  padding: 10px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stat-value {
    font-size: 24px;
  }

  .chart-container {
    height: 300px;
  }
}
</style>
