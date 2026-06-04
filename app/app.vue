<template>
  <div>
    <NuxtRouteAnnouncer />

    <!-- 后台布局：侧边栏 + 内容 -->
    <div v-if="isAdminRoute" class="min-h-screen bg-warm-50">
      <AdminSidebar />
      <div class="ml-64">
        <Transition name="page" mode="out-in">
          <NuxtPage />
        </Transition>
      </div>
    </div>

    <!-- 前台布局：页头 + 内容 + 页脚（带页面过渡） -->
    <div v-else>
      <Transition name="page" mode="out-in">
        <NuxtPage />
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { checkSession } = useAuth()

const isAdminRoute = computed(() => route.path.startsWith('/admin'))

// 检查认证状态
onMounted(async () => {
  await checkSession()
})
</script>
