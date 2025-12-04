<template>
  <nav class="navbar-overlay">
    <div class="nav-container">
      
      <button class="btn-hamburger" @click.stop="toggleMenu">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icon-menu">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
        <span v-if="alertasNoVistas > 0" class="dot-badge"></span>
      </button>

      <div v-if="menuAbierto" class="menu-dropdown animate-in" @click.stop>
        
        <div class="menu-header">
          <span class="user-name">{{ auth.nombre || "Usuario" }}
            <br></br>
          </span>
          <span class="user-role">{{ auth.user?.tipo === 'admin' ? 'Administrador' : 'Miembro' }}</span>
        </div>

        <hr class="divider">

        <div class="menu-section">
          <button class="menu-item space-between" @click="toggleVerNotificaciones">
            <span>🔔 Notificaciones</span>
            <span v-if="alertasNoVistas > 0" class="num-badge">{{ alertasNoVistas }}</span>
          </button>

          <div v-if="verNotificacionesEnMenu" class="alerts-panel">
            <div v-if="alertas.length === 0" class="empty-msg">No hay novedades</div>
            <ul v-else class="alerts-list">
              <li v-for="(a, i) in alertas" :key="i" :class="{ 'new': !a.vista }">
                {{ a.mensaje }}
              </li>
            </ul>
            <button class="link-btn" @click="irAlertas">Ver todas</button>
          </div>
        </div>

        <button class="menu-item" @click="irCuenta">👤 Mi cuenta</button>
        <button v-if="auth.user?.tipo === 'admin'" class="menu-item" @click="irAdmin">🛡️ Admin</button>
        
        <hr class="divider">
        
        <button class="menu-item text-danger" @click="logout">🚪 Cerrar sesión</button>
      </div>

      <div v-if="menuAbierto" class="overlay-close" @click="menuAbierto = false"></div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from "@/stores/auth";
import { useAlertStore } from "@/stores/alertas";
import { storeToRefs } from "pinia";

const router = useRouter();
const auth = useAuthStore();
const alertStore = useAlertStore();
const { alertas, alertasNoVistas } = storeToRefs(alertStore);

const menuAbierto = ref(false);
const verNotificacionesEnMenu = ref(false);

function toggleMenu() {
  menuAbierto.value = !menuAbierto.value;
  if (!menuAbierto.value) verNotificacionesEnMenu.value = false;
}

async function toggleVerNotificaciones() {
  if (!verNotificacionesEnMenu.value) {
    await alertStore.fetchAlertas();
  }
  verNotificacionesEnMenu.value = !verNotificacionesEnMenu.value;
  if (verNotificacionesEnMenu.value && alertasNoVistas.value > 0) {
    await alertStore.marcarTodasComoVistas();
  }
}

function irCuenta() { menuAbierto.value = false; router.push({ name: 'cuenta' }); }
function irAdmin() { menuAbierto.value = false; router.push({ name: 'admin' }); }
function irAlertas() { menuAbierto.value = false; router.push({ name: 'alertas' }); }
async function logout() { await auth.logout(); router.push({ name: "login" }); }

onMounted(async () => {
  if (auth.isAuthenticated) await alertStore.fetchAlertas();
});
</script>

<style scoped>
.navbar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  pointer-events: none; 
}

.nav-container {
  position: fixed;      
  top: 20px;
  right: 20px;         
  pointer-events: auto; 
}

/* === BOTÓN HAMBURGUESA === */
.btn-hamburger {
  background: #1e293b; 
  border: 1px solid rgba(255,255,255,0.15);
  color: white;
  width: 48px; height: 48px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  transition: transform 0.2s;
}
.btn-hamburger:hover { transform: scale(1.05); background: #0f172a; }
.icon-menu { width: 28px; height: 28px; }

.dot-badge {
  position: absolute; top: 10px; right: 10px;
  width: 10px; height: 10px; background: #ef4444;
  border-radius: 50%; border: 2px solid #1e293b;
}

/* === MENÚ DESPLEGABLE === */
.menu-dropdown {
  position: absolute;
  top: 60px; right: 0;
  width: 280px;
  background: #1e293b; /* Fondo oscuro sólido */
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  color: #f8fafc;
  display: flex; flex-direction: column; gap: 0.5rem;
}

.animate-in { animation: slideUp 0.2s ease-out; }
@keyframes slideUp { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }

.user-name { font-weight: 700; font-size: 1.1rem; }
.user-role { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; }
.divider { border:0; height:1px; background:rgba(255,255,255,0.1); margin:0.5rem 0; }

.menu-item {
  background: transparent; border: none; color: #cbd5e1;
  padding: 0.8rem; border-radius: 8px; cursor: pointer; text-align: left;
  font-size: 0.95rem; display: flex; align-items: center; gap: 10px; width: 100%;
}
.menu-item:hover { background: rgba(255,255,255,0.1); color: white; }
.menu-item.space-between { justify-content: space-between; }
.text-danger { color: #f87171; } .text-danger:hover { background: rgba(239,68,68,0.2); }

/* Alertas */
/* ==== PANEL DE ALERTAS REESTILIZADO ==== */
.alerts-panel {
  background: radial-gradient(circle at top left,
    rgba(15, 23, 42, 0.95),
    rgba(15, 23, 42, 0.85)
  );
  padding: 0.9rem 0.95rem;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.45);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.9);
  font-size: 0.85rem;
}

/* Lista de alertas */
.alerts-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 150px;
  overflow-y: auto;
  padding-right: 4px; /* deja sitio a la barra */
}

/* Cada alerta */
.alerts-list li {
  padding: 6px 4px;
  border-radius: 8px;
  margin-bottom: 4px;
  color: #cbd5e1;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(30, 64, 175, 0.35);
}

.alerts-list li.new {
  color: #fef3c7;
  border-color: rgba(250, 204, 21, 0.7);
  box-shadow: 0 0 12px rgba(250, 204, 21, 0.25);
}

/* Texto "no hay novedades" */
.empty-msg {
  text-align: center;
  color: #94a3b8;
}

/* Botón ver todas */
.link-btn {
  background: none;
  border: none;
  color: #60a5fa;
  width: 100%;
  margin-top: 6px;
  cursor: pointer;
  text-decoration: underline;
  text-align: center;
  padding: 4px 0;
}

/* ==== SCROLLBAR CUSTOM SOLO PARA LAS ALERTAS ==== */

/* WebKit (Chrome, Edge, etc.) */
.alerts-list::-webkit-scrollbar {
  width: 6px;
}

.alerts-list::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.9);
  border-radius: 999px;
}

.alerts-list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #4f46e5, #22d3ee);
  border-radius: 999px;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.7);
}

.alerts-list::-webkit-scrollbar-thumb:hover {
  filter: brightness(1.1);
}

/* Firefox */
.alerts-list {
  scrollbar-width: thin;
  scrollbar-color: #4f46e5 rgba(15, 23, 42, 0.9);
}

/* Overlay de cierre */
.overlay-close { position: fixed; inset: 0; z-index: -1; cursor: default; }
</style>