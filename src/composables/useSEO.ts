import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from '../stores/settings'

export interface SEOMetaInfo {
  title?: string
  description?: string
  keywords?: string
  author?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'blog'
  siteName?: string
  locale?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  twitterSite?: string
  twitterCreator?: string
}

/**
 * SEO Meta 标签管理
 */
export function useSEO(metaInfo: SEOMetaInfo = {}) {
  const route = useRoute()
  const settingsStore = useSettingsStore()

  // 使用系统设置作为默认值
  const getDefaultMeta = (): SEOMetaInfo => ({
    title: settingsStore.settings.site_title || 'CFBlog',
    description:
      settingsStore.settings.site_description ||
      '基于 Cloudflare Workers + D1 + R2 构建的现代化博客系统',
    keywords: settingsStore.settings.site_keywords || 'blog, cloudflare, workers, vue3, typescript',
    author: settingsStore.settings.site_author || 'CFBlog',
    siteName: settingsStore.settings.site_title || 'CFBlog',
    locale: 'zh_CN',
    type: 'website',
    twitterCard: 'summary_large_image',
  })

  const meta = { ...getDefaultMeta(), ...metaInfo }

  // 设置页面标题
  const setTitle = (title: string) => {
    document.title = title
  }

  // 创建或更新 meta 标签
  const setMetaTag = (name: string, content: string, property?: boolean) => {
    if (!content) return

    const attr = property ? 'property' : 'name'
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`

    let element = document.querySelector(selector) as HTMLMetaElement

    if (!element) {
      element = document.createElement('meta')
      element.setAttribute(attr, name)
      document.head.appendChild(element)
    }

    element.setAttribute('content', content)
  }

  // 移除 meta 标签
  const removeMetaTag = (name: string, property?: boolean) => {
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
    const element = document.querySelector(selector)
    if (element) {
      element.remove()
    }
  }

  // 设置 link 标签
  const setLinkTag = (rel: string, href: string) => {
    if (!href) return

    let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement

    if (!element) {
      element = document.createElement('link')
      element.setAttribute('rel', rel)
      document.head.appendChild(element)
    }

    element.setAttribute('href', href)
  }

  // 更新所有 SEO meta 标签
  const updateMeta = (newMeta: SEOMetaInfo = {}) => {
    const currentMeta = { ...meta, ...newMeta }

    // 设置标题
    if (currentMeta.title) {
      setTitle(currentMeta.title)
    }

    // 基本 meta 标签
    setMetaTag('description', currentMeta.description || '')
    setMetaTag('keywords', currentMeta.keywords || '')
    setMetaTag('author', currentMeta.author || '')

    // Open Graph 标签
    setMetaTag('og:title', currentMeta.title || '', true)
    setMetaTag('og:description', currentMeta.description || '', true)
    setMetaTag('og:type', currentMeta.type || 'website', true)
    setMetaTag('og:url', currentMeta.url || window.location.href, true)
    setMetaTag('og:site_name', currentMeta.siteName || '', true)
    setMetaTag('og:locale', currentMeta.locale || '', true)

    if (currentMeta.image) {
      setMetaTag('og:image', currentMeta.image, true)
    }

    // 文章特定的 Open Graph 标签
    if (currentMeta.type === 'article') {
      if (currentMeta.publishedTime) {
        setMetaTag('article:published_time', currentMeta.publishedTime, true)
      }
      if (currentMeta.modifiedTime) {
        setMetaTag('article:modified_time', currentMeta.modifiedTime, true)
      }
      if (currentMeta.section) {
        setMetaTag('article:section', currentMeta.section, true)
      }
      if (currentMeta.tags && currentMeta.tags.length > 0) {
        // 移除旧的标签
        document.querySelectorAll('meta[property="article:tag"]').forEach((el) => el.remove())
        // 添加新的标签
        currentMeta.tags.forEach((tag) => {
          const element = document.createElement('meta')
          element.setAttribute('property', 'article:tag')
          element.setAttribute('content', tag)
          document.head.appendChild(element)
        })
      }
    }

    // Twitter Card 标签
    setMetaTag('twitter:card', currentMeta.twitterCard || 'summary_large_image')
    setMetaTag('twitter:title', currentMeta.title || '')
    setMetaTag('twitter:description', currentMeta.description || '')
    if (currentMeta.twitterSite) {
      setMetaTag('twitter:site', currentMeta.twitterSite)
    }
    if (currentMeta.twitterCreator) {
      setMetaTag('twitter:creator', currentMeta.twitterCreator)
    }
    if (currentMeta.image) {
      setMetaTag('twitter:image', currentMeta.image)
    }

    // Canonical URL
    if (currentMeta.url) {
      setLinkTag('canonical', currentMeta.url)
    }
  }

  // 组件挂载时更新 meta
  onMounted(() => {
    updateMeta(metaInfo)
  })

  // 监听路由变化
  watch(
    () => route?.fullPath,
    (newPath) => {
      if (newPath) {
        // 路由变化时可以重置为默认值或更新URL
        updateMeta({ url: window.location.href })
      }
    }
  )

  // 组件卸载时清理（可选）
  onUnmounted(() => {
    // 如果需要，可以在这里清理某些 meta 标签
  })

  return {
    updateMeta,
    setTitle,
    setMetaTag,
    removeMetaTag,
    setLinkTag,
  }
}

/**
 * 生成结构化数据 (JSON-LD)
 */
export function useStructuredData() {
  const setStructuredData = (data: any) => {
    // 移除旧的结构化数据
    const oldScript = document.querySelector('script[type="application/ld+json"]')
    if (oldScript) {
      oldScript.remove()
    }

    // 添加新的结构化数据
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(data)
    document.head.appendChild(script)
  }

  const setArticleStructuredData = (article: {
    headline: string
    description: string
    image?: string
    datePublished: string
    dateModified?: string
    author: string
    publisher: {
      name: string
      logo?: string
    }
  }) => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.headline,
      description: article.description,
      image: article.image,
      datePublished: article.datePublished,
      dateModified: article.dateModified || article.datePublished,
      author: {
        '@type': 'Person',
        name: article.author,
      },
      publisher: {
        '@type': 'Organization',
        name: article.publisher.name,
        logo: article.publisher.logo
          ? {
              '@type': 'ImageObject',
              url: article.publisher.logo,
            }
          : undefined,
      },
    }

    setStructuredData(structuredData)
  }

  const setBreadcrumbStructuredData = (items: Array<{ name: string; url: string }>) => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    }

    setStructuredData(structuredData)
  }

  return {
    setStructuredData,
    setArticleStructuredData,
    setBreadcrumbStructuredData,
  }
}
