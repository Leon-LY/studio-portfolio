# Studio — Architecture Portfolio & Admin

建筑设计工作室作品集网站 + 后台管理系统。

- **前台**：Nuxt 4 静态生成（HTML/CSS/JS），Nginx 托管，按类型/风格分类 + 搜索过滤
- **后台**：Vue SPA（CSR），管理项目、分类、风格，支持归档
- **后端**：Supabase 自托管（Docker）— PostgreSQL + Auth + Storage + RLS

## 项目结构

```
building/
├── app/                        # Nuxt 4 应用代码
│   ├── pages/                  # 页面（前台 + /admin 后台）
│   ├── components/             # 组件（ui/ portfolio/ admin/）
│   ├── composables/            # 数据逻辑（useSupabase, useProjects...）
│   ├── middleware/             # 路由守卫（auth.global.ts）
│   └── types/                  # TypeScript 类型
├── supabase/
│   ├── migrations/             # 数据库迁移 SQL（按编号执行）
│   └── docker/                 # Supabase 自托管 Docker Compose
├── deploy/
│   ├── nginx.conf              # Nginx 配置
│   └── deploy.sh               # 部署脚本
├── nuxt.config.ts
└── .env                        # Supabase 连接配置
```

## 快速开始

### 1. 启动 Supabase（数据库 + API）

```bash
cd supabase/docker

# 编辑 .env，修改密码和密钥（用 openssl rand -base64 32 生成）
vim .env

# 启动所有服务
docker compose up -d

# 访问 Supabase Studio：http://49.232.49.175:8100
```

### 2. 初始化数据库

在 Supabase Studio 的 SQL Editor 中，按顺序执行 `supabase/migrations/` 下的 SQL 文件：

```
001 → 002 → 003 → 004 → 005 → 006 → 007
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env，填入你的 Supabase Studio 中的 Project URL 和 anon key
```

### 4. 启动开发服务器

```bash
npm install
npm run dev
```

- 前台：http://localhost:3000
- 后台：http://localhost:3000/admin/login

### 5. 创建管理员账号

在 Supabase Studio → Authentication → Users → Add User 创建管理员账号。

### 6. 构建 & 部署

```bash
# 构建静态文件（输出到 dist/）
npx nuxi generate

# 部署到服务器 Nginx
# 方式一：使用部署脚本
chmod +x deploy/deploy.sh
./deploy/deploy.sh

# 方式二：手动 rsync
rsync -avz dist/ user@server:/var/www/studio/
```

Nginx 配置文件见 [deploy/nginx.conf](deploy/nginx.conf)。

## 数据模型

| 表 | 说明 |
|---|---|
| `categories` | 项目分类（住宅、商业、公共建筑…）|
| `styles` | 建筑风格（现代、极简、新中式…）|
| `projects` | 项目（标题、内容、状态、封面…）|
| `project_styles` | 项目↔风格 多对多 |
| `project_images` | 项目图片 |
| `profiles` | 管理员账号 |
| `site_settings` | 站点配置（key-value）|

### 项目状态流转

```
Draft → Published → Archived →（可恢复）Published
```

- **Draft**：仅后台可见
- **Published**：前台可见
- **Archived**：前台隐藏，后台可查看和恢复

## 技术栈

| 层面 | 技术 |
|------|------|
| 框架 | Nuxt 4 + Vue 3.5 |
| UI | Tailwind CSS 3 + Headless UI + Nuxt Icon |
| 富文本 | Tiptap（待集成） |
| 后端 | Supabase 自托管（PostgreSQL + Auth + Storage） |
| 安全 | RLS（行级安全策略） |
| 部署 | `nuxi generate` → 静态文件 → Nginx |
