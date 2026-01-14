<template>
  <div class="carousel-info-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">轮播图管理</h2>
      <p class="page-desc">管理商城首页轮播图，支持添加、编辑、删除操作</p>
    </div>

    <!-- 查询条件区域 -->
    <div class="search-section">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="标题">
          <el-input
            v-model="searchForm.title"
            placeholder="请输入标题"
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
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加轮播图
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

    <!-- 数据表格 -->
    <div class="table-section">
      <el-table
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="封面图" width="120">
          <template #default="{ row }">
            <el-image
              :src="row.coverImg"
              :preview-src-list="[row.coverImg]"
              fit="cover"
              class="table-image"
            />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="150" />
        <el-table-column prop="link" label="跳转链接" min-width="200" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
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
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        :model="formData"
        :rules="formRules"
        ref="formRef"
        label-width="100px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="封面图" prop="coverImg">
          <el-upload
            class="avatar-uploader"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
            :before-upload="beforeUpload"
          >
            <img v-if="formData.coverImg" :src="formData.coverImg" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">建议尺寸：1920x600px</div>
        </el-form-item>
        <el-form-item label="跳转链接" prop="link">
          <el-input v-model="formData.link" placeholder="请输入跳转链接" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Refresh,
  Delete,
  Edit
} from '@element-plus/icons-vue'
import {
  getCarouselListService,
  addCarouselService,
  updateCarouselService,
  deleteCarouselService
} from '@/api/carousel'
import { uploadImageService } from '@/api/upload'

// 搜索表单
const searchForm = reactive({
  title: ''
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const selectedIds = ref([])

// 分页
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('添加轮播图')
const submitLoading = ref(false)
const formRef = ref(null)

// 表单数据
const formData = reactive({
  id: null,
  title: '',
  coverImg: '',
  link: '',
  sort: 0
})

// 表单验证规则
const formRules = {
  // title: [
  //   { required: true, message: '请输入标题', trigger: 'blur' }
  // ],
  coverImg: [
    { required: true, message: '请上传封面图', trigger: 'change' }
  ]
}

// 当前上传的文件
const currentFile = ref(null)

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      page: pagination.page,
      size: pagination.size
    }
    const res = await getCarouselListService(params)
    if (res.code === 0) {
      if (res.data.items) {
        tableData.value = res.data.items
        pagination.total = res.data.total
      } else {
        tableData.value = res.data
        pagination.total = res.data.length
      }
    } else {
      ElMessage.error(res.message || '获取数据失败')
    }
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.title = ''
  pagination.page = 1
  fetchData()
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

// 添加
const handleAdd = () => {
  dialogTitle.value = '添加轮播图'
  Object.assign(formData, {
    id: null,
    title: '',
    coverImg: '',
    link: '',
    sort: 0
  })
  currentFile.value = null
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑轮播图'
  Object.assign(formData, {
    id: row.id,
    title: row.title,
    coverImg: row.coverImg,
    link: row.link,
    sort: row.sort
  })
  currentFile.value = null
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除轮播图"${row.title}"吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await deleteCarouselService(row.id)
      if (res.code === 0) {
        ElMessage.success('删除成功')
        fetchData()
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
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedIds.value.length} 个轮播图吗？`,
    '批量删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await deleteCarouselService(selectedIds.value)
      if (res.code === 0) {
        ElMessage.success('批量删除成功')
        selectedIds.value = []
        fetchData()
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

// 文件选择变化
const handleFileChange = (file) => {
  currentFile.value = file.raw
  // 预览图片
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.coverImg = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

// 上传前验证
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }
  return true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        // 如果有新上传的文件，先上传
        if (currentFile.value) {
          const uploadRes = await uploadImageService(currentFile.value)
          if (uploadRes.code === 0) {
            formData.coverImg = uploadRes.data
          } else {
            ElMessage.error(uploadRes.message || '图片上传失败')
            submitLoading.value = false
            return
          }
        }

        const apiFunc = formData.id ? updateCarouselService : addCarouselService
        const res = await apiFunc(formData)
        if (res.code === 0) {
          ElMessage.success(formData.id ? '更新成功' : '添加成功')
          dialogVisible.value = false
          currentFile.value = null
          fetchData()
        } else {
          ElMessage.error(res.message || '操作失败')
        }
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
  currentFile.value = null
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.carousel-info-container {
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

/* 查询条件区域 */
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

.table-image {
  width: 80px;
  height: 50px;
  border-radius: 4px;
  cursor: pointer;
}

/* 分页 */
.pagination-section {
  padding: 20px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #f0f0f0;
}

/* 对话框内的上传组件 */

.avatar-uploader {
  display: inline-block;
}

.avatar-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  width: 178px;
  height: 100px;
  display: block;
  object-fit: cover;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}
</style>
