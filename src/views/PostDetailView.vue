<template>
  <div class="post-detail-container">
    <SkeletonLoader v-if="loading" type="post-detail" />

    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <h3>加载失败</h3>
        <p>{{ error }}</p>
        <button @click="fetchPost" class="retry-button">重试</button>
      </div>
    </div>

    <div v-else-if="post" class="post-detail">
      <!-- 面包屑导航 -->
      <div class="breadcrumbs">
        <router-link to="/">首页</router-link>
        <span class="separator">›</span>
        <span class="current">{{ post.title.rendered }}</span>
      </div>

      <article class="post-article hentry">
        <header class="entry-header">
          <h1 class="entry-title">{{ post.title.rendered }}</h1>
          <hr />
          <p class="entry-census">
            <span class="post-date"><i class="iconfont">🕒</i>{{ formatDate(post.date) }}</span>
            <span class="bull">·</span>
            <span class="post-category" v-if="post.categories && post.categories.length > 0">
              <i class="iconfont">📁</i>
              <span
                v-for="(categoryId, index) in post.categories"
                :key="categoryId"
              >
                <router-link
                  :to="`/categories/${getCategorySlug(categoryId)}`"
                  class="category-link"
                >
                  {{ getCategoryName(categoryId) }}
                </router-link>
                <span v-if="index < post.categories.length - 1">, </span>
              </span>
            </span>
            <span class="bull">·</span>
            <span class="post-views"><i class="iconfont">👁</i>{{ post.view_count || 0 }} 热度</span>
            <span class="bull" v-if="post.comment_count">·</span>
            <span class="post-comments" v-if="post.comment_count">
              <i class="iconfont">💬</i>{{ post.comment_count }} 条评论
            </span>
          </p>
        </header>

        <div class="post-image" v-if="post.featured_media">
          <img
            :src="getImageUrl(post.featured_media)"
            :alt="post.title.rendered"
            class="featured-image"
          />
        </div>

        <div class="entry-content" v-html="renderedContent"></div>

        <footer class="post-footer">
          <div class="post-tags" v-if="post.tags && post.tags.length > 0">
            <span class="tag-label">标签：</span>
            <span
              v-for="tagId in post.tags"
              :key="tagId"
              class="tag"
              @click="handleTagClick(tagId)"
            >
              #{{ getTagName(tagId) }}
            </span>
          </div>
        </footer>
      </article>

      <!-- 评论区 -->
      <CommentSection :post-id="post.id" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import CommentSection from '../components/CommentSection.vue'
import { useSEO, useStructuredData } from '../composables/useSEO'
import { getCategoryDetails, getTagDetails } from '../composables/useTaxonomy'
import { useMarkdown } from '../composables/useMarkdown'
import type { PostResponse, CategoryResponse, TagResponse } from '../types'

const route = useRoute()
const router = useRouter()

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

const { renderMarkdown } = useMarkdown()

// 获取当前文章的 slug
const postSlug = computed(() => route.params.slug as string)

const post = ref<PostResponse | null>(null)
const categories = ref<Map<number, CategoryResponse>>(new Map())
const tags = ref<Map<number, TagResponse>>(new Map())
const loading = ref(false)
const error = ref<string | null>(null)

// 渲染Markdown内容（始终按 Markdown 渲染）
const renderedContent = computed(() => {
  if (!post.value?.content?.rendered) return ''
  const content = post.value.content.rendered
  return renderMarkdown(content)
})

// SEO 管理
const { updateMeta } = useSEO()
const { setArticleStructuredData } = useStructuredData()

// 监听文章数据变化，更新SEO
watch(post, (newPost) => {
  if (newPost) {
    // 移除HTML标签
    const stripHtml = (html: string) => {
      const tmp = document.createElement('DIV')
      tmp.innerHTML = html
      return tmp.textContent || tmp.innerText || ''
    }

    const description = stripHtml(newPost.excerpt.rendered).substring(0, 160)

    // 更新 meta 标签
    updateMeta({
      title: `${newPost.title.rendered} - CFBlog`,
      description,
      type: 'article',
      url: newPost.link,
      publishedTime: newPost.date,
      modifiedTime: newPost.modified,
      image: newPost.featured_media ? `${API_BASE_URL}/wp-json/wp/v2/media/${newPost.featured_media}` : undefined,
    })

    // 添加结构化数据
    setArticleStructuredData({
      headline: newPost.title.rendered,
      description,
      image: newPost.featured_media ? `${API_BASE_URL}/wp-json/wp/v2/media/${newPost.featured_media}` : undefined,
      datePublished: newPost.date,
      dateModified: newPost.modified,
      author: `作者${newPost.author}`,
      publisher: {
        name: 'CFBlog',
      },
    })
  }
})

