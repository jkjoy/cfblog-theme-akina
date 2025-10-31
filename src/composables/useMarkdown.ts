import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

// 初始化 markdown-it
const md: MarkdownIt = new MarkdownIt({
  html: true, // 允许HTML标签
  linkify: true, // 自动转换URL为链接
  typographer: true, // 启用一些语言中立的替换和引号美化
  highlight: function (str: string, lang: string): string {
    // 代码高亮
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
        )
      } catch (__) {
        // 忽略错误
      }
    }

    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  },
})

/**
 * 渲染 Markdown 为 HTML
 * @param markdown Markdown 文本
 * @returns 渲染后的 HTML
 */
export function renderMarkdown(markdown: string): string {
  if (!markdown) return ''
  return md.render(markdown)
}

/**
 * useMarkdown composable
 */
export function useMarkdown() {
  return {
    renderMarkdown,
  }
}
