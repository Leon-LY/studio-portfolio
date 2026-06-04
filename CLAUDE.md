# CLAUDE.md

本文件为 Claude Code（claude.ai/code）在此仓库中工作时提供指引。

## 项目概述

方外设计（山东威海）— 建筑设计工作室作品集 + 后台管理系统。Nuxt 4 前端 + Express 后端，PostgreSQL 数据库，Docker + Nginx 部署。

- **前台**：静态生成（SSG）外壳 + 客户端动态数据（`ref` + `onMounted` 模式），展示项目作品集，支持分类/风格筛选和搜索
- **后台**：SSG 预渲染空壳 + 客户端水合，管理项目、分类、风格、文件、回款、用户
- **后端**：Express API（端口 3001），提供 RESTful 接口，JWT 认证

## 常用命令

```bash
# 前端开发服务器（localhost:3100）
npm run dev

# 构建静态站点（输出到 .output/public/）
npx nuxi generate

# 后端开发服务器（localhost:3001）
cd server && npm run dev

# 后端语法检查
cd server && node --check src/index.js
```

## 架构

```
浏览器
  ├── / (前台页面)     → .output/public/ 下的静态 HTML/JS/CSS（SSG 预渲染空壳）
  ├── /admin/*         → SSG 预渲染 + 客户端水合，与前台共用 Nuxt 项目
  ├── /api/*           → Nginx 代理到 Express :3001 → PostgreSQL
  └── /uploads/*       → Nginx 代理到 Express 静态文件服务
```

### 前端（[nuxt.config.ts](nuxt.config.ts)）

- Nuxt 4 + Vue 3.5 + Tailwind CSS + Nuxt Icon
- **前台页面**（`/`、`/projects`、`/about`、`/contact`）预渲染为静态 HTML 外壳，数据通过 `ref` + `onMounted` 客户端获取 API
- **项目详情页**（`/projects/[slug]`）未预渲染，通过 Nginx SPA fallback（`try_files ... /index.html`）+ Vue Router 客户端渲染
- **后台页面**（`/admin/**`）全部预渲染为空壳，`onMounted` 加载数据
- 后台认证使用 JWT Bearer Token，存储在 `localStorage`，键名为 `studio_token`
- 全局路由守卫 [app/middleware/auth.global.ts](app/middleware/auth.global.ts) 保护 `/admin/*`（`/admin/login` 除外），SSR 期间通过 `if (import.meta.server) return` 跳过
- **重要**：Nuxt 组件自动导入在 SSG 时不可靠，所有自定义组件必须显式 `import`（这是历史 bug 的主要来源）

### 后端（[server/src/](server/src/)）

- Express 运行在端口 3001，Docker 容器 `studio-api`
- [index.js](server/src/index.js)：挂载所有路由到 `/api/*`，`/uploads/` 作为静态文件目录
- [auth.js](server/src/auth.js)：JWT 签发/验证 + bcrypt 密码哈希，`authMiddleware` 用于需要登录的路由，`getMe` 端点获取当前用户信息，登录限流（20次/15分钟，定期清理过期条目）
- [db.js](server/src/db.js)：`pg` 连接池，连接 PostgreSQL（`investlearn-db` 容器，数据库名 `studio`），DATE 列解析为 YYYY-MM-DD 字符串（OID 1082）
- 路由文件：`projects.js`, `categories.js`, `styles.js`, `images.js`, `files.js`, `payments.js`, `contact.js`, `users.js`
- 公开 GET 接口无需认证，管理端增删改接口需 `authMiddleware`

### 数据库（[server/migrations/](server/migrations/)）

- PostgreSQL，运行在 `investlearn-db` Docker 容器中，数据库名 `studio`，用户 `investlearn`
- 迁移文件：`001_schema.sql` → `002_features.sql` → `003_indexes.sql` → `004_contacts.sql` → `005_category_visible.sql`
- 核心表：`categories`（含 `is_visible`）、`styles`、`projects`、`project_styles`、`project_images`、`admins`、`file_categories`、`project_files`、`payment_milestones`、`contacts`、`site_settings`
- 项目状态：`'draft' | 'published' | 'archived'`（PostgreSQL 枚举）

## 关键约定

- **组件导入**：所有自定义组件（`BaseButton`、`ProjectCard` 等）必须在 `<script setup>` 中显式 `import`，不可依赖 Nuxt 自动导入
- **前台数据加载**：使用 `ref` + `onMounted` 模式（非 `useAsyncData`），`useAsyncData` 配合 `server:false` + `lazy:true` 在 SSG 下不可靠
- **API 客户端**：[app/composables/useApi.ts](app/composables/useApi.ts) — 两个导出：`api`（公开接口）和 `adminApi`（自动附带 `Authorization`）。浏览器端使用相对路径（Nginx 代理）；SSR 端使用 `runtimeConfig.public.apiUrl`
- **图片上传**：Multipart POST `/api/images/upload`，Multer 存储到 `UPLOAD_DIR`，URL 使用 `/uploads/<filename>`
- **文件上传**：Multipart POST `/api/files/upload`，支持 PDF/Word/Excel/PPT/DWG/SKP/ZIP 等，最大 100MB
- **TypeScript 类型**：[types/models.ts](types/models.ts) 定义所有数据模型
- **CSS**：Tailwind 工具类 + 自定义类定义在 [app/assets/css/tailwind.css](app/assets/css/tailwind.css)：`container-wide`（max-w-7xl）、`container-narrow`（max-w-4xl）、`.bg-grid`（建筑网格纹理）、`.reveal-hidden/visible`（滚动揭示）、`.skeleton`（骨架屏）
- **设计令牌**：[tailwind.config.ts](tailwind.config.ts)：stone 色板、accent 金色系、canvas/ink 底色、signal 功能色；系统字体栈（无外部字体依赖）；流体字号 `clamp()`；7 级阴影；6 组关键帧动画

## 部署

服务器：`49.232.49.175:3000`（Ubuntu 22.04），项目路径 `/opt/studio-portfolio/`。

- **前端**：`npx nuxi generate` → `.output/public/`，Nginx 在 3000 端口提供服务
- **后端**：Docker 容器 `studio-api`，端口 3001，`deploy_default` 网络
- **数据库**：`investlearn-db` 容器，数据库 `studio`，用户 `investlearn`
- **部署流程**：`git push` → `scp` 变更文件到服务器 → `docker build -t studio-api -f server/Dockerfile .` → 重启容器 → `npx nuxi generate` → `nginx -s reload`
- 上传文件通过 Docker 卷挂载：`-v /opt/studio-portfolio/server/uploads:/app/uploads`
- 注意：服务器可能无法访问 GitHub（GFW），此时用 `scp` 直接传文件
