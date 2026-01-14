<template>
  <div class="history-page">
    <div class="page-header">
      <h2>浏览历史</h2>
      <el-button
        type="danger"
        :disabled="selectedIds.length === 0"
        @click="handleBatchDelete"
      >
        <el-icon><Delete /></el-icon>
        批量删除 ({{ selectedIds.length }})
      </el-button>
    </div>

    <!-- 浏览历史列表 -->
    <div v-loading="loading" class="history-list">
      <el-empty v-if="historyList.length === 0" description="暂无浏览记录" />
      
      <div v-else class="history-items">
        <div
          v-for="item in historyList"
          :key="item.id"
          class="history-item"
        >
          <el-checkbox
            v-model="item.checked"
            class="item-checkbox"
            @change="handleCheckChange"
          />
          
          <div class="item-image" @click="viewProduct(item.productId)">
            <img :src="item.productCoverImg || defaultImage" :alt="item.productName" />
          </div>
          
          <div class="item-content">
            <h3 class="item-name" @click="viewProduct(item.productId)">
              {{ item.productName }}
            </h3>
            <div class="item-price">¥{{ item.productPrice || '0.00' }}</div>
            <div class="item-time">
              <el-icon><Clock /></el-icon>
              {{ formatDateTime(item.createTime) }}
            </div>
          </div>
          
          <div class="item-actions">
            <el-button type="danger" link @click="handleDelete(item)">
              <el-icon><Delete /></el-icon>
              删除
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
        :page-sizes="[10, 20, 50]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next"
        @size-change="handlePageSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Clock } from '@element-plus/icons-vue'
import {
  getBrowsingRecordListService,
  deleteBrowsingRecordService
} from '@/api/browsingRecord'

const defaultImage = 'https://via.placeholder.com/120x120?text=No+Image'
const router = useRouter()
const loading = ref(false)
const historyList = ref([])

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const selectedIds = computed(() => {
  return historyList.value.filter(item => item.checked).map(item => item.id)
})

const fetchHistoryList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size
    }
    const res = await getBrowsingRecordListService(params)
    if (res.code === 0) {
      let data = []
      if (res.data.items) {
        data = res.data.items
        pagination.total = res.data.total || 0
      } else if (Array.isArray(res.data)) {
        data = res.data
        pagination.total = res.data.length
      }
      historyList.value = data.map(item => ({ ...item, checked: false }))
    }
  } catch (error) {
    console.error('获取浏览历史失败:', error)
    ElMessage.error('获取浏览历史失败')
  } finally {
    loading.value = false
  }
}

const handleCheckChange = () => {
  // 触发计算属性更新
}

const handleDelete = (item) => {
  ElMessageBox.confirm('确定要删除该浏览记录吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteBrowsingRecordService(item.id)
      if (res.code === 0) {
        ElMessage.success('删除成功')
        fetchHistoryList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的记录')
    return
  }
  
  ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条记录吗？`, '批量删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteBrowsingRecordService(selectedIds.value)
      if (res.code === 0) {
        ElMessage.success('批量删除成功')
        fetchHistoryList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

const viewProduct = (productId) => {
  router.push(`/product/${productId}`)
}

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

const handlePageSizeChange = () => {
  pagination.page = 1
  fetchHistoryList()
}

const handlePageChange = () => {
  fetchHistoryList()
}

onMounted(() => {
  fetchHistoryList()
})
</script>

<style scoped>
.history-page {
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

.history-list {
  min-height: 400px;
}

.history-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  transition: all 0.3s ease;
  background: #fafafa;
}

.history-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  transform: translateX(4px);
}

.item-checkbox {
  flex-shrink: 0;
}

.item-image {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: #f5f7fa;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.history-item:hover .item-image img {
  transform: scale(1.1);
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.item-name:hover {
  color: #667eea;
}

.item-price {
  font-size: 20px;
  font-weight: 700;
  color: #ff5000;
  margin-bottom: 12px;
}

.item-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #909399;
}

.item-actions {
  flex-shrink: 0;
}

.pagination-wrapper {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
}
</style>
