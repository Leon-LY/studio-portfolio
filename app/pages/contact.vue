<template>
  <div>
    <PortfolioHeader />

    <!-- Page header -->
    <section class="pt-24 pb-12 bg-gray-50 border-b border-gray-100">
      <div class="container-wide">
        <h1 class="text-4xl font-bold text-gray-900">Contact</h1>
        <p class="mt-2 text-gray-500">Get in touch with us</p>
      </div>
    </section>

    <!-- Content -->
    <section class="py-16 bg-white">
      <div class="container-narrow">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
          <!-- Contact info -->
          <div>
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Let's Talk</h2>
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <Icon name="lucide:mail" size="20" class="text-gray-400 mt-0.5" />
                <div>
                  <p class="text-sm font-medium text-gray-900">Email</p>
                  <a href="mailto:info@studio.com" class="text-sm text-gray-500 hover:text-gray-900">
                    info@studio.com
                  </a>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <Icon name="lucide:map-pin" size="20" class="text-gray-400 mt-0.5" />
                <div>
                  <p class="text-sm font-medium text-gray-900">Location</p>
                  <p class="text-sm text-gray-500">Your City, Country</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact form -->
          <div>
            <form class="space-y-4" @submit.prevent="handleSubmit">
              <BaseInput v-model="form.name" label="Name" placeholder="Your name" required />
              <BaseInput v-model="form.email" label="Email" type="email" placeholder="your@email.com" required />
              <BaseTextarea v-model="form.message" label="Message" placeholder="Tell us about your project..." rows="4" required />
              <BaseButton type="submit" full-width>
                Send Message
              </BaseButton>
            </form>
            <p v-if="sent" class="mt-4 text-sm text-green-600 text-center">
              Thanks for your message! We'll get back to you soon.
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
  // In production, send to email service or store in Supabase
  console.log('Contact form:', form)
  sent.value = true
  form.name = ''
  form.email = ''
  form.message = ''
}
</script>
