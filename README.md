# 方外设计 — Architecture Portfolio & Admin

> 方寸之外，别有天地 · 山东威海

建筑设计工作室作品集网站 + 后台管理系统。

- **前台**：[49.232.49.175:3000](http://49.232.49.175:3000) — Nuxt 4 SSG + 客户端动态数据，按分类/风格筛选 + 搜索
- **后台**：[49.232.49.175:3000/admin](http://49.232.49.175:3000/admin) — 管理项目、分类、风格、文件、回款、用户
- **后端**：Express API（端口 3001），JWT 认证，PostgreSQL 数据库

## 功能模块

### 前台展示
- 首页：精选项目 + 分类导航，Hero 支持项目封面图背景 + 视差效果
- 项目列表：分类/风格 Pill 筛选 + 搜索 + 分页
- 项目详情：封面大图 + 图集 + 正文 + 相关项目
- 关于页、联系页（表单提交存入数据库）

### 后台管理
- **仪表盘**：项目统计 + 回款概览 + 快捷操作
- **项目管理**：CRUD + 状态流转（草稿→发布→归档）+ 图片管理（上传/排序/设封面）+ 项目文件 + 回款节点
- **回款管理**：列表视图 + 日历视图（可点击编辑）
- **文件管理**：按项目上传/下载/分类，支持 PDF/Word/Excel/PPT/DWG/SKP/ZIP 等
- **分类/风格管理**：自动生成标识符，分类支持首页可见/隐藏切换
- **用户管理**：创建/编辑/删除用户，角色管理（管理员/编辑者），修改密码
- **操作手册**：各模块使用说明

## 技术栈

| 层面 | 技术 |
|------|------|
| 框架 | Nuxt 4 + Vue 3.5 |
| UI | Tailwind CSS + Nuxt Icon |
| 后端 | Express.js（Docker 容器） |
| 数据库 | PostgreSQL（investlearn-db 容器） |
| 认证 | JWT + bcrypt |
| 部署 | Nginx + Docker + `nuxi generate` |

## 项目结构

```
building/
├── app/                        # Nuxt 4 前端
│   ├── pages/                  # 页面
│   │   ├── index.vue           # 首页
│   │   ├── projects/           # 项目列表 + 详情 [slug]
│   │   ├── about.vue / contact.vue
│   │   └── admin/              # 后台（10 个页面）
│   ├── components/
│   │   ├── ui/                 # 通用组件（BaseButton, BaseModal...）
│   │   ├── portfolio/          # 前台组件（ProjectCard, Header, Footer）
│   │   └── admin/              # 后台组件（ProjectForm, PaymentCalendar...）
│   ├── composables/            # 数据逻辑（useApi, useAuth, useProjects...）
│   ├── layouts/                # 布局（admin.vue）
│   ├── middleware/             # 路由守卫
│   └── assets/css/             # 全局样式 + Tailwind
├── server/
│   ├── src/
│   │   ├── index.js            # Express 入口
│   │   ├── auth.js             # JWT + bcrypt
│   │   ├── db.js               # PostgreSQL 连接池
│   │   └── routes/             # API 路由（8 个文件）
│   ├── migrations/             # SQL 迁移（001-005）
│   └── Dockerfile              # 后端容器构建
├── types/models.ts             # TypeScript 类型定义
├── nuxt.config.ts
└── tailwind.config.ts
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动前端开发服务器（localhost:3100）
npm run dev

# 启动后端开发服务器（localhost:3001）
cd server && npm run dev
```

## 数据模型

| 表 | 说明 |
|---|---|
| `categories` | 项目分类（含 `is_visible` 首页可见开关） |
| `styles` | 建筑风格 |
| `projects` | 项目（标题、状态、封面、SEO 等） |
| `project_styles` | 项目↔风格 多对多 |
| `project_images` | 项目图片 |
| `project_files` | 项目附件（支持多格式） |
| `file_categories` | 文件分类 |
| `payment_milestones` | 回款节点 |
| `admins` | 管理员账号（角色：admin/editor） |
| `contacts` | 联系表单提交记录 |
| `site_settings` | 站点配置 |

### 项目状态流转

```
Draft → Published → Archived →（可恢复）Published
```

## 部署

服务器 `49.232.49.175`，项目路径 `/opt/studio-portfolio/`。

```bash
# 前端
npx nuxi generate          # 输出到 .output/public/
nginx -s reload            # Nginx 重载

# 后端
docker build -t studio-api -f server/Dockerfile .
docker stop studio-api && docker rm studio-api
docker run -d --name studio-api --network deploy_default \
  -p 3001:3001 \
  -v /opt/studio-portfolio/server/uploads:/app/uploads \
  -e JWT_SECRET=xxx -e DB_HOST=investlearn-db \
  -e DB_NAME=studio -e DB_USER=investlearn -e DB_PASSWORD=xxx \
  -e UPLOAD_DIR=/app/uploads \
  studio-api
```

Nginx 配置文件位于 `/etc/nginx/sites-enabled/studio`。
