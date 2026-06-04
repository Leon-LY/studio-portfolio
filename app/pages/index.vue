<template>
  <div>
    <!-- ============================================================
         Hero — 全屏建筑感
         ============================================================ -->
    <section class="relative h-screen min-h-[700px] flex items-center overflow-hidden">
      <!-- 深色基底 + 建筑网格纹理（视差） -->
      <div class="absolute inset-0 bg-ink">
        <!-- 对角线光束 — 随滚动视差 -->
        <div class="absolute inset-0" :style="{ transform: `translateY(${scrollY * 0.15}px)` }" style="will-change: transform; background: radial-gradient(ellipse at 30% 50%, rgba(200, 164, 78, 0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(255, 255, 255, 0.03) 0%, transparent 50%);" />
        <!-- 建筑网格叠加 — 微视差 -->
        <div class="absolute inset-0 opacity-[0.04]" :style="{ transform: `translateY(${scrollY * 0.08}px)` }" style="will-change: transform; background-image: linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px); background-size: 80px 80px;" />
        <!-- 底部渐变 fade -->
        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/80" />
      </div>

      <!-- Hero 内容 -->
      <div class="container-wide relative z-10">
        <div class="max-w-4xl">
          <!-- 标签 -->
          <p class="text-accent-300 text-sm font-medium tracking-[0.2em] uppercase mb-8 animate-fade-in">
            Fangwai Design Studio
          </p>
          <!-- 主标题 -->
          <h1 class="font-serif text-display-xl font-bold text-canvas tracking-tight animate-fade-in-up">
            方寸之外<br />
            <span class="text-accent-300">别有天地</span>
          </h1>
          <!-- 副标题 -->
          <p class="mt-8 text-lg sm:text-xl text-stone-400 max-w-xl leading-relaxed font-light animate-fade-in" style="animation-delay: 0.2s">
            以思考重塑空间的边界，创造既美观又实用的建筑。<br />每一个项目，都是光线、材料与人的对话。
          </p>
          <!-- CTA -->
          <div class="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-in-up" style="animation-delay: 0.4s">
            <NuxtLink
              to="/projects"
              class="inline-flex items-center justify-center px-8 py-3.5 bg-canvas text-ink text-sm font-medium rounded-sm hover:bg-white active:scale-[0.98] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
            >
              浏览项目
              <Icon name="lucide:arrow-right" size="16" class="ml-2" />
            </NuxtLink>
            <NuxtLink
              to="/about"
              class="inline-flex items-center justify-center px-8 py-3.5 border border-stone-500/40 text-canvas text-sm font-medium rounded-sm hover:bg-canvas/8 active:scale-[0.98] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
            >
              了解我们
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- 滚动指示器 — 自定义慢速脉冲 -->
      <div class="absolute bottom-10 left-1/2 -translate-x-1/2 animate-pulse-subtle">
        <Icon name="lucide:chevron-down" size="24" class="text-canvas/40" />
      </div>
    </section>

    <!-- 前台导航 -->
    <PortfolioHeader />

    <!-- ============================================================
         精选作品
         ============================================================ -->
    <section class="py-section bg-canvas">
      <div class="container-wide" :ref="revealRef">
        <div class="flex items-end justify-between mb-14 reveal-hidden">
          <div>
            <p class="text-accent-500 text-sm font-medium tracking-widest uppercase mb-3">Selected Works</p>
            <h2 class="text-display-sm font-serif font-bold text-stone-900">精选作品</h2>
          </div>
          <NuxtLink
            to="/projects"
            class="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-accent-500 transition-colors group"
          >
            查看全部
            <Icon name="lucide:arrow-right" size="16" class="group-hover:translate-x-1 transition-transform" />
          </NuxtLink>
        </div>

        <!-- 加载中：骨架屏 -->
        <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="n in 3" :key="n" class="rounded-sm overflow-hidden">
            <div class="skeleton aspect-[4/3]" />
            <div class="mt-4 space-y-2">
              <div class="skeleton h-3 w-1/3" />
              <div class="skeleton h-5 w-2/3" />
            </div>
          </div>
        </div>

        <!-- 项目网格 -->
        <div v-else-if="projects && projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
          <div v-for="project in projects" :key="project.id" class="reveal-hidden" :data-delay="`${Math.random() * 200}ms`">
            <ProjectCard :project="project" variant="featured" />
          </div>
        </div>

        <!-- 空状态 -->
        <EmptyState
          v-else
          icon="lucide:building"
          title="暂无项目"
          description="项目发布后将在此处展示。"
        />
      </div>
    </section>

    <!-- ============================================================
         按类型浏览
         ============================================================ -->
    <section class="py-section bg-stone-50">
      <div class="container-wide" :ref="revealRef">
        <div class="reveal-hidden">
          <p class="text-accent-500 text-sm font-medium tracking-widest uppercase text-center mb-3">Categories</p>
          <h2 class="text-display-sm font-serif font-bold text-stone-900 text-center">按类型浏览</h2>
        </div>

        <div v-if="categories.length > 0" class="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6">
          <NuxtLink
            v-for="(cat, idx) in categories"
            :key="cat.id"
            :to="`/projects?category=${cat.slug}`"
            class="reveal-hidden group p-10 bg-canvas rounded-sm border border-stone-200 hover:border-accent-300 hover:shadow-elevation-3 transition-all duration-400 text-center hover:-translate-y-1"
            :data-delay="`${idx * 60}ms`"
          >
            <div class="w-16 h-16 mx-auto mb-5 rounded-full bg-stone-100 group-hover:bg-accent-50 flex items-center justify-center transition-colors duration-400">
              <Icon :name="catIcons[cat.slug] || 'lucide:building-2'" size="24" class="text-stone-400 group-hover:text-accent-400 transition-colors" />
            </div>
            <h3 class="text-sm font-semibold text-stone-700 group-hover:text-stone-900 transition-colors font-sans">{{ cat.name }}</h3>
            <p class="text-xs text-stone-400 mt-1.5">{{ cat.description || '' }}</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <PortfolioFooter />
  </div>
</template>

<script setup lang="ts">
const { fetchFeaturedProjects } = useProjects()
const { fetchCategories } = useCategories()
const { revealRef } = useScrollReveal()

// Hero parallax
const scrollY = ref(0)
function onHeroScroll() { scrollY.value = window.scrollY }
onMounted(() => window.addEventListener('scroll', onHeroScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onHeroScroll))

// Category icon mapping — different icon per category
const catIcons: Record<string, string> = {
  residential: 'lucide:home',
  commercial: 'lucide:building-2',
  public: 'lucide:landmark',
  landscape: 'lucide:trees',
  cultural: 'lucide:museum',
  education: 'lucide:school',
  healthcare: 'lucide:heart-pulse',
  hospitality: 'lucide:coffee',
  office: 'lucide:briefcase',
  mixed: 'lucide:layout-dashboard',
  renovation: 'lucide:wrench',
  urban: 'lucide:city',
}

const { data: projects, pending } = useAsyncData('featured-projects', async () => {
  try { return await fetchFeaturedProjects() } catch { return [] }
})
const { data: categories } = useAsyncData('categories', async () => {
  try { return await fetchCategories() } catch { return [] }
})
</script>
