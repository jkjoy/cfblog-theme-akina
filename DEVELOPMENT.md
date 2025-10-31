# CFBlog 前端开发文档

## 项目概述

基于 Vue 3 + TypeScript + Vite 构建的现代化博客前端应用，配合 Cloudflare Workers 后端使用。

## 新增功能清单

### 1. 文章分页功能 ✅

**文件位置**:
- `frontend/src/components/Pagination.vue` - 分页组件
- `frontend/src/views/HomeView.vue` - 集成分页功能

**功能特点**:
- 智能页码显示（大量页面时使用省略号）
- 响应式设计，移动端友好
- 平滑的页面切换动画
- 自动滚动到页面顶部

**使用方式**:
```vue
<Pagination
  :current-page="currentPage"
  :total-pages="totalPages"
  @page-change="handlePageChange"
/>
```

---

### 2. 文章评论系统 ✅

**文件位置**:
- `frontend/src/components/CommentSection.vue` - 评论组件
- `frontend/src/views/PostDetailView.vue` - 文章详情页集成

**功能特点**:
- 评论列表展示
- 评论发表表单
- 回复功能
- 评论时间人性化显示
- 骨架屏加载效果

**使用方式**:
```vue
<CommentSection :post-id="post.id" />
```

---

### 3. 骨架屏加载效果 ✅

**文件位置**:
- `frontend/src/components/SkeletonLoader.vue` - 骨架屏组件

**功能特点**:
- 多种骨架屏类型（文章卡片、文章详情、列表项、文本）
- 流光动画效果
- 完全自定义支持

**骨架屏类型**:
- `post-card` - 文章卡片骨架屏
- `post-detail` - 文章详情骨架屏
- `list-item` - 列表项骨架屏
- `text` - 文本骨架屏
- `custom` - 自定义骨架屏

**使用方式**:
```vue
<!-- 文章卡片骨架屏 -->
<SkeletonLoader type="post-card" />

<!-- 文章详情骨架屏 -->
<SkeletonLoader type="post-detail" />

<!-- 列表项骨架屏 -->
<SkeletonLoader type="list-item" />
```

---

### 4. 图片懒加载 ✅

**文件位置**:
- `frontend/src/directives/lazy.ts` - 懒加载指令
- `frontend/src/directives/index.ts` - 指令导出
- `frontend/src/assets/lazy.css` - 懒加载样式

**功能特点**:
- 基于 Intersection Observer API
- 自动占位图
- 加载失败处理
- 渐进式加载动画
- 提前加载（rootMargin: 50px）

**使用方式**:
```vue
<!-- 基本使用 -->
<img v-lazy="imageUrl" alt="图片描述" />

<!-- 自定义占位图 -->
<img v-lazy:customPlaceholder="imageUrl" alt="图片描述" />
```

---

### 5. SEO 优化 ✅

**文件位置**:
- `frontend/src/composables/useSEO.ts` - SEO 管理工具
- `frontend/index.html` - 基础 meta 标签
- `frontend/public/robots.txt` - 搜索引擎爬虫配置

**功能特点**:
- 动态 meta 标签管理
- Open Graph 支持（Facebook 分享）
- Twitter Card 支持
- 结构化数据（JSON-LD）
- 文章特定的 SEO 优化

**SEO 功能**:
1. **Meta 标签管理**
   - 页面标题
   - 描述
   - 关键词
   - 作者信息

2. **Open Graph 标签**
   - og:title
   - og:description
   - og:type
   - og:image
   - og:url
   - og:site_name

3. **Twitter Card**
   - twitter:card
   - twitter:title
   - twitter:description
   - twitter:image

4. **结构化数据**
   - 文章结构化数据
   - 面包屑导航
   - 组织信息

**使用方式**:
```typescript
// 页面级 SEO
import { useSEO } from '@/composables/useSEO'

useSEO({
  title: '页面标题',
  description: '页面描述',
  keywords: '关键词1, 关键词2',
  type: 'website',
})

// 文章页 SEO（带结构化数据）
import { useSEO, useStructuredData } from '@/composables/useSEO'

const { updateMeta } = useSEO()
const { setArticleStructuredData } = useStructuredData()

// 更新 meta 标签
updateMeta({
  title: '文章标题',
  description: '文章摘要',
  type: 'article',
  publishedTime: '2024-01-01',
  modifiedTime: '2024-01-02',
})

// 添加结构化数据
setArticleStructuredData({
  headline: '文章标题',
  description: '文章描述',
  datePublished: '2024-01-01',
  author: '作者名',
  publisher: { name: 'CFBlog' },
})
```

