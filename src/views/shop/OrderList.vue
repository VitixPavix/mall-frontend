<template>
  <div class="order-list-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">商品订单管理</h2>
      <p class="page-desc">管理店铺的所有订单，包括查看、发货等操作</p>
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
        <el-form-item label="收货人">
          <el-input
            v-model="searchForm.recipient"
            placeholder="请输入收货人"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="收货电话">
          <el-input
            v-model="searchForm.phone"
            placeholder="请输入收货电话"
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
      <el-table
        v-loading="loading"
        :data="orderList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="orderNo" label="订单号" width="200" />
        
        <el-table-column label="订单商品" min-width="250">
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

        <el-table-column label="收货信息" width="200">
          <template #default="{ row }">
            <div class="recipient-info">
              <div>{{ row.recipient }}</div>
              <div>{{ row.phone }}</div>
              <div class="address-text">{{ row.address }}</div>
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
              v-if="row.state === '待发货'"
              type="primary"
              link
              size="small"
              @click="handleShip(row)"
            >
              发货
            </el-button>
            <el-button
              link
              size="small"
              @click="handleViewDetail(row)"
            >
              查看详情
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

    <!-- 发货对话框 -->
    <el-dialog
      v-model="shipDialogVisible"
      title="订单发货"
      width="500px"
    >
      <el-form :model="shipForm" :rules="shipRules" ref="shipFormRef" label-width="100px">
        <el-form-item label="订单号">
          <el-input v-model="shipForm.orderNo" disabled />
        </el-form-item>
        <el-form-item label="物流公司" prop="logisticsCompany">
          <el-input
            v-model="shipForm.logisticsCompany"
            placeholder="请输入物流公司"
          />
        </el-form-item>
        <el-form-item label="物流单号" prop="trackingNumber">
          <el-input
            v-model="shipForm.trackingNumber"
            placeholder="请输入物流单号"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmShip" :loading="shipLoading">
          确认发货
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Search,
  Refresh
} from '@element-plus/icons-vue'
import { 
  getOrderListService,
  shipOrderService
} from '@/api/order'

const router = useRouter()

// 响应式数据状态
const loading = ref(false)
const orderList = ref([])
const shipDialogVisible = ref(false)
const shipLoading = ref(false)
const shipFormRef = ref(null)

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  state: '',
  recipient: '',
  phone: ''
})

// 发货表单
const shipForm = reactive({
  orderNo: '',
  logisticsCompany: '',
  trackingNumber: ''
})

// 发货表单验证规则
const shipRules = {
  logisticsCompany: [
    { required: true, message: '请输入物流公司', trigger: 'blur' }
  ],
  trackingNumber: [
    { required: true, message: '请输入物流单号', trigger: 'blur' }
  ]
}

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
    if (searchForm.recipient && searchForm.recipient.trim()) {
      params.recipient = searchForm.recipient.trim()
    }
    if (searchForm.phone && searchForm.phone.trim()) {
      params.phone = searchForm.phone.trim()
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
  searchForm.recipient = ''
  searchForm.phone = ''
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

// 发货
const handleShip = (row) => {
  shipForm.orderNo = row.orderNo
  shipForm.logisticsCompany = ''
  shipForm.trackingNumber = ''
  shipDialogVisible.value = true
}

// 确认发货
const handleConfirmShip = async () => {
  if (!shipFormRef.value) return
  
  await shipFormRef.value.validate(async (valid) => {
    if (valid) {
      shipLoading.value = true
      try {
        const res = await shipOrderService({
          orderNo: shipForm.orderNo,
          logisticsCompany: shipForm.logisticsCompany,
          trackingNumber: shipForm.trackingNumber
        })
        if (res.code === 0) {
          ElMessage.success('发货成功')
          shipDialogVisible.value = false
          fetchOrderList()
        } else {
          ElMessage.error(res.message || '发货失败')
        }
      } catch (error) {
        console.error('发货失败:', error)
        ElMessage.error('发货失败')
      } finally {
        shipLoading.value = false
      }
    }
  })
}

// 查看详情
const handleViewDetail = (row) => {
  router.push({
    path: '/shop-manage/order/detail',
    query: { orderNo: row.orderNo }
  })
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
.order-list-container {
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

.address-text {
  color: #999;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 分页 */
.pagination-wrapper {
  padding: 20px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #f0f0f0;
}
</style>
