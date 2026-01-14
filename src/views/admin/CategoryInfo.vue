<template>
  <div class="category-info-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">商品分类管理</h2>
      <p class="page-desc">管理平台所有商品分类，包括新增、编辑、删除等操作</p>
    </div>

    <!-- 查询条件区域 -->
    <div class="search-section">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="分类名称">
          <el-input
            v-model="searchForm.categoryName"
            placeholder="请输入分类名称"
            clearable
            style="width: 250px"
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
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增分类
      </el-button>
      <el-button 
        type="danger" 
        :disabled="selectedIds.length === 0"
        @click="handleBatchDelete"
      >
        <el-icon><Delete /></el-icon>
        批量删除 ({{ selectedIds.length }})
      </el-button>
    </div>

    <!-- 分类列表表格 -->
    <div class="table-section">
      <el-table
        v-loading="loading"
        :data="categoryList"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="categoryName" label="分类名称" min-width="200">
          <template #default="{ row }">
            <div class="category-name-cell">
              <span :title="row.categoryName">{{ row.categoryName }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="categoryNote" label="分类备注" min-width="200">
          <template #default="{ row }">
            <span class="note-text">{{ row.categoryNote || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="updateTime" label="修改时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.updateTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
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

    <!-- 新增/编辑分类弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="editForm.id ? '编辑分类' : '新增分类'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="categoryName">
          <el-input 
            v-model="editForm.categoryName" 
            placeholder="请输入分类名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="分类备注" prop="categoryNote">
          <el-input 
            v-model="editForm.categoryNote" 
            type="textarea"
            :rows="3"
            placeholder="请输入分类备注（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saveLoading">
          {{ editForm.id ? '更新' : '新增' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Delete,
  Edit
} from '@element-plus/icons-vue'
import { 
  getCategoryListService,
  addCategoryService, 
  updateCategoryService, 
  deleteCategoryService
} from '@/api/category'

// 响应式数据
const loading = ref(false)
const saveLoading = ref(false)
const categoryList = ref([])
const selectedIds = ref([])

// 搜索表单
const searchForm = reactive({
  categoryName: ''
})

// 分页信息
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 编辑弹窗
const editDialogVisible = ref(false)
const editFormRef = ref()
const editForm = reactive({
  id: null,
  categoryName: '',
  categoryNote: ''
})

// 表单验证规则
const editRules = {
  categoryName: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 50, message: '分类名称长度在1到50个字符', trigger: 'blur' }
  ],
  categoryNote: [
    { max: 200, message: '分类备注长度不能超过200个字符', trigger: 'blur' }
  ]
}

// 获取分类列表
const fetchCategoryList = async () => {
  loading.value = true
  try {
    let res
    const params = {
      page: pagination.page,
      size: pagination.size
    }
    if (searchForm.categoryName && searchForm.categoryName.trim()) {
      params.categoryName = searchForm.categoryName.trim()
      // 根据名称查询
      res = await getCategoryListService(params)
    } else {
      // 获取所有分类
      res = await getCategoryListService(params)
    }
    
    if (res.code === 0) {
      if (Array.isArray(res.data)) {
        categoryList.value = res.data
        pagination.total = res.data.length
      } else if (res.data.items && Array.isArray(res.data.items)) {
        categoryList.value = res.data.items
        pagination.total = res.data.total || res.data.items.length
      } else if (res.data.records && Array.isArray(res.data.records)) {
        categoryList.value = res.data.records
        pagination.total = res.data.total || res.data.records.length
      } else {
        categoryList.value = []
        pagination.total = 0
      }
    } else {
      categoryList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
    categoryList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
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

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchCategoryList()
}

// 重置搜索
const handleReset = () => {
  searchForm.categoryName = ''
  pagination.page = 1
  fetchCategoryList()
}

// 新增分类
const handleAdd = () => {
  resetEditForm()
  editDialogVisible.value = true
}

// 编辑分类
const handleEdit = (row) => {
  Object.assign(editForm, {
    id: row.id,
    categoryName: row.categoryName || '',
    categoryNote: row.categoryNote || ''
  })
  editDialogVisible.value = true
}

// 删除分类
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除分类"${row.categoryName}"吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      const res = await deleteCategoryService(row.id)
      if (res.code === 0) {
        ElMessage.success('删除成功')
        fetchCategoryList()
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
    ElMessage.warning('请选择要删除的分类')
    return
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedIds.value.length} 个分类吗？此操作不可恢复！`,
    '批量删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      const res = await deleteCategoryService(selectedIds.value)
      if (res.code === 0) {
        ElMessage.success(`成功删除 ${selectedIds.value.length} 个分类`)
        selectedIds.value = []
        fetchCategoryList()
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

// 保存分类
const handleSave = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()
    saveLoading.value = true

    const categoryData = {
      categoryName: editForm.categoryName.trim(),
      categoryNote: editForm.categoryNote.trim() || null
    }

    const isEdit = !!editForm.id
    let res

    if (isEdit) {
      categoryData.id = editForm.id
      res = await updateCategoryService(categoryData)
    } else {
      res = await addCategoryService(categoryData)
    }
    
    if (res.code === 0) {
      ElMessage.success(isEdit ? '更新成功' : '新增成功')
      editDialogVisible.value = false
      fetchCategoryList()
    } else {
      ElMessage.error(res.message || (isEdit ? '更新失败' : '新增失败'))
    }
  } catch (error) {
    console.error('保存失败:', error)
    if (error !== 'validation failed') {
      ElMessage.error('保存失败')
    }
  } finally {
    saveLoading.value = false
  }
}

// 重置编辑表单
const resetEditForm = () => {
  Object.assign(editForm, {
    id: null,
    categoryName: '',
    categoryNote: ''
  })
  if (editFormRef.value) {
    editFormRef.value.clearValidate()
  }
}

// 分页大小改变
const handlePageSizeChange = () => {
  pagination.page = 1
  fetchCategoryList()
}

// 页码改变
const handlePageChange = () => {
  fetchCategoryList()
}

// 初始化
onMounted(async () => {
  try {
    await fetchCategoryList()
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('页面初始化失败，请刷新重试')
  }
})
</script>

<style scoped>
.category-info-container {
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

/* 分类名称单元格 */
.category-name-cell {
  max-width: 200px;
}

.category-name-cell span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  color: #303133;
}

/* 备注文本 */
.note-text {
  color: #606266;
  font-style: italic;
}

/* 分页 */
.pagination-wrapper {
  padding: 20px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #f0f0f0;
}

/* 表单样式 */
.el-form-item {
  margin-bottom: 20px;
}

/* 响应式 */
@media (max-width: 768px) {
  .search-form {
    display: block;
  }

  .search-form :deep(.el-form-item) {
    margin-bottom: 16px;
    display: block;
  }

  .search-form :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }

  .action-section {
    flex-direction: column;
  }

  .action-section .el-button {
    width: 100%;
  }
}

/* 表格行悬停效果 */
.el-table :deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

/* 选中行样式 */
.el-table :deep(.el-table__row.current-row) {
  background-color: #ecf5ff;
}

/* 表格头部样式 */
.el-table :deep(.el-table__header-wrapper) {
  background-color: #fafafa;
}

.el-table :deep(.el-table__header th) {
  background-color: #fafafa;
  color: #606266;
  font-weight: 600;
}

/* 操作按钮样式 */
.el-table :deep(.el-button--small) {
  padding: 4px 8px;
  font-size: 12px;
}

/* 弹窗样式 */
.el-dialog :deep(.el-dialog__header) {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 16px 20px;
}

.el-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.el-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.el-dialog :deep(.el-dialog__footer) {
  padding: 16px 20px;
  border-top: 1px solid #e9ecef;
  background-color: #f8f9fa;
}
</style>