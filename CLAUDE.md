# CLAUDE.md

本文件为 Claude Code（claude.ai/code）在此仓库中工作时提供指引。

## 项目概述

方外设计（山东威海）— 建筑设计工作室作品集 + 后台管理系统。Nuxt 4 前端 + Express 后端，PostgreSQL 数据库，Docker + Nginx 部署。

- **前台**：SSG 外壳 + 客户端动态数据
- **后台**：SSG 预渲染空壳 + 客户端水合，15 个管理模块
- **后端**：Express API（端口 3001），JWT + 角色权限
- **开发者**：Leon

## 常用命令

```bash
npm run dev                 # 前端（localhost:3100）
npx nuxi generate           # 构建 SSG → .output/public/
cd server && npm run dev    # 后端（localhost:3001）
```

## 架构

```
浏览器
  ├── / (前台)         → SSG 空壳 + 客户端 API 数据
  ├── /admin/*         → SSG 空壳 + 客户端水合
  ├── /api/*           → Nginx → Express :3001 → PostgreSQL
  └── /uploads/*       → Nginx → Express 静态文件
```

## 关键约定

### 组件导入
- 所有自定义组件必须显式 `import`
- `adminApi` 在页面中须显式导入：`import { adminApi } from '~/composables/useApi'`

### 数据加载
- 前台页面：`ref` + `onMounted`
- 后台页面：`useAsyncData` 或 `ref` + `onMounted`

### Toast 反馈
- **禁止使用 `alert()`** — 全部改用 `useToast().error()` / `useToast().success()`
- `useToast()` 是全局共享 composable，无需 provide/inject

### 表单
- BaseTextarea 支持 `error` prop 和 `required` prop
- BaseInput 支持密码可见切换（`type="password"` 自动显示 eye 图标）
- BaseModal 自动 focus-trap + body 滚动锁定
- LoadingSpinner 的 `text` 属性可见（非 sr-only）

### 文件上传
- **禁止 `git clean -fd`** — 会删除 `server/uploads/` 中所有上传文件
- `server/uploads/` 和 `server/previews/` 已在 `.gitignore` 中

### Docker
- Dockerfile 用阿里云镜像源（`mirrors.aliyun.com`）
- 含 LibreOffice 用于 Office→PDF 转换
- CMD 是 `node src/index.js`（构建上下文为 `server/` 目录）

## 后端路由（13 个）

| 文件 | 路径 | 说明 |
|------|------|------|
| projects.js | /api/projects | 项目 CRUD + 精选 + 收支汇总(/financial) |
| categories.js | /api/categories | 分类 |
| styles.js | /api/styles | 风格 |
| images.js | /api/images | 图片上传/排序/封面 |
| files.js | /api/files | 文件 CRUD + 预览 + Office→PDF |
| payments.js | /api/payments | 回款 CRUD + 日历 + 概览 |
| expenses.js | /api/expenses | 支出 CRUD + 分类 |
| clients.js | /api/clients | 客户 CRUD + 项目关联 |
| contact.js | /api/contact | 留言提交 + 管理 + 删除 |
| users.js | /api/users | 用户管理（requireRole admin） |
| stages.js | /api/stages | 看板阶段 CRUD + 排序 |
| settings.js | /api/settings | 站点设置 + Hero 图上传 |
| auth.js | /api/auth | 登录/注册/个人信息 |

## 数据库表（16 张）

categories, styles, projects, project_styles, project_images, project_files, file_categories, payment_milestones, project_stages, project_changes, project_expenses, expense_categories, clients, admins, contacts, site_settings

## 前端关键组件

| 组件 | 说明 |
|------|------|
| BaseToast | 全局 toast（useToast composable 驱动） |
| BaseModal | focus-trap + body 滚动锁定 + Esc 关闭 |
| BaseInput | password toggle + error/hint |
| BaseTextarea | error + required 支持 |
| RichTextEditor | TipTap 富文本（加粗/斜体/标题/列表/引用） |
| DataTable | 通用表格（排序/分页省略号/加载/空状态） |
| AdminSidebar | 3 组导航 + 可折叠 icon-only 模式 |
| AdminHeader | 面包屑 + 用户菜单 + 密码修改 |

## 部署

服务器 `49.232.49.175:3000`，路径 `/opt/studio-portfolio/`。

```bash
# 前端
git push && ssh root@49.232.49.175
cd /opt/studio-portfolio && git pull && npx nuxi generate && nginx -s reload

# 后端（server/ 代码变更时）
cd server && docker build -t studio-api . && docker rm -f studio-api
docker run -d --name studio-api --network deploy_default -p 3001:3001 \
  --restart unless-stopped --env-file .env \
  -v /opt/studio-portfolio/server/uploads:/app/uploads studio-api
```

数据库 `investlearn-db`，用户 `investlearn`，密码 `7AjJRIpaX64l`。
Docker 卷挂载 `-v /opt/studio-portfolio/server/uploads:/app/uploads`。
