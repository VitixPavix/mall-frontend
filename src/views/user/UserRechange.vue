<template>
  <div class="recharge-container">
    <div class="recharge-wrapper">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">余额充值</h1>
        <el-button type="primary" text @click="refreshBalance">
          <el-icon><Refresh /></el-icon>
          刷新余额
        </el-button>
      </div>

      <!-- 余额概览 -->
      <el-card class="balance-card">
        <div class="balance-overview">
          <div class="balance-info">
            <div class="balance-label">当前余额</div>
            <div class="balance-amount">¥{{ formatAmount(currentBalance) }}</div>
          </div>
          <div class="balance-actions">
            <el-button type="success" plain @click="handleWithdraw">余额提现</el-button>
          </div>
        </div>
      </el-card>

      <!-- 充值区域 -->
      <el-card class="recharge-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">选择充值金额</span>
          </div>
        </template>

        <!-- 充值金额选项 -->
        <div class="amount-options">
          <div
            v-for="option in amountOptions"
            :key="option.value"
            class="amount-option"
            :class="{ active: selectedAmount === option.value }"
            @click="selectAmount(option.value)"
          >
            <div class="amount-value">¥{{ formatAmount(option.value) }}</div>
            <div v-if="option.bonus" class="amount-bonus">赠送 ¥{{ formatAmount(option.bonus) }}</div>
          </div>
        </div>

        <!-- 自定义金额 -->
        <div class="custom-amount-section">
          <div class="section-label">或输入其他金额</div>
          <el-input
            v-model="customAmount"
            placeholder="请输入充值金额"
            size="large"
            @input="handleCustomAmountInput"
          >
            <template #prepend>¥</template>
          </el-input>
        </div>

        <!-- 支付方式 -->
        <div class="payment-section">
          <div class="section-label">选择支付方式</div>
          <div class="payment-options">
            <div
              v-for="method in paymentMethods"
              :key="method.id"
              class="payment-option"
              :class="{ active: selectedPayment === method.id }"
              @click="selectPayment(method.id)"
            >
              <div class="payment-icon">
                <el-icon v-if="method.icon === 'alipay'"><CreditCard /></el-icon>
                <el-icon v-if="method.icon === 'wechat'"><ChatDotRound /></el-icon>
                <el-icon v-if="method.icon === 'bank'"><Money /></el-icon>
              </div>
              <div class="payment-name">{{ method.name }}</div>
            </div>
          </div>
        </div>

        <!-- 充值按钮 -->
        <div class="recharge-action">
          <el-button
            type="primary"
            class="recharge-btn"
            :loading="rechargeLoading"
            @click="handleRecharge"
            :disabled="!selectedAmount || !selectedPayment"
          >
            立即充值 ¥{{ formatAmount(selectedAmount) }}
          </el-button>
        </div>
      </el-card>

      <!-- 充值记录 -->
      <el-card class="records-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">充值记录</span>
          </div>
        </template>

        <div v-if="rechargeRecords.length > 0">
          <div v-for="record in rechargeRecords" :key="record.id" class="record-item">
            <div class="record-info">
              <div class="record-amount">+¥{{ formatAmount(record.amount) }}</div>
              <div class="record-date">{{ record.date }}</div>
            </div>
            <div class="record-status">
              <el-tag :type="record.status === 'success' ? 'success' : 'warning'">
                {{ record.status === 'success' ? '充值成功' : '处理中' }}
              </el-tag>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-records">
          <el-empty description="暂无充值记录" />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  CreditCard,
  ChatDotRound,
  Money,
  Refresh
} from '@element-plus/icons-vue'

// 当前余额
const currentBalance = ref()

// 充值金额选项
const amountOptions = ref([
  { value: 50, bonus: 5 },
  { value: 100, bonus: 10 },
  { value: 200, bonus: 25 },
  { value: 500, bonus: 60 },
  { value: 1000, bonus: 150 },
  { value: 2000, bonus: 300 }
])

// 选中的充值金额
const selectedAmount = ref(100)

// 自定义金额
const customAmount = ref('')

// 支付方式
const paymentMethods = ref([
  { id: 'alipay', name: '支付宝', icon: 'alipay' },
  { id: 'wechat', name: '微信支付', icon: 'wechat' },
  { id: 'bank', name: '银行卡', icon: 'bank' }
])

