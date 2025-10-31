<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PostCard from '../components/PostCard.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import Pagination from '../components/Pagination.vue'
import type { PostResponse } from '../types'
import { useSEO } from '../composables/useSEO'
import { useSettingsStore } from '../stores/settings'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'
const settingsStore = useSettingsStore()

// SEO 优化 - 使用系统设置
useSEO({
  title: `${settingsStore.settings.site_title} - 首页`,
  description:
    settingsStore.settings.site_description ||
    '探索最新的博客文章和技术分享，涵盖编程、技术、设计等多个领域',
  type: 'website',
})

const posts = ref<PostResponse[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)
const perPage = 10

const fetchPosts = async (page = 1) => {
  loading.value = true
  error.value = null

  try {
    const response = await fetch(
      `${API_BASE_URL}/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&status=publish`
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

onMounted(() => {
  fetchPosts(currentPage.value)
})
</script>

<template>
  <div class="home">
    <div class="site-content animate">
      <!--文章列表-->
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
            @click="() => $router.push(`/posts/${post.slug}`)"
          />
        </div>

        <div v-else class="empty-container">
          <h3>暂无文章</h3>
          <p>还没有发布任何文章，请稍后再来查看。</p>
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
</template>

<style scoped>
.home {
  width: 100%;
}

.site-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.site-main {
  padding-top: 40px;
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
  border-radius: 0.5rem;
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
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.retry-button:hover {
  background-color: #0056b3;
}

.empty-container {
  text-align: center;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
}

.empty-container h3 {
  color: #6c757d;
  margin-bottom: 1rem;
}

.empty-container p {
  color: #6c757d;
}

@media (max-width: 800px) {
  .site-content {
    padding: 0 16px;
  }

  .site-main {
    padding-top: 20px;
  }
}
</style>
