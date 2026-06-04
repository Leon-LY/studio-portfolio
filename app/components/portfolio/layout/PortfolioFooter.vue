<template>
  <footer class="bg-warm-900 text-warm-300">
    <div class="container-wide py-20">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
        <!-- 品牌 -->
        <div>
          <h3 class="font-serif text-xl font-bold text-cream">形筑</h3>
          <p class="mt-3 text-sm text-warm-400 leading-relaxed">
            建筑与设计工作室 — 创造能够启发灵感的空间。
          </p>
        </div>

        <!-- 导航 -->
        <div>
          <h4 class="text-xs font-semibold text-warm-400 uppercase tracking-widest">导航</h4>
          <ul class="mt-5 space-y-3">
            <li v-for="link in navLinks" :key="link.to">
              <NuxtLink :to="link.to" class="text-sm text-warm-400 hover:text-cream transition-colors">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- 联系方式 -->
        <div>
          <h4 class="text-xs font-semibold text-warm-400 uppercase tracking-widest">联系方式</h4>
          <ul class="mt-5 space-y-3">
            <li>
              <a href="mailto:554295000@qq.com" class="text-sm text-warm-400 hover:text-cream transition-colors">
                554295000@qq.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-14 pt-8 border-t border-warm-700">
        <p class="text-sm text-warm-500 text-center">
          &copy; {{ new Date().getFullYear() }} 形筑建筑设计工作室。保留所有权利。
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const navLinks = [
  { to: '/projects', label: '项目' },
  { to: '/about', label: '关于' },
  { to: '/contact', label: '联系' },
]
</script>
