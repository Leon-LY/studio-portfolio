# 方外设计 — Architecture Portfolio & Admin

> 方寸之外，别有天地 · 山东威海

建筑设计工作室作品集网站 + 后台管理系统。

- **前台**：[49.232.49.175:3000](http://49.232.49.175:3000) — 项目封面图 Hero 背景 + 视差，分类/风格筛选 + 搜索，图片灯箱
- **后台**：[49.232.49.175:3000/admin](http://49.232.49.175:3000/admin) — 项目看板、回款日历、文件管理、留言管理、用户权限
- **后端**：Express API（端口 3001），JWT + 角色权限，PostgreSQL

## 功能模块

### 前台展示
- **首页**：项目封面图全屏 Hero + 视差效果，精选作品网格，分类导航
- **项目列表**：分类/风格 Pill 筛选 + 搜索 + 分页 + 结果计数
- **项目详情**：封面大图 + 图片灯箱（键盘导航）+ 正文 + 相关项目
- **关于页**、**联系页**：表单提交存入数据库，联系信息动态配置

### 后台管理（14 个模块）
| 模块 | 功能 |
|------|------|
| 仪表盘 | 统计卡片、回款概览、近期回款（30天内）、未读留言徽标、快捷操作 |
| 项目 | CRUD + 状态流转（草稿→发布→归档）+ 阶段选择 + 排序箭头 |
| 看板 | 6 列拖拽视图（前期接洽→方案设计→扩初→施工图→施工配合→竣工） |
| 回款管理 | 列表视图 + 日历视图（可点击编辑）+ 标记已收/逾期 |
| 文件管理 | 按项目上传/下载/分类筛选，中文文件名支持，内联分类编辑 |
| 分类 | 名称/标识符自动生成，编辑弹窗，首页可见/隐藏开关 |
| 风格 | 名称/标识符自动生成，编辑弹窗，删除保护 |
| 留言 | 前台表单提交列表，展开查看详情，标为已读 |
| 用户管理 | 新增/编辑/删除用户，角色管理（管理员/编辑者），修改密码 |
| 站点设置 | Hero 背景图上传/预览/移除，slogan/副标题，联系信息 |
| 操作手册 | 10 章详细使用说明 + FAQ |

## 技术栈

| 层面 | 技术 |
|------|------|
| 框架 | Nuxt 4 + Vue 3.5 |
| UI | Tailwind CSS + Nuxt Icon |
| 后端 | Express.js（Docker 容器 `studio-api`） |
| 数据库 | PostgreSQL（`investlearn-db` 容器） |
| 认证 | JWT + bcrypt + 角色中间件 |

## 项目结构

```
building/
├── app/                        # Nuxt 4 前端
│   ├── pages/                  # 页面（前台 + 后台 15 页）
│   ├── components/
│   │   ├── ui/                 # 通用组件（14 个）
│   │   ├── portfolio/          # 前台组件
│   │   └── admin/              # 后台组件
│   ├── composables/            # 数据逻辑（14 个）
│   ├── layouts/                # 布局（admin.vue）
│   └── middleware/             # 路由守卫
├── server/
│   ├── src/
│   │   ├── index.js            # Express 入口
│   │   ├── auth.js             # JWT + bcrypt + 角色
│   │   ├── db.js               # PostgreSQL 连接池
│   │   └── routes/             # 11 个路由文件
│   ├── migrations/             # SQL 迁移（001-005）
│   └── Dockerfile
├── types/models.ts
├── nuxt.config.ts
└── tailwind.config.ts
```

## 数据模型

| 表 | 说明 |
|---|---|
| `categories` | 项目分类（含 `is_visible` 首页可见开关） |
| `styles` | 建筑风格 |
| `projects` | 项目（标题、阶段、状态、封面、SEO 等） |
| `project_styles` | 项目↔风格 多对多 |
| `project_images` | 项目图片 |
| `project_files` | 项目附件（支持 20+ 格式） |
| `file_categories` | 文件分类 |
| `payment_milestones` | 回款节点 |
| `project_stages` | 项目阶段（6 个预设阶段） |
| `project_expenses` | 项目费用 |
| `expense_categories` | 费用分类（6 个预设） |
| `admins` | 管理员账号（角色：admin/editor） |
| `contacts` | 联系表单提交记录 |
| `site_settings` | 站点配置（key-value） |

## 快速开始

```bash
npm install                   # 安装依赖
npm run dev                   # 前端开发服务器（localhost:3100）
cd server && npm run dev      # 后端开发服务器（localhost:3001）
```

## 部署

```bash
# 前端
npx nuxi generate && nginx -s reload

# 后端
docker build -t studio-api -f server/Dockerfile .
docker stop studio-api && docker rm studio-api
docker run -d --name studio-api --network deploy_default \
  -p 3001:3001 -v /opt/studio-portfolio/server/uploads:/app/uploads \
  -e JWT_SECRET=xxx -e DB_HOST=investlearn-db -e DB_NAME=studio \
  -e DB_USER=investlearn -e DB_PASSWORD=xxx -e UPLOAD_DIR=/app/uploads \
  studio-api
```
