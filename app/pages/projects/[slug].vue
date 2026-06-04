<template>
  <div>
    <PortfolioHeader />

    <!-- 项目未找到 -->
    <div v-if="!project && !pending" class="pt-20 pb-20">
      <EmptyState
        icon="lucide:file-question"
        title="项目未找到"
        description="该项目可能已归档或不存在。"
        wrapper-class="py-20"
      >
        <template #action>
          <BaseButton variant="outline" @click="$router.push('/projects')">
            浏览项目
          </BaseButton>
        </template>
      </EmptyState>
    </div>

    <template v-else-if="project">
      <!-- 封面大图 -->
      <section class="relative h-[65vh] min-h-[450px] bg-stone-200">
        <div v-if="project.cover_image_url" class="absolute inset-0">
          <img
            :src="project.cover_image_url"
            :alt="project.title"
            class="w-full h-full object-cover"
          />
        </div>
        <div class="absolute inset-0 bg-gradient-to-b from-stone-900/30 to-stone-900/10" />
      </section>

      <!-- 项目内容 -->
      <section class="py-section bg-canvas">
        <div class="container-narrow">
          <!-- 标题 & 标签 -->
          <div class="mb-14">
            <div class="flex items-center gap-3 mb-5">
              <span
                v-if="project.category"
                class="px-3 py-1 text-xs font-medium bg-accent-100 text-accent-600 rounded-full"
              >
                {{ project.category.name }}
              </span>
              <span
                v-for="style in project.styles"
                :key="style.id"
                class="px-3 py-1 text-xs font-medium bg-stone-100 text-stone-500 rounded-full border border-stone-200"
              >
                {{ style.name }}
              </span>
            </div>

            <h1 class="text-display-sm sm:text-display-md font-serif font-bold text-stone-800">{{ project.title }}</h1>

            <!-- 项目信息 -->
            <div class="mt-10 grid grid-cols-2 md:grid-cols-4 gap-8 p-8 bg-stone-50 rounded-sm border border-stone-200">
              <div v-if="project.location">
                <p class="text-xs text-stone-400 uppercase tracking-widest mb-1">位置</p>
                <p class="text-sm font-medium text-stone-700">{{ project.location }}</p>
              </div>
              <div v-if="project.completion_date">
                <p class="text-xs text-stone-400 uppercase tracking-widest mb-1">年份</p>
                <p class="text-sm font-medium text-stone-700">{{ formatDate(project.completion_date) }}</p>
              </div>
              <div v-if="project.client">
                <p class="text-xs text-stone-400 uppercase tracking-widest mb-1">客户</p>
                <p class="text-sm font-medium text-stone-700">{{ project.client }}</p>
              </div>
              <div v-if="project.area_sqm">
                <p class="text-xs text-stone-400 uppercase tracking-widest mb-1">面积</p>
                <p class="text-sm font-medium text-stone-700">{{ project.area_sqm }} m&sup2;</p>
              </div>
            </div>
          </div>

          <!-- 项目描述 -->
          <div v-if="project.description" class="prose prose-lg prose max-w-none mb-14">
            <p class="text-lg text-stone-600 leading-relaxed">{{ project.description }}</p>
          </div>

          <!-- 项目正文（富文本） -->
          <div v-if="project.content" class="prose prose-lg prose max-w-none mb-14" v-html="sanitizeHtml(project.content)" />

          <!-- 图片图集 -->
          <div v-if="project.images && project.images.length > 1" class="mb-14">
            <h2 class="text-2xl font-serif font-bold text-stone-800 mb-8">项目图集</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div
                v-for="img in project.images"
                :key="img.id"
                class="relative aspect-[4/3] rounded-sm overflow-hidden cursor-pointer group bg-stone-100"
                @click="openGallery(img)"
              >
                <img
                  :src="getImageUrl(img.storage_path)"
                  :alt="img.alt_text || ''"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                  loading="lazy"
                />
                <div v-if="img.caption" class="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-stone-900/70 to-transparent">
                  <p class="text-sm text-canvas">{{ img.caption }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 相关项目 -->
          <div v-if="relatedProjects.length > 0" class="border-t border-stone-200 pt-14">
            <h2 class="text-2xl font-serif font-bold text-stone-800 mb-8">相关项目</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
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
    </template>

    <div v-else class="py-20 text-center">
      <LoadingSpinner size="lg" />
    </div>

    <PortfolioFooter />
  </div>
</template>

<script setup lang="ts">
import type { ProjectImage } from '~/types/models'
import { getImageUrl } from '~/composables/useApi'
import { sanitizeHtml } from '~/composables/useSanitize'

definePageMeta({ validate: true })

const route = useRoute()
const { fetchProjectBySlug, fetchRelatedProjects } = useProjects()

const slug = route.params.slug as string

const project = ref<any>(null)
const relatedProjects = ref<any[]>([])
const pending = ref(true)

onMounted(async () => {
  try { project.value = await fetchProjectBySlug(slug) } catch { project.value = null }
  pending.value = false
  if (project.value?.category_id) {
    try { relatedProjects.value = await fetchRelatedProjects(project.value.category_id, slug) } catch { relatedProjects.value = [] }
  }
})

function openGallery(img: ProjectImage) {
  // 简单的灯箱 —— 后续可替换为 PhotoSwipe
  if (!project.value?.images) return
  const images = project.value.images
  const currentIndex = images.findIndex(i => i.id === img.id)

  const overlay = document.createElement('div')
  overlay.className = 'fixed inset-0 z-50 bg-stone-900/95 flex items-center justify-center p-8 cursor-pointer'
  overlay.onclick = () => overlay.remove()

  const imgEl = document.createElement('img')
  imgEl.src = getImageUrl(img.storage_path)
  imgEl.alt = img.alt_text || ''
  imgEl.className = 'max-h-[90vh] max-w-full object-contain'

  overlay.appendChild(imgEl)
  document.body.appendChild(overlay)
}

function formatDate(date: string) {
  return new Date(date).getFullYear().toString()
}
</script>
