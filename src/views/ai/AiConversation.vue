<template>
  <div class="ai-chat-page">
    <!-- 移动端汉堡菜单按钮 -->
    <el-button 
      class="mobile-menu-btn" 
      :icon="Menu" 
      @click="showDrawer = true"
      circle
    />

    <!-- 侧边栏 - 桌面端 -->
    <div class="sidebar desktop-only">
      <div class="sidebar-header">
        <h2>AI 对话</h2>
        <el-button type="primary" :icon="Plus" @click="createNewConversation">
          新建对话
        </el-button>
      </div>
      
      <div class="conversation-list">
        <div
          v-for="conv in conversations"
          :key="conv.conversationId"
          class="conversation-item"
          :class="{ active: currentConversationId === conv.conversationId }"
          @click="selectConversation(conv.conversationId)"
        >
          <div class="conv-title">{{ conv.title }}</div>
          <div class="conv-preview">{{ conv.lastMessage }}</div>
          <div class="conv-time">{{ formatTime(conv.lastMessageTime) }}</div>
          <el-button
            class="delete-btn"
            text
            :icon="Delete"
            @click.stop="deleteConversation(conv.conversationId)"
          />
        </div>
      </div>
    </div>

    <!-- 侧边栏 - 移动端抽屉 -->
    <el-drawer
      v-model="showDrawer"
      title="会话列表"
      direction="ltr"
      size="80%"
      class="mobile-drawer"
    >
      <div class="drawer-header">
        <el-button type="primary" :icon="Plus" @click="createNewConversation" style="width: 100%;">
          新建对话
        </el-button>
      </div>
      
      <div class="conversation-list">
        <div
          v-for="conv in conversations"
          :key="conv.conversationId"
          class="conversation-item"
          :class="{ active: currentConversationId === conv.conversationId }"
          @click="selectConversationMobile(conv.conversationId)"
        >
          <div class="conv-title">{{ conv.title }}</div>
          <div class="conv-preview">{{ conv.lastMessage }}</div>
          <div class="conv-time">{{ formatTime(conv.lastMessageTime) }}</div>
          <el-button
            class="delete-btn"
            text
            :icon="Delete"
            @click.stop="deleteConversation(conv.conversationId)"
          />
        </div>
      </div>
    </el-drawer>

    <!-- 主聊天区域 -->
    <div class="chat-main">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <div class="header-left">
          <el-icon class="ai-icon"><ChatDotRound /></el-icon>
          <span class="header-title">{{ currentTitle }}</span>
          <el-button
            v-if="currentConversationId"
            text
            :icon="Edit"
            @click="showEditTitle = true"
            class="desktop-only"
          />
        </div>
        <div class="header-actions">
          <el-button
            v-if="currentConversationId"
            text
            :icon="Delete"
            @click="clearCurrentConversation"
            title="清空对话"
            class="desktop-only"
          />
          <!-- 移动端更多菜单 -->
          <el-dropdown @command="handleMobileMenu" class="mobile-only">
            <el-button text :icon="MoreFilled" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="editTitle" v-if="currentConversationId">
                  <el-icon><Edit /></el-icon>
                  <span>修改标题</span>
                </el-dropdown-item>
                <el-dropdown-item command="clearChat" v-if="currentConversationId">
                  <el-icon><Delete /></el-icon>
                  <span>清空对话</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-dropdown @command="handleUserMenu" v-if="tokenStore.token && !tokenStore.isTokenExpired()">
            <el-button text title="用户菜单">
              <el-avatar :size="32" :src="userInfo.userPic">
                <el-icon><User /></el-icon>
              </el-avatar>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled>
                  <div class="user-info-item">
                    <span class="user-name">{{ userInfo.nickname || userInfo.username || '未登录' }}</span>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item divided command="userInfo">
                  <el-icon><User /></el-icon>
                  <span>个人信息</span>
                </el-dropdown-item>
                <el-dropdown-item command="changePassword">
                  <el-icon><Lock /></el-icon>
                  <span>修改密码</span>
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button v-else type="primary" @click="router.push('/ai-login')" size="small">
            登录
          </el-button>
        </div>
      </div>

      <!-- 消息列表 -->
      <div class="chat-messages" ref="messagesContainer">
        <div v-if="messages.length === 0" class="empty-state">
          <el-icon class="empty-icon"><ChatDotRound /></el-icon>
          <p>你好！我是AI助手</p>
          <p class="empty-desc">有什么可以帮助你的吗？</p>
        </div>

        <div
          v-for="msg in messages"
          :key="msg.id"
          class="message-item"
          :class="msg.role"
        >
          <div class="message-avatar">
            <el-avatar v-if="msg.role === 'user'" :size="32" :src="userInfo.userPic">
              <el-icon><User /></el-icon>
            </el-avatar>
            <el-avatar v-else :size="32" style="background: #667eea">
              <el-icon><ChatDotRound /></el-icon>
            </el-avatar>
          </div>
          <div class="message-content">
            <div 
              class="message-text" 
              :class="{ 'markdown-body': msg.role === 'assistant' }"
            >
              <div v-if="msg.role === 'assistant'" v-html="renderMarkdown(msg.content)"></div>
              <div v-else class="user-message-text">{{ msg.content }}</div>
            </div>
            <div class="message-time">{{ formatTime(msg.createTime) }}</div>
          </div>
        </div>

        <!-- 加载中提示 -->
        <div v-if="isLoading" class="message-item assistant">
          <div class="message-avatar">
            <el-avatar :size="32" style="background: #667eea">
              <el-icon><ChatDotRound /></el-icon>
            </el-avatar>
          </div>
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="chat-input">
        <div class="input-wrapper">
          <textarea
            v-model="inputMessage"
            class="message-textarea"
            placeholder="输入消息... (Ctrl+Enter 发送，Enter 换行)"
            @keydown="handleKeyDown"
            @input="autoResizeTextarea"
            :disabled="isLoading"
            rows="1"
          />
          <el-button
            type="primary"
            :icon="Promotion"
            @click="sendMessage"
            :loading="isLoading"
            :disabled="!inputMessage.trim()"
            class="send-button"
            circle
          />
        </div>
        <div class="model-selector">
          <span class="model-label">模型：</span>
          <el-select 
            v-model="selectedModel" 
            class="model-select-bottom"
            size="small"
            teleported
            popper-class="ai-conversation-select-popper"
          >
            <el-option
              v-for="(info, key) in models"
              :key="key"
              :label="info.description"
              :value="key"
            >
              <div class="model-option">
                <span class="model-name">{{ info.description }}</span>
                <span class="model-desc">{{ info.model }}</span>
              </div>
            </el-option>
          </el-select>
        </div>
      </div>
    </div>

    <!-- 编辑标题对话框 -->
    <el-dialog v-model="showEditTitle" title="修改会话标题" width="400px">
      <el-input v-model="newTitle" placeholder="请输入新标题" maxlength="50" />
      <template #footer>
        <el-button @click="showEditTitle = false">取消</el-button>
        <el-button type="primary" @click="updateTitle">确定</el-button>
      </template>
    </el-dialog>

    <!-- 个人信息对话框 -->
    <el-dialog v-model="showUserInfo" title="个人信息" width="500px">
      <el-form :model="userInfoForm" :rules="userInfoRules" ref="userInfoFormRef" label-width="80px">
        <!-- 头像上传 -->
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :headers="{ Authorization: tokenStore.token }"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <el-avatar v-if="userInfoForm.userPic" :size="100" :src="userInfoForm.userPic" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">点击上传头像，支持 JPG/PNG 格式，大小不超过 2MB</div>
        </el-form-item>
        
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userInfoForm.username" placeholder="请输入用户名" disabled />
        </el-form-item>
        
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="userInfoForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userInfoForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userInfoForm.email" placeholder="请输入邮箱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUserInfo = false">取消</el-button>
        <el-button type="primary" @click="updateUserInfo" :loading="userInfoLoading">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showChangePassword" title="修改密码" width="500px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input 
            v-model="passwordForm.oldPassword" 
            type="password" 
            placeholder="请输入原密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password" 
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showChangePassword = false">取消</el-button>
        <el-button type="primary" @click="updatePassword" :loading="passwordLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import {
  ChatDotRound,
  Delete,
  User,
  Promotion,
  Plus,
  Edit,
  SwitchButton,
  Lock,
  Menu,
  MoreFilled
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useTokenStore } from '@/stores/token'
import useUserInfoStore from '@/stores/userInfo'
import {
  getConversationListService,
  getConversationDetailService,
  sendMessageStreamService,
  deleteConversationService,
  updateConversationTitleService,
  getAiModelsService
} from '@/api/conversation'
import { 
  userInfoService, 
  userUpdateInfoService, 
  userResetPasswordService 
} from '@/api/user'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

