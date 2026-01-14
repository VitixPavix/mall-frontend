<template>
  <div class="checkout-container">
    <div class="container">
      <div class="page-header">
        <h2>确认订单</h2>
      </div>

      <div v-loading="loading" class="checkout-content">
        <!-- 收货地址 -->
        <div class="section address-section">
          <div class="section-title">
            <el-icon><Location /></el-icon>
            <span>收货地址</span>
          </div>
          
          <div v-if="addressList.length === 0" class="empty-address">
            <el-empty description="暂无收货地址">
              <el-button type="primary" @click="handleAddAddress">添加收货地址</el-button>
            </el-empty>
          </div>

          <div v-else class="address-list">
            <div
              v-for="addr in addressList"
              :key="addr.id"
              :class="['address-item', { active: selectedAddressId === addr.id }]"
              @click="selectedAddressId = addr.id"
            >
              <div class="address-info">
                <div class="address-header">
                  <span class="recipient">{{ addr.name }}</span>
                  <span class="phone">{{ addr.phone }}</span>
                  <el-tag v-if="addr.isDefault === 1" type="danger" size="small">默认</el-tag>
                </div>
                <div class="address-detail">
                  {{ addr.province }} {{ addr.city }} {{ addr.district }} {{ addr.address }}
                </div>
              </div>
              <div v-if="selectedAddressId === addr.id" class="selected-icon">
                <el-icon color="#67C23A"><CircleCheck /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- 商品清单 -->
        <div class="section goods-section">
          <div class="section-title">
            <el-icon><ShoppingBag /></el-icon>
            <span>商品清单</span>
          </div>

          <div class="goods-list">
            <div v-for="item in goodsList" :key="item.id" class="goods-item">
              <el-image :src="item.productImg" fit="cover" class="goods-image" />
              <div class="goods-info">
                <div class="goods-name">{{ item.productName }}</div>
                <div class="goods-price">¥{{ item.price }}</div>
              </div>
              <div class="goods-quantity">x{{ item.num }}</div>
              <div class="goods-subtotal">¥{{ (item.price * item.num).toFixed(2) }}</div>
            </div>
          </div>
        </div>

        <!-- 订单备注 -->
        <div class="section remark-section">
          <div class="section-title">
            <el-icon><Edit /></el-icon>
            <span>订单备注</span>
          </div>
          <el-input
            v-model="remark"
            type="textarea"
            :rows="3"
            placeholder="选填，可以告诉商家您的特殊需求"
            maxlength="200"
            show-word-limit
          />
        </div>

        <!-- 订单汇总 -->
        <div class="section summary-section">
          <div class="summary-item">
            <span class="label">商品总额</span>
            <span class="value">¥{{ totalAmount.toFixed(2) }}</span>
          </div>
          <div class="summary-item total">
            <span class="label">应付总额</span>
            <span class="value">¥{{ totalAmount.toFixed(2) }}</span>
          </div>
        </div>

        <!-- 提交订单 -->
        <div class="submit-section">
          <el-button
            type="primary"
            size="large"
            :loading="submitting"
            :disabled="!selectedAddressId || goodsList.length === 0"
            @click="handleSubmit"
          >
            提交订单
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Location,
  ShoppingBag,
  Edit,
  CircleCheck
} from '@element-plus/icons-vue'
import { getAddressListService } from '@/api/address'
import { getCartListService } from '@/api/cart'
import { getProductDetailService } from '@/api/product'
import {
  createOrderFromCartService,
  createOrderDirectService
} from '@/api/order'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const addressList = ref([])
const selectedAddressId = ref(null)
const goodsList = ref([])
const remark = ref('')

// 订单类型：cart（购物车结算）或 direct（立即购买）
const orderType = computed(() => route.query.type || 'cart')

// 计算总金额
const totalAmount = computed(() => {
  return goodsList.value.reduce((sum, item) => {
    return sum + item.price * item.num
  }, 0)
})

// 获取收货地址列表
const fetchAddressList = async () => {
  try {
    const res = await getAddressListService()
    if (res.code === 0) {
      addressList.value = Array.isArray(res.data) ? res.data : []
      // 自动选择默认地址
      const defaultAddr = addressList.value.find(addr => addr.isDefault === 1)
      if (defaultAddr) {
        selectedAddressId.value = defaultAddr.id
      } else if (addressList.value.length > 0) {
        selectedAddressId.value = addressList.value[0].id
      }
    }
  } catch (error) {
    console.error('获取地址列表失败:', error)
  }
}

