// Public Supabase client - uses the Nuxt plugin's $supabase
export function useSupabase() {
  const { $supabase } = useNuxtApp()
  return $supabase
}

// Check if Supabase is configured (has real URL/key set in .env)
export function isSupabaseConfigured(): boolean {
  const config = useRuntimeConfig()
  const url = config.public.supabaseUrl as string
  return !!url && !url.includes('your-project') && url !== ''
}
