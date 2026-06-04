<template>
  <div>
    <PortfolioHeader />

    <!-- 页头 -->
    <section class="pt-28 pb-16 bg-warm-50 border-b border-warm-200">
      <div class="container-narrow">
        <p class="text-accent-400 text-sm font-medium tracking-widest uppercase mb-3">关于</p>
        <h1 class="text-display-sm sm:text-display-md font-serif font-bold text-warm-800">关于形筑</h1>
      </div>
    </section>

    <!-- 内容 -->
    <section class="py-section bg-cream">
      <div class="container-narrow">
        <div class="prose prose-lg prose max-w-none">

          <!-- 工作室介绍 -->
          <div class="grid grid-cols-1 md:grid-cols-5 gap-12 mb-20">
            <div class="md:col-span-2">
              <h2 class="text-2xl font-serif font-bold text-warm-800 mt-0">我们的<br />工作室</h2>
            </div>
            <div class="md:col-span-3">
              <p class="text-lg text-warm-600 leading-relaxed">
                形筑是一家专注于建筑与室内设计的小型工作室，致力于创造既美观又实用的空间。我们相信，每一个项目都是一场对话——空间、光线、材料与人的体验之间无声的交流。
              </p>
              <p class="text-warm-500 leading-relaxed mt-4">
                我们的方法将深思熟虑的设计与务实的解决方案相结合，始终以客户需求为核心，寻求美学与功能的完美平衡。
              </p>
            </div>
          </div>

          <!-- 设计理念 -->
          <div class="grid grid-cols-1 md:grid-cols-5 gap-12 mb-20">
            <div class="md:col-span-2">
              <h2 class="text-2xl font-serif font-bold text-warm-800 mt-0">设计<br />理念</h2>
            </div>
            <div class="md:col-span-3">
              <p class="text-lg text-warm-600 leading-relaxed">
                好的建筑应该让人觉得理所当然——仿佛这座建筑本来就属于它所矗立的地方。我们不追求浮夸的形式，而是寻找每一个项目内在的逻辑与诗意。
              </p>
              <p class="text-warm-500 leading-relaxed mt-4">
                从场地的气质出发，尊重环境、材料和工艺，让建筑自然地回应光线与气候，为居住者创造有温度、有故事的生活场景。
              </p>
            </div>
          </div>

          <!-- 服务范围 -->
          <div class="grid grid-cols-1 md:grid-cols-5 gap-12">
            <div class="md:col-span-2">
              <h2 class="text-2xl font-serif font-bold text-warm-800 mt-0">服务<br />范围</h2>
            </div>
            <div class="md:col-span-3">
              <ul class="space-y-4 text-warm-600">
                <li class="flex items-center gap-3">
                  <span class="w-8 h-px bg-accent-400 flex-shrink-0" />
                  <span class="text-lg">建筑设计</span>
                </li>
                <li class="flex items-center gap-3">
                  <span class="w-8 h-px bg-accent-400 flex-shrink-0" />
                  <span class="text-lg">室内设计</span>
                </li>
                <li class="flex items-center gap-3">
                  <span class="w-8 h-px bg-accent-400 flex-shrink-0" />
                  <span class="text-lg">景观设计</span>
                </li>
                <li class="flex items-center gap-3">
                  <span class="w-8 h-px bg-accent-400 flex-shrink-0" />
                  <span class="text-lg">改造与适应性再利用</span>
                </li>
                <li class="flex items-center gap-3">
                  <span class="w-8 h-px bg-accent-400 flex-shrink-0" />
                  <span class="text-lg">概念设计与可行性研究</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </section>

    <PortfolioFooter />
  </div>
</template>

<script setup lang="ts">
</script>
