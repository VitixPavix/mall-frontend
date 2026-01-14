<template>
  <div class="shop-collection-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">店铺收藏管理</h2>
      <p class="page-desc">管理平台所有用户的店铺收藏记录，包括查看、搜索、删除等操作</p>
    </div>

    <!-- 查询条件区域 -->
    <div class="search-section">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="店铺名称">
          <el-input
            v-model="searchForm.shopName"
            placeholder="请输入店铺名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.createUserName"
            placeholder="请输入用户名"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input
            v-model="searchForm.createUserId"
            placeholder="请输入用户ID"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="店铺ID">
          <el-input
            v-model="searchForm.shopId"
            placeholder="请输入店铺ID"
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

    <!-- 店铺收藏列表表格 -->
    <div class="table-section">
      <el-table
        v-loading="loading"
        :data="collectionList"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="id" label="收藏ID" width="100" />

        <el-table-column prop="shopId" label="店铺ID" width="100" />

        <el-table-column prop="shopName" label="店铺名称" min-width="180">
          <template #default="{ row }">
            <div class="shop-name-cell">
              <span :title="row.shopName">{{ row.shopName || '-' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="createUserId" label="用户ID" width="100" />

        <el-table-column prop="createUserName" label="用户名" width="150">
          <template #default="{ row }">
            {{ row.createUserName || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="updateTime" label="更新时间" width="180">
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
  getShopCollectionListService,
  deleteShopCollectionService
} from '@/api/shopCollection'

// 响应式数据状态
const loading = ref(false)
const collectionList = ref([])
const selectedIds = ref([])

// 搜索表单
const searchForm = reactive({
  shopName: '',
  createUserName: '',
  createUserId: '',
  shopId: ''
})

// 分页信息
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 获取店铺收藏列表
const fetchCollectionList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size
    }

    // 添加搜索条件
    if (searchForm.shopName && searchForm.shopName.trim()) {
      params.shopName = searchForm.shopName.trim()
    }
    if (searchForm.createUserName && searchForm.createUserName.trim()) {
      params.createUserName = searchForm.createUserName.trim()
    }
    if (searchForm.createUserId && searchForm.createUserId.trim()) {
      params.createUserId = parseInt(searchForm.createUserId.trim())
    }
    if (searchForm.shopId && searchForm.shopId.trim()) {
      params.shopId = parseInt(searchForm.shopId.trim())
    }

    const res = await getShopCollectionListService(params)
    if (res.code === 0) {
      let rawData = []
      
      if (res.data.items && Array.isArray(res.data.items)) {
        rawData = res.data.items
        pagination.total = res.data.total || 0
      } else if (Array.isArray(res.data)) {
        rawData = res.data
        pagination.total = res.data.length
      }

      collectionList.value = rawData
    } else {
      ElMessage.error(res.message || '获取店铺收藏列表失败')
    }
  } catch (error) {
    console.error('获取店铺收藏列表失败:', error)
    ElMessage.error('获取店铺收藏列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchCollectionList()
}

// 重置搜索
const handleReset = () => {
  searchForm.shopName = ''
  searchForm.createUserName = ''
  searchForm.createUserId = ''
  searchForm.shopId = ''
  pagination.page = 1
  fetchCollectionList()
}

// 删除单个收藏
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除店铺"${row.shopName || row.shopId}"的收藏记录吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      const res = await deleteShopCollectionService(row.shopId)
      if (res.code === 0) {
        ElMessage.success('删除成功')
        fetchCollectionList()
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
    ElMessage.warning('请选择要删除的收藏记录')
    return
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedIds.value.length} 条收藏记录吗？此操作不可恢复！`,
    '批量删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      const res = await deleteShopCollectionService(selectedIds.value)
      if (res.code === 0) {
        ElMessage.success(`成功删除 ${selectedIds.value.length} 条收藏记录`)
        selectedIds.value = []
        fetchCollectionList()
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
  selectedIds.value = selection.map(item => item.shopId)
}

// 分页大小改变
const handlePageSizeChange = () => {
  pagination.page = 1
  fetchCollectionList()
}

// 页码改变
const handlePageChange = () => {
  fetchCollectionList()
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
    minute: '2-digit',
    second: '2-digit'
  })
}

// 初始化
onMounted(async () => {
  try {
    await fetchCollectionList()
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('页面初始化失败，请刷新重试')
  }
})
</script>

<style scoped>
.shop-collection-container {
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

.shop-name-cell {
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
