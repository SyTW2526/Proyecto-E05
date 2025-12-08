<template>
  <div class="dashboard cuenta-page">
    <div class="watermark"></div>

    <div class="back-button-container">
      <button class="btn small ghost-dark" @click="volverDashboard">
        ⬅ Volver
      </button>
    </div>

    <div class="container-centered animate-fade">
      
      <header class="header-center">
        <h1 class="title-main">Mi Cuenta</h1>
        <p class="subtitle-main">Gestiona tus datos personales, saldo y suscripciones.</p>
      </header>

      <section class="card-wide float animate-fade-delayed">
        <div class="card-header-row">
          <h3 class="card-title-sm">Datos Personales</h3>
          <button class="btn x-small danger-ghost" @click="logout">
            Cerrar sesión
          </button>
        </div>

        <div class="info-grid">
          <div class="info-group">
            <label>Nombre</label>
            <div class="data-box">{{ auth.user?.nombre || '...' }}</div>
          </div>

          <div class="info-group">
            <label>Email</label>
            <div class="data-box">{{ auth.user?.email || '...' }}</div>
          </div>

          <div class="info-group">
            <label>Teléfono</label>
            <div class="data-box">{{ auth.user?.telefono || "No disponible" }}</div>
          </div>

          <div class="info-group saldo-group">
            <label>Saldo disponible</label>
            <div class="saldo-wrapper">
              <span class="saldo-value">
                {{ account.loading ? "..." : account.saldo + " €" }}
              </span>
              <button class="btn small primary-glow" @click="irPlataformaPago">
                + Añadir
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="activity-grid animate-fade-delayed">
        
        <article class="card-column float">
          <h3 class="card-title-sm">Mis Grupos</h3>
          
          <div class="list-container">
            <ul v-if="account.grupos.length > 0" class="styled-list">
              <li v-for="grupo in account.grupos" :key="grupo.nombre" class="list-item">
                <span class="icon">👥</span>
                <span class="text">{{ grupo.nombre }}</span>
              </li>
            </ul>
            
            <div v-else class="empty-placeholder">
              <span>No perteneces a ningún grupo.</span>
            </div>
          </div>
        </article>

        <article class="card-column float">
          <h3 class="card-title-sm">Suscripciones Activas</h3>

          <div class="list-container">
            <ul v-if="account.suscripciones.length > 0" class="styled-list">
              <li
                v-for="sub in account.suscripciones"
                :key="sub.id"
                class="sub-item-card"
              >
                <div class="sub-row-top">
                  <span class="sub-name">{{ sub.nombre }}</span>
                  <span class="sub-price">{{ sub.precio }}€</span>
                </div>
                
                <div class="sub-details">
                  <small>Vence: {{ formatDate(sub.fechaVencimiento) }}</small>
                  <small>Cobro: {{ formatDate(sub.proximoCobro) }}</small>
                </div>

                <button class="btn x-small danger-outline full-width" @click="cancelarSuscripcion(sub)">
                  Dar de baja
                </button>
              </li>
            </ul>

            <div v-else class="empty-placeholder">
              <span>No tienes suscripciones activas.</span>
            </div>
          </div>
        </article>

      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import { useAccountStore } from "@/stores/cuenta";
import { formatDate } from "@/utils/formatDate";
// Ajusta el import según tu estructura real
import type { Suscripcion } from "@/domain/suscripcion"; 

const auth = useAuthStore();
const router = useRouter();
const account = useAccountStore();

onMounted(async () => {
  try {
    if (!auth.user) await auth.fetchMe();
    if (!auth.isAuthenticated) return router.push({ name: "login" });
    await account.userData();
  } catch (error) {
    console.error("Error cargando datos:", error);
    router.push({ name: "login" });
  }
});

async function logout() {
  await auth.logout();
  router.push({ name: "login" });
}

function volverDashboard() { router.push({ name: "dashboard" }); }
function irPlataformaPago() { router.push({ name: "plataformapago" }); }

async function cancelarSuscripcion(sub: Suscripcion) {
  const ok = confirm(`¿Seguro que quieres darte de baja de "${sub.nombre}"?`);
  if (!ok) return;
  try {
    await account.cancelSubscription(sub);
  } catch (error) {
    alert("Error al cancelar suscripción.");
  }
}
</script>

