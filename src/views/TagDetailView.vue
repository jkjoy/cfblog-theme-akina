<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PostCard from '../components/PostCard.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import Pagination from '../components/Pagination.vue'
import { useSEO } from '../composables/useSEO'
import type { PostResponse, TagResponse } from '../types'

const route = useRoute()
const router = useRouter()
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

// 在组件顶层初始化 useSEO
const { updateMeta } = useSEO()

const tagId = computed(() => route.params.slug as string)
const tag = ref<TagResponse | null>(null)
const posts = ref<PostResponse[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)
const perPage = 10

const fetchTag = async () => {
  try {
    // 使用 slug 查询标签
    const response = await fetch(`${API_BASE_URL}/wp-json/wp/v2/tags?slug=${tagId.value}`)
    if (!response.ok) {
      throw new Error('标签不存在')
    }
    const data = await response.json()

    if (data.length > 0) {
      tag.value = data[0]

      // SEO 优化
      if (tag.value) {
        updateMeta({
          title: `${tag.value.name} - 文章标签`,
          description: tag.value.description || `浏览 ${tag.value.name} 标签下的所有文章`,
          keywords: `${tag.value.name}, 标签, 博客`,
        })
      }
    } else {
      throw new Error('标签不存在')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取标签信息失败'
  }
}

const fetchPosts = async (page = 1) => {
  loading.value = true
  error.value = null

  try {
    // 使用标签 ID 而不是 slug
    if (!tag.value) {
      throw new Error('标签信息未加载')
    }

    const response = await fetch(
      `${API_BASE_URL}/wp-json/wp/v2/posts?tags=${tag.value.id}&per_page=${perPage}&page=${page}&status=publish`
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    posts.value = data

    // 从响应头获取总页数
    const totalPagesHeader = response.headers.get('X-WP-TotalPages')
    if (totalPagesHeader) {
      totalPages.value = parseInt(totalPagesHeader, 10)
    }

    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取文章失败'
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchPosts(page)
}

// 监听路由变化，重新获取标签和文章
watch(tagId, async () => {
  await fetchTag()
  if (!error.value && tag.value) {
    currentPage.value = 1
    fetchPosts(1)
  }
})

onMounted(async () => {
  await fetchTag()
  if (!error.value) {
    fetchPosts(currentPage.value)
  }
})
</script>

<template>
  <div class="tag-detail">
    <div class="site-content animate">
      <div v-if="error && !tag" class="error-container">
        <div class="error-message">
          <h3>加载失败</h3>
          <p>{{ error }}</p>
          <button @click="router.push('/tags')" class="back-button">返回标签列表</button>
        </div>
      </div>

      <div v-else>
        <div class="page-header">
          <div class="breadcrumb">
            <router-link to="/" class="breadcrumb-link">首页</router-link>
            <span class="breadcrumb-separator">›</span>
            <router-link to="/tags" class="breadcrumb-link">标签</router-link>
            <span class="breadcrumb-separator">›</span>
            <span class="breadcrumb-current">{{ tag?.name || '加载中...' }}</span>
          </div>

          <div class="tag-header">
            <span class="tag-icon">#</span>
            <h1 class="page-title">{{ tag?.name || '加载中...' }}</h1>
          </div>

          <p v-if="tag?.description" class="page-desc">
            {{ tag.description }}
          </p>
          <div v-if="tag" class="tag-meta">
            <span class="post-count"># {{ tag.count }} 篇文章</span>
          </div>
        </div>

        <main class="site-main">
          <div v-if="loading" class="posts-list">
            <SkeletonLoader v-for="i in perPage" :key="i" type="post-card" />
          </div>

          <div v-else-if="error" class="error-container">
            <div class="error-message">
              <h3>加载失败</h3>
              <p>{{ error }}</p>
              <button @click="fetchPosts(currentPage)" class="retry-button">重试</button>
            </div>
          </div>

          <div v-else-if="posts.length > 0" class="posts-list">
            <PostCard
              v-for="post in posts"
              :key="post.id"
              :post="post"
              @click="() => router.push(`/posts/${post.slug}`)"
            />
          </div>

          <div v-else class="empty-container">
            <h3>暂无文章</h3>
            <p>该标签下还没有发布任何文章。</p>
          </div>
        </main>

        <Pagination
          v-if="!loading && posts.length > 0"
          :current-page="currentPage"
          :total-pages="totalPages"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.tag-detail {
  width: 100%;
}

.site-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  padding: 30px 0 50px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  margin-bottom: 20px;
  color: var(--text-light);
}

.breadcrumb-link {
  color: var(--link-color);
  text-decoration: none;
  transition: color 0.3s ease;
}

.breadcrumb-link:hover {
  color: var(--link-hover);
}

.breadcrumb-separator {
  color: var(--text-light);
  font-weight: 300;
}

.breadcrumb-current {
  color: var(--text-primary);
  font-weight: 500;
}

.tag-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.tag-icon {
  font-size: 42px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.page-desc {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 16px;
  line-height: 1.6;
}

.tag-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.post-count {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  background: linear-gradient(135deg, rgba(143, 208, 204, 0.15) 0%, rgba(255, 109, 109, 0.15) 100%);
  color: var(--primary-color);
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid rgba(143, 208, 204, 0.3);
}

.site-main {
  padding-top: 20px;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 0;
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
  border-radius: 8px;
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

.retry-button,
.back-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.retry-button:hover,
.back-button:hover {
  background-color: #0056b3;
}

.empty-container {
  text-align: center;
  padding: 60px 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
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

  .page-header {
    padding: 20px 0 30px;
  }

  .tag-icon {
    font-size: 32px;
  }

  .page-title {
    font-size: 28px;
  }

  .page-desc {
    font-size: 14px;
  }

  .breadcrumb {
    font-size: 12px;
    flex-wrap: wrap;
  }

  .site-main {
    padding-top: 10px;
  }
}

@media (max-width: 480px) {
  .tag-icon {
    font-size: 28px;
  }

  .page-title {
    font-size: 24px;
  }

  .post-count {
    font-size: 13px;
    padding: 5px 12px;
  }
}
</style>
