<template>
    <div class="shop-profile-container">
        <el-card class="profile-card">
            <!-- 页面标题 -->
            <template #header>
                <div class="card-header">
                    <span class="title">店铺信息修改</span>
                </div>
            </template>

            <!-- 个人信息表单 -->
            <el-form ref="profileFormRef" :model="formData" :rules="formRules" label-width="120px" class="profile-form">
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

                <!-- 店铺名称 -->
                <el-form-item label="店铺名称" prop="shopname">
                    <el-input v-model="formData.shopName" placeholder="请输入店铺名称" maxlength="30" show-word-limit />
                </el-form-item>

                <!-- 邮箱 -->
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="formData.email" placeholder="请输入邮箱地址" type="email" />
                </el-form-item>

                <!-- 电话 -->
                <el-form-item label="电话" prop="phone">
                    <el-input v-model="formData.phone" placeholder="请输入手机号码" type="tel" />
                </el-form-item>

                <!-- 店铺资质图片上传区域 -->
                <el-form-item label="店铺资质" prop="qualificationPic">
                    <div class="qualification-uploader">
                        <div class="qualification-preview">
                            <el-image 
                                v-if="formData.qualificationPic" 
                                :src="formData.qualificationPic" 
                                fit="cover"
                                class="qualification-image"
                                :preview-src-list="[formData.qualificationPic]"
                                preview-teleported
                            />
                            <div v-else class="qualification-placeholder">
                                <el-icon class="placeholder-icon"><Picture /></el-icon>
                                <p class="placeholder-text">暂无资质图片</p>
                            </div>

                            <div class="qualification-actions">
                                <el-upload 
                                    :auto-upload="false"
                                    :on-change="handleQualificationUpload" 
                                    :show-file-list="false"
                                    :before-upload="beforeQualificationUpload" 
                                    accept="image/*" 
                                    class="qualification-upload"
                                >
                                    <el-button type="primary" size="small" :loading="qualificationUploading">
                                        <el-icon v-if="!qualificationUploading">
                                            <Upload />
                                        </el-icon>
                                        {{ qualificationUploading ? '上传中...' : (formData.qualificationPic ? '更换图片' : '上传资质') }}
                                    </el-button>
                                </el-upload>
                                <el-button 
                                    v-if="formData.qualificationPic" 
                                    type="danger" 
                                    size="small" 
                                    @click="removeQualification"
                                    style="margin-left: 10px;"
                                >
                                    <el-icon>
                                        <Delete />
                                    </el-icon>
                                    删除
                                </el-button>
                                <p class="qualification-tip">支持 jpg、png 格式，大小不超过 5MB</p>
                            </div>
                        </div>
                    </div>
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
import { Upload, Picture, Delete } from '@element-plus/icons-vue'
import useUserInfoStore from '@/stores/userInfo'
import { shopUpdateInfoService } from '@/api/shop'
import { uploadImageService } from '@/api/upload'
import avatar from '@/assets/default.png'

// 用户状态管理
const userInfoStore = useUserInfoStore()
const loading = ref(false)
const avatarUploading = ref(false)
const qualificationUploading = ref(false)
const profileFormRef = ref()

// 表单数据
const formData = reactive({
    id: '',
    userPic: '',
    shopName: '',
    email: '',
    phone: '',
    qualificationPic: ''
})

// 表单验证规则
const formRules = reactive({
    shopName: [
        { required: true, message: '请输入店铺名称', trigger: 'blur' },
        { min: 2, max: 30, message: '店铺名称长度在 2 到 30 个字符', trigger: 'blur' }
    ],
    email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
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
        id: userInfo?.id || '',
        userPic: userInfo?.userPic || '',
        username: userInfo?.username || '',
        shopName: userInfo?.shopName || '',
        email: userInfo?.email || '',
        phone: userInfo?.phone || '',
        qualificationPic: userInfo?.qualificationPic || ''
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

// 店铺资质图片上传前的验证
const beforeQualificationUpload = (file) => {
    const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png'
    const isLt5M = file.size / 1024 / 1024 < 5

    if (!isJPGOrPNG) {
        ElMessage.error('资质图片只能是 JPG/PNG 格式!')
        return false
    }
    if (!isLt5M) {
        ElMessage.error('资质图片大小不能超过 5MB!')
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

// 处理资质图片上传
const handleQualificationUpload = async (uploadFile) => {
    if (!beforeQualificationUpload(uploadFile.raw)) {
        return
    }
    
    qualificationUploading.value = true
    try {
        const res = await uploadImageService(uploadFile.raw)
        if (res.code === 0) {
            formData.qualificationPic = res.data
            ElMessage.success('店铺资质图片上传成功')
        } else {
            ElMessage.error('资质图片上传失败')
        }
    } catch (error) {
        console.error('资质图片上传失败:', error)
        ElMessage.error('资质图片上传失败')
    } finally {
        qualificationUploading.value = false
    }
}

// 删除资质图片
const removeQualification = () => {
    ElMessageBox.confirm(
        '确定要删除店铺资质图片吗？',
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        formData.qualificationPic = ''
        ElMessage.success('已删除资质图片')
    }).catch(() => {
        // 用户取消操作
    })
}

// 提交表单
const handleSubmit = async () => {
    if (!profileFormRef.value) return

    try {
        // 表单验证
        const valid = await profileFormRef.value.validate()
        if (!valid) {
            ElMessage.error('请检查表单填写是否正确')
            return
        }

        loading.value = true

        // API 调用
        let result = await shopUpdateInfoService({
            id: formData.id,
            userPic: formData.userPic,
            username: formData.username,
            shopname: formData.shopname,
            email: formData.email,
            phone: formData.phone,
            qualificationPic: formData.qualificationPic
        })

        ElMessage.success(result.msg ? result.msg : '店铺信息更新成功')

        // 更新 pinia 中的个人信息
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
.shop-profile-container {
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

/* 头像上传区域样式 */
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
    margin-top: 10px;
}

.avatar-tip {
    margin: 10px 0 0 0;
    font-size: 12px;
    color: #909399;
}

/* 店铺资质上传区域样式 */
.qualification-uploader {
    width: 100%;
}

.qualification-preview {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.qualification-image {
    width: 300px;
    height: 200px;
    border: 1px solid #e6e6e6;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    object-fit: cover;
    cursor: pointer;
}

.qualification-placeholder {
    width: 300px;
    height: 200px;
    border: 2px dashed #dcdfe6;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #fafafa;
}

.placeholder-icon {
    font-size: 48px;
    color: #c0c4cc;
    margin-bottom: 10px;
}

.placeholder-text {
    margin: 0;
    font-size: 14px;
    color: #909399;
}

.qualification-actions {
    display: flex;
    align-items: center;
    margin-top: 10px;
    flex-wrap: wrap;
    gap: 10px;
}

.qualification-tip {
    margin: 10px 0 0 0;
    font-size: 12px;
    color: #909399;
    width: 100%;
}

.form-actions {
    margin-top: 30px;
}
</style>
