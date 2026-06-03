<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">STUDIO Admin</h1>
        <p class="mt-2 text-sm text-gray-500">Sign in to manage your portfolio</p>
      </div>

      <form class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4" @submit.prevent="handleLogin">
        <BaseInput
          v-model="email"
          label="Email"
          type="email"
          placeholder="admin@studio.com"
          required
        />
        <BaseInput
          v-model="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          required
        />

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <BaseButton type="submit" full-width :loading="loading">
          Sign In
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
    error.value = 'Invalid email or password'
  }
}
</script>
