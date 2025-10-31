<template>
  <div v-if="totalPages > 1" class="pagination">
    <button
      class="pagination-button"
      :disabled="currentPage === 1"
      @click="$emit('page-change', currentPage - 1)"
    >
      <span class="arrow">‹</span>
      <span class="text">上一页</span>
    </button>

    <div class="pagination-pages">
      <button
        v-for="page in displayPages"
        :key="page"
        class="pagination-page"
        :class="{ active: page === currentPage, ellipsis: page === '...' }"
        :disabled="page === '...'"
        @click="page !== '...' && $emit('page-change', page as number)"
      >
        {{ page }}
      </button>
    </div>

    <button
      class="pagination-button"
      :disabled="currentPage === totalPages"
      @click="$emit('page-change', currentPage + 1)"
    >
      <span class="text">下一页</span>
      <span class="arrow">›</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentPage: number
  totalPages: number
  maxVisiblePages?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxVisiblePages: 7,
})

defineEmits<{
  'page-change': [page: number]
}>()

const displayPages = computed(() => {
  const pages: (number | string)[] = []
  const { currentPage, totalPages, maxVisiblePages } = props

  if (totalPages <= maxVisiblePages) {
    // 如果总页数小于最大显示页数，显示所有页码
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // 始终显示第一页
    pages.push(1)

    // 计算当前页附近应该显示的页码
    let startPage = Math.max(2, currentPage - 1)
    let endPage = Math.min(totalPages - 1, currentPage + 1)

    // 如果当前页靠近开始
    if (currentPage <= 3) {
      endPage = Math.min(maxVisiblePages - 2, totalPages - 1)
    }

    // 如果当前页靠近结束
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(2, totalPages - maxVisiblePages + 3)
    }

    // 添加左侧省略号
    if (startPage > 2) {
      pages.push('...')
    }

    // 添加中间页码
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    // 添加右侧省略号
    if (endPage < totalPages - 1) {
      pages.push('...')
    }

    // 始终显示最后一页
    pages.push(totalPages)
  }

  return pages
})
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.pagination-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  color: var(--primary-color);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-button:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(160, 218, 208, 0.3);
}

.pagination-button:disabled {
  background: #f8f9fa;
  color: #adb5bd;
  cursor: not-allowed;
  border-color: #dee2e6;
}

.pagination-button .arrow {
  font-size: 1.25rem;
  line-height: 1;
}

.pagination-pages {
  display: flex;
  gap: 0.25rem;
}

.pagination-page {
  min-width: 2.5rem;
  height: 2.5rem;
  padding: 0.5rem;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  color: #495057;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-page:hover:not(:disabled):not(.active):not(.ellipsis) {
  background: #f8f9fa;
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.pagination-page.active {
  background: linear-gradient(135deg, var(--primary-color) 0%, #72C5A6 100%);
  color: white;
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(160, 218, 208, 0.3);
}

.pagination-page.ellipsis {
  cursor: default;
  border-color: transparent;
  color: #adb5bd;
}

.pagination-page.ellipsis:hover {
  background: white;
}

@media (max-width: 768px) {
  .pagination {
    gap: 0.25rem;
  }

  .pagination-button .text {
    display: none;
  }

  .pagination-button {
    padding: 0.5rem;
    min-width: 2.5rem;
    justify-content: center;
  }

  .pagination-page {
    min-width: 2rem;
    height: 2rem;
    padding: 0.25rem;
    font-size: 0.8rem;
  }
}
</style>
