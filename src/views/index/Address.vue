<template>
  <div class="address-page">
    <div class="page-header">
      <h2>收货地址</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增地址
      </el-button>
    </div>

    <!-- 地址列表 -->
    <div v-loading="loading" class="address-list">
      <el-empty v-if="addressList.length === 0" description="暂无收货地址" />
      
      <div v-else class="address-grid">
        <div
          v-for="address in addressList"
          :key="address.id"
          class="address-card"
          :class="{ 'is-default': address.isDefault }"
        >
          <div class="address-tag" v-if="address.isDefault">默认</div>
          
          <div class="address-info">
            <div class="receiver-info">
              <span class="name">{{ address.name }}</span>
              <span class="phone">{{ address.phone }}</span>
            </div>
            <div class="address-detail">
              {{ address.address }}
            </div>
          </div>

          <div class="address-actions">
            <el-button link type="primary" @click="handleEdit(address)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button link type="danger" @click="handleDelete(address)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
            <el-button
              v-if="!address.isDefault"
              link
              type="warning"
              @click="handleSetDefault(address)"
            >
              设为默认
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
        :page-sizes="[6, 12, 24]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next"
        @size-change="handlePageSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="收货人" prop="name">
          <el-input v-model="formData.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" />
        </el-form-item>
        
        <el-form-item label="详细地址" prop="address">
          <el-input
            v-model="formData.address"
            type="textarea"
            :rows="4"
            placeholder="请输入详细地址（省市区+详细地址）"
          />
        </el-form-item>
        
        <el-form-item label="设为默认">
          <el-switch v-model="formData.isDefault" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import {
  getAddressListService,
  addAddressService,
  updateAddressService,
  deleteAddressService
} from '@/api/address'

const loading = ref(false)
const addressList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增地址')
const formRef = ref(null)
const isEdit = ref(false)

const pagination = reactive({
  page: 1,
  size: 6,
  total: 0
})

const formData = reactive({
  id: null,
  name: '',
  phone: '',
  address: '',
  isDefault: false
})

const formRules = {
  name: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

const fetchAddressList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size
    }
    const res = await getAddressListService(params)
    if (res.code === 0) {
      if (res.data.items) {
        addressList.value = res.data.items
        pagination.total = res.data.total || 0
      } else if (Array.isArray(res.data)) {
        addressList.value = res.data
        pagination.total = res.data.length
      }
    }
  } catch (error) {
    console.error('获取地址列表失败:', error)
    ElMessage.error('获取地址列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '新增地址'
  isEdit.value = false
  dialogVisible.value = true
}

const handleEdit = (address) => {
  dialogTitle.value = '编辑地址'
  isEdit.value = true
  Object.assign(formData, address)
  dialogVisible.value = true
}

const handleDelete = (address) => {
  ElMessageBox.confirm('确定要删除该地址吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteAddressService(address.id)
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
  })
}

const handleSetDefault = async (address) => {
  try {
    const res = await updateAddressService({ ...address, isDefault: true })
    if (res.code === 0) {
      ElMessage.success('设置成功')
      fetchAddressList()
    } else {
      ElMessage.error(res.message || '设置失败')
    }
  } catch (error) {
    console.error('设置失败:', error)
    ElMessage.error('设置失败')
  }
}

const handleSubmit = async () => {
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = isEdit.value
          ? await updateAddressService(formData)
          : await addAddressService(formData)
        
        if (res.code === 0) {
          ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
          dialogVisible.value = false
          fetchAddressList()
        } else {
          ElMessage.error(res.message || '操作失败')
        }
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败')
      }
    }
  })
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    name: '',
    phone: '',
    address: '',
    isDefault: false
  })
}

const handlePageSizeChange = () => {
  pagination.page = 1
  fetchAddressList()
}

const handlePageChange = () => {
  fetchAddressList()
}

onMounted(() => {
  fetchAddressList()
})
</script>

<style scoped>
.address-page {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
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

.address-list {
  min-height: 300px;
}

.address-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.address-card {
  position: relative;
  border: 2px solid #e4e7ed;
  border-radius: 10px;
  padding: 20px;
  transition: all 0.3s ease;
  background: #fafafa;
}

.address-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.address-card.is-default {
  border-color: #667eea;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%);
}

.address-tag {
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 0 8px 0 8px;
  font-size: 12px;
  font-weight: 600;
}

.address-info {
  margin-bottom: 16px;
}

.receiver-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.receiver-info .name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.receiver-info .phone {
  font-size: 14px;
  color: #606266;
}

.address-detail {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  word-wrap: break-word;
  word-break: break-all;
  overflow-wrap: break-word;
}

.address-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}

.pagination-wrapper {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
}
</style>
