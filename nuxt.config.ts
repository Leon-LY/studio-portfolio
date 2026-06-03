// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@vueuse/nuxt',
  ],

  // ============================================================
  // Rendering: Portfolio = Static (SSG), Admin = Client-only (CSR)
  // ============================================================

  // Admin routes: no server-side rendering (pure browser-side SPA)
  routeRules: {
    '/admin/**': { ssr: false },
  },

  // Static generation: prerender all portfolio pages at build time
  nitro: {
    prerender: {
      crawlLinks: true,                    // follow internal links to discover pages
      ignore: ['/admin/**'],               // skip admin routes entirely
      routes: ['/'],                       // start from homepage
    },
  },

  // ============================================================
  // App-level defaults
  // ============================================================
  app: {
    head: {
      title: 'Studio — Architecture & Design',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Architecture and design studio portfolio' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  // ============================================================
  // Supabase config — set in .env
  // Self-hosted example: SUPABASE_URL=http://your-server:8000
  // ============================================================
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    },
  },

  typescript: { strict: true },
  css: ['~/assets/css/tailwind.css'],
})
