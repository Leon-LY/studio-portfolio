// Admin Supabase client - same client but with auth token set
export function useSupabaseAdmin() {
  const { $supabase } = useNuxtApp()

  // The session token is automatically attached by Supabase client
  // after a successful sign-in. We just need to ensure the client
  // has a session. The auth middleware ensures this for admin routes.
  return $supabase
}
