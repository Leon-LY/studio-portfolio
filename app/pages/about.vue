<template>
  <div>
    <PortfolioHeader />

    <!-- 页头 -->
    <section class="pt-28 pb-16 bg-stone-50 border-b border-stone-200">
      <div class="container-narrow">
        <p class="text-accent-500 text-sm font-medium tracking-widest uppercase mb-3">About</p>
        <h1 class="text-display-sm sm:text-display-md font-serif font-bold text-stone-900">关于方外设计</h1>
      </div>
    </section>

    <!-- 主图区域 -->
    <section class="relative h-[40vh] min-h-[300px] bg-stone-200">
      <div class="absolute inset-0 bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center">
        <div class="text-center text-canvas/20">
          <Icon name="lucide:building-2" size="64" class="mx-auto mb-4" />
          <p class="text-sm tracking-widest uppercase">Architecture Photography</p>
        </div>
      </div>
    </section>

    <!-- 内容 -->
    <section class="py-section bg-canvas">
      <div class="container-narrow">
        <div class="prose prose-lg max-w-none">

          <!-- 工作室介绍 -->
          <div class="grid grid-cols-1 md:grid-cols-5 gap-12 mb-20">
            <div class="md:col-span-2">
              <h2 class="text-2xl font-serif font-bold text-stone-900 mt-0">我们的<br />工作室</h2>
            </div>
            <div class="md:col-span-3">
              <p class="text-lg text-stone-600 leading-relaxed">
                方外设计 — 方寸之外，别有天地。我们是一家专注于建筑设计的小型工作室，致力于打破常规、创造既美观又实用的空间。我们相信，每一个项目都是一场对话——空间、光线、材料与人的体验之间无声的交流。
              </p>
              <p class="text-stone-500 leading-relaxed mt-4">
                我们的方法将深思熟虑的设计与务实的解决方案相结合，始终以客户需求为核心，寻求美学与功能的完美平衡。
              </p>
            </div>
          </div>

          <!-- 设计理念 -->
          <div class="grid grid-cols-1 md:grid-cols-5 gap-12 mb-20">
            <div class="md:col-span-2">
              <h2 class="text-2xl font-serif font-bold text-stone-900 mt-0">设计<br />理念</h2>
            </div>
            <div class="md:col-span-3">
              <blockquote class="border-l-2 border-accent-400 pl-6 italic text-stone-500 my-0">
                <p class="text-lg text-stone-600 leading-relaxed">
                  好的建筑应该让人觉得理所当然——仿佛这座建筑本来就属于它所矗立的地方。我们不追求浮夸的形式，而是寻找每一个项目内在的逻辑与诗意。
                </p>
              </blockquote>
              <p class="text-stone-500 leading-relaxed mt-4">
                从场地的气质出发，尊重环境、材料和工艺，让建筑自然地回应光线与气候，为居住者创造有温度、有故事的生活场景。
              </p>
            </div>
          </div>

          <!-- 服务范围 -->
          <div class="grid grid-cols-1 md:grid-cols-5 gap-12">
            <div class="md:col-span-2">
              <h2 class="text-2xl font-serif font-bold text-stone-900 mt-0">服务<br />范围</h2>
            </div>
            <div class="md:col-span-3">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div v-for="svc in services" :key="svc.name" class="flex items-start gap-4 p-5 bg-stone-50 rounded-sm border border-stone-200 hover:border-stone-300 transition-colors">
                  <div class="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                    <Icon :name="svc.icon" size="18" class="text-stone-600" />
                  </div>
                  <div>
                    <h3 class="text-sm font-semibold text-stone-800 font-sans">{{ svc.name }}</h3>
                    <p class="text-xs text-stone-400 mt-1">{{ svc.desc }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <PortfolioFooter />
  </div>
</template>

<script setup lang="ts">
const services = [
  { name: '建筑设计', desc: '从概念方案到施工图设计', icon: 'lucide:building-2' },
  { name: '景观设计', desc: '场地规划与外部空间设计', icon: 'lucide:trees' },
  { name: '改造与再利用', desc: '既有建筑改造与功能更新', icon: 'lucide:wrench' },
  { name: '概念设计与研究', desc: '前期定位与可行性分析', icon: 'lucide:compass' },
]
</script>
