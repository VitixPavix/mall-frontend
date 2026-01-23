<template>
    <div class="login-container" :key="route.params.type || 'login'">
        <div class="login-card">
            <div class="login-header">
                <h1>{{ isRegister ? '注册账号' : '欢迎登录' }}</h1>
                <h2>{{ isRegister ? '' : '助农电商平台' }}</h2>
                <p>{{ isRegister ? '创建您的账号' : '请选择您的身份并登录系统' }}</p>
            </div>

            <div class="login-body">
                <el-form :model="form" :rules="rules" ref="loginForm" label-width="0" @submit.prevent="handleSubmit">
                    <!-- 身份选择 -->
                    <el-form-item prop="role">
                        <el-select v-model="form.role" placeholder="请选择登录身份" style="width: 100%"
                            @change="handleRoleChange" size="large">
                            <el-option label="普通用户" value="user">
                                <span>普通用户</span>
                                <span class="role-tag role-user">个人账户</span>
                            </el-option>
                            <el-option label="店铺" value="shop">
                                <span>店铺</span>
                                <span class="role-tag role-shop">商家账户</span>
                            </el-option>
                            <el-option v-if="!isRegister" label="管理员" value="admin">
                                <span>管理员</span>
                                <span class="role-tag role-admin">系统管理</span>
                            </el-option>
                        </el-select>
                    </el-form-item>

                    <!-- 用户名/账号 -->
                    <el-form-item prop="username">
                        <el-input v-model="form.username" :placeholder="form.role === 'admin' ? '请输入管理员账号' : '请输入用户名'"
                            :prefix-icon="User" size="large" />
                    </el-form-item>

                    <!-- 密码 -->
                    <el-form-item prop="password">
                        <el-input v-model="form.password" type="password" placeholder="请输入密码" :prefix-icon="Lock"
                            size="large" show-password />
                    </el-form-item>

                    <!-- 注册时显示的额外字段 -->
                    <template v-if="isRegister">
                        <!-- 手机号 -->
                        <el-form-item prop="phone" v-if="form.role !== 'admin'">
                            <el-input v-model="form.phone" placeholder="请输入手机号" :prefix-icon="Iphone" size="large" />
                        </el-form-item>

                        <!-- 店铺名称 -->
                        <el-form-item prop="shopname" v-if="form.role === 'shop'">
                            <el-input v-model="form.shopname" placeholder="请输入店铺名称" :prefix-icon="Shop" size="large" />
                        </el-form-item>

                        <!-- 店铺资质图片 -->
                        <el-form-item prop="qualification" v-if="form.role === 'shop'">
                            <div class="upload-container">
                                <!-- 左侧文字提示区域 -->
                                <div class="upload-tip-left">
                                    <div class="tip-title">店铺资质上传</div>
                                    <div class="tip-content">
                                        <p>• 请上传有效的店铺资质证明</p>
                                        <p>• 支持 JPG、PNG 格式图片</p>
                                        <p>• 文件大小不超过 2MB</p>
                                    </div>
                                </div>

                                <!-- 右侧上传区域 -->
                                <div class="upload-area">
                                    <el-upload 
                                        class="avatar-uploader" 
                                        :auto-upload="false"
                                        :show-file-list="false" 
                                        :on-change="handleQualificationUpload"
                                        :before-upload="beforeAvatarUpload"
                                    >
                                        <!-- 未上传时的状态 -->
                                        <div class="upload-placeholder" v-if="!form.qualificationPic">
                                            <el-icon class="upload-icon" v-if="!qualificationUploading">
                                                <Plus />
                                            </el-icon>
                                            <div class="upload-text">
                                                {{ qualificationUploading ? '上传中...' : '点击上传资质文件' }}
                                            </div>
                                        </div>

                                        <!-- 已上传图片的预览 -->
                                        <div class="upload-preview" v-else>
                                            <img :src="form.qualificationPic" class="avatar" alt="店铺资质图片">
                                            <div class="preview-overlay">
                                                <el-icon class="preview-icon">
                                                    <View />
                                                </el-icon>
                                                <span>预览</span>
                                            </div>
                                        </div>
                                    </el-upload>
                                </div>
                            </div>
                        </el-form-item>
                    </template>

                    <!-- 提交按钮 -->
                    <el-form-item>
                        <el-button type="primary" :loading="loading" @click="handleSubmit" size="large"
                            native-type="submit">
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
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Lock, Iphone, Shop, Plus, View } from '@element-plus/icons-vue'
import { uploadImageService } from '@/api/upload'

