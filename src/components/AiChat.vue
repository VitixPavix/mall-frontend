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
              <div 
                class="message-text" 
                :class="{ 'markdown-body': msg.role === 'assistant' }"
              >
                <div v-if="msg.role === 'assistant'" v-html="renderMarkdown(msg.content)"></div>
                <div v-else class="user-message-text">{{ msg.content }}</div>
              </div>
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
          <div class="input-wrapper">
            <textarea
              v-model="inputMessage"
              class="message-textarea"
              placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
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
              popper-class="ai-chat-select-popper"
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
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { ChatDotRound, Close, Delete, User, Promotion } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getAiModelsService, sendAiMessageStreamService } from '@/api/aiChat'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

const isOpen = ref(false)
const inputMessage = ref('')
const messages = ref([])
const isLoading = ref(false)
const messagesContainer = ref(null)

// 模型选择
const models = ref({})
const selectedModel = ref('')

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
  breaks: true,
  gfm: true,
})

// Markdown 渲染函数
const renderMarkdown = (content) => {
  if (!content) return ''
  try {
    const rawHtml = marked.parse(content)
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

onMounted(() => {
  loadModels()
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

const handleKeyDown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
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

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userMessage = inputMessage.value.trim()
  
  messages.value.push({
    role: 'user',
    content: userMessage,
    time: formatTime()
  })

  inputMessage.value = ''
  
  // 重置 textarea 高度
  nextTick(() => {
    const textarea = document.querySelector('.message-textarea')
    if (textarea) {
      textarea.style.height = 'auto'
    }
  })
  
  scrollToBottom()

  const aiMessageIndex = messages.value.length
  messages.value.push({
    role: 'assistant',
    content: '',
    time: formatTime()
  })

  isLoading.value = true
  try {
    const recentMessages = messages.value
      .slice(Math.max(0, messages.value.length - 21), -1)
      .map(msg => ({ role: msg.role, content: msg.content }))

    const requestData = {
      messages: [
        { role: 'system', content: '你是助农商城的智能客服助手，请友好、专业地回答用户的问题。' },
        ...recentMessages
      ],
      ...(selectedModel.value && { model: selectedModel.value })
    }

    await sendAiMessageStreamService(requestData, (chunk) => {
      messages.value[aiMessageIndex].content += chunk
      scrollToBottom()
    })
    
  } catch (error) {
    ElMessage.error('AI助手暂时无法回复，请稍后再试')
    console.error('AI chat error:', error)
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
  gap: 2px;
  padding: 4px 0;
}

.model-name {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}

.model-desc {
  font-size: 11px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  padding: 12px 16px;
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
  
  .message-textarea::placeholder {
    font-size: 12px;
  }
  
  .model-selector {
    flex-wrap: wrap;
  }
  
  .model-select-bottom {
    max-width: 100%;
  }
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
</style>

<style>
/* 全局样式：优化下拉菜单 */
.ai-chat-select-popper {
  z-index: 10001 !important;
  min-width: 280px !important;
  max-width: 320px !important;
}

.ai-chat-select-popper .el-select-dropdown__item {
  white-space: normal !important;
  height: auto !important;
  line-height: 1.3 !important;
  padding: 8px 16px !important;
}

.ai-chat-select-popper .model-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ai-chat-select-popper .model-name {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}

.ai-chat-select-popper .model-desc {
  font-size: 11px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
