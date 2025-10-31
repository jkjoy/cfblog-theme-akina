<template>
  <div class="links-view">
    <div class="site-content animate">
      <div class="page-header">
        <h1 class="page-title">友情链接</h1>
        <p class="page-desc">欢迎交换友链，一起成长！</p>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="loading-spinner">加载中...</div>
      </div>

      <div v-else-if="error" class="error-container">
        <div class="error-message">
          <h3>加载失败</h3>
          <p>{{ error }}</p>
          <button @click="fetchLinks" class="retry-button">重试</button>
        </div>
      </div>

      <div v-else-if="linkCategories.length > 0" class="links-container">
        <div
          v-for="category in linkCategories"
          :key="category.id"
          class="links-category"
        >
          <h2 class="category-title">{{ category.name }}</h2>
          <p v-if="category.description" class="category-desc">{{ category.description }}</p>

          <div class="links-grid">
            <a
              v-for="link in getLinksByCategory(category.id)"
              :key="link.id"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="link-card"
            >
              <div class="link-avatar">
                <img
                  v-if="link.avatar"
                  :src="link.avatar"
                  :alt="link.name"
                  @error="handleImageError"
                />
                <span v-else class="link-avatar-text">{{ link.name.charAt(0) }}</span>
              </div>
              <div class="link-info">
                <h3 class="link-name">{{ link.name }}</h3>
                <p class="link-description">{{ link.description || '暂无描述' }}</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div v-else class="empty-container">
        <h3>暂无友链</h3>
        <p>还没有添加任何友情链接。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSEO } from '../composables/useSEO'
import { useSettingsStore } from '../stores/settings'

interface Link {
  id: number
  name: string
  url: string
  description: string
  avatar: string
  category: {
    id: number
    name: string
    slug: string
  }
  target: string
  visible: string
  rating: number
  sort_order: number
  created_at: string
  updated_at: string
}

interface LinkCategory {
  id: number
  name: string
  slug: string
  description: string
  parent: number
  count: number
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'
const settingsStore = useSettingsStore()

// SEO 优化
useSEO({
  title: `友情链接 - ${settingsStore.settings.site_title}`,
  description: '欢迎交换友链，一起成长！',
  type: 'website',
})

const links = ref<Link[]>([])
const linkCategories = ref<LinkCategory[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const getLinksByCategory = (categoryId: number) => {
  return links.value.filter((link) => link.category.id === categoryId)
}

const fetchLinkCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/wp-json/wp/v2/link-categories`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    linkCategories.value = data
  } catch (err) {
    console.error('Failed to fetch link categories:', err)
  }
}

const fetchLinks = async () => {
  loading.value = true
  error.value = null

  try {
    // 先获取分类
    await fetchLinkCategories()

    // 再获取所有链接
    const response = await fetch(`${API_BASE_URL}/wp-json/wp/v2/links?per_page=100`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    links.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取友链失败'
  } finally {
    loading.value = false
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  const parent = img.parentElement
  if (parent) {
    parent.classList.add('no-image')
  }
}

onMounted(() => {
  fetchLinks()
})
</script>

<style scoped>
.links-view {
  width: 100%;
}

.site-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  padding: 40px 0 50px;
}

.page-title {
  font-size: 23px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.page-title::before {
  content: "#";
  margin-right: 6px;
  color: var(--accent-color);
  font-size: 20px;
  font-weight: 600;
}

.page-desc {
  font-size: 16px;
  color: var(--text-light);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-spinner {
  color: var(--text-light);
  font-size: 16px;
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.error-message {
  text-align: center;
  padding: 2rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
  max-width: 400px;
}

.error-message h3 {
  color: #721c24;
  margin-bottom: 1rem;
}

.error-message p {
  color: #721c24;
  margin-bottom: 1rem;
}

.retry-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.retry-button:hover {
  opacity: 0.8;
}

.links-container {
  margin-bottom: 60px;
}

.links-category {
  margin-bottom: 50px;
}

.category-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  padding-left: 12px;
  border-left: 4px solid var(--accent-color);
}

.category-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 20px;
  padding-left: 12px;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.link-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: white;
  border: 1px dashed var(--border-color);
  border-radius: 5px;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.link-card:hover {
  border-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(160, 218, 208, 0.15);
}

.link-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg-light);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
}

.link-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.link-avatar.no-image,
.link-avatar-text {
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-color);
}

.link-info {
  flex: 1;
  min-width: 0;
}

.link-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.link-card:hover .link-name {
  color: var(--accent-color);
}

.link-description {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.empty-container {
  text-align: center;
  padding: 60px 20px;
  background-color: var(--bg-light);
  border-radius: 5px;
  margin-bottom: 60px;
}

.empty-container h3 {
  color: var(--text-light);
  font-size: 20px;
  margin-bottom: 8px;
}

.empty-container p {
  color: var(--text-light);
  font-size: 14px;
}

/* 响应式 */
@media (max-width: 800px) {
  .page-header {
    padding: 30px 0 40px;
  }

  .page-title {
    font-size: 20px;
  }

  .links-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .link-card {
    padding: 16px;
  }

  .link-avatar {
    width: 50px;
    height: 50px;
  }

  .link-name {
    font-size: 15px;
  }

  .link-description {
    font-size: 12px;
  }
}
</style>
