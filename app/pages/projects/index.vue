<template>
  <div>
    <PortfolioHeader />

    <!-- 页头 -->
    <section class="pt-28 pb-14 bg-stone-50 border-b border-stone-200">
      <div class="container-wide">
        <p class="text-accent-500 text-sm font-medium tracking-widest uppercase mb-3">Works</p>
        <h1 class="text-display-sm font-serif font-bold text-stone-900">项目作品</h1>
        <p class="mt-2 text-stone-500">探索我们的完整作品集</p>
      </div>
    </section>

    <!-- 筛选栏 -->
    <section class="py-5 bg-canvas border-b border-stone-200 sticky top-0 z-30">
      <div class="container-wide">
        <!-- 搜索 -->
        <div class="relative max-w-sm mb-4">
          <Icon name="lucide:search" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            v-model="search"
            type="text"
            placeholder="搜索项目..."
            class="w-full pl-9 pr-4 py-2.5 text-sm border border-stone-300 rounded-sm bg-canvas placeholder-stone-400 focus:border-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-600 transition-colors"
            @input="onSearchChange"
          />
        </div>

        <!-- 分类 Pill 按钮 -->
        <div class="flex flex-wrap items-center gap-2 mb-3">
          <span class="text-xs text-stone-400 mr-1 font-medium">分类</span>
          <button
            class="px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all duration-200"
            :class="!selectedCategory ? 'bg-stone-900 text-canvas border-stone-900' : 'bg-white text-stone-600 border-stone-300 hover:border-stone-500'"
            @click="setCategory('')"
          >
            全部
          </button>
          <button
            v-for="cat in categories"
            :key="cat.id"
            class="px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all duration-200"
            :class="selectedCategory === cat.slug ? 'bg-stone-900 text-canvas border-stone-900' : 'bg-white text-stone-600 border-stone-300 hover:border-stone-500'"
            @click="setCategory(cat.slug)"
          >
            {{ cat.name }}
          </button>
        </div>

        <!-- 风格 Pill 按钮 -->
        <div v-if="styles && styles.length > 0" class="flex flex-wrap items-center gap-2">
          <span class="text-xs text-stone-400 mr-1 font-medium">风格</span>
          <button
            class="px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all duration-200"
            :class="!selectedStyle ? 'bg-stone-900 text-canvas border-stone-900' : 'bg-white text-stone-600 border-stone-300 hover:border-stone-500'"
            @click="setStyle('')"
          >
            全部
          </button>
          <button
            v-for="style in styles"
            :key="style.id"
            class="px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all duration-200"
            :class="selectedStyle === style.slug ? 'bg-stone-900 text-canvas border-stone-900' : 'bg-white text-stone-600 border-stone-300 hover:border-stone-500'"
            @click="setStyle(style.slug)"
          >
            {{ style.name }}
          </button>
        </div>
      </div>
    </section>

    <!-- 项目网格 -->
    <section class="py-section-sm bg-canvas">
      <div class="container-wide">
        <!-- 结果计数 -->
        <p v-if="!pending" class="text-sm text-stone-400 mb-8">
          共 {{ result?.count || 0 }} 个项目
          <span v-if="search">— 搜索「{{ search }}」</span>
          <span v-if="selectedCategory || selectedStyle">
            <template v-if="selectedCategory"> · {{ categoryName }}</template>
            <template v-if="selectedStyle"> · {{ styleName }}</template>
          </span>
        </p>

        <!-- 骨架屏加载 -->
        <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="n in 6" :key="n" class="rounded-sm overflow-hidden">
            <div class="skeleton aspect-[4/3] rounded-sm" />
            <div class="mt-3 space-y-2 p-1">
              <div class="skeleton h-3 w-1/4" />
              <div class="skeleton h-5 w-3/4" />
              <div class="skeleton h-4 w-full" />
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <EmptyState
          v-else-if="projects.length === 0"
          icon="lucide:search"
          title="未找到项目"
          :description="search || selectedCategory || selectedStyle ? '没有匹配筛选条件的项目，请尝试其他条件。' : '暂无已发布的项目。'"
        >
          <template #action>
            <BaseButton variant="outline" size="sm" @click="resetFilters">重置筛选</BaseButton>
          </template>
        </EmptyState>

        <!-- 网格 -->
        <div v-else :ref="revealRef" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="(project, idx) in projects" :key="project.id" class="reveal-hidden" :data-delay="`${idx % 3 * 80}ms`">
            <ProjectCard :project="project" />
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="mt-14 flex justify-center gap-2">
          <BaseButton
            variant="outline"
            size="sm"
            :disabled="currentPage <= 1"
            @click="goToPage(currentPage - 1)"
          >
            <Icon name="lucide:chevron-left" size="16" />
          </BaseButton>
          <BaseButton
            v-for="page in totalPages"
            :key="page"
            :variant="currentPage === page ? 'primary' : 'outline'"
            size="sm"
            @click="goToPage(page)"
          >
            {{ page }}
          </BaseButton>
          <BaseButton
            variant="outline"
            size="sm"
            :disabled="currentPage >= totalPages"
            @click="goToPage(currentPage + 1)"
          >
            <Icon name="lucide:chevron-right" size="16" />
          </BaseButton>
        </div>
      </div>
    </section>

    <PortfolioFooter />
  </div>
