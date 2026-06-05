# CLAUDE.md

本文件为 Claude Code（claude.ai/code）在此仓库中工作时提供指引。

## 项目概述

方外设计（山东威海）— 建筑设计工作室作品集 + 后台管理系统。Nuxt 4 前端 + Express 后端，PostgreSQL 数据库，Docker + Nginx 部署。

- **前台**：静态生成（SSG）外壳 + 客户端动态数据（`ref` + `onMounted` 模式），展示项目作品集，支持分类/风格筛选和搜索
- **后台**：SSG 预渲染空壳 + 客户端水合，管理项目、分类、风格、文件、回款、用户、留言、看板、站点设置
- **后端**：Express API（端口 3001），提供 RESTful 接口，JWT 认证 + 角色权限

## 常用命令

```bash
npm run dev                 # 前端开发服务器（localhost:3100）
npx nuxi generate           # 构建静态站点（输出到 .output/public/）
cd server && npm run dev    # 后端开发服务器（localhost:3001）
cd server && node --check src/index.js  # 后端语法检查
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

### 后端（[server/src/](server/src/)）

- Express 运行在端口 3001，Docker 容器 `studio-api`
- [index.js](server/src/index.js)：挂载所有路由到 `/api/*`，`/uploads/` 作为静态文件目录
- [auth.js](server/src/auth.js)：JWT 签发/验证 + bcrypt 密码哈希，`authMiddleware` + `requireRole('admin')` 中间件，`getMe` 端点，登录限流（20次/15分钟）
- [db.js](server/src/db.js)：`pg` 连接池，DATE 列解析为 YYYY-MM-DD 字符串（OID 1082）；`getClient()` 用于事务操作
- 路由文件（11 个）：`projects.js`, `categories.js`, `styles.js`, `images.js`, `files.js`, `payments.js`, `contact.js`, `users.js`, `stages.js`, `expenses.js`, `settings.js`

### 数据库（[server/migrations/](server/migrations/)）

- PostgreSQL，运行在 `investlearn-db` Docker 容器中，数据库名 `studio`，用户 `investlearn`
- 迁移文件：`001_schema.sql` → `002_features.sql` → `003_indexes.sql` → `004_contacts.sql` → `005_category_visible.sql`
- 核心表：`categories`（含 `is_visible`）、`styles`、`projects`（含 `stage_id`）、`project_styles`、`project_images`、`admins`、`file_categories`、`project_files`、`payment_milestones`、`project_stages`、`project_expenses`、`expense_categories`、`contacts`、`site_settings`

## 关键约定（重要！反复出过 bug）

### 组件导入
- **所有自定义组件（BaseButton、ProjectCard、PortfolioHeader 等）必须在 `<script setup>` 中显式 `import`**——Nuxt 自动导入在 SSG 时不可靠
- **`adminApi` 在页面文件中应显式导入**：`import { adminApi } from '~/composables/useApi'`——不能依赖 Nuxt 自动导入

### 数据加载
- **前台页面**：使用 `ref` + `onMounted` 模式，**禁止** `useAsyncData` + `server:false` + `lazy:true`（该组合在 SSG 下不触发）
- **后台页面**：`useAsyncData`（无 server/lazy 选项）或 `ref` + `onMounted`

### CSS / 动画
- **`reveal-hidden` 类不能用于动态渲染的内容**——IntersectionObserver 在 mount 时只触发一次，后续异步加载的元素永远不可见
- **`duration-400` 不是合法 Tailwind 类**——只有 75/100/150/200/300/500/700/1000
- **`Math.random()` 不能用于 SSR 渲染**——会导致水合不匹配

### 模板 / 脚本
- **`v-model="!!ref"` 不合法**——v-model 需要可写的表达式
- **Vue 模板中不能使用 TypeScript `as` 断言**——会崩溃浏览器
- **`.js` 文件中不能使用 TypeScript `as` 断言**——会崩溃 Node.js
- **`definePageMeta({ validate: true })` 无效**——validate 必须是函数

### 后端
- **事务必须用 `const client = await getClient()` + `client.query()`，不能直接用 `pool.query()`**——pool 每次取不同连接，BEGIN/COMMIT 在不同连接上无效
- **NOT NULL 列必须在 INSERT 前验证**——否则 500 而非 400
- **管理端查询参数（如 `?all=1`）必须验证认证**——防止数据泄露

### API 客户端
- [app/composables/useApi.ts](app/composables/useApi.ts) — 两个导出：`api`（公开）和 `adminApi`（自动附带 Authorization）。浏览器端使用相对路径；SSR 端使用 `runtimeConfig.public.apiUrl`

## 部署

服务器：`49.232.49.175:3000`（Ubuntu 22.04），项目路径 `/opt/studio-portfolio/`。

- **前端**：`npx nuxi generate` → `.output/public/`，Nginx 在 3000 端口提供服务
- **后端**：Docker 容器 `studio-api`，端口 3001，`deploy_default` 网络
- **数据库**：`investlearn-db` 容器，数据库 `studio`，用户 `investlearn`，密码 `7AjJRIpaX64l`
- **部署流程**：`scp` 变更文件到服务器 → `docker build -t studio-api -f server/Dockerfile .` → 重启容器 → `npx nuxi generate` → `nginx -s reload`
- 上传文件通过 Docker 卷挂载：`-v /opt/studio-portfolio/server/uploads:/app/uploads`
- 服务器可能无法访问 GitHub（GFW），用 `scp` 直接传文件
