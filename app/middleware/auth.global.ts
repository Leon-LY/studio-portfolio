// Global auth middleware — redirects unauthenticated users away from /admin/*
// Only runs client-side. During SSG prerendering, middleware is skipped so
// admin pages render their actual content rather than redirecting to login.
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return // Skip during prerendering

  // Only guard admin routes (except login page)
  if (!to.path.startsWith('/admin') || to.path === '/admin/login') {
    return
  }

  // Check for stored token
  const token = localStorage.getItem('studio_token')
  if (!token) {
    return navigateTo(`/admin/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