const fetchPost = async () => {
  loading.value = true
  error.value = null
  // 清空旧数据，避免显示上一篇文章的内容
  post.value = null
  categories.value.clear()
  tags.value.clear()

  try {
    const slug = postSlug.value
    console.log('🔍 [PostDetailView] Fetching post with slug:', slug)
    // 使用 slug 查询文章，需要对 slug 进行编码
    const encodedSlug = encodeURIComponent(slug)
    const url = `${API_BASE_URL}/wp-json/wp/v2/posts?slug=${encodedSlug}`
    console.log('📡 [PostDetailView] API URL:', url)
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ [PostDetailView] Received data:', data.length, 'posts')

    if (data.length > 0) {
      console.log('📄 [PostDetailView] Post title:', data[0].title.rendered)
      post.value = data[0]

      // 加载分类信息
      if (post.value && post.value.categories && post.value.categories.length > 0) {
        for (const categoryId of post.value.categories) {
          const category = await getCategoryDetails(categoryId)
          if (category) {
            categories.value.set(categoryId, category)
          }
        }
      }

      // 加载标签信息
      if (post.value && post.value.tags && post.value.tags.length > 0) {
        for (const tagId of post.value.tags) {
          const tag = await getTagDetails(tagId)
          if (tag) {
            tags.value.set(tagId, tag)
          }
        }
      }
    } else {
      throw new Error('文章不存在')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取文章失败'
  } finally {
    loading.value = false
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getImageUrl = (mediaId: number): string => {
  return `${API_BASE_URL}/wp-json/wp/v2/media/${mediaId}`
}

const getCategoryName = (categoryId: number): string => {
  const category = categories.value.get(categoryId)
  return category ? category.name : `分类${categoryId}`
}

const getCategorySlug = (categoryId: number): string => {
  const category = categories.value.get(categoryId)
  if (category) {
    return category.slug || category.name
  }
  return categoryId.toString()
}

const getTagName = (tagId: number): string => {
  const tag = tags.value.get(tagId)
  return tag ? tag.name : `标签${tagId}`
}

const getTagSlug = (tagId: number): string => {
  const tag = tags.value.get(tagId)
  if (tag) {
    return tag.slug || tag.name
  }
  return tagId.toString()
}

const handleTagClick = (tagId: number) => {
  const slug = getTagSlug(tagId)
  router.push(`/tags/${slug}`)
}

// 为代码块添加复制按钮
const addCopyButtonToCodeBlocks = () => {
  // 使用 nextTick 确保 DOM 已更新
  const codeBlocks = document.querySelectorAll('pre.hljs, .entry-content pre')

  codeBlocks.forEach((pre) => {
    // 避免重复添加按钮
    if (pre.querySelector('.code-copy-btn')) return

    // 创建复制按钮容器
    const wrapper = document.createElement('div')
    wrapper.className = 'code-block-wrapper'

    // 创建复制按钮
    const copyButton = document.createElement('button')
    copyButton.className = 'code-copy-btn'
    copyButton.innerHTML = '📋 复制代码'
    copyButton.title = '复制代码'

    // 复制功能
    copyButton.addEventListener('click', async () => {
      const code = pre.querySelector('code')
      const text = code?.textContent || ''

      try {
        await navigator.clipboard.writeText(text)
        copyButton.innerHTML = '✅ 已复制!'
        copyButton.classList.add('copied')

        setTimeout(() => {
          copyButton.innerHTML = '📋 复制代码'
          copyButton.classList.remove('copied')
        }, 2000)
      } catch (err) {
        console.error('复制失败:', err)
        copyButton.innerHTML = '❌ 复制失败'
        setTimeout(() => {
          copyButton.innerHTML = '📋 复制代码'
        }, 2000)
      }
    })

    // 将 pre 包裹在 wrapper 中
    pre.parentNode?.insertBefore(wrapper, pre)
    wrapper.appendChild(pre)
    wrapper.appendChild(copyButton)
  })
}

// 监听文章内容变化，添加复制按钮
watch(post, () => {
  if (post.value) {
    setTimeout(addCopyButtonToCodeBlocks, 100)
  }
})

// 监听路由参数变化，重新获取文章
watch(
  () => route.params.slug,
  (newSlug, oldSlug) => {
    console.log('🔄 [PostDetailView] Route slug changed:', { oldSlug, newSlug })
    // 只有当 slug 真的改变时才重新获取
    if (newSlug && newSlug !== oldSlug) {
      console.log('✨ [PostDetailView] Triggering fetchPost')
      fetchPost()
    } else {
      console.log('⚠️ [PostDetailView] Slug unchanged, skipping fetch')
    }
  }
)

onMounted(() => {
  console.log('🚀 [PostDetailView] Component mounted, slug:', route.params.slug)
  fetchPost()
})
</script>

<style scoped>
.post-detail-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 面包屑导航 */
.breadcrumbs {
  font-size: 14px;
  color: #D2D2D2;
  text-decoration: none;
  margin-bottom: 30px;
  padding-top: 20px;
}

.breadcrumbs a {
  font-size: 14px;
  color: #D2D2D2;
  transition: color 0.3s ease;
}

.breadcrumbs a:hover {
  color: var(--primary-color);
}

.breadcrumbs .separator {
  margin: 0 8px;
  color: #D2D2D2;
}

.breadcrumbs .current {
  color: var(--text-primary);
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

.post-article {
  background: white;
  margin-bottom: 40px;
}

/* 文章头部 */
.entry-header {
  margin-bottom: 30px;
}

.entry-header hr {
  width: 100%;
  height: 1px;
  margin: 20px auto;
  border: 0;
  background: #EFEFEF;
}

h1.entry-title {
  font-size: 23px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: 15px;
}

.entry-header h1::before {
  content: "#";
  margin-right: 6px;
  color: var(--accent-color);
  font-size: 20px;
  font-weight: 600;
}

.entry-census {
  font-size: 14px;
  color: var(--text-light);
  letter-spacing: 1px;
  margin: 10px 0;
  text-align: center;
}

.entry-census .iconfont {
  margin-right: 5px;
  font-style: normal;
}

.entry-census .bull {
  margin: 0 8px;
  opacity: 0.5;
}

.category-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.3s ease;
}

.category-link:hover {
  color: var(--primary-color);
}

/* 特色图片 */
.post-image {
  width: 100%;
  margin-bottom: 30px;
}

.featured-image {
  width: 100%;
  height: auto;
  border-radius: 5px;
  object-fit: cover;
}

/* 文章内容样式 - Akina 主题 */
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
  content: "[";
  margin-right: 5px;
  color: var(--accent-color);
  font-size: 25px;
}

.entry-content :deep(h2::after) {
  content: "]";
  margin-left: 5px;
  color: var(--accent-color);
  font-size: 25px;
}

.entry-content :deep(h3) {
  color: #6d6c6c;
  background: var(--bg-light);
  padding: 10px 20px;
  border-left: 5px solid #C4E2EA;
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
  background: #FFF6B5;
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
  background: #C8E6FB;
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
  color: #D3DEEA;
  font-family: fantasy;
}

.entry-content :deep(blockquote p) {
  margin: 5px 0;
}

/* 代码样式 */
.entry-content :deep(code) {
  background: #f9f2f4;
  color: #c7254e;
  padding: 3px 6px;
  border-radius: 3px;
  font-family: Monaco, Consolas, 'Andale Mono', 'DejaVu Sans Mono', monospace;
  font-size: 0.9em;
}

.entry-content :deep(pre) {
  background: #f8f8f8;
  border: 1px solid #f0f0f0;
  font-family: 'Courier New', Consolas, Monaco, monospace;
  font-size: 14px;
  line-height: 1.6;
  margin: 1.5em 0;
  max-width: 100%;
  overflow-x: auto;
  padding: 16px;
  color: #333;
  border-radius: 5px;
  position: relative;
}

.entry-content :deep(pre code) {
  background: none;
  color: inherit;
  padding: 0;
  font-size: 14px;
  border-radius: 0;
}

/* highlight.js 代码高亮样式 */
.entry-content :deep(pre.hljs) {
  background: #f8f8f8;
  border: 1px solid #f0f0f0;
  padding: 16px;
  border-radius: 5px;
  overflow-x: auto;
  margin: 1.5em 0;
  position: relative;
}

.entry-content :deep(pre.hljs code) {
  background: transparent;
  padding: 0;
  border-radius: 0;
  font-family: Monaco, Consolas, 'Andale Mono', 'DejaVu Sans Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: inherit;
}

/* 代码块包装容器 */
.entry-content :deep(.code-block-wrapper) {
  position: relative;
  margin: 1.5em 0;
}

.entry-content :deep(.code-block-wrapper pre) {
  margin: 0;
}

/* 复制按钮样式 */
.entry-content :deep(.code-copy-btn) {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 5px 12px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.entry-content :deep(.code-copy-btn:hover) {
  background: #fff;
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.entry-content :deep(.code-copy-btn:active) {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.entry-content :deep(.code-copy-btn.copied) {
  background: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
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

/* 文章底部 */
.post-footer {
  border-top: 1px solid #EFEFEF;
  padding-top: 30px;
  margin-top: 40px;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
}

.tag-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.tag {
  color: #636363;
  border: 1px dashed #969696;
  padding: 4px 8px;
  border-radius: 5px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.tag:hover {
  color: var(--accent-color) !important;
  border-color: var(--accent-color) !important;
}

/* 响应式 */
@media (max-width: 800px) {
  .post-detail-container {
    padding: 0 16px;
  }

  h1.entry-title {
    font-size: 20px;
  }

  .entry-census {
    font-size: 12px;
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

  .post-tags {
    gap: 8px;
  }

  .tag {
    font-size: 12px;
    padding: 3px 6px;
  }
}

@media (max-width: 480px) {
  h1.entry-title {
    font-size: 18px;
  }

  .entry-census {
    font-size: 11px;
  }

  .entry-content :deep(blockquote) {
    padding: 15px 30px;
  }

  .tag-label {
    font-size: 13px;
  }
}
</style>
