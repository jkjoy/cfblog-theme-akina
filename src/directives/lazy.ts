import type { Directive, DirectiveBinding } from 'vue'

interface LazyImageElement extends HTMLImageElement {
  _lazyObserver?: IntersectionObserver
}

/**
 * 图片懒加载指令
 * 使用方式: <img v-lazy="imageUrl" alt="description" />
 */
export const lazyDirective: Directive = {
  mounted(el: LazyImageElement, binding: DirectiveBinding) {
    const imageUrl = binding.value
    const loadingClass = 'lazy-loading'
    const loadedClass = 'lazy-loaded'
    const errorClass = 'lazy-error'

    // 添加加载中的类名
    el.classList.add(loadingClass)

    // 设置占位图（可选）
    const placeholder = binding.arg || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="18"%3ELoading...%3C/text%3E%3C/svg%3E'
    el.src = placeholder

    // 创建 Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as LazyImageElement

            // 创建新的图片对象来预加载
            const tempImg = new Image()

            tempImg.onload = () => {
              img.src = imageUrl
              img.classList.remove(loadingClass)
              img.classList.add(loadedClass)
            }

            tempImg.onerror = () => {
              img.classList.remove(loadingClass)
              img.classList.add(errorClass)
              // 设置错误占位图
              img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f8d7da" width="400" height="300"/%3E%3Ctext fill="%23721c24" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="16"%3EFailed to load%3C/text%3E%3C/svg%3E'
            }

            tempImg.src = imageUrl

            // 停止观察
            observer.unobserve(img)
          }
        })
      },
      {
        rootMargin: '50px', // 提前50px开始加载
        threshold: 0.01,
      }
    )

    // 开始观察元素
    observer.observe(el)
    el._lazyObserver = observer
  },

  updated(el: LazyImageElement, binding: DirectiveBinding) {
    // 如果绑定的值改变了，更新图片
    if (binding.value !== binding.oldValue) {
      const imageUrl = binding.value
      const loadingClass = 'lazy-loading'
      const loadedClass = 'lazy-loaded'
      const errorClass = 'lazy-error'

      // 重置类名
      el.classList.remove(loadedClass, errorClass)
      el.classList.add(loadingClass)

      // 预加载新图片
      const tempImg = new Image()
      tempImg.onload = () => {
        el.src = imageUrl
        el.classList.remove(loadingClass)
        el.classList.add(loadedClass)
      }
      tempImg.onerror = () => {
        el.classList.remove(loadingClass)
        el.classList.add(errorClass)
        el.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f8d7da" width="400" height="300"/%3E%3Ctext fill="%23721c24" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="16"%3EFailed to load%3C/text%3E%3C/svg%3E'
      }
      tempImg.src = imageUrl
    }
  },

  unmounted(el: LazyImageElement) {
    // 清理观察器
    if (el._lazyObserver) {
      el._lazyObserver.disconnect()
      delete el._lazyObserver
    }
  },
}

// 默认导出
export default lazyDirective
