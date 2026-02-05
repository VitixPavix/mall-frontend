<template>
  <div class="homepage">
    <!-- 导航栏 -->
    <nav class="navbar" :class="{ scrolled: isScrolled }">
      <div class="nav-container">
        <div class="logo">Portfolio</div>
        <button class="menu-toggle" @click="toggleMenu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div class="nav-links" :class="{ active: menuOpen }">
          <a href="#about" @click="handleNavClick('about')">关于</a>
          <a href="#skills" @click="handleNavClick('skills')">技能</a>
          <a href="#projects" @click="handleNavClick('projects')">项目</a>
          <a href="#contact" @click="handleNavClick('contact')">联系</a>
          <button class="btn-primary" @click="goToMall">进入商城</button>
        </div>
      </div>
    </nav>

    <!-- 英雄区域 -->
    <section class="hero">
      <div class="hero-content">
        <div class="avatar">
          <img src="@/assets/default.png" alt="头像" />
        </div>
        <h1>你好，我是开发者</h1>
        <p class="subtitle">全栈工程师 · 设计爱好者</p>
        <div class="hero-actions">
          <button class="btn-primary" @click="scrollTo('contact')">联系我</button>
          <button class="btn-secondary" @click="scrollTo('projects')">查看作品</button>
        </div>
      </div>
    </section>

    <!-- 关于 -->
    <section id="about" class="section">
      <div class="container">
        <h2 class="section-title">关于我</h2>
        <p class="intro-text">
          专注于构建优雅高效的 Web 应用，热爱学习新技术，追求代码质量与用户体验的完美平衡。
        </p>
        <div class="stats">
          <div class="stat-item">
            <div class="stat-number">5+</div>
            <div class="stat-label">年经验</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">50+</div>
            <div class="stat-label">项目</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">100+</div>
            <div class="stat-label">贡献</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 技能 -->
    <section id="skills" class="section section-alt">
      <div class="container">
        <h2 class="section-title">技能</h2>
        <div class="skills-list">
          <div v-for="skill in skills" :key="skill.name" class="skill-item">
            <div class="skill-header">
              <span class="skill-name">{{ skill.name }}</span>
              <span class="skill-percent">{{ skill.level }}%</span>
            </div>
            <div class="skill-bar">
              <div class="skill-progress" :style="{ width: skill.level + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 项目 -->
    <section id="projects" class="section">
      <div class="container">
        <h2 class="section-title">项目</h2>
        <div class="projects-list">
          <div v-for="project in projects" :key="project.id" class="project-item">
            <div class="project-content">
              <h3>{{ project.name }}</h3>
              <p>{{ project.description }}</p>
              <div class="project-tags">
                <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 联系 -->
    <section id="contact" class="section section-alt">
      <div class="container">
        <h2 class="section-title">联系我</h2>
        <div class="contact-grid">
          <div class="contact-info">
            <div class="contact-item">
              <div class="contact-icon">📧</div>
              <div>
                <div class="contact-label">邮箱</div>
                <div class="contact-value">your.email@example.com</div>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-icon">📱</div>
              <div>
                <div class="contact-label">电话</div>
                <div class="contact-value">+86 138 0000 0000</div>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-icon">📍</div>
              <div>
                <div class="contact-label">位置</div>
                <div class="contact-value">中国 · 北京</div>
              </div>
            </div>
          </div>
          <form class="contact-form" @submit.prevent="submitContact">
            <input v-model="contactForm.name" type="text" placeholder="姓名" required />
            <input v-model="contactForm.email" type="email" placeholder="邮箱" required />
            <textarea v-model="contactForm.message" placeholder="留言" rows="4" required></textarea>
            <button type="submit" class="btn-primary">发送消息</button>
          </form>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="footer">
      <p>&copy; 2026 Portfolio. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const isScrolled = ref(false)
const menuOpen = ref(false)

// 技能数据
const skills = ref([
  { name: '前端开发', level: 90 },
  { name: '后端开发', level: 85 },
  { name: 'UI/UX 设计', level: 80 },
  { name: '数据库', level: 85 },
  { name: 'DevOps', level: 75 }
])

