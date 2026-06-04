<template>
  <div class="min-h-screen bg-stone-50">
    <AdminSidebar />
    <div class="ml-64">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminSidebar from '~/components/admin/layout/AdminSidebar.vue'
</script>
