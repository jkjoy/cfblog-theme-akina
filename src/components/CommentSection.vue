<template>
  <section class="comments">
    <div class="comments-main">
      <h3 id="comments-list-title">
        Comments | <span class="noticom">{{ totalComments }}</span> 条评论
      </h3>

      <!-- 评论列表 -->
      <div v-if="loading" class="comments-loading">
        <SkeletonLoader v-for="i in 3" :key="i" type="list-item" />
      </div>

      <ol v-else-if="comments.length > 0" class="comment-list">
        <CommentItem
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          @reply="handleReply"
        />
      </ol>

      <div v-else class="no-comments">
        <div class="notification">
          <i class="iconfont">💬</i>还没有评论，快来抢沙发吧！
        </div>
      </div>

      <!-- 评论表单 -->
      <div id="respond_box">
        <div class="comment-respond">
          <div v-if="replyingTo" class="cancel-comment-reply">
            <a @click.prevent="cancelReply" class="cancel-reply-link">取消回复</a>
          </div>

          <form @submit.prevent="handleSubmit" id="commentform">
            <div v-if="replyingTo" class="author-updown">
              回复给 {{ replyingTo.author_name }}
            </div>

            <div id="comment-author-info">
              <input
                v-model="formData.authorName"
                type="text"
                name="author"
                id="author"
                class="commenttext"
                placeholder="Name"
                required
              />

              <input
                v-model="formData.authorEmail"
                type="email"
                name="mail"
                id="mail"
                class="commenttext"
                placeholder="Email"
                required
              />

              <input
                v-model="formData.authorUrl"
                type="text"
                name="url"
                id="url"
                class="commenttext"
                placeholder="http://"
              />
            </div>

            <div class="clear"></div>

            <p>
              <textarea
                v-model="formData.content"
                name="text"
                id="comment"
                class="commenttext"
                placeholder="来发表一下你的看法吧..."
                cols="50"
                rows="5"
                required
              ></textarea>
            </p>

            <div class="com-footer">
              <input
                class="submit"
                type="submit"
                id="submit"
                :value="submitting ? '提交中...' : '发表评论'"
                :disabled="submitting"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import SkeletonLoader from './SkeletonLoader.vue'
import CommentItem from './CommentItem.vue'

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
  postId: number
}

const props = defineProps<Props>()

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

const comments = ref<Comment[]>([])
const loading = ref(false)
const submitting = ref(false)
const replyingTo = ref<Comment | null>(null)
const formData = ref({
  authorName: '',
  authorEmail: '',
  authorUrl: '',
  content: '',
})

// 计算总评论数（包括子评论）
const totalComments = computed(() => {
  const countComments = (commentsList: Comment[]): number => {
    return commentsList.reduce((total, comment) => {
      return total + 1 + (comment.children ? countComments(comment.children) : 0)
    }, 0)
  }
  return countComments(comments.value)
})

// 构建评论嵌套结构
const buildCommentTree = (flatComments: Comment[]): Comment[] => {
  const commentMap = new Map<number, Comment>()
  const rootComments: Comment[] = []

  // 首先创建所有评论的映射
  flatComments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, children: [] })
  })

  // 然后构建树形结构
  flatComments.forEach(comment => {
    const commentWithChildren = commentMap.get(comment.id)!

    if (comment.parent === 0) {
      // 根评论（没有父评论）
      rootComments.push(commentWithChildren)
    } else {
      // 子评论，添加到父评论的children数组
      const parent = commentMap.get(comment.parent)
      if (parent) {
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(commentWithChildren)
      } else {
        // 如果找不到父评论，作为根评论处理
        rootComments.push(commentWithChildren)
      }
    }
  })

  return rootComments
}

