<template>
  <div>
    <NuxtRouteAnnouncer />

    <!-- Admin layout: sidebar + header + content -->
    <div v-if="isAdminRoute" class="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div class="ml-64">
        <NuxtPage />
      </div>
    </div>

    <!-- Portfolio layout: header + content + footer -->
    <div v-else>
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { checkSession } = useAuth()

const isAdminRoute = computed(() => route.path.startsWith('/admin'))

// Check auth session on app mount
onMounted(async () => {
  await checkSession()
})
</script>
