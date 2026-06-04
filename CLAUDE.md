# CLAUDE.md

本文件为 Claude Code（claude.ai/code）在此仓库中工作时提供指引。

## 项目概述

建筑设计工作室作品集 + 后台管理系统。Nuxt 4 前端 + Express 后端，PostgreSQL 数据库，Docker + Nginx 部署。

- **前台**：静态生成（SSG），展示项目作品集，支持分类/风格筛选和搜索
- **后台**：客户端 SPA（CSR），管理项目、分类、风格，支持草稿→发布→归档流转
- **后端**：Express API（端口 3001），提供 RESTful 接口，JWT 认证

## 常用命令

```bash
# 前端开发服务器（localhost:3000）
npm run dev

# 构建静态站点（输出到 .output/public/）
npx nuxi generate

# 后端开发服务器（localhost:3001）
cd server && npm run dev
```

## 架构

```
浏览器
  ├── / (前台页面)     → .output/public/ 下的静态 HTML/JS/CSS（SSG 预渲染）
  ├── /admin/*         → 纯客户端 SPA（CSR，不走 SSR），与前台共用 Nuxt 项目
  └── /api/*           → Nginx 代理到 Express :3001 → PostgreSQL
```

### 前端（[nuxt.config.ts](nuxt.config.ts)）

- Nuxt 4 + Vue 3.5 + Tailwind CSS + Nuxt Icon
- **前台页面**（`/`、`/projects`、`/about`、`/contact`、`/projects/[slug]`）在构建时预渲染为静态 HTML（`nuxi generate`，`crawlLinks: true`）
- **后台页面**（`/admin/**`）通过 `routeRules` 设置 `ssr: false`，纯客户端渲染
- 后台认证使用 JWT Bearer Token，存储在 `localStorage`，键名为 `studio_token`
- 全局路由守卫 [app/middleware/auth.global.ts](app/middleware/auth.global.ts) 保护 `/admin/*` 路由（`/admin/login` 除外）

### 后端（[server/src/](server/src/)）

- Express 运行在端口 3001
- [index.js](server/src/index.js)：挂载所有路由到 `/api/*`，`/uploads/` 作为静态文件目录
- [auth.js](server/src/auth.js)：JWT 签发/验证 + bcrypt 密码哈希，`authMiddleware` 用于需要登录的路由
- [db.js](server/src/db.js)：`pg` 连接池，连接 PostgreSQL（与 investlearn 共用 `investlearn-db` 容器，数据库名 `studio`）
- 路由文件结构一致：公开 GET 接口无需认证，管理端增删改接口需 `authMiddleware`

### 数据库（[server/migrations/001_schema.sql](server/migrations/001_schema.sql)）

- PostgreSQL，运行在 `investlearn-db` Docker 容器中，数据库名 `studio`
- 表：`categories`（分类）、`styles`（风格）、`projects`（项目）、`project_styles`（项目↔风格多对多）、`project_images`（项目图片）、`admins`（管理员）、`site_settings`（站点配置）
- 项目状态使用 PostgreSQL 枚举类型：`'draft' | 'published' | 'archived'`
- `projects.updated_at` 通过触发器自动更新

## 关键约定

- **API 客户端**：[app/composables/useApi.ts](app/composables/useApi.ts) — 两个导出对象：`api`（公开接口）和 `adminApi`（自动附带 `Authorization` 请求头）。浏览器端使用相对路径（由 Nginx 代理 `/api/*`）；SSR 端使用 `runtimeConfig.public.apiUrl`。
- **图片上传**：Multipart POST 到 `/api/images/upload`。Multer 存储文件到 `UPLOAD_DIR`（默认 `./server/uploads`）。图片 URL 使用 `/uploads/<filename>` 路径。
- **TypeScript 类型**：[types/models.ts](types/models.ts) 定义与数据库结构对应的类型，以及表单类型（`ProjectFormData`、`ProjectQuery`、`PaginatedResponse`）。
- **Composable 层**：`useProjects` / `useAdminProjects` 封装 API 调用供页面使用；`useImageUpload` 管理图片 CRUD + 排序状态；`useAuth` 管理登录状态。所有 Composable 不直接操作 DOM，仅处理数据和状态。
- **CSS**：Tailwind 工具类 + 两个自定义容器类，定义在 [app/assets/css/tailwind.css](app/assets/css/tailwind.css)：`container-wide`（max-w-7xl）和 `container-narrow`（max-w-4xl）。

## 部署

服务器：`49.232.49.175`（Ubuntu 22.04），项目路径 `/opt/studio-portfolio/`。

- **前端**：`nuxi generate` → `.output/public/`，由 Nginx 在 80 端口提供服务
- **后端**：Express 运行为 Docker 容器 `studio-api`，端口 3001，连接 `deploy_default` 网络
- **数据库**：PostgreSQL 在 `investlearn-db` 容器中，数据库名 `studio`
- 后端代码变更后：需重新构建 Docker 镜像并重启 `studio-api` 容器
- 前端代码变更后：需重新执行 `nuxi generate` 并重载 Nginx
- 上传的图片通过 Docker 卷挂载持久化：`-v /opt/studio-portfolio/server/uploads:/app/uploads`
