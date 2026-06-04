<template>
  <header class="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-6">
    <!-- 标题 -->
    <div>
      <h1 class="text-lg font-semibold text-stone-800">{{ title }}</h1>
    </div>

    <!-- 用户菜单 -->
    <div class="flex items-center gap-4">
      <div class="relative">
        <button
          class="flex items-center gap-2 text-sm text-stone-700 hover:text-stone-900 transition-colors"
          @click="menuOpen = !menuOpen"
        >
          <div class="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
            <Icon name="lucide:user" size="16" class="text-stone-500" />
          </div>
          <span class="hidden sm:inline font-medium">{{ userName }}</span>
        </button>

        <!-- 下拉菜单 -->
        <Transition name="fade">
          <div
            v-if="menuOpen"
            class="absolute right-0 mt-2 w-48 bg-white rounded-sm shadow-elevation-3 border border-stone-200 py-1 z-50"
          >
            <div class="px-4 py-2 text-xs text-stone-500 border-b border-stone-100">
              {{ userEmail }}
            </div>
            <button
              class="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-2"
              @click="handleSignOut"
            >
              <Icon name="lucide:log-out" size="16" />
              退出登录
            </button>
          </div>
        </Transition>
      </div>

      <!-- 点击外部关闭 -->
      <div v-if="menuOpen" class="fixed inset-0 z-40" @click="menuOpen = false" />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps({
  title: { type: String, default: '仪表盘' },
})

const { user, signOut } = useAuth()

const menuOpen = ref(false)

const userName = computed(() =>
  user.value?.full_name || user.value?.email?.split('@')[0] || '管理员',
)

const userEmail = computed(() => user.value?.email || '')

async function handleSignOut() {
  menuOpen.value = false
  await signOut()
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
