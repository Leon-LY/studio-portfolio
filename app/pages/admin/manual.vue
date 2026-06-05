<template>
  <div>
    <AdminHeader title="操作手册" />

    <div class="p-6 max-w-4xl">
      <!-- 目录 -->
      <div class="mb-10 p-6 bg-stone-50 rounded-sm border border-stone-200">
        <h2 class="text-lg font-serif font-bold text-stone-900 mb-4">目录</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <a v-for="section in sections" :key="section.id" :href="`#${section.id}`" class="text-sm text-stone-600 hover:text-accent-500 transition-colors py-1">
            {{ section.num }}. {{ section.title }}
          </a>
        </div>
      </div>

      <div class="prose prose-stone max-w-none space-y-12">

        <!-- ============================================================ -->
        <!-- 1. 系统概述 -->
        <!-- ============================================================ -->
        <section :id="sections[0].id">
          <h2 class="font-serif">1. 系统概述</h2>

          <h3>1.1 这个系统是做什么的？</h3>
          <p>
            方外设计后台管理系统是一个<strong>集作品展示、项目进度、回款追踪、文件归档于一体的管理工具</strong>。简单来说，您在这里：
          </p>
          <ul>
            <li>添加和编辑建筑项目（包括图片、文字描述、技术参数）</li>
            <li>这些项目会<strong>自动出现在前台展示网站</strong>上，无需手动刷新</li>
            <li>追踪每个项目的回款进度（到了哪个阶段、收了多少钱、还有哪些没收）</li>
            <li>管理所有项目相关的文件（图纸、合同、汇报材料等）</li>
          </ul>

          <h3>1.2 系统由哪几部分组成？</h3>
          <div class="p-4 bg-stone-50 rounded-sm border border-stone-200 text-sm">
            <p class="font-medium mb-2">简单理解：</p>
            <ul class="mt-0 space-y-1">
              <li><strong>前台展示网站</strong> — 客户和访客看到的作品集页面（<code>/</code>、<code>/projects</code> 等）</li>
              <li><strong>后台管理系统</strong> — 您正在使用的这个管理界面（<code>/admin/*</code>）</li>
              <li><strong>后端 API</strong> — 后台和前台之间的"桥梁"，负责存取数据</li>
              <li><strong>数据库</strong> — 所有数据（项目、图片、用户等）的存储位置</li>
            </ul>
          </div>

          <h3>1.3 用户角色与权限</h3>
          <table>
            <thead><tr><th>角色</th><th>可以做什么</th><th>不能做什么</th></tr></thead>
            <tbody>
              <tr>
                <td><strong>管理员</strong></td>
                <td>增删改查所有内容（项目、分类、风格、文件、回款），管理用户账号，修改他人密码</td>
                <td>不能删除自己的账号</td>
              </tr>
              <tr>
                <td><strong>编辑者</strong></td>
                <td>编辑现有项目，上传图片和文件，管理回款节点，使用文件管理功能</td>
                <td>不能删除项目，不能管理用户</td>
              </tr>
            </tbody>
          </table>

          <h3>1.4 界面布局说明</h3>
          <p>登录后，页面左侧是<strong>导航菜单</strong>（深色竖条），点击可进入不同功能模块。右上角显示当前登录用户，点击可修改密码或退出登录。</p>
          <p>导航菜单从上到下依次为：仪表盘 → 项目 → 回款管理 → 文件管理 → 分类 → 风格 → 用户管理 → 操作手册。点击「查看网站」可在新标签页打开前台展示网站。</p>
        </section>

        <!-- ============================================================ -->
        <!-- 2. 仪表盘 -->
        <!-- ============================================================ -->
        <section :id="sections[1].id">
          <h2 class="font-serif">2. 仪表盘</h2>
          <p><strong>仪表盘是您登录后看到的第一个页面</strong>，它汇总了整个系统最关键的信息，让您一眼了解当前状态。</p>

          <h3>2.1 顶部统计卡片（三张）</h3>
          <ul>
            <li><strong>项目总数</strong> — 系统中所有项目的数量（包括草稿、已发布、已归档）</li>
            <li><strong>已发布</strong> — 当前在前台网站上可见的项目数量</li>
            <li><strong>草稿</strong> — 还在编辑中、访客看不到的项目数量</li>
          </ul>
          <p class="text-sm text-stone-500">提示：点击数字不会跳转，仅作统计展示。</p>

          <h3>2.2 回款概览</h3>
          <ul>
            <li><strong>预计回款总额</strong> — 所有项目所有回款节点的金额加起来的总数</li>
            <li><strong>已收款项</strong>（绿色） — 已经实际收到的钱</li>
            <li><strong>逾期款项</strong>（红色） — 到期日已过但还没收到的钱，后面标注了几笔逾期</li>
          </ul>

          <h3>2.3 快捷操作</h3>
          <p>「新建项目」按钮直接跳到创建项目页面。「查看全部项目」进入完整的项目列表。这两个按钮让您无需从左侧菜单导航。</p>

          <h3>2.4 最近项目</h3>
          <p>按最近修改时间排序，展示最近 5 个项目。每行显示封面缩略图、项目标题、更新时间、状态标签（草稿/已发布/已归档）。</p>
        </section>

        <!-- ============================================================ -->
        <!-- 3. 项目管理 -->
        <!-- ============================================================ -->
        <section :id="sections[2].id">
          <h2 class="font-serif">3. 项目管理</h2>
          <p><strong>这是整个系统最核心的模块。</strong>项目列表页在左侧菜单点击「项目」进入。</p>

          <h3>3.1 项目列表怎么用？</h3>
          <p>列表页顶部有一排<strong>状态标签</strong>（全部 / 已发布 / 草稿 / 已归档），点击可以只看某种状态的项目。</p>
          <p>右侧有<strong>搜索框</strong>，输入项目名称关键词即可实时筛选。右侧还有「新建项目」按钮。</p>
          <p>列表中每一行是一个项目，显示：封面缩略图 → 项目名称 → 分类 → 状态标签 → 更新时间 → 操作按钮。</p>

          <h4>操作按钮说明：</h4>
          <ul>
            <li><strong>编辑</strong> — 进入项目编辑页面（详见 3.3）</li>
            <li><strong>归档</strong> — 将已发布的项目从网站上隐藏（数据保留，可以恢复）</li>
            <li><strong>恢复</strong> — 将已归档的项目重新发布到网站上</li>
            <li><strong>删除图标</strong>（红色垃圾桶） — 永久删除项目，<strong>此操作不可撤销</strong></li>
          </ul>

          <h3>3.2 如何新建一个项目？</h3>
          <p>点击「新建项目」按钮进入创建页面。以下是每个字段的详细说明：</p>

          <table>
            <thead><tr><th>字段名称</th><th>说明</th><th>是否必填</th></tr></thead>
            <tbody>
              <tr><td><strong>项目标题</strong></td><td>项目的名称，会显示在网站首页、项目列表和详情页。例如「海景别墅」「市图书馆」</td><td>✅ 必填</td></tr>
              <tr><td><strong>URL 标识符</strong></td><td>自动根据标题生成，用于网址。例如标题「海景别墅」会生成 <code>/projects/海景别墅</code>。如果标题改变后与自动生成的不一致，可手动编辑</td><td>✅ 必填</td></tr>
              <tr><td><strong>分类</strong></td><td>从下拉列表选择一个分类（住宅、商业、公共建筑等）。分类需事先在「分类管理」中创建</td><td>选填</td></tr>
              <tr><td><strong>状态</strong></td><td>草稿 = 不对外显示；已发布 = 网站上可见；已归档 = 从网站隐藏但保留数据</td><td>✅ 必填</td></tr>
              <tr><td><strong>建筑风格</strong></td><td>可以多选（点击多个标签）。例如一个项目可以同时是「现代」+「极简」。风格需事先在「风格管理」中创建</td><td>选填</td></tr>
              <tr><td><strong>项目简介</strong></td><td>简短的文字描述，显示在项目卡片上。建议 1-2 句话，100-200 字</td><td>选填</td></tr>
              <tr><td><strong>正文内容</strong></td><td>详细的项目介绍，显示在项目详情页。可以写多段文字，描述设计理念、施工过程、材料选择等</td><td>选填</td></tr>
              <tr><td><strong>位置</strong></td><td>项目所在地，例如「山东·威海」「北京·朝阳」</td><td>选填</td></tr>
              <tr><td><strong>客户</strong></td><td>甲方或业主的名称</td><td>选填</td></tr>
              <tr><td><strong>面积（m²）</strong></td><td>建筑面积，只填数字即可。例如「500」</td><td>选填</td></tr>
              <tr><td><strong>完成日期</strong></td><td>项目竣工或交付的日期</td><td>选填</td></tr>
              <tr><td><strong>精选项目</strong></td><td>勾选后，该项目会出现在网站首页「精选作品」区域（最多显示 6 个）</td><td>选填</td></tr>
            </tbody>
          </table>

          <h4>SEO 设置（可折叠展开）</h4>
          <p><strong>SEO</strong> 是"搜索引擎优化"的缩写。简单来说，当有人在百度或 Google 搜索时，这些设置会影响您的项目在搜索结果中如何显示。</p>
          <ul>
            <li><strong>SEO 标题</strong> — 搜索结果中显示的标题。如果不填，默认使用「项目标题」</li>
            <li><strong>SEO 描述</strong> — 搜索结果中显示的摘要文字。如果不填，默认使用「项目简介」</li>
          </ul>
          <p class="text-sm text-stone-500">💡 这两个字段不会影响网站上的实际显示，只影响搜索引擎。如果您不确定填什么，可以留空，系统会使用默认值。</p>

          <p>填写完毕后，点击底部「创建项目」按钮。成功后会自动跳转到项目编辑页面，您可以继续上传图片和文件。</p>

          <h3>3.3 编辑项目（四个标签页）</h3>
          <p>编辑页面顶部有四个标签，分别管理项目的不同方面：</p>

          <h4>标签一：基本信息</h4>
          <p>与新建项目相同的表单，可以修改任何字段。修改后点击「保存更改」。</p>

          <h4>标签二：图片管理</h4>
          <p><strong>这是最重要的标签之一。</strong>网站的视觉效果很大程度上取决于这里的图片。</p>
          <ul>
            <li><strong>如何上传</strong>：点击虚线区域选择文件，或直接拖拽图片文件到该区域。支持 JPG、PNG、WebP 格式，单张不超过 10MB</li>
            <li><strong>设为封面</strong>：点击图片上的星标图标 ⭐。封面图会显示在项目列表、首页卡片和项目详情页顶部</li>
            <li><strong>图片排序</strong>：图片按上传顺序排列。第一张上传的图片自动成为封面</li>
            <li><strong>删除图片</strong>：点击垃圾桶图标，确认后删除（文件会从服务器上永久移除）</li>
          </ul>
          <p class="text-sm text-stone-500">💡 建议上传前先将图片处理为合适尺寸（宽度 1200-2400px），太大影响加载速度，太小影响清晰度。</p>

          <h4>标签三：项目文件</h4>
          <p>上传与项目相关的各类文档附件：</p>
          <ul>
            <li><strong>支持的格式</strong>：PDF、Word (.doc/.docx)、Excel (.xls/.xlsx)、PPT (.ppt/.pptx)、CAD 图纸 (.dwg/.dxf)、SketchUp 模型 (.skp)、Revit 文件 (.rvt/.rfa)、压缩包 (.zip/.rar/.7z)、纯文本 (.txt/.csv)</li>
            <li><strong>文件大小限制</strong>：单个文件不超过 100MB</li>
            <li><strong>文件分类</strong>：上传前可以选择分类（如合同、图纸、汇报材料），方便后续筛选。上传后也可以在下方的文件列表中直接修改分类</li>
            <li><strong>下载</strong>：点击下载图标 ⬇ 即可下载原文件</li>
            <li><strong>删除</strong>：点击垃圾桶图标，确认后删除（文件从服务器永久移除）</li>
          </ul>

          <h4>标签四：回款节点</h4>
          <p>管理该项目的收款进度（详见第 4 章）。</p>
          <ul>
            <li>顶部显示<strong>合计金额</strong>和<strong>已收金额</strong></li>
            <li>点击「新增回款节点」添加一个收款阶段</li>
            <li>每个节点有：名称、到期日期、金额、状态</li>
            <li>点击绿色对勾 ✓ 标记为已收款</li>
            <li>铅笔图标编辑，垃圾桶图标删除</li>
          </ul>

          <h3>3.4 项目状态流转（重要概念）</h3>
          <div class="p-4 bg-stone-50 rounded-sm border border-stone-200">
            <p class="font-mono text-sm text-stone-600 text-center font-bold">
              草稿 (Draft) → 已发布 (Published) ⇄ 已归档 (Archived)
            </p>
          </div>
          <ul class="mt-3">
            <li><strong>草稿</strong> — 正在编辑中的项目。只有登录后台的人能看到，前台网站不显示</li>
            <li><strong>已发布</strong> — 项目已完成，在前台网站上公开展示。任何访客都可以看到</li>
            <li><strong>已归档</strong> — 项目从前台网站隐藏（例如已完工多年的旧项目），但所有数据完整保留。归档后可以随时「恢复」回已发布状态</li>
          </ul>
          <p class="text-sm text-stone-500">💡 工作流程建议：新建项目 → 状态选「草稿」→ 编辑内容、上传图片 → 满意后切换到「已发布」→ 项目自动出现在网站上</p>
        </section>

        <!-- ============================================================ -->
        <!-- 4. 回款管理 -->
        <!-- ============================================================ -->
        <section :id="sections[3].id">
          <h2 class="font-serif">4. 回款管理</h2>
          <p>访问路径：左侧菜单 → 「回款管理」</p>
          <p>回款管理帮助您追踪每个项目的收款进度。可以按项目查看，也可以用日历视图全局查看。</p>

          <h3>4.1 列表视图</h3>
          <p><strong>使用步骤：</strong></p>
          <ol>
            <li>从顶部下拉列表<strong>选择一个项目</strong></li>
            <li>页面加载该项目的所有回款节点</li>
            <li>顶部状态栏显示：共几个节点、合计金额、已收金额、逾期笔数</li>
            <li>每个节点一行，显示：<strong>状态圆点</strong>（黄=待收 / 绿=已收 / 红=逾期）→ 名称 → 状态标签 → 到期日期 → 金额 → 操作按钮</li>
          </ol>
          <p><strong>操作按钮：</strong></p>
          <ul>
            <li>绿色对勾 ✓ — 标记为「已收款」（该笔钱已经到账）</li>
            <li>铅笔 ✏ — 编辑节点信息（修改名称、日期、金额）</li>
            <li>垃圾桶 🗑 — 删除该节点</li>
          </ul>
          <p>点击「新增回款节点」按钮可以添加新的收款阶段。</p>

          <h3>4.2 日历视图</h3>
          <p>切换到「日历视图」标签后，您可以看到<strong>所有项目的回款节点以月历形式展示</strong>：</p>
          <ul>
            <li>每个日期格子里会显示当天到期的回款金额</li>
            <li>颜色含义与列表视图一致：黄色 = 待收款，绿色 = 已收款，红色 = 逾期</li>
            <li>鼠标悬停可以看到完整的节点名称和金额</li>
            <li><strong>点击金额条可以直接打开编辑窗口</strong>，修改节点信息</li>
            <li>左右箭头切换月份</li>
          </ul>

          <h3>4.3 什么是「逾期」？</h3>
          <p>当回款节点的<strong>到期日期已经过去</strong>，但状态仍然是「待收款」时，系统自动将其标记为逾期（红色显示）。建议定期查看日历视图，及时发现逾期的回款。</p>
        </section>

        <!-- ============================================================ -->
        <!-- 5. 文件管理 -->
        <!-- ============================================================ -->
        <section :id="sections[4].id">
          <h2 class="font-serif">5. 文件管理</h2>
          <p>访问路径：左侧菜单 → 「文件管理」</p>
          <p>文件管理是一个<strong>全局视图</strong>，让您按项目浏览和管理所有上传的附件，而不需要进入每个项目的编辑页。</p>

          <h3>5.1 基本操作流程</h3>
          <ol>
            <li>从顶部下拉列表<strong>选择一个项目</strong></li>
            <li>页面加载该项目的所有文件</li>
            <li>上方显示<strong>分类筛选按钮</strong>（全部 / 合同 / 图纸 / 汇报材料等），点击只看某一类文件</li>
            <li>下方是<strong>上传区域</strong>，使用方式与项目编辑页中的文件上传相同</li>
            <li>再下方是<strong>文件列表</strong>，表格展示每个文件的详细信息</li>
          </ol>

          <h3>5.2 文件列表说明</h3>
          <p>文件列表中每一行包含：</p>
          <ul>
            <li><strong>文件图标</strong> — 根据文件类型自动匹配（PDF 红色、Word 蓝色、Excel 绿色、CAD 紫色等）</li>
            <li><strong>文件名</strong> — 上传时的原始文件名</li>
            <li><strong>分类</strong> — 可以直接在下拉框中修改文件的分类，无需进入编辑页</li>
            <li><strong>文件大小</strong> — 自动计算并显示（B / KB / MB）</li>
            <li><strong>上传时间</strong> — 文件上传的日期</li>
            <li><strong>操作</strong> — 下载（⬇）和删除（🗑）</li>
          </ul>
        </section>

        <!-- ============================================================ -->
        <!-- 6. 分类管理 -->
        <!-- ============================================================ -->
        <section :id="sections[5].id">
          <h2 class="font-serif">6. 分类管理</h2>
          <p>访问路径：左侧菜单 → 「分类」</p>
          <p>分类用于<strong>按项目类型组织和筛选作品</strong>，例如"住宅""商业""公共建筑""景观"等。访客可以在前台网站按分类浏览项目。</p>

          <h3>6.1 如何新建分类？</h3>
          <ol>
            <li>点击「添加分类」按钮</li>
            <li>输入<strong>分类名称</strong>（如"住宅"）</li>
            <li>标识符（slug）会<strong>根据名称自动生成</strong>，无需手动填写。下方会实时预览生成的标识符</li>
            <li>点击「保存」</li>
          </ol>
          <p class="text-sm text-stone-500">💡 标识符是什么？它是分类在网址中的英文/拼音名称。例如分类"住宅"的标识符可能是"zhu-zhai"。</p>

          <h3>6.2 首页显示/隐藏</h3>
          <p>每个分类右侧有一个<strong>眼睛图标</strong> 👁：</p>
          <ul>
            <li>眼睛睁开 = 该分类显示在网站首页「按类型浏览」区域</li>
            <li>眼睛关闭 = 该分类在首页隐藏，但在项目筛选页中仍然可用</li>
          </ul>
          <p>点击眼睛图标即可切换。这个功能适用于一些不想在首页展示的分类（例如"翻新""改造"等次要分类）。</p>

          <h3>6.3 删除分类</h3>
          <p>点击垃圾桶图标，确认后删除。删除分类后，使用该分类的项目的分类字段将变为空（项目本身不会被删除）。</p>
        </section>

        <!-- ============================================================ -->
        <!-- 6.5. 项目看板 -->
        <!-- ============================================================ -->
        <section id="board">
          <h2 class="font-serif">6.5. 项目看板</h2>
          <p>访问路径：左侧菜单 → 「看板」</p>
          <p>看板是一个<strong>可视化项目管理工具</strong>，将项目按阶段分列展示，帮助您一目了然地了解每个项目的当前进度。</p>

          <h3>6.5.1 看板布局</h3>
          <p>看板分为 6 列，对应项目生命周期的 6 个阶段：</p>
          <ol>
            <li><strong>前期接洽</strong> — 项目初次接触、需求沟通阶段</li>
            <li><strong>方案设计</strong> — 概念方案、初步设计阶段</li>
            <li><strong>扩初设计</strong> — 深化方案、技术深化阶段</li>
            <li><strong>施工图设计</strong> — 出图、图纸审核阶段</li>
            <li><strong>施工配合</strong> — 现场配合、工程监理阶段</li>
            <li><strong>项目竣工</strong> — 项目完成、交付验收阶段</li>
          </ol>
          <p>每列顶部显示该阶段的项目数量。每张卡片显示项目封面缩略图、标题、客户名称和状态标签。</p>

          <h3>6.5.2 如何使用</h3>
          <ul>
            <li><strong>拖拽项目</strong>：鼠标按住项目卡片，拖到目标阶段列中松开，即可切换项目阶段</li>
            <li><strong>编辑项目</strong>：点击卡片直接跳转到项目编辑页</li>
            <li><strong>初次使用</strong>：在新建或编辑项目时，表单中有「项目阶段」下拉选择，选择后项目即出现在对应看板列中</li>
          </ul>

          <h3>6.5.3 与项目表单的关系</h3>
          <p>看板中的阶段与项目编辑表单中的「项目阶段」下拉框是<strong>同步的</strong>。在看板中拖拽和在表单中选择效果完全相同。</p>
        </section>

        <!-- ============================================================ -->
        <!-- 7. 风格管理 -->
        <!-- ============================================================ -->
        <section :id="sections[6].id">
          <h2 class="font-serif">7. 风格管理</h2>
          <p>访问路径：左侧菜单 → 「风格」</p>
          <p>风格用于<strong>描述项目的建筑风格</strong>，例如"现代""极简""新中式""工业风"等。一个项目可以有多个风格标签。</p>

          <h3>7.1 如何新建风格？</h3>
          <p>操作方式与分类管理完全相同：点击「添加风格」→ 输入名称 → 标识符自动生成 → 保存。</p>

          <h3>7.2 风格的使用</h3>
          <p>创建风格后，在新建或编辑项目时，可以在「建筑风格」区域（多选标签）中选择。选中的风格会显示在：</p>
          <ul>
            <li>项目卡片上（灰色圆角标签）</li>
            <li>项目详情页顶部</li>
            <li>前台项目筛选页（访客可以按风格筛选）</li>
          </ul>

          <h3>7.3 删除风格</h3>
          <p>删除风格后，所有使用该风格的项目会自动解除关联（项目本身不受影响，只是不再有这个风格标签）。</p>
        </section>

        <!-- ============================================================ -->
        <!-- 7.5. 留言管理 -->
        <!-- ============================================================ -->
        <section id="contacts">
          <h2 class="font-serif">7.5. 留言管理</h2>
          <p>访问路径：左侧菜单 → 「留言」</p>
          <p>当前台联系表单有人提交时，留言会自动存入数据库并在此页面显示。</p>

          <h3>7.5.1 留言列表</h3>
          <ul>
            <li><strong>未读标识</strong>：橙色圆点表示未读，灰色对勾表示已读</li>
            <li><strong>点击行展开</strong>：查看完整留言内容、邮箱、项目类型</li>
            <li><strong>标为已读</strong>：处理完留言后点击按钮标记</li>
            <li><strong>仪表盘提醒</strong>：仪表盘会显示未读留言数量徽标，点击可跳转到此页面</li>
          </ul>
        </section>

        <!-- ============================================================ -->
        <!-- 7.6. 站点设置 -->
        <!-- ============================================================ -->
        <section id="settings">
          <h2 class="font-serif">7.6. 站点设置</h2>
          <p>访问路径：左侧菜单 → 「站点设置」</p>
          <p>站点设置用于<strong>自定义前台网站的显示内容</strong>，无需修改代码。</p>

          <h3>7.6.1 Hero 背景图</h3>
          <ul>
            <li><strong>上传</strong>：拖拽或点击上传背景图（推荐 1920×1080，JPG/PNG/WebP）</li>
            <li><strong>预览</strong>：上传后立即显示当前背景图</li>
            <li><strong>移除</strong>：点击图片右上角叉号移除，首页自动使用第一个精选项目封面图作为回退</li>
          </ul>

          <h3>7.6.2 站点信息</h3>
          <ul>
            <li><strong>站点名称</strong> — 浏览器标签页标题（默认"方外设计"）</li>
            <li><strong>站点描述</strong> — 搜索引擎摘要（默认"建筑设计工作室"）</li>
            <li><strong>首页 Slogan</strong> — Hero 区的标语（默认"方寸之外 · 别有天地"）</li>
            <li><strong>首页副标题</strong> — Hero 区的说明文字</li>
            <li><strong>联系邮箱</strong> — Footer 和联系页显示的邮箱</li>
            <li><strong>联系地址</strong> — Footer 和联系页显示的地址</li>
            <li><strong>联系电话</strong> — Footer 显示的电话</li>
          </ul>
        </section>

        <!-- ============================================================ -->
        <!-- 8. 用户管理 -->
        <!-- ============================================================ -->
        <section id="users">
          <h2 class="font-serif">8. 用户管理</h2>
          <p>访问路径：左侧菜单 → 「用户管理」</p>
          <p>管理可以登录后台的账号。<strong>只有管理员角色可以访问此页面。</strong></p>

          <h3>8.1 用户列表</h3>
          <p>表格展示所有用户：头像 → 姓名 → 邮箱 → 角色标签（管理员/编辑者）→ 创建时间 → 操作按钮。</p>

          <h3>8.2 新增用户</h3>
          <ol>
            <li>点击「新增用户」按钮</li>
            <li>填写邮箱（作为登录账号）、密码（至少 6 位）、姓名</li>
            <li>选择角色：管理员（全部权限）或编辑者（可编辑项目但不能删除项目和管理用户）</li>
            <li>点击「创建」</li>
          </ol>

          <h3>8.3 修改用户信息</h3>
          <p>点击用户行的「编辑」按钮，可以修改姓名和角色。<strong>邮箱不可修改</strong>（因为邮箱是登录账号）。</p>

          <h3>8.4 修改密码</h3>
          <p>有两种方式：</p>
          <ul>
            <li><strong>管理员修改他人密码</strong>：在用户列表中点击「改密」，输入新密码即可（不需要旧密码）</li>
            <li><strong>修改自己的密码</strong>：点击右上角用户名 → 「修改密码」，需要输入当前密码验证身份</li>
          </ul>

          <h3>8.5 删除用户</h3>
          <p>点击垃圾桶图标删除用户。<strong>不能删除自己的账号</strong>，也不能删除最后一个管理员（至少保留一个管理员账号）。</p>
        </section>

        <!-- ============================================================ -->
        <!-- 9. FAQ -->
        <!-- ============================================================ -->
        <section :id="sections[7].id">
          <h2 class="font-serif">9. 常见问题 (FAQ)</h2>

          <details class="mb-4 border border-stone-200 rounded-sm">
            <summary class="px-5 py-3 cursor-pointer font-medium text-stone-800 hover:bg-stone-50 transition-colors">Q: 我新建了项目，为什么前台网站没有显示？</summary>
            <div class="px-5 py-3 text-stone-600 text-sm border-t border-stone-200">
              <p>请检查以下几点：</p>
              <ol>
                <li>项目状态是否为<strong>「已发布」</strong>？草稿状态的项目前台不可见</li>
                <li>是否勾选了<strong>「精选项目」</strong>？首页的「精选作品」区域只显示精选项目</li>
                <li>项目列表中（<code>/projects</code>）能否看到该项目？如果列表中有但首页没有，检查是否设为精选</li>
              </ol>
              <p>前台数据是<strong>动态加载</strong>的，发布后刷新页面即可看到，不需要重新构建。</p>
            </div>
          </details>

          <details class="mb-4 border border-stone-200 rounded-sm">
            <summary class="px-5 py-3 cursor-pointer font-medium text-stone-800 hover:bg-stone-50 transition-colors">Q: 如何修改自己的密码？</summary>
            <div class="px-5 py-3 text-stone-600 text-sm border-t border-stone-200">
              点击页面右上角的用户名称 → 在弹出的下拉菜单中点击「修改密码」→ 输入当前密码和新密码 → 点击「确认修改」。新密码至少需要 6 位。
            </div>
          </details>

          <details class="mb-4 border border-stone-200 rounded-sm">
            <summary class="px-5 py-3 cursor-pointer font-medium text-stone-800 hover:bg-stone-50 transition-colors">Q: 上传的图片太大怎么办？</summary>
            <div class="px-5 py-3 text-stone-600 text-sm border-t border-stone-200">
              <p>建议上传前先将图片处理到合适尺寸：</p>
              <ul>
                <li>封面图：宽度至少 1200px，比例 4:3 或 16:9</li>
                <li>图集图片：宽度 1600-2400px 即可，不需要原图</li>
                <li>格式推荐 WebP（体积最小）或 JPG（兼容性最好）</li>
                <li>单张图片不超过 10MB</li>
              </ul>
              <p>可以使用任何图片处理工具（如 Photoshop、美图秀秀、在线压缩工具）预先处理。</p>
            </div>
          </details>

          <details class="mb-4 border border-stone-200 rounded-sm">
            <summary class="px-5 py-3 cursor-pointer font-medium text-stone-800 hover:bg-stone-50 transition-colors">Q: 为什么上传的中文文件名显示为乱码？</summary>
            <div class="px-5 py-3 text-stone-600 text-sm border-t border-stone-200">
              此问题已修复。新上传的文件中文名会正常显示。如果还有旧文件显示乱码，请删除后重新上传。
            </div>
          </details>

          <details class="mb-4 border border-stone-200 rounded-sm">
            <summary class="px-5 py-3 cursor-pointer font-medium text-stone-800 hover:bg-stone-50 transition-colors">Q: 回款节点的「逾期」是如何判断的？</summary>
            <div class="px-5 py-3 text-stone-600 text-sm border-t border-stone-200">
              系统自动检查：当<strong>到期日期已经过去</strong>，但状态仍然为「待收款」时，该节点会被标记为逾期（红色显示）。建议在收到款项后及时点击绿色对勾标记为已收款。
            </div>
          </details>

          <details class="mb-4 border border-stone-200 rounded-sm">
            <summary class="px-5 py-3 cursor-pointer font-medium text-stone-800 hover:bg-stone-50 transition-colors">Q: 前台网站换了新项目，为什么手机上看还是旧的？</summary>
            <div class="px-5 py-3 text-stone-600 text-sm border-t border-stone-200">
              可能是浏览器缓存。试试<strong>强制刷新</strong>：Ctrl+F5（Windows）或 Cmd+Shift+R（Mac），或在手机浏览器中清除缓存后重新打开。前台数据是实时加载的，发布后刷新即可。
            </div>
          </details>

          <details class="mb-4 border border-stone-200 rounded-sm">
            <summary class="px-5 py-3 cursor-pointer font-medium text-stone-800 hover:bg-stone-50 transition-colors">Q: 编辑者和管理员有什么区别？</summary>
            <div class="px-5 py-3 text-stone-600 text-sm border-t border-stone-200">
              <strong>管理员</strong>可以增删改查所有内容（项目、分类、风格、文件、回款），管理用户账号，修改他人密码。<strong>编辑者</strong>可以编辑现有项目、上传文件和图片、管理回款，但<strong>不能删除项目</strong>，<strong>不能管理用户</strong>。系统在后端强制执行这些限制。
            </div>
          </details>

          <details class="mb-4 border border-stone-200 rounded-sm">
            <summary class="px-5 py-3 cursor-pointer font-medium text-stone-800 hover:bg-stone-50 transition-colors">Q: 如何调整首页项目的显示顺序？</summary>
            <div class="px-5 py-3 text-stone-600 text-sm border-t border-stone-200">
              在项目列表中，每个项目右侧有上下箭头按钮。点击可将项目与相邻项目交换排序位置。排序越靠上的项目在首页「精选作品」区域越靠前显示。
            </div>
          </details>

          <details class="mb-4 border border-stone-200 rounded-sm">
            <summary class="px-5 py-3 cursor-pointer font-medium text-stone-800 hover:bg-stone-50 transition-colors">Q: 为什么分类在首页不显示？</summary>
            <div class="px-5 py-3 text-stone-600 text-sm border-t border-stone-200">
              请检查分类管理页面中该分类的<strong>眼睛图标</strong>是否处于睁开状态。眼睛关闭表示该分类在首页隐藏（但在项目筛选页中仍可用）。点击眼睛图标即可切换。
            </div>
          </details>

          <details class="mb-4 border border-stone-200 rounded-sm">
            <summary class="px-5 py-3 cursor-pointer font-medium text-stone-800 hover:bg-stone-50 transition-colors">Q: 可以把项目分享给客户看吗？</summary>
            <div class="px-5 py-3 text-stone-600 text-sm border-t border-stone-200">
              可以。每个项目有一个独立的网址：<code>http://49.232.49.175:3000/projects/项目标识符</code>。您可以直接把这个链接发给客户，对方就能在浏览器中查看该项目的完整信息（包括图片、正文内容等）。
            </div>
          </details>
        </section>

        <!-- ============================================================ -->
        <!-- 10. 技术支持 -->
        <!-- ============================================================ -->
        <section :id="sections[8].id">
          <h2 class="font-serif">10. 技术支持</h2>
          <p>如有任何问题、建议或需要帮助，请联系：</p>
          <ul>
            <li><strong>邮箱</strong>：<a href="mailto:554295000@qq.com">554295000@qq.com</a></li>
            <li><strong>工作室地址</strong>：山东 · 威海</li>
            <li><strong>系统版本</strong>：v2.1</li>
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
  { id: 'board', num: '6.5', title: '项目看板' },
  { id: 'styles', num: '7', title: '风格管理' },
  { id: 'contacts', num: '7.5', title: '留言管理' },
  { id: 'settings', num: '7.6', title: '站点设置' },
  { id: 'users', num: '8', title: '用户管理' },
  { id: 'faq', num: '9', title: '常见问题' },
  { id: 'support', num: '10', title: '技术支持' },
]
</script>
