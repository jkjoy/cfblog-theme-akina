// WordPress API 根接口
export interface WPApiRoot {
  name: string
  description: string
  url: string
  home: string
  [key: string]: any
}

// WordPress 用户接口
export interface WPUser {
  id: number
  name: string
  slug: string
  [key: string]: any
}

// 系统设置接口
export interface SiteSettings {
  site_title: string
  site_description: string
  site_keywords: string
  site_author: string
  site_favicon: string
  site_logo: string
  site_icp: string
  site_footer_text: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

// 缓存系统设置
let settingsCache: SiteSettings | null = null
let cacheTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

// 缓存网站基础信息
let siteInfoCache: { name: string; description: string } | null = null
let siteInfoCacheTime = 0

// 缓存用户信息
let userInfoCache: string | null = null
let userInfoCacheTime = 0

// 从 /wp-json 获取网站基础信息（名称和描述）
export async function getSiteInfo(): Promise<{ name: string; description: string }> {
  // 返回缓存数据（如果有效）
  if (siteInfoCache && Date.now() - siteInfoCacheTime < CACHE_DURATION) {
    return siteInfoCache
  }

  try {
    const response = await fetch(`${API_BASE_URL}/wp-json`)

    if (!response.ok) {
      console.warn('Failed to fetch site info from /wp-json')
      return { name: 'CFBlog', description: '' }
    }

    const data: WPApiRoot = await response.json()
    siteInfoCache = {
      name: data.name || 'CFBlog',
      description: data.description || '',
    }
    siteInfoCacheTime = Date.now()

    return siteInfoCache
  } catch (error) {
    console.error('Error fetching site info:', error)
    return { name: 'CFBlog', description: '' }
  }
}

// 从 /wp-json/wp/v2/users/1 获取作者信息
export async function getUserAuthor(): Promise<string> {
  // 返回缓存数据（如果有效）
  if (userInfoCache && Date.now() - userInfoCacheTime < CACHE_DURATION) {
    return userInfoCache
  }

  try {
    const response = await fetch(`${API_BASE_URL}/wp-json/wp/v2/users/1`)

    if (!response.ok) {
      console.warn('Failed to fetch user info from /wp-json/wp/v2/users/1')
      return 'CFBlog'
    }

    const data: WPUser = await response.json()
    userInfoCache = data.name || 'CFBlog'
    userInfoCacheTime = Date.now()

    return userInfoCache
  } catch (error) {
    console.error('Error fetching user info:', error)
    return 'CFBlog'
  }
}

// 获取所有系统设置
export async function getSiteSettings(): Promise<SiteSettings> {
  // 返回缓存数据（如果有效）
  if (settingsCache && Date.now() - cacheTime < CACHE_DURATION) {
    return settingsCache
  }

  try {
    // 获取网站基础信息（名称和描述）
    const siteInfo = await getSiteInfo()

    // 获取作者信息
    const authorName = await getUserAuthor()

    // 尝试获取其他设置
    let additionalSettings = {}
    try {
      const response = await fetch(`${API_BASE_URL}/wp-json/wp/v2/settings`)

      if (response.ok) {
        additionalSettings = await response.json()
      } else {
        console.warn('Failed to fetch additional settings from /wp-json/wp/v2/settings, using defaults')
      }
    } catch (error) {
      console.warn('Error fetching additional settings, using defaults:', error)
    }

    // 合并设置：优先使用从 WordPress API 获取的基础信息
    const settings: SiteSettings = {
      ...getDefaultSettings(siteInfo.name, siteInfo.description, authorName),
      ...additionalSettings,
      site_title: siteInfo.name,
      site_description: siteInfo.description,
      site_author: authorName,
    }

    settingsCache = settings
    cacheTime = Date.now()

    return settings
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return getDefaultSettings()
  }
}

// 获取单个设置
export async function getSiteSetting(key: keyof SiteSettings): Promise<string> {
  const settings = await getSiteSettings()
  return settings[key] || ''
}

// 更新系统设置（管理员功能）
export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/wp-json/wp/v2/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    })

    if (response.ok) {
      // 清除缓存
      settingsCache = null
      return true
    }

    return false
  } catch (error) {
    console.error('Error updating site settings:', error)
    return false
  }
}

// 清除缓存（强制重新加载）
export function clearSettingsCache() {
  settingsCache = null
  cacheTime = 0
  siteInfoCache = null
  siteInfoCacheTime = 0
  userInfoCache = null
  userInfoCacheTime = 0
}

// 默认设置
function getDefaultSettings(
  siteName?: string,
  siteDescription?: string,
  siteAuthor?: string,
): SiteSettings {
  return {
    site_title: siteName || 'CFBlog',
    site_description:
      siteDescription || '基于 Cloudflare Workers + D1 + R2 构建的现代化博客系统',
    site_keywords: 'blog, cloudflare, workers, vue3, typescript',
    site_author: siteAuthor || 'CFBlog',
    site_favicon: '',
    site_logo: '',
    site_icp: '',
    site_footer_text: '© 2024 CFBlog. Powered by Cloudflare Workers.',
  }
}
