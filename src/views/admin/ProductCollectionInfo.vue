<template>
  <div class="product-collection-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">商品收藏管理</h2>
      <p class="page-desc">管理平台所有用户的商品收藏记录，包括查看、搜索、删除等操作</p>
    </div>

    <!-- 查询条件区域 -->
    <div class="search-section">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="商品名称">
          <el-input
            v-model="searchForm.productName"
            placeholder="请输入商品名称"
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
        <el-form-item label="用户ID">
          <el-input
            v-model="searchForm.createUserId"
            placeholder="请输入用户ID"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="商品ID">
          <el-input
            v-model="searchForm.productId"
            placeholder="请输入商品ID"
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

    <!-- 商品收藏列表表格 -->
    <div class="table-section">
      <el-table
        v-loading="loading"
        :data="collectionList"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="productId" label="商品ID" width="100" />

        <el-table-column label="封面图" width="100">
          <template #default="{ row }">
            <el-image
              :src="row.productCoverImg || defaultImage"
              :preview-src-list="[row.productCoverImg || defaultImage]"
              fit="cover"
              class="cover-image"
            />
          </template>
        </el-table-column>

        <el-table-column prop="productName" label="商品名称" min-width="150">
          <template #default="{ row }">
            <div class="product-name-cell">
              <span :title="row.productName">{{ row.productName }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="createUserId" label="用户ID" width="100" />

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
  getProductCollectionListService,
  deleteProductCollectionService
} from '@/api/productCollection'

// 默认图片
const defaultImage = 'https://via.placeholder.com/80x80?text=No+Image'

// 响应式数据状态
const loading = ref(false)
const collectionList = ref([])
const selectedIds = ref([])

// 搜索表单
const searchForm = reactive({
  productName: '',
  userName: '',
  createUserId: '',
  productId: ''
})

// 分页信息
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 获取商品收藏列表
const fetchCollectionList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size
    }

    // 添加搜索条件
    if (searchForm.productName && searchForm.productName.trim()) {
      params.productName = searchForm.productName.trim()
    }
    if (searchForm.userName && searchForm.userName.trim()) {
      params.userName = searchForm.userName.trim()
    }
    if (searchForm.createUserId && searchForm.createUserId.trim()) {
      params.createUserId = parseInt(searchForm.createUserId.trim())
    }
    if (searchForm.productId && searchForm.productId.trim()) {
      params.productId = parseInt(searchForm.productId.trim())
    }

    const res = await getProductCollectionListService(params)
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
      ElMessage.error(res.message || '获取商品收藏列表失败')
    }
  } catch (error) {
    console.error('获取商品收藏列表失败:', error)
    ElMessage.error('获取商品收藏列表失败')
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
  searchForm.productName = ''
  searchForm.userName = ''
  searchForm.createUserId = ''
  searchForm.productId = ''
  pagination.page = 1
  fetchCollectionList()
}

// 删除单个收藏
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除商品"${row.productName}"的收藏记录吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      const res = await deleteProductCollectionService(row.productId)
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
      const res = await deleteProductCollectionService(selectedIds.value)
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
  selectedIds.value = selection.map(item => item.productId)
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
    minute: '2-digit'
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
.product-collection-container {
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

.product-name-cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 封面图片 */
.cover-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  cursor: pointer;
}

/* 分页 */
.pagination-wrapper {
  padding: 20px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #f0f0f0;
}
</style>
