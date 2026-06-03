<template>
  <div>
    <!-- Hero Section -->
    <section class="relative h-screen min-h-[600px] flex items-center">
      <!-- Background image placeholder -->
      <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700" />

      <!-- Overlay gradient -->
      <div class="absolute inset-0 bg-black/40" />

      <!-- Hero content -->
      <div class="container-wide relative z-10">
        <div class="max-w-2xl">
          <h1 class="text-4xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
            We Design<br />
            <span class="text-white/80">Spaces That</span><br />
            Inspire
          </h1>
          <p class="mt-6 text-lg text-white/70 max-w-lg leading-relaxed">
            An architecture and design studio creating thoughtful, functional spaces that elevate everyday life.
          </p>
          <div class="mt-8 flex gap-4">
            <NuxtLink to="/projects" class="inline-flex items-center px-6 py-3 bg-white text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors">
              View Projects
            </NuxtLink>
            <NuxtLink to="/about" class="inline-flex items-center px-6 py-3 border border-white/30 text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors">
              About Us
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <Icon name="lucide:chevron-down" size="24" class="text-white/60" />
      </div>
    </section>

    <!-- Portfolio Header (below hero, not sticky on home) -->
    <PortfolioHeader />

    <!-- Featured Projects -->
    <section class="py-20 bg-white">
      <div class="container-wide">
        <div class="flex items-end justify-between mb-10">
          <div>
            <h2 class="text-3xl font-bold text-gray-900">Featured Projects</h2>
            <p class="mt-2 text-gray-500">Selected works we're proud of</p>
          </div>
          <NuxtLink to="/projects" class="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-gray-900 hover:underline">
            View All <Icon name="lucide:arrow-right" size="16" />
          </NuxtLink>
        </div>

        <!-- Project grid -->
        <div v-if="projects && projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProjectCard
            v-for="project in projects"
            :key="project.id"
            :project="project"
            variant="featured"
          />
        </div>

        <!-- Loading state -->
        <div v-else-if="pending" class="py-12 text-center">
          <LoadingSpinner size="lg" />
        </div>

        <!-- Empty state -->
        <EmptyState
          v-else
          icon="lucide:building"
          title="No projects yet"
          description="Projects will appear here once published."
        />
      </div>
    </section>

    <!-- Category Overview -->
    <section class="py-20 bg-gray-50">
      <div class="container-wide">
        <h2 class="text-3xl font-bold text-gray-900 text-center">Browse by Type</h2>
        <p class="mt-2 text-gray-500 text-center">Explore projects by category</p>

        <div v-if="categories.length > 0" class="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          <NuxtLink
            v-for="cat in categories"
            :key="cat.id"
            :to="`/projects?category=${cat.slug}`"
            class="group p-6 bg-white rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all text-center"
          >
            <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 group-hover:bg-gray-900 group-hover:text-white flex items-center justify-center transition-colors">
              <Icon name="lucide:building" size="20" />
            </div>
            <h3 class="text-sm font-semibold text-gray-900">{{ cat.name }}</h3>
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

// Wrap with fallback — if Supabase isn't configured, return empty arrays
const { data: projects, pending } = useAsyncData('featured-projects', async () => {
  if (!isSupabaseConfigured()) return []
  try { return await fetchFeaturedProjects() } catch { return [] }
})
const { data: categories } = useAsyncData('categories', async () => {
  if (!isSupabaseConfigured()) return []
  try { return await fetchCategories() } catch { return [] }
})
</script>
