<script setup lang="ts">
definePageMeta({
  middleware: [
    function () {
      return navigateTo('/dashboard/login')
    },
  ],
})
</script>

<template>
  <div class="flex flex-col justify-center">
    <HomeHero />
    <HomeLogos />
    <HomeFeatures />
    <HomeStats />
    <HomeTestimonials />
    <HomeCta />
  </div>
</template>
