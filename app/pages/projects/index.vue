<template>
  <div>
    <PortfolioHeader transparent />

    <!-- 页头 -->
    <section class="pt-28 pb-14 bg-warm-50 border-b border-warm-200">
      <div class="container-wide">
        <p class="text-accent-400 text-sm font-medium tracking-widest uppercase mb-3">作品</p>
        <h1 class="text-3xl sm:text-display-sm font-serif font-bold text-warm-800">项目作品</h1>
        <p class="mt-2 text-warm-500">探索我们的完整作品集</p>
      </div>
    </section>

    <!-- 筛选栏 -->
    <section class="py-5 bg-cream border-b border-warm-200 sticky top-16 z-30">
      <div class="container-wide">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- 搜索 -->
          <div class="flex-1 max-w-sm">
            <div class="relative">
              <Icon name="lucide:search" size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
              <input
                v-model="search"
                type="text"
                placeholder="搜索项目..."
                class="w-full pl-10 pr-4 py-2.5 text-sm border border-warm-300 rounded-sm bg-cream placeholder-warm-400 focus:border-warm-600 focus:outline-none focus:ring-1 focus:ring-warm-600 transition-colors"
                @input="onSearchChange"
              />
            </div>
          </div>

          <!-- 分类筛选 -->
          <select
            v-model="selectedCategory"
            class="px-4 py-2.5 text-sm border border-warm-300 rounded-sm bg-cream text-warm-700 focus:border-warm-600 focus:outline-none"
            @change="applyFilters"
          >
            <option value="">全部分类</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.slug">
              {{ cat.name }}
            </option>
          </select>

          <!-- 风格筛选 -->
          <select
            v-model="selectedStyle"
            class="px-4 py-2.5 text-sm border border-warm-300 rounded-sm bg-cream text-warm-700 focus:border-warm-600 focus:outline-none"
            @change="applyFilters"
          >
            <option value="">全部风格</option>
            <option v-for="style in styles" :key="style.id" :value="style.slug">
              {{ style.name }}
            </option>
          </select>
        </div>
      </div>
    </section>

    <!-- 项目网格 -->
    <section class="py-14 bg-cream">
      <div class="container-wide">
        <!-- 加载 -->
        <div v-if="pending" class="py-20 text-center">
          <LoadingSpinner size="lg" />
        </div>

        <!-- 空状态 -->
        <EmptyState
          v-else-if="projects.length === 0"
          icon="lucide:search"
          title="未找到项目"
          :description="search ? `未找到与「${search}」相关的结果` : '暂无已发布的项目。'"
        />

        <!-- 网格 -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ProjectCard
            v-for="project in projects"
            :key="project.id"
            :project="project"
          />
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="mt-14 flex justify-center gap-3">
          <BaseButton
            v-for="page in totalPages"
            :key="page"
            :variant="currentPage === page ? 'primary' : 'outline'"
            size="sm"
            @click="goToPage(page)"
          >
            {{ page }}
          </BaseButton>
        </div>
      </div>
    </section>

    <PortfolioFooter />
  </div>
</template>

<script setup lang="ts">

const { fetchProjects } = useProjects()
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
})
const { data: styles } = useAsyncData('project-styles', async () => {
  try { return await fetchStyles() } catch { return [] }
})

let searchTimer: ReturnType<typeof setTimeout>
function onSearchChange() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => applyFilters(), 300)
}

function applyFilters() {
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

// 获取带筛选参数的项目列表
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
  { watch: [search, selectedCategory, selectedStyle, currentPage] },
)

const projects = computed(() => result.value?.data || [])
const totalPages = computed(() => result.value?.totalPages || 0)
</script>
