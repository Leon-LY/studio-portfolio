<template>
  <div>
    <AdminHeader title="项目详情" />

    <div v-if="pending" class="py-20 text-center">
      <LoadingSpinner size="lg" text="加载中..." />
    </div>

    <EmptyState
      v-else-if="!project"
      icon="lucide:file-question"
      title="项目未找到"
      wrapper-class="py-20"
    >
      <template #action>
        <NuxtLink to="/admin/projects"><BaseButton variant="outline">返回项目列表</BaseButton></NuxtLink>
      </template>
    </EmptyState>

    <div v-else class="p-6 max-w-5xl">
      <!-- 顶部操作栏 -->
      <div class="flex items-center justify-between mb-6">
        <NuxtLink to="/admin/projects" class="inline-flex items-center gap-1 text-sm text-stone-400 hover:text-stone-600 transition-colors">
          <Icon name="lucide:arrow-left" size="14" /> 返回列表
        </NuxtLink>
        <div class="flex items-center gap-2">
          <a v-if="project.status === 'published'" :href="`/projects/${project.slug || project.id}`" target="_blank" class="inline-flex items-center px-3 py-1.5 text-sm border border-stone-200 rounded-sm text-stone-500 hover:border-stone-300 hover:text-stone-700 transition-colors">
            <Icon name="lucide:external-link" size="14" class="mr-1" /> 前台查看
          </a>
          <NuxtLink :to="`/admin/projects/${project.id}/edit`" class="inline-flex items-center px-3 py-1.5 text-sm bg-stone-800 text-canvas rounded-sm hover:bg-stone-700 transition-colors">
            <Icon name="lucide:pencil" size="14" class="mr-1" /> 编辑
          </NuxtLink>
        </div>
      </div>

      <!-- 封面 -->
      <div class="mb-8 rounded-sm overflow-hidden bg-stone-100 aspect-[21/9]">
        <img v-if="project.cover_image_url" :src="project.cover_image_url" :alt="project.title" class="w-full h-full object-cover" />
        <div v-else class="w-full h-full flex items-center justify-center">
          <Icon name="lucide:image" size="48" class="text-stone-300" />
        </div>
      </div>

      <!-- 标题 & 标签 -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-3">
          <StatusBadge :status="project.status" />
          <span v-if="project.category" class="px-2.5 py-0.5 text-xs font-medium bg-accent-100 text-accent-600 rounded-full">{{ project.category.name }}</span>
          <span v-for="s in project.styles" :key="s.id" class="px-2.5 py-0.5 text-xs bg-stone-100 text-stone-500 rounded-full border border-stone-200">{{ s.name }}</span>
        </div>
        <h1 class="font-serif text-display-sm font-bold text-stone-900">{{ project.title }}</h1>
      </div>

      <!-- 信息网格 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-stone-50 rounded-sm border border-stone-200 mb-8">
        <div v-if="project.location">
          <p class="text-xs text-stone-400 uppercase tracking-wider mb-1">位置</p>
          <p class="text-sm font-medium text-stone-700">{{ project.location }}</p>
        </div>
        <div v-if="project.completion_date">
          <p class="text-xs text-stone-400 uppercase tracking-wider mb-1">年份</p>
          <p class="text-sm font-medium text-stone-700">{{ formatDate(project.completion_date) }}</p>
        </div>
        <div v-if="project.client">
          <p class="text-xs text-stone-400 uppercase tracking-wider mb-1">客户</p>
          <p class="text-sm font-medium text-stone-700">{{ project.client }}</p>
        </div>
        <div v-if="project.area_sqm">
          <p class="text-xs text-stone-400 uppercase tracking-wider mb-1">面积</p>
          <p class="text-sm font-medium text-stone-700">{{ project.area_sqm }} m²</p>
        </div>
      </div>

      <!-- 描述 -->
      <div v-if="project.description" class="mb-8">
        <h2 class="text-sm font-semibold text-stone-800 mb-3">项目描述</h2>
        <p class="text-sm text-stone-600 leading-relaxed">{{ project.description }}</p>
      </div>

      <!-- 正文 -->
      <div v-if="project.content" class="mb-8">
        <h2 class="text-sm font-semibold text-stone-800 mb-3">正文内容</h2>
        <div class="prose prose-sm max-w-none text-stone-600" v-html="sanitizeHtml(project.content)" />
      </div>

      <!-- 图集 -->
      <div v-if="project.images && project.images.length > 0" class="mb-8">
        <h2 class="text-sm font-semibold text-stone-800 mb-4">项目图集 ({{ project.images.length }})</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <div
            v-for="img in project.images"
            :key="img.id"
            class="relative aspect-[4/3] rounded-sm overflow-hidden bg-stone-100 cursor-pointer group"
            @click="openLightbox(img)"
          >
            <img :src="getImageUrl(img.storage_path)" :alt="img.alt_text || ''" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
            <div v-if="img.caption" class="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-stone-900/60 to-transparent">
              <p class="text-xs text-canvas">{{ img.caption }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- SEO -->
      <div v-if="project.seo_title || project.seo_description" class="mb-8 p-5 bg-stone-50 rounded-sm border border-stone-200">
        <h2 class="text-sm font-semibold text-stone-800 mb-3">SEO 信息</h2>
        <div class="text-xs text-stone-500 space-y-1">
          <p v-if="project.seo_title">标题：{{ project.seo_title }}</p>
          <p v-if="project.seo_description">描述：{{ project.seo_description }}</p>
        </div>
      </div>
    </div>

    <ImageLightbox v-model="lightboxOpen" :images="lightboxImages" :initial-index="lightboxIndex" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" })
import type { ProjectImage } from '~/types/models'
import { getImageUrl } from '~/composables/useApi'
import { sanitizeHtml } from '~/composables/useSanitize'
import AdminHeader from '~/components/admin/layout/AdminHeader.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import StatusBadge from '~/components/admin/projects/StatusBadge.vue'
import ImageLightbox from '~/components/ui/ImageLightbox.vue'

const route = useRoute()
const { fetchProjectById } = useAdminProjects()
const projectId = route.params.id as string

const project = ref<any>(null)
const pending = ref(true)

const lightboxOpen = ref(false)
const lightboxIndex = ref(0)
const lightboxImages = computed(() =>
  (project.value?.images || []).map((i: ProjectImage) => ({ src: getImageUrl(i.storage_path), alt: i.alt_text || '' }))
)

function openLightbox(img: ProjectImage) {
  if (!project.value?.images) return
  lightboxIndex.value = project.value.images.findIndex((i: ProjectImage) => i.id === img.id)
  lightboxOpen.value = true
}

function formatDate(d: string) { return new Date(d).getFullYear().toString() }

onMounted(async () => {
  try { project.value = await fetchProjectById(projectId) } catch { project.value = null }
  pending.value = false
})
</script>