// 获取商品信息
const fetchGoodsInfo = async () => {
  loading.value = true
  try {
    if (orderType.value === 'cart') {
      // 从购物车结算
      const cartIds = route.query.cartIds ? route.query.cartIds.split(',').map(Number) : []
      if (cartIds.length === 0) {
        ElMessage.error('购物车商品为空')
        router.back()
        return
      }

      const res = await getCartListService()
      if (res.code === 0) {
        const allCarts = Array.isArray(res.data) ? res.data : (res.data.items || [])
        goodsList.value = allCarts
          .filter(cart => cartIds.includes(cart.id))
          .map(cart => ({
            id: cart.id,
            productId: cart.productId,
            productName: cart.productName,
            productImg: cart.coverImg,
            price: parseFloat(cart.productPrice),
            num: cart.num
          }))
      }
    } else {
      // 立即购买
      const productId = parseInt(route.query.productId)
      const num = parseInt(route.query.num) || 1

      if (!productId) {
        ElMessage.error('商品信息错误')
        router.back()
        return
      }

      const res = await getProductDetailService(productId)
      if (res.code === 0 && res.data) {
        goodsList.value = [{
          productId: res.data.id,
          productName: res.data.name,
          productImg: res.data.coverImg,
          price: parseFloat(res.data.price),
          num: num
        }]
      }
    }
  } catch (error) {
    console.error('获取商品信息失败:', error)
    ElMessage.error('获取商品信息失败')
  } finally {
    loading.value = false
  }
}

// 添加地址
const handleAddAddress = () => {
  router.push('/userCenter/address')
}

// 提交订单
const handleSubmit = async () => {
  if (!selectedAddressId.value) {
    ElMessage.warning('请选择收货地址')
    return
  }

  if (goodsList.value.length === 0) {
    ElMessage.warning('商品列表为空')
    return
  }

  submitting.value = true
  try {
    let res
    if (orderType.value === 'cart') {
      // 购物车结算
      const cartIds = route.query.cartIds.split(',').map(Number)
      res = await createOrderFromCartService({
        cartIds: cartIds,
        addressId: selectedAddressId.value,
        remark: remark.value || undefined
      })
    } else {
      // 立即购买
      res = await createOrderDirectService({
        items: goodsList.value.map(item => ({
          productId: item.productId,
          num: item.num
        })),
        addressId: selectedAddressId.value,
        remark: remark.value || undefined
      })
    }

    if (res.code === 0) {
      ElMessage.success(res.data.message || '订单创建成功')
      // 跳转到订单列表
      router.push('/order')
    } else {
      ElMessage.error(res.message || '订单创建失败')
    }
  } catch (error) {
    console.error('提交订单失败:', error)
    ElMessage.error('提交订单失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchAddressList()
  fetchGoodsInfo()
})
</script>

<style scoped>
.checkout-container {
  min-height: calc(100vh - 64px);
  background-color: #f5f7fa;
  padding: 20px 0;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 15px;
}

.page-header {
  background: white;
  padding: 20px 24px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.checkout-content {
  min-height: 400px;
}

.section {
  background: white;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

/* 收货地址 */
.empty-address {
  padding: 40px 0;
}

.address-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.address-item {
  position: relative;
  padding: 16px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.address-item:hover {
  border-color: #67C23A;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.2);
}

.address-item.active {
  border-color: #67C23A;
  background: #f0f9ff;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.recipient {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.phone {
  font-size: 14px;
  color: #666;
}

.address-detail {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.selected-icon {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 24px;
}

/* 商品清单 */
.goods-list {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.goods-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.goods-item:last-child {
  border-bottom: none;
}

.goods-image {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  flex-shrink: 0;
}

.goods-info {
  flex: 1;
  min-width: 0;
}

.goods-name {
  font-size: 15px;
  color: #333;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-price {
  font-size: 14px;
  color: #f56c6c;
  font-weight: 500;
}

.goods-quantity {
  color: #999;
  font-size: 14px;
  width: 60px;
  text-align: center;
}

.goods-subtotal {
  font-size: 16px;
  color: #f56c6c;
  font-weight: 600;
  width: 100px;
  text-align: right;
}

/* 订单汇总 */
.summary-section {
  background: #fafafa;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  font-size: 15px;
}

.summary-item.total {
  padding-top: 16px;
  border-top: 1px dashed #e8e8e8;
  margin-top: 8px;
}

.summary-item.total .label {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.summary-item.total .value {
  font-size: 24px;
  font-weight: 700;
  color: #f56c6c;
}

/* 提交订单 */
.submit-section {
  text-align: right;
}

.submit-section .el-button {
  min-width: 200px;
}

/* 响应式 */
@media (max-width: 768px) {
  .address-list {
    grid-template-columns: 1fr;
  }

  .goods-item {
    flex-wrap: wrap;
  }

  .goods-image {
    width: 60px;
    height: 60px;
  }
}
</style>
