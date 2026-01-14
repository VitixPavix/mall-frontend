<template>
  <div class="product-info-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">商品信息管理</h2>
      <p class="page-desc">管理平台所有商品信息，包括查看、编辑、删除等操作</p>
    </div>

    <!-- 查询条件区域 -->
    <div class="search-section">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="商品名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入商品名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="商品分类">
          <el-select
            v-model="searchForm.categoryId"
            placeholder="请选择分类"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.categoryName"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品状态">
          <el-select
            v-model="searchForm.state"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="上架" value="上架" />
            <el-option label="下架" value="下架" />
          </el-select>
        </el-form-item>
        <el-form-item label="店铺ID">
          <el-input
            v-model="searchForm.createUserId"
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
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增商品
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

    <!-- 商品列表表格 -->
    <div class="table-section">
      <el-table
        v-loading="loading"
        :data="productList"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="name" label="商品名称" min-width="150">
          <template #default="{ row }">
            <div class="product-name-cell">
              <span :title="row.name">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="封面图" width="100">
          <template #default="{ row }">
            <el-image
              :src="row.coverImg || defaultImage"
              :preview-src-list="[row.coverImg || defaultImage]"
              fit="cover"
              class="cover-image"
            />
          </template>
        </el-table-column>

        <el-table-column label="详细图片" width="120">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              link 
              size="small"
              @click="viewDetailImages(row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>

        <el-table-column prop="categoryName" label="分类名称" width="120" />

        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            <span class="price-text">¥{{ row.price }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="stock" label="库存" width="80">
          <template #default="{ row }">
            <el-tag :type="row.stock > 10 ? 'success' : row.stock > 0 ? 'warning' : 'danger'">
              {{ row.stock }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="sales" label="销量" width="80" />

        <el-table-column prop="state" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.state === '上架' ? 'success' : 'info'">
              {{ row.state || '下架' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createUserId" label="店铺ID" width="100" />

        <el-table-column prop="createUserName" label="店铺名称" width="120" />

        <el-table-column prop="updateTime" label="更新时间" width="160">
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
          :page-sizes="[5, 10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 编辑商品弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="editForm.id ? '编辑商品' : '新增商品'"
      width="800px"
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
            <el-form-item label="商品名称" prop="name">
              <el-input v-model="editForm.name" placeholder="请输入商品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品分类" prop="categoryId">
              <el-select v-model="editForm.categoryId" placeholder="请选择分类" style="width: 100%">
                <el-option
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.categoryName"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品价格" prop="price">
              <el-input-number
                v-model="editForm.price"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="请输入价格"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存数量" prop="stock">
              <el-input-number
                v-model="editForm.stock"
                :min="0"
                style="width: 100%"
                placeholder="请输入库存"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品状态" prop="state">
              <el-select v-model="editForm.state" placeholder="请选择状态" style="width: 100%">
                <el-option label="上架" value="上架" />
                <el-option label="下架" value="下架" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属店铺" prop="createUserId">
              <el-select 
                v-model="editForm.createUserId" 
                placeholder="请选择店铺"
                filterable
                clearable
                style="width: 100%"
                :disabled="!!editForm.id"
              >
                <el-option
                  v-for="shop in shops"
                  :key="shop.id"
                  :label="`${shop.username} (ID: ${shop.id})`"
                  :value="shop.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="封面图片" prop="coverImg">
          <div class="upload-section">
            <el-upload
              :show-file-list="false"
              :before-upload="beforeCoverUpload"
              :http-request="handleCoverUpload"
              accept="image/*"
              class="cover-uploader"
            >
              <div v-if="editForm.coverImg" class="cover-preview">
                <el-image :src="editForm.coverImg" fit="cover" class="cover-image" />
                <div class="cover-overlay">
                  <el-icon><Camera /></el-icon>
                  <span>更换图片</span>
                </div>
              </div>
              <div v-else class="cover-placeholder">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <div class="upload-text">上传封面图片</div>
              </div>
            </el-upload>
            <div class="upload-tip">建议尺寸：400x400px，支持jpg、png格式，大小不超过2MB</div>
          </div>
        </el-form-item>

        <el-form-item label="详细图片">
          <div class="detail-images-section">
            <div class="images-list">
              <div
                v-for="(image, index) in detailImages"
                :key="index"
                class="image-item"
              >
                <el-image :src="image" fit="cover" class="detail-image" />
                <div class="image-actions">
                  <el-button
                    type="danger"
                    size="small"
                    circle
                    @click="removeDetailImage(index)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
              <el-upload
                :show-file-list="false"
                :before-upload="beforeDetailUpload"
                :http-request="handleDetailUpload"
                accept="image/*"
                class="detail-uploader"
                :disabled="uploadLoading"
              >
                <div class="upload-placeholder" :class="{ 'uploading': uploadLoading }">
                  <el-icon v-if="!uploadLoading"><Plus /></el-icon>
                  <span>{{ uploadLoading ? '上传中...' : '添加图片' }}</span>
                </div>
              </el-upload>
            </div>
            <div class="upload-tip">可上传多张商品详细图片，建议尺寸：800x600px</div>
          </div>
        </el-form-item>

        <el-form-item label="商品详情" prop="detailHtml">
          <div class="tiptap-editor-container">
            <div class="editor-toolbar" v-if="editor">
              <el-button-group>
                <el-button 
                  size="small" 
                  :type="editor.isActive('bold') ? 'primary' : ''"
                  @click="editor.chain().focus().toggleBold().run()" 
                  title="粗体"
                >
                  <strong>B</strong>
                </el-button>
                <el-button 
                  size="small" 
                  :type="editor.isActive('italic') ? 'primary' : ''"
                  @click="editor.chain().focus().toggleItalic().run()" 
                  title="斜体"
                >
                  <em>I</em>
                </el-button>
                <el-button 
                  size="small" 
                  :type="editor.isActive('bulletList') ? 'primary' : ''"
                  @click="editor.chain().focus().toggleBulletList().run()" 
                  title="无序列表"
                >
                  <el-icon><List /></el-icon>
                </el-button>
                <el-button 
                  size="small" 
                  :type="editor.isActive('heading', { level: 2 }) ? 'primary' : ''"
                  @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" 
                  title="标题"
                >
                  H2
                </el-button>
                <el-button 
                  size="small" 
                  :type="editor.isActive('heading', { level: 3 }) ? 'primary' : ''"
                  @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" 
                  title="小标题"
                >
                  H3
                </el-button>
              </el-button-group>
              <el-upload
                :show-file-list="false"
                :before-upload="beforeDetailUpload"
                :http-request="handleTiptapImageUpload"
                accept="image/*"
                style="display: inline-block; margin-left: 8px;"
                :disabled="uploadLoading"
              >
                <el-button size="small" :loading="uploadLoading">
                  <el-icon v-if="!uploadLoading"><Picture /></el-icon>
                  {{ uploadLoading ? '上传中...' : '插入图片' }}
                </el-button>
              </el-upload>
            </div>
            <div class="editor-content-wrapper">
              <EditorContent :editor="editor" class="tiptap-editor" />
            </div>
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

    <!-- 商品详情图片预览弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="商品详情"
      width="600px"
    >
      <div class="detail-content" v-html="currentDetailHtml"></div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Delete,
  Edit,
  Camera,
  Picture,
  List
} from '@element-plus/icons-vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { 
  getProductListService, 
  addProductService,
  updateProductService, 
  deleteProductService
} from '@/api/product'
import { getCategoryListService } from '@/api/category'
import { uploadImageService } from '@/api/upload'
import { getShopListService } from '@/api/admin'

// 默认图片
const defaultImage = 'https://via.placeholder.com/80x80?text=No+Image'

// 响应式数据
const loading = ref(false)
const saveLoading = ref(false)
const uploadLoading = ref(false)
const productList = ref([])
const categories = ref([])
const shops = ref([]) // 店铺列表
const selectedIds = ref([])
const detailImages = ref([]) // 详细图片列表

// Tiptap 编辑器
const editor = useEditor({
  content: '',
  extensions: [
    StarterKit,
    Image.configure({
      inline: true,
      allowBase64: true,
    }),
  ],
  onUpdate: ({ editor }) => {
    editForm.detailHtml = editor.getHTML()
  },
})

// 搜索表单
const searchForm = reactive({
  name: '',
  categoryId: null,
  state: '',
  createUserId: ''
})

// 分页信息
const pagination = reactive({
  page: 1,
  size: 5,
  total: 0
})

// 编辑弹窗
const editDialogVisible = ref(false)
const editFormRef = ref()
const editForm = reactive({
  id: null,
  name: '',
  categoryId: null,
  price: null,
  stock: null,
  coverImg: '',
  detailHtml: '',
  state: '上架',
  createUserId: ''
})

// 详情弹窗
const detailDialogVisible = ref(false)
const currentDetailHtml = ref('')

// 表单验证规则
const editRules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 1, max: 50, message: '商品名称长度在1到50个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '价格必须大于0', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存数量', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存不能小于0', trigger: 'blur' }
  ],
  state: [
    { required: true, message: '请选择商品状态', trigger: 'change' }
  ],
  createUserId: [
    { required: true, message: '请选择所属店铺', trigger: 'change' }
  ]
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await getCategoryListService()
    if (res.code === 0) {
      categories.value = res.data || []
    }
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

// 获取店铺列表
const fetchShops = async () => {
  try {
    const res = await getShopListService()
    if (res.code === 0) {
      shops.value = res.data || []
    }
  } catch (error) {
    console.error('获取店铺列表失败:', error)
  }
}

// 获取商品列表 - 管理员查看全部商品
const fetchProductList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size
    }

    // 添加所有搜索条件，包括状态筛选
    if (searchForm.name && searchForm.name.trim()) {
      params.name = searchForm.name.trim()
    }
    if (searchForm.categoryId) {
      params.categoryId = searchForm.categoryId
    }
    if (searchForm.state && searchForm.state.trim()) {
      params.state = searchForm.state.trim()
    }
    if (searchForm.createUserId && searchForm.createUserId.trim()) {
      params.createUserId = parseInt(searchForm.createUserId.trim())
    }

    const res = await getProductListService(params)
    if (res.code === 0) {
      let rawData = []
      
      if (res.data.items && Array.isArray(res.data.items)) {
        // 处理实际的API响应结构
        rawData = res.data.items
        pagination.total = res.data.total || 0
      } else if (Array.isArray(res.data)) {
        // 兼容直接返回数组的情况
        rawData = res.data
        pagination.total = res.data.length
      }

      // 直接使用后端返回的数据，包含categoryName和createUserName
      productList.value = rawData
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 移除前端筛选逻辑，改为后端统一处理

// 移除getCategoryName函数，直接使用后端返回的categoryName

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
  fetchProductList()
}

