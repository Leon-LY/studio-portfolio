// Global auth middleware — redirects unauthenticated users away from /admin/*
export default defineNuxtRouteMiddleware((to) => {
  // Only guard admin routes (except login page)
  if (!to.path.startsWith('/admin') || to.path === '/admin/login') {
    return
  }

  // Check for stored token
  const token = import.meta.client ? localStorage.getItem('studio_token') : null
  if (!token) {
    return navigateTo(`/admin/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
