<template>
  <div>
    <div v-if="pending" class="py-20 text-center"><LoadingSpinner size="lg" text="加载中..." /></div>

    <EmptyState
      v-else-if="!project"
      icon="lucide:file-question" title="项目未找到" wrapper-class="py-20"
    >
      <template #action>
        <NuxtLink to="/admin/projects"><BaseButton variant="outline">返回项目列表</BaseButton></NuxtLink>
      </template>
    </EmptyState>

    <div v-else>
      <!-- 封面 Hero -->
      <div class="relative h-[40vh] min-h-[320px] bg-stone-800 overflow-hidden">
        <img v-if="project.cover_image_url" :src="project.cover_image_url" class="absolute inset-0 w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />
        <!-- 底部信息覆盖 -->
        <div class="absolute bottom-0 inset-x-0 p-6 sm:p-8">
          <div class="max-w-5xl mx-auto">
            <div class="flex items-center gap-2 mb-3">
              <StatusBadge :status="project.status" />
              <span v-if="project.category" class="text-xs text-accent-300/80 tracking-wider uppercase">{{ project.category.name }}</span>
            </div>
            <h1 class="font-serif text-display-sm sm:text-display-md font-bold text-canvas">{{ project.title }}</h1>
          </div>
        </div>
        <!-- 顶部操作 -->
        <div class="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2">
          <NuxtLink to="/admin/projects" class="p-2 rounded-sm text-canvas/60 hover:text-canvas hover:bg-stone-800/50 transition-colors" title="返回列表">
            <Icon name="lucide:arrow-left" size="18" />
          </NuxtLink>
          <a v-if="project.status === 'published'" :href="`/projects/${project.slug || project.id}`" target="_blank" class="p-2 rounded-sm text-canvas/60 hover:text-canvas hover:bg-stone-800/50 transition-colors" title="前台查看">
            <Icon name="lucide:external-link" size="18" />
          </a>
          <NuxtLink :to="`/admin/projects/${project.id}/edit`" class="px-3 py-1.5 text-xs font-medium bg-canvas/90 text-ink rounded-sm hover:bg-white transition-colors">
            编辑
          </NuxtLink>
        </div>
      </div>

      <!-- 统计条 -->
      <div class="border-b border-stone-200 bg-white">
        <div class="max-w-5xl mx-auto px-6 sm:px-8 grid grid-cols-2 sm:grid-cols-4 divide-x divide-stone-100">
          <div v-if="project.location" class="py-4 px-4">
            <p class="text-[10px] text-stone-400 uppercase tracking-widest mb-0.5">位置</p>
            <p class="text-sm font-medium text-stone-700">{{ project.location }}</p>
          </div>
          <div v-if="project.completion_date" class="py-4 px-4">
            <p class="text-[10px] text-stone-400 uppercase tracking-widest mb-0.5">年份</p>
            <p class="text-sm font-medium text-stone-700">{{ formatDate(project.completion_date) }}</p>
          </div>
          <div v-if="project.client" class="py-4 px-4">
            <p class="text-[10px] text-stone-400 uppercase tracking-widest mb-0.5">客户</p>
            <p class="text-sm font-medium text-stone-700">{{ project.client }}</p>
          </div>
          <div v-if="project.area_sqm" class="py-4 px-4">
            <p class="text-[10px] text-stone-400 uppercase tracking-widest mb-0.5">面积</p>
            <p class="text-sm font-medium text-stone-700">{{ project.area_sqm }} m²</p>
          </div>
        </div>
      </div>

      <!-- 主体内容 -->
      <div class="max-w-5xl mx-auto p-6 sm:p-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <!-- 左侧：描述 + 正文 -->
          <div class="lg:col-span-2 space-y-8">
            <div v-if="project.description">
              <p class="text-body text-stone-700 leading-relaxed">{{ project.description }}</p>
            </div>
            <div v-if="project.content" class="prose prose-sm max-w-none" v-html="sanitizeHtml(project.content)" />
            <div v-if="!project.description && !project.content" class="text-sm text-stone-400">暂无项目描述。</div>
          </div>

          <!-- 右侧：元数据 -->
          <div class="space-y-6">
            <div class="bg-stone-50 rounded-sm border border-stone-200 p-5">
              <h3 class="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">项目信息</h3>
              <div class="space-y-3 text-sm">
                <div v-if="project.styles?.length">
                  <p class="text-xs text-stone-400 mb-1.5">风格</p>
                  <div class="flex flex-wrap gap-1">
                    <span v-for="s in project.styles" :key="s.id" class="px-2 py-0.5 text-xs bg-white border border-stone-200 rounded-full text-stone-600">{{ s.name }}</span>
                  </div>
                </div>
                <div v-if="project.seo_title">
                  <p class="text-xs text-stone-400 mb-0.5">SEO 标题</p>
                  <p class="text-stone-600">{{ project.seo_title }}</p>
                </div>
                <div v-if="project.seo_description">
                  <p class="text-xs text-stone-400 mb-0.5">SEO 描述</p>
                  <p class="text-stone-600">{{ project.seo_description }}</p>
                </div>
                <div>
                  <p class="text-xs text-stone-400 mb-0.5">创建时间</p>
                  <p class="text-stone-600">{{ formatDateTime(project.created_at) }}</p>
                </div>
                <div>
                  <p class="text-xs text-stone-400 mb-0.5">最后更新</p>
                  <p class="text-stone-600">{{ formatDateTime(project.updated_at) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 图集 -->
        <div v-if="project.images && project.images.length > 0" class="mt-12 pt-10 border-t border-stone-200">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-stone-800">项目图集</h2>
            <span class="text-xs text-stone-400">{{ project.images.length }} 张图片</span>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div
              v-for="img in project.images"
              :key="img.id"
              class="relative aspect-[4/3] rounded-sm overflow-hidden bg-stone-100 cursor-pointer group ring-1 ring-stone-100"
              @click="openLightbox(img)"
            >
              <img :src="getImageUrl(img.storage_path)" :alt="img.alt_text || ''" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
              <div v-if="img.caption" class="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p class="text-xs text-white">{{ img.caption }}</p>
              </div>
            </div>
          </div>
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
function formatDateTime(d: string) { return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) }

onMounted(async () => {
  try { project.value = await fetchProjectById(projectId) } catch { project.value = null }
  pending.value = false
})
</script>
