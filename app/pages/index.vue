<template>
  <div>
    <!-- Hero Section -->
    <section class="relative h-screen min-h-[700px] flex items-center overflow-hidden">
      <!-- 背景图 -->
      <div class="absolute inset-0 bg-warm-900">
        <div class="absolute inset-0 bg-gradient-to-br from-warm-800 via-warm-900 to-warm-800 opacity-80" />
        <!-- 几何纹理 -->
        <div class="absolute inset-0 opacity-10" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px);" />
      </div>

      <!-- Hero 内容 -->
      <div class="container-wide relative z-10">
        <div class="max-w-3xl">
          <h1 class="font-serif text-5xl sm:text-6xl lg:text-display-xl font-bold text-cream tracking-tight leading-tight">
            塑造空间<br />
            <span class="text-accent-300">启发生活</span>
          </h1>
          <p class="mt-8 text-xl text-warm-300 max-w-xl leading-relaxed font-light">
            形筑建筑设计工作室 — 以思考塑造场所，创造体贴入微、功能实用的空间，提升日常生活的品质。
          </p>
          <div class="mt-10 flex flex-col sm:flex-row gap-4">
            <NuxtLink
              to="/projects"
              class="inline-flex items-center justify-center px-8 py-3.5 bg-cream text-warm-900 text-sm font-medium rounded-sm hover:bg-accent-100 active:scale-[0.98] transition-all duration-300"
            >
              浏览项目
            </NuxtLink>
            <NuxtLink
              to="/about"
              class="inline-flex items-center justify-center px-8 py-3.5 border border-warm-400/40 text-cream text-sm font-medium rounded-sm hover:bg-cream/5 active:scale-[0.98] transition-all duration-300"
            >
              关于我们
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- 滚动指示器 -->
      <div class="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <Icon name="lucide:chevron-down" size="24" class="text-cream/50" />
      </div>
    </section>

    <!-- 前台导航（非粘性，首页专用） -->
    <PortfolioHeader />

    <!-- 精选项目 -->
    <section class="py-section bg-cream">
      <div class="container-wide">
        <div class="flex items-end justify-between mb-12">
          <div>
            <p class="text-accent-400 text-sm font-medium tracking-widest uppercase mb-3">精选作品</p>
            <h2 class="text-3xl sm:text-display-sm font-serif font-bold text-warm-800">
              我们引以为豪的代表作
            </h2>
          </div>
          <NuxtLink
            to="/projects"
            class="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-warm-600 hover:text-accent-500 transition-colors group"
          >
            查看全部
            <Icon name="lucide:arrow-right" size="16" class="group-hover:translate-x-1 transition-transform" />
          </NuxtLink>
        </div>

        <!-- 项目网格 -->
        <div v-if="projects && projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
          <ProjectCard
            v-for="project in projects"
            :key="project.id"
            :project="project"
            variant="featured"
          />
        </div>

        <!-- 加载 -->
        <div v-else-if="pending" class="py-20 text-center">
          <LoadingSpinner size="lg" />
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

    <!-- 按类型浏览 -->
    <section class="py-section bg-warm-50">
      <div class="container-wide">
        <p class="text-accent-400 text-sm font-medium tracking-widest uppercase text-center mb-3">分类探索</p>
        <h2 class="text-3xl sm:text-display-sm font-serif font-bold text-warm-800 text-center">
          按类型浏览
        </h2>

        <div v-if="categories.length > 0" class="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.id"
            :to="`/projects?category=${cat.slug}`"
            class="group p-8 bg-cream rounded-sm border border-warm-200 hover:border-accent-300 hover:shadow-elevation-3 transition-all duration-300 text-center hover:-translate-y-1"
          >
            <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-warm-100 group-hover:bg-accent-100 flex items-center justify-center transition-colors duration-300">
              <Icon name="lucide:building" size="22" class="text-warm-500 group-hover:text-accent-500 transition-colors" />
            </div>
            <h3 class="text-sm font-semibold text-warm-700 group-hover:text-warm-900 transition-colors font-sans">{{ cat.name }}</h3>
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

const { data: projects, pending } = useAsyncData('featured-projects', async () => {
  try { return await fetchFeaturedProjects() } catch { return [] }
})
const { data: categories } = useAsyncData('categories', async () => {
  try { return await fetchCategories() } catch { return [] }
})
</script>
