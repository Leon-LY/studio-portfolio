<template>
  <footer class="bg-gray-50 border-t border-gray-100">
    <div class="container-wide py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Brand -->
        <div>
          <h3 class="text-lg font-bold text-gray-900">STUDIO</h3>
          <p class="mt-2 text-sm text-gray-500 leading-relaxed">
            Architecture & Design Studio — creating spaces that inspire.
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">Navigation</h4>
          <ul class="mt-3 space-y-2">
            <li v-for="link in navLinks" :key="link.to">
              <NuxtLink :to="link.to" class="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">Contact</h4>
          <ul class="mt-3 space-y-2">
            <li>
              <a href="mailto:info@studio.com" class="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                info@studio.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-10 pt-6 border-t border-gray-200">
        <p class="text-sm text-gray-400 text-center">
          &copy; {{ new Date().getFullYear() }} Studio Architecture. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const navLinks = [
  { to: '/projects', label: 'Projects' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]
</script>
