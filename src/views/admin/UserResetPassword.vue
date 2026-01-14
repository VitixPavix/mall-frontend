<template>
  <div class="page-container">
    <el-card class="page-card">
      <template #header>
        <div class="header">
          <span class="title">重置密码（管理员）</span>
        </div>
      </template>

      <el-form
        ref="passwordFormRef"
        :model="adminPassword"
        :rules="rules"
        label-width="100px"
        class="form"
      >
        <el-form-item label="原密码" prop="old_pwd">
          <el-input v-model="adminPassword.old_pwd" type="password" show-password placeholder="请输入原密码" />
        </el-form-item>
        <el-form-item label="新密码" prop="new_pwd">
          <el-input v-model="adminPassword.new_pwd" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认新密码" prop="re_pwd">
          <el-input v-model="adminPassword.re_pwd" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="resetPassword" :loading="loading">确认修改</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useTokenStore } from '@/stores/token'
import useUserInfoStore from '@/stores/userInfo'
import { adminUpdatePasswordService } from '@/api/admin'

const router = useRouter()
const tokenStore = useTokenStore()
const userInfoStore = useUserInfoStore()
const loading = ref(false)
const passwordFormRef = ref()

// 密码表单数据
const adminPassword = reactive({
  old_pwd: '',
  new_pwd: '',
  re_pwd: '',
})

// 校验密码的函数
const checkRePassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入确认密码'))
  } else if (value !== adminPassword.new_pwd) {
    callback(new Error('请确保两次输入的密码一样'))
  } else {
    callback()
  }
}

// 表单验证规则
const rules = {
  old_pwd: [
    { required: true, message: '请输入旧密码', trigger: 'blur' },
    { min: 5, max: 16, message: '长度为5-16位非空字符', trigger: 'blur' },
  ],
  new_pwd: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 5, max: 16, message: '长度为5-16位非空字符', trigger: 'blur' },
  ],
  re_pwd: [
    { validator: checkRePassword, trigger: 'blur' }
  ],
}

// 调用管理员修改密码接口
const resetPassword = async () => {
  if (!passwordFormRef.value) return

  try {
    // 表单验证
    const valid = await passwordFormRef.value.validate()
    if (!valid) {
      return
    }

    loading.value = true

    const result = await adminUpdatePasswordService(adminPassword)
    
    // 清除 token 和用户信息
    tokenStore.removeToken()
    userInfoStore.removeInfo()
    
    ElMessage.success(result.msg ? result.msg : '修改成功，请重新登录！')
    
    // 跳转到登录页
    router.push('/login')
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error(error.response?.data?.msg || '修改密码失败，请重试')
  } finally {
    loading.value = false
  }
}

// 重置表单
const handleReset = () => {
  adminPassword.old_pwd = ''
  adminPassword.new_pwd = ''
  adminPassword.re_pwd = ''
  if (passwordFormRef.value) {
    passwordFormRef.value.clearValidate()
  }
}
</script>

<style scoped>
.page-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.form {
  padding: 20px 10px 0;
}
</style>