// 响应式数据
//const isRegister = ref(false)
const loading = ref(false)
const qualificationUploading = ref(false)
const loginForm = ref(null)

// 表单数据
const form = reactive({
    role: 'user',
    username: '',
    password: '',
    phone: '',
    shopname: '',
    qualificationPic: ''
})

// 表单验证规则
const rules = reactive({
    role: [
        { required: true, message: '请选择登录身份', trigger: 'change' }
    ],
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 16, message: '用户名长度在 3 到 16 个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 5, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
    ],
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^\d{11}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
        //{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ],
    shopname: [
        { required: true, message: '请输入店铺名称', trigger: 'blur' },
        { min: 3, max: 16, message: '店铺名称长度在 3 到 30 个字符', trigger: 'blur' }
    ]
})




// 导入状态管理和API服务
import { useTokenStore } from '@/stores/token'
import useUserInfoStore from '@/stores/userInfo'
import { userRegisterService, userLoginService, userInfoService } from '@/api/user'
import { shopRegisterService, shopLoginService, shopInfoService } from '@/api/shop'
import { adminLoginService, adminInfoService } from '@/api/admin'
import { useRouter, useRoute } from 'vue-router'

const tokenStore = useTokenStore()
const userInfoStore = useUserInfoStore()
const router = useRouter()
const route = useRoute()

// 角色配置映射 - 统一管理不同角色的服务和路由
const roleConfig = {
    user: {
        loginService: userLoginService,
        registerService: userRegisterService,
        infoService: userInfoService,
        homePath: '/home'
    },
    shop: {
        loginService: shopLoginService,
        registerService: shopRegisterService,
        infoService: shopInfoService,
        homePath: '/shop-manage'
    },
    admin: {
        loginService: adminLoginService,
        infoService: adminInfoService,
        homePath: '/admin'
    }
}

// 接收参数并判断当前模式（登录/注册）
const isRegister = computed(() => route.params.type === 'register')

// 处理角色变化 - 清除验证错误和表单数据
const handleRoleChange = () => {
    // 清除表单验证错误
    if (loginForm.value) {
        loginForm.value.clearValidate()
    }
    // 清空输入字段（保留role）
    resetForm()
}

// 处理登录逻辑
const handleLogin = async () => {
    loading.value = true
    try {
        console.log('当前登录角色:', form.role)
        const config = roleConfig[form.role]
        if (!config) {
            throw new Error(`未找到角色配置: ${form.role}`)
        }
        
        // 1. 准备登录数据（只包含 username 和 password，不包含 role）
        const loginData = { username: form.username, password: form.password }
        
        // 2. 根据身份调用对应登录接口
        const result = await config.loginService(loginData)
        
        // 3. 登录成功后，先保存 token
        tokenStore.setToken(result.data)
        
        // 4. 再根据身份获取用户详细信息并存入 Pinia
        const infoRes = await config.infoService()
        console.log('后端返回的用户信息:', infoRes.data)
        
        // 5. 检查用户状态（超级管理员 id=1 除外）
        const isSuperAdmin = form.role === 'admin' && infoRes.data.id === 1
        if (!isSuperAdmin && infoRes.data.state === '禁用') {
            // 清除已保存的 token 和用户信息
            tokenStore.removeToken()
            ElMessage.error('您的账号已被禁用，无法登录')
            return
        }
        
        userInfoStore.setInfo(infoRes.data)
        
        // 6. 提示并按身份跳转对应主页
        ElMessage.success(result.msg || '登录成功')
        console.log('跳转到:', config.homePath)
        router.push(config.homePath)
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
        const config = roleConfig[form.role]
        
        // 准备提交数据，排除 role 字段（后端会自动设置）
        const registerData = {
            username: form.username,
            password: form.password,
            phone: form.phone,
            // 如果是店铺注册，添加额外字段
            ...(form.role === 'shop' && {
                shopname: form.shopname,
                qualificationPic: form.qualificationPic
            })
        }
        
        const result = await config.registerService(registerData)
        ElMessage.success(result.msg || '注册成功')
        // 注册成功后跳转到登录页
        router.push('/login')
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
        // 根据当前模式调用对应的处理函数
        isRegister.value ? await handleRegister() : await handleLogin()
    } catch (error) {
        console.log('表单验证失败:', error)
    }
}

