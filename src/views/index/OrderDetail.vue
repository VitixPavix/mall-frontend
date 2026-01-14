<template>
  <div class="order-detail-page-wrapper">
    <div class="order-detail-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-left">
          <el-button @click="goBack" type="primary" plain class="back-btn">
            <el-icon><ArrowLeft /></el-icon>
            返回订单列表
          </el-button>
        </div>
        <div class="header-right">
          <el-tag :type="getStateType(orderDetail.state)" size="large">
            {{ orderDetail.state }}
          </el-tag>
        </div>
      </div>

      <div v-loading="loading" class="detail-content">
        <!-- 订单进度 -->
        <div class="info-card">
          <div class="card-title">订单进度</div>
          <el-steps :active="getOrderStep(orderDetail.state)" align-center>
            <el-step title="提交订单" :description="formatDateTime(orderDetail.createTime)" />
            <el-step title="支付订单" :description="formatDateTime(orderDetail.payTime)" />
            <el-step title="商家发货" :description="getShipTime()" />
            <el-step title="确认收货" :description="getReceiveTime()" />
            <el-step title="完成评价" :description="getReviewTime()" />
          </el-steps>
        </div>

        <!-- 收货地址信息 -->
        <div class="info-card">
          <div class="card-title">
            <el-icon><Location /></el-icon>
            收货信息
          </div>
          <div class="address-info">
            <div class="address-main">
              <div class="recipient-name">{{ orderDetail.recipient }}</div>
              <div class="recipient-phone">{{ orderDetail.phone }}</div>
            </div>
            <div class="address-detail">{{ orderDetail.address }}</div>
          </div>
        </div>

        <!-- 店铺信息 -->
        <div class="info-card">
          <div class="card-title">
            <el-icon><Shop /></el-icon>
            店铺信息
          </div>
          <div class="shop-info">
            <span class="shop-name">{{ orderDetail.shopName }}</span>
          </div>
        </div>

        <!-- 商品明细 -->
        <div class="info-card">
          <div class="card-title">
            <el-icon><Box /></el-icon>
            商品明细
          </div>
          <div class="items-list">
            <div v-for="item in orderDetail.orderItems" :key="item.id" class="item-row">
              <div class="item-main">
                <el-image
                  :src="item.productCoverImg"
                  fit="cover"
                  class="item-image"
                />
                <div class="item-info">
                  <div class="item-name">{{ item.productName }}</div>
                  <div class="item-price">单价：¥{{ item.unitPrice }}</div>
                  <div class="item-calc">数量：{{ item.num }}</div>
                </div>
                <div class="item-right">
                  <div class="item-calc-detail">
                    ¥{{ item.unitPrice }} × {{ item.num }}
                  </div>
                  <div class="item-subtotal">= ¥{{ item.subtotal }}</div>
                </div>
              </div>

              <!-- 物流信息 -->
              <div v-if="item.logisticsCompany" class="item-logistics">
                <div class="logistics-header">
                  <el-icon><Van /></el-icon>
                  <span>物流信息</span>
                </div>
                <div class="logistics-body">
                  <div class="logistics-item">
                    <span class="label">物流公司：</span>
                    <span class="value">{{ item.logisticsCompany }}</span>
                  </div>
                  <div class="logistics-item">
                    <span class="label">物流单号：</span>
                    <span class="value">{{ item.trackingNumber }}</span>
                  </div>
                  <div class="logistics-item">
                    <span class="label">发货时间：</span>
                    <span class="value">{{ formatDateTime(item.shipTime) }}</span>
                  </div>
                </div>
              </div>

              <!-- 评价区域 -->
              <div v-if="orderDetail.state === '已签收' && !item.review" class="item-review-action">
                <el-button type="primary" size="small" @click="handleReview(item)">
                  <el-icon><ChatDotRound /></el-icon>
                  评价商品
                </el-button>
              </div>

              <!-- 已评价内容 -->
              <div v-if="item.review" class="item-review-content">
                <div class="review-header">
                  <el-icon><ChatDotRound /></el-icon>
                  <span>我的评价</span>
                </div>
                <div class="review-body">
                  <el-rate v-model="item.reviewStar" disabled />
                  <div class="review-text">{{ item.review }}</div>
                  <div class="review-time">{{ formatDateTime(item.reviewTime) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 订单信息 -->
        <div class="info-card">
          <div class="card-title">订单信息</div>
          <div class="order-info-grid">
            <div class="info-row">
              <span class="label">订单号：</span>
              <span class="value">{{ orderDetail.orderNo }}</span>
            </div>
            <div class="info-row">
              <span class="label">下单时间：</span>
              <span class="value">{{ formatDateTime(orderDetail.createTime) }}</span>
            </div>
            <div class="info-row">
              <span class="label">支付时间：</span>
              <span class="value">{{ formatDateTime(orderDetail.payTime) }}</span>
            </div>
            <div class="info-row">
              <span class="label">支付方式：</span>
              <span class="value">{{ orderDetail.payMethod || '-' }}</span>
            </div>
            <div v-if="orderDetail.note" class="info-row full-width">
              <span class="label">订单备注：</span>
              <span class="value">{{ orderDetail.note }}</span>
            </div>
          </div>
        </div>

        <!-- 费用明细 -->
        <div class="info-card">
          <div class="card-title">费用明细</div>
          <div class="amount-list">
            <div class="amount-row">
              <span class="label">商品总额</span>
              <span class="value calculation">
                <span v-for="(item, index) in orderDetail.orderItems" :key="item.id">
                  <span v-if="index > 0"> + </span>
                  ¥{{ item.subtotal }}
                </span>
              </span>
            </div>
            <div class="amount-row subtotal">
              <span class="label">小计</span>
              <span class="value">¥{{ calculateTotal() }}</span>
            </div>
            <div class="amount-row total">
              <span class="label">实付款</span>
              <span class="value">¥{{ orderDetail.totalAmount }}</span>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-bar">
          <el-button v-if="orderDetail.state === '待支付'" type="danger" size="large" @click="handlePay">
            立即支付
          </el-button>
          <el-button v-if="orderDetail.state === '待支付' || orderDetail.state === '待发货'" size="large" @click="handleCancel">
            取消订单
          </el-button>
          <el-button v-if="orderDetail.state === '已发货'" type="primary" size="large" @click="handleReceive">
            确认收货
          </el-button>
        </div>
      </div>
    </div>

    <!-- 评价对话框 -->
    <el-dialog
      v-model="reviewDialogVisible"
      title="评价商品"
      width="500px"
    >
      <el-form :model="reviewForm" :rules="reviewRules" ref="reviewFormRef" label-width="80px">
        <el-form-item label="商品">
          <div class="review-product">
            <el-image :src="reviewForm.productCoverImg" fit="cover" class="review-product-image" />
            <span>{{ reviewForm.productName }}</span>
          </div>
        </el-form-item>
        <el-form-item label="评分" prop="reviewStar">
          <el-rate v-model="reviewForm.reviewStar" />
        </el-form-item>
        <el-form-item label="评价内容" prop="review">
          <el-input
            v-model="reviewForm.review"
            type="textarea"
            :rows="4"
            placeholder="请输入评价内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmReview" :loading="reviewLoading">
          提交评价
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Location,
  Shop,
  Box,
  Van,
  ChatDotRound
} from '@element-plus/icons-vue'
import { 
  getOrderDetailService,
  payOrderService,
  cancelOrderService,
  receiveOrderService,
  reviewOrderService
} from '@/api/order'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const orderDetail = ref({
  orderItems: []
})
const reviewDialogVisible = ref(false)
const reviewLoading = ref(false)
const reviewFormRef = ref(null)

// 评价表单
const reviewForm = reactive({
  id: null,
  productName: '',
  productCoverImg: '',
  reviewStar: 5,
  review: ''
})

// 评价表单验证规则
const reviewRules = {
  reviewStar: [
    { required: true, message: '请选择评分', trigger: 'change' }
  ],
  review: [
    { required: true, message: '请输入评价内容', trigger: 'blur' },
  ]
}

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
  router.push('/order')
}

