// Global auth middleware - redirects unauthenticated users away from /admin/*
export default defineNuxtRouteMiddleware(async (to) => {
  // Only guard admin routes (except login page)
  if (!to.path.startsWith('/admin') || to.path === '/admin/login') {
    return
  }

  // Check for existing session
  const { $supabase } = useNuxtApp()
  const { data } = await $supabase.auth.getSession()

  if (!data.session) {
    return navigateTo(`/admin/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
