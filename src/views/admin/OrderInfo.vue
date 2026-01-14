<template>
  <div class="order-info-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">商品订单管理</h2>
      <p class="page-desc">管理平台所有订单，包括查看、搜索、删除等操作</p>
    </div>

    <!-- 查询条件区域 -->
    <div class="search-section">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="订单号">
          <el-input
            v-model="searchForm.orderNo"
            placeholder="请输入订单号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select
            v-model="searchForm.state"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="待支付" value="待支付" />
            <el-option label="待发货" value="待发货" />
            <el-option label="已发货" value="已发货" />
            <el-option label="已签收" value="已签收" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </el-form-item>
        <el-form-item label="下单用户">
          <el-input
            v-model="searchForm.createUserName"
            placeholder="请输入用户名"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="店铺名称">
          <el-input
            v-model="searchForm.shopName"
            placeholder="请输入店铺名称"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="收货人">
          <el-input
            v-model="searchForm.recipient"
            placeholder="请输入收货人"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 订单列表表格 -->
    <div class="table-section">
      <!-- 操作按钮区域 -->
      <div class="action-section">
        <el-button 
          type="danger" 
          :disabled="selectedIds.length === 0"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除 ({{ selectedIds.length }})
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="orderList"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="orderNo" label="订单号" width="200" />
        
        <el-table-column label="订单商品" min-width="200">
          <template #default="{ row }">
            <div v-for="item in row.orderItems" :key="item.id" class="order-item">
              <el-image
                :src="item.productCoverImg"
                fit="cover"
                class="product-image"
              />
              <div class="product-info">
                <div class="product-name">{{ item.productName }}</div>
                <div class="product-detail">¥{{ item.unitPrice }} x {{ item.num }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="totalAmount" label="订单金额" width="100">
          <template #default="{ row }">
            <span class="price-text">¥{{ row.totalAmount }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="createUserName" label="下单用户" width="120" />

        <el-table-column prop="shopName" label="店铺名称" width="150" />

        <el-table-column label="收货信息" width="180">
          <template #default="{ row }">
            <div class="recipient-info">
              <div>{{ row.recipient }}</div>
              <div>{{ row.phone }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="state" label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStateType(row.state)">{{ row.state }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="下单时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              size="small"
              @click="handleViewDetail(row)"
            >
              查看详情
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Delete
} from '@element-plus/icons-vue'
import { 
  getOrderListService,
  deleteOrderService
} from '@/api/order'

const router = useRouter()

// 响应式数据状态
const loading = ref(false)
const orderList = ref([])
const selectedIds = ref([])

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  state: '',
  createUserName: '',
  shopName: '',
  recipient: ''
})

// 分页信息
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

    // 添加搜索条件
    if (searchForm.orderNo && searchForm.orderNo.trim()) {
      params.orderNo = searchForm.orderNo.trim()
    }
    if (searchForm.state) {
      params.state = searchForm.state
    }
    if (searchForm.createUserName && searchForm.createUserName.trim()) {
      params.createUserName = searchForm.createUserName.trim()
    }
    if (searchForm.shopName && searchForm.shopName.trim()) {
      params.shopName = searchForm.shopName.trim()
    }
    if (searchForm.recipient && searchForm.recipient.trim()) {
      params.recipient = searchForm.recipient.trim()
    }

    const res = await getOrderListService(params)
    if (res.code === 0) {
      let rawData = []
      
      if (res.data.items && Array.isArray(res.data.items)) {
        rawData = res.data.items
        pagination.total = res.data.total || 0
      } else if (Array.isArray(res.data)) {
        rawData = res.data
        pagination.total = res.data.length
      }

      orderList.value = rawData
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

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchOrderList()
}

// 重置搜索
const handleReset = () => {
  searchForm.orderNo = ''
  searchForm.state = ''
  searchForm.createUserName = ''
  searchForm.shopName = ''
  searchForm.recipient = ''
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

// 查看详情
const handleViewDetail = (row) => {
  router.push({
    path: '/admin/order/detail',
    query: { orderNo: row.orderNo }
  })
}

// 删除订单
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除订单 ${row.orderNo} 吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      const res = await deleteOrderService(row.id)
      if (res.code === 0) {
        ElMessage.success('删除成功')
        fetchOrderList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 批量删除订单
const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的订单')
    return
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedIds.value.length} 个订单吗？此操作不可恢复！`,
    '批量删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      const res = await deleteOrderService(selectedIds.value)
      if (res.code === 0) {
        ElMessage.success(`成功删除 ${selectedIds.value.length} 个订单`)
        selectedIds.value = []
        fetchOrderList()
      } else {
        ElMessage.error(res.message || '批量删除失败')
      }
    } catch (error) {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

// 分页大小改变
const handlePageSizeChange = () => {
  pagination.page = 1
  fetchOrderList()
}

// 页码改变
const handlePageChange = () => {
  fetchOrderList()
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

// 初始化
onMounted(async () => {
  try {
    await fetchOrderList()
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('页面初始化失败，请刷新重试')
  }
})
</script>

<style scoped>
.order-info-container {
  padding: 0;
}

/* 页面标题 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.page-desc {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

/* 搜索区域 */
.search-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.search-form {
  margin: 0;
}

/* 表格区域 */
.table-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  padding: 20px;
}

/* 操作按钮区域 */
.action-section {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

/* 订单商品 */
.order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px dashed #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-detail {
  font-size: 13px;
  color: #999;
}

/* 价格文本 */
.price-text {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
}

/* 收货信息 */
.recipient-info {
  font-size: 13px;
  line-height: 1.6;
}

.recipient-info > div {
  margin-bottom: 4px;
}

/* 分页 */
.pagination-wrapper {
  padding: 20px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #f0f0f0;
}
</style>
