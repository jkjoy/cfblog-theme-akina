<template>
  <div class="tags-view">
    <div class="site-content animate">
      <div class="page-header">
        <h1 class="page-title">文章标签</h1>
        <p class="page-desc">浏览所有文章标签</p>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="loading-spinner">加载中...</div>
      </div>

      <div v-else-if="error" class="error-container">
        <div class="error-message">
          <h3>加载失败</h3>
          <p>{{ error }}</p>
          <button @click="fetchTags" class="retry-button">重试</button>
        </div>
      </div>

      <div v-else-if="tags.length > 0" class="tags-cloud">
        <div
          v-for="tag in tags"
          :key="tag.id"
          class="tag-item"
          :style="{ fontSize: getTagSize(tag.count) }"
          @click="handleTagClick(tag)"
        >
          <span class="tag-symbol">#</span>
          <span class="tag-name">{{ tag.name }}</span>
          <span class="tag-count">({{ tag.count }})</span>
        </div>
      </div>

      <div v-else class="empty-container">
        <h3>暂无标签</h3>
        <p>还没有创建任何标签。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSEO } from '../composables/useSEO'
import { useSettingsStore } from '../stores/settings'
import type { TagResponse } from '../types'

const router = useRouter()
const settingsStore = useSettingsStore()
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

const tags = ref<TagResponse[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// SEO：等待设置加载完成后再设置标题
const { updateMeta } = useSEO()
watch(
  () => settingsStore.isLoaded,
  (loaded) => {
    if (loaded) {
      updateMeta({
        title: `文章标签 - ${settingsStore.settings.site_title}`,
        description: '浏览所有文章标签',
        type: 'website',
      })
    }
  },
  { immediate: true }
)

const fetchTags = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await fetch(`${API_BASE_URL}/wp-json/wp/v2/tags`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    tags.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取标签失败'
  } finally {
    loading.value = false
  }
}

const getTagSize = (count: number): string => {
  // 根据文章数量动态调整标签字体大小
  const maxCount = Math.max(...tags.value.map((t) => t.count), 1)
  const minSize = 0.9
  const maxSize = 2.5
  const size = minSize + ((count / maxCount) * (maxSize - minSize))
  return `${size}rem`
}

const handleTagClick = (tag: TagResponse) => {
  // 优先使用 slug，如果没有 slug 则使用 name
  const identifier = tag.slug || tag.name
  router.push(`/tags/${identifier}`)
}

onMounted(() => {
  fetchTags()
})
</script>

<style scoped>
.tags-view {
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

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  padding: 40px 20px;
  margin-bottom: 60px;
  min-height: 400px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px;
  color: #636363;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-weight: 400;
  position: relative;
  background: transparent;
}

.tag-item:hover {
  color: var(--accent-color) !important;
}

.tag-symbol,
.tag-name,
.tag-count {
  position: relative;
  z-index: 1;
}

.tag-symbol {
  font-weight: 400;
  margin-right: 2px;
}

.tag-name {
  font-weight: 400;
}

.tag-count {
  opacity: 0.8;
  font-size: 0.9em;
  font-weight: 400;
}

/* 根据文章数量显示不同的样式 - 模拟 Akina 的 size-20, size-30 */
.tag-item[style*="1.8rem"],
.tag-item[style*="2rem"],
.tag-item[style*="2.2rem"],
.tag-item[style*="2.4rem"],
.tag-item[style*="2.5rem"] {
  color: var(--accent-color) !important;
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

  .tags-cloud {
    padding: 30px 16px;
    gap: 12px;
  }

  .tag-item {
    padding: 5px;
  }
}

@media (max-width: 480px) {
  .tags-cloud {
    padding: 20px 12px;
    gap: 10px;
  }

  .tag-item {
    padding: 4px;
    font-size: 0.9rem;
  }
}
</style>
