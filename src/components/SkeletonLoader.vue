<template>
  <div class="skeleton" :class="[`skeleton-${type}`, { animated }]">
    <!-- Post Card Skeleton -->
    <div v-if="type === 'post-card'" class="skeleton-post-card">
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-excerpt">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
        <div class="skeleton-meta">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-text short"></div>
        </div>
      </div>
    </div>

    <!-- Post Detail Skeleton -->
    <div v-else-if="type === 'post-detail'" class="skeleton-post-detail">
      <div class="skeleton-title large"></div>
      <div class="skeleton-meta-bar">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text short"></div>
      </div>
      <div class="skeleton-featured-image"></div>
      <div class="skeleton-content-block">
        <div v-for="i in 8" :key="i" class="skeleton-line" :class="{ short: i % 4 === 0 }"></div>
      </div>
    </div>

    <!-- List Item Skeleton -->
    <div v-else-if="type === 'list-item'" class="skeleton-list-item">
      <div class="skeleton-avatar"></div>
      <div class="skeleton-list-content">
        <div class="skeleton-text"></div>
        <div class="skeleton-text short"></div>
      </div>
    </div>

    <!-- Text Skeleton -->
    <div v-else-if="type === 'text'" class="skeleton-text" :class="size"></div>

    <!-- Custom Skeleton -->
    <div v-else class="skeleton-custom">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'post-card' | 'post-detail' | 'list-item' | 'text' | 'custom'
  size?: 'small' | 'medium' | 'large'
  animated?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'post-card',
  size: 'medium',
  animated: true,
})
</script>

<style scoped>
.skeleton {
  width: 100%;
}

.skeleton.animated .skeleton-image,
.skeleton.animated .skeleton-title,
.skeleton.animated .skeleton-text,
.skeleton.animated .skeleton-line,
.skeleton.animated .skeleton-avatar,
.skeleton.animated .skeleton-featured-image {
  position: relative;
  overflow: hidden;
}

.skeleton.animated .skeleton-image::after,
.skeleton.animated .skeleton-title::after,
.skeleton.animated .skeleton-text::after,
.skeleton.animated .skeleton-line::after,
.skeleton.animated .skeleton-avatar::after,
.skeleton.animated .skeleton-featured-image::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: shimmer 1.5s infinite;
  transform: translateX(-100%);
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

/* Post Card Skeleton */
.skeleton-post-card {
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.skeleton-image {
  width: 100%;
  height: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
}

.skeleton-content {
  padding: 1.5rem;
}

.skeleton-title {
  height: 1.5rem;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  border-radius: 0.25rem;
  margin-bottom: 1rem;
}

.skeleton-title.large {
  height: 2.5rem;
  margin-bottom: 1.5rem;
}

.skeleton-excerpt {
  margin-bottom: 1rem;
}

.skeleton-line {
  height: 1rem;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
}

.skeleton-line.short {
  width: 70%;
}

.skeleton-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.skeleton-meta-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.skeleton-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  flex-shrink: 0;
}

.skeleton-text {
  height: 1rem;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  border-radius: 0.25rem;
  flex: 1;
}

.skeleton-text.short {
  width: 100px;
  flex: none;
}

.skeleton-text.small {
  width: 100px;
  height: 0.875rem;
}

.skeleton-text.medium {
  width: 200px;
  height: 1rem;
}

.skeleton-text.large {
  width: 300px;
  height: 1.25rem;
}

/* Post Detail Skeleton */
.skeleton-post-detail {
  background: white;
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.skeleton-featured-image {
  width: 100%;
  height: 400px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  border-radius: 0.5rem;
  margin-bottom: 2rem;
}

.skeleton-content-block {
  margin-top: 2rem;
}

/* List Item Skeleton */
.skeleton-list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.skeleton-list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .skeleton-image {
    height: 150px;
  }

  .skeleton-featured-image {
    height: 250px;
  }

  .skeleton-post-detail {
    padding: 1rem;
  }
}
</style>
