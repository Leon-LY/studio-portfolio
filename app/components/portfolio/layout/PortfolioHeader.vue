<template>
  <header
    :class="[
      'fixed top-0 left-0 right-0 z-40 transition-all duration-500',
      isScrolled || !transparent
        ? 'bg-cream/95 backdrop-blur-sm border-b border-warm-200 shadow-elevation-1'
        : 'bg-transparent',
    ]"
  >
    <div class="container-wide">
      <div class="flex items-center justify-between h-16 lg:h-20">
        <!-- Logo -->
        <NuxtLink to="/" class="font-serif text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
          <span :class="isScrolled || !transparent ? 'text-warm-800' : 'text-cream'">形筑</span>
        </NuxtLink>

        <!-- 导航 — 桌面端 -->
        <nav class="hidden md:flex items-center gap-10">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="relative text-sm font-medium transition-colors py-1"
            :class="isScrolled || !transparent ? 'text-warm-600 hover:text-warm-800' : 'text-cream/90 hover:text-cream'"
          >
            {{ link.label }}
            <span
              v-if="isActive(link.to)"
              class="absolute bottom-0 left-0 right-0 h-px bg-accent-400"
              :class="{ 'bg-cream/60': !isScrolled && transparent }"
            />
          </NuxtLink>
        </nav>

        <!-- 移动端菜单按钮 -->
        <button
          class="md:hidden p-2 rounded-sm"
          :class="isScrolled || !transparent ? 'text-warm-700' : 'text-cream'"
          @click="mobileOpen = !mobileOpen"
        >
          <Icon :name="mobileOpen ? 'lucide:x' : 'lucide:menu'" size="24" />
        </button>
      </div>
    </div>

    <!-- 移动端导航 -->
    <Transition name="slide">
      <div v-if="mobileOpen" class="md:hidden bg-cream border-t border-warm-200">
        <div class="container-wide py-6 space-y-2">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="block px-4 py-3 text-sm font-medium text-warm-700 hover:text-warm-900 hover:bg-warm-50 rounded-sm transition-colors"
            @click="mobileOpen = false"
          >
            {{ link.label }}
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
const props = defineProps({
  transparent: { type: Boolean, default: false },
})

const route = useRoute()

const navLinks = [
  { to: '/projects', label: '项目' },
  { to: '/about', label: '关于' },
  { to: '/contact', label: '联系' },
]

function isActive(path: string) {
  return route.path.startsWith(path)
}

const isScrolled = ref(false)
const mobileOpen = ref(false)

function onScroll() {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', onScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