// 获取订单步骤
const getOrderStep = (state) => {
  const stepMap = {
    '待支付': 0,
    '待发货': 1,
    '已发货': 2,
    '已签收': 3,
    '已完成': 4,
    '已取消': 0
  }
  return stepMap[state] || 0
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

// 获取发货时间
const getShipTime = () => {
  const item = orderDetail.value.orderItems?.[0]
  return formatDateTime(item?.shipTime)
}

// 获取签收时间
const getReceiveTime = () => {
  const item = orderDetail.value.orderItems?.[0]
  return formatDateTime(item?.receiveTime)
}

// 获取评价时间
const getReviewTime = () => {
  const item = orderDetail.value.orderItems?.[0]
  return formatDateTime(item?.reviewTime)
}

// 支付订单
const handlePay = () => {
  ElMessageBox.confirm(
    `确认支付订单 ${orderDetail.value.orderNo}？`,
    '支付确认',
    {
      confirmButtonText: '确认支付',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await payOrderService({
        orderNo: orderDetail.value.orderNo,
        payMethod: '余额'
      })
      if (res.code === 0) {
        ElMessage.success('支付成功')
        fetchOrderDetail()
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
const handleCancel = () => {
  ElMessageBox.confirm(
    `确定要取消订单 ${orderDetail.value.orderNo} 吗？`,
    '取消订单',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await cancelOrderService(orderDetail.value.orderNo)
      if (res.code === 0) {
        ElMessage.success('订单已取消')
        fetchOrderDetail()
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
const handleReceive = () => {
  ElMessageBox.confirm(
    `确认收货订单 ${orderDetail.value.orderNo}？`,
    '确认收货',
    {
      confirmButtonText: '确认收货',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await receiveOrderService(orderDetail.value.orderNo)
      if (res.code === 0) {
        ElMessage.success('确认收货成功')
        fetchOrderDetail()
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

// 评价商品
const handleReview = (item) => {
  reviewForm.id = item.id
  reviewForm.productName = item.productName
  reviewForm.productCoverImg = item.productCoverImg
  reviewForm.reviewStar = 5
  reviewForm.review = ''
  reviewDialogVisible.value = true
}

// 确认评价
const handleConfirmReview = async () => {
  if (!reviewFormRef.value) return
  
  await reviewFormRef.value.validate(async (valid) => {
    if (valid) {
      reviewLoading.value = true
      try {
        const res = await reviewOrderService({
          id: reviewForm.id,
          reviewStar: reviewForm.reviewStar,
          review: reviewForm.review
        })
        if (res.code === 0) {
          ElMessage.success('评价成功')
          reviewDialogVisible.value = false
          fetchOrderDetail()
        } else {
          ElMessage.error(res.message || '评价失败')
        }
      } catch (error) {
        console.error('评价失败:', error)
        ElMessage.error('评价失败')
      } finally {
        reviewLoading.value = false
      }
    }
  })
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
.order-detail-page-wrapper {
  background-color: #f5f7fa;
  min-height: calc(100vh - 64px);
  padding: 20px 0;
}

.order-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

/* 页面头部 */
.page-header {
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  font-size: 15px;
}

/* 详情内容 */
.detail-content {
  min-height: 400px;
}

/* 信息卡片 */
.info-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 地址信息 */
.address-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.address-main {
  display: flex;
  gap: 20px;
  align-items: center;
}

.recipient-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.recipient-phone {
  font-size: 15px;
  color: #666;
}

.address-detail {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

/* 店铺信息 */
.shop-info {
  font-size: 15px;
}

.shop-name {
  color: #667eea;
  font-weight: 500;
}

/* 商品明细 */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.item-row {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
}

.item-main {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 15px;
  color: #333;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-price {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.item-calc {
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

.item-calc-detail {
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
  padding: 12px;
  margin-bottom: 12px;
}

.logistics-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 8px;
}

.logistics-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.logistics-item {
  font-size: 13px;
  display: flex;
}

.logistics-item .label {
  color: #999;
  min-width: 70px;
}

.logistics-item .value {
  color: #333;
}

/* 评价操作 */
.item-review-action {
  display: flex;
  justify-content: flex-end;
}

/* 评价内容 */
.item-review-content {
  background: white;
  border-radius: 6px;
  padding: 12px;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #f56c6c;
  margin-bottom: 8px;
}

.review-body {
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

/* 订单信息网格 */
.order-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-row {
  display: flex;
  font-size: 14px;
}

.info-row.full-width {
  grid-column: 1 / -1;
}

.info-row .label {
  color: #999;
  min-width: 80px;
}

.info-row .value {
  color: #333;
  flex: 1;
}

/* 费用明细 */
.amount-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  font-size: 15px;
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
  font-size: 20px;
  font-weight: 600;
  color: #f56c6c;
  padding-top: 12px;
  border-top: 2px solid #f0f0f0;
}

/* 操作栏 */
.action-bar {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* 评价对话框 */
.review-product {
  display: flex;
  align-items: center;
  gap: 12px;
}

.review-product-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .order-detail-container {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .order-info-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .item-main {
    flex-wrap: wrap;
  }

  .item-quantity,
  .item-subtotal {
    width: auto;
  }
}
</style>
