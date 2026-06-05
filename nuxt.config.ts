// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Dev server — non-default port
  devServer: {
    port: 3100,
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@vueuse/nuxt',
  ],

  nitro: {
    prerender: {
      crawlLinks: false,
      routes: [
        // Public pages (shell only, data fetched client-side)
        '/',
        '/projects',
        '/about',
        '/contact',
        // Admin pages
        '/admin/login',
        '/admin',
        '/admin/projects',
        '/admin/projects/new',
        '/admin/projects/board',
        '/admin/contacts',
        '/admin/payments',
        '/admin/files',
        '/admin/categories',
        '/admin/styles',
        '/admin/settings',
        '/admin/users',
        '/admin/manual',
      ],
    },
  },

  app: {
    head: {
      title: '方外设计 — 建筑设计工作室',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '方外设计 — 方寸之外，别有天地。专注建筑设计，以思考重塑空间的边界。' },
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