const router = useRouter()
const tokenStore = useTokenStore()
const userInfoStore = useUserInfoStore()

// 配置 marked
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (err) {
        console.error('代码高亮失败:', err)
      }
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true, // 支持 GitHub 风格的换行
  gfm: true, // 启用 GitHub 风格的 Markdown
})

// Markdown 渲染函数
const renderMarkdown = (content) => {
  if (!content) return ''
  try {
    const rawHtml = marked.parse(content)
    // 使用 DOMPurify 清理 HTML，防止 XSS 攻击
    return DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre', 
        'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'a', 'img', 'table', 'thead', 'tbody', 
        'tr', 'th', 'td', 'hr', 'div', 'span'
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel']
    })
  } catch (error) {
    console.error('Markdown 渲染失败:', error)
    return content
  }
}

// 用户信息
const userInfo = computed(() => userInfoStore.info)

// 上传地址
const uploadUrl = '/api/upload'

// 会话列表
const conversations = ref([])
const currentConversationId = ref(null)
const messages = ref([])
const inputMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref(null)

// 移动端抽屉
const showDrawer = ref(false)

// 模型选择
const models = ref({})
const selectedModel = ref('')

// 标题编辑
const showEditTitle = ref(false)
const newTitle = ref('')

// 个人信息对话框
const showUserInfo = ref(false)
const userInfoFormRef = ref(null)
const userInfoLoading = ref(false)
const userInfoForm = ref({
  id: null,
  username: '',
  nickname: '',
  phone: '',
  email: '',
  userPic: ''
})

const userInfoRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 16, message: '用户名长度在 3 到 16 个字符', trigger: 'blur' }
  ],
  nickname: [
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^\d{11}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

// 修改密码对话框
const showChangePassword = ref(false)
const passwordFormRef = ref(null)
const passwordLoading = ref(false)
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (_rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'))
  } else if (value !== passwordForm.value.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 5, max: 20, message: '密码长度在 5 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 当前会话标题
const currentTitle = computed(() => {
  if (!currentConversationId.value) return '新对话'
  const conv = conversations.value.find(
    (c) => c.conversationId === currentConversationId.value
  )
  return conv ? conv.title : '新对话'
})

// 加载可用的AI模型
const loadModels = async () => {
  try {
    const result = await getAiModelsService()
    if (result.code === 0 && result.data?.models) {
      models.value = result.data.models
      const firstModelKey = Object.keys(models.value)[0]
      if (firstModelKey) selectedModel.value = firstModelKey
    }
  } catch (error) {
    console.error('加载AI模型失败:', error)
  }
}

// 加载会话列表
const loadConversations = async () => {
  try {
    const result = await getConversationListService()
    if (result.code === 0) {
      conversations.value = result.data || []
    }
  } catch (error) {
    console.error('加载会话列表失败:', error)
  }
}

// 选择会话
const selectConversation = async (conversationId) => {
  if (!tokenStore.token || tokenStore.isTokenExpired()) {
    ElMessage.warning('请先登录')
    router.push('/ai-login')
    return
  }
  
  currentConversationId.value = conversationId
  try {
    const result = await getConversationDetailService(conversationId)
    if (result.code === 0) {
      messages.value = result.data.messages || []
      scrollToBottom()
    }
  } catch (error) {
    ElMessage.error('加载会话详情失败')
  }
}

// 创建新会话
const createNewConversation = () => {
  if (!tokenStore.token || tokenStore.isTokenExpired()) {
    ElMessage.warning('请先登录')
    router.push('/ai-login')
    return
  }
  
  currentConversationId.value = null
  messages.value = []
  inputMessage.value = ''
}

// 删除会话
const deleteConversation = async (conversationId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个会话吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const result = await deleteConversationService(conversationId)
    if (result.code === 0) {
      ElMessage.success('删除成功')
      if (currentConversationId.value === conversationId) {
        createNewConversation()
      }
      await loadConversations()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 清空当前会话
const clearCurrentConversation = async () => {
  if (!currentConversationId.value) return
  await deleteConversation(currentConversationId.value)
}

// 更新标题
const updateTitle = async () => {
  if (!newTitle.value.trim()) {
    ElMessage.warning('标题不能为空')
    return
  }
  
  try {
    const result = await updateConversationTitleService(
      currentConversationId.value,
      newTitle.value
    )
    if (result.code === 0) {
      ElMessage.success('标题修改成功')
      showEditTitle.value = false
      await loadConversations()
    }
  } catch (error) {
    ElMessage.error('标题修改失败')
  }
}

// 处理键盘事件
const handleKeyDown = (e) => {
  if (e.key === 'Enter' && e.ctrlKey) {
    e.preventDefault()
    sendMessage()
  }
}

// 自动调整 textarea 高度
const autoResizeTextarea = (e) => {
  const textarea = e.target
  textarea.style.height = 'auto'
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  if (!tokenStore.token || tokenStore.isTokenExpired()) {
    ElMessageBox.confirm('请先登录后再发送消息', '提示', {
      confirmButtonText: '去登录',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      router.push('/ai-login')
    }).catch(() => {})
    return
  }

  const userMessage = inputMessage.value.trim()
  inputMessage.value = ''
  
  // 重置 textarea 高度
  nextTick(() => {
    const textarea = document.querySelector('.message-textarea')
    if (textarea) {
      textarea.style.height = 'auto'
    }
  })

  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: userMessage,
    createTime: new Date().toISOString()
  })
  scrollToBottom()

  const aiMsgIndex = messages.value.length
  messages.value.push({
    id: Date.now() + 1,
    role: 'assistant',
    content: '',
    createTime: new Date().toISOString()
  })

  isLoading.value = true

  try {
    const requestData = {
      conversationId: currentConversationId.value,
      userMessage,
      ...(selectedModel.value && { model: selectedModel.value }),
      ...(!currentConversationId.value && { title: userMessage.substring(0, 20) })
    }

    await sendMessageStreamService(requestData, (chunk) => {
      messages.value[aiMsgIndex].content += chunk
      scrollToBottom()
    })

    await loadConversations()
    
    if (!currentConversationId.value && conversations.value.length > 0) {
      currentConversationId.value = conversations.value[0].conversationId
    }
  } catch (error) {
    ElMessage.error('发送消息失败')
    messages.value.splice(aiMsgIndex, 1)
  } finally {
    isLoading.value = false
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 打开个人信息对话框
const openUserInfoDialog = async () => {
  try {
    const result = await userInfoService()
    if (result.code === 0) {
      userInfoForm.value = {
        id: result.data.id,
        username: result.data.username,
        nickname: result.data.nickname || '',
        phone: result.data.phone,
        email: result.data.email || '',
        userPic: result.data.userPic || ''
      }
      showUserInfo.value = true
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败')
  }
}

// 头像上传成功
const handleAvatarSuccess = (response) => {
  if (response.code === 0) {
    userInfoForm.value.userPic = response.data
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error('头像上传失败')
  }
}

// 头像上传前验证
const beforeAvatarUpload = (file) => {
  const isJPGOrPNG = ['image/jpeg', 'image/png'].includes(file.type)
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPGOrPNG) {
    ElMessage.error('头像只能是 JPG/PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

// 更新个人信息
const updateUserInfo = async () => {
  if (!userInfoFormRef.value) return
  
  try {
    await userInfoFormRef.value.validate()
    userInfoLoading.value = true
    
    const result = await userUpdateInfoService(userInfoForm.value)
    if (result.code === 0) {
      ElMessage.success('个人信息更新成功')
      showUserInfo.value = false
      
      // 重新获取用户信息并更新store
      const infoRes = await userInfoService()
      if (infoRes.code === 0) {
        userInfoStore.setInfo(infoRes.data)
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.msg || '更新失败')
    }
  } finally {
    userInfoLoading.value = false
  }
}

// 打开修改密码对话框
const openChangePasswordDialog = () => {
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  showChangePassword.value = true
}

// 修改密码
const updatePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true
    
    const result = await userResetPasswordService({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    if (result.code === 0) {
      ElMessage.success('密码修改成功，请重新登录')
      showChangePassword.value = false
      
      // 清除登录信息并跳转到登录页
      tokenStore.removeToken()
      userInfoStore.removeInfo()
      router.push('/ai-login')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.msg || '密码修改失败')
    }
  } finally {
    passwordLoading.value = false
  }
}

// 选择会话（移动端）
const selectConversationMobile = async (conversationId) => {
  await selectConversation(conversationId)
  showDrawer.value = false
}

// 处理移动端菜单
const handleMobileMenu = (command) => {
  if (command === 'editTitle') {
    showEditTitle.value = true
  } else if (command === 'clearChat') {
    clearCurrentConversation()
  }
}

// 处理用户菜单
const handleUserMenu = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      tokenStore.removeToken()
      userInfoStore.removeInfo()
      ElMessage.success('已退出登录')
      router.push('/ai-login')
    } catch (error) {}
  } else if (command === 'userInfo') {
    openUserInfoDialog()
  } else if (command === 'changePassword') {
    openChangePasswordDialog()
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadModels()
  if (tokenStore.token && !tokenStore.isTokenExpired()) {
    loadConversations()
  }
})
</script>

<style scoped>
/* 基础布局 */
.ai-chat-page {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
  position: relative;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 1000;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 桌面端显示/隐藏 */
.desktop-only {
  display: inline-flex;
}

.mobile-only {
  display: none;
}

/* 侧边栏 */
.sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.sidebar-header h2 {
  margin: 0 0 15px 0;
  font-size: 20px;
  color: #303133;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.conversation-item {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.conversation-item:hover {
  background: #f5f7fa;
}

.conversation-item.active {
  background: #ecf5ff;
  border-left: 3px solid #409eff;
}

.conv-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conv-preview {
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.conv-time {
  font-size: 11px;
  color: #c0c4cc;
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.conversation-item:hover .delete-btn {
  opacity: 1;
}

/* 抽屉头部 */
.drawer-header {
  padding: 0 0 16px 0;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 16px;
}

/* 主聊天区域 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-icon {
  font-size: 24px;
  color: #667eea;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 5px;
  align-items: center;
}

.user-info-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
}

.user-name {
  color: #303133;
  font-weight: 600;
  font-size: 14px;
}

/* 头像上传样式 */
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  line-height: 1.5;
}

/* 模型选择样式 */
.model-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.model-desc {
  font-size: 12px;
  color: #909399;
}

/* 消息列表 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f7fa;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-icon {
  font-size: 64px;
  color: #c0c4cc;
  margin-bottom: 20px;
}

.empty-state p {
  margin: 8px 0;
  font-size: 16px;
}

.empty-desc {
  font-size: 14px;
  color: #c0c4cc;
}

/* 消息项 */
.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
}

.message-item.user .message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-text {
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.5;
  word-wrap: break-word;
  font-size: 15px;
}

.user-message-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
}

/* Markdown 样式 */
.markdown-body {
  white-space: normal;
}

.markdown-body p {
  margin: 0.5em 0;
}

.markdown-body p:first-child {
  margin-top: 0;
}

.markdown-body p:last-child {
  margin-bottom: 0;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin: 1em 0 0.5em 0;
  font-weight: 600;
  line-height: 1.3;
}

.markdown-body h1 { font-size: 1.8em; }
.markdown-body h2 { font-size: 1.5em; }
.markdown-body h3 { font-size: 1.3em; }
.markdown-body h4 { font-size: 1.1em; }
.markdown-body h5 { font-size: 1em; }
.markdown-body h6 { font-size: 0.9em; }

.markdown-body code {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  color: #e83e8c;
}

.markdown-body pre {
  background: #282c34;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.8em 0;
}

.markdown-body pre code {
  background: transparent;
  padding: 0;
  color: #abb2bf;
  font-size: 0.85em;
  line-height: 1.5;
}

.markdown-body ul,
.markdown-body ol {
  margin: 0.5em 0;
  padding-left: 2em;
}

.markdown-body li {
  margin: 0.3em 0;
}

.markdown-body blockquote {
  border-left: 4px solid #667eea;
  padding-left: 1em;
  margin: 0.8em 0;
  color: #666;
  font-style: italic;
}

.markdown-body a {
  color: #667eea;
  text-decoration: none;
}

.markdown-body a:hover {
  text-decoration: underline;
}

.markdown-body table {
  border-collapse: collapse;
  width: 100%;
  margin: 0.8em 0;
}

.markdown-body th,
.markdown-body td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}

.markdown-body th {
  background: #f5f7fa;
  font-weight: 600;
}

.markdown-body hr {
  border: none;
  border-top: 1px solid #e4e7ed;
  margin: 1em 0;
}

.markdown-body strong {
  font-weight: 600;
}

.markdown-body em {
  font-style: italic;
}

.markdown-body img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 0.5em 0;
}

.message-item.user .message-text {
  background: #667eea;
  color: white;
  border-radius: 12px 12px 0 12px;
  max-width: 100%;
}

.message-item.assistant .message-text {
  background: white;
  color: #333;
  border-radius: 12px 12px 12px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 6px;
  padding: 0 4px;
}

/* 输入中动画 */
.typing-indicator {
  display: flex;
  gap: 6px;
  padding: 12px 16px;
  background: white;
  border-radius: 12px 12px 12px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

/* 输入区域 */
.chat-input {
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #e4e7ed;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 10px 12px;
  background: #f5f7fa;
  border-radius: 12px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
}

.input-wrapper:focus-within {
  border-color: #667eea;
  background: white;
}

.message-textarea {
  flex: 1;
  min-height: 24px;
  max-height: 120px;
  border: none;
  outline: none;
  resize: none;
  font-size: 15px;
  line-height: 1.5;
  background: transparent;
  font-family: inherit;
  padding: 4px 0;
  overflow-y: auto;
}

.message-textarea:disabled {
  background: transparent;
  color: #c0c4cc;
}

.message-textarea::placeholder {
  color: #c0c4cc;
  font-size: 13px;
}

.send-button {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  padding: 0;
  min-height: 32px;
}

.send-button :deep(.el-icon) {
  font-size: 16px;
}

/* 模型选择器 */
.model-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 0 4px;
}

.model-label {
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
}

.model-select-bottom {
  flex: 1;
  max-width: 200px;
}

.model-select-bottom :deep(.el-input__wrapper) {
  font-size: 12px;
  padding: 2px 8px;
  background: transparent;
  box-shadow: none;
  border: none;
}

.model-select-bottom :deep(.el-input__inner) {
  font-size: 12px;
  color: #606266;
  font-weight: 500;
}

.model-select-bottom :deep(.el-input__suffix) {
  font-size: 12px;
}

.model-select-bottom :deep(.el-select__caret) {
  color: #909399;
  font-size: 12px;
}

/* 滚动条样式 */
.message-textarea::-webkit-scrollbar {
  width: 4px;
}

.message-textarea::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 2px;
}