// 重置搜索
const handleReset = () => {
  searchForm.name = ''
  searchForm.categoryId = null
  searchForm.state = ''
  searchForm.createUserId = ''
  pagination.page = 1
  fetchProductList()
}

// 新增商品
const handleAdd = () => {
  resetEditForm()
  editDialogVisible.value = true
}

// 编辑商品
const handleEdit = (row) => {
  Object.assign(editForm, {
    id: row.id,
    name: row.name,
    categoryId: row.categoryId,
    price: parseFloat(row.price) || 0,
    stock: parseInt(row.stock) || 0,
    coverImg: row.coverImg || '',
    detailHtml: row.detailHtml || '',
    state: row.state || '上架',
    createUserId: row.createUserId || ''
  })
  
  // 设置 Tiptap 编辑器内容
  if (editor.value) {
    editor.value.commands.setContent(row.detailHtml || '')
  }
  
  // 设置详细图片列表
  detailImages.value = []
  if (row.detailImg) {
    if (Array.isArray(row.detailImg)) {
      detailImages.value = [...row.detailImg]
    } else if (typeof row.detailImg === 'string' && row.detailImg.trim()) {
      try {
        const parsed = JSON.parse(row.detailImg)
        if (Array.isArray(parsed)) {
          detailImages.value = [...parsed]
        }
      } catch (error) {
        console.warn('解析detailImg JSON字符串失败:', error, 'detailImg:', row.detailImg)
        detailImages.value = []
      }
    }
  }
  
  editDialogVisible.value = true
}

