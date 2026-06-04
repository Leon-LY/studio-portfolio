<template>
  <footer class="bg-stone-900 text-stone-300 relative">
    <div class="container-wide py-20">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
        <!-- 品牌 -->
        <div>
          <h3 class="font-serif text-xl font-bold text-canvas">形筑</h3>
          <p class="mt-3 text-sm text-stone-400 leading-relaxed">
            建筑设计工作室 — 创造能够启发灵感的空间。
          </p>
        </div>

        <!-- 导航 -->
        <div>
          <h4 class="text-xs font-semibold text-stone-400 uppercase tracking-widest">导航</h4>
          <ul class="mt-5 space-y-3">
            <li v-for="link in navLinks" :key="link.to">
              <NuxtLink :to="link.to" class="text-sm text-stone-400 hover:text-canvas transition-colors">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- 联系方式 -->
        <div>
          <h4 class="text-xs font-semibold text-stone-400 uppercase tracking-widest">联系方式</h4>
          <ul class="mt-5 space-y-3">
            <li>
              <a href="mailto:554295000@qq.com" class="text-sm text-stone-400 hover:text-canvas transition-colors">
                554295000@qq.com
              </a>
            </li>
            <li class="text-sm text-stone-400">中国 · 上海</li>
          </ul>
        </div>
      </div>

      <div class="mt-14 pt-8 border-t border-stone-700">
        <p class="text-sm text-stone-400 text-center">
          &copy; {{ new Date().getFullYear() }} 形筑建筑设计工作室。保留所有权利。
        </p>
      </div>
    </div>

    <!-- 回到顶部 -->
    <button
      class="absolute bottom-8 right-8 w-10 h-10 rounded-full bg-stone-700 text-stone-300 hover:bg-stone-600 hover:text-canvas transition-all duration-200 flex items-center justify-center shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:outline-none"
      aria-label="回到顶部"
      @click="scrollToTop"
    >
      <Icon name="lucide:arrow-up" size="18" />
    </button>
  </footer>
</template>

<script setup lang="ts">
const navLinks = [
  { to: '/projects', label: '项目' },
  { to: '/about', label: '关于' },
  { to: '/contact', label: '联系' },
]

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