---

## 项目结构

```
frontend/
├── public/
│   └── robots.txt              # 搜索引擎爬虫配置
├── src/
│   ├── assets/
│   │   ├── main.css
│   │   └── lazy.css            # 懒加载样式
│   ├── components/
│   │   ├── Pagination.vue      # 分页组件
│   │   ├── SkeletonLoader.vue  # 骨架屏组件
│   │   ├── CommentSection.vue  # 评论组件
│   │   ├── PostCard.vue
│   │   └── LoadingSpinner.vue
│   ├── composables/
│   │   └── useSEO.ts           # SEO 工具
│   ├── directives/
│   │   ├── lazy.ts             # 懒加载指令
│   │   └── index.ts            # 指令导出
│   ├── views/
│   │   ├── HomeView.vue        # 首页（已更新）
│   │   ├── PostDetailView.vue  # 文章详情（已更新）
│   │   ├── CategoriesView.vue
│   │   ├── TagsView.vue
│   │   ├── SearchView.vue
│   │   └── AboutView.vue
│   ├── router/
│   │   └── index.ts
│   ├── types.ts
│   └── main.ts                 # 注册指令
├── index.html                  # SEO meta 标签
├── package.json
└── vite.config.ts
```

---

## 使用指南

### 安装依赖

```bash
cd frontend
npm install
```

### 开发环境

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 类型检查

```bash
npm run type-check
```

### 代码格式化

```bash
npm run format
npm run lint
```

---

## 环境变量配置

创建 `.env` 文件（参考 `.env.example`）:

```bash
# API Base URL
VITE_API_URL=http://localhost:8787
```

---

## 性能优化

### 1. 图片懒加载
- 减少首屏加载时间
- 提升页面性能
- 节省带宽

### 2. 骨架屏
- 改善用户体验
- 减少感知加载时间
- 避免布局抖动

### 3. 分页
- 减少单次数据加载量
- 提升页面响应速度

### 4. 代码分割
- 路由级别的懒加载
- 按需加载组件

---

## SEO 最佳实践

### 1. Meta 标签
- 每个页面都有唯一的 title 和 description
- 文章页面包含 og:image
- 使用合适的 keywords

### 2. 结构化数据
- 文章页面添加 Article schema
- 添加面包屑导航
- 包含组织信息

### 3. robots.txt
- 配置允许和禁止爬取的路径
- 指定 sitemap 位置

### 4. 语义化 HTML
- 使用正确的 HTML5 标签
- 保持良好的层级结构

---

## 浏览器兼容性

- Chrome/Edge (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- 移动端浏览器

### Intersection Observer 支持
- Chrome 51+
- Firefox 55+
- Safari 12.1+
- Edge 15+

---

## 技术栈

- **框架**: Vue 3.5+
- **语言**: TypeScript 5.9+
- **构建工具**: Vite 7.1+
- **路由**: Vue Router 4.6+
- **状态管理**: Pinia 3.0+
- **样式**: CSS3 + Scoped Styles

---

## 下一步开发建议

### 功能增强
1. 用户认证系统
2. 文章收藏功能
3. 文章点赞功能
4. 社交分享优化
5. 深色模式
6. 多语言支持
7. PWA 支持
8. 离线缓存

### 性能优化
1. Service Worker
2. 图片压缩
3. CDN 集成
4. Gzip/Brotli 压缩
5. 关键 CSS 内联

### SEO 优化
1. 动态 sitemap 生成
2. 结构化数据扩展
3. 预渲染
4. SSR/SSG 支持

---

## 常见问题

### Q: 如何修改 API 地址？
A: 在项目根目录创建 `.env` 文件，设置 `VITE_API_URL`

### Q: 懒加载不工作？
A: 确保浏览器支持 Intersection Observer API，或添加 polyfill

### Q: SEO meta 标签不更新？
A: 检查路由配置，确保组件正确使用了 `useSEO` composable

### Q: 评论无法提交？
A: 检查后端 API 是否正确配置了评论端点

---

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request

---

## 许可证

MIT License

---

## 联系方式

如有问题或建议，请提交 Issue。