// 切换登录/注册模式
const toggleMode = () => {
    const newMode = isRegister.value ? 'login' : 'register'
    router.push(`/login/${newMode}`)
    // 重置表单验证
    if (loginForm.value) {
        loginForm.value.clearValidate()
    }
}

// 处理店铺资质上传
const handleQualificationUpload = async (uploadFile) => {
    if (!beforeAvatarUpload(uploadFile.raw)) {
        return
    }
    
    qualificationUploading.value = true
    try {
        const res = await uploadImageService(uploadFile.raw)
        if (res.code === 0) {
            form.qualificationPic = res.data
            ElMessage.success('店铺资质上传成功')
        } else {
            ElMessage.error('店铺资质上传失败')
        }
    } catch (error) {
        console.error('店铺资质上传失败:', error)
        ElMessage.error('店铺资质上传失败')
    } finally {
        qualificationUploading.value = false
    }
}

// 重置表单字段（保留 role）
const resetForm = () => {
    form.username = ''
    form.password = ''
    form.phone = ''
    form.shopname = ''
    form.qualificationPic = ''
}

// 上传前的文件验证
const beforeAvatarUpload = (file) => {
    // 验证文件类型
    const isJPGOrPNG = ['image/jpeg', 'image/png'].includes(file.type)
    // 验证文件大小（2MB以内）
    const isLt2M = file.size / 1024 / 1024 < 2

    if (!isJPGOrPNG) {
        ElMessage.error('上传图片只能是 JPG/PNG 格式!')
        return false  // 阻止上传
    }
    if (!isLt2M) {
        ElMessage.error('上传图片大小不能超过 2MB!')
        return false  // 阻止上传
    }
    return true  // 允许上传
}

// 监听注册模式变化 - 管理员不允许注册
watch(isRegister, (newVal) => {
    if (newVal && form.role === 'admin') {
        form.role = 'user'
        ElMessage.info('注册模式下已自动切换为普通用户')
    }
})

</script>

<style scoped>
/* 登录容器 - 外层包装 */
.login-container {
    /* 使用 Flex 布局实现垂直水平居中 */
    display: flex;
    justify-content: center;
    /* 水平居中 */
    align-items: center;
    /* 垂直居中 */

    /* 容器至少占满整个视口高度 */
    min-height: 100vh;

    /* 背景：135度角渐变，从蓝色到紫色 */
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    /* 内边距，确保在小屏幕上也有呼吸空间 */
    padding: 20px;
}

/* 登录卡片 - 主要内容区域 */
.login-card {
    width: 100%;
    /* 自适应宽度 */
    max-width: 500px;
    /* 最大宽度限制，避免在大屏幕上过宽 */
    background: white;
    /* 白色背景，与渐变背景形成对比 */
    border-radius: 12px;
    /* 圆角边框，现代感设计 */

    /* 阴影效果：X偏移0，Y偏移10px，模糊30px，半透明黑色 */
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

    /* 隐藏溢出内容，确保圆角效果正常显示 */
    overflow: hidden;
}

