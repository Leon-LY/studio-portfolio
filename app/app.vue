<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const { checkSession } = useAuth()

onMounted(async () => {
  await checkSession()
})
</script>
