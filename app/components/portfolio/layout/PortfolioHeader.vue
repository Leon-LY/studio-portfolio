<template>
  <header
    :class="[
      'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
      isScrolled || !transparent
        ? 'bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm'
        : 'bg-transparent',
    ]"
  >
    <div class="container-wide">
      <div class="flex items-center justify-between h-16 lg:h-20">
        <!-- Logo -->
        <NuxtLink to="/" class="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
          <span :class="isScrolled || !transparent ? 'text-gray-900' : 'text-white'">STUDIO</span>
        </NuxtLink>

        <!-- Nav -->
        <nav class="hidden md:flex items-center gap-8">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="text-sm font-medium transition-colors hover:opacity-80"
            :class="isScrolled || !transparent ? 'text-gray-700 hover:text-gray-900' : 'text-white/90 hover:text-white'"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- Mobile menu toggle -->
        <button
          class="md:hidden p-2 rounded-lg"
          :class="isScrolled || !transparent ? 'text-gray-700' : 'text-white'"
          @click="mobileOpen = !mobileOpen"
        >
          <Icon :name="mobileOpen ? 'lucide:x' : 'lucide:menu'" size="24" />
        </button>
      </div>
    </div>

    <!-- Mobile nav -->
    <Transition name="slide">
      <div v-if="mobileOpen" class="md:hidden bg-white border-t border-gray-100">
        <div class="container-wide py-4 space-y-2">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
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
defineProps({
  transparent: { type: Boolean, default: false },
})

const navLinks = [
  { to: '/projects', label: 'Projects' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

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
  transition: all 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
