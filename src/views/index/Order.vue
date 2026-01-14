<template>
  <div class="order-page-wrapper">
    <div class="order-container">
      <div class="order-header">
        <h2>我的订单</h2>
      </div>

      <!-- 订单状态筛选 -->
      <div class="order-tabs">
      <div 
        v-for="tab in tabs" 
        :key="tab.value"
        :class="['tab-item', { active: activeTab === tab.value }]"
        @click="handleTabChange(tab.value)"
      >
        {{ tab.label }}
        <span v-if="tab.count > 0" class="count-badge">{{ tab.count }}</span>
      </div>
    </div>

    <!-- 订单列表 -->
    <div v-loading="loading" class="order-list">
      <div v-if="orderList.length === 0" class="empty-state">
        <el-empty description="暂无订单" />
      </div>

      <div v-for="order in orderList" :key="order.id" class="order-card">
        <!-- 订单头部 -->
        <div class="order-header-info">
          <div class="order-no">
            <span class="label">订单号：</span>
            <span class="value">{{ order.orderNo }}</span>
          </div>
          <div class="order-shop">
            <el-icon><Shop /></el-icon>
            <span>{{ order.shopName }}</span>
          </div>
          <div class="order-time">{{ order.createTime }}</div>
        </div>

        <!-- 订单商品列表 -->
        <div class="order-items">
          <div v-for="item in order.orderItems" :key="item.id" class="order-item">
            <el-image 
              :src="item.productCoverImg" 
              fit="cover" 
              class="product-image"
            />
            <div class="product-info">
              <div class="product-name">{{ item.productName }}</div>
              <div class="product-price">¥{{ item.unitPrice }}</div>
            </div>
            <div class="product-quantity">x{{ item.num }}</div>
            <div class="item-subtotal">¥{{ item.subtotal }}</div>
          </div>
        </div>

        <!-- 订单底部 -->
        <div class="order-footer">
          <div class="order-info">
            <div class="order-state">
              <el-tag :type="getStateType(order.state)">{{ order.state }}</el-tag>
            </div>
            <div class="order-total">
              <span class="label">订单总额：</span>
              <span class="amount">¥{{ order.totalAmount }}</span>
            </div>
          </div>
          <div class="order-actions">
            <el-button v-if="order.state === '待支付'" type="danger" size="small" @click="handlePay(order)">
              立即支付
            </el-button>
            <el-button v-if="order.state === '待支付' || order.state === '待发货'" size="small" @click="handleCancel(order)">
              取消订单
            </el-button>
            <el-button v-if="order.state === '已发货'" type="primary" size="small" @click="handleReceive(order)">
              确认收货
            </el-button>
            <el-button size="small" @click="handleViewDetail(order)">
              查看详情
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="pagination.total > 0" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :page-sizes="[5, 10, 20]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchOrderList"
        @current-change="fetchOrderList"
      />
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Shop } from '@element-plus/icons-vue'
import { 
  getOrderListService,
  payOrderService,
  cancelOrderService,
  receiveOrderService
} from '@/api/order'

const router = useRouter()

const loading = ref(false)
const orderList = ref([])
const activeTab = ref('all')

const tabs = ref([
  { label: '全部订单', value: 'all', count: 0 },
  { label: '待支付', value: '待支付', count: 0 },
  { label: '待发货', value: '待发货', count: 0 },
  { label: '已发货', value: '已发货', count: 0 },
  { label: '已签收', value: '已签收', count: 0 },
  { label: '已完成', value: '已完成', count: 0 }
])

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 获取订单列表
const fetchOrderList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size
    }
    
    if (activeTab.value !== 'all') {
      params.state = activeTab.value
    }

    const res = await getOrderListService(params)
    if (res.code === 0) {
      if (res.data.items && Array.isArray(res.data.items)) {
        orderList.value = res.data.items
        pagination.total = res.data.total || 0
      } else if (Array.isArray(res.data)) {
        orderList.value = res.data
        pagination.total = res.data.length
      }
    } else {
      ElMessage.error(res.message || '获取订单列表失败')
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 切换标签
const handleTabChange = (value) => {
  activeTab.value = value
  pagination.page = 1
  fetchOrderList()
}

// 获取状态类型
const getStateType = (state) => {
  const typeMap = {
    '待支付': 'warning',
    '待发货': 'info',
    '已发货': 'primary',
    '已签收': 'success',
    '已完成': 'success',
    '已取消': 'info'
  }
  return typeMap[state] || 'info'
}

// 支付订单
const handlePay = (order) => {
  ElMessageBox.confirm(
    `确认支付订单 ${order.orderNo}？`,
    '支付确认',
    {
      confirmButtonText: '确认支付',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await payOrderService({
        orderNo: order.orderNo,
        payMethod: '余额'
      })
      if (res.code === 0) {
        ElMessage.success('支付成功')
        fetchOrderList()
      } else {
        ElMessage.error(res.message || '支付失败')
      }
    } catch (error) {
      console.error('支付失败:', error)
      ElMessage.error('支付失败')
    }
  }).catch(() => {
    ElMessage.info('已取消支付')
  })
}

