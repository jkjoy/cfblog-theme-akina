import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSiteSettings, clearSettingsCache, type SiteSettings } from '../services/settings'

export const useSettingsStore = defineStore('settings', () => {
  // State
  const settings = ref<SiteSettings>({
    site_title: 'CFBlog',
    site_description: '基于 Cloudflare Workers + D1 + R2 构建的现代化博客系统',
    site_keywords: 'blog, cloudflare, workers, vue3, typescript',
    site_author: 'CFBlog',
    site_favicon: '',
    site_logo: '',
    site_icp: '',
    site_footer_text: '© 2024 CFBlog. Powered by Cloudflare Workers.',
  })

  const isLoaded = ref(false)
  const isLoading = ref(false)

  // Actions
  async function loadSettings() {
    if (isLoading.value) return

    isLoading.value = true
    try {
      const data = await getSiteSettings()
      settings.value = data
      isLoaded.value = true

      // 更新页面信息
      updatePageInfo()
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      isLoading.value = false
    }
  }

  function updatePageInfo() {
    // 更新页面标题
    if (settings.value.site_title) {
      document.title = settings.value.site_title
    }

    // 更新 favicon
    if (settings.value.site_favicon) {
      updateFavicon(settings.value.site_favicon)
    }

    // 更新 meta 描述
    if (settings.value.site_description) {
      updateMetaTag('description', settings.value.site_description)
    }

    // 更新 meta keywords
    if (settings.value.site_keywords) {
      updateMetaTag('keywords', settings.value.site_keywords)
    }

    // 更新 meta author
    if (settings.value.site_author) {
      updateMetaTag('author', settings.value.site_author)
    }
  }

  function updateFavicon(url: string) {
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']")
    if (!link) {
      link = document.createElement('link')
      link.type = 'image/x-icon'
      link.rel = 'shortcut icon'
      const head = document.getElementsByTagName('head')[0]
      if (head) {
        head.appendChild(link)
      }
    }
    link.href = url
  }

  function updateMetaTag(name: string, content: string) {
    let meta = document.querySelector(`meta[name="${name}"]`)
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', name)
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', content)
  }

  async function refreshSettings() {
    clearSettingsCache()
    isLoaded.value = false
    await loadSettings()
  }

  return {
    // State
    settings,
    isLoaded,
    isLoading,
    // Actions
    loadSettings,
    updatePageInfo,
    refreshSettings,
  }
})
