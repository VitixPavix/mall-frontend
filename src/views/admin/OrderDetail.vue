<template>
  <div class="order-detail-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2 class="page-title">订单详情</h2>
      </div>
      <div class="header-right">
        <el-tag :type="getStateType(orderDetail.state)" size="large">
          {{ orderDetail.state }}
        </el-tag>
      </div>
    </div>

    <div v-loading="loading" class="detail-content">
      <!-- 订单基本信息 -->
      <div class="info-card">
        <div class="card-title">订单信息</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">订单号：</span>
            <span class="value">{{ orderDetail.orderNo }}</span>
          </div>
          <div class="info-item">
            <span class="label">下单用户：</span>
            <span class="value">{{ orderDetail.createUserName }}</span>
          </div>
          <div class="info-item">
            <span class="label">店铺名称：</span>
            <span class="value">{{ orderDetail.shopName }}</span>
          </div>
          <div class="info-item">
            <span class="label">店铺用户名：</span>
            <span class="value">{{ orderDetail.shopUserName }}</span>
          </div>
          <div class="info-item">
            <span class="label">下单时间：</span>
            <span class="value">{{ formatDateTime(orderDetail.createTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付时间：</span>
            <span class="value">{{ formatDateTime(orderDetail.payTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付方式：</span>
            <span class="value">{{ orderDetail.payMethod || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">更新时间：</span>
            <span class="value">{{ formatDateTime(orderDetail.updateTime) }}</span>
          </div>
          <div v-if="orderDetail.note" class="info-item full-width">
            <span class="label">订单备注：</span>
            <span class="value">{{ orderDetail.note }}</span>
          </div>
        </div>
      </div>

      <!-- 收货地址信息 -->
      <div class="info-card">
        <div class="card-title">收货信息</div>
        <div class="address-info">
          <div class="address-row">
            <span class="label">收货人：</span>
            <span class="value">{{ orderDetail.recipient }}</span>
          </div>
          <div class="address-row">
            <span class="label">联系电话：</span>
            <span class="value">{{ orderDetail.phone }}</span>
          </div>
          <div class="address-row">
            <span class="label">收货地址：</span>
            <span class="value">{{ orderDetail.address }}</span>
          </div>
        </div>
      </div>

      <!-- 商品明细 -->
      <div class="info-card">
        <div class="card-title">商品明细</div>
        <div class="items-list">
          <div v-for="item in orderDetail.orderItems" :key="item.id" class="item-card">
            <div class="item-main">
              <el-image
                :src="item.productCoverImg"
                fit="cover"
                class="item-image"
              />
              <div class="item-info">
                <div class="item-name">{{ item.productName }}</div>
                <div class="item-price">单价：¥{{ item.unitPrice }}</div>
                <div class="item-quantity">数量：{{ item.num }}</div>
              </div>
              <div class="item-right">
                <div class="item-calc">¥{{ item.unitPrice }} × {{ item.num }}</div>
                <div class="item-subtotal">= ¥{{ item.subtotal }}</div>
              </div>
            </div>

            <!-- 物流信息 -->
            <div v-if="item.logisticsCompany" class="item-logistics">
              <div class="logistics-title">
                <el-icon><Van /></el-icon>
                物流信息
              </div>
              <div class="logistics-info">
                <div class="logistics-row">
                  <span class="label">物流公司：</span>
                  <span class="value">{{ item.logisticsCompany }}</span>
                </div>
                <div class="logistics-row">
                  <span class="label">物流单号：</span>
                  <span class="value">{{ item.trackingNumber }}</span>
                </div>
                <div class="logistics-row">
                  <span class="label">发货时间：</span>
                  <span class="value">{{ formatDateTime(item.shipTime) }}</span>
                </div>
                <div v-if="item.receiveTime" class="logistics-row">
                  <span class="label">签收时间：</span>
                  <span class="value">{{ formatDateTime(item.receiveTime) }}</span>
                </div>
              </div>
            </div>

            <!-- 评价信息 -->
            <div v-if="item.review" class="item-review">
              <div class="review-title">
                <el-icon><ChatDotRound /></el-icon>
                用户评价
              </div>
              <div class="review-content">
                <el-rate v-model="item.reviewStar" disabled />
                <div class="review-text">{{ item.review }}</div>
                <div class="review-time">{{ formatDateTime(item.reviewTime) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单金额 -->
      <div class="info-card">
        <div class="card-title">订单金额</div>
        <div class="amount-info">
          <div class="amount-row">
            <span class="label">商品总额：</span>
            <span class="value calculation">
              <span v-for="(item, index) in orderDetail.orderItems" :key="item.id">
                <span v-if="index > 0"> + </span>
                ¥{{ item.subtotal }}
              </span>
            </span>
          </div>
          <div class="amount-row subtotal">
            <span class="label">小计：</span>
            <span class="value">¥{{ calculateTotal() }}</span>
          </div>
          <div class="amount-row total">
            <span class="label">订单总额：</span>
            <span class="value">¥{{ orderDetail.totalAmount }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Van,
  ChatDotRound
} from '@element-plus/icons-vue'
import { 
  getOrderDetailService
} from '@/api/order'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const orderDetail = ref({
  orderItems: []
})

// 获取订单详情
const fetchOrderDetail = async () => {
  const orderNo = route.query.orderNo
  if (!orderNo) {
    ElMessage.error('订单号不能为空')
    goBack()
    return
  }

  loading.value = true
  try {
    const res = await getOrderDetailService(orderNo)
    if (res.code === 0) {
      orderDetail.value = res.data
    } else {
      ElMessage.error(res.message || '获取订单详情失败')
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  } finally {
    loading.value = false
  }
}

// 返回
const goBack = () => {
  router.back()
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

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 计算订单总额
const calculateTotal = () => {
  if (!orderDetail.value.orderItems || orderDetail.value.orderItems.length === 0) {
    return '0.00'
  }
  const total = orderDetail.value.orderItems.reduce((sum, item) => {
    return sum + parseFloat(item.subtotal || 0)
  }, 0)
  return total.toFixed(2)
}

onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped>
.order-detail-container {
  padding: 0;
}

/* 页面标题 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.back-button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 详情内容 */
.detail-content {
  min-height: 400px;
}

/* 信息卡片 */
.info-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  font-size: 14px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item .label {
  color: #999;
  min-width: 100px;
}

.info-item .value {
  color: #333;
  flex: 1;
}

/* 地址信息 */
.address-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.address-row {
  display: flex;
  font-size: 14px;
}

.address-row .label {
  color: #999;
  min-width: 80px;
}

.address-row .value {
  color: #333;
  flex: 1;
}

/* 商品明细 */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.item-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
}

.item-main {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.item-image {
  width: 100px;
  height: 100px;
  border-radius: 6px;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 16px;
  color: #333;
  font-weight: 500;
  margin-bottom: 8px;
}

.item-price {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.item-quantity {
  font-size: 14px;
  color: #999;
}

.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 150px;
}

.item-calc {
  font-size: 14px;
  color: #999;
}

.item-subtotal {
  font-size: 18px;
  color: #f56c6c;
  font-weight: 600;
}

/* 物流信息 */
.item-logistics {
  background: white;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 12px;
}

.logistics-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 12px;
}

.logistics-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.logistics-row {
  display: flex;
  font-size: 14px;
}

.logistics-row .label {
  color: #999;
  min-width: 80px;
}

.logistics-row .value {
  color: #333;
}

/* 评价信息 */
.item-review {
  background: white;
  border-radius: 6px;
  padding: 16px;
}

.review-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #f56c6c;
  margin-bottom: 12px;
}

.review-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.review-text {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

.review-time {
  font-size: 12px;
  color: #999;
}

/* 订单金额 */
.amount-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  align-items: center;
}

.amount-row .calculation {
  color: #999;
  font-size: 14px;
}

.amount-row.subtotal {
  padding-top: 8px;
  border-top: 1px dashed #e8e8e8;
}

.amount-row.total {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
  padding-top: 12px;
  border-top: 2px solid #f0f0f0;
}

/* 响应式 */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .item-main {
    flex-direction: column;
  }

  .item-image {
    width: 100%;
    height: 200px;
  }
}
</style>