/* 登录头部区域 */
.login-header {
    /* 头部背景渐变：从左到右，从Element Plus主蓝色到成功绿色 */
    background: linear-gradient(to right, #409EFF, #67C23A);
    color: white;
    /* 白色文字，确保在渐变背景上可读 */
    padding: 10px 30px;
    /* 内边距：上下25px，左右30px */
    text-align: center;
    /* 文字居中对齐 */
}

/* 登录标题 */
.login-header h1 {
    font-size: 40px;
    /* 字体大小 */
    font-weight: 600;
    /* 中等字重，比正常稍粗 */
    margin: 20px 40px 0px;
    /* 内边距：上下，左右 */
    text-align-last: justify;

}

.login-header h2 {
    font-size: 20px;
    font-weight: 400;
    /* 中等字重，比正常稍粗 */
    margin-top: 0px;
}

/* 登录副标题/描述 */
.login-header p {
    font-size: 14px;
    /* 较小的字体大小 */
    opacity: 0.9;
    /* 轻微透明，作为次要信息 */
}

/* 登录主体内容区域 */
.login-body {
    padding: 30px;
    /* 内边距，给内容留出空间 */
}

/* Element Plus 表单项样式调整 */
.el-form-item {
    margin-bottom: 22px;
    /* 表单项之间的间距 */
}

/* Element Plus 按钮样式调整 */
.el-button {
    width: 100%;
    /* 按钮宽度充满容器 */
    height: 44px;
    /* 固定高度，易于点击 */
    font-size: 16px;
    /* 字体大小，清晰易读 */
    border-radius: 6px;
    /* 圆角边框 */
}

/* 切换登录/注册模式的文字区域 */
.switch-text {
    text-align: center;
    /* 文字居中 */
    margin-top: 20px;
    /* 与上方元素的间距 */
    color: #606266;
    /* 中性灰色，作为次要文字 */
    font-size: 14px;
    /* 较小的字体大小 */
}

/* 切换链接样式 */
.switch-link {
    color: #409EFF;
    /* Element Plus 主蓝色 */
    cursor: pointer;
    /* 鼠标悬停时显示手型指针 */
    font-weight: 500;
    /* 中等字重，突出显示 */
    margin-left: 5px;
    /* 与前面文字的间距 */
}

/* 切换链接悬停效果 */
.switch-link:hover {
    text-decoration: underline;
    /* 鼠标悬停时显示下划线 */
}

/* 角色标签通用样式 */
.role-tag {
    display: inline-block;
    /* 行内块元素，可以设置宽高 */
    padding: 2px 8px;
    /* 内边距：上下2px，左右8px */
    border-radius: 4px;
    /* 小圆角 */
    font-size: 12px;
    /* 小字体，作为标签使用 */
    margin-left: 8px;
    /* 与角色名称的间距 */
}

/* 普通用户角色标签样式 */
.role-user {
    background-color: #f0f9ff;
    /* 浅蓝色背景 */
    color: #409EFF;
    /* 蓝色文字 */
}

/* 店铺角色标签样式 */
.role-shop {
    background-color: #f0fff3;
    /* 浅绿色背景 */
    color: #67C23A;
    /* 绿色文字 */
}

/* 管理员角色标签样式 */
.role-admin {
    background-color: #fef0f0;
    /* 浅红色背景 */
    color: #F56C6C;
    /* 红色文字 */
}

/* 上传容器 - 使用 Flex 布局实现左右排列 */
.upload-container {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    width: 100%;
}

/* 左侧提示区域 */
.upload-tip-left {
    flex: 1;
    min-width: 200px;
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #409EFF;
}

.tip-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
}

.tip-content {
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
}

.tip-content p {
    margin: 6px 0;
}

/* 右侧上传区域 */
.upload-area {
    flex: 1;
    min-width: 180px;
}

/* 上传组件样式 */
.avatar-uploader {
    width: 100%;
}

.avatar-uploader :deep(.el-upload) {
    border: 2px dashed #dcdfe6;
    border-radius: 8px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;
    width: 100%;
    height: 160px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fafafa;
}

.avatar-uploader :deep(.el-upload:hover) {
    border-color: #409EFF;
    background-color: #f0f7ff;
}

/* 上传占位符样式 */
.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #8c939d;
    height: 100%;
    width: 100%;
}

.upload-icon {
    font-size: 40px;
    margin-bottom: 12px;
}

.upload-text {
    font-size: 14px;
    text-align: center;
}

/* 图片预览样式 */
.upload-preview {
    position: relative;
    width: 100%;
    height: 100%;
}

.avatar {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background-color: #f5f7fa;
}

.preview-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
}

.preview-icon {
    margin-right: 6px;
    font-size: 16px;
}

/* 响应式设计 - 小屏幕时垂直排列 */
@media (max-width: 768px) {
    .upload-container {
        flex-direction: column;
    }

    .upload-tip-left,
    .upload-area {
        width: 100%;
    }
}


/* 媒体查询：小屏幕设备适配（最大宽度480px） */
@media (max-width: 480px) {

    /* 在小屏幕上，登录卡片宽度为100% */
    .login-card {
        max-width: 100%;
    }

    /* 减少内边距，为小屏幕节省空间 */
    .login-body {
        padding: 20px;
    }
}
</style>