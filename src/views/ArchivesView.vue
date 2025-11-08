<template>
  <div class="archives-view">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">文章归档</h1>
        <p class="archive-count">共 {{ totalPosts }} 篇文章</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <LoadingSpinner />
      </div>

      <!-- 归档列表 -->
      <div v-else class="archives-content">
        <div v-for="yearData in archivesByYear" :key="yearData.year" class="year-section">
          <!-- 年份标题 -->
          <div class="year-header">
            <h2 class="year-title">{{ yearData.year }}</h2>
            <span class="year-count">{{ yearData.posts.length }} 篇</span>
          </div>

          <!-- 月份分组 -->
          <div
            v-for="monthData in yearData.monthGroups"
            :key="monthData.month"
            class="month-section"
          >
            <div class="month-header">
              <h3 class="month-title">{{ monthData.monthName }}</h3>
              <span class="month-count">{{ monthData.posts.length }} 篇</span>
            </div>

            <!-- 文章列表 -->
            <ul class="post-list">
              <li v-for="post in monthData.posts" :key="post.id" class="post-item">
                <RouterLink :to="`/posts/${post.slug}`" class="post-link">
                  <span class="post-date">{{ formatDate(post.date) }}</span>
                  <span class="post-title">{{ post.title.rendered }}</span>
                </RouterLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useSEO } from '../composables/useSEO'
import { useSettingsStore } from '../stores/settings'
import LoadingSpinner from '../components/LoadingSpinner.vue'

interface Post {
  id: number
  date: string
  slug: string
  title: {
    rendered: string
  }
}

interface MonthGroup {
  month: string
  monthName: string
  posts: Post[]
}

interface YearData {
  year: string
  posts: Post[]
  monthGroups: MonthGroup[]
}

const settingsStore = useSettingsStore()
const loading = ref(true)
const posts = ref<Post[]>([])
const totalPosts = ref(0)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

// SEO：设置加载完成后再设置标题，避免默认值闪烁
const { updateMeta } = useSEO()
watch(
  () => settingsStore.isLoaded,
  (loaded) => {
    if (loaded) {
      updateMeta({
        title: `文章归档 - ${settingsStore.settings.site_title}`,
        description: `浏览所有文章归档，共 ${totalPosts.value} 篇文章`,
        type: 'website',
      })
    }
  },
  { immediate: true }
)

// 按年份分组的归档数据
const archivesByYear = computed<YearData[]>(() => {
  const yearMap = new Map<string, Post[]>()

  // 按年份分组
  posts.value.forEach((post) => {
    const year = new Date(post.date).getFullYear().toString()
    if (!yearMap.has(year)) {
      yearMap.set(year, [])
    }
    yearMap.get(year)!.push(post)
  })

  // 转换为数组并排序（最新的年份在前）
  const yearsData: YearData[] = Array.from(yearMap.entries())
    .map(([year, yearPosts]) => {
      // 按月份分组
      const monthMap = new Map<string, Post[]>()

      yearPosts.forEach((post) => {
        const date = new Date(post.date)
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const key = `${year}-${month}`

        if (!monthMap.has(key)) {
          monthMap.set(key, [])
        }
        monthMap.get(key)!.push(post)
      })

      // 转换月份数据
      const monthGroups: MonthGroup[] = Array.from(monthMap.entries())
        .map(([key, monthPosts]) => {
          const [, month] = key.split('-')
          return {
            month: key,
            monthName: `${parseInt(month || '1')}月`,
            posts: monthPosts
          }
        })
        .sort((a, b) => b.month.localeCompare(a.month)) // 月份倒序

      return {
        year,
        posts: yearPosts,
        monthGroups
      }
    })
    .sort((a, b) => parseInt(b.year) - parseInt(a.year)) // 年份倒序

  return yearsData
})

// 格式化日期为 MM-DD
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${month}-${day}`
}

// 加载所有文章
const loadPosts = async () => {
  loading.value = true
  try {
    const response = await fetch(`${API_URL}/wp-json/wp/v2/posts?per_page=100&orderby=date&order=desc`)

    if (!response.ok) {
      throw new Error('Failed to fetch posts')
    }

    const data = await response.json()
    posts.value = data
    totalPosts.value = parseInt(response.headers.get('X-WP-Total') || '0')
  } catch (error) {
    console.error('Failed to load archives:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
.archives-view {
  min-height: calc(100vh - 80px);
  background: var(--bg-primary);
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 60px;
  padding-bottom: 30px;
  border-bottom: 1px solid var(--border-color);
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 10px 0;
}

.archive-count {
  font-size: 16px;
  color: var(--text-light);
  margin: 0;
}

/* 加载状态 */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

/* 归档内容 */
.archives-content {
  position: relative;
}

/* 年份区块 */
.year-section {
  margin-bottom: 60px;
  position: relative;
}

.year-section:last-child {
  margin-bottom: 0;
}

.year-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid var(--primary-color);
}

.year-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0;
}

.year-count {
  font-size: 14px;
  color: var(--text-light);
  background: rgba(143, 208, 204, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
}

/* 月份区块 */
.month-section {
  margin-bottom: 40px;
  position: relative;
  padding-left: 40px;
}

.month-section:last-child {
  margin-bottom: 0;
}

.month-section::before {
  content: '';
  position: absolute;
  left: 12px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--border-color);
}

.month-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  position: relative;
}

.month-header::before {
  content: '';
  position: absolute;
  left: -34px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  background: var(--primary-color);
  border-radius: 50%;
  border: 2px solid var(--bg-primary);
}

.month-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.month-count {
  font-size: 12px;
  color: var(--text-light);
  background: var(--bg-secondary);
  padding: 2px 8px;
  border-radius: 10px;
}

/* 文章列表 */
.post-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.post-item {
  margin-bottom: 12px;
  position: relative;
}

.post-link {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 15px;
  background: var(--bg-secondary);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.post-link:hover {
  background: white;
  border-color: var(--primary-color);
  transform: translateX(5px);
  box-shadow: 0 2px 8px rgba(143, 208, 204, 0.2);
}

.post-date {
  flex-shrink: 0;
  font-size: 14px;
  color: var(--text-light);
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 500;
  min-width: 45px;
}

.post-title {
  flex: 1;
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-link:hover .post-title {
  color: var(--primary-color);
}

/* 响应式 */
@media (max-width: 768px) {
  .container {
    padding: 30px 16px;
  }

  .page-header {
    margin-bottom: 40px;
    padding-bottom: 20px;
  }

  .page-title {
    font-size: 28px;
  }

  .year-section {
    margin-bottom: 40px;
  }

  .year-title {
    font-size: 26px;
  }

  .month-section {
    padding-left: 30px;
  }

  .month-section::before {
    left: 9px;
  }

  .month-header::before {
    left: -26px;
    width: 8px;
    height: 8px;
  }

  .month-title {
    font-size: 18px;
  }

  .post-link {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 12px;
  }

  .post-date {
    font-size: 12px;
    min-width: auto;
  }

  .post-title {
    font-size: 14px;
    white-space: normal;
  }
}
</style>
