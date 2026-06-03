<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main area -->
    <div class="ml-64">
      <slot />
      <!-- AdminHeader is usually included in each page -->
    </div>
  </div>
</template>
