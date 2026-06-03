<template>
  <div>
    <PortfolioHeader transparent />

    <!-- Page header -->
    <section class="pt-24 pb-12 bg-gray-50 border-b border-gray-100">
      <div class="container-wide">
        <h1 class="text-4xl font-bold text-gray-900">Projects</h1>
        <p class="mt-2 text-gray-500">Explore our complete body of work</p>
      </div>
    </section>

    <!-- Filter bar -->
    <section class="py-6 bg-white border-b border-gray-100 sticky top-16 z-30">
      <div class="container-wide">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1 max-w-sm">
            <div class="relative">
              <Icon name="lucide:search" size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                v-model="search"
                type="text"
                placeholder="Search projects..."
                class="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                @input="onSearchChange"
              />
            </div>
          </div>

          <!-- Category filter -->
          <select
            v-model="selectedCategory"
            class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none"
            @change="applyFilters"
          >
            <option value="">All Categories</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.slug">
              {{ cat.name }}
            </option>
          </select>

          <!-- Style filter -->
          <select
            v-model="selectedStyle"
            class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none"
            @change="applyFilters"
          >
            <option value="">All Styles</option>
            <option v-for="style in styles" :key="style.id" :value="style.slug">
              {{ style.name }}
            </option>
          </select>
        </div>
      </div>
    </section>

    <!-- Project grid -->
    <section class="py-12 bg-white">
      <div class="container-wide">
        <!-- Loading -->
        <div v-if="pending" class="py-12 text-center">
          <LoadingSpinner size="lg" />
        </div>

        <!-- Empty -->
        <EmptyState
          v-else-if="projects.length === 0"
          icon="lucide:search"
          title="No projects found"
          :description="search ? `No results for \`${search}\`` : 'No projects published yet.'"
        />

        <!-- Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProjectCard
            v-for="project in projects"
            :key="project.id"
            :project="project"
          />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-10 flex justify-center gap-2">
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

// Filters from URL query
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

// Debounced search
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

// Fetch projects with filters
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
