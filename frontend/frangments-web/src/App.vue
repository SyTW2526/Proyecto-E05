<template>
  <div class="app">
    <RouterView />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Footer from "@/components/Footer.vue"
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: #0f172a; /* azul oscuro tailwind-like */
  color: #e2e8f0;
}
</style>