// 删除商品
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除商品"${row.name}"吗？此操作不可恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      const res = await deleteProductService(row.id)
      if (res.code === 0) {
        ElMessage.success('删除成功')
        fetchProductList()
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
    ElMessage.warning('请选择要删除的商品')
    return
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedIds.value.length} 个商品吗？此操作不可恢复！`,
    '批量删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      const res = await deleteProductService(selectedIds.value)
      if (res.code === 0) {
        ElMessage.success(`成功删除 ${selectedIds.value.length} 个商品`)
        selectedIds.value = []
        fetchProductList()
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

// 查看详细图片
const viewDetailImages = (row) => {
  console.log('查看详情 - row.detailImg:', row.detailImg, 'type:', typeof row.detailImg)
  console.log('查看详情 - row.detailHtml:', row.detailHtml)
  
  let detailContent = ''
  
  // 处理详细图片 - 需要解析JSON字符串
  let detailImgArray = []
  if (row.detailImg) {
    if (Array.isArray(row.detailImg)) {
      detailImgArray = row.detailImg
    } else if (typeof row.detailImg === 'string' && row.detailImg.trim()) {
      try {
        const parsed = JSON.parse(row.detailImg)
        if (Array.isArray(parsed)) {
          detailImgArray = parsed
        }
      } catch (error) {
        console.warn('解析detailImg JSON字符串失败:', error, 'detailImg:', row.detailImg)
      }
    }
  }
  
  console.log('解析后的detailImgArray:', detailImgArray)
  
  // 如果有详细图片，显示图片
  if (detailImgArray.length > 0) {
    detailContent += '<div class="detail-images-gallery">'
    detailImgArray.forEach(imgUrl => {
      detailContent += `<img src="${imgUrl}" alt="商品详细图片" style="max-width: 100%; height: auto; margin: 8px 0; border-radius: 4px; display: block;" />`
    })
    detailContent += '</div>'
  }
  
  // 如果有detailHtml，转换Markdown并显示
  if (row.detailHtml && row.detailHtml.trim()) {
    if (detailContent) {
      detailContent += '<div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee;">'
    }
    detailContent += formatMarkdown(row.detailHtml)
    if (detailContent.includes('<div style="margin-top: 16px;')) {
      detailContent += '</div>'
    }
  }
  
  // 如果没有任何内容
  if (!detailContent) {
    detailContent = '<p style="text-align: center; color: #999; padding: 20px;">暂无详细信息</p>'
  }
  
  currentDetailHtml.value = detailContent
  detailDialogVisible.value = true
}

// 保存商品
const handleSave = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()
    saveLoading.value = true

    // detailImg 和 detailHtml 是独立的数据源，不需要混合处理
    const productData = {
      name: editForm.name,
      coverImg: editForm.coverImg,
      price: editForm.price.toString(),
      stock: editForm.stock.toString(),
      detailImg: detailImages.value.length > 0 ? detailImages.value : null,
      detailHtml: editForm.detailHtml || '',
      categoryId: editForm.categoryId,
      state: editForm.state
    }

    const isEdit = !!editForm.id
    let res

    if (isEdit) {
      productData.id = editForm.id
      res = await updateProductService(productData)
    } else {
      // 新增商品时，需要指定创建用户ID
      if (editForm.createUserId) {
        productData.createUserId = parseInt(editForm.createUserId)
      }
      res = await addProductService(productData)
    }
    
    if (res.code === 0) {
      ElMessage.success(isEdit ? '更新成功' : '新增成功')
      editDialogVisible.value = false
      fetchProductList()
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
    name: '',
    categoryId: null,
    price: null,
    stock: null,
    coverImg: '',
    detailHtml: '',
    state: '上架', // 重置为默认状态
    createUserId: ''
  })
  detailImages.value = []
  
  // 清空 Tiptap 编辑器内容
  if (editor.value) {
    editor.value.commands.setContent('')
  }
  
  if (editFormRef.value) {
    editFormRef.value.clearValidate()
  }
}

// 图片上传相关方法
const beforeCoverUpload = (file) => {
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

const beforeDetailUpload = (file) => {
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

const handleCoverUpload = async (options) => {
  uploadLoading.value = true
  try {
    const res = await uploadImageService(options.file)
    if (res.code === 0) {
      editForm.coverImg = res.data
      ElMessage.success('封面图片上传成功')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('图片上传失败')
  } finally {
    uploadLoading.value = false
  }
}

const handleDetailUpload = async (options) => {
  uploadLoading.value = true
  try {
    const res = await uploadImageService(options.file)
    if (res.code === 0) {
      detailImages.value.push(res.data)
      ElMessage.success('详细图片上传成功')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('图片上传失败')
  } finally {
    uploadLoading.value = false
  }
}

const handleTiptapImageUpload = async (options) => {
  uploadLoading.value = true
  try {
    const res = await uploadImageService(options.file)
    if (res.code === 0) {
      // 在 Tiptap 编辑器中插入图片
      if (editor.value) {
        editor.value.chain().focus().setImage({ src: res.data }).run()
        ElMessage.success('图片插入成功')
      }
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('图片上传失败')
  } finally {
    uploadLoading.value = false
  }
}

const removeDetailImage = (index) => {
  detailImages.value.splice(index, 1)
}

// Tiptap 编辑器相关方法（formatMarkdown 保留用于查看详情）
const formatMarkdown = (text) => {
  if (!text) return ''
  
  // 简单的Markdown转HTML
  let html = text
    // 标题
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // 粗体和斜体
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 图片
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 8px 0; border-radius: 4px;" />')
    // 列表
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // 换行
    .replace(/\n/g, '<br>')
  
  // 处理列表包装
  html = html.replace(/(<li>.*?<\/li>)/gs, (match) => {
    return '<ul>' + match + '</ul>'
  })
  
  return html
}

// 分页大小改变
const handlePageSizeChange = () => {
  pagination.page = 1
  fetchProductList()
}

// 页码改变
const handlePageChange = () => {
  fetchProductList()
}

// 初始化
onMounted(async () => {
  try {
    await fetchCategories()
    await fetchShops()
    await fetchProductList()
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('页面初始化失败，请刷新重试')
  }
})

// 组件销毁时清理编辑器
onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<style scoped>
.product-info-container {
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

/* 商品名称单元格 */
.product-name-cell {
  max-width: 150px;
}

.product-name-cell span {
  display: block;
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

/* 价格文本 */
.price-text {
  color: #ff5000;
  font-weight: 600;
}

/* 分页 */
.pagination-wrapper {
  padding: 20px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #f0f0f0;
}

/* 详情内容 */
.detail-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 4px;
  line-height: 1.6;
}

.detail-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 8px 0;
}

/* 图片上传相关样式 */
.upload-section {
  width: 100%;
}

.cover-uploader {
  display: block;
}

.cover-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.3s;
}

.cover-preview:hover {
  border-color: #409EFF;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.cover-overlay {
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

.cover-preview:hover .cover-overlay {
  opacity: 1;
}

.cover-placeholder {
  width: 120px;
  height: 120px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
  color: #8c939d;
}

.cover-placeholder:hover {
  border-color: #409EFF;
  color: #409EFF;
}

.upload-icon {
  font-size: 28px;
  margin-bottom: 8px;
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

/* 详细图片相关样式 */
.detail-images-section {
  width: 100%;
}

.images-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
}

.image-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
}

.detail-image {
  width: 100%;
  height: 100%;
}

.image-actions {
  position: absolute;
  top: 4px;
  right: 4px;
}

.detail-uploader {
  display: inline-block;
}

.upload-placeholder {
  width: 80px;
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
  font-size: 12px;
}

.upload-placeholder:hover {
  border-color: #409EFF;
  color: #409EFF;
}

.upload-placeholder.uploading {
  border-color: #409EFF;
  color: #409EFF;
  cursor: not-allowed;
}

.upload-placeholder.uploading:hover {
  border-color: #409EFF;
}

/* Tiptap 富文本编辑器样式 */
.tiptap-editor-container {
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.editor-toolbar {
  padding: 8px 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  gap: 8px;
}

.editor-toolbar .el-button {
  min-width: 32px;
  height: 28px;
  padding: 0 8px;
}

.editor-toolbar .el-button strong,
.editor-toolbar .el-button em {
  font-size: 14px;
  font-weight: bold;
}

.editor-toolbar .el-button em {
  font-style: italic;
  font-weight: normal;
}

.editor-content-wrapper {
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
}

.tiptap-editor {
  outline: none;
  padding: 12px;
  min-height: 200px;
}

.tiptap-editor :deep(.ProseMirror) {
  outline: none;
  min-height: 180px;
  line-height: 1.6;
}

.tiptap-editor :deep(.ProseMirror p) {
  margin: 8px 0;
}

.tiptap-editor :deep(.ProseMirror h2) {
  font-size: 20px;
  font-weight: bold;
  margin: 16px 0 8px 0;
  color: #303133;
}

.tiptap-editor :deep(.ProseMirror h3) {
  font-size: 16px;
  font-weight: bold;
  margin: 12px 0 6px 0;
  color: #303133;
}

.tiptap-editor :deep(.ProseMirror ul) {
  margin: 8px 0;
  padding-left: 20px;
}

.tiptap-editor :deep(.ProseMirror li) {
  margin: 4px 0;
}

.tiptap-editor :deep(.ProseMirror img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 8px 0;
  display: block;
}

.tiptap-editor :deep(.ProseMirror strong) {
  font-weight: bold;
  color: #303133;
}

.tiptap-editor :deep(.ProseMirror em) {
  font-style: italic;
  color: #606266;
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