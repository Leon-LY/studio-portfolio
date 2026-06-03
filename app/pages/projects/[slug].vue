<template>
  <div>
    <PortfolioHeader />

    <!-- Project not found -->
    <div v-if="!project && !pending" class="pt-20 pb-20">
      <EmptyState
        icon="lucide:file-question"
        title="Project Not Found"
        description="This project may have been archived or doesn't exist."
        wrapper-class="py-20"
      >
        <template #action>
          <BaseButton variant="outline" @click="$router.push('/projects')">
            Browse Projects
          </BaseButton>
        </template>
      </EmptyState>
    </div>

    <template v-else-if="project">
      <!-- Hero image -->
      <section class="relative h-[60vh] min-h-[400px]">
        <div v-if="project.cover_image_url" class="absolute inset-0">
          <img
            :src="project.cover_image_url"
            :alt="project.title"
            class="w-full h-full object-cover"
          />
        </div>
        <div v-else class="absolute inset-0 bg-gray-200" />
        <div class="absolute inset-0 bg-black/20" />
      </section>

      <!-- Project content -->
      <section class="py-16 bg-white">
        <div class="container-narrow">
          <!-- Title & meta -->
          <div class="mb-12">
            <div class="flex items-center gap-3 mb-4">
              <span
                v-if="project.category"
                class="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
              >
                {{ project.category.name }}
              </span>
              <span
                v-for="style in project.styles"
                :key="style.id"
                class="px-3 py-1 text-xs font-medium bg-gray-50 text-gray-500 rounded-full border border-gray-200"
              >
                {{ style.name }}
              </span>
            </div>

            <h1 class="text-4xl font-bold text-gray-900">{{ project.title }}</h1>

            <!-- Project info sidebar -->
            <div class="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gray-50 rounded-xl">
              <div v-if="project.location">
                <p class="text-xs text-gray-500 uppercase tracking-wider">Location</p>
                <p class="mt-1 text-sm font-medium text-gray-900">{{ project.location }}</p>
              </div>
              <div v-if="project.completion_date">
                <p class="text-xs text-gray-500 uppercase tracking-wider">Year</p>
                <p class="mt-1 text-sm font-medium text-gray-900">{{ formatDate(project.completion_date) }}</p>
              </div>
              <div v-if="project.client">
                <p class="text-xs text-gray-500 uppercase tracking-wider">Client</p>
                <p class="mt-1 text-sm font-medium text-gray-900">{{ project.client }}</p>
              </div>
              <div v-if="project.area_sqm">
                <p class="text-xs text-gray-500 uppercase tracking-wider">Area</p>
                <p class="mt-1 text-sm font-medium text-gray-900">{{ project.area_sqm }} m&sup2;</p>
              </div>
            </div>
          </div>

          <!-- Project description -->
          <div v-if="project.description" class="prose prose-gray max-w-none mb-12">
            <p class="text-lg text-gray-600 leading-relaxed">{{ project.description }}</p>
          </div>

          <!-- Project content (rich HTML) -->
          <div v-if="project.content" class="prose prose-gray max-w-none mb-12" v-html="project.content" />

          <!-- Image Gallery -->
          <div v-if="project.images && project.images.length > 1" class="mb-12">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Gallery</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="img in project.images"
                :key="img.id"
                class="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group"
                @click="openLightbox(img)"
              >
                <img
                  :src="getImageUrl(img.storage_path)"
                  :alt="img.alt_text || ''"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div v-if="img.caption" class="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <p class="text-sm text-white">{{ img.caption }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Related projects -->
          <div v-if="relatedProjects.length > 0" class="border-t border-gray-100 pt-12">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Related Projects</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProjectCard
                v-for="rp in relatedProjects"
                :key="rp.id"
                :project="rp"
                variant="compact"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Lightbox -->
      <div
        v-if="lightboxImage"
        class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        @click="lightboxImage = null"
      >
        <button
          class="absolute top-4 right-4 p-2 text-white/70 hover:text-white"
          @click="lightboxImage = null"
        >
          <Icon name="lucide:x" size="24" />
        </button>
        <img
          :src="getImageUrl(lightboxImage.storage_path)"
          :alt="lightboxImage.alt_text || ''"
          class="max-h-[90vh] max-w-full object-contain"
        />
        <p v-if="lightboxImage.caption" class="absolute bottom-4 text-white/70 text-sm">
          {{ lightboxImage.caption }}
        </p>
      </div>
    </template>

    <div v-else class="py-20 text-center">
      <LoadingSpinner size="lg" />
    </div>

    <PortfolioFooter />
  </div>
</template>

<script setup lang="ts">
import type { ProjectImage } from '~/types/models'

definePageMeta({
  validate: true,
})

const route = useRoute()
const { fetchProjectBySlug, fetchRelatedProjects } = useProjects()
const { $supabase } = useNuxtApp()

const slug = route.params.slug as string

// Fetch project (with fallback for when Supabase is not configured)
const { data: project, pending } = useAsyncData(`project-${slug}`, async () => {
  if (!isSupabaseConfigured()) return null
  try { return await fetchProjectBySlug(slug) } catch { return null }
})

// Related projects
const { data: relatedProjects } = useAsyncData(
  `related-${project.value?.category_id}`,
  async () => {
    if (!project.value?.category_id) return []
    try { return await fetchRelatedProjects(project.value.category_id, slug) } catch { return [] }
  },
  { watch: [project] },
)

// Lightbox state
const lightboxImage = ref<ProjectImage | null>(null)

function openLightbox(img: ProjectImage) {
  lightboxImage.value = img
}

function getImageUrl(path: string) {
  const { data } = $supabase.storage.from('project-images').getPublicUrl(path)
  return data.publicUrl
}

function formatDate(date: string) {
  return new Date(date).getFullYear().toString()
}
</script>
