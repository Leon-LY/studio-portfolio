/**
 * 滚动揭示 Composable
 * 使用 IntersectionObserver 检测元素进入视口时添加动画类
 */
export function useScrollReveal(options?: {
  threshold?: number
  rootMargin?: string
}) {
  const { threshold = 0.1, rootMargin = '0px 0px -40px 0px' } = options || {}

  /**
   * 返回一个模板 ref 回调，绑定到需要动画的根元素
   * 子元素需带 `reveal-hidden` 类
   */
  function revealRef(el: Element | null) {
    if (!el) return

    // 对根元素本身
    if (el.classList.contains('reveal-hidden')) {
      observe(el)
    }

    // 对子元素
    el.querySelectorAll('.reveal-hidden').forEach(child => observe(child))
  }

  const observer = import.meta.client
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('reveal-visible')
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold, rootMargin },
      )
    : null

  function observe(el: Element) {
    observer?.observe(el)
  }

  // 清理
  onUnmounted(() => {
    observer?.disconnect()
  })

  return { revealRef }
}
