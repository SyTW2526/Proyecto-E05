<template>
  <nav class="leftmenu-overlay">
    <div class="btn-container">
      <!-- BOTÓN HAMBURGUESA IZQUIERDA -->
      <button class="btn-hamburger-left" @click.stop="menuAbierto = !menuAbierto">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icon-menu">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- PANEL DESPLEGABLE -->
      <div v-if="menuAbierto" class="menu-left animate-left" @click.stop>
        <button class="menu-item" @click="go('dashboard')">🏠 Dashboard</button>
        <button class="menu-item" @click="go('buscador')">🔎 Buscador</button>
        <button class="menu-item" @click="go('ofertar')">📝 Ofertar</button>
        <button class="menu-item" @click="go('faq')">❓ FAQ</button>
        <button class="menu-item" @click="go('quejas')">⚠️ Quejas</button>
      </div>

      <!-- CAPA PARA CERRAR AL HACER CLICK FUERA -->
      <div v-if="menuAbierto" class="overlay-close" @click="menuAbierto = false"></div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const menuAbierto = ref(false);

function go(name: string) {
  menuAbierto.value = false;
  router.push({ name });
}
</script>

<style scoped>
/* El wrapper es el que manda la posición global */
.leftmenu-overlay {
  position: fixed;
  top: 90px;      /* << aquí bajas todo el bloque */
  left: 20px;
  z-index: 9998;
  pointer-events: none;
}

/* El container ya no es fixed, solo relativo dentro del wrapper */
.btn-container {
  position: relative;
  pointer-events: auto;
}

/* ===== BOTÓN HAMBURGUESA IZQUIERDA ===== */
.btn-hamburger-left {
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.15);
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.btn-hamburger-left:hover {
  transform: scale(1.05);
  background: #0f172a;
}

.icon-menu {
  width: 28px;
  height: 28px;
}

/* ===== PANEL LATERAL ===== */
.menu-left {
  position: absolute;
  top: 60px;
  left: 0;
  width: 240px;
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  color: white;
}

.animate-left {
  animation: slideLeft 0.22s ease-out;
}

@keyframes slideLeft {
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0); }
}

.menu-item {
  background: transparent;
  border: none;
  color: #cbd5e1;
  padding: 0.75rem;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  font-size: 1rem;
}

.menu-item:hover {
  background: rgba(255,255,255,0.1);
  color: white;
}

/* Overlay */
.overlay-close {
  position: fixed;
  inset: 0;
  z-index: -1;
  cursor: default;
}
</style>
