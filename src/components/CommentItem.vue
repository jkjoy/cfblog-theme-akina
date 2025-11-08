<template>
  <li
    class="comment"
    :class="[depth % 2 === 1 ? 'comment-odd' : 'comment-even', `depth-${depth + 1}`]"
    :id="`li-comment-${comment.id}`"
  >
    <div :id="`comment-${comment.id}`" class="comment_body contents">
      <div class="profile">
        <a
          :href="comment.author_url || '#'"
          :title="comment.author_name"
          target="_blank"
          rel="external nofollow noopener noreferrer"
        >
          <img
            :src="getAvatarUrl()"
            :alt="comment.author_name"
            class="avatar avatar-50 photo"
            height="50"
            width="50"
            @error="handleAvatarError"
          />
        </a>
      </div>

      <section class="commeta">
        <div class="left">
          <h4 class="author">
            <a
              :href="comment.author_url || '#'"
              target="_blank"
              rel="external nofollow noopener noreferrer"
            >
              <img
                :src="getAvatarUrl()"
                :alt="comment.author_name"
                class="avatar avatar-50 photo"
                height="50"
                width="50"
                @error="handleAvatarError"
              />
              {{ comment.author_name }}
            </a>
          </h4>
        </div>
        <a
          rel="nofollow"
          class="comment-reply-link"
          href="#"
          @click.prevent="$emit('reply', comment)"
          :aria-label="`回复给${comment.author_name}`"
        >
          回复
        </a>
        <div class="right">
          <div class="info">
            <time :datetime="comment.date">{{ formatDate(comment.date) }}</time>
          </div>
        </div>
      </section>

      <div class="body">
        <p>
          <a
            v-if="comment.parent && parentAuthorName"
            href="#"
            rel="nofollow"
            class="cute atreply"
            target="_blank"
          >
            @{{ parentAuthorName }}
          </a>
          <span v-if="comment.parent && parentAuthorName"> : </span>
          <span v-html="comment.content.rendered"></span>
        </p>
      </div>
    </div>

    <!-- 嵌套评论代码 -->
    <div v-if="comment.children && comment.children.length > 0" class="children">
      <ol class="comment-list">
        <CommentItem
          v-for="child in comment.children"
          :key="child.id"
          :comment="child"
          :depth="depth + 1"
          :parent-author-name="comment.author_name"
          @reply="$emit('reply', $event)"
        />
      </ol>
    </div>
  </li>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Comment {
  id: number
  post: number
  parent: number
  author: number
  author_name: string
  author_url: string
  author_avatar_urls: Record<number, string>
  date: string
  date_gmt: string
  content: {
    rendered: string
  }
  link: string
  status: string
  type: string
  children?: Comment[]
  _links: any
}

interface Props {
  comment: Comment
  depth?: number
  parentAuthorName?: string
}

const props = withDefaults(defineProps<Props>(), {
  depth: 0,
  parentAuthorName: '',
})

defineEmits<{
  reply: [comment: Comment]
}>()

const avatarError = ref(false)

// 获取头像URL
const getAvatarUrl = (): string => {
  // 使用API返回的author_avatar_urls，优先使用96px的尺寸
  if (props.comment.author_avatar_urls) {
    return (
      props.comment.author_avatar_urls[96] ||
      props.comment.author_avatar_urls[48] ||
      props.comment.author_avatar_urls[24] ||
      generatePlaceholder()
    )
  }
  return generatePlaceholder()
}

// 头像加载失败处理
const handleAvatarError = (e: Event) => {
  const img = e.target as HTMLImageElement
  avatarError.value = true

  // 尝试使用中国镜像CDN
  if (img.src.includes('www.gravatar.com')) {
    img.src = img.src.replace('www.gravatar.com', 'cravatar.cn')
  } else if (img.src.includes('cravatar.cn')) {
    img.src = img.src.replace('cravatar.cn', 'gravatar.loli.net')
  } else if (img.src.includes('gravatar.loli.net')) {
    // 所有CDN都失败，显示placeholder
    img.src = generatePlaceholder()
  } else {
    // 已经是placeholder，不再处理
    img.src = generatePlaceholder()
  }
}