</template>

<script setup lang="ts">

const { fetchProjects } = useProjects()
const { revealRef } = useScrollReveal()
const { fetchCategories } = useCategories()
const { fetchStyles } = useStyles()
const route = useRoute()
const router = useRouter()

const search = ref((route.query.search as string) || '')
const selectedCategory = ref((route.query.category as string) || '')
const selectedStyle = ref((route.query.style as string) || '')
const currentPage = ref(parseInt(route.query.page as string) || 1)
const perPage = 12

const { data: categories } = useAsyncData('project-categories', async () => {
  try { return await fetchCategories() } catch { return [] }
}, { server: false, lazy: true })
const { data: styles } = useAsyncData('project-styles', async () => {
  try { return await fetchStyles() } catch { return [] }
}, { server: false, lazy: true })

const categoryName = computed(() => {
  const cat = categories.value?.find(c => c.slug === selectedCategory.value)
  return cat?.name || ''
})
const styleName = computed(() => {
  const s = styles.value?.find(s => s.slug === selectedStyle.value)
  return s?.name || ''
})

let searchTimer: ReturnType<typeof setTimeout>
function onSearchChange() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => applyFilters(), 300)
}

function setCategory(slug: string) {
  selectedCategory.value = slug
  applyFilters()
}
function setStyle(slug: string) {
  selectedStyle.value = slug
  applyFilters()
}
function applyFilters() {
  currentPage.value = 1
  updateURL()
}
function resetFilters() {
  search.value = ''
  selectedCategory.value = ''
  selectedStyle.value = ''
  currentPage.value = 1
  updateURL()
}

function goToPage(page: number) {
  currentPage.value = page
  updateURL()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function updateURL() {
  router.replace({
    path: '/projects',
    query: {
      ...(search.value && { search: search.value }),
      ...(selectedCategory.value && { category: selectedCategory.value }),
      ...(selectedStyle.value && { style: selectedStyle.value }),
      ...(currentPage.value > 1 && { page: String(currentPage.value) }),
    },
  })
}

const { data: result, pending } = useAsyncData(
  () => `projects-${search.value}-${selectedCategory.value}-${selectedStyle.value}-${currentPage.value}`,
  async () => {
    try {
      return await fetchProjects({
        search: search.value,
        category: selectedCategory.value,
        style: selectedStyle.value,
        page: currentPage.value,
        perPage,
      })
    } catch { return { data: [], count: 0, page: 1, perPage: 12, totalPages: 0 } }
  },
  { watch: [search, selectedCategory, selectedStyle, currentPage], server: false, lazy: true },
)

const projects = computed(() => result.value?.data || [])
const totalPages = computed(() => result.value?.totalPages || 0)
</script>
