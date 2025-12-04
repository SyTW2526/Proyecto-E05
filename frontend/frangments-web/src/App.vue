<template>
  <div class="app">
    <Navbar v-if="shouldShowNavbar" />
    <RouterView />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from "@/components/Navbar.vue";
import Footer from './components/Footer.vue';

const route = useRoute();
const publicRoutes = ['login', 'register', 'cuenta']; 
const shouldShowNavbar = computed(() => !publicRoutes.includes(route.name as string));
</script>

<style>
/* FONDO GLOBAL CLARITO (El que te gusta) */
.app {
  min-height: 100vh;
  background: linear-gradient(120deg, #e0f2ff, #a2b8d9, #93c5fd);
  color: #1e293b;
  position: relative;
  font-family: 'Inter', sans-serif;
}
</style>