// 取消订单
const handleCancel = (order) => {
  ElMessageBox.confirm(
    `确定要取消订单 ${order.orderNo} 吗？`,
    '取消订单',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await cancelOrderService(order.orderNo)
      if (res.code === 0) {
        ElMessage.success('订单已取消')
        fetchOrderList()
      } else {
        ElMessage.error(res.message || '取消失败')
      }
    } catch (error) {
      console.error('取消失败:', error)
      ElMessage.error('取消失败')
    }
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 确认收货
const handleReceive = (order) => {
  ElMessageBox.confirm(
    `确认收货订单 ${order.orderNo}？`,
    '确认收货',
    {
      confirmButtonText: '确认收货',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await receiveOrderService(order.orderNo)
      if (res.code === 0) {
        ElMessage.success('确认收货成功')
        fetchOrderList()
      } else {
        ElMessage.error(res.message || '确认收货失败')
      }
    } catch (error) {
      console.error('确认收货失败:', error)
      ElMessage.error('确认收货失败')
    }
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 查看详情
const handleViewDetail = (order) => {
  router.push({
    path: '/order/detail',
    query: { orderNo: order.orderNo }
  })
}

onMounted(() => {
  fetchOrderList()
})
</script>

<style scoped>
.order-page-wrapper {
  background-color: #f5f7fa;
  min-height: calc(100vh - 64px);
  padding: 20px 0;
}

.order-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.order-container > .order-header,
.order-container > .order-tabs,
.order-container > .order-list,
.order-container > .pagination-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.order-header {
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.order-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

/* 订单标签 */
.order-tabs {
  display: flex;
  border-bottom: 2px solid #f0f0f0;
  background: #fafafa;
  border-radius: 12px 12px 0 0 !important;
}

.tab-item {
  flex: 1;
  padding: 16px 20px;
  text-align: center;
  cursor: pointer;
  font-size: 15px;
  color: #666;
  transition: all 0.3s ease;
  position: relative;
}

.tab-item:hover {
  color: #667eea;
  background: #f5f7ff;
}

.tab-item.active {
  color: #667eea;
  font-weight: 600;
  background: white;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #667eea;
}

.count-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 8px;
  background: #f56c6c;
  color: white;
  border-radius: 10px;
  font-size: 12px;
  font-weight: normal;
}

/* 订单列表 */
.order-list {
  padding: 20px;
  min-height: 400px;
  border-radius: 0 0 12px 12px !important;
}

.empty-state {
  padding: 60px 0;
}

.order-card {
  margin-bottom: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 订单头部信息 */
.order-header-info {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
  gap: 20px;
}

.order-no {
  flex: 1;
  font-size: 14px;
}

.order-no .label {
  color: #999;
}

.order-no .value {
  color: #333;
  font-weight: 500;
}

.order-shop {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #667eea;
  font-size: 14px;
}

.order-time {
  color: #999;
  font-size: 13px;
}

/* 订单商品列表 */
.order-items {
  padding: 20px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px dashed #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 15px;
  color: #333;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  font-size: 14px;
  color: #f56c6c;
  font-weight: 500;
}

.product-quantity {
  color: #999;
  font-size: 14px;
  width: 60px;
  text-align: center;
}

.item-subtotal {
  font-size: 16px;
  color: #f56c6c;
  font-weight: 600;
  width: 100px;
  text-align: right;
}

/* 订单底部 */
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fafafa;
  border-top: 1px solid #e8e8e8;
}

.order-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.order-total {
  font-size: 14px;
}

.order-total .label {
  color: #666;
}

.order-total .amount {
  font-size: 18px;
  color: #f56c6c;
  font-weight: 600;
  margin-left: 8px;
}

.order-actions {
  display: flex;
  gap: 10px;
}

/* 分页 */
.pagination-wrapper {
  padding: 20px;
  display: flex;
  justify-content: center;
  border-top: none;
}

/* 响应式 */
@media (max-width: 1200px) {
  .order-container {
    max-width: 100%;
  }
}
@media (max-width: 768px) {
  .order-header-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .order-item {
    flex-wrap: wrap;
  }

  .product-image {
    width: 60px;
    height: 60px;
  }

  .order-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .order-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
