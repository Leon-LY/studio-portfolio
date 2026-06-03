import type { Session, User } from '@supabase/supabase-js'

export function useAuth() {
  const client = useSupabase()
  const session = useState<Session | null>('auth:session', () => null)
  const user = computed(() => session.value?.user ?? null)
  const isAuthenticated = computed(() => !!session.value)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Check for existing session on mount
  async function checkSession() {
    try {
      const { data } = await client.auth.getSession()
      session.value = data.session
    } catch {
      session.value = null
    }
  }

  // Sign in with email + password
  async function signIn(email: string, password: string) {
    isLoading.value = true
    error.value = null
    try {
      const { data, error: err } = await client.auth.signInWithPassword({
        email,
        password,
      })
      if (err) throw err
      session.value = data.session
      return true
    } catch (err: any) {
      error.value = err.message || 'Login failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Sign out
  async function signOut() {
    await client.auth.signOut()
    session.value = null
    await navigateTo('/admin/login')
  }

  return {
    session,
    user,
    isAuthenticated,
    isLoading,
    error,
    checkSession,
    signIn,
    signOut,
  }
}
