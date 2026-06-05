# 方外设计 — Architecture Portfolio & Admin

> 方寸之外，别有天地 · 山东威海

建筑设计工作室作品集网站 + 后台管理系统。

- **前台**：[49.232.49.175:3000](http://49.232.49.175:3000) — Hero 背景图 + 视差，分类/风格筛选，图片灯箱
- **后台**：[49.232.49.175:3000/admin](http://49.232.49.175:3000/admin) — 13 个管理模块
- **后端**：Express API（端口 3001），JWT + 角色权限
- **开发者**：Leon — 18389118642

## 功能模块

### 前台展示
- 首页 Hero（可自定义背景图 + 视差），精选作品，分类导航
- 项目列表：分类/风格 Pill 筛选 + 搜索 + 分页
- 项目详情：封面大图 + 图片灯箱（键盘导航）+ 正文 + 图集 + 相关项目
- 联系页：姓名 + 手机号 + 留言（存入数据库）

### 后台管理
| 模块 | 功能 |
|------|------|
| 仪表盘 | 统计卡片、回款概览、近期回款、未读留言徽标、快捷操作 |
| 项目 | CRUD + 状态流转 + 阶段 + 排序 + 图片/文件/回款 |
| 看板 | 可拖拽阶段列，阶段可自定义增删改排序 |
| 回款管理 | 列表视图 + 日历视图（可点击编辑） |
| 文件管理 | 上传/下载/分类，Office 自动转 PDF 预览，图片灯箱 |
| 分类 | 自动标识符，编辑弹窗，首页可见切换 |
| 风格 | 自动标识符，编辑弹窗 |
| 留言 | 查看/展开/标为已读，仪表盘未读提醒 |
| 用户管理 | 新增/编辑/删除/改密，角色（管理员/编辑者） |
| 站点设置 | Hero 背景图上传/预览/移除，Slogan/联系信息 |
| 操作手册 | 13 章详细说明 + FAQ |

## 技术栈

Nuxt 4 + Vue 3.5 + Tailwind CSS + Express.js + PostgreSQL + Docker + Nginx

## 数据模型（15 张表）

categories, styles, projects, project_styles, project_images, project_files, file_categories, payment_milestones, project_stages, project_expenses, expense_categories, admins, contacts, site_settings, document_templates

## 快速开始

```bash
npm install && npm run dev              # 前端 localhost:3100
cd server && npm run dev                # 后端 localhost:3001
```

## 部署

```bash
# 前端
npx nuxi generate && nginx -s reload

# 后端（含 LibreOffice）
docker build -t studio-api -f server/Dockerfile .
docker stop studio-api && docker rm studio-api
docker run -d --name studio-api --network deploy_default \
  -p 3001:3001 -v /opt/studio-portfolio/server/uploads:/app/uploads \
  -e JWT_SECRET=xxx -e DB_HOST=investlearn-db -e DB_NAME=studio \
  -e DB_USER=investlearn -e DB_PASSWORD=xxx -e UPLOAD_DIR=/app/uploads \
  studio-api
```