// 项目数据
const projects = ref([
  {
    id: 1,
    name: '电商平台',
    description: '功能完整的电商系统，包含商品管理、订单处理、支付集成等核心功能',
    tags: ['Vue3', 'Element Plus', 'Vite']
  },
  {
    id: 2,
    name: '数据可视化平台',
    description: '基于 ECharts 的数据分析平台，支持实时数据更新和多维度分析',
    tags: ['Vue3', 'ECharts', 'WebSocket']
  },
  {
    id: 3,
    name: '内容管理系统',
    description: '灵活的 CMS 系统，支持富文本编辑、媒体管理和权限控制',
    tags: ['Vue3', 'TipTap', 'Pinia']
  }
])

// 联系表单
const contactForm = ref({
  name: '',
  email: '',
  message: ''
})

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

// 进入商城
const goToMall = () => {
  router.push('/home')
}

// 提交表单
const submitContact = () => {
  ElMessage.success('消息已发送！')
  contactForm.value = { name: '', email: '', message: '' }
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
  font-weight: 600;
  color: #000;
  letter-spacing: -0.5px;
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
  gap: 2.5rem;
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
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #000;
  color: #fff;
}

.btn-primary:hover {
  background: #333;
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: #000;
  border: 2px solid #000;
}

.btn-secondary:hover {
  background: #000;
  color: #fff;
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
}

.hero-content {
  max-width: 700px;
}

.avatar {
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #f0f0f0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero h1 {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #000;
  letter-spacing: -2px;
  line-height: 1.2;
}

.subtitle {
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 2.5rem;
  font-weight: 400;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* 通用区域 */
.section {
  padding: 5rem 2rem;
}

.section-alt {
  background: #fafafa;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  color: #000;
  letter-spacing: -1px;
}

/* 关于 */
.intro-text {
  font-size: 1.15rem;
  line-height: 1.8;
  color: #666;
  text-align: center;
  max-width: 700px;
  margin: 0 auto 3rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 3rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 3rem;
  font-weight: 700;
  color: #000;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #999;
  font-size: 0.95rem;
}

/* 技能 */
.skills-list {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.skill-item {
  width: 100%;
}

.skill-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.skill-name {
  font-weight: 600;
  color: #000;
}

.skill-percent {
  color: #999;
  font-size: 0.9rem;
}

.skill-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
}

.skill-progress {
  height: 100%;
  background: #000;
  border-radius: 10px;
  transition: width 1s ease;
}

/* 项目 */
.projects-list {
  display: grid;
  gap: 2rem;
}

.project-item {
  padding: 2rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  transition: all 0.3s;
}

.project-item:hover {
  border-color: #000;
  transform: translateY(-5px);
}

.project-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #000;
}

.project-content p {
  color: #666;
  line-height: 1.7;
  margin-bottom: 1rem;
}

.project-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  padding: 0.4rem 0.8rem;
  background: #f0f0f0;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #666;
}

/* 联系 */
.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 3rem;
  align-items: start;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.contact-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.contact-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 8px;
  flex-shrink: 0;
}

.contact-label {
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 0.25rem;
}

.contact-value {
  color: #000;
  font-weight: 500;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-form input,
.contact-form textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.3s;
}

.contact-form input:focus,
.contact-form textarea:focus {
  outline: none;
  border-color: #000;
}

.contact-form textarea {
  resize: vertical;
  min-height: 120px;
}

.contact-form button {
  width: 100%;
}

/* 页脚 */
.footer {
  background: #000;
  color: #fff;
  padding: 2rem;
  text-align: center;
  font-size: 0.9rem;
}

/* 响应式 */
@media (max-width: 768px) {
  .menu-toggle {
    display: flex;
  }

  .nav-links {
    position: fixed;
    top: 0;
    right: -100%;
    width: 70%;
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
    font-size: 1.1rem;
  }

  .section {
    padding: 3rem 1.5rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .stats {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .contact-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .hero-actions {
    flex-direction: column;
    width: 100%;
  }

  .hero-actions button {
    width: 100%;
  }
}
</style>
