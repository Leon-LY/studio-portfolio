<template>
  <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
    <!-- Page title / breadcrumb -->
    <div>
      <h1 class="text-lg font-semibold text-gray-900">{{ title }}</h1>
    </div>

    <!-- Right actions -->
    <div class="flex items-center gap-4">
      <!-- User menu -->
      <div class="relative">
        <button
          class="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
          @click="menuOpen = !menuOpen"
        >
          <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <Icon name="lucide:user" size="16" class="text-gray-500" />
          </div>
          <span class="hidden sm:inline font-medium">{{ userName }}</span>
        </button>

        <!-- Dropdown -->
        <Transition name="fade">
          <div
            v-if="menuOpen"
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
          >
            <div class="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
              {{ userEmail }}
            </div>
            <button
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              @click="handleSignOut"
            >
              <Icon name="lucide:log-out" size="16" />
              Sign Out
            </button>
          </div>
        </Transition>
      </div>

      <!-- Click outside handler -->
      <div v-if="menuOpen" class="fixed inset-0 z-40" @click="menuOpen = false" />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps({
  title: { type: String, default: 'Dashboard' },
})

const { user, signOut } = useAuth()

const menuOpen = ref(false)

const userName = computed(() =>
  user.value?.user_metadata?.full_name || user.value?.email?.split('@')[0] || 'Admin',
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
