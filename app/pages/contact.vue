<template>
  <div>
    <PortfolioHeader />

    <!-- 页头 -->
    <section class="pt-28 pb-16 bg-stone-50 border-b border-stone-200">
      <div class="container-narrow">
        <p class="text-accent-500 text-sm font-medium tracking-widest uppercase mb-3">Contact</p>
        <h1 class="text-display-sm sm:text-display-md font-serif font-bold text-stone-900">联系我们</h1>
        <p class="mt-2 text-stone-500">期待与您探讨未来的项目可能。</p>
      </div>
    </section>

    <!-- 表单区域 -->
    <section class="py-section bg-canvas">
      <div class="container-narrow">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-12">
          <!-- 联系信息 -->
          <div class="md:col-span-2 space-y-8">
            <div>
              <h3 class="text-xs text-stone-400 uppercase tracking-widest font-medium mb-4">联系方式</h3>
              <div class="space-y-4">
                <a :href="`mailto:${contactEmail}`" class="flex items-center gap-3 text-stone-600 hover:text-accent-500 transition-colors group">
                  <span class="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-accent-50 transition-colors">
                    <Icon name="lucide:mail" size="18" class="text-stone-500 group-hover:text-accent-400" />
                  </span>
                  <span class="text-sm">{{ contactEmail }}</span>
                </a>
                <div class="flex items-center gap-3 text-stone-500">
                  <span class="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                    <Icon name="lucide:map-pin" size="18" class="text-stone-500" />
                  </span>
                  <span class="text-sm">{{ contactAddress }}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 class="text-xs text-stone-400 uppercase tracking-widest font-medium mb-4">关注我们</h3>
              <div class="flex gap-3">
                <span class="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 cursor-not-allowed" title="微信">
                  <Icon name="lucide:message-circle" size="18" />
                </span>
                <span class="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 cursor-not-allowed" title="小红书">
                  <Icon name="lucide:book-open" size="18" />
                </span>
              </div>
            </div>
          </div>

          <!-- 表单 -->
          <div class="md:col-span-3">
            <form @submit.prevent="handleSubmit" class="space-y-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <BaseInput v-model="form.name" label="姓名" placeholder="您的姓名" required />
                <BaseInput v-model="form.email" label="邮箱" type="email" placeholder="your@email.com" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-stone-700 mb-1.5">项目类型</label>
                <select
                  v-model="form.projectType"
                  class="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-sm bg-white text-stone-700 focus:border-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-600 transition-colors"
                >
                  <option value="">请选择</option>
                  <option value="residential">住宅</option>
                  <option value="commercial">商业</option>
                  <option value="public">公共建筑</option>
                  <option value="landscape">景观</option>
                  <option value="renovation">改造</option>
                  <option value="other">其他</option>
                </select>
              </div>
              <BaseTextarea v-model="form.message" label="留言" placeholder="请描述您的项目需求、规模、时间计划等信息..." rows="5" required />
              <BaseButton type="submit" full-width size="lg" :loading="sending">
                {{ sending ? '发送中...' : '发送留言' }}
              </BaseButton>
              <p v-if="sent" class="text-sm text-green-600 text-center font-medium">
                <Icon name="lucide:check-circle" size="16" class="inline mr-1" />
                留言已发送，我们会尽快与您联系。
              </p>
              <p v-if="error" class="text-sm text-red-500 text-center">{{ error }}</p>
            </form>
          </div>
        </div>
      </div>
    </section>

    <PortfolioFooter />
  </div>
</template>

<script setup lang="ts">
import PortfolioHeader from '~/components/portfolio/layout/PortfolioHeader.vue'
import PortfolioFooter from '~/components/portfolio/layout/PortfolioFooter.vue'
import BaseInput from '~/components/ui/BaseInput.vue'
import BaseTextarea from '~/components/ui/BaseTextarea.vue'
import BaseButton from '~/components/ui/BaseButton.vue'

const contactEmail = ref('554295000@qq.com')
const contactAddress = ref('山东 · 威海')
onMounted(async () => {
  try {
    const res = await fetch('/api/settings')
    if (res.ok) {
      const s = await res.json()
      if (s.contact_email) contactEmail.value = s.contact_email
      if (s.contact_address) contactAddress.value = s.contact_address
    }
  } catch {}
})

const sending = ref(false)
const sent = ref(false)
const error = ref('')
const form = reactive({
  name: '',
  email: '',
  projectType: '',
  message: '',
})

async function handleSubmit() {
  if (!form.name || !form.email || !form.message) {
    error.value = '请填写所有必填字段。'
    return
  }
  sending.value = true
  error.value = ''
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: '提交失败' }))
      throw new Error(err.error)
    }
    sent.value = true
    form.name = ''
    form.email = ''
    form.projectType = ''
    form.message = ''
  } catch (e: any) {
    error.value = e.message || '发送失败，请稍后重试或直接发送邮件至 554295000@qq.com'
  } finally {
    sending.value = false
  }
}
</script>
