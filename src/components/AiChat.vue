<template>
  <div class="ai-chat-container">
    <!-- 聊天触发按钮 -->
    <el-button 
      v-if="!isOpen" 
      class="chat-trigger-btn" 
      type="primary" 
      :icon="ChatDotRound" 
      circle 
      size="large"
      @click="toggleChat"
    />

    <!-- 聊天窗口 -->
    <transition name="slide-up">
      <div v-if="isOpen" class="chat-window">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <div class="header-left">
            <el-icon class="ai-icon"><ChatDotRound /></el-icon>
            <span class="header-title">AI助手</span>
          </div>
          <div class="header-actions">
            <el-button 
              text 
              :icon="Setting" 
              @click="showSettings = true"
              title="设置"
            />
            <el-button 
              text 
              :icon="Delete" 
              @click="clearMessages"
              title="清空对话"
            />
            <el-button 
              text 
              :icon="Close" 
              @click="toggleChat"
              title="关闭"
            />
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
                  v-for="option in modelOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                >
                  <div class="provider-option">
                    <span>{{ option.label }}</span>
                    <span class="provider-desc">{{ option.description }}</span>
                  </div>
                </el-option>
              </el-select>
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
            v-for="(msg, index) in messages" 
            :key="index" 
            class="message-item"
            :class="msg.role"
          >
            <div class="message-avatar">
              <el-avatar v-if="msg.role === 'user'" :size="32">
                <el-icon><User /></el-icon>
              </el-avatar>
              <el-avatar v-else :size="32" style="background: #667eea;">
                <el-icon><ChatDotRound /></el-icon>
              </el-avatar>
            </div>
            <div class="message-content">
              <div class="message-text">{{ msg.content }}</div>
              <div class="message-time">{{ msg.time }}</div>
            </div>
          </div>

          <!-- 加载中提示 -->
          <div v-if="isLoading" class="message-item assistant">
            <div class="message-avatar">
              <el-avatar :size="32" style="background: #667eea;">
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
            placeholder="输入消息..."
            @keyup.enter="sendMessage"
            :disabled="isLoading"
          >
            <template #append>
              <el-button 
                :icon="Promotion" 
                @click="sendMessage"
                :loading="isLoading"
                :disabled="!inputMessage.trim()"
              />
            </template>
          </el-input>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, computed } from 'vue'
import { ChatDotRound, Close, Delete, User, Promotion, Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useTokenStore } from '@/stores/token'
import { getAiProvidersService } from '@/api/ai'

const isOpen = ref(false)
const inputMessage = ref('')
const messages = ref([])
const isLoading = ref(false)
const messagesContainer = ref(null)
const tokenStore = useTokenStore()

// AI设置相关
const showSettings = ref(false)
const providers = ref({})
const modelOptions = ref([]) // 所有可用的模型列表
const selectedModel = ref('') // 选中的模型（格式：provider:model）
const temperature = ref(0.6)
const maxTokens = ref(2000)

// 加载可用的AI服务商和模型
const loadProviders = async () => {
  try {
    const result = await getAiProvidersService()
    if (result.code === 0 && result.data && result.data.providers) {
      providers.value = result.data.providers
      
      // 构建模型选项列表
      const options = []
      for (const [providerKey, providerInfo] of Object.entries(result.data.providers)) {
        options.push({
          label: `${providerInfo.name} - ${providerInfo.defaultModel}`,
          value: `${providerKey}:${providerInfo.defaultModel}`,
          provider: providerKey,
          model: providerInfo.defaultModel,
          description: providerInfo.description
        })
      }
      modelOptions.value = options
      
      // 默认选择第一个模型
      if (options.length > 0) {
        selectedModel.value = options[0].value
      }
    }
  } catch (error) {
    console.error('加载AI服务商失败:', error)
  }
}

// 组件挂载时加载服务商列表
onMounted(() => {
  loadProviders()
})

const toggleChat = () => {
  isOpen.value = !isOpen.value
}

