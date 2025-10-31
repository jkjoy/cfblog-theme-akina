<template>
  <div class="search-container">
    <div class="page-header">
      <h1>搜索文章</h1>
      <p>在博客中搜索您感兴趣的内容</p>
    </div>

    <div class="search-box">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="输入关键词搜索..."
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <button @click="handleSearch" class="search-button">搜索</button>
    </div>

    <div v-if="loading" class="loading-container">
      <LoadingSpinner />
      <p>搜索中...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <h3>搜索失败</h3>
        <p>{{ error }}</p>
        <button @click="handleSearch" class="retry-button">重试</button>
      </div>
    </div>

    <div v-else-if="hasSearched" class="search-results">
      <div class="results-header">
        <h2>搜索结果</h2>
        <p v-if="searchResults.length > 0" class="results-count">
          找到 {{ searchResults.length }} 篇相关文章
        </p>
      </div>

      <div v-if="searchResults.length > 0" class="results-grid">
        <PostCard
          v-for="post in searchResults"
          :key="post.id"
          :post="post"
          @click="() => $router.push(`/posts/${post.slug}`)"
        />
      </div>

      <div v-else class="no-results">
        <h3>未找到相关文章</h3>
        <p>请尝试使用其他关键词搜索</p>
      </div>
    </div>

    <div v-else class="search-tips">
      <h3>搜索提示</h3>
      <ul>
        <li>输入文章标题、内容或作者的关键词</li>
        <li>使用空格分隔多个关键词</li>
        <li>搜索不区分大小写</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PostCard from '../components/PostCard.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import type { PostResponse } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

const searchQuery = ref('')
const searchResults = ref<PostResponse[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const hasSearched = ref(false)

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    return
  }

  loading.value = true
  error.value = null
  hasSearched.value = true

  try {
    const response = await fetch(
      `${API_BASE_URL}/wp-json/wp/v2/posts?search=${encodeURIComponent(searchQuery.value)}&status=publish`
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    searchResults.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : '搜索失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.search-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem 0;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.page-header p {
  font-size: 1.2rem;
  color: #6c757d;
}

.search-box {
  display: flex;
  gap: 1rem;
  max-width: 700px;
  margin: 0 auto 3rem;
  padding: 0 1rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 0.5rem;
  outline: none;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  border-color: #667eea;
}

.search-button {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.search-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
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

.search-results {
  margin-top: 2rem;
}

.results-header {
  margin-bottom: 2rem;
}

.results-header h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.results-count {
  font-size: 1rem;
  color: #6c757d;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.no-results {
  text-align: center;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
}

.no-results h3 {
  font-size: 1.5rem;
  color: #6c757d;
  margin-bottom: 1rem;
}

.no-results p {
  color: #6c757d;
}

.search-tips {
  max-width: 600px;
  margin: 3rem auto;
  padding: 2rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-tips h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.search-tips ul {
  list-style: none;
  padding: 0;
}

.search-tips li {
  padding: 0.75rem 0;
  color: #495057;
  border-bottom: 1px solid #e9ecef;
}

.search-tips li:last-child {
  border-bottom: none;
}

.search-tips li::before {
  content: '•';
  color: #667eea;
  font-weight: bold;
  display: inline-block;
  width: 1em;
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }

  .page-header p {
    font-size: 1rem;
  }

  .search-box {
    flex-direction: column;
    padding: 0;
  }

  .search-button {
    width: 100%;
  }

  .results-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .results-header h2 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.5rem;
  }

  .search-input {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }

  .search-button {
    padding: 0.6rem 1.5rem;
    font-size: 0.9rem;
  }

  .results-grid {
    gap: 1rem;
  }

  .search-tips {
    padding: 1.5rem;
  }
}
</style>
