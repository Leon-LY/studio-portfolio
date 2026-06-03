import { api, getToken, clearToken } from './useApi'

export function useAuth() {
  const session = useState<any>('auth:session', () => null)
  const user = computed(() => session.value?.user ?? null)
  const isAuthenticated = computed(() => !!session.value)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Check if we have a stored token on mount
  async function checkSession() {
    const token = getToken()
    if (token) {
      // We have a token, assume valid (the API will reject if expired)
      session.value = { access_token: token, user: null }
    }
  }

  async function signIn(email: string, password: string) {
    isLoading.value = true
    error.value = null
    try {
      const result = await api.login(email, password)
      session.value = { access_token: result.token, user: result.user }
      return true
    } catch (err: any) {
      error.value = err.message || 'Login failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function signOut() {
    api.logout()
    clearToken()
    session.value = null
    await navigateTo('/admin/login')
  }

  return { session, user, isAuthenticated, isLoading, error, checkSession, signIn, signOut }
}