<style scoped>
/* CONFIGURACIÓN GENERAL CENTRADA */
.dashboard {
  position: relative;
  min-height: 100vh;
  padding: 4rem 2rem 3rem; 
  background: linear-gradient(120deg, #e0f2ff, #a2b8d9, #1e293b);
  display: flex;
  justify-content: center;
  align-items: flex-start; /* Alineado arriba */
  font-family: "Inter", sans-serif;
}

.watermark {
  position: absolute; inset: -20%; opacity: 0.8; pointer-events: none; z-index: 0;
  background: radial-gradient(circle at 15% 0%, rgba(255,255,255,0.35), transparent 55%),
              radial-gradient(circle at 80% 100%, rgba(59,130,246,0.4), transparent 60%);
}
.dashboard > * { z-index: 1; }

/* CONTENEDOR PRINCIPAL (ANCHO Y CENTRADO) */
.container-centered {
  width: 100%;
  max-width: 1100px; /* Ancho generoso */
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 0 auto;
}

/* HEADER (Título + Subtítulo) */
.header-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.title-main {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  text-shadow: 0 1px 2px rgba(255,255,255,0.5);
  margin: 0;
  line-height: 1.1;
}

.subtitle-main {
  margin: 0;
  color: #475569;
  font-size: 1.1rem;
}

/* --- TARJETA DATOS PERSONALES (Full Width) --- */
.card-wide {
  background: radial-gradient(circle at top left, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.9));
  border: 1px solid rgba(148, 163, 184, 0.3);
  padding: 2rem 2.5rem;
  border-radius: 1.4rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 15px 40px rgba(15, 23, 42, 0.5);
  color: white;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.card-title-sm {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: #f1f5f9;
}

/* GRID DE INPUTS (4 columnas en escritorio) */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-group label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  font-weight: 600;
}

/* Caja de datos (Simula input deshabilitado pero bonito) */
.data-box {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.2);
  padding: 0.9rem 1rem;
  border-radius: 0.8rem;
  color: #e2e8f0;
  font-size: 1rem;
  font-weight: 500;
}

/* Caja de Saldo */
.saldo-wrapper {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 95, 70, 0.3));
  border: 1px solid rgba(16, 185, 129, 0.4);
  padding: 0.6rem 1rem;
  border-radius: 0.8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.saldo-value {
  font-weight: 700;
  font-size: 1.1rem;
  color: #6ee7b7;
}

/* --- GRID INFERIOR (Grupos y Suscripciones) --- */
.activity-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Dos columnas iguales */
  gap: 2rem;
}

.card-column {
  background: radial-gradient(circle at top left, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.85));
  border: 1px solid rgba(148, 163, 184, 0.3);
  padding: 1.8rem;
  border-radius: 1.4rem;
  backdrop-filter: blur(16px);
  box-shadow: 0 15px 40px rgba(15, 23, 42, 0.5);
  display: flex;
  flex-direction: column;
  /* IMPORTANTE: Altura mínima para que se vean uniformes */
  min-height: 350px; 
}

.card-column h3 {
  margin-bottom: 1.2rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.list-container {
  flex: 1;
  overflow-y: auto; /* Scroll si hay muchas */
  padding-right: 0.5rem; /* Espacio para scrollbar */
}

/* Estilos de Lista */
.styled-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.list-item {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.2);
  padding: 0.9rem;
  border-radius: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #e2e8f0;
  font-weight: 500;
}
.icon { font-size: 1.2rem; }

/* Tarjeta de Suscripción */
.sub-item-card {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(148, 163, 184, 0.2);
  padding: 1rem;
  border-radius: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.sub-row-top {
  display: flex;
  justify-content: space-between;
  font-weight: 700;
  color: #fff;
  font-size: 1rem;
}
.sub-price { color: #60a5fa; }

.sub-details {
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
  color: #94a3b8;
  gap: 0.1rem;
}

.empty-placeholder {
  text-align: center;
  color: #64748b;
  padding: 3rem 0;
  font-style: italic;
  font-size: 0.95rem;
}

/* BOTONES */
.btn { border: none; cursor: pointer; border-radius: 0.6rem; font-weight: 600; transition: 0.2s; }
.full-width { width: 100%; margin-top: 0.5rem; }

.back-button-container { position: absolute; top: 2rem; left: 2rem; }
.btn.small { padding: 0.5rem 1rem; font-size: 0.85rem; border-radius: 999px; }
.btn.x-small { padding: 0.4rem 0.9rem; font-size: 0.8rem; border-radius: 999px; }

.btn.ghost-dark {
  background: transparent; color: #1e293b; border: 1px solid rgba(148, 163, 184, 0.6);
}
.btn.ghost-dark:hover { background: rgba(15, 23, 42, 0.1); }

.btn.danger-ghost {
  background: rgba(239, 68, 68, 0.15); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3);
}
.btn.danger-ghost:hover { background: rgba(239, 68, 68, 0.25); }

.btn.primary-glow {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}
.btn.primary-glow:hover { transform: translateY(-2px); filter: brightness(1.1); }

.btn.danger-outline {
  background: transparent; border: 1px solid #ef4444; color: #ef4444;
}
.btn.danger-outline:hover { background: #ef4444; color: white; }

/* ANIMACIONES */
.animate-fade { animation: fadeIn 0.5s ease; }
.animate-fade-delayed { animation: fadeIn 0.7s ease backwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

/* RESPONSIVE */
@media (max-width: 850px) {
  .activity-grid { grid-template-columns: 1fr; } /* Pila vertical en móvil */
  .dashboard { padding: 5rem 1rem 2rem; }
  .card-wide, .card-column { padding: 1.5rem; }
}
</style>