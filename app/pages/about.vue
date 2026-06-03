<template>
  <div>
    <PortfolioHeader />

    <!-- Page header -->
    <section class="pt-24 pb-12 bg-gray-50 border-b border-gray-100">
      <div class="container-wide">
        <h1 class="text-4xl font-bold text-gray-900">About</h1>
      </div>
    </section>

    <!-- Content -->
    <section class="py-16 bg-white">
      <div class="container-narrow">
        <div class="prose prose-gray max-w-none">
          <h2 class="text-2xl font-bold text-gray-900">Our Studio</h2>
          <p class="text-gray-600 leading-relaxed">
            We are a small architecture and design studio dedicated to creating spaces that are
            both beautiful and functional. Our approach combines thoughtful design with practical
            solutions, always with the client's needs at the center.
          </p>

          <h2 class="text-2xl font-bold text-gray-900 mt-10">Our Philosophy</h2>
          <p class="text-gray-600 leading-relaxed">
            Every project is a conversation between space, light, materials, and human experience.
            We believe that good architecture should feel inevitable — as if the building has always
            belonged exactly where it stands.
          </p>

          <h2 class="text-2xl font-bold text-gray-900 mt-10">Services</h2>
          <ul class="text-gray-600 leading-relaxed space-y-1">
            <li>Architectural Design</li>
            <li>Interior Design</li>
            <li>Landscape Design</li>
            <li>Renovation &amp; Adaptive Reuse</li>
            <li>Concept Design &amp; Feasibility Studies</li>
          </ul>
        </div>
      </div>
    </section>

    <PortfolioFooter />
  </div>
</template>

<script setup lang="ts">
</script>
