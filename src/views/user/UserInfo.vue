<template>
    <div class="user-profile-container">
        <el-card class="profile-card">
            <!-- 页面标题 -->
            <template #header>
                <div class="card-header">
                    <span class="title">信息修改</span>
                </div>
            </template>

            <!-- 个人信息表单 -->
            <el-form ref="profileFormRef" :model="formData" :rules="formRules" label-width="100px" class="profile-form">
                <!-- 头像上传区域 -->
                <el-form-item label="头像">
                    <div class="avatar-uploader">
                        <div class="avatar-preview">
                            <el-avatar :size="100" :src="formData.userPic || avatar" fit="cover"
                                class="current-avatar" />

                            <div class="avatar-actions">
                                <el-upload 
                                    :auto-upload="false"
                                    :on-change="handleAvatarUpload"
                                    :show-file-list="false"
                                    :before-upload="beforeAvatarUpload" 
                                    accept="image/*" 
                                    class="avatar-upload"
                                >
                                    <el-button type="primary" size="small" :loading="avatarUploading">
                                        <el-icon v-if="!avatarUploading">
                                            <Upload />
                                        </el-icon>
                                        {{ avatarUploading ? '上传中...' : '点击替换' }}
                                    </el-button>
                                </el-upload>
                                <p class="avatar-tip">支持 jpg、png 格式，大小不超过 2MB</p>
                            </div>
                        </div>
                    </div>
                </el-form-item>

                <!-- 用户名（不可修改） -->
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="formData.username" placeholder="请输入用户名" disabled />
                </el-form-item>

                <!-- 昵称 -->
                <el-form-item label="昵称" prop="nickname">
                    <el-input v-model="formData.nickname" placeholder="请输入昵称" maxlength="20" show-word-limit />
                </el-form-item>

                <!-- 邮箱 -->
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="formData.email" placeholder="请输入邮箱地址" type="email" />
                </el-form-item>

                <!-- 电话 -->
                <el-form-item label="电话" prop="phone">
                    <el-input v-model="formData.phone" placeholder="请输入手机号码" type="tel" />
                </el-form-item>

                <!-- 操作按钮 -->
                <el-form-item class="form-actions">
                    <el-button type="primary" @click="handleSubmit" :loading="loading">
                        保存修改
                    </el-button>
                    <el-button @click="handleReset">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import useUserInfoStore from '@/stores/userInfo'
import { userUpdateInfoService } from '@/api/user'
import { uploadImageService } from '@/api/upload'
import avatar from '@/assets/default.png'

// 用户状态管理
const userInfoStore = useUserInfoStore()
const loading = ref(false)
const avatarUploading = ref(false)
const profileFormRef = ref()

// 表单数据 - 使用 reactive 而不是 ref
const formData = reactive({
    id: '',
    userPic: '',
    username: '',
    nickname: '',
    email: '',
    phone: ''
})

// 表单验证规则
const formRules = reactive({
    nickname: [
        { message: '请输入昵称', trigger: 'blur' },
        { min: 0, max: 20, message: '昵称长度在 0 到 20 个字符', trigger: 'blur' }
    ],
    email: [
        { message: '请输入邮箱地址', trigger: 'blur' },
        {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change']
        }
    ],
    phone: [
        { required: true, message: '请输入手机号码', trigger: 'blur' },
        {
            pattern: /^\d{11}$/,
            message: '请输入正确的手机号码',
            trigger: ['blur', 'change']
        }
    ]
})

// 初始化表单数据
const initFormData = () => {
    const userInfo = userInfoStore.info

    // 确保所有字段都有默认值
    Object.assign(formData, {
        id: userInfo?.id,
        userPic: userInfo?.userPic || null,
        username: userInfo?.username || '',
        nickname: userInfo?.nickname || '',
        email: userInfo?.email || '',
        phone: userInfo?.phone || ''
    })
}

// 头像上传前的验证
const beforeAvatarUpload = (file) => {
    const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png'
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

// 处理头像上传
const handleAvatarUpload = async (uploadFile) => {
    if (!beforeAvatarUpload(uploadFile.raw)) {
        return
    }
    
    avatarUploading.value = true
    try {
        const res = await uploadImageService(uploadFile.raw)
        if (res.code === 0) {
            formData.userPic = res.data
            ElMessage.success('头像上传成功')
        } else {
            ElMessage.error('头像上传失败')
        }
    } catch (error) {
        console.error('头像上传失败:', error)
        ElMessage.error('头像上传失败')
    } finally {
        avatarUploading.value = false
    }
}

// 提交表单
const handleSubmit = async () => {
    if (!profileFormRef.value) return

    try {
        // 正确的表单验证调用方式
        const valid = await profileFormRef.value.validate()
        if (!valid) {
            ElMessage.error('请检查表单填写是否正确')
            return
        }

        loading.value = true

        // API 调用 - 确保传递正确的数据
        let result = await userUpdateInfoService({
            id: formData.id,
            userPic: formData.userPic,
            username: formData.username,
            nickname: formData.nickname,
            email: formData.email,
            phone: formData.phone
        })

        ElMessage.success(result.msg ? result.msg : '个人信息更新成功')

        // 修改 pinia 中的个人信息   合并两个对象属性
        userInfoStore.setInfo({ ...userInfoStore.info, ...formData })

    } catch (error) {
        console.error('表单验证失败:', error)
        // 显示更详细的错误信息
        if (error && error.fields) {
            ElMessage.error('请检查表单填写是否正确')
        } else {
            ElMessage.error('提交失败，请重试')
        }
    } finally {
        loading.value = false
    }
}

// 重置表单
const handleReset = () => {
    ElMessageBox.confirm(
        '确定要重置所有修改吗？',
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        initFormData()
        // 重置表单验证状态
        if (profileFormRef.value) {
            profileFormRef.value.clearValidate()
        }
        ElMessage.success('重置成功')
    }).catch(() => {
        // 用户取消操作
    })
}

// 组件挂载时初始化数据
onMounted(() => {
    initFormData()
})
</script>

<style scoped>
.user-profile-container {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
}

.profile-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
}

.profile-form {
    padding: 20px 10px 0;
}

.avatar-uploader {
    display: flex;
    align-items: flex-start;
}

.avatar-preview {
    display: flex;
    flex-direction: column;
}

.current-avatar {
    border: 1px solid #e6e6e6;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.avatar-actions {
    display: flex;
    flex-direction: column;
}

.avatar-tip {
    margin: 0;
    font-size: 12px;
    color: #909399;
    margin: 10px，0;
}

.form-actions {
    margin-top: 30px;
}
</style>