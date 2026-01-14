<template>
  <div class="address-info-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">收货地址管理</h2>
      <p class="page-desc">管理平台所有用户的收货地址信息，包括查看、搜索、删除等操作</p>
    </div>

    <!-- 查询条件区域 -->
    <div class="search-section">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="姓名">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入收货人姓名"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="电话">
          <el-input
            v-model="searchForm.phone"
            placeholder="请输入联系电话"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="地址">
          <el-input
            v-model="searchForm.address"
            placeholder="请输入详细地址"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.userName"
            placeholder="请输入用户名"
            clearable
            style="width: 200px"
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

    <!-- 收货地址列表表格 -->
    <div class="table-section">
      <el-table
        v-loading="loading"
        :data="addressList"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="name" label="姓名" width="120">
          <template #default="{ row }">
            <span :title="row.name">{{ row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="phone" label="电话" width="130" />

        <el-table-column prop="address" label="地址" min-width="200">
          <template #default="{ row }">
            <div class="address-cell">
              <span :title="row.address">{{ row.address }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="userName" label="用户名" width="120" />

        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="updateTime" label="更新时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.updateTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Delete
} from '@element-plus/icons-vue'
import { 
  getAddressListService,
  deleteAddressService
} from '@/api/address'

// 响应式数据状态
const loading = ref(false)
const addressList = ref([])
const selectedIds = ref([])

// 搜索表单
const searchForm = reactive({
  name: '',
  phone: '',
  address: '',
  userName: ''
})

// 分页信息
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 获取收货地址列表
const fetchAddressList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size
    }

    // 添加搜索条件
    if (searchForm.name && searchForm.name.trim()) {
      params.name = searchForm.name.trim()
    }
    if (searchForm.phone && searchForm.phone.trim()) {
      params.phone = searchForm.phone.trim()
    }
    if (searchForm.address && searchForm.address.trim()) {
      params.address = searchForm.address.trim()
    }
    if (searchForm.userName && searchForm.userName.trim()) {
      params.userName = searchForm.userName.trim()
    }

    const res = await getAddressListService(params)
    if (res.code === 0) {
      let rawData = []
      
      if (res.data.items && Array.isArray(res.data.items)) {
        rawData = res.data.items
        pagination.total = res.data.total || 0
      } else if (Array.isArray(res.data)) {
        rawData = res.data
        pagination.total = res.data.length
      }

      addressList.value = rawData
    } else {
      ElMessage.error(res.message || '获取收货地址列表失败')
    }
  } catch (error) {
    console.error('获取收货地址列表失败:', error)
    ElMessage.error('获取收货地址列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchAddressList()
}

// 重置搜索
const handleReset = () => {
  searchForm.name = ''
  searchForm.phone = ''
  searchForm.address = ''
  searchForm.userName = ''
  pagination.page = 1
  fetchAddressList()
}

// 删除单个地址
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除收货人"${row.name}"的地址吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      const res = await deleteAddressService(row.id)
      if (res.code === 0) {
        ElMessage.success('删除成功')
        fetchAddressList()
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

// 批量删除
const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的收货地址')
    return
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedIds.value.length} 条收货地址吗？此操作不可恢复！`,
    '批量删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      const res = await deleteAddressService(selectedIds.value)
      if (res.code === 0) {
        ElMessage.success(`成功删除 ${selectedIds.value.length} 条收货地址`)
        selectedIds.value = []
        fetchAddressList()
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
  fetchAddressList()
}

// 页码改变
const handlePageChange = () => {
  fetchAddressList()
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
    await fetchAddressList()
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('页面初始化失败，请刷新重试')
  }
})
</script>

<style scoped>
.address-info-container {
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

/* 操作按钮区域 */
.action-section {
  background: white;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 12px;
}

/* 表格区域 */
.table-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.address-cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 分页 */
.pagination-wrapper {
  padding: 20px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #f0f0f0;
}
</style>
