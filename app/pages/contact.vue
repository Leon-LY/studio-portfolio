<template>
  <div>
    <PortfolioHeader />

    <!-- 页头 -->
    <section class="pt-28 pb-16 bg-warm-50 border-b border-warm-200">
      <div class="container-narrow">
        <p class="text-accent-400 text-sm font-medium tracking-widest uppercase mb-3">联系</p>
        <h1 class="text-display-sm sm:text-display-md font-serif font-bold text-warm-800">联系我们</h1>
        <p class="mt-3 text-warm-500 text-lg">与我们取得联系，开启一段对话</p>
      </div>
    </section>

    <!-- 内容 -->
    <section class="py-section bg-cream">
      <div class="container-narrow">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-16">
          <!-- 联系信息 -->
          <div class="md:col-span-2">
            <h2 class="text-2xl font-serif font-bold text-warm-800 mb-8">开始对话</h2>
            <div class="space-y-8">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full bg-warm-100 flex items-center justify-center flex-shrink-0">
                  <Icon name="lucide:mail" size="18" class="text-warm-500" />
                </div>
                <div>
                  <p class="text-sm font-medium text-warm-800">邮箱</p>
                  <a href="mailto:info@studio.com" class="text-sm text-warm-500 hover:text-accent-500 transition-colors">
                    554295000@qq.com
                  </a>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full bg-warm-100 flex items-center justify-center flex-shrink-0">
                  <Icon name="lucide:map-pin" size="18" class="text-warm-500" />
                </div>
                <div>
                  <p class="text-sm font-medium text-warm-800">地址</p>
                  <p class="text-sm text-warm-500">中国 · 上海</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 联系表单 -->
          <div class="md:col-span-3">
            <form class="space-y-6" @submit.prevent="handleSubmit">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BaseInput v-model="form.name" label="姓名" placeholder="您的姓名" required />
                <BaseInput v-model="form.email" label="邮箱" type="email" placeholder="您的邮箱地址" required />
              </div>
              <BaseTextarea v-model="form.message" label="留言" placeholder="请告诉我们您的项目情况..." rows="5" required />
              <BaseButton type="submit" full-width size="lg">
                发送留言
              </BaseButton>
            </form>
            <p v-if="sent" class="mt-4 text-sm text-accent-600 text-center font-medium">
              感谢您的留言！我们会尽快回复您。
            </p>
          </div>
        </div>
      </div>
    </section>

    <PortfolioFooter />
  </div>
</template>

<script setup lang="ts">

const form = reactive({
  name: '',
  email: '',
  message: '',
})
const sent = ref(false)

function handleSubmit() {
  // 生产环境中应发送到邮件服务或存储到数据库
  console.log('Contact form:', form)
  sent.value = true
  form.name = ''
  form.email = ''
  form.message = ''
}
</script>
