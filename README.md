# 方外设计 — Architecture Portfolio & Admin

> 方寸之外，别有天地 · 山东威海

建筑设计工作室作品集网站 + 后台管理系统。

- **前台**：[49.232.49.175:3000](http://49.232.49.175:3000) — 精选作品，分类浏览，项目详情
- **后台**：[49.232.49.175:3000/admin](http://49.232.49.175:3000/admin) — 15 个管理模块
- **后端**：Express API（端口 3001），JWT + 角色权限

## 功能模块

### 前台展示
- 首页 Hero（自定义背景图 + 视差），精选作品交替布局，分类标签云
- 项目列表：分类/风格 Pill 筛选 + 搜索 + 瀑布流分页
- 项目详情：全屏封面 + 杂志式双栏布局 + 图文集 + 图片灯箱
- 关于：Zigzag 交替布局 + 引用 + 服务时间线
- 联系：全幅深色背景 + 浮动表单 + 下划线输入框

### 后台管理

**内容管理**
| 模块 | 功能 |
|------|------|
| 仪表盘 | 统计卡片（可点击跳转）+ 回款概览 + 近期回款 + 未读留言 |
| 项目 | CRUD + 状态流转 + 排序 + 后台详情页 + 编辑页（图片/文件/回款） |
| 看板 | 可拖拽阶段列 + 拖拽反馈高亮 + 触屏移至菜单 + 阶段管理 |
| 客户 | CRUD + 关联项目多选 + 项目名展示 + 合作历史 |
| 留言 | 全部/未读/已读筛选 + 展开详情 + 标为已读 + 删除 |

**财务管理**
| 模块 | 功能 |
|------|------|
| 收支总览 | 项目盈亏看板（预计/已收/支出/利润汇总） |
| 回款管理 | 列表/日历双视图 + CRUD + 状态管理 |
| 支出管理 | 项目选择 + 分类筛选 + 搜索 + 编辑 + 删除 |
| 文件管理 | 上传/下载/分类/预览 + 全局项目浏览 + 搜索 |

**系统设置**
| 模块 | 功能 |
|------|------|
| 分类/风格 | CRUD + 标识符自动生成 + 首页可见切换 |
| 站点设置 | Hero 图上传 + 站点信息 |
| 用户管理 | 新增/编辑/删除/改密 + 搜索 + 角色管理 |
| 操作手册 | 13 章文档 + 搜索 + 悬浮目录 |

## 技术栈

Nuxt 4 + Vue 3.5 + Tailwind CSS + TipTap 富文本 + Express.js + PostgreSQL + Docker + Nginx

## 数据模型（16 张表）

categories, styles, projects, project_styles, project_images, project_files, file_categories, payment_milestones, project_stages, project_changes, project_expenses, expense_categories, clients, admins, contacts, site_settings

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
cd server && docker build -t studio-api .
docker rm -f studio-api
docker run -d --name studio-api --network deploy_default \
  -p 3001:3001 --restart unless-stopped \
  --env-file .env \
  -v /opt/studio-portfolio/server/uploads:/app/uploads \
  studio-api
```
