<template>
  <div class="homepage">
    <!-- 导航栏 -->
    <nav class="navbar" :class="{ scrolled: isScrolled }">
      <div class="nav-container">
        <div class="logo">
          <span class="logo-icon">🛍️</span>
          <span>惠农商城</span>
        </div>
        <button class="menu-toggle" @click="toggleMenu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div class="nav-links" :class="{ active: menuOpen }">
          <a href="#about" @click="handleNavClick('about')">项目介绍</a>
          <a href="#features" @click="handleNavClick('features')">核心功能</a>
          <a href="#tech" @click="handleNavClick('tech')">技术栈</a>
          <a href="#highlights" @click="handleNavClick('highlights')">项目亮点</a>
          <a href="#contact" @click="handleNavClick('contact')">联系方式</a>
          <button class="btn-primary" @click="goToMall">进入商城</button>
          <button class="btn-ai" @click="goToAI">AI 对话</button>
        </div>
      </div>
    </nav>

    <!-- 英雄区域 -->
    <section class="hero">
      <div class="hero-background">
        <div class="hero-shape shape-1"></div>
        <div class="hero-shape shape-2"></div>
        <div class="hero-shape shape-3"></div>
      </div>
      <div class="hero-content">
        <div class="hero-badge">🚀 现代化电商解决方案</div>
        <h1>智能电商商城系统</h1>
        <p class="subtitle">基于 Vue 3 + Spring Boot 3 + AI 的全栈电商平台</p>
        <p class="description">集成 AI 智能对话 · 多角色权限管理 · 完整业务流程</p>
        <div class="hero-actions">
          <button class="btn-primary btn-large" @click="goToMall">
            <span>立即体验</span>
            <span class="arrow">→</span>
          </button>
          <button class="btn-secondary btn-large" @click="goToAI">
            <span>🤖 AI 对话</span>
          </button>
        </div>
        <div class="hero-stats">
          <div class="stat-badge">
            <span class="stat-icon">👥</span>
            <span>多角色管理</span>
          </div>
          <div class="stat-badge">
            <span class="stat-icon">🤖</span>
            <span>AI 智能对话</span>
          </div>
          <div class="stat-badge">
            <span class="stat-icon">⚡</span>
            <span>高性能架构</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 项目介绍 -->
    <section id="about" class="section">
      <div class="container">
        <h2 class="section-title">项目介绍</h2>
        <p class="intro-text">
          这是一个功能完整的现代化电商商城系统，采用前后端分离架构开发。项目集成了 AI 智能客服功能，支持多 AI 服务商动态切换，为用户提供智能化的购物体验。系统支持用户购物、商家管理、平台管理三种角色，实现了完整的电商业务流程。
        </p>
        <div class="stats">
          <div class="stat-item">
            <div class="stat-icon">👥</div>
            <div class="stat-number">3</div>
            <div class="stat-label">用户角色</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">📦</div>
            <div class="stat-number">15+</div>
            <div class="stat-label">功能模块</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">🔧</div>
            <div class="stat-number">20+</div>
            <div class="stat-label">技术栈</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">🤖</div>
            <div class="stat-number">AI</div>
            <div class="stat-label">智能对话</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 核心功能 -->
    <section id="features" class="section section-alt">
      <div class="container">
        <h2 class="section-title">核心功能模块</h2>
        <div class="features-grid">
          <div v-for="feature in features" :key="feature.id" class="feature-card">
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
            <ul class="feature-list">
              <li v-for="item in feature.items" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- 技术栈 -->
    <section id="tech" class="section">
      <div class="container">
        <h2 class="section-title">技术栈</h2>
        <div class="tech-categories">
          <div v-for="category in techStack" :key="category.name" class="tech-category">
            <h3 class="tech-category-title">{{ category.name }}</h3>
            <div class="tech-items">
              <div v-for="tech in category.items" :key="tech.name" class="tech-item">
                <div class="tech-name">{{ tech.name }}</div>
                <div class="tech-version">{{ tech.version }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 项目亮点 -->
    <section id="highlights" class="section section-alt">
      <div class="container">
        <h2 class="section-title">项目亮点</h2>
        <div class="highlights-grid">
          <div v-for="highlight in highlights" :key="highlight.id" class="highlight-card">
            <div class="highlight-number">{{ highlight.id }}</div>
            <h3>{{ highlight.title }}</h3>
            <p>{{ highlight.description }}</p>
            <div class="highlight-tags">
              <span v-for="tag in highlight.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 联系方式 -->
    <section id="contact" class="section">
      <div class="container">
        <h2 class="section-title">联系方式</h2>
        <div class="contact-content">
          <div class="contact-info">
            <div class="contact-item">
              <div class="contact-icon">📧</div>
              <div>
                <div class="contact-label">邮箱</div>
                <div class="contact-value">1296690048@qq.com</div>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-icon">💻</div>
              <div>
                <div class="contact-label">GitHub</div>
                <a href="https://github.com/VitixPavix" target="_blank" class="contact-link">
                  github.com/VitixPavix
                </a>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-icon">🌐</div>
              <div>
                <div class="contact-label">项目类型</div>
                <div class="contact-value">毕业设计 / 个人项目</div>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-icon">📱</div>
              <div>
                <div class="contact-label">联系电话</div>
                <div class="contact-value">+86 183 7969 1085</div>
              </div>
            </div>
          </div>
          <div class="contact-cta">
            <h3>开始体验</h3>
            <p>立即进入商城系统，体验完整的电商功能和 AI 智能对话</p>
            <div class="cta-buttons">
              <button class="btn-primary btn-large" @click="goToMall">
                <span>进入商城</span>
                <span class="arrow">→</span>
              </button>
              <button class="btn-secondary btn-large" @click="goToAI">
                <span>🤖 体验 AI 对话</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h4>惠农商城系统</h4>
          <p>基于 Vue 3 + Spring Boot 3 的现代化电商平台</p>
        </div>
        <div class="footer-section">
          <h4>技术栈</h4>
          <p>Vue 3 · Spring Boot 3 · MySQL · Redis · AI</p>
        </div>
        <div class="footer-section">
          <h4>快速链接</h4>
          <div class="footer-links">
            <a @click="goToMall">商城首页</a>
            <a @click="goToAI">AI 对话</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025-2026 惠农商城系统. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isScrolled = ref(false)
const menuOpen = ref(false)

// 核心功能数据
const features = ref([
  {
    id: 1,
    icon: '🛒',
    title: '用户端功能',
    description: '完整的购物体验，从浏览到支付一站式服务',
    items: ['商品浏览与搜索', '购物车管理', '订单管理与评价', '收货地址管理', '商品/店铺收藏', 'AI 智能对话']
  },
  {
    id: 2,
    icon: '🏪',
    title: '商家端功能',
    description: '强大的店铺管理工具，助力商家高效运营',
    items: ['商品发布与管理', '订单处理与发货', '店铺数据统计', '销售分析报表']
  },
  {
    id: 3,
    icon: '⚙️',
    title: '管理员功能',
    description: '全面的平台管理能力，保障系统稳定运行',
    items: ['用户/商家管理', '商品审核管理', '轮播图/广告管理', '平台数据统计', '权限管理']
  }
])

// 技术栈数据
const techStack = ref([
  {
    name: '前端技术',
    items: [
      { name: 'Vue 3', version: '3.5.22' },
      { name: 'Vite', version: '7.1.11' },
      { name: 'Element Plus', version: '2.11.8' },
      { name: 'Pinia', version: '3.0.4' },
      { name: 'Vue Router', version: '4.6.3' },
      { name: 'Axios', version: '1.13.2' },
      { name: 'ECharts', version: '6.0.0' },
      { name: 'Tiptap', version: '3.13.0' }
    ]
  },
  {
    name: '后端技术',
    items: [
      { name: 'Spring Boot', version: '3.5.7' },
      { name: 'Java', version: '21' },
      { name: 'MyBatis', version: '3.0.4' },
      { name: 'Spring AI', version: '1.1.0' },
      { name: 'JWT', version: '4.4.0' },
      { name: 'PageHelper', version: '1.4.6' }
    ]
  },
  {
    name: '数据存储',
    items: [
      { name: 'MySQL', version: '8.0+' },
      { name: 'Redis', version: '6.0+' },
      { name: '阿里云 OSS', version: '3.17.4' }
    ]
  },
  {
    name: 'AI 集成',
    items: [
      { name: 'Spring AI OpenAI', version: '1.1.2' },
      { name: 'DeepSeek V3.2', version: 'Latest' },
      { name: 'Kimi K2.5', version: 'Latest' },
      { name: 'Moonshot AI', version: 'Latest' }
    ]
  }
])

// 项目亮点数据
const highlights = ref([
  {
    id: 1,
    title: 'AI 智能对话系统',
    description: '集成 Spring AI 框架，支持多个 AI 服务商动态切换，实现流式响应和上下文连续对话，提供智能化的购物咨询体验。',
    tags: ['Spring AI', '多模型支持', '流式响应', '对话历史']
  },
  {
    id: 2,
    title: '完善的权限管理',
    description: '基于 JWT 的无状态认证，支持用户、商家、管理员、超级管理员四种角色，通过自定义注解和拦截器实现细粒度权限控制。',
    tags: ['JWT 认证', '多角色', '权限拦截器', '路由守卫']
  },
  {
    id: 3,
    title: '高性能架构',
    description: 'Redis 缓存提升查询性能，阿里云 OSS 实现图片存储和 CDN 加速，MyBatis 分页插件优化大数据量查询，定时任务自动清理资源。',
    tags: ['Redis 缓存', 'OSS 存储', '分页优化', '定时任务']
  },
  {
    id: 4,
    title: '现代化前端架构',
    description: 'Vue 3 Composition API 提升代码可维护性，Pinia 状态管理实现数据持久化，Element Plus 提供统一 UI 风格，ECharts 数据可视化。',
    tags: ['Vue 3', 'Composition API', 'Pinia', 'ECharts']
  },
  {
    id: 5,
    title: '规范的代码结构',
    description: '前后端分离，RESTful API 设计，后端三层架构，统一的响应格式，全局异常处理机制，完整的 API 接口文档。',
    tags: ['RESTful API', '三层架构', '统一响应', '异常处理']
  }
])

// 滚动监听
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 切换菜单
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

// 导航点击
const handleNavClick = (id) => {
  scrollTo(id)
  menuOpen.value = false
}

// 平滑滚动
const scrollTo = (id) => {
  const element = document.getElementById(id)
  if (element) {
    const offset = 80
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
  }
}

// 进入商城 - 新标签页打开
const goToMall = () => {
  window.open('/home', '_blank')
}

// 进入 AI 对话 - 新标签页打开
const goToAI = () => {
  window.open('/ai-chat', '_blank')
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.homepage {
  min-height: 100vh;
  background: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* 导航栏 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: transparent;
  z-index: 1000;
  transition: all 0.3s ease;
}

.navbar.scrolled {
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #000;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  font-size: 1.8rem;
}

.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}

.menu-toggle span {
  width: 25px;
  height: 2px;
  background: #000;
  transition: all 0.3s;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-links a {
  color: #666;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.3s;
  font-weight: 500;
}

.nav-links a:hover {
  color: #000;
}

/* 按钮 */
.btn-primary,
.btn-secondary,
.btn-ai {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea;
  color: #fff;
}

.btn-ai {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
}

.btn-ai:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(240, 147, 251, 0.3);
}

.arrow {
  transition: transform 0.3s;
}

.btn-primary:hover .arrow {
  transform: translateX(5px);
}

/* 英雄区域 */
.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 8rem 2rem 4rem;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.hero-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  background: white;
}

