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

// 为外部链接添加 target 和 rel 属性，确保新窗口打开且安全
const defaultLinkOpen =
  md.renderer.rules.link_open ||
  function (tokens, idx, options, _env, self) {
    return self.renderToken(tokens, idx, options)
  }

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const hrefIndex = tokens[idx].attrIndex('href')
  if (hrefIndex >= 0) {
    const href = (tokens[idx].attrs?.[hrefIndex]?.[1] || '').trim()
    const isExternal = /^https?:\/\//i.test(href)
    const isAnchor = href.startsWith('#')

    if (isExternal && !isAnchor) {
      // 如果未显式设置 target，则在新窗口打开
      const targetIndex = tokens[idx].attrIndex('target')
      if (targetIndex < 0) {
        tokens[idx].attrSet('target', '_blank')
      }

      // 附加安全属性，避免重复
      const relIndex = tokens[idx].attrIndex('rel')
      let relVal = relIndex >= 0 ? tokens[idx].attrs?.[relIndex]?.[1] || '' : ''
      const ensure = (val: string, token: string) =>
        new RegExp(`(?:^|\\s)${token}(?:\\s|$)`, 'i').test(val) ? val : `${val} ${token}`.trim()
      relVal = ensure(relVal, 'noopener')
      relVal = ensure(relVal, 'noreferrer')
      tokens[idx].attrSet('rel', relVal)
    }
  }

  return defaultLinkOpen(tokens, idx, options, env, self)
}

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
