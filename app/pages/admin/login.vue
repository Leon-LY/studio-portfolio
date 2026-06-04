<template>
  <div class="min-h-screen bg-warm-50 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <h1 class="font-serif text-2xl font-bold text-warm-800">形筑 · 后台管理</h1>
        <p class="mt-2 text-sm text-warm-500">登录以管理作品集</p>
      </div>

      <form class="bg-white p-6 rounded-sm shadow-elevation-2 border border-warm-200 space-y-4" @submit.prevent="handleLogin">
        <BaseInput
          v-model="email"
          label="邮箱"
          type="email"
          placeholder="admin@studio.com"
          required
        />
        <BaseInput
          v-model="password"
          label="密码"
          type="password"
          placeholder="········"
          required
        />

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <BaseButton type="submit" full-width :loading="loading">
          登录
        </BaseButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const route = useRoute()
const { signIn } = useAuth()

async function handleLogin() {
  loading.value = true
  error.value = ''
  const success = await signIn(email.value, password.value)
  loading.value = false
  if (success) {
    const redirect = (route.query.redirect as string) || '/admin'
    await navigateTo(redirect)
  } else {
    error.value = '邮箱或密码错误'
  }
}
</script>