const formatTime = () => {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userMessage = inputMessage.value.trim()
  
  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: userMessage,
    time: formatTime()
  })

  inputMessage.value = ''
  scrollToBottom()

  // 添加AI消息占位符
  const aiMessageIndex = messages.value.length
  messages.value.push({
    role: 'assistant',
    content: '',
    time: formatTime()
  })

  // 调用流式AI接口（完整版）
  isLoading.value = true
  try {
    // 构建消息历史（保留最近10条对话）
    const recentMessages = messages.value
      .slice(Math.max(0, messages.value.length - 21), -1) // 排除刚添加的AI占位符
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }))

    // 解析选中的模型（格式：provider:model）
    const [provider, model] = selectedModel.value.split(':')

    // 构建请求体
    const requestBody = {
      messages: [
        {
          role: 'system',
          content: '你是助农商城的智能客服助手，请友好、专业地回答用户的问题。'
        },
        ...recentMessages
      ],
      temperature: temperature.value,
      maxTokens: maxTokens.value,
      provider: provider,
      model: model
    }

    // 构建请求头
    const headers = {
      'Content-Type': 'application/json'
    }
    
    // 如果有token，添加到请求头
    if (tokenStore.token) {
      headers['Authorization'] = tokenStore.token
    }

    const response = await fetch('/api/ai/chat/stream', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        ElMessage.error('请先登录')
        throw new Error('未授权')
      }
      throw new Error('网络请求失败')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      // 解码数据块
      buffer += decoder.decode(value, { stream: true })
      
      // 按行分割
      const lines = buffer.split('\n')
      // 保留最后一个不完整的行
      buffer = lines.pop() || ''
      
      // 处理每一行
      for (const line of lines) {
        const trimmedLine = line.trim()
        // 解析 SSE 格式: data:内容
        if (trimmedLine.startsWith('data:')) {
          const content = trimmedLine.substring(5).trim()
          if (content) {
            // 逐字追加到AI消息
            messages.value[aiMessageIndex].content += content
            scrollToBottom()
          }
        }
      }
    }
    
    // 处理剩余的buffer
    if (buffer.trim().startsWith('data:')) {
      const content = buffer.trim().substring(5).trim()
      if (content) {
        messages.value[aiMessageIndex].content += content
        scrollToBottom()
      }
    }
    
  } catch (error) {
    ElMessage.error('AI助手暂时无法回复，请稍后再试')
    console.error('AI chat error:', error)
    // 移除失败的AI消息
    messages.value.splice(aiMessageIndex, 1)
  } finally {
    isLoading.value = false
  }
}

const clearMessages = () => {
  messages.value = []
  ElMessage.success('对话已清空')
}
</script>

<style scoped>
.ai-chat-container {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 9999;
}

/* 触发按钮 */
.chat-trigger-btn {
  width: 60px;
  height: 60px;
  font-size: 28px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s;
}

.chat-trigger-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
}

/* 聊天窗口 */
.chat-window {
  width: 380px;
  height: 550px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 头部 */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-icon {
  font-size: 24px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 5px;
}

.header-actions .el-button {
  color: white;
}

.header-actions .el-button:hover {
  background: rgba(255, 255, 255, 0.2);
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

.provider-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.provider-desc {
  font-size: 12px;
  color: #909399;
}

.model-hint,
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
  0%, 60%, 100% {
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

.chat-input :deep(.el-input-group__append) {
  background: #667eea;
  border-color: #667eea;
  padding: 0 15px;
}

.chat-input :deep(.el-input-group__append .el-button) {
  color: white;
}

/* 过渡动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

/* 响应式 */
@media (max-width: 768px) {
  .ai-chat-container {
    bottom: 20px;
    right: 20px;
  }

  .chat-trigger-btn {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }

  .chat-window {
    width: calc(100vw - 40px);
    height: calc(100vh - 100px);
    max-width: 380px;
  }
}
</style>
