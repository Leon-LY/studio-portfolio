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
      title: '方外设计 — 建筑设计工作室',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '方外设计 — 方寸之外，别有天地。专注建筑设计，以思考重塑空间的边界。' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        // Google Fonts: 思源宋体（标题）+ 思源黑体（正文）
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Noto+Sans+SC:wght@300;400;500;700&family=Noto+Serif+SC:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap',
        },
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
