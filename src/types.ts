export interface PostResponse {
  id: number
  date: string
  date_gmt: string
  modified: string
  modified_gmt: string
  slug: string
  status: string
  type: string
  link: string
  title: {
    rendered: string
  }
  content: {
    rendered: string
    protected: boolean
  }
  excerpt: {
    rendered: string
    protected: boolean
  }
  author: number
  featured_media: number
  featured_image_url?: string
  comment_status: string
  ping_status: string
  sticky: boolean
  template: string
  format: string
  meta: any[]
  categories: number[]
  tags: number[]
  comment_count?: number
  view_count?: number
  _links: any
}

export interface CategoryResponse {
  id: number
  count: number
  description: string
  link: string
  name: string
  slug: string
  taxonomy: string
  parent: number
  _links: any
}

export interface TagResponse {
  id: number
  count: number
  description: string
  link: string
  name: string
  slug: string
  taxonomy: string
  _links: any
}

export interface UserResponse {
  id: number
  name: string
  url: string
  description: string
  link: string
  slug: string
  avatar_urls: Record<number, string>
  roles?: string[]
  role?: string
  email?: string
  registered_date?: string
  meta: any[]
  _links: any
}