// 选中的支付方式
const selectedPayment = ref('alipay')

// 充值记录
const rechargeRecords = ref([])

// 充值加载状态
const rechargeLoading = ref(false)

// 选择充值金额
const selectAmount = (amount) => {
  selectedAmount.value = amount
  customAmount.value = ''
}

// 处理自定义金额输入
const handleCustomAmountInput = () => {
  if (customAmount.value) {
    selectedAmount.value = parseFloat(customAmount.value) || 0
  }
}

// 选择支付方式
const selectPayment = (paymentId) => {
  selectedPayment.value = paymentId
}

import { userRechargeService } from '@/api/user'
// 处理充值
const handleRecharge = async () => {
  if (!selectedAmount.value || selectedAmount.value <= 0) {
    ElMessage.error('请选择充值金额')
    return
  }

  if (!selectedPayment.value) {
    ElMessage.error('请选择支付方式')
    return
  }

  rechargeLoading.value = true

  try {
    
    let result = await userRechargeService(selectedAmount.value)
    currentBalance.value = result.data
    console.log(result.data)
    // 添加充值记录
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    rechargeRecords.value.unshift({
      id: rechargeRecords.value.length + 1,
      amount: selectedAmount.value,
      date: dateStr,
      status: 'success'
    })
    
    
    
    ElMessage.success(`充值成功！已充值 ¥${formatAmount(selectedAmount.value)}`)
  } catch (error) {
    ElMessage.error('充值失败，请重试')
  } finally {
    rechargeLoading.value = false
  }
}

// 刷新余额
const refreshBalance = () => {
  // 模拟刷新余额
  ElMessage.success('余额已刷新')
}

// 余额提现
const handleWithdraw = () => {
  ElMessage.info('跳转到提现页面')
  // 实际项目中这里应该跳转到提现页面
}

// 格式化金额显示
const formatAmount = (amount) => {
  return parseFloat(amount).toFixed(2)
}

import useUserInfoStore from '@/stores/userInfo'
const userInfoStore = useUserInfoStore()
onMounted(() => {
  // 组件挂载后可执行的初始化操作
  currentBalance.value = userInfoStore.info.balance
})
</script>

<style scoped>
.recharge-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.recharge-wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.balance-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.balance-overview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #409EFF 0%, #337ecc 100%);
  color: white;
  border-radius: 6px;
}

.balance-info {
  display: flex;
  flex-direction: column;
}

.balance-label {
  font-size: 16px;
  margin-bottom: 8px;
  opacity: 0.9;
}

.balance-amount {
  font-size: 36px;
  font-weight: 700;
}

.recharge-card,
.records-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.amount-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.amount-option {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fff;
}

.amount-option:hover {
  border-color: #409EFF;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.amount-option.active {
  border-color: #409EFF;
  background-color: #ecf5ff;
  position: relative;
}

.amount-option.active::after {
  content: "✓";
  position: absolute;
  top: 5px;
  right: 5px;
  color: #409EFF;
  font-weight: bold;
}

.amount-value {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
}

.amount-bonus {
  font-size: 12px;
  color: #67C23A;
}

.custom-amount-section,
.payment-section {
  margin-bottom: 25px;
}

.section-label {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #606266;
}

.payment-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.payment-option {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fff;
}

.payment-option:hover {
  border-color: #409EFF;
}

.payment-option.active {
  border-color: #409EFF;
  background-color: #ecf5ff;
}

.payment-icon {
  font-size: 24px;
  margin-bottom: 10px;
  color: #409EFF;
}

.payment-name {
  font-size: 14px;
  font-weight: 500;
}

.recharge-action {
  margin-top: 20px;
}

.recharge-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.record-item:last-child {
  border-bottom: none;
}

.record-amount {
  font-weight: 600;
  color: #409EFF;
  font-size: 16px;
}

.record-date {
  color: #909399;
  font-size: 14px;
  margin-top: 5px;
}

.empty-records {
  padding: 40px 0;
}

@media (max-width: 768px) {
  .recharge-container {
    padding: 15px;
  }
  
  .amount-options,
  .payment-options {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .balance-overview {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>