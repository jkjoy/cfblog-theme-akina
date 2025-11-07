<template>
  <div class="about-view">
    <div class="site-content animate">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner">加载中...</div>
      </div>

      <div v-else-if="error" class="error-container">
        <div class="error-message">
          <h3>加载失败</h3>
          <p>{{ error }}</p>
          <button @click="fetchPage" class="retry-button">重试</button>
        </div>
      </div>

      <div v-else-if="page" class="page-detail">
        <article class="page-article hentry">
          <header class="entry-header">
            <h1 class="entry-title">{{ page.title.rendered }}</h1>
            <hr />
          </header>

          <div class="page-image" v-if="page.featured_media">
            <img
              :src="getImageUrl(page.featured_media)"
              :alt="page.title.rendered"
              class="featured-image"
            />
          </div>

          <div class="entry-content" v-html="renderedContent"></div>
        </article>
      </div>

      <div v-else class="empty-container">
        <h3>页面不存在</h3>
        <p>未找到"关于"页面，请联系管理员创建。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSEO } from '../composables/useSEO'
import { useSettingsStore } from '../stores/settings'
import { useMarkdown } from '../composables/useMarkdown'

interface Page {
  id: number
  title: {
    rendered: string
  }
  content: {
    rendered: string
  }
  excerpt: {
    rendered: string
  }
  slug: string
  featured_media: number
  date: string
  modified: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'
const settingsStore = useSettingsStore()
const { renderMarkdown } = useMarkdown()

const page = ref<Page | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// 渲染Markdown内容（始终按 Markdown 渲染）
const renderedContent = computed(() => {
  if (!page.value?.content?.rendered) return ''
  const content = page.value.content.rendered
  return renderMarkdown(content)
})

// SEO 优化
const { updateMeta } = useSEO({
  title: `关于 - ${settingsStore.settings.site_title}`,
  type: 'website',
})

const getImageUrl = (mediaId: number): string => {
  return `${API_BASE_URL}/wp-json/wp/v2/media/${mediaId}`
}

const fetchPage = async () => {
  loading.value = true
  error.value = null

  try {
    // 使用 slug 获取页面
    const response = await fetch(`${API_BASE_URL}/wp-json/wp/v2/pages?slug=about`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.length > 0) {
      page.value = data[0]

      // 更新 SEO 信息
      if (page.value) {
        updateMeta({
          title: `${page.value.title.rendered} - ${settingsStore.settings.site_title}`,
          description: page.value.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160),
          type: 'website',
        })
      }
    } else {
      error.value = '未找到"关于"页面'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取页面失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPage()
})
</script>

<style scoped>
.about-view {
  width: 100%;
}

.site-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
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

.page-article {
  background: white;
  margin-bottom: 40px;
  padding-top: 30px;
}

/* 页面头部 */
.entry-header {
  margin-bottom: 30px;
  text-align: center;
}

.entry-header hr {
  width: 100%;
  height: 1px;
  margin: 20px auto;
  border: 0;
  background: #efefef;
}

h1.entry-title {
  font-size: 23px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: 15px;
}

.entry-header h1::before {
  content: '#';
  margin-right: 6px;
  color: var(--accent-color);
  font-size: 20px;
  font-weight: 600;
}

/* 特色图片 */
.page-image {
  width: 100%;
  margin-bottom: 30px;
}

.featured-image {
  width: 100%;
  height: auto;
  border-radius: 5px;
  object-fit: cover;
}

/* 页面内容样式 - Akina 主题 */
.entry-content {
  position: relative;
  color: #565656;
  font-weight: 400;
  line-height: 30px;
  margin: 30px 0;
}

.entry-content :deep(p) {
  line-height: 30px;
  margin: 10px 0;
  color: #565656;
}

.entry-content :deep(h2) {
  color: var(--text-primary);
  font-size: 20px;
  margin: 25px 0 15px;
}

.entry-content :deep(h2::before) {
  content: '[';
  margin-right: 5px;
  color: var(--accent-color);
  font-size: 25px;
}

.entry-content :deep(h2::after) {
  content: ']';
  margin-left: 5px;
  color: var(--accent-color);
  font-size: 25px;
}

.entry-content :deep(h3) {
  color: #6d6c6c;
  background: var(--bg-light);
  padding: 10px 20px;
  border-left: 5px solid #c4e2ea;
  font-weight: normal;
  font-size: 16px;
  border-radius: 5px;
  word-wrap: break-word;
  word-break: break-all;
  overflow: hidden;
  margin: 20px 0 15px;
}

.entry-content :deep(h4),
.entry-content :deep(h5) {
  padding: 20px 35px;
  background: #fff6b5;
  color: var(--text-muted);
  font-weight: normal;
  border-radius: 5px;
  position: relative;
  padding-left: 60px;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.06);
  margin: 20px 0 15px;
}

.entry-content :deep(h5) {
  font-size: 16px;
  background: #c8e6fb;
}

.entry-content :deep(ul),
.entry-content :deep(ol) {
  color: #6c6c6c;
  margin: 10px 0;
  padding-left: 30px;
}

.entry-content :deep(ul li),
.entry-content :deep(ol li) {
  padding: 5px 0;
}

.entry-content :deep(ul)::marker {
  color: #f77a7a;
}

/* 引用样式 */
.entry-content :deep(blockquote) {
  margin: 0;
  padding: 30px 60px;
  background: var(--bg-light);
  position: relative;
  word-wrap: break-word;
  word-break: break-all;
  overflow: hidden;
  border-radius: 5px;
  margin: 20px 0;
}

.entry-content :deep(blockquote::before) {
  content: '"' !important;
  font-size: 4rem;
  position: absolute;
  top: -10px;
  left: 18px;
  color: #d3deea;
  font-family: fantasy;
}

.entry-content :deep(blockquote p) {
  margin: 5px 0;
}

/* 代码样式 */
.entry-content :deep(code) {
  background: #f9f9f9;
  color: #e67474;
  padding: 2px 4px;
  border-radius: 2px;
  font-family: Monaco, Consolas, 'Andale Mono', 'DejaVu Sans Mono', monospace;
  font-size: 15px;
}

.entry-content :deep(pre) {
  background: var(--bg-light);
  font-family: 'Courier New', 'Verdana', 'Trebuchet MS', 'Helvetica', sans-serif;
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 1.6em;
  max-width: 100%;
  overflow: auto;
  padding: 1.6em;
  color: #6f6f6f;
  border-radius: 5px;
}

.entry-content :deep(pre code) {
  background: none;
  color: #6f6f6f;
  padding: 0;
}

/* 链接样式 */
.entry-content :deep(a) {
  color: var(--link-color);
  text-decoration: underline;
  transition: color 0.3s ease;
}

.entry-content :deep(a:hover) {
  color: var(--link-hover);
}

/* 图片样式 */
.entry-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 5px;
  margin: 1rem 0;
  display: block;
}

/* 表格样式 */
.entry-content :deep(table) {
  border: 1px dashed #eaeaea;
  margin: 10px 0;
  color: #575757;
  text-align: center;
  border-radius: 5px;
  border-collapse: separate;
  border-spacing: 5px;
  word-break: keep-all;
  width: 100%;
}

.entry-content :deep(table thead) {
  background-color: #f1f1f1;
}

.entry-content :deep(table td),
.entry-content :deep(table th) {
  padding: 5px 8px;
  border-radius: 5px;
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
  .site-content {
    padding: 0 16px;
  }

  h1.entry-title {
    font-size: 20px;
  }

  .entry-content {
    font-size: 15px;
    line-height: 26px;
  }

  .entry-content :deep(h2) {
    font-size: 18px;
  }

  .entry-content :deep(h3) {
    font-size: 15px;
    padding: 8px 15px;
  }

  .entry-content :deep(h4),
  .entry-content :deep(h5) {
    padding: 15px 25px 15px 50px;
  }

  .entry-content :deep(blockquote) {
    padding: 20px 40px;
  }

  .entry-content :deep(blockquote::before) {
    font-size: 3rem;
    left: 10px;
  }
}

@media (max-width: 480px) {
  h1.entry-title {
    font-size: 18px;
  }

  .entry-content :deep(blockquote) {
    padding: 15px 30px;
  }
}
</style>