.message-textarea::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

/* 响应式设计 - 平板 */
@media (max-width: 1024px) {
  .sidebar {
    width: 240px;
  }
  
  .message-content {
    max-width: 75%;
  }
}

/* 响应式设计 - 移动端 */
@media (max-width: 768px) {
  .ai-chat-page {
    height: 100vh;
  }
  
  /* 显示移动端元素 */
  .mobile-menu-btn {
    display: flex;
  }
  
  .mobile-only {
    display: inline-flex;
  }
  
  /* 隐藏桌面端元素 */
  .desktop-only {
    display: none !important;
  }
  
  /* 隐藏侧边栏 */
  .sidebar.desktop-only {
    display: none;
  }
  
  /* 聊天区域占满 */
  .chat-main {
    width: 100%;
  }
  
  /* 头部优化 */
  .chat-header {
    padding: 12px 16px;
  }
  
  .header-title {
    font-size: 16px;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .ai-icon {
    font-size: 20px;
  }
  
  /* 设置面板 */
  .settings-panel {
    max-height: 50vh;
  }
  
  /* 消息列表 */
  .chat-messages {
    padding: 16px 12px;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .message-text {
    font-size: 14px;
    padding: 10px 14px;
    line-height: 1.4;
  }
  
  .user-message-text {
    line-height: 1.4;
  }
  
  .message-avatar {
    flex-shrink: 0;
  }
  
  /* 输入区域 */
  .chat-input {
    padding: 12px 16px;
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }
  
  .message-textarea::placeholder {
    font-size: 12px;
  }
  
  .model-selector {
    flex-wrap: wrap;
  }
  
  .model-select-bottom {
    max-width: 100%;
  }
  
  /* 空状态 */
  .empty-state {
    padding: 40px 20px;
  }
  
  .empty-icon {
    font-size: 48px;
  }
  
  .empty-state p {
    font-size: 14px;
  }
}

/* 小屏手机优化 */
@media (max-width: 375px) {
  .chat-header {
    padding: 10px 12px;
  }
  
  .header-title {
    max-width: 120px;
  }
  
  .message-content {
    max-width: 90%;
  }
  
  .message-text {
    font-size: 13px;
    padding: 8px 12px;
    line-height: 1.4;
  }
  
  .user-message-text {
    line-height: 1.4;
  }
  
  .chat-input {
    padding: 10px 12px;
  }
  
  .send-btn {
    min-width: 60px;
  }
}

/* 触摸优化 */
@media (hover: none) and (pointer: coarse) {
  /* 增大可点击区域 */
  .conversation-item {
    min-height: 60px;
    padding: 14px;
  }
  
  .el-button {
    min-height: 44px;
  }
  
  /* 触摸反馈 */
  .conversation-item:active {
    background: #e8f4ff;
  }
  
  .message-item:active {
    opacity: 0.9;
  }
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar,
.conversation-list::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-thumb,
.conversation-list::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover,
.conversation-list::-webkit-scrollbar-thumb:hover {
  background: #909399;
}
</style>

<style>
/* 全局样式：优化下拉菜单 */
.ai-conversation-select-popper {
  z-index: 10001 !important;
  min-width: 280px !important;
  max-width: 320px !important;
}

.ai-conversation-select-popper .el-select-dropdown__item {
  white-space: normal !important;
  height: auto !important;
  line-height: 1.3 !important;
  padding: 8px 16px !important;
}

.ai-conversation-select-popper .model-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ai-conversation-select-popper .model-name {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}

.ai-conversation-select-popper .model-desc {
  font-size: 11px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
