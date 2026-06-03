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
  routeRules: {
    '/admin/**': { ssr: false },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      ignore: ['/admin/**'],
      routes: ['/'],
    },
  },

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

  // API URL for server-side fetch (SSR/prerender)
  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL || 'http://localhost:3001',
    },
  },

  typescript: { strict: true },
  css: ['~/assets/css/tailwind.css'],
})
