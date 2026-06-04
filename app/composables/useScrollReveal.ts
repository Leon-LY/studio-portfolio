/**
 * 滚动揭示 + 动画增强 Composable
 * 使用 IntersectionObserver 检测元素进入视口时添加动画类
 */
export function useScrollReveal(options?: {
  threshold?: number
  rootMargin?: string
}) {
  const { threshold = 0.12, rootMargin = '0px 0px -60px 0px' } = options || {}

  let observer: IntersectionObserver | null = null

  if (import.meta.client) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            // Apply animation based on data attribute or default
            const anim = el.dataset.reveal || 'fade-up'
            el.classList.add('reveal-visible')
            // Add specific animation class
            el.style.setProperty('--reveal-delay', el.dataset.delay || '0ms')
            observer!.unobserve(el)
          }
        })
      },
      { threshold, rootMargin },
    )
  }

  /**
   * 返回一个模板 ref 回调，绑定到需要动画的根元素
   * 子元素需带 `reveal-hidden` 类
   */
  function revealRef(el: Element | ComponentPublicInstance | null) {
    if (!el) return
    const domEl = el instanceof Element ? el : (el as ComponentPublicInstance).$el as Element
    if (!domEl) return

    // Animate the root element itself
    if (domEl.classList.contains('reveal-hidden')) {
      observer?.observe(domEl)
    }
    // Animate children with reveal-hidden
    domEl.querySelectorAll('.reveal-hidden').forEach(child => observer?.observe(child))
  }

  onUnmounted(() => {
    observer?.disconnect()
  })

  return { revealRef }
}

/**
 * Hero 视差效果 — 基于滚动位置微调元素位置
 */
export function useHeroParallax() {
  const scrollY = ref(0)
  const parallaxStyle = computed(() => ({
    transform: `translateY(${scrollY.value * 0.35}px)`,
    opacity: Math.max(0, 1 - scrollY.value / 700),
  }))

  function onScroll() {
    scrollY.value = window.scrollY
  }

  onMounted(() => {
    scrollY.value = window.scrollY
    window.addEventListener('scroll', onScroll, { passive: true })
  })
  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
  })

  return { parallaxStyle, scrollY }
}
