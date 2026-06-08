<template>
  <div>
    <AdminHeader title="站点设置" />
    <div class="p-6">
      <div class="flex gap-6 items-start">
        <div class="flex-1 space-y-6">
          <!-- Hero 背景图 -->
          <div class="bg-white rounded-sm border border-stone-200 shadow-elevation-1">
            <div class="p-5 border-b border-stone-100">
              <h3 class="text-sm font-semibold text-stone-800">首页 Hero 背景图</h3>
              <p class="text-xs text-stone-400 mt-1">设置首页全屏区域的背景图片。留空则自动使用第一个精选项目的封面图。</p>
            </div>
            <div class="p-5">
              <div v-if="heroImage" class="mb-4">
                <p class="text-xs text-stone-500 mb-2">当前背景图：</p>
                <div class="relative aspect-[16/9] max-w-md rounded-sm overflow-hidden bg-stone-100 border border-stone-200">
                  <img :src="heroImage" class="w-full h-full object-cover" />
                  <button class="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-sm hover:bg-red-700 transition-colors" title="移除背景图" @click="removeHero">
                    <Icon name="lucide:x" size="14" />
                  </button>
                </div>
              </div>
              <div v-else class="mb-4 p-4 bg-stone-50 rounded-sm border border-stone-200 text-sm text-stone-500">
                尚未设置自定义背景图。当前首页 Hero 区域使用第一个精选项目的封面图作为背景。
              </div>
              <div
                class="border-2 border-dashed rounded-sm p-6 text-center transition-colors cursor-pointer"
                :class="isDragging ? 'border-accent-400 bg-accent-50' : 'border-stone-300 hover:border-stone-400 bg-stone-50'"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
                @click="triggerInput"
              >
                <input ref="fileInput" type="file" accept=".jpg,.jpeg,.png,.webp" class="hidden" @change="handleFileChange" />
                <Icon name="lucide:upload" size="24" class="text-stone-400 mx-auto mb-2" />
                <p class="text-sm text-stone-600">{{ uploading ? '上传中...' : '点击或拖拽上传背景图' }}</p>
                <p class="text-xs text-stone-400 mt-1">推荐尺寸 1920×1080，JPG/PNG/WebP，≤10MB</p>
              </div>
            </div>
          </div>

          <!-- 站点信息 -->
          <div class="bg-white rounded-sm border border-stone-200 shadow-elevation-1">
            <div class="p-5 border-b border-stone-100">
              <h3 class="text-sm font-semibold text-stone-800">站点信息</h3>
            </div>
            <div class="p-5 space-y-4">
              <BaseInput v-model="form.site_name" label="站点名称" placeholder="方外设计" />
              <BaseInput v-model="form.site_description" label="站点描述" placeholder="建筑设计工作室" hint="显示在浏览器标签页和搜索结果中" />
              <BaseInput v-model="form.hero_slogan" label="首页 Slogan" placeholder="方寸之外 · 别有天地" />
              <BaseTextarea v-model="form.hero_subtitle" label="首页副标题" placeholder="以思考重塑空间的边界..." :rows="2" />
              <BaseInput v-model="form.contact_email" label="联系邮箱" placeholder="email@example.com" />
              <BaseInput v-model="form.contact_address" label="联系地址" placeholder="山东 · 威海" />
              <BaseInput v-model="form.contact_phone" label="联系电话" placeholder="手机号码" />
              <BaseButton size="sm" :loading="saving" @click="saveInfo">保存信息</BaseButton>
            </div>
          </div>
        </div>

        <!-- 右侧说明面板 -->
        <div class="w-64 flex-shrink-0 space-y-4 hidden lg:block">
          <div class="bg-white rounded-sm border border-stone-200 shadow-elevation-1 p-5">
            <h4 class="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">修改即时生效</h4>
            <p class="text-xs text-stone-500 leading-relaxed">所有设置保存后立即生效，刷新前台网站即可看到变化。</p>
          </div>
          <div class="bg-stone-50 rounded-sm border border-stone-200 p-5">
            <h4 class="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">各字段作用</h4>
            <ul class="text-xs text-stone-500 space-y-2">
              <li>站点名称 — 浏览器标签页标题</li>
              <li>站点描述 — 搜索引擎摘要</li>
              <li>首页 Slogan — Hero 区大字</li>
              <li>联系信息 — Footer 和联系页</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" })
import AdminHeader from '~/components/admin/layout/AdminHeader.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseInput from '~/components/ui/BaseInput.vue'
import BaseTextarea from '~/components/ui/BaseTextarea.vue'

const toast = useToast()
const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false); const uploading = ref(false); const saving = ref(false)
const heroImage = ref('')
const form = reactive({ site_name: '', site_description: '', hero_slogan: '', hero_subtitle: '', contact_email: '', contact_address: '', contact_phone: '' })

onMounted(async () => {
  try {
    const s = await adminApi.getSettings()
    heroImage.value = s.hero_image || ''
    Object.assign(form, {
      site_name: s.site_name || '', site_description: s.site_description || '',
      hero_slogan: s.hero_slogan || '', hero_subtitle: s.hero_subtitle || '',
      contact_email: s.contact_email || '', contact_address: s.contact_address || '', contact_phone: s.contact_phone || '',
    })
  } catch {}
})

function triggerInput() { fileInput.value?.click() }
async function handleFileChange(e: Event) { const file = (e.target as HTMLInputElement).files?.[0]; if (file) await doUpload(file) }
async function handleDrop(e: DragEvent) { isDragging.value = false; const file = e.dataTransfer?.files?.[0]; if (file) await doUpload(file) }

async function doUpload(file: File) {
  uploading.value = true
  try { const data = await adminApi.uploadHeroImage(file); heroImage.value = data.url; toast.success('背景图已更新') }
  catch (e: any) { toast.error(e.message || '上传失败') }
  finally { uploading.value = false }
}

async function removeHero() {
  try { await adminApi.updateSettings({ hero_image: '' }); heroImage.value = ''; toast.success('背景图已移除') }
  catch (e: any) { toast.error(e.message) }
}

async function saveInfo() {
  saving.value = true
  try { await adminApi.updateSettings({ ...form }); toast.success('站点信息已保存') }
  catch (e: any) { toast.error(e.message) }
  finally { saving.value = false }
}
</script>
