<template>
  <div class="shop-collection-page">
    <div class="page-header">
      <h2>关注店铺</h2>
      <el-button
        type="danger"
        :disabled="selectedIds.length === 0"
        @click="handleBatchDelete"
      >
        <el-icon><Delete /></el-icon>
        批量取消 ({{ selectedIds.length }})
      </el-button>
    </div>

    <!-- 店铺列表 -->
    <div v-loading="loading" class="shop-list">
      <el-empty v-if="shopList.length === 0" description="暂无关注店铺" />
      
      <div v-else class="shop-grid">
        <div
          v-for="item in shopList"
          :key="item.id"
          class="shop-card"
        >
          <el-checkbox
            v-model="item.checked"
            class="shop-checkbox"
            @change="handleCheckChange"
          />
          
          <div class="shop-avatar" @click="viewShop(item.shopId)">
            <img :src="item.shopUserPic || defaultAvatar" :alt="item.shopName" />
          </div>
          
          <div class="shop-info">
            <h3 class="shop-name" @click="viewShop(item.shopId)">
              {{ item.shopName }}
            </h3>
            <div class="shop-desc">{{ item.shopDescription || '暂无简介' }}</div>
            <div class="shop-meta">
              <span class="meta-item">
                <el-icon><Goods /></el-icon>
                商品 {{ item.productCount || 0 }}
              </span>
              <span class="meta-item">
                <el-icon><Star /></el-icon>
                关注 {{ item.fansNum || 0 }}
              </span>
            </div>
            <div class="shop-time">
              关注时间：{{ formatDate(item.createTime) }}
            </div>
          </div>
          
          <div class="shop-actions">
            <el-button type="primary" @click="viewShop(item.shopId)">
              <el-icon><Shop /></el-icon>
              进入店铺
            </el-button>
            <el-button type="danger" @click="handleDelete(item)">
              <el-icon><Delete /></el-icon>
              取消关注
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
        :page-sizes="[8, 16, 24]"
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
import { Delete, Shop, Goods, Star } from '@element-plus/icons-vue'
import {
  getShopCollectionListService,
  deleteShopCollectionService
} from '@/api/shopCollection'

const defaultAvatar = 'https://via.placeholder.com/100x100?text=Shop'
const router = useRouter()
const loading = ref(false)
const shopList = ref([])

const pagination = reactive({
  page: 1,
  size: 8,
  total: 0
})

const selectedIds = computed(() => {
  return shopList.value.filter(item => item.checked).map(item => item.id)
})

const fetchShopList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size
    }
    const res = await getShopCollectionListService(params)
    if (res.code === 0) {
      let data = []
      if (res.data.items) {
        data = res.data.items
        pagination.total = res.data.total || 0
      } else if (Array.isArray(res.data)) {
        data = res.data
        pagination.total = res.data.length
      }
      shopList.value = data.map(item => ({ ...item, checked: false }))
    }
  } catch (error) {
    console.error('获取关注店铺失败:', error)
    ElMessage.error('获取关注店铺失败')
  } finally {
    loading.value = false
  }
}

const handleCheckChange = () => {
  // 触发计算属性更新
}

const handleDelete = (item) => {
  ElMessageBox.confirm('确定要取消关注该店铺吗？', '取消关注', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteShopCollectionService(item.id)
      if (res.code === 0) {
        ElMessage.success('取消关注成功')
        fetchShopList()
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
    ElMessage.warning('请选择要取消关注的店铺')
    return
  }
  
  ElMessageBox.confirm(`确定要取消关注选中的 ${selectedIds.value.length} 个店铺吗？`, '批量取消关注', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteShopCollectionService(selectedIds.value)
      if (res.code === 0) {
        ElMessage.success('批量取消关注成功')
        fetchShopList()
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    } catch (error) {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  })
}

const viewShop = (shopId) => {
  router.push(`/shop/${shopId}`)
}

const formatDate = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleDateString('zh-CN')
}

const handlePageSizeChange = () => {
  pagination.page = 1
  fetchShopList()
}

const handlePageChange = () => {
  fetchShopList()
}

onMounted(() => {
  fetchShopList()
})
</script>

<style scoped>
.shop-collection-page {
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

.shop-list {
  min-height: 400px;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.shop-card {
  position: relative;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  padding: 20px;
  transition: all 0.3s ease;
  background: #fafafa;
}

.shop-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  transform: translateY(-4px);
}

.shop-checkbox {
  position: absolute;
  top: 12px;
  right: 12px;
}

.shop-avatar {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid #e4e7ed;
  transition: all 0.3s ease;
}

.shop-card:hover .shop-avatar {
  border-color: #667eea;
  transform: scale(1.05);
}

.shop-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.shop-info {
  text-align: center;
  margin-bottom: 16px;
}

.shop-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  cursor: pointer;
}

.shop-name:hover {
  color: #667eea;
}

.shop-desc {
  font-size: 13px;
  color: #606266;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shop-meta {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}

.shop-time {
  font-size: 12px;
  color: #c0c4cc;
}

.shop-actions {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.shop-actions .el-button {
  flex: 1;
}

.pagination-wrapper {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
}
</style>
