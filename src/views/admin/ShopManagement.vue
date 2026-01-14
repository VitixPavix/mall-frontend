<template>
  <div class="shop-management-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">店铺管理</h2>
      <p class="page-desc">管理平台所有店铺，包括查看、编辑、删除等操作</p>
    </div>

    <!-- 查询条件区域 -->
    <div class="search-section">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="店铺名称">
          <el-input
            v-model="searchForm.shopname"
            placeholder="请输入店铺名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="电话">
          <el-input
            v-model="searchForm.phone"
            placeholder="请输入电话号码"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.state"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="启用" value="启用" />
            <el-option label="禁用" value="禁用" />
          </el-select>
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
        新增店铺
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

    <!-- 店铺列表表格 -->
    <div class="table-section">
      <el-table
        v-loading="loading"
        :data="shopList"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="username" label="用户名" min-width="120" />
        
        <el-table-column prop="shopname" label="店铺名称" min-width="150" />

        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar 
              :size="40" 
              :src="row.userPic || defaultAvatar"
              class="user-avatar"
            >
              <el-icon><User /></el-icon>
            </el-avatar>
          </template>
        </el-table-column>

        <el-table-column prop="phone" label="电话" width="130" />

        <el-table-column prop="email" label="邮箱" min-width="180" />

        <el-table-column label="资质图片" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.qualificationPic"
              :src="row.qualificationPic"
              :preview-src-list="[row.qualificationPic]"
              fit="cover"
              style="width: 60px; height: 40px; border-radius: 4px; cursor: pointer;"
            />
            <span v-else style="color: #999; font-size: 12px;">暂无</span>
          </template>
        </el-table-column>

        <el-table-column prop="state" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.state === '启用' ? 'success' : 'danger'">
              {{ row.state || '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="updateTime" label="修改时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.updateTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="warning" link size="small" @click="handleResetPassword(row)">
              <el-icon><Key /></el-icon>
              重置密码
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
<!-- 编辑店铺弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="editForm.id ? '编辑店铺' : '新增店铺'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input 
                v-model="editForm.username" 
                placeholder="请输入用户名"
                :disabled="!!editForm.id"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="店铺名称" prop="shopname">
              <el-input v-model="editForm.shopname" placeholder="请输入店铺名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="editForm.email" placeholder="请输入邮箱（可选）" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话" prop="phone">
              <el-input v-model="editForm.phone" placeholder="请输入电话号码" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="state">
              <el-select v-model="editForm.state" placeholder="请选择状态" style="width: 100%">
                <el-option label="启用" value="启用" />
                <el-option label="禁用" value="禁用" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="头像" prop="userPic">
          <div class="upload-section">
            <el-upload
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :http-request="handleAvatarUpload"
              accept="image/*"
              class="avatar-uploader"
            >
              <div v-if="editForm.userPic" class="avatar-preview">
                <el-avatar :size="80" :src="editForm.userPic" />
                <div class="avatar-overlay">
                  <el-icon><Camera /></el-icon>
                  <span>更换头像</span>
                </div>
              </div>
              <div v-else class="avatar-placeholder">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <div class="upload-text">上传头像</div>
              </div>
            </el-upload>
            <div class="upload-tip">建议尺寸：200x200px，支持jpg、png格式，大小不超过2MB</div>
          </div>
        </el-form-item>

        <el-form-item label="资质图片" prop="qualificationPic">
          <div class="upload-section">
            <el-upload
              :show-file-list="false"
              :before-upload="beforeQualificationUpload"
              :http-request="handleQualificationUpload"
              accept="image/*"
              class="qualification-uploader"
            >
              <div v-if="editForm.qualificationPic" class="qualification-preview">
                <el-image 
                  :src="editForm.qualificationPic" 
                  fit="cover"
                  style="width: 120px; height: 80px; border-radius: 4px;"
                />
                <div class="qualification-overlay">
                  <el-icon><Camera /></el-icon>
                  <span>更换图片</span>
                </div>
              </div>
              <div v-else class="qualification-placeholder">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <div class="upload-text">上传资质图片</div>
              </div>
            </el-upload>
            <div class="upload-tip">请上传营业执照或相关资质证明，支持jpg、png格式，大小不超过5MB</div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saveLoading">
          {{ editForm.id ? '更新' : '新增' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 重置密码弹窗 -->
    <el-dialog
      v-model="resetPasswordDialogVisible"
      title="重置密码"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="resetPasswordFormRef"
        :model="resetPasswordForm"
        :rules="resetPasswordRules"
        label-width="100px"
      >
        <el-form-item label="用户名">
          <el-input v-model="resetPasswordForm.username" disabled />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="resetPasswordForm.newPassword" 
            type="password" 
            placeholder="留空则重置为默认密码123456"
            show-password
            clearable
          />
        </el-form-item>
        
        <div class="reset-password-tip">
          <el-alert
            title="提示：如果不输入新密码，系统将自动重置为默认密码 123456"
            type="info"
            :closable="false"
            show-icon
          />
        </div>
      </el-form>

      <template #footer>
        <el-button @click="resetPasswordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmResetPassword" :loading="resetPasswordLoading">
          确定重置
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
  Edit,
  User,
  Camera,
  Key
} from '@element-plus/icons-vue'
import { 
  getShopListService,
  addShopService,
  updateShopService,
  deleteShopService,
  shopResetPasswordService
} from '@/api/admin'
import { uploadImageService } from '@/api/upload'
import defaultAvatar from '@/assets/default.png'

// 响应式数据
const loading = ref(false)
const saveLoading = ref(false)
const resetPasswordLoading = ref(false)
const uploadLoading = ref(false)
const shopList = ref([])
const selectedIds = ref([])

// 搜索表单
const searchForm = reactive({
  username: '',
  shopname: '',
  phone: '',
  state: ''
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
  username: '',
  shopname: '',
  email: '',
  phone: '',
  state: '启用',
  userPic: '',
  qualificationPic: ''
})

// 重置密码弹窗
const resetPasswordDialogVisible = ref(false)
const resetPasswordFormRef = ref()
const resetPasswordForm = reactive({
  id: null,
  username: '',
  newPassword: ''
})

// 表单验证规则
const editRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3到20个字符', trigger: 'blur' }
  ],
  shopname: [
    { required: true, message: '请输入店铺名称', trigger: 'blur' },
    { min: 2, max: 30, message: '店铺名称长度在2到30个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入电话号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  qualificationPic: [
    { required: true, message: '请上传资质图片', trigger: 'change' }
  ],
  state: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 重置密码表单验证规则
const resetPasswordRules = {
  newPassword: [
    { min: 6, max: 20, message: '密码长度在6到20个字符', trigger: 'blur' }
  ]
}// 获取店铺列表
const fetchShopList = async () => {
  loading.value = true
  try {
    const requestData = {
      page: pagination.page,
      size: pagination.size
    }

    // 添加搜索条件
    if (searchForm.username && searchForm.username.trim()) {
      requestData.username = searchForm.username.trim()
    }
    if (searchForm.shopname && searchForm.shopname.trim()) {
      requestData.shopname = searchForm.shopname.trim()
    }
    if (searchForm.phone && searchForm.phone.trim()) {
      requestData.phone = searchForm.phone.trim()
    }
    if (searchForm.state !== '') {
      requestData.state = searchForm.state
    }

    const res = await getShopListService(requestData)
    if (res.code === 0) {
      let rawData = []
      
      if (res.data.items && Array.isArray(res.data.items)) {
        rawData = res.data.items
        pagination.total = res.data.total || 0
      } else if (Array.isArray(res.data)) {
        rawData = res.data
        pagination.total = res.data.length
      }

      shopList.value = rawData
    }
  } catch (error) {
    console.error('获取店铺列表失败:', error)
    ElMessage.error('获取店铺列表失败')
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
  fetchShopList()
}

// 重置搜索
const handleReset = () => {
  searchForm.username = ''
  searchForm.shopname = ''
  searchForm.phone = ''
  searchForm.state = ''
  pagination.page = 1
  fetchShopList()
}

// 新增店铺
const handleAdd = () => {
  resetEditForm()
  editDialogVisible.value = true
}

// 编辑店铺
const handleEdit = (row) => {
  Object.assign(editForm, {
    id: row.id,
    username: row.username,
    shopname: row.shopname || '',
    email: row.email || '',
    phone: row.phone || '',
    state: row.state,
    userPic: row.userPic || '',
    qualificationPic: row.qualificationPic || ''
  })
  
  editDialogVisible.value = true
}

// 删除店铺
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除店铺"${row.username}"吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      const res = await deleteShopService(row.id)
      if (res.code === 0) {
        ElMessage.success('删除成功')
        fetchShopList()
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
    ElMessage.warning('请选择要删除的店铺')
    return
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedIds.value.length} 个店铺吗？此操作不可恢复！`,
    '批量删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      const res = await deleteShopService(selectedIds.value)
      if (res.code === 0) {
        ElMessage.success(`成功删除 ${selectedIds.value.length} 个店铺`)
        selectedIds.value = []
        fetchShopList()
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

// 保存店铺
const handleSave = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()
    saveLoading.value = true

    const shopData = {
      username: editForm.username,
      shopname: editForm.shopname,
      email: editForm.email,
      phone: editForm.phone,
      state: editForm.state,
      userPic: editForm.userPic,
      qualificationPic: editForm.qualificationPic
    }

    const isEdit = !!editForm.id
    let res

    if (isEdit) {
      shopData.id = editForm.id
      res = await updateShopService(shopData)
    } else {
      // 新增店铺时，后端会自动设置默认密码123456
      res = await addShopService(shopData)
    }
    
    if (res.code === 0) {
      ElMessage.success(isEdit ? '更新成功' : '新增成功，默认密码为123456')
      editDialogVisible.value = false
      fetchShopList()
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

// 打开重置密码弹窗
const handleResetPassword = (row) => {
  resetPasswordForm.id = row.id
  resetPasswordForm.username = row.username
  resetPasswordForm.newPassword = ''
  resetPasswordDialogVisible.value = true
}

// 确认重置密码
const handleConfirmResetPassword = async () => {
  if (!resetPasswordFormRef.value) return

  try {
    await resetPasswordFormRef.value.validate()
    resetPasswordLoading.value = true

    const resetData = {
      id: resetPasswordForm.id
    }

    // 如果输入了新密码，则使用新密码；否则后端会使用默认密码123456
    if (resetPasswordForm.newPassword && resetPasswordForm.newPassword.trim()) {
      resetData.newPassword = resetPasswordForm.newPassword.trim()
    }

    const res = await shopResetPasswordService(resetData)
    if (res.code === 0) {
      const message = resetPasswordForm.newPassword 
        ? '密码重置成功' 
        : '密码重置成功，新密码为：123456'
      ElMessage.success(message)
      resetPasswordDialogVisible.value = false
    } else {
      ElMessage.error(res.message || '重置密码失败')
    }
  } catch (error) {
    console.error('重置密码失败:', error)
    if (error !== 'validation failed') {
      ElMessage.error('重置密码失败')
    }
  } finally {
    resetPasswordLoading.value = false
  }
}

// 重置编辑表单
const resetEditForm = () => {
  Object.assign(editForm, {
    id: null,
    username: '',
    shopname: '',
    email: '',
    phone: '',
    state: '启用',
    userPic: '',
    qualificationPic: ''
  })
  
  if (editFormRef.value) {
    editFormRef.value.clearValidate()
  }
}

// 头像上传相关方法
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

const handleAvatarUpload = async (options) => {
  uploadLoading.value = true
  try {
    const res = await uploadImageService(options.file)
    if (res.code === 0) {
      editForm.userPic = res.data
      ElMessage.success('头像上传成功')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('头像上传失败')
  } finally {
    uploadLoading.value = false
  }
}

// 资质图片上传相关方法
const beforeQualificationUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

const handleQualificationUpload = async (options) => {
  uploadLoading.value = true
  try {
    const res = await uploadImageService(options.file)
    if (res.code === 0) {
      editForm.qualificationPic = res.data
      ElMessage.success('资质图片上传成功')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('资质图片上传失败')
  } finally {
    uploadLoading.value = false
  }
}

// 分页大小改变
const handlePageSizeChange = () => {
  pagination.page = 1
  fetchShopList()
}

// 页码改变
const handlePageChange = () => {
  fetchShopList()
}

// 初始化
onMounted(() => {
  fetchShopList()
})
</script>

<style scoped>
.shop-management-container {
  padding: 0;
}

/* 页面标题 */
.page-header {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
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

/* 用户头像 */
.user-avatar {
  cursor: pointer;
}

/* 分页 */
.pagination-wrapper {
  padding: 20px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #f0f0f0;
}

/* 头像上传相关样式 */
.upload-section {
  width: 100%;
}

.avatar-uploader {
  display: block;
}

.avatar-preview {
  position: relative;
  width: 80px;
  height: 80px;
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.3s;
}

.avatar-preview:hover {
  border-color: #409EFF;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 12px;
}

.avatar-preview:hover .avatar-overlay {
  opacity: 1;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
  color: #8c939d;
}

.avatar-placeholder:hover {
  border-color: #409EFF;
  color: #409EFF;
}

/* 资质图片上传样式 */
.qualification-uploader {
  display: block;
}

.qualification-preview {
  position: relative;
  width: 120px;
  height: 80px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.3s;
}

.qualification-preview:hover {
  border-color: #409EFF;
}

.qualification-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 12px;
}

.qualification-preview:hover .qualification-overlay {
  opacity: 1;
}

.qualification-placeholder {
  width: 120px;
  height: 80px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
  color: #8c939d;
}

.qualification-placeholder:hover {
  border-color: #409EFF;
  color: #409EFF;
}

.upload-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.upload-text {
  font-size: 12px;
}

.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

/* 重置密码弹窗样式 */
.reset-password-tip {
  margin-top: 16px;
}

.reset-password-tip :deep(.el-alert) {
  border-radius: 6px;
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
</style>