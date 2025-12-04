<template>
  <div class="app">
    <!-- Menú lateral izquierdo (solo cuando hay navbar) -->
    <LeftMenu v-if="shouldShowNavbarLeft" />

    <!-- Menú derecho / navbar actual -->
    <Navbar v-if="shouldShowNavbar" />

    <!-- Contenido principal -->
    <RouterView />

    <!-- Footer global -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import Navbar from "@/components/Navbar.vue";
import LeftMenu from "@/components/LeftMenu.vue";
import Footer from "@/components/Footer.vue";

const route = useRoute();

// Rutas donde NO quieres ver ni navbar ni menús flotantes
const publicRoutes = ["login", "register", "cuenta"];
const publicRoutesLeft = ["login", "register"];


const shouldShowNavbar = computed(
  () => !publicRoutes.includes(route.name as string)
);
const shouldShowNavbarLeft = computed(
  () => !publicRoutesLeft.includes(route.name as string)
);
</script>

<style>
.app {
  min-height: 100vh;
  background: linear-gradient(120deg, #e0f2ff, #a2b8d9, #93c5fd);
  color: #1e293b;
  position: relative;
  font-family: "Inter", sans-serif;
}
</style>
