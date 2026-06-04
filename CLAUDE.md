# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

建筑工作室作品集 + 后台管理。Nuxt 4 前端（SSG 前台 / CSR 后台） + Express API 后端，PostgreSQL 数据库，Docker + Nginx 部署。

## Commands

```bash
# Frontend dev server (localhost:3000)
npm run dev

# Build static site (outputs to .output/public/)
npx nuxi generate

# Backend dev server (localhost:3001)
cd server && npm run dev
```

## Architecture

```
Browser
  ├── / (portfolio)   → Static HTML/JS/CSS from .output/public/ (SSG, nuxi generate)
  ├── /admin/*        → Client-only SPA (CSR, no SSR), shares Nuxt project
  └── /api/*          → Proxied by Nginx to Express on :3001 → PostgreSQL
```

**Frontend** ([nuxt.config.ts](nuxt.config.ts)):
- Nuxt 4 with Vue 3.5, Tailwind CSS, Nuxt Icon
- **Portfolio pages** (`/`, `/projects`, `/about`, `/contact`, `/projects/[slug]`) are prerendered static HTML (`nuxi generate` with `crawlLinks: true`)
- **Admin pages** (`/admin/**`) are client-only with `ssr: false` in `routeRules`
- Admin uses JWT Bearer token stored in `localStorage` under key `studio_token`
- Global auth middleware at [app/middleware/auth.global.ts](app/middleware/auth.global.ts) guards `/admin/*` except `/admin/login`

**Backend** ([server/src/](server/src/)):
- Express API serving from port 3001
- [index.js](server/src/index.js): mounts routers under `/api/*`, serves `/uploads/` as static files
- [auth.js](server/src/auth.js): JWT auth (sign/verify) + bcrypt, `authMiddleware` for protected routes
- [db.js](server/src/db.js): `pg` Pool connecting to PostgreSQL (same DB as investlearn, database name `studio`)
- Routes: `projects.js`, `categories.js`, `styles.js`, `images.js` — all public GETs, admin mutations behind `authMiddleware`

**Database** ([server/migrations/001_schema.sql](server/migrations/001_schema.sql)):
- PostgreSQL inside the `investlearn-db` Docker container, database `studio`
- Tables: `categories`, `styles`, `projects`, `project_styles` (many-to-many), `project_images`, `admins`, `site_settings`
- Project status uses Postgres enum: `'draft' | 'published' | 'archived'`
- `projects.updated_at` is auto-updated via a trigger

## Key Conventions

- **API client**: [app/composables/useApi.ts](app/composables/useApi.ts) — two objects: `api` (public) and `adminApi` (includes `Authorization` header from localStorage). In browser, uses relative URLs (Nginx proxies `/api/*`); in SSR, uses `runtimeConfig.public.apiUrl`.
- **Image uploads**: Multipart POST to `/api/images/upload`. Multer stores files in `UPLOAD_DIR` (default `./server/uploads`). URLs use `/uploads/<filename>` paths.
- **TypeScript types** in [types/models.ts](types/models.ts) mirror the DB schema plus form types (`ProjectFormData`, `ProjectQuery`, `PaginatedResponse`).
- **Composables layer**: `useProjects` / `useAdminProjects` wraps API calls for pages; `useImageUpload` manages image CRUD + reordering state; `useAuth` manages session state.
- **CSS**: Tailwind utility classes with two custom containers defined in [app/assets/css/tailwind.css](app/assets/css/tailwind.css): `container-wide` (max-w-7xl) and `container-narrow` (max-w-4xl).

## Deployment

Server: `49.232.49.175` (Ubuntu 22.04), project at `/opt/studio-portfolio/`.

- **Frontend**: `nuxi generate` → `.output/public/` served by Nginx at port 80
- **Backend**: Express runs as Docker container `studio-api` on port 3001, connected to `deploy_default` network
- **Database**: PostgreSQL inside `investlearn-db` container, database `studio`
- After server-side code changes: rebuild Docker image and restart `studio-api` container
- After frontend changes: rerun `nuxi generate` and reload Nginx
- Uploaded images persist via Docker volume mount `-v /opt/studio-portfolio/server/uploads:/app/uploads`
