<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { onMounted, watch, ref } from 'vue'
import { useSettingsStore } from './stores/settings'

const settingsStore = useSettingsStore()
const route = useRoute()

// 移动端菜单状态
const mobileMenuOpen = ref(false)

// 切换移动端菜单
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

// 关闭移动端菜单
const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

// 在应用启动时加载系统设置
onMounted(async () => {
  await settingsStore.loadSettings()
})

// 监听路由变化，关闭移动端菜单
watch(
  () => route.fullPath,
  (newPath) => {
    console.log('🔀 App.vue - Route changed to:', newPath)
    closeMobileMenu()
  }
)
</script>

<template>
  <div id="app">
    <header class="site-header">
      <div class="header-container">
        <div class="site-branding">
          <RouterLink to="/" class="site-logo">
            <span class="logo-text">{{ settingsStore.settings.site_title }}</span>
          </RouterLink>
        </div>

        <!-- 桌面端导航 -->
        <nav class="main-nav desktop-nav">
          <RouterLink to="/" class="nav-link">首页</RouterLink>
          <RouterLink to="/categories" class="nav-link">分类</RouterLink>
          <RouterLink to="/archives" class="nav-link">归档</RouterLink>
          <RouterLink to="/tags" class="nav-link">标签</RouterLink>
          <RouterLink to="/link" class="nav-link">友链</RouterLink>
          <RouterLink to="/about" class="nav-link">关于</RouterLink>
          <RouterLink to="/search" class="nav-link search-icon" title="搜索">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </RouterLink>
        </nav>

        <!-- 移动端汉堡菜单按钮 -->
        <button class="mobile-menu-toggle" @click="toggleMobileMenu" aria-label="菜单">
          <span class="hamburger" :class="{ active: mobileMenuOpen }">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>
    </header>

    <!-- 移动端菜单遮罩 -->
    <transition name="fade">
      <div v-if="mobileMenuOpen" class="mobile-menu-overlay" @click="closeMobileMenu"></div>
    </transition>

    <!-- 移动端菜单 -->
    <transition name="slide">
      <nav v-if="mobileMenuOpen" class="mobile-nav">
        <div class="mobile-nav-header">
          <span class="mobile-nav-title">菜单</span>
          <button class="mobile-nav-close" @click="closeMobileMenu" aria-label="关闭菜单">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="mobile-nav-content">
          <RouterLink to="/" class="mobile-nav-link">
            <span>首页</span>
          </RouterLink>
          <RouterLink to="/categories" class="mobile-nav-link">
            <span>分类</span>
          </RouterLink>
          <RouterLink to="/archives" class="mobile-nav-link">
            <span>归档</span>
          </RouterLink>
          <RouterLink to="/tags" class="mobile-nav-link">
            <span>标签</span>
          </RouterLink>
          <RouterLink to="/link" class="mobile-nav-link">
            <span>友链</span>
          </RouterLink>
          <RouterLink to="/about" class="mobile-nav-link">
            <span>关于</span>
          </RouterLink>
          <RouterLink to="/search" class="mobile-nav-link">
            <span>搜索</span>
          </RouterLink>
        </div>
      </nav>
    </transition>

    <main class="site-main">
      <RouterView :key="$route.fullPath" />
    </main>

    <footer class="site-footer">
      <div class="footer-container">
        <p v-html="settingsStore.settings.site_footer_text"></p>
        <p v-if="settingsStore.settings.site_icp" class="icp">
          {{ settingsStore.settings.site_icp }}
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 头部导航 */
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.header-container {
  max-width: 1200px;
  height: 100%;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.site-branding {
  display: flex;
  align-items: center;
}

.site-logo {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-link.search-icon {
  padding: 8px 10px;
}

.nav-link.search-icon svg {
  display: block;
}

.nav-link:hover {
  color: var(--primary-color);
  background: rgba(143, 208, 204, 0.1);
}

.nav-link.router-link-active {
  color: var(--primary-color);
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 12px;
  right: 12px;
  height: 2px;
  background: var(--primary-color);
}

/* 主要内容区 */
.site-main {
  flex: 1;
  margin-top: 80px;
  padding: 40px 0;
}

/* 页脚 */
.site-footer {
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  padding: 30px 0;
  margin-top: 60px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.footer-container p {
  color: var(--text-light);
  font-size: 14px;
  margin: 0;
}

.footer-container .icp {
  margin-top: 5px;
  font-size: 12px;
}

/* 响应式 */
@media (max-width: 768px) {
  .site-header {
    height: 60px;
  }

  .header-container {
    padding: 0 16px;
  }

  .logo-text {
    font-size: 20px;
  }

  /* 隐藏桌面端导航 */
  .desktop-nav {
    display: none;
  }

  .site-main {
    margin-top: 60px;
    padding: 20px 0;
  }

  .site-footer {
    padding: 20px 0;
    margin-top: 40px;
  }
}

@media (max-width: 480px) {
  .logo-text {
    font-size: 18px;
  }
}

/* 移动端汉堡菜单按钮 */
.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  z-index: 1002;
}

.hamburger {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  position: relative;
}

.hamburger span {
  display: block;
  width: 100%;
  height: 2px;
  background: var(--text-primary);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger.active span:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

/* 移动端菜单遮罩 */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  backdrop-filter: blur(4px);
}

/* 移动端菜单 */
.mobile-nav {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 280px;
  max-width: 80%;
  background: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  overflow-y: auto;
}

.mobile-nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.mobile-nav-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.mobile-nav-close {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.mobile-nav-close:hover {
  color: var(--primary-color);
}

.mobile-nav-content {
  padding: 10px 0;
}

.mobile-nav-link {
  display: block;
  padding: 16px 20px;
  color: var(--text-primary);
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
  position: relative;
}

.mobile-nav-link:hover {
  background: var(--bg-secondary);
  color: var(--primary-color);
  border-left-color: var(--primary-color);
}

.mobile-nav-link.router-link-active {
  color: var(--primary-color);
  background: rgba(143, 208, 204, 0.1);
  border-left-color: var(--primary-color);
  font-weight: 600;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

/* 在移动端显示汉堡菜单 */
@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: block;
  }
}
</style>
