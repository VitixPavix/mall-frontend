<template>
  <div class="collection-page">
    <div class="page-header">
      <h2>商品收藏</h2>
      <el-button
        type="danger"
        :disabled="selectedIds.length === 0"
        @click="handleBatchDelete"
      >
        <el-icon><Delete /></el-icon>
        批量删除 ({{ selectedIds.length }})
      </el-button>
    </div>

    <!-- 商品列表 -->
    <div v-loading="loading" class="collection-list">
      <el-empty v-if="collectionList.length === 0" description="暂无收藏商品" />
      
      <div v-else class="product-grid">
        <div
          v-for="item in collectionList"
          :key="item.id"
          class="product-card"
        >
          <el-checkbox
            v-model="item.checked"
            class="product-checkbox"
            @change="handleCheckChange"
          />
          
          <div class="product-image" @click="viewProduct(item.productId)">
            <img :src="item.productCoverImg || defaultImage" :alt="item.productName" />
          </div>
          
          <div class="product-info">
            <h3 class="product-name" @click="viewProduct(item.productId)">
              {{ item.productName }}
            </h3>
            <div class="product-price">¥{{ item.productPrice || '0.00' }}</div>
            <div class="product-time">{{ formatDate(item.createTime) }}</div>
          </div>
          
          <div class="product-actions">
            <el-button type="danger" link @click="handleDelete(item)">
              <el-icon><Delete /></el-icon>
              取消收藏
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
        :page-sizes="[12, 24, 36]"
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
import { Delete } from '@element-plus/icons-vue'
import {
  getProductCollectionListService,
  deleteProductCollectionService
} from '@/api/productCollection'

const defaultImage = 'https://via.placeholder.com/200x200?text=No+Image'
const router = useRouter()
const loading = ref(false)
const collectionList = ref([])

const pagination = reactive({
  page: 1,
  size: 12,
  total: 0
})

const selectedIds = computed(() => {
  return collectionList.value.filter(item => item.checked).map(item => item.id)
})

const fetchCollectionList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size
    }
    const res = await getProductCollectionListService(params)
    if (res.code === 0) {
      let data = []
      if (res.data.items) {
        data = res.data.items
        pagination.total = res.data.total || 0
      } else if (Array.isArray(res.data)) {
        data = res.data
        pagination.total = res.data.length
      }
      collectionList.value = data.map(item => ({ ...item, checked: false }))
    }
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    ElMessage.error('获取收藏列表失败')
  } finally {
    loading.value = false
  }
}

const handleCheckChange = () => {
  // 触发计算属性更新
}

const handleDelete = (item) => {
  ElMessageBox.confirm('确定要取消收藏该商品吗？', '取消收藏', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteProductCollectionService(item.id)
      if (res.code === 0) {
        ElMessage.success('取消收藏成功')
        fetchCollectionList()
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    } catch (error) {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  })
}

const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的商品')
    return
  }
  
  ElMessageBox.confirm(`确定要取消收藏选中的 ${selectedIds.value.length} 件商品吗？`, '批量取消收藏', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteProductCollectionService(selectedIds.value)
      if (res.code === 0) {
        ElMessage.success('批量取消收藏成功')
        fetchCollectionList()
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    } catch (error) {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  })
}

const viewProduct = (productId) => {
  router.push(`/product/${productId}`)
}

const formatDate = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleDateString('zh-CN')
}

const handlePageSizeChange = () => {
  pagination.page = 1
  fetchCollectionList()
}

const handlePageChange = () => {
  fetchCollectionList()
}

onMounted(() => {
  fetchCollectionList()
})
</script>

<style scoped>
.collection-page {
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

.collection-list {
  min-height: 400px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.product-card {
  position: relative;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
}

.product-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  transform: translateY(-4px);
}

.product-checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
}

.product-image {
  width: 100%;
  height: 200px;
  cursor: pointer;
  overflow: hidden;
  background: #f5f7fa;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.1);
}

.product-info {
  padding: 12px;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.product-name:hover {
  color: #667eea;
}

.product-price {
  font-size: 18px;
  font-weight: 700;
  color: #ff5000;
  margin-bottom: 8px;
}

.product-time {
  font-size: 12px;
  color: #909399;
}

.product-actions {
  padding: 12px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}

.pagination-wrapper {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
}
</style>
