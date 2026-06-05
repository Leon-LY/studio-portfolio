<template>
  <div>
    <AdminHeader title="操作手册" />
    <div class="p-6 max-w-4xl mx-auto">

      <!-- 目录 -->
      <div class="mb-10 p-6 bg-white rounded-sm border border-stone-200 shadow-elevation-1">
        <h2 class="text-lg font-serif font-bold text-stone-900 mb-4">目录</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
          <a v-for="s in sections" :key="s.id" :href="`#${s.id}`" class="text-sm text-stone-600 hover:text-accent-500 transition-colors py-1.5 px-2 rounded hover:bg-stone-50">
            {{ s.num }}. {{ s.title }}
          </a>
        </div>
      </div>

      <!-- ============ 1 ============ -->
      <section :id="sections[0].id" class="mb-10 bg-white rounded-sm border border-stone-200 shadow-elevation-1">
        <div class="px-6 py-4 border-b border-stone-100 bg-stone-50 rounded-t-sm">
          <h2 class="text-base font-serif font-bold text-stone-900">1. 系统概述</h2>
        </div>
        <div class="p-6 space-y-5 text-sm leading-relaxed">

          <div>
            <h3 class="text-sm font-semibold text-stone-800 mb-2">这个系统是做什么的？</h3>
            <p class="text-stone-600">方外设计后台管理系统是一个集作品展示、项目进度、回款追踪、文件归档于一体的管理工具。您在这里添加和编辑建筑项目，项目会自动出现在前台展示网站上；追踪每个项目的回款进度；管理所有项目相关的文件（图纸、合同、汇报材料等）。</p>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-stone-800 mb-2">系统组成</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="p-3 bg-stone-50 rounded-sm border border-stone-100"><span class="font-medium text-stone-700">前台展示网站</span><p class="text-xs text-stone-500 mt-0.5">客户和访客看到的作品集页面</p></div>
              <div class="p-3 bg-stone-50 rounded-sm border border-stone-100"><span class="font-medium text-stone-700">后台管理系统</span><p class="text-xs text-stone-500 mt-0.5">您正在使用的管理界面</p></div>
              <div class="p-3 bg-stone-50 rounded-sm border border-stone-100"><span class="font-medium text-stone-700">后端 API</span><p class="text-xs text-stone-500 mt-0.5">前后台之间的数据桥梁</p></div>
              <div class="p-3 bg-stone-50 rounded-sm border border-stone-100"><span class="font-medium text-stone-700">数据库</span><p class="text-xs text-stone-500 mt-0.5">所有数据的存储位置</p></div>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-stone-800 mb-2">用户角色与权限</h3>
            <div class="overflow-x-auto"><table class="w-full text-sm border border-stone-200">
              <thead><tr class="bg-stone-50"><th class="text-left px-4 py-2 font-medium text-stone-600 border-b border-stone-200">角色</th><th class="text-left px-4 py-2 font-medium text-stone-600 border-b border-stone-200">可以做什么</th><th class="text-left px-4 py-2 font-medium text-stone-600 border-b border-stone-200">不能做什么</th></tr></thead>
              <tbody>
                <tr><td class="px-4 py-2 font-medium text-stone-700 border-b border-stone-100">管理员</td><td class="px-4 py-2 text-stone-600 border-b border-stone-100">增删改查所有内容，管理用户账号，修改他人密码</td><td class="px-4 py-2 text-stone-600 border-b border-stone-100">不能删除自己的账号</td></tr>
                <tr><td class="px-4 py-2 font-medium text-stone-700">编辑者</td><td class="px-4 py-2 text-stone-600">编辑现有项目，上传图片和文件，管理回款</td><td class="px-4 py-2 text-stone-600">不能删除项目，不能管理用户</td></tr>
              </tbody>
            </table></div>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-stone-800 mb-2">界面布局</h3>
            <p class="text-stone-600">登录后，左侧深色竖条是<strong>导航菜单</strong>，点击进入各功能模块。右上角显示当前用户，点击可修改密码或退出。左下角「查看网站」在新标签页打开前台。</p>
          </div>
        </div>
      </section>

      <!-- ============ 2 ============ -->
      <section :id="sections[1].id" class="mb-10 bg-white rounded-sm border border-stone-200 shadow-elevation-1">
        <div class="px-6 py-4 border-b border-stone-100 bg-stone-50 rounded-t-sm">
          <h2 class="text-base font-serif font-bold text-stone-900">2. 仪表盘</h2>
        </div>
        <div class="p-6 space-y-5 text-sm leading-relaxed">
          <p class="text-stone-600">登录后看到的第一个页面，汇总系统最关键的信息。</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-4 bg-stone-50 rounded-sm border border-stone-100">
              <h4 class="font-semibold text-stone-700 mb-1.5">统计卡片</h4>
              <ul class="text-xs text-stone-500 space-y-1">
                <li><strong>项目总数</strong> — 所有项目的数量（不限状态）</li>
                <li><strong>已发布</strong> — 前台可见的项目数</li>
                <li><strong>草稿</strong> — 编辑中、访客不可见的项目数</li>
              </ul>
            </div>
            <div class="p-4 bg-stone-50 rounded-sm border border-stone-100">
              <h4 class="font-semibold text-stone-700 mb-1.5">回款概览 + 近期回款</h4>
              <ul class="text-xs text-stone-500 space-y-1">
                <li>预计回款总额 / 已收款项 / 逾期款项</li>
                <li>30 天内即将到期的回款列表</li>
              </ul>
            </div>
            <div class="p-4 bg-stone-50 rounded-sm border border-stone-100">
              <h4 class="font-semibold text-stone-700 mb-1.5">未读留言</h4>
              <p class="text-xs text-stone-500">橙色数字徽标显示未读留言数量，点击跳转到留言管理页</p>
            </div>
            <div class="p-4 bg-stone-50 rounded-sm border border-stone-100">
              <h4 class="font-semibold text-stone-700 mb-1.5">快捷操作 + 最近项目</h4>
              <p class="text-xs text-stone-500">快速新建项目或查看全部；最近修改的 5 个项目列表</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 3 ============ -->
      <section :id="sections[2].id" class="mb-10 bg-white rounded-sm border border-stone-200 shadow-elevation-1">
        <div class="px-6 py-4 border-b border-stone-100 bg-stone-50 rounded-t-sm">
          <h2 class="text-base font-serif font-bold text-stone-900">3. 项目管理</h2>
        </div>
        <div class="p-6 space-y-5 text-sm leading-relaxed">
          <p class="text-stone-600">系统最核心的模块。左侧菜单「项目」进入列表页。</p>

          <div>
            <h3 class="text-sm font-semibold text-stone-800 mb-2">项目列表</h3>
            <ul class="text-stone-600 space-y-1.5">
              <li>顶部<strong>状态标签</strong>（全部/已发布/草稿/已归档）切换筛选</li>
              <li><strong>搜索框</strong>输入关键词实时筛选项目</li>
              <li>每行显示封面缩略图、标题、分类、状态、更新时间</li>
              <li>操作按钮：<strong>编辑</strong> / <strong>归档/恢复</strong> / <strong>上下箭头</strong>（调整排序）/ <strong>删除</strong></li>
            </ul>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-stone-800 mb-2">新建项目 — 字段说明</h3>
            <div class="overflow-x-auto"><table class="w-full text-sm border border-stone-200">
              <thead><tr class="bg-stone-50"><th class="text-left px-3 py-1.5 font-medium text-stone-600 border-b border-stone-200 w-24">字段</th><th class="text-left px-3 py-1.5 font-medium text-stone-600 border-b border-stone-200">说明</th><th class="text-left px-3 py-1.5 font-medium text-stone-600 border-b border-stone-200 w-16">必填</th></tr></thead>
              <tbody class="text-xs">
                <tr><td class="px-3 py-1.5 font-medium text-stone-700 border-b border-stone-100">项目标题</td><td class="px-3 py-1.5 text-stone-600 border-b border-stone-100">显示在网站首页、列表、详情页。例如「海景别墅」</td><td class="px-3 py-1.5 border-b border-stone-100"><span class="text-green-600 font-medium">是</span></td></tr>
                <tr><td class="px-3 py-1.5 font-medium text-stone-700 border-b border-stone-100">URL 标识符</td><td class="px-3 py-1.5 text-stone-600 border-b border-stone-100">自动根据标题生成，用于网址。可手动修改</td><td class="px-3 py-1.5 border-b border-stone-100"><span class="text-green-600 font-medium">是</span></td></tr>
                <tr><td class="px-3 py-1.5 font-medium text-stone-700 border-b border-stone-100">分类</td><td class="px-3 py-1.5 text-stone-600 border-b border-stone-100">下拉选择一个分类（需先在「分类」中创建）</td><td class="px-3 py-1.5 border-b border-stone-100 text-stone-400">否</td></tr>
                <tr><td class="px-3 py-1.5 font-medium text-stone-700 border-b border-stone-100">状态</td><td class="px-3 py-1.5 text-stone-600 border-b border-stone-100">草稿（不可见）/ 已发布（前台可见）/ 已归档（隐藏但保留）</td><td class="px-3 py-1.5 border-b border-stone-100"><span class="text-green-600 font-medium">是</span></td></tr>
                <tr><td class="px-3 py-1.5 font-medium text-stone-700 border-b border-stone-100">项目阶段</td><td class="px-3 py-1.5 text-stone-600 border-b border-stone-100">下拉选择当前所处阶段，与看板同步</td><td class="px-3 py-1.5 border-b border-stone-100 text-stone-400">否</td></tr>
                <tr><td class="px-3 py-1.5 font-medium text-stone-700 border-b border-stone-100">建筑风格</td><td class="px-3 py-1.5 text-stone-600 border-b border-stone-100">多选标签（需先在「风格」中创建）</td><td class="px-3 py-1.5 border-b border-stone-100 text-stone-400">否</td></tr>
                <tr><td class="px-3 py-1.5 font-medium text-stone-700 border-b border-stone-100">项目简介</td><td class="px-3 py-1.5 text-stone-600 border-b border-stone-100">简短描述，显示在项目卡片上（建议 1-2 句话）</td><td class="px-3 py-1.5 border-b border-stone-100 text-stone-400">否</td></tr>
                <tr><td class="px-3 py-1.5 font-medium text-stone-700 border-b border-stone-100">正文内容</td><td class="px-3 py-1.5 text-stone-600 border-b border-stone-100">详细项目介绍，显示在详情页</td><td class="px-3 py-1.5 border-b border-stone-100 text-stone-400">否</td></tr>
                <tr><td class="px-3 py-1.5 font-medium text-stone-700 border-b border-stone-100">位置/客户/面积/日期</td><td class="px-3 py-1.5 text-stone-600 border-b border-stone-100">项目基本信息，选填</td><td class="px-3 py-1.5 border-b border-stone-100 text-stone-400">否</td></tr>
                <tr><td class="px-3 py-1.5 font-medium text-stone-700 border-b border-stone-100">精选项目</td><td class="px-3 py-1.5 text-stone-600 border-b border-stone-100">勾选后出现在首页「精选作品」区域</td><td class="px-3 py-1.5 border-b border-stone-100 text-stone-400">否</td></tr>
                <tr><td class="px-3 py-1.5 font-medium text-stone-700">SEO 设置</td><td class="px-3 py-1.5 text-stone-600">控制搜索引擎中如何展示。不影响页面实际显示，留空使用默认值</td><td class="px-3 py-1.5 text-stone-400">否</td></tr>
              </tbody>
            </table></div>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-stone-800 mb-2">编辑项目 — 四个标签页</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="p-3 bg-stone-50 rounded-sm border border-stone-100"><span class="font-medium text-stone-700">基本信息</span><p class="text-xs text-stone-500 mt-0.5">与新建相同的表单，修改后点「保存更改」</p></div>
              <div class="p-3 bg-stone-50 rounded-sm border border-stone-100"><span class="font-medium text-stone-700">图片管理</span><p class="text-xs text-stone-500 mt-0.5">上传/删除/设封面，支持 JPG/PNG/WebP</p></div>
              <div class="p-3 bg-stone-50 rounded-sm border border-stone-100"><span class="font-medium text-stone-700">项目文件</span><p class="text-xs text-stone-500 mt-0.5">上传各类文档附件，支持在线预览</p></div>
              <div class="p-3 bg-stone-50 rounded-sm border border-stone-100"><span class="font-medium text-stone-700">回款节点</span><p class="text-xs text-stone-500 mt-0.5">管理该项目的收款阶段和金额</p></div>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-stone-800 mb-2">项目状态流转</h3>
            <div class="p-3 bg-stone-50 rounded-sm border border-stone-100 text-center font-medium text-stone-700">草稿 → 已发布 ⇄ 已归档</div>
            <p class="text-xs text-stone-400 mt-2">推荐流程：新建 → 草稿 → 编辑内容、上传图片 → 满意后切换到「已发布」→ 项目自动出现在网站</p>
          </div>
        </div>
      </section>

      <!-- ============ 4 ============ -->
      <section :id="sections[3].id" class="mb-10 bg-white rounded-sm border border-stone-200 shadow-elevation-1">
        <div class="px-6 py-4 border-b border-stone-100 bg-stone-50 rounded-t-sm">
          <h2 class="text-base font-serif font-bold text-stone-900">4. 项目看板</h2>
        </div>
        <div class="p-6 space-y-4 text-sm leading-relaxed">
          <p class="text-stone-600">左侧菜单「看板」进入。可视化项目管理工具，6 列对应 6 个阶段：</p>
          <div class="flex flex-wrap gap-2 text-xs">
            <span class="px-3 py-1.5 bg-stone-100 rounded-full text-stone-600 font-medium">1. 前期接洽</span>
            <span class="px-3 py-1.5 bg-stone-100 rounded-full text-stone-600 font-medium">2. 方案设计</span>
            <span class="px-3 py-1.5 bg-stone-100 rounded-full text-stone-600 font-medium">3. 扩初设计</span>
            <span class="px-3 py-1.5 bg-stone-100 rounded-full text-stone-600 font-medium">4. 施工图设计</span>
            <span class="px-3 py-1.5 bg-stone-100 rounded-full text-stone-600 font-medium">5. 施工配合</span>
            <span class="px-3 py-1.5 bg-stone-100 rounded-full text-stone-600 font-medium">6. 项目竣工</span>
          </div>
          <ul class="text-stone-600 space-y-1.5">
            <li><strong>拖拽项目卡片</strong>到目标列即可切换阶段</li>
            <li><strong>点击卡片</strong>直接跳转到编辑页</li>
            <li>与项目表单中的「项目阶段」下拉框<strong>同步</strong></li>
          </ul>
        </div>
      </section>

      <!-- ============ 5 ============ -->
      <section :id="sections[4].id" class="mb-10 bg-white rounded-sm border border-stone-200 shadow-elevation-1">
        <div class="px-6 py-4 border-b border-stone-100 bg-stone-50 rounded-t-sm">
          <h2 class="text-base font-serif font-bold text-stone-900">5. 回款管理</h2>
        </div>
        <div class="p-6 space-y-5 text-sm leading-relaxed">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-4 bg-stone-50 rounded-sm border border-stone-100">
              <h4 class="font-semibold text-stone-700 mb-1.5">列表视图</h4>
              <ol class="text-xs text-stone-500 space-y-1 list-decimal list-inside">
                <li>从顶部下拉列表选择项目</li>
                <li>查看该项目的所有回款节点</li>
                <li>顶部状态栏显示合计、已收、逾期</li>
                <li>点击绿色对勾标记已收款</li>
                <li>铅笔编辑，垃圾桶删除</li>
              </ol>
            </div>
            <div class="p-4 bg-stone-50 rounded-sm border border-stone-100">
              <h4 class="font-semibold text-stone-700 mb-1.5">日历视图</h4>
              <ul class="text-xs text-stone-500 space-y-1">
                <li>月历形式展示所有回款节点</li>
                <li>颜色：黄=待收 / 绿=已收 / 红=逾期</li>
                <li><strong>点击金额条</strong>直接打开编辑窗口</li>
                <li>左右箭头切换月份</li>
              </ul>
            </div>
          </div>
          <p class="text-xs text-stone-400">💡 当到期日期已过但状态仍为「待收款」时，系统自动标记为逾期（红色）。</p>
        </div>
      </section>

      <!-- ============ 6 ============ -->
      <section :id="sections[5].id" class="mb-10 bg-white rounded-sm border border-stone-200 shadow-elevation-1">
        <div class="px-6 py-4 border-b border-stone-100 bg-stone-50 rounded-t-sm">
          <h2 class="text-base font-serif font-bold text-stone-900">6. 文件管理</h2>
        </div>
        <div class="p-6 space-y-4 text-sm leading-relaxed">
          <p class="text-stone-600">左侧菜单「文件管理」进入。全局视图，按项目浏览和管理所有附件。</p>
          <ol class="text-stone-600 space-y-1.5 list-decimal list-inside">
            <li>从顶部下拉列表<strong>选择项目</strong></li>
            <li>上方显示<strong>分类筛选</strong>按钮（全部/合同/图纸等）</li>
            <li>拖拽或点击<strong>上传文件</strong>（支持 PDF/Word/Excel/PPT/CAD/SKP/ZIP 等，单文件最大 100MB）</li>
            <li>文件列表展示：类型图标、文件名、分类下拉框、大小、时间</li>
          </ol>
          <div>
            <h4 class="font-semibold text-stone-700 mb-1.5">文件预览</h4>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div class="p-2 bg-stone-50 rounded-sm border border-stone-100 text-center">
                <p class="font-medium text-stone-600">图片</p><p class="text-stone-400">灯箱预览</p>
              </div>
              <div class="p-2 bg-stone-50 rounded-sm border border-stone-100 text-center">
                <p class="font-medium text-stone-600">Office 文档</p><p class="text-stone-400">自动转 PDF 预览</p>
              </div>
              <div class="p-2 bg-stone-50 rounded-sm border border-stone-100 text-center">
                <p class="font-medium text-stone-600">PDF</p><p class="text-stone-400">浏览器直接打开</p>
              </div>
              <div class="p-2 bg-stone-50 rounded-sm border border-stone-100 text-center">
                <p class="font-medium text-stone-600">CAD / 其他</p><p class="text-stone-400">下载到本地打开</p>
              </div>
            </div>
            <p class="text-xs text-stone-400 mt-2">点击 👁 预览，点击 ⬇ 下载原始文件。Office 文件预览时会自动转为 PDF。</p>
          </div>
        </div>
      </section>

      <!-- ============ 7 ============ -->
      <section :id="sections[6].id" class="mb-10 bg-white rounded-sm border border-stone-200 shadow-elevation-1">
        <div class="px-6 py-4 border-b border-stone-100 bg-stone-50 rounded-t-sm">
          <h2 class="text-base font-serif font-bold text-stone-900">7. 分类管理</h2>
        </div>
        <div class="p-6 space-y-3 text-sm leading-relaxed">
          <p class="text-stone-600">左侧菜单「分类」进入。用于按类型组织和筛选作品（住宅、商业、公共建筑等）。</p>
          <ul class="text-stone-600 space-y-1.5">
            <li><strong>新建</strong>：输入名称 → 标识符自动生成 → 保存</li>
            <li><strong>编辑</strong>：点击铅笔图标修改名称、标识符或描述</li>
            <li><strong>首页可见</strong>：点击眼睛图标切换。睁眼 = 首页显示，闭眼 = 首页隐藏（筛选页仍可用）</li>
            <li><strong>删除</strong>：垃圾桶图标，仅删除分类不影响项目</li>
          </ul>
        </div>
      </section>

      <!-- ============ 8 ============ -->
      <section :id="sections[7].id" class="mb-10 bg-white rounded-sm border border-stone-200 shadow-elevation-1">
        <div class="px-6 py-4 border-b border-stone-100 bg-stone-50 rounded-t-sm">
          <h2 class="text-base font-serif font-bold text-stone-900">8. 风格管理</h2>
        </div>
        <div class="p-6 space-y-3 text-sm leading-relaxed">
          <p class="text-stone-600">左侧菜单「风格」进入。描述建筑风格（现代、极简、新中式等）。操作方式与分类完全一致：新建、编辑、删除。一个项目可以有多个风格标签。</p>
          <p class="text-xs text-stone-400">💡 风格标签显示在项目卡片、详情页、前台筛选页。</p>
        </div>
      </section>

      <!-- ============ 9 ============ -->
      <section :id="sections[8].id" class="mb-10 bg-white rounded-sm border border-stone-200 shadow-elevation-1">
        <div class="px-6 py-4 border-b border-stone-100 bg-stone-50 rounded-t-sm">
          <h2 class="text-base font-serif font-bold text-stone-900">9. 留言管理</h2>
        </div>
        <div class="p-6 space-y-3 text-sm leading-relaxed">
          <p class="text-stone-600">左侧菜单「留言」进入。当前台联系表单有人提交时，留言自动存入数据库并在此显示。</p>
          <ul class="text-stone-600 space-y-1.5">
            <li><strong>橙色圆点</strong> = 未读，<strong>灰色对勾</strong> = 已读</li>
            <li><strong>点击行展开</strong>查看完整留言内容和手机号</li>
            <li>处理完毕后点击<strong>「标为已读」</strong></li>
            <li>仪表盘会显示未读留言数量徽标</li>
          </ul>
        </div>
      </section>

      <!-- ============ 10 ============ -->
      <section :id="sections[9].id" class="mb-10 bg-white rounded-sm border border-stone-200 shadow-elevation-1">
        <div class="px-6 py-4 border-b border-stone-100 bg-stone-50 rounded-t-sm">
          <h2 class="text-base font-serif font-bold text-stone-900">10. 用户管理</h2>
        </div>
        <div class="p-6 space-y-4 text-sm leading-relaxed">
          <p class="text-stone-600">左侧菜单「用户管理」进入。<strong>仅管理员可访问</strong>。管理可以登录后台的账号。</p>
          <ul class="text-stone-600 space-y-1.5">
            <li><strong>新增</strong>：填写邮箱（登录账号）、密码（≥6位）、姓名、选择角色</li>
            <li><strong>编辑</strong>：修改姓名和角色（邮箱不可改）</li>
            <li><strong>改密</strong>：管理员可直接设新密码；修改自己的密码需验证当前密码</li>
            <li><strong>删除</strong>：不能删除自己，不能删除最后一个管理员</li>
          </ul>
        </div>
      </section>

      <!-- ============ 11 ============ -->
      <section :id="sections[10].id" class="mb-10 bg-white rounded-sm border border-stone-200 shadow-elevation-1">
        <div class="px-6 py-4 border-b border-stone-100 bg-stone-50 rounded-t-sm">
          <h2 class="text-base font-serif font-bold text-stone-900">11. 站点设置</h2>
        </div>
        <div class="p-6 space-y-4 text-sm leading-relaxed">
          <p class="text-stone-600">左侧菜单「站点设置」进入。自定义前台网站的显示内容，无需修改代码。</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="p-3 bg-stone-50 rounded-sm border border-stone-100">
              <h4 class="font-semibold text-stone-700 mb-1">Hero 背景图</h4>
              <p class="text-xs text-stone-500">拖拽上传首页全屏背景图。留空则自动使用第一个精选项目的封面图</p>
            </div>
            <div class="p-3 bg-stone-50 rounded-sm border border-stone-100">
              <h4 class="font-semibold text-stone-700 mb-1">站点信息</h4>
              <p class="text-xs text-stone-500">站点名称、描述、首页 Slogan、副标题</p>
            </div>
            <div class="p-3 bg-stone-50 rounded-sm border border-stone-100">
              <h4 class="font-semibold text-stone-700 mb-1">联系信息</h4>
              <p class="text-xs text-stone-500">邮箱、地址、电话 — 显示在 Footer 和联系页</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ 12 ============ -->
      <section :id="sections[11].id" class="mb-10 bg-white rounded-sm border border-stone-200 shadow-elevation-1">
        <div class="px-6 py-4 border-b border-stone-100 bg-stone-50 rounded-t-sm">
          <h2 class="text-base font-serif font-bold text-stone-900">12. 常见问题</h2>
        </div>
        <div class="divide-y divide-stone-100">
          <details class="group">
            <summary class="px-6 py-3 cursor-pointer text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition-colors">Q: 新建了项目为什么前台不显示？</summary>
            <div class="px-6 pb-4 text-sm text-stone-500">检查三点：项目状态是否为「已发布」？是否勾选了「精选项目」？前台数据是动态加载的，发布后刷新即可看到。</div>
          </details>
          <details class="group">
            <summary class="px-6 py-3 cursor-pointer text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition-colors">Q: 如何修改自己的密码？</summary>
            <div class="px-6 pb-4 text-sm text-stone-500">右上角用户名称 →「修改密码」→ 输入当前密码和新密码（≥6位）。</div>
          </details>
          <details class="group">
            <summary class="px-6 py-3 cursor-pointer text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition-colors">Q: 上传的图片最佳尺寸？</summary>
            <div class="px-6 pb-4 text-sm text-stone-500">封面图：宽度≥1200px，比例 4:3 或 16:9。图集：1600-2400px。推荐 WebP 或 JPG 格式，单张≤10MB。</div>
          </details>
          <details class="group">
            <summary class="px-6 py-3 cursor-pointer text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition-colors">Q: 中文文件名为什么乱码？</summary>
            <div class="px-6 pb-4 text-sm text-stone-500">已修复。新上传的文件名正常显示。旧文件如有乱码请删除重新上传。</div>
          </details>
          <details class="group">
            <summary class="px-6 py-3 cursor-pointer text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition-colors">Q: 前台手机上看还是旧的？</summary>
            <div class="px-6 pb-4 text-sm text-stone-500">浏览器缓存问题。按 Ctrl+F5 强制刷新，或清除浏览器缓存后重新打开。</div>
          </details>
          <details class="group">
            <summary class="px-6 py-3 cursor-pointer text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition-colors">Q: 编辑者和管理员的区别？</summary>
            <div class="px-6 pb-4 text-sm text-stone-500">管理员可删项目、管用户。编辑者不可删项目、不可管用户。后端强制执行。</div>
          </details>
          <details class="group">
            <summary class="px-6 py-3 cursor-pointer text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition-colors">Q: 如何调整首页项目顺序？</summary>
            <div class="px-6 pb-4 text-sm text-stone-500">项目列表中每行右侧有上下箭头，点击可交换相邻项目排序。</div>
          </details>
          <details class="group">
            <summary class="px-6 py-3 cursor-pointer text-sm font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition-colors">Q: 可以把项目链接发给客户看吗？</summary>
            <div class="px-6 pb-4 text-sm text-stone-500">可以。网址格式：<code>http://49.232.49.175:3000/projects/项目标识符</code>。客户在浏览器中即可查看完整项目信息。</div>
          </details>
        </div>
      </section>

      <!-- ============ 13 ============ -->
      <section :id="sections[12].id" class="mb-10 bg-white rounded-sm border border-stone-200 shadow-elevation-1">
        <div class="px-6 py-4 border-b border-stone-100 bg-stone-50 rounded-t-sm">
          <h2 class="text-base font-serif font-bold text-stone-900">13. 技术支持</h2>
        </div>
        <div class="p-6 text-sm leading-relaxed text-stone-600 space-y-1">
          <p>📧 <strong>邮箱</strong>：<a href="mailto:554295000@qq.com" class="text-accent-500 hover:underline">554295000@qq.com</a></p>
          <p>📍 <strong>地址</strong>：山东 · 威海</p>
          <p>🔖 <strong>版本</strong>：v2.2</p>
        </div>
      </section>

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
  { id: 'board', num: '4', title: '项目看板' },
  { id: 'payments', num: '5', title: '回款管理' },
  { id: 'files', num: '6', title: '文件管理' },
  { id: 'categories', num: '7', title: '分类管理' },
  { id: 'styles', num: '8', title: '风格管理' },
  { id: 'contacts', num: '9', title: '留言管理' },
  { id: 'users', num: '10', title: '用户管理' },
  { id: 'settings', num: '11', title: '站点设置' },
  { id: 'faq', num: '12', title: '常见问题' },
  { id: 'support', num: '13', title: '技术支持' },
]
</script>
