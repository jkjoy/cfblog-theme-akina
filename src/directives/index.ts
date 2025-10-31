import type { App } from 'vue'
import { lazyDirective } from './lazy'

/**
 * 注册所有全局指令
 */
export function registerDirectives(app: App) {
  app.directive('lazy', lazyDirective)
}

// 导出各个指令供单独使用
export { lazyDirective }
