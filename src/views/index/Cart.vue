<template>
  <div class="cart-container">
    <div class="cart-page">
      <div class="page-header">
        <h2>购物车</h2>
        <div class="header-actions">
          <el-button 
            type="danger" 
            :disabled="selectedIds.length === 0"
            @click="handleBatchDelete"
          >
            <el-icon><Delete /></el-icon>
            批量删除 ({{ selectedIds.length }})
          </el-button>
        </div>
      </div>

    <!-- 购物车列表 -->
    <div v-loading="loading" class="cart-content">
      <el-empty v-if="cartList.length === 0" description="购物车是空的，快去选购商品吧~">
        <el-button type="primary" @click="goToProducts">去逛逛</el-button>
      </el-empty>

      <div v-else class="cart-list">
        <!-- 表格 -->
        <el-table
          :data="cartList"
          @selection-change="handleSelectionChange"
          stripe
          style="width: 100%"
        >
          <el-table-column type="selection" width="55" />
          
          <el-table-column label="商品信息" min-width="300">
            <template #default="{ row }">
              <div class="product-info">
                <el-image
                  :src="row.coverImg || defaultImage"
                  fit="cover"
                  class="product-image"
                />
                <div class="product-detail">
                  <div class="product-name">{{ row.productName || '商品已下架' }}</div>
                  <div class="product-shop">店铺：{{ row.shopUserName || '未知' }}</div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="单价" width="120">
            <template #default="{ row }">
              <span class="price">¥{{ row.productPrice || 0 }}</span>
            </template>
          </el-table-column>

          <el-table-column label="数量" width="180">
            <template #default="{ row }">
              <el-input-number
                v-model="row.num"
                :min="1"
                :max="999"
                @change="handleQuantityChange(row)"
              />
            </template>
          </el-table-column>

          <el-table-column label="小计" width="120">
            <template #default="{ row }">
              <span class="subtotal">¥{{ ((row.productPrice || 0) * row.num).toFixed(2) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button type="danger" link @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 底部结算栏 -->
        <div class="cart-footer">
          <div class="footer-left">
            <el-checkbox
              v-model="selectAll"
              @change="handleSelectAll"
            >
              全选
            </el-checkbox>
            <span class="selected-count">已选 {{ selectedIds.length }} 件商品</span>
          </div>
          
          <div class="footer-right">
            <div class="total-info">
              <span class="total-label">合计：</span>
              <span class="total-price">¥{{ totalPrice }}</span>
            </div>
            <el-button
              type="primary"
              size="large"
              :disabled="selectedIds.length === 0"
              @click="handleCheckout"
            >
              结算 ({{ selectedIds.length }})
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="pagination.total > pagination.size" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next"
        @size-change="handlePageSizeChange"
        @current-change="handlePageChange"
      />
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import {
  getCartListService,
  updateCartService,
  deleteCartService
} from '@/api/cart'

const router = useRouter()
const loading = ref(false)
const cartList = ref([])
const selectedIds = ref([])
const selectAll = ref(false)
const defaultImage = 'https://via.placeholder.com/80x80?text=No+Image'

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 计算总价
const totalPrice = computed(() => {
  const selected = cartList.value.filter(item => selectedIds.value.includes(item.id))
  const total = selected.reduce((sum, item) => {
    return sum + (item.productPrice || 0) * item.num
  }, 0)
  return total.toFixed(2)
})

// 获取购物车列表
const fetchCartList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size
    }
    const res = await getCartListService(params)
    if (res.code === 0) {
      if (res.data.items) {
        // 为每个购物车项添加商品名称（如果后端没有返回）
        cartList.value = res.data.items.map(item => ({
          ...item,
          productName: item.productName || `商品ID: ${item.productId}`
        }))
        pagination.total = res.data.total || 0
      } else if (Array.isArray(res.data)) {
        cartList.value = res.data.map(item => ({
          ...item,
          productName: item.productName || `商品ID: ${item.productId}`
        }))
        pagination.total = res.data.length
      }
    }
  } catch (error) {
    console.error('获取购物车列表失败:', error)
    ElMessage.error('获取购物车列表失败')
  } finally {
    loading.value = false
  }
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
  selectAll.value = selection.length === cartList.value.length && cartList.value.length > 0
}

// 全选/取消全选
const handleSelectAll = (val) => {
  // 这个功能需要通过表格的 toggleAllSelection 方法实现
  // 由于我们没有表格的 ref，这里只是更新状态
  // 实际实现需要在模板中添加 ref
}

// 修改数量
const handleQuantityChange = async (row) => {
  try {
    const res = await updateCartService({
      id: row.id,
      num: row.num
    })
    if (res.code === 0) {
      ElMessage.success('修改成功')
    } else {
      ElMessage.error(res.message || '修改失败')
      fetchCartList() // 刷新列表恢复原值
    }
  } catch (error) {
    console.error('修改失败:', error)
    ElMessage.error('修改失败')
    fetchCartList()
  }
}

// 删除单个商品
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteCartService(row.id)
      if (res.code === 0) {
        ElMessage.success('删除成功')
        fetchCartList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

// 批量删除
const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 件商品吗？`, '批量删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteCartService(selectedIds.value)
      if (res.code === 0) {
        ElMessage.success('删除成功')
        selectedIds.value = []
        fetchCartList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

// 结算
const handleCheckout = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }
  // 跳转到订单结算页面
  router.push({
    path: '/checkout',
    query: {
      type: 'cart',
      cartIds: selectedIds.value.join(',')
    }
  })
}

// 去商品列表
const goToProducts = () => {
  router.push('/products')
}

// 分页
const handlePageSizeChange = () => {
  pagination.page = 1
  fetchCartList()
}

const handlePageChange = () => {
  fetchCartList()
}

onMounted(() => {
  fetchCartList()
})
</script>

<style scoped>
.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 15px;
}

.cart-page {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  min-height: 600px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.cart-content {
  min-height: 400px;
}

.cart-list {
  margin-bottom: 20px;
}

/* 商品信息 */
.product-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  flex-shrink: 0;
}

.product-detail {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-shop {
  font-size: 12px;
  color: #909399;
}

.price {
  font-size: 16px;
  font-weight: 600;
  color: #ff5000;
}

.subtotal {
  font-size: 18px;
  font-weight: 700;
  color: #ff5000;
}

/* 底部结算栏 */
.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-top: 20px;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.selected-count {
  font-size: 14px;
  color: #606266;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.total-info {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.total-label {
  font-size: 16px;
  color: #606266;
}

.total-price {
  font-size: 24px;
  font-weight: 700;
  color: #ff5000;
}

.pagination-wrapper {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
}

/* 响应式 */
@media (max-width: 768px) {
  .cart-footer {
    flex-direction: column;
    gap: 16px;
  }

  .footer-left,
  .footer-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
