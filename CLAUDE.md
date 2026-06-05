# CLAUDE.md

本文件为 Claude Code（claude.ai/code）在此仓库中工作时提供指引。

## 项目概述

方外设计（山东威海）— 建筑设计工作室作品集 + 后台管理系统。Nuxt 4 前端 + Express 后端，PostgreSQL 数据库，Docker + Nginx 部署。

- **前台**：SSG 外壳 + `ref` + `onMounted` 客户端动态数据
- **后台**：SSG 预渲染空壳 + 客户端水合，13 个管理模块
- **后端**：Express API（端口 3001），JWT + 角色权限
- **开发者**：Leon，电话 18389118642

## 常用命令

```bash
npm run dev                 # 前端（localhost:3100）
npx nuxi generate           # 构建 SSG → .output/public/
cd server && npm run dev    # 后端（localhost:3001）
cd server && node --check src/index.js
```

## 架构

```
浏览器
  ├── / (前台)         → SSG 空壳 + 客户端 API 数据
  ├── /admin/*         → SSG 空壳 + 客户端水合
  ├── /api/*           → Nginx → Express :3001 → PostgreSQL
  └── /uploads/*       → Nginx → Express 静态文件
```

## 关键约定（反复出过 bug，必须遵守）

### 组件导入
- **所有自定义组件必须显式 `import`**——Nuxt 自动导入在 SSG 时不可靠
- **`adminApi` 在页面中须显式导入**：`import { adminApi } from '~/composables/useApi'`

### 数据加载
- **前台页面**：`ref` + `onMounted`，禁止 `useAsyncData` + `server:false` + `lazy:true`
- **后台页面**：`useAsyncData`（标准模式）或 `ref` + `onMounted`

### CSS / 动画
- **`reveal-hidden` 不能用于动态渲染内容**——Observer 只触发一次
- **`duration-400` 不是合法 Tailwind 类**——只有 75/100/150/200/300/500/700/1000
- **`Math.random()` 不能用于 SSR**——水合不匹配

### 模板 / 脚本
- **`v-model="!!ref"` 不合法**
- **Vue 模板禁止 TS `as` 断言**
- **`.js` 文件禁止 TS `as` 断言**
- **`definePageMeta({ validate: true })` 无效**——validate 必须是函数

### 后端
- **事务用 `getClient()` + `client.query()`**，不能直接用 `pool.query()`
- **NOT NULL 列 INSERT 前必须验证**
- **管理端查询参数（`?all=1`）必须验证认证**
- **Content-Disposition 中文用 `filename*=UTF-8''encodeURIComponent()`**

### 文件上传
- **中文文件名**：前端传 `file.name` 作为 `original_name` 表单字段，不依赖 multer 解析

### Docker
- Dockerfile 用阿里云镜像源加速（`mirrors.aliyun.com`）
- 含 LibreOffice（writer+calc+impress）用于 Office→PDF 转换

## 后端路由（11 个）

| 文件 | 路径 | 说明 |
|------|------|------|
| projects.js | /api/projects | 项目 CRUD + 精选 |
| categories.js | /api/categories | 分类（?all=1 需 JWT） |
| styles.js | /api/styles | 风格 CRUD |
| images.js | /api/images | 图片上传/排序 |
| files.js | /api/files | 文件 CRUD + 预览 + Office→PDF |
| payments.js | /api/payments | 回款 CRUD + 日历 + 概览 |
| contact.js | /api/contact | 联系表单（手机号） |
| users.js | /api/users | 用户管理（requireRole admin） |
| stages.js | /api/stages | 看板阶段 CRUD + 排序 |
| expenses.js | /api/expenses | 费用 CRUD + 分类 |
| settings.js | /api/settings | 站点设置 + Hero 图上传 |

## 数据库表（15 张）

categories, styles, projects, project_styles, project_images, project_files, file_categories, payment_milestones, project_stages, project_expenses, expense_categories, admins, contacts, site_settings, document_templates

## 部署

服务器 `49.232.49.175:3000`，路径 `/opt/studio-portfolio/`。

```bash
# 全量部署
scp 变更文件 → docker build -t studio-api -f server/Dockerfile . →
docker stop/rm/run studio-api → npx nuxi generate → nginx -s reload
```

数据库 `investlearn-db`，用户 `investlearn`，密码 `7AjJRIpaX64l`。
Docker 卷挂载 `-v /opt/studio-portfolio/server/uploads:/app/uploads`。
GFW 阻断时用 `scp` 传文件代替 `git pull`。

---

# Karpathy Guidelines

行为准则，减少 LLM 编程常见错误。来源：[Andrej Karpathy 的观察](https://x.com/karpathy/status/2015883857489522876)。

## 1. 先思考再写代码

- 明确陈述假设。不确定就问。
- 多种解读时，列出所有选项——不要默默选一个。
- 有更简单的方案就说出来。该 push back 就 push back。
- 遇到不清晰的地方，停下来。指出困惑点。问。

## 2. 简单优先

- 只写需求范围内的代码。不写推测性功能。
- 不为单次使用创建抽象。
- 不添加未要求的"灵活性"或"可配置性"。
- 不对不可能发生的场景做错误处理。
- 如果 200 行能写成 50 行，重写。

## 3. 精准修改

- 不改"周边代码"、注释、格式。
- 不重构没坏的东西。
- 匹配现有风格，即使你会写得不一样。
- 如果是你的改动导致的无用 import/变量，清理掉。之前就存在的死代码只提不删。

## 4. 目标驱动

- 把任务转化为可验证的目标。
- "修 bug" → "写测试复现 → 修 → 验证"
- 多步骤任务，列出简短计划：`1. [步骤] → 验证: [检查点]`
- 强验证标准让你能独立循环推进。弱标准（"让它能用"）需要不断澄清。
