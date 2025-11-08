<template>
  <div class="categories-view">
    <div class="site-content animate">
      <div class="page-header">
        <h1 class="page-title">文章分类</h1>
        <p class="page-desc">浏览所有文章分类</p>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="loading-spinner">加载中...</div>
      </div>

      <div v-else-if="error" class="error-container">
        <div class="error-message">
          <h3>加载失败</h3>
          <p>{{ error }}</p>
          <button @click="fetchCategories" class="retry-button">重试</button>
        </div>
      </div>

      <div v-else-if="categories.length > 0" class="categories-grid">
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-card"
          @click="handleCategoryClick(category)"
        >
          <div class="category-icon">📁</div>
          <div class="category-info">
            <h3 class="category-name">
              {{ category.name }}
              <span class="category-count">({{ category.count }})</span>
            </h3>
            <p class="category-description">{{ category.description || '暂无描述' }}</p>
          </div>
        </div>
      </div>

      <div v-else class="empty-container">
        <h3>暂无分类</h3>
        <p>还没有创建任何分类。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSEO } from '../composables/useSEO'
import { useSettingsStore } from '../stores/settings'
import type { CategoryResponse } from '../types'

const router = useRouter()
const settingsStore = useSettingsStore()
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

const categories = ref<CategoryResponse[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// SEO：等待设置加载完成后再设置标题
const { updateMeta } = useSEO()
watch(
  () => settingsStore.isLoaded,
  (loaded) => {
    if (loaded) {
      updateMeta({
        title: `文章分类 - ${settingsStore.settings.site_title}`,
        description: '浏览所有文章分类',
        type: 'website',
      })
    }
  },
  { immediate: true }
)

const fetchCategories = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await fetch(`${API_BASE_URL}/wp-json/wp/v2/categories`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    categories.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取分类失败'
  } finally {
    loading.value = false
  }
}

const handleCategoryClick = (category: CategoryResponse) => {
  // 优先使用 slug，如果没有 slug 则使用 name
  const identifier = category.slug || category.name
  router.push(`/categories/${identifier}`)
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.categories-view {
  width: 100%;
}

.site-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  padding: 40px 0 60px;
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

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 60px;
}

.category-card {
  background: white;
  border-radius: 5px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  position: relative;
  overflow: hidden;
}

.category-card:hover {
  border-color: var(--accent-color);
  box-shadow: 0 4px 12px rgba(160, 218, 208, 0.15);
}

.category-icon {
  font-size: 32px;
  margin-bottom: 16px;
  transition: transform 0.3s ease;
}

.category-card:hover .category-icon {
  transform: scale(1.1);
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.category-card:hover .category-name {
  color: var(--primary-color);
}

.category-count {
  font-size: 16px;
  font-weight: 400;
  color: var(--text-light);
}

.category-description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 0;
  min-height: 42px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

  .categories-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .category-card {
    padding: 20px;
  }

  .category-icon {
    font-size: 28px;
    margin-bottom: 12px;
  }

  .category-name {
    font-size: 16px;
  }

  .category-description {
    font-size: 13px;
  }
}
</style>
