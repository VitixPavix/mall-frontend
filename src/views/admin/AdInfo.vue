<template>
  <div class="ad-info-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">广告位管理</h2>
      <p class="page-desc">管理商城广告位，编辑广告内容和跳转链接</p>
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

    <!-- 数据表格 -->
    <div class="table-section">
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        style="width: 100%"
      >
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
        <el-table-column prop="position" label="位置" width="100" />
        <el-table-column prop="link" label="跳转链接" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
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

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑广告位"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        :model="formData"
        :rules="formRules"
        ref="formRef"
        label-width="100px"
      >
        <el-form-item label="ID">
          <el-input v-model="formData.id" disabled />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="位置" prop="position">
          <el-input v-model="formData.position" placeholder="请输入位置" />
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
          <div class="upload-tip">建议尺寸：400x300px</div>
        </el-form-item>
        <el-form-item label="跳转链接" prop="link">
          <el-input v-model="formData.link" placeholder="请输入跳转链接" />
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
import { ElMessage } from 'element-plus'
import {
  Plus,
  Search,
  Refresh,
  Edit
} from '@element-plus/icons-vue'
import {
  getAdListService,
  updateAdService
} from '@/api/ad'
import { uploadImageService } from '@/api/upload'

// 搜索表单
const searchForm = reactive({
  title: ''
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 对话框
const dialogVisible = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)

// 表单数据
const formData = reactive({
  id: null,
  title: '',
  position: '',
  coverImg: '',
  link: ''
})

// 当前上传的文件
const currentFile = ref(null)

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' }
  ],
  position: [
    { required: true, message: '请输入位置', trigger: 'blur' }
  ],
  coverImg: [
    { required: true, message: '请上传封面图', trigger: 'change' }
  ]
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      page: pagination.page,
      size: pagination.size
    }
    const res = await getAdListService(params)
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

// 编辑
const handleEdit = (row) => {
  Object.assign(formData, {
    id: row.id,
    title: row.title,
    position: row.position,
    coverImg: row.coverImg,
    link: row.link
  })
  currentFile.value = null
  dialogVisible.value = true
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

        const res = await updateAdService(formData)
        if (res.code === 0) {
          ElMessage.success('更新成功')
          dialogVisible.value = false
          currentFile.value = null
          fetchData()
        } else {
          ElMessage.error(res.message || '更新失败')
        }
      } catch (error) {
        console.error('更新失败:', error)
        ElMessage.error('更新失败')
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
.ad-info-container {
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

/* 表格区域 */
.table-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.table-image {
  width: 80px;
  height: 60px;
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
  height: 133px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  width: 178px;
  height: 133px;
  display: block;
  object-fit: cover;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}
</style>
