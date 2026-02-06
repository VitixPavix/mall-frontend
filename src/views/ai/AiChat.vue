<template>
  <div class="ai-chat-page">
    <!-- 侧边栏 - 会话列表 -->
    <div class="sidebar">
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
          />
        </div>
        <div class="header-actions">
          <el-button text :icon="Setting" @click="showSettings = true" title="设置" />
          <el-button
            v-if="currentConversationId"
            text
            :icon="Delete"
            @click="clearCurrentConversation"
            title="清空对话"
          />
          <el-dropdown @command="handleUserMenu">
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
        </div>
      </div>

      <!-- 设置面板 -->
      <div v-if="showSettings" class="settings-panel">
        <div class="settings-header">
          <span>AI 设置</span>
          <el-button text :icon="Close" @click="showSettings = false" />
        </div>
        <div class="settings-content">
          <div class="setting-item">
            <label>选择模型</label>
            <el-select v-model="selectedModel" placeholder="选择AI模型">
              <el-option
                v-for="(info, key) in models"
                :key="key"
                :label="info.description"
                :value="key"
              >
                <div class="model-option">
                  <span>{{ info.description }}</span>
                  <span class="model-desc">{{ info.model }}</span>
                </div>
              </el-option>
            </el-select>
            <div class="setting-hint">当前使用: {{ selectedModel ? models[selectedModel]?.description : '默认模型' }}</div>
          </div>
          <div class="setting-item">
            <label>温度 (Temperature)</label>
            <el-slider
              v-model="temperature"
              :min="0"
              :max="2"
              :step="0.1"
              show-input
              :input-size="'small'"
            />
            <div class="setting-hint">控制输出随机性，值越高越随机</div>
          </div>
          <div class="setting-item">
            <label>最大Token数</label>
            <el-input-number
              v-model="maxTokens"
              :min="100"
              :max="8000"
              :step="100"
              size="small"
            />
            <div class="setting-hint">控制回复的最大长度</div>
          </div>
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
            <div class="message-text">{{ msg.content }}</div>
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
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="3"
          placeholder="输入消息..."
          @keyup.enter.ctrl="sendMessage"
          :disabled="isLoading"
        />
        <div class="input-actions">
          <span class="input-hint">Ctrl + Enter 发送</span>
          <el-button
            type="primary"
            :icon="Promotion"
            @click="sendMessage"
            :loading="isLoading"
            :disabled="!inputMessage.trim()"
          >
            发送
          </el-button>
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
  Close,
  Delete,
  User,
  Promotion,
  Setting,
  Plus,
  Edit,
  SwitchButton,
  Lock
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

const router = useRouter()
const tokenStore = useTokenStore()
const userInfoStore = useUserInfoStore()

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

// 设置相关
const showSettings = ref(false)
const models = ref({})
const selectedModel = ref('')
const temperature = ref(0.6)
const maxTokens = ref(2000)

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

const validateConfirmPassword = (rule, value, callback) => {
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
      // 默认选择第一个模型
      const firstModelKey = Object.keys(models.value)[0]
      if (firstModelKey) {
        selectedModel.value = firstModelKey
      }
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

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userMessage = inputMessage.value.trim()
  inputMessage.value = ''

  // 添加用户消息到界面
  const userMsg = {
    id: Date.now(),
    role: 'user',
    content: userMessage,
    createTime: new Date().toISOString()
  }
  messages.value.push(userMsg)
  scrollToBottom()

  // 准备AI消息占位符
  const aiMsgIndex = messages.value.length
  messages.value.push({
    id: Date.now() + 1,
    role: 'assistant',
    content: '',
    createTime: new Date().toISOString()
  })

  isLoading.value = true

  try {
    // 构建请求参数
    const requestData = {
      conversationId: currentConversationId.value,
      userMessage: userMessage,
      temperature: temperature.value,
      maxTokens: maxTokens.value
    }

    // 如果选择了模型，添加到请求中
    if (selectedModel.value) {
      requestData.model = selectedModel.value
    }

    // 如果是新会话，添加标题
    if (!currentConversationId.value) {
      requestData.title = userMessage.substring(0, 20)
    }

    // 调用流式接口
    await sendMessageStreamService(requestData, (chunk) => {
      // 逐字追加到AI消息
      messages.value[aiMsgIndex].content += chunk
      scrollToBottom()
    })

    // 流式完成后，重新加载会话列表和详情
    await loadConversations()
    
    // 如果是新会话，需要获取新的conversationId
    if (!currentConversationId.value && conversations.value.length > 0) {
      currentConversationId.value = conversations.value[0].conversationId
    }
  } catch (error) {
    ElMessage.error('发送消息失败')
    // 移除失败的AI消息
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
    } catch (error) {
      // 用户取消
    }
  } else if (command === 'userInfo') {
    openUserInfoDialog()
  } else if (command === 'changePassword') {
    openChangePasswordDialog()
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadModels()
  loadConversations()
})
</script>

<style scoped>
.ai-chat-page {
  display: flex;
  height: calc(100vh - 60px);
  background: #f5f7fa;
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

/* 设置面板 */
.settings-panel {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  max-height: 400px;
  overflow-y: auto;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #e4e7ed;
  font-weight: 600;
}

.settings-content {
  padding: 20px;
}

.setting-item {
  margin-bottom: 20px;
}

.setting-item label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.setting-item .el-select,
.setting-item .el-input {
  width: 100%;
}

.model-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.model-desc {
  font-size: 12px;
  color: #909399;
}

.setting-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
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
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.message-item.user .message-text {
  background: #667eea;
  color: white;
  border-radius: 12px 12px 0 12px;
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

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.input-hint {
  font-size: 12px;
  color: #909399;
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
/* 全局样式：让下拉框选项显示两行 */
.el-select-dropdown__item {
  height: auto !important;
  line-height: 1.4 !important;
  padding: 10px 20px !important;
}

.model-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.model-option span:first-child {
  font-weight: 500;
  color: #303133;
}

.model-option .model-desc {
  font-size: 12px;
  color: #909399;
}
</style>
