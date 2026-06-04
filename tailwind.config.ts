import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // ============================================================
      // 暖灰色系 — 建筑工作室主色调
      // ============================================================
      colors: {
        warm: {
          50: '#fafaf8',
          100: '#f5f4f0',
          200: '#e8e5dc',
          300: '#d6d1c4',
          400: '#a8a194',
          500: '#807a6e',
          600: '#635e55',
          700: '#4a4540',
          800: '#2d2a26',
          900: '#1a1815',
        },
        accent: {
          50: '#fdf8f0',
          100: '#f9eddb',
          200: '#f0d7a8',
          300: '#e5be6c',
          400: '#d4a43c',
          500: '#b8891a',
          600: '#8c6914',
        },
        cream: '#fdfcf8',
        ink: '#1a1815',
      },

      // ============================================================
      // 字体 — 宋体（标题）/ 黑体（正文）
      // ============================================================
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', '"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Noto Serif SC"', '"Playfair Display"', 'Georgia', 'serif'],
      },

      // ============================================================
      // 展示字号 — 大标题专用
      // ============================================================
      fontSize: {
        'display-xl': ['5rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'display-md': ['2.5rem', { lineHeight: '1.15' }],
        'display-sm': ['1.75rem', { lineHeight: '1.2' }],
      },

      // ============================================================
      // 阴影 — 柔和暖调层次
      // ============================================================
      boxShadow: {
        'elevation-1': '0 1px 2px rgba(26, 24, 21, 0.04)',
        'elevation-2': '0 2px 8px rgba(26, 24, 21, 0.06)',
        'elevation-3': '0 4px 16px rgba(26, 24, 21, 0.08)',
        'elevation-4': '0 8px 32px rgba(26, 24, 21, 0.10)',
        'elevation-image': '0 4px 24px rgba(26, 24, 21, 0.12)',
      },

      // ============================================================
      // 间距 — 统一垂直节奏
      // ============================================================
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        'section': '7.5rem',
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
      // 自定义动画 — 优雅缓动
      // ============================================================
      animation: {
        'fade-in-up': 'fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fade-in 0.6s ease forwards',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-left': 'slide-in-left 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },

      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(2rem)' },
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
          from: { opacity: '0', transform: 'translateX(-2rem)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config
