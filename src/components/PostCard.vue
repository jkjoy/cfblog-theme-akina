<template>
  <article class="post post-list">
    <div class="post-entry">
      <div class="feature">
        <img
          v-if="post.featured_image_url"
          :src="post.featured_image_url"
          :alt="post.title.rendered"
        />
        <img
          v-else-if="post.featured_media"
          :src="getImageUrl(post.featured_media)"
          :alt="post.title.rendered"
        />
        <img
          v-else
          :src="getRandomImage()"
          :alt="post.title.rendered"
        />
      </div>

      <h1 class="entry-title">
        <span v-if="post.sticky" style="color: #ff6d6d; font-weight: 600">[置顶] </span
        >{{ post.title.rendered }}
      </h1>

      <div class="p-time">
        <i class="time-icon">🕒</i> {{ formatDate(post.date) }}
      </div>

      <p class="summary">{{ getExcerpt(post.excerpt.rendered) }}</p>

      <footer class="entry-footer">
        <div class="info-meta">
          <div class="comnum">
            <span>
              <i class="icon">💬</i>
              <span>{{ post.comment_count || 0 }} 条评论</span>
            </span>
          </div>
          <div class="views">
            <span><i class="icon">👁</i>{{ post.view_count || 0 }} 热度</span>
          </div>
        </div>
      </footer>
    </div>
    <hr />
  </article>
</template>

<script setup lang="ts">
import type { PostResponse } from '../types'

interface Props {
  post: PostResponse
}

const props = defineProps<Props>()

// 随机图片列表（7张）
const RANDOM_IMAGES: readonly string[] = [
  '/random/deu1.jpg',
  '/random/deu2.jpg',
  '/random/deu3.jpg',
  '/random/deu4.jpg',
  '/random/deu5.jpg',
  '/random/deu6.jpg',
  '/random/deu7.jpg',
] as const

const getImageUrl = (mediaId: number): string => {
  return `${import.meta.env.VITE_API_URL || 'http://localhost:8787'}/wp-json/wp/v2/media/${mediaId}`
}

// 根据文章 ID 获取随机图片（同一篇文章总是显示相同的图片）
const getRandomImage = (): string => {
  const index = props.post.id % RANDOM_IMAGES.length
  return (RANDOM_IMAGES[index] || RANDOM_IMAGES[0]) as string
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / 86400000)

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const getExcerpt = (html: string): string => {
  const tmp = document.createElement('DIV')
  tmp.innerHTML = html
  const text = tmp.textContent || tmp.innerText || ''
  return text.length > 120 ? text.substring(0, 120) + '...' : text
}
</script>

<style scoped>
.post {
  margin: 0 0 30px 0;
  position: relative;
  cursor: pointer;
}

.post-entry {
  position: relative;
  min-height: 120px;
  cursor: pointer;
}

.feature {
  position: absolute;
  margin-top: 10px;
  left: 0;
}

.feature img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  padding: 2px;
  border: 1px solid var(--border-color);
  transition: all 0.2s linear;
  overflow: hidden;
}

.feature img:hover {
  transform: scale(1.1);
  filter: contrast(130%);
}

.entry-title {
  font-size: 21px;
  font-weight: 600;
  line-height: 50px;
  margin: 0 0 0 17%;
  position: relative;
  z-index: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 70%;
  color: var(--text-primary);
  cursor: pointer;
}

.entry-title:hover {
  color: var(--primary-color);
}

.p-time {
  position: absolute;
  right: 0;
  top: 16px;
  font-size: 12px;
  color: var(--text-light);
  letter-spacing: 1px;
  font-family: miranafont, 'Hiragino Sans GB', 'Microsoft Yahei', Arial, sans-serif;
  display: flex;
  align-items: center;
  gap: 4px;
}

.time-icon {
  font-style: normal;
}

p.summary {
  min-height: 60px;
  margin: 0 0 0 17%;
  font-size: 15px;
  color: var(--text-secondary);
  letter-spacing: 1px;
  line-height: 30px;
}

footer.entry-footer {
  margin: 10px 0 0 17%;
  list-style: none;
}

.info-meta {
  margin-top: 10px;
  font-family: miranafont, 'Hiragino Sans GB', 'Microsoft Yahei', Arial, sans-serif;
  position: absolute;
  top: 20px;
  opacity: 0;
  padding-top: 8px;
  border-top: 1px solid #ddd;
  transform: translate3d(-150px, 0, 0);
  visibility: hidden;
  transition: 0.6s all ease;
}

.info-meta span,
.info-meta a {
  color: #B3B3B3;
  font-size: 12px;
}

.info-meta .icon {
  margin-right: 5px;
  font-style: normal;
}

.comnum {
  display: block;
  margin-bottom: 8px;
}

.views {
  display: block;
}

.post-entry:hover footer.entry-footer .info-meta {
  transform: translate3d(-280px, 0, 0);
  opacity: 1;
  visibility: visible;
}

.post hr {
  width: 30%;
  height: 1px;
  margin: 0 auto;
  border: 0;
  background: #EFEFEF;
}

/* 响应式 */
@media (max-width: 1060px) {
  .info-meta {
    display: none;
  }
}

@media (max-width: 800px) {
  .post-entry {
    min-height: 80px;
  }

  .feature img {
    width: 50px;
    height: 50px;
  }

  .entry-title {
    font-size: 16px;
    line-height: 30px;
    margin: 0 0 0 65px;
    width: calc(100% - 65px);
  }

  .p-time {
    position: relative;
    margin: 5px 0 0 65px;
    top: auto;
    right: auto;
  }

  p.summary {
    margin: 10px 0 0 65px;
    font-size: 14px;
    min-height: 30px;
    overflow: hidden;
  }

  footer.entry-footer {
    margin: 10px 0 0 65px;
  }

  .post-list hr {
    margin-top: 20px;
  }
}
</style>
