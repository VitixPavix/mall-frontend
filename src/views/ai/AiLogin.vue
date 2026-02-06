<template>
    <div class="ai-login-container">
        <!-- 返回按钮 -->
        <el-button 
            class="back-btn" 
            type="info" 
            :icon="ArrowLeft"
            @click="goBack"
            plain
            size="default"
        >
            返回
        </el-button>

        <div class="login-card">
            <div class="login-header">
                <div class="ai-logo">
                    <el-icon class="logo-icon"><ChatDotRound /></el-icon>
                </div>
                <h1>{{ isRegister ? 'AI助手 - 注册' : 'AI助手 - 登录' }}</h1>
                <p>{{ isRegister ? '创建您的AI助手账号' : '登录开始与AI对话' }}</p>
            </div>

            <div class="login-body">
                <el-form :model="form" :rules="rules" ref="loginForm" label-width="0" @submit.prevent="handleSubmit">
                    <!-- 用户名 -->
                    <el-form-item prop="username">
                        <el-input 
                            v-model="form.username" 
                            placeholder="请输入用户名"
                            :prefix-icon="User" 
                            size="large" 
                        />
                    </el-form-item>

                    <!-- 密码 -->
                    <el-form-item prop="password">
                        <el-input 
                            v-model="form.password" 
                            type="password" 
                            placeholder="请输入密码" 
                            :prefix-icon="Lock"
                            size="large" 
                            show-password 
                        />
                    </el-form-item>

                    <!-- 注册时显示的手机号 -->
                    <el-form-item prop="phone" v-if="isRegister">
                        <el-input 
                            v-model="form.phone" 
                            placeholder="请输入手机号" 
                            :prefix-icon="Iphone" 
                            size="large" 
                        />
                    </el-form-item>

                    <!-- 提交按钮 -->
                    <el-form-item>
                        <el-button 
                            type="primary" 
                            :loading="loading" 
                            @click="handleSubmit" 
                            size="large"
                            native-type="submit"
                        >
                            {{ isRegister ? '立即注册' : '登录' }}
                        </el-button>
                    </el-form-item>
                </el-form>

                <!-- 切换登录/注册 -->
                <div class="switch-text">
                    <span v-if="isRegister">已有账号？</span>
                    <span v-else>还没有账号？</span>
                    <span class="switch-link" @click="toggleMode">
                        {{ isRegister ? '立即登录' : '立即注册' }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Lock, Iphone, ChatDotRound, ArrowLeft } from '@element-plus/icons-vue'
import { useTokenStore } from '@/stores/token'
import useUserInfoStore from '@/stores/userInfo'
import { userRegisterService, userLoginService, userInfoService } from '@/api/user'
import { useRouter, useRoute } from 'vue-router'

const tokenStore = useTokenStore()
const userInfoStore = useUserInfoStore()
const router = useRouter()
const route = useRoute()

const loading = ref(false)
const loginForm = ref(null)

// 表单数据
const form = reactive({
    username: '',
    password: '',
    phone: ''
})

// 表单验证规则
const rules = reactive({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 16, message: '用户名长度在 3 到 16 个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 5, max: 20, message: '密码长度在 5 到 20 个字符', trigger: 'blur' }
    ],
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^\d{11}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ]
})

// 判断当前模式（登录/注册）
const isRegister = computed(() => route.params.type === 'register')

// 处理登录逻辑
const handleLogin = async () => {
    loading.value = true
    try {
        const loginData = { 
            username: form.username, 
            password: form.password 
        }
        
        // 调用用户登录接口
        const result = await userLoginService(loginData)
        
        // 保存 token
        tokenStore.setToken(result.data)
        
        // 获取用户详细信息
        const infoRes = await userInfoService()
        
        // 检查用户状态
        if (infoRes.data.state === '禁用') {
            tokenStore.removeToken()
            ElMessage.error('您的账号已被禁用，无法登录')
            return
        }
        
        userInfoStore.setInfo(infoRes.data)
        
        ElMessage.success(result.msg || '登录成功')
        router.push('/ai-chat')
    } catch (error) {
        console.error('登录错误:', error)
        ElMessage.error(error.response?.data?.msg || error.message || '登录失败')
    } finally {
        loading.value = false
    }
}

// 处理注册逻辑
const handleRegister = async () => {
    loading.value = true
    try {
        const registerData = {
            username: form.username,
            password: form.password,
            phone: form.phone
        }
        
        const result = await userRegisterService(registerData)
        ElMessage.success(result.msg || '注册成功')
        // 注册成功后跳转到登录页
        router.push('/ai-login')
    } catch (error) {
        ElMessage.error(error.response?.data?.msg || '注册失败')
    } finally {
        loading.value = false
    }
}

// 处理表单提交
const handleSubmit = async () => {
    if (!loginForm.value) return
    try {
        await loginForm.value.validate()
        isRegister.value ? await handleRegister() : await handleLogin()
    } catch (error) {
        console.log('表单验证失败:', error)
    }
}

// 切换登录/注册模式
const toggleMode = () => {
    const newMode = isRegister.value ? 'login' : 'register'
    router.push(`/ai-login/${newMode}`)
    // 重置表单验证
    if (loginForm.value) {
        loginForm.value.clearValidate()
    }
}

// 返回上一页
const goBack = () => {
    router.back()
}
</script>

<style scoped>
.ai-login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
    position: relative;
}

.back-btn {
    position: absolute;
    top: 30px;
    left: 30px;
    z-index: 10;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #667eea;
    font-weight: 500;
    transition: all 0.3s;
    backdrop-filter: blur(10px);
}

.back-btn:hover {
    background: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.login-card {
    width: 100%;
    max-width: 450px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
}

.login-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 40px 30px;
    text-align: center;
}

.ai-logo {
    margin-bottom: 20px;
}

.logo-icon {
    font-size: 64px;
    color: white;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.login-header h1 {
    font-size: 28px;
    font-weight: 600;
    margin: 0 0 10px 0;
}

.login-header p {
    font-size: 14px;
    opacity: 0.9;
    margin: 0;
}

.login-body {
    padding: 40px 30px;
}

.el-form-item {
    margin-bottom: 24px;
}

.el-button {
    width: 100%;
    height: 44px;
    font-size: 16px;
    border-radius: 8px;
    font-weight: 500;
}

.switch-text {
    text-align: center;
    margin-top: 20px;
    color: #606266;
    font-size: 14px;
}

.switch-link {
    color: #667eea;
    cursor: pointer;
    font-weight: 500;
    margin-left: 5px;
    transition: all 0.3s;
}

.switch-link:hover {
    color: #764ba2;
    text-decoration: underline;
}

@media (max-width: 480px) {
    .login-card {
        max-width: 100%;
    }

    .login-body {
        padding: 30px 20px;
    }

    .back-btn {
        top: 15px;
        left: 15px;
        font-size: 14px;
        padding: 8px 15px;
    }
}
</style>
