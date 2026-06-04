import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // ============================================================
      // 冷灰主色系 — 建筑工作室，高对比度 WCAG AA
      // ============================================================
      colors: {
        stone: {
          50: '#fafaf9',
          100: '#f5f4f0',
          200: '#e7e5e0',
          300: '#d6d3cc',
          400: '#a8a59b',
          500: '#78756c',
          600: '#57544d',
          700: '#44413c',
          800: '#292725',
          900: '#1c1917',
        },
        accent: {
          50: '#fdf9f0',
          100: '#f9eddb',
          200: '#f0d7a0',
          300: '#d4af37',
          400: '#c8a44e',
          500: '#9a7b2c',
          600: '#6b5418',
        },
        canvas: '#F5F4F0',
        ink: '#111110',
        signal: {
          red: '#dc2626',
          green: '#16a34a',
          blue: '#2563eb',
          amber: '#d97706',
        },
      },

      // ============================================================
      // 字体 — 系统字体栈（无需外部加载，中国大陆可用）
      // ============================================================
      fontFamily: {
        serif: ['"PingFang SC"', '"Noto Serif SC"', '"STSong"', '"SimSun"', 'Georgia', 'serif'],
        sans: ['"PingFang SC"', '"Microsoft YaHei"', '"Hiragino Sans GB"', '"Noto Sans SC"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"PingFang SC"', '"Noto Serif SC"', '"STSong"', 'Georgia', 'serif'],
      },

      // ============================================================
      // 流体字号 — clamp() 响应式，无需断点切换
      // ============================================================
      fontSize: {
        'display-xl': ['clamp(2.75rem, 6vw, 5.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.25rem, 4.5vw, 4rem)', { lineHeight: '1.08', letterSpacing: '-0.015em' }],
        'display-md': ['clamp(1.75rem, 3vw, 2.75rem)', { lineHeight: '1.12' }],
        'display-sm': ['clamp(1.35rem, 2vw, 1.75rem)', { lineHeight: '1.2' }],
      },

      // ============================================================
      // 阴影 — 提高不透明度，屏幕可见
      // ============================================================
      boxShadow: {
        'elevation-1': '0 1px 3px rgba(0, 0, 0, 0.06)',
        'elevation-2': '0 3px 10px rgba(0, 0, 0, 0.08)',
        'elevation-3': '0 6px 20px rgba(0, 0, 0, 0.10)',
        'elevation-4': '0 12px 36px rgba(0, 0, 0, 0.12)',
        'elevation-xl': '0 20px 60px rgba(0, 0, 0, 0.14)',
        'elevation-image': '0 6px 28px rgba(0, 0, 0, 0.15)',
      },

      // ============================================================
      // 间距 — 统一垂直节奏 + 保持 Tailwind 默认值
      // ============================================================
      spacing: {
        'section': '7.5rem',
        'section-sm': '4.5rem',
      },

      // ============================================================
      // 圆角 — 锐利建筑感
      // ============================================================
      borderRadius: {
        'sm': '0.125rem',
        'md': '0.25rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
      },

      // ============================================================
      // 自定义动画
      // ============================================================
      animation: {
        'fade-in-up': 'fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fade-in 0.6s ease forwards',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-left': 'slide-in-left 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slide-in-right 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulse-subtle 2.5s ease-in-out infinite',
        'reveal-image': 'reveal-image 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },

      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(2.5rem)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-2.5rem)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(2.5rem)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        'reveal-image': {
          from: { opacity: '0', filter: 'blur(12px)', transform: 'scale(1.03)' },
          to: { opacity: '1', filter: 'blur(0)', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config
