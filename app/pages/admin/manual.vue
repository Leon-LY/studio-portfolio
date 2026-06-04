<template>
  <div>
    <AdminHeader title="操作手册" />

    <div class="p-6 max-w-4xl">
      <!-- 侧边锚点导航 -->
      <div class="mb-10 p-6 bg-stone-50 rounded-sm border border-stone-200">
        <h2 class="text-lg font-serif font-bold text-stone-900 mb-4">目录</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <a v-for="section in sections" :key="section.id" :href="`#${section.id}`" class="text-sm text-stone-600 hover:text-accent-500 transition-colors py-1">
            {{ section.num }}. {{ section.title }}
          </a>
        </div>
      </div>

      <!-- 手册内容 -->
      <div class="prose prose-stone max-w-none space-y-12">

        <!-- ============================================================ -->
        <!-- 1. 系统概述 -->
        <!-- ============================================================ -->
        <section :id="sections[0].id">
          <h2 class="font-serif">1. 系统概述</h2>

          <h3>1.1 方外设计后台管理系统简介</h3>
          <p>
            方外设计后台管理系统是为建筑设计工作室量身打造的集项目展示、进度管理、回款追踪、文件归档于一体的综合性后台。
            系统采用 <strong>前台静态展示 + 后台动态管理</strong> 的架构，前台页面（作品集展示）预渲染为静态 HTML，加载速度极快；
            后台管理界面为动态单页应用（SPA），提供流畅的操作体验。
          </p>

          <h3>1.2 系统架构</h3>
          <div class="p-4 bg-stone-50 rounded-sm border border-stone-200 text-sm">
            <p class="font-mono text-stone-600">
              浏览器 → Nginx:80（静态文件）<br />
              &nbsp;&nbsp;├── / → 前台作品集（SSG 静态页面）<br />
              &nbsp;&nbsp;├── /admin/* → 后台管理（CSR 客户端渲染）<br />
              &nbsp;&nbsp;├── /api/* → 后端 API（Express :3001）<br />
              &nbsp;&nbsp;└── /uploads/* → 上传文件（静态资源）<br />
              Express :3001 → PostgreSQL（investlearn-db 容器，数据库名 studio）
            </p>
          </div>

          <h3>1.3 角色与权限</h3>
          <table>
            <thead><tr><th>角色</th><th>权限</th></tr></thead>
            <tbody>
              <tr><td>管理员 (admin)</td><td>全部权限：增删改查项目、分类、风格，管理文件、回款、费用</td></tr>
              <tr><td>编辑 (editor)</td><td>可编辑现有项目，不可删除项目，不可管理管理员账户</td></tr>
            </tbody>
          </table>
          <p class="text-sm text-stone-500">当前版本所有注册用户默认为 admin 角色。</p>
        </section>

        <!-- ============================================================ -->
        <!-- 2. 仪表盘 -->
        <!-- ============================================================ -->
        <section :id="sections[1].id">
          <h2 class="font-serif">2. 仪表盘</h2>

          <h3>2.1 统计卡片</h3>
          <p>登录后首先看到的页面。顶部三张卡片展示核心数据：</p>
          <ul>
            <li><strong>项目总数</strong> — 系统中所有项目（不限状态）的数量</li>
            <li><strong>已发布</strong> — 状态为「已发布」的项目数量，这些项目会出现在前台作品集中</li>
            <li><strong>草稿</strong> — 仍在编辑中、尚未发布的项目数量</li>
          </ul>

          <h3>2.2 回款概览</h3>
          <p>仪表盘中部展示回款汇总：</p>
          <ul>
            <li><strong>预计回款总额</strong> — 所有项目回款节点的金额总和</li>
            <li><strong>已收款项</strong> — 已标记为「已收款」的金额总和</li>
            <li><strong>逾期款项</strong> — 到期未收的金额及笔数（红色高亮警示）</li>
          </ul>

          <h3>2.3 快捷操作</h3>
          <p>「新建项目」按钮直接跳转到项目创建页面。「查看全部项目」进入项目列表。</p>

          <h3>2.4 最近项目</h3>
          <p>按更新时间排序，展示最近 5 个项目，包含封面缩略图、标题、更新时间、状态标签。点击可进入编辑页。</p>
        </section>

        <!-- ============================================================ -->
        <!-- 3. 项目管理 -->
        <!-- ============================================================ -->
        <section :id="sections[2].id">
          <h2 class="font-serif">3. 项目管理</h2>

          <h3>3.1 项目列表</h3>
          <p>访问路径：<code>/admin/projects</code></p>
          <p>项目列表页是项目管理的中心枢纽：</p>
          <ul>
            <li><strong>状态标签栏</strong> — 顶部四个标签（全部/已发布/草稿/已归档），点击切换筛选条件</li>
            <li><strong>搜索框</strong> — 输入关键词实时搜索（300ms 防抖），匹配项目标题</li>
            <li><strong>列表表格</strong> — 展示封面、标题、分类、状态、更新时间</li>
            <li><strong>操作按钮</strong> — 编辑（进入编辑页）、归档/恢复（切换状态）、删除</li>
            <li><strong>分页</strong> — 底部页码按钮，每页 12 个项目</li>
          </ul>

          <h3>3.2 新建项目</h3>
          <p>访问路径：<code>/admin/projects/new</code></p>
          <p>新建项目表单包含以下字段：</p>
          <table>
            <thead><tr><th>字段</th><th>说明</th><th>必填</th></tr></thead>
            <tbody>
              <tr><td>项目标题</td><td>项目的名称，显示在前台页面</td><td>是</td></tr>
              <tr><td>URL 别名</td><td>用于生成项目详情页 URL（/projects/xxx），自动根据标题生成拼音别名</td><td>是</td></tr>
              <tr><td>分类</td><td>从已有分类中选择，如住宅、商业、公共建筑等</td><td>否</td></tr>
              <tr><td>状态</td><td>草稿（不可见）/ 已发布（前台可见）/ 已归档（隐藏）</td><td>是</td></tr>
              <tr><td>风格</td><td>多选标签，如现代、极简、工业风等</td><td>否</td></tr>
              <tr><td>项目描述</td><td>简短介绍，显示在项目卡片上（建议 100-200 字）</td><td>否</td></tr>
              <tr><td>正文内容</td><td>富文本区域，用于详细项目介绍</td><td>否</td></tr>
              <tr><td>位置</td><td>项目所在地，如「中国·上海」</td><td>否</td></tr>
              <tr><td>客户</td><td>甲方名称</td><td>否</td></tr>
              <tr><td>面积 (m&sup2;)</td><td>建筑面积，纯数字</td><td>否</td></tr>
              <tr><td>完成日期</td><td>项目竣工日期，只显示年份</td><td>否</td></tr>
              <tr><td>精选项目</td><td>勾选后出现在首页「精选作品」区域</td><td>否</td></tr>
              <tr><td>SEO 标题/描述</td><td>用于搜索引擎优化，不填则使用默认值</td><td>否</td></tr>
            </tbody>
          </table>

          <h3>3.3 编辑项目</h3>
          <p>访问路径：<code>/admin/projects/[id]/edit</code></p>
          <p>编辑页使用标签页组织内容，共四个标签：</p>
          <ul>
            <li><strong>基本信息</strong> — 与新建项目相同的表单，保存后即时更新</li>
            <li><strong>图片管理</strong> — 上传项目图片，拖拽排序，设置封面</li>
            <li><strong>项目文件</strong> — 上传项目相关附件（合同、图纸、汇报材料等）</li>
            <li><strong>回款节点</strong> — 管理该项目的收款阶段和金额</li>
          </ul>

          <h3>3.4 图片管理</h3>
          <p>在编辑项目的「图片管理」标签中进行操作：</p>
          <ul>
            <li><strong>上传图片</strong> — 点击或拖拽图片到上传区域（支持 JPG/PNG/WebP/GIF，单文件最大 10MB）</li>
            <li><strong>设为封面</strong> — 点击图片上的星标图标，该图片将成为项目封面和列表缩略图</li>
            <li><strong>删除图片</strong> — 点击垃圾桶图标，确认后删除（同时删除磁盘文件）</li>
            <li><strong>排序</strong> — 第一张上传的图片自动成为封面，后续可在代码中扩展拖拽排序</li>
          </ul>

          <h3>3.5 项目文件</h3>
          <p>在编辑项目的「项目文件」标签中进行操作：</p>
          <ul>
            <li><strong>支持格式</strong> — PDF、Word (.doc/.docx)、Excel (.xls/.xlsx)、PPT (.ppt/.pptx)、DWG/DXF 图纸、SKP 模型、RVT/RFA、ZIP/RAR 压缩包、TXT/CSV、图片</li>
            <li><strong>文件大小</strong> — 单个文件最大 100MB</li>
            <li><strong>上传</strong> — 点击或拖拽上传区域</li>
            <li><strong>下载</strong> — 点击下载图标，浏览器自动下载文件</li>
            <li><strong>删除</strong> — 确认后删除（同时删除磁盘文件）</li>
            <li><strong>分类</strong> — 文件按类别筛选（合同/图纸/汇报/参考/其他），可在上传时指定分类</li>
          </ul>

          <h3>3.6 回款节点</h3>
          <p>在编辑项目的「回款节点」标签中进行操作：</p>
          <ul>
            <li><strong>新增节点</strong> — 填写节点名称、到期日期、金额</li>
            <li><strong>标记收款</strong> — 点击绿色对勾图标，节点状态变为「已收款」，自动记录收款日期</li>
            <li><strong>编辑/删除</strong> — 铅笔图标编辑，垃圾桶图标删除</li>
            <li><strong>金额统计</strong> — 标签页顶部显示合计金额和已收金额</li>
            <li><strong>状态颜色</strong> — 黄色（待收款）、绿色（已收款）、红色（已逾期）</li>
          </ul>

          <h3>3.7 项目状态流转</h3>
          <div class="p-4 bg-stone-50 rounded-sm border border-stone-200">
            <p class="font-mono text-sm text-stone-600">
              草稿 (Draft) → 已发布 (Published) → 已归档 (Archived)
            </p>
          </div>
          <ul class="mt-3">
            <li><strong>草稿</strong> — 仅后台可见，前台不展示。用于正在编辑中的项目</li>
            <li><strong>已发布</strong> — 前台作品集可见。项目信息、图片、文件全部对外公开</li>
            <li><strong>已归档</strong> — 从作品集隐藏，但保留所有数据。归档时间自动记录</li>
          </ul>
          <p>状态切换操作：在项目列表中点击「归档」按钮将已发布项目归档；点击「恢复」按钮将已归档项目恢复为已发布。</p>
        </section>

        <!-- ============================================================ -->
        <!-- 4. 回款管理 -->
        <!-- ============================================================ -->
        <section :id="sections[3].id">
          <h2 class="font-serif">4. 回款管理</h2>
          <p>访问路径：<code>/admin/payments</code></p>
          <p>独立于项目编辑页面的回款管理中心，提供全局视图。</p>

          <h3>4.1 列表视图</h3>
          <ul>
            <li><strong>选择项目</strong> — 从下拉列表选择要查看的项目</li>
            <li><strong>金额统计</strong> — 自动计算合计、已收、逾期金额</li>
            <li><strong>增删改查</strong> — 与项目编辑页中的回款节点功能相同</li>
          </ul>

          <h3>4.2 日历视图</h3>
          <ul>
            <li><strong>月视图</strong> — 以月为单位展示所有项目的回款节点</li>
            <li><strong>颜色含义</strong> — 黄色（待收款）、绿色（已收款）、红色（已逾期）</li>
            <li><strong>悬停提示</strong> — 鼠标悬停在日期格上可查看节点名称和金额</li>
            <li><strong>月份切换</strong> — 左右箭头切换月份</li>
          </ul>

          <h3>4.3 金额统计</h3>
          <p>列表视图顶部状态栏实时显示：合计金额、已收金额、逾期笔数。所有金额以人民币 (CNY) 格式展示。</p>
        </section>

        <!-- ============================================================ -->
        <!-- 5. 文件管理 -->
        <!-- ============================================================ -->
        <section :id="sections[4].id">
          <h2 class="font-serif">5. 文件管理</h2>
          <p>访问路径：<code>/admin/files</code></p>
          <p>全局文件管理页面，按项目组织和浏览所有上传的附件。</p>

          <h3>5.1 项目选择</h3>
          <p>顶部下拉列表选择项目，页面加载该项目的所有文件。</p>

          <h3>5.2 分类筛选</h3>
          <p>Pill 按钮按文件分类筛选：全部 / 合同文件 / 图纸文件 / 汇报材料 / 参考资料 / 其他文件。</p>

          <h3>5.3 文件操作</h3>
          <ul>
            <li><strong>上传</strong> — 拖拽或点击上传，支持 PDF/Word/Excel/PPT/DWG/SKP/ZIP 等</li>
            <li><strong>下载</strong> — 点击下载图标，浏览器自动下载原文件</li>
            <li><strong>删除</strong> — 确认后删除，同时清除磁盘文件</li>
          </ul>

          <h3>5.4 文件信息</h3>
          <p>列表展示每个文件的图标（根据扩展名自动匹配）、文件名、分类、大小、上传时间。</p>
        </section>

        <!-- ============================================================ -->
        <!-- 6. 分类管理 -->
        <!-- ============================================================ -->
        <section :id="sections[5].id">
          <h2 class="font-serif">6. 分类管理 (Categories)</h2>
          <p>访问路径：<code>/admin/categories</code></p>

          <h3>6.1 新建分类</h3>
          <ul>
            <li>填写名称（如「住宅」「商业」「公共建筑」）</li>
            <li>URL 别名自动根据名称生成英文标识（如 residential、commercial）</li>
          </ul>

          <h3>6.2 编辑与删除</h3>
          <ul>
            <li>每个分类旁有删除按钮，确认后删除</li>
            <li>删除分类后，使用该分类的项目分类字段将变为空（不会删除项目）</li>
          </ul>

          <h3>6.3 前台展示</h3>
          <p>分类在首页「按类型浏览」区域和项目筛选页中展示。前台访客可以按分类筛选项目。</p>
        </section>

        <!-- ============================================================ -->
        <!-- 7. 风格管理 -->
        <!-- ============================================================ -->
        <section :id="sections[6].id">
          <h2 class="font-serif">7. 风格管理 (Styles)</h2>
          <p>访问路径：<code>/admin/styles</code></p>

          <h3>7.1 新建风格</h3>
          <ul>
            <li>填写名称（如「现代」「极简」「新中式」）</li>
            <li>URL 别名自动生成</li>
          </ul>

          <h3>7.2 删除风格</h3>
          <p>删除风格后，所有项目中该风格的关联自动清除（多对多关系）。</p>

          <h3>7.3 前台展示</h3>
          <p>风格标签显示在项目卡片和项目详情页上。前台访客可以按风格筛选项目。</p>
        </section>

        <!-- ============================================================ -->
        <!-- 8. FAQ -->
        <!-- ============================================================ -->
        <section :id="sections[7].id">
          <h2 class="font-serif">8. 常见问题 (FAQ)</h2>

          <details class="mb-4 border border-stone-200 rounded-sm">
            <summary class="px-5 py-3 cursor-pointer font-medium text-stone-800 hover:bg-stone-50 transition-colors">Q: 如何修改密码？</summary>
            <div class="px-5 py-3 text-stone-600 text-sm border-t border-stone-200">当前版本暂不支持自助修改密码。请联系系统管理员在数据库中更新密码（bcrypt 加密）。</div>
          </details>

          <details class="mb-4 border border-stone-200 rounded-sm">
            <summary class="px-5 py-3 cursor-pointer font-medium text-stone-800 hover:bg-stone-50 transition-colors">Q: 上传文件失败怎么办？</summary>
            <div class="px-5 py-3 text-stone-600 text-sm border-t border-stone-200">请检查：1) 文件大小是否超过 100MB；2) 文件格式是否在支持列表中；3) 服务器磁盘空间是否充足。如仍无法解决，请联系技术支持。</div>
          </details>

          <details class="mb-4 border border-stone-200 rounded-sm">
            <summary class="px-5 py-3 cursor-pointer font-medium text-stone-800 hover:bg-stone-50 transition-colors">Q: 前台网站没有显示最新修改？</summary>
            <div class="px-5 py-3 text-stone-600 text-sm border-t border-stone-200">前台是静态生成的，修改项目后需要在服务器上执行 <code>npx nuxi generate</code> 重新生成静态文件。如果有 CDN 缓存，还需要刷新 CDN。</div>
          </details>

          <details class="mb-4 border border-stone-200 rounded-sm">
            <summary class="px-5 py-3 cursor-pointer font-medium text-stone-800 hover:bg-stone-50 transition-colors">Q: 项目图片的最佳尺寸是多少？</summary>
            <div class="px-5 py-3 text-stone-600 text-sm border-t border-stone-200">建议封面图使用 16:9 或 4:3 比例，宽度至少 1200px。图集中图片建议宽度 1600-2400px。格式推荐 WebP（体积小质量好）或 JPG。</div>
          </details>

          <details class="mb-4 border border-stone-200 rounded-sm">
            <summary class="px-5 py-3 cursor-pointer font-medium text-stone-800 hover:bg-stone-50 transition-colors">Q: 回款节点的「逾期」是如何判断的？</summary>
            <div class="px-5 py-3 text-stone-600 text-sm border-t border-stone-200">系统自动检测：到期日期已过且状态仍为「待收款」的节点即为逾期。当前版本需要手动标记为「已逾期」或系统定时任务自动标记（计划中）。</div>
          </details>
        </section>

        <!-- ============================================================ -->
        <!-- 9. 技术支持 -->
        <!-- ============================================================ -->
        <section :id="sections[8].id">
          <h2 class="font-serif">9. 技术支持</h2>
          <p>如有任何问题或建议，请通过以下方式联系：</p>
          <ul>
            <li><strong>邮箱</strong>：<a href="mailto:554295000@qq.com">554295000@qq.com</a></li>
            <li><strong>系统版本</strong>：v2.0</li>
            <li><strong>技术栈</strong>：Nuxt 4 + Vue 3 + Express + PostgreSQL + Docker</li>
          </ul>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" })
import AdminHeader from '~/components/admin/layout/AdminHeader.vue'

const sections = [
  { id: 'overview', num: '1', title: '系统概述' },
  { id: 'dashboard', num: '2', title: '仪表盘' },
  { id: 'projects', num: '3', title: '项目管理' },
  { id: 'payments', num: '4', title: '回款管理' },
  { id: 'files', num: '5', title: '文件管理' },
  { id: 'categories', num: '6', title: '分类管理' },
  { id: 'styles', num: '7', title: '风格管理' },
  { id: 'faq', num: '8', title: '常见问题' },
  { id: 'support', num: '9', title: '技术支持' },
]
</script>