// 生成占位符头像（使用Data URL）
const generatePlaceholder = (): string => {
  const initial = props.comment.author_name.charAt(0).toUpperCase()
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E2',
    '#F8B500',
    '#76D7C4',
  ]
  const colorIndex = props.comment.author_name.charCodeAt(0) % colors.length
  const bgColor = colors[colorIndex]

  const svg = `
    <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" fill="${bgColor}"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="32" font-weight="600" font-family="Arial, sans-serif">${initial}</text>
    </svg>
  `

  return 'data:image/svg+xml;base64,' + btoa(svg)
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 30) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
}
</script>

<style scoped>
/* Comment Item - Based on Akina Theme */
.comment {
  margin: 0;
  padding: 0;
  list-style: none;
}

.comment .contents {
  margin-bottom: 20px;
}

/* Comment Avatar */
.comment .profile {
  float: left;
  width: 5%;
  margin-right: 2%;
}

.comment .profile img {
  width: 100%;
  max-width: 50px;
  border-radius: 100%;
  height: 100%;
}

.comment .profile img:hover {
  animation: btn-pudding 1s linear;
}

/* Comment Meta */
.comment .commeta {
  font-family: 'microsoft jhenghei', 'Arial', Sans-Serif;
  font-size: 16px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #ddd;
  overflow: hidden;
  margin-bottom: 5px;
  text-transform: uppercase;
  color: #9499a8;
}

.comment .left {
  float: left;
}

.comment .right {
  float: right;
}

.comment h4 {
  font-family: miranafont, 'Hiragino Sans GB', STXihei, 'Microsoft YaHei', SimSun, sans-serif;
  font-size: 24px;
  margin: 0;
  letter-spacing: 1px;
  line-height: 25px;
}

.comment h4 img {
  display: none;
  border-radius: 100%;
  margin-right: 15px;
  vertical-align: -4px;
  width: 42px;
  height: auto;
}

.comment h4 a {
  color: #696969;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s ease;
}

.comment h4 a:hover {
  color: var(--primary-color, #addac9);
}

.comment .comment-reply-link {
  font-family: 'microsoft jhenghei', 'Arial', Sans-Serif;
  font-size: 14px;
  display: block;
  margin-top: 10px;
  margin-left: 10px;
  float: right;
  text-transform: uppercase;
  color: #9499a8;
  text-decoration: none;
  transition: color 0.3s ease;
}

.comment .comment-reply-link:hover {
  color: #606576;
}

.comment .info {
  margin-top: 10.5px;
  font-size: 12px;
  letter-spacing: 1px;
  font-family: microsoft yahei light;
  color: #dadada;
}

/* Comment Body */
.comment .body {
  font-family: miranafont, 'Hiragino Sans GB', 'Microsoft YaHei', SimSun, sans-serif;
  font-size: 16px;
  line-height: 32px;
  color: #63686d;
}

.comment .body p {
  font-family: miranafont, 'Hiragino Sans GB', 'Microsoft YaHei', SimSun, sans-serif;
  font-size: 14px;
  line-height: 32px;
  color: #63686d;
  letter-spacing: 1px;
  margin: 0;
}

.comment .body > *:last-child {
  margin-bottom: 0;
  margin-left: 60px;
}

.comment .body :deep(p) {
  margin-left: 60px;
}

/* @ 提及样式 */
a.cute.atreply {
  color: #4da05f;
  text-decoration: none;
}

/* Children Comments - Akina Style */
div.children {
  margin: 0;
  padding: 0;
}

div.children ol {
  padding: 0 !important;
  list-style: none;
  margin: 0;
}

/* 子评论头像 */
.comment .children .profile {
  float: left;
  width: 5%;
}

.comment .children .profile img {
  height: 41px;
  width: 41px;
}

.comment .children h4 img {
  width: 32px;
}

/* Animations */
@keyframes btn-pudding {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(0.9);
  }
  50% {
    transform: scale(1.1);
  }
  75% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

/* Responsive */
@media (max-width: 880px) {
  .comment .body > *:last-child,
  .comment .body :deep(p) {
    margin-left: 0px;
  }

  .comment .profile {
    display: none;
  }

  .comment h4 img {
    display: inline-block;
  }
}

@media (max-width: 580px) {
  .comment .body p {
    font-size: 15px;
    line-height: 30px;
  }
}

@media (max-width: 530px) {
  .comment .info {
    display: none;
  }
}

@media (max-width: 375px) {
  .comment .body p {
    line-height: 26px;
  }
}
</style>
