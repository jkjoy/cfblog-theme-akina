import { ref } from 'vue'
import type { CategoryResponse, TagResponse } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

// 缓存
const categoriesCache = ref<Map<number, CategoryResponse>>(new Map())
const tagsCache = ref<Map<number, TagResponse>>(new Map())

/**
 * 获取分类详情
 */
export async function getCategoryDetails(categoryId: number): Promise<CategoryResponse | null> {
  // 检查缓存
  if (categoriesCache.value.has(categoryId)) {
    return categoriesCache.value.get(categoryId)!
  }

  try {
    const response = await fetch(`${API_BASE_URL}/wp-json/wp/v2/categories/${categoryId}`)
    if (!response.ok) {
      return null
    }
    const category = await response.json()
    categoriesCache.value.set(categoryId, category)
    return category
  } catch (error) {
    console.error('Failed to fetch category:', error)
    return null
  }
}

/**
 * 批量获取分类详情
 */
export async function getCategoriesDetails(categoryIds: number[]): Promise<CategoryResponse[]> {
  const results = await Promise.all(categoryIds.map((id) => getCategoryDetails(id)))
  return results.filter((cat) => cat !== null) as CategoryResponse[]
}

/**
 * 获取标签详情
 */
export async function getTagDetails(tagId: number): Promise<TagResponse | null> {
  // 检查缓存
  if (tagsCache.value.has(tagId)) {
    return tagsCache.value.get(tagId)!
  }

  try {
    const response = await fetch(`${API_BASE_URL}/wp-json/wp/v2/tags/${tagId}`)
    if (!response.ok) {
      return null
    }
    const tag = await response.json()
    tagsCache.value.set(tagId, tag)
    return tag
  } catch (error) {
    console.error('Failed to fetch tag:', error)
    return null
  }
}

/**
 * 批量获取标签详情
 */
export async function getTagsDetails(tagIds: number[]): Promise<TagResponse[]> {
  const results = await Promise.all(tagIds.map((id) => getTagDetails(id)))
  return results.filter((tag) => tag !== null) as TagResponse[]
}

/**
 * 清除缓存
 */
export function clearTaxonomyCache() {
  categoriesCache.value.clear()
  tagsCache.value.clear()
}