const fetchComments = async () => {
  loading.value = true

  try {
    const response = await fetch(
      `${API_BASE_URL}/wp-json/wp/v2/comments?post=${props.postId}&per_page=100`
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    // 构建嵌套结构
    comments.value = buildCommentTree(data)
  } catch (err) {
    console.error('获取评论失败:', err)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  submitting.value = true

  try {
    const response = await fetch(`${API_BASE_URL}/wp-json/wp/v2/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post: props.postId,
        author_name: formData.value.authorName,
        author_email: formData.value.authorEmail,
        author_url: formData.value.authorUrl || '',
        content: formData.value.content,
        parent: replyingTo.value?.id || 0,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.message || '评论提交失败'
      throw new Error(errorMessage)
    }

    // 重置表单
    formData.value = {
      authorName: '',
      authorEmail: '',
      authorUrl: '',
      content: '',
    }
    replyingTo.value = null

    // 重新获取评论（无需提示，直接刷新）
    await fetchComments()
  } catch (err) {
    console.error('提交评论失败:', err)
    const errorMessage = err instanceof Error ? err.message : '评论提交失败，请稍后重试'
    alert(errorMessage)
  } finally {
    submitting.value = false
  }
}

const handleReply = (comment: Comment) => {
  replyingTo.value = comment
  // 滚动到评论表单
  const formElement = document.querySelector('.comment-form-container')
  if (formElement) {
    formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const cancelReply = () => {
  replyingTo.value = null
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

onMounted(() => {
  fetchComments()
})
</script>

<style scoped>
/* Comments Section - Akina Style */
.comments {
  clear: both;
  overflow: hidden;
  width: 100%;
  padding: 50px 0;
  list-style: none;
  background: white;
}

.comments-main {
  max-width: 860px;
  margin: 0 auto;
  padding: 0;
  overflow: hidden;
}

/* Comments Header */
h3#comments-list-title {
  font-family: miranafont, 'Hiragino Sans GB', 'Microsoft YaHei', SimSun, sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #ddd;
}

h3#comments-list-title .noticom {
  color: var(--accent-color);
  font-weight: 600;
}

/* Comments List */
.comment-list {
  margin: 0 auto 40px;
  padding: 0;
  list-style: none;
  font-family: microsoft yahei;
}

/* Comment list container - individual comment styles are in CommentItem.vue */

/* 子评论嵌套偏移 - Akina风格 */
/* 匹配嵌套的comment-list（子评论列表） */
/* 使用 :deep() 穿透到子组件 */
.comment-list :deep(.children .comment-list .comment_body) {
  padding-left: 65px;
}

/* No Comments */
.no-comments {
  text-align: center;
  padding: 30px 0;
}

.notification {
  padding: 17px 32px 15px;
  background: #ffffff;
  color: #6f6f6f;
  font-family: microsoft yahei;
  width: auto;
  display: inline-block;
  margin: 0 auto;
  border: 1px solid #c7c7c7;
  border-radius: 5px;
}

.notification i {
  margin-right: 10px;
}

/* Comment Form */
#respond_box {
  margin-top: 40px;
}

.comment-respond {
  width: 100%;
  max-width: 860px;
  margin: 0 auto;
  padding: 0;
}

.cancel-comment-reply {
  margin-bottom: 20px;
  text-align: right;
}

.cancel-reply-link {
  float: right;
  background: #f4f6f8;
  border-radius: 3px;
  padding: 12px 25px;
  font-size: 12px;
  color: #454545;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.3s ease;
}

.cancel-reply-link:hover {
  background: #e9ecef;
}

.author-updown {
  margin-top: 30px;
  margin-bottom: 20px;
  font-family: miranafont, 'Hiragino Sans GB', 'Microsoft YaHei', SimSun, sans-serif;
  color: var(--primary-color);
  font-size: 15px;
}

#comment-author-info {
  display: block;
  margin-bottom: 20px;
}

#commentform .commenttext {
  font-family: miranafont, 'Hiragino Sans GB', STXihei, 'Microsoft YaHei', SimSun, sans-serif;
  font-size: 14px;
  float: left;
  width: 31.5%;
  margin: 0;
  padding: 16px 25px 15px;
  color: #535a63;
  border: 2px solid #dde6ea;
  border-radius: 5px;
  background: #ffffff;
  outline: none;
  transition: border-color 0.3s ease;
}

#commentform input.commenttext {
  margin-right: 3%;
}

#commentform input.commenttext:last-of-type {
  margin-right: 0;
  width: 31%;
}

#commentform input.commenttext:focus {
  border-color: var(--primary-color);
}

.clear {
  clear: both;
}

#commentform textarea.commenttext {
  display: block;
  float: none;
  width: 100%;
  height: 180px;
  margin-bottom: 40px;
  margin-top: 20px;
  color: #535a63;
  border: 2px solid #dde6ea;
  border-radius: 5px;
  padding: 16px 25px 15px;
  resize: vertical;
}

#commentform textarea.commenttext:focus {
  border-color: var(--primary-color);
}

.com-footer {
  position: relative;
  display: inline-block;
  width: 100%;
}

#commentform input.submit {
  width: auto;
  margin: 0;
  padding: 15px 35px;
  text-transform: uppercase;
  color: #fff;
  background: var(--primary-color);
  border: 0;
  border-radius: 5px;
  text-shadow: none;
  box-shadow: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

#commentform input.submit:hover:not(:disabled) {
  background: #dde6ea;
  animation: btn-pudding 1s linear;
}

#commentform input.submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

/* Loading */
.comments-loading {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

/* Responsive */
@media (max-width: 1080px) {
  .comments-main {
    width: 100%;
    padding: 0 6.39%;
    max-width: 1245px;
  }

  .comment-respond {
    width: 100%;
    padding: 0 6.39%;
    max-width: 1245px;
  }
}

@media (max-width: 880px) {
  .comment-list :deep(.children .comment-list .comment_body) {
    padding-left: 35px;
  }
}

@media (max-width: 625px) {
  #commentform .commenttext {
    width: 100% !important;
    margin-bottom: 15px;
    margin-right: 0 !important;
  }

  #commentform input.commenttext:last-of-type {
    width: 100% !important;
  }

  #commentform textarea.commenttext {
    margin-top: 15px;
  }
}
</style>