.shape-1 {
  width: 500px;
  height: 500px;
  top: -200px;
  right: -100px;
  animation: float 20s infinite ease-in-out;
}

.shape-2 {
  width: 300px;
  height: 300px;
  bottom: -100px;
  left: -50px;
  animation: float 15s infinite ease-in-out reverse;
}

.shape-3 {
  width: 400px;
  height: 400px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float 25s infinite ease-in-out;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
  }
}

.hero-content {
  max-width: 900px;
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  color: #fff;
  font-size: 0.9rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.hero h1 {
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: #fff;
  letter-spacing: -2px;
  line-height: 1.1;
}

.subtitle {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 1rem;
  font-weight: 500;
}

.description {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 3rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 4rem;
}

.hero-stats {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  color: #fff;
  font-size: 0.95rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-icon {
  font-size: 1.2rem;
}

/* 通用区域 */
.section {
  padding: 6rem 2rem;
}

.section-alt {
  background: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 3rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 1rem;
  color: #000;
  letter-spacing: -1.5px;
}

.section-title::after {
  content: '';
  display: block;
  width: 80px;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 1.5rem auto 3rem;
  border-radius: 2px;
}

/* 项目介绍 */
.intro-text {
  font-size: 1.2rem;
  line-height: 1.9;
  color: #555;
  text-align: center;
  max-width: 900px;
  margin: 0 auto 4rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-top: 4rem;
}

.stat-item {
  text-align: center;
  padding: 2rem;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.stat-item .stat-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 1rem;
  font-weight: 500;
}

/* 核心功能 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.feature-card {
  padding: 2.5rem;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #000;
}

.feature-card p {
  color: #666;
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.feature-list {
  list-style: none;
  padding: 0;
}

.feature-list li {
  padding: 0.5rem 0;
  color: #555;
  font-size: 0.95rem;
  position: relative;
  padding-left: 1.5rem;
}

.feature-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
}

/* 技术栈 */
.tech-categories {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3rem;
}

.tech-category {
  background: #fff;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.tech-category-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #000;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.tech-items {
  display: grid;
  gap: 1rem;
}

.tech-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s;
}

.tech-item:hover {
  background: #667eea;
  transform: translateX(5px);
}

.tech-item:hover .tech-name,
.tech-item:hover .tech-version {
  color: #fff;
}

.tech-name {
  font-weight: 600;
  color: #000;
}

.tech-version {
  color: #999;
  font-size: 0.9rem;
}

/* 项目亮点 */
.highlights-grid {
  display: grid;
  gap: 2rem;
}

.highlight-card {
  padding: 2.5rem;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.highlight-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.highlight-card:hover {
  transform: translateX(10px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.highlight-number {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 1.5rem;
  font-weight: 800;
  border-radius: 50%;
}

.highlight-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #000;
  padding-right: 60px;
}

.highlight-card p {
  color: #666;
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.highlight-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 6px;
  font-size: 0.85rem;
  color: #667eea;
  font-weight: 500;
}

/* 联系方式 */
.contact-content {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 4rem;
  align-items: center;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.contact-item {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s;
}

.contact-item:hover {
  background: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transform: translateX(5px);
}

.contact-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  flex-shrink: 0;
}

.contact-label {
  font-size: 0.9rem;
  color: #999;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.contact-value {
  color: #000;
  font-weight: 600;
  font-size: 1.05rem;
}

.contact-link {
  color: #667eea;
  font-weight: 600;
  font-size: 1.05rem;
  text-decoration: none;
  transition: all 0.3s;
  display: inline-block;
  position: relative;
}

.contact-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.contact-link:hover {
  color: #764ba2;
  transform: translateX(3px);
}

.contact-link:hover::after {
  width: 100%;
}

.contact-cta {
  padding: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  color: #fff;
  text-align: center;
}

.contact-cta h3 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.contact-cta p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.95;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-buttons .btn-primary {
  background: #fff;
  color: #667eea;
}

.cta-buttons .btn-primary:hover {
  background: #f8f9fa;
}

.cta-buttons .btn-secondary {
  border-color: #fff;
  color: #fff;
}

.cta-buttons .btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 页脚 */
.footer {
  background: #1a1a1a;
  color: #fff;
  padding: 3rem 2rem 2rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
  margin-bottom: 2rem;
}

.footer-section h4 {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.footer-section p {
  color: #999;
  line-height: 1.7;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-links a {
  color: #999;
  text-decoration: none;
  transition: color 0.3s;
  cursor: pointer;
}

.footer-links a:hover {
  color: #fff;
}

.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 2rem;
  border-top: 1px solid #333;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

/* 响应式 */
@media (max-width: 1024px) {
  .features-grid {
    grid-template-columns: 1fr;
  }

  .tech-categories {
    grid-template-columns: 1fr;
  }

  .contact-content {
    grid-template-columns: 1fr;
  }

  .footer-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .menu-toggle {
    display: flex;
  }

  .nav-links {
    position: fixed;
    top: 0;
    right: -100%;
    width: 80%;
    height: 100vh;
    background: #fff;
    flex-direction: column;
    padding: 5rem 2rem;
    gap: 2rem;
    transition: right 0.3s;
    box-shadow: -5px 0 20px rgba(0, 0, 0, 0.1);
  }

  .nav-links.active {
    right: 0;
  }

  .nav-links a {
    font-size: 1.1rem;
  }

  .hero h1 {
    font-size: 2.5rem;
  }

  .subtitle {
    font-size: 1.2rem;
  }

  .description {
    font-size: 1rem;
  }

  .section {
    padding: 4rem 1.5rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .hero-actions {
    flex-direction: column;
    width: 100%;
  }

  .hero-actions button {
    width: 100%;
  }

  .hero-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .stat-badge {
    width: 100%;
    justify-content: center;
  }
}
</style>
