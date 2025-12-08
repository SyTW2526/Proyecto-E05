<template>
  <div class="dashboard alertas-page">
    <div class="watermark"></div>

    <div class="back-button-container">
      <button class="btn small ghost-dark" @click="volverDashboard">
        ⬅ Volver
      </button>
    </div>

    <div class="container-centered animate-fade">
      
      <header class="header-center">
        <h1 class="title-main">Mis Alertas</h1>
        <p class="subtitle-main">Mantente al día con tus pagos, grupos y notificaciones.</p>
      </header>

      <section class="alertas-list animate-fade-delayed">
        
        <div v-if="isLoading" class="state-msg">
          <div class="spinner"></div>
          <p>Cargando notificaciones...</p>
        </div>

        <div v-else-if="error" class="msg error">
          ❌ {{ error }}
        </div>

        <template v-else>
          <div v-if="alertas.length > 0" class="alerts-stack">
            <article
              v-for="alerta in alertas"
              :key="alerta.id"
              class="alert-card-wide float"
            >
              <div class="alert-content">
                <div class="alert-meta">
                  <span class="badge" :class="claseTipo(alerta.tipo)">
                    {{ formatearTipo(alerta.tipo) }}
                  </span>
                  <span class="date-mobile">{{ formatearFecha(alerta.fecha || alerta.createdAt) }}</span>
                </div>
                
                <p class="alert-message">{{ alerta.mensaje }}</p>
              </div>

              <div class="alert-right">
                <span class="date-desktop">{{ formatearFecha(alerta.fecha || alerta.createdAt) }}</span>
              </div>
            </article>
          </div>

          <div v-else class="empty-state">
            <span class="empty-icon">🔕</span>
            <p>No tienes notificaciones nuevas</p>
          </div>
        </template>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAlertStore } from "@/stores/alertas";
import { storeToRefs } from "pinia";

const router = useRouter();
const alertStore = useAlertStore();
const { alertas, isLoading, error } = storeToRefs(alertStore);

const volverDashboard = () => {
  router.push({ name: "dashboard" });
};

onMounted(async () => {
  if (alertas.value.length === 0) {
    await alertStore.fetchAlertas();
  }
});

const formatearTipo = (tipo?: string) => {
  const mapping: Record<string, string> = {
    pago: "Pago",
    grupo: "Grupo",
    suscripcion: "Suscripción",
    sistema: "Sistema",
  };
  return mapping[tipo ?? ""] || "Aviso";
};

const claseTipo = (tipo?: string) => {
  return tipo ? tipo.toLowerCase() : 'default';
};

const formatearFecha = (fechaRaw?: string) => {
  if (!fechaRaw) return "";
  const d = new Date(fechaRaw);
  if (isNaN(d.getTime())) return fechaRaw;
  // Formato: 05 de diciembre, 09:30
  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit"
  });
};
</script>

<style scoped>
/* CONFIGURACIÓN GENERAL */
.dashboard {
  position: relative;
  min-height: 100vh;
  /* Espaciado superior para que el contenido no pegue arriba */
  padding: 4rem 2rem 2rem; 
  background: linear-gradient(120deg, #e0f2ff, #a2b8d9, #1e293b);
  
  /* Flex para centrar todo el bloque */
  display: flex;
  justify-content: center; 
  align-items: flex-start; /* Alineado arriba, no al centro vertical */
  font-family: "Inter", sans-serif;
}

.watermark {
  position: absolute; inset: -20%; opacity: 0.8; pointer-events: none; z-index: 0;
  background: radial-gradient(circle at 15% 0%, rgba(255,255,255,0.35), transparent 55%),
              radial-gradient(circle at 80% 100%, rgba(59,130,246,0.4), transparent 60%);
}
.dashboard > * { z-index: 1; }

/* CONTENEDOR ANCHO Y CENTRADO */
.container-centered {
  width: 100%;
  max-width: 1100px; /* AQUÍ ALARGAMOS EL CONTENIDO (1100px es bastante ancho) */
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 0 auto; /* Asegura centrado horizontal extra */
}

/* HEADER */
.header-center {
  display: flex;
  flex-direction: column; /* Apila título y subtítulo */
  align-items: center;
  text-align: center;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.title-main {
  font-size: 2.4rem;
  font-weight: 800;
  color: #1e293b;
  text-shadow: 0 1px 2px rgba(255,255,255,0.5);
  margin: 0;
  line-height: 1.1;
}

.subtitle-main {
  margin: 0;
  color: #475569;
  font-size: 1.05rem;
}

/* LISTA DE ALERTAS */
.alerts-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* TARJETA DE ALERTA "ALARGADA" */
.alert-card-wide {
  background: radial-gradient(circle at top left, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.95));
  border: 1px solid rgba(148, 163, 184, 0.3);
  padding: 1.4rem 2rem;
  border-radius: 1.2rem;
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.4);
  
  /* Layout interno horizontal */
  display: flex;
  align-items: center; 
  justify-content: space-between;
  gap: 1.5rem;
  
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.alert-card-wide:hover {
  transform: translateX(4px);
  border-color: rgba(129, 140, 248, 0.6);
  background: radial-gradient(circle at top left, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 1));
}

/* CONTENIDO DE LA ALERTA */
.alert-content {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex: 1; /* Ocupa todo el espacio disponible */
}

.alert-meta {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.alert-message {
  color: #f1f5f9;
  font-size: 1.05rem;
  margin: 0;
  line-height: 1.4;
}

/* PARTE DERECHA (FECHA) */
.alert-right {
  text-align: right;
  min-width: 140px;
}

.date-desktop {
  font-size: 0.9rem;
  color: #94a3b8;
  font-weight: 500;
}
.date-mobile { display: none; }

/* BADGES (ETIQUETAS) */
.badge {
  padding: 0.3rem 0.7rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid transparent;
}

/* Colores Badge */
.badge.pago { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border-color: rgba(239, 68, 68, 0.4); }
.badge.grupo { background: rgba(59, 130, 246, 0.2); color: #93c5fd; border-color: rgba(59, 130, 246, 0.4); }
.badge.suscripcion { background: rgba(168, 85, 247, 0.2); color: #d8b4fe; border-color: rgba(168, 85, 247, 0.4); }
.badge.sistema { background: rgba(100, 116, 139, 0.3); color: #cbd5e1; border-color: rgba(100, 116, 139, 0.5); }
.badge.default { background: rgba(255, 255, 255, 0.1); color: #e2e8f0; }

/* ESTADOS */
.state-msg, .empty-state {
  text-align: center;
  padding: 3rem;
  color: #1e293b;
  background: rgba(255,255,255,0.3);
  border-radius: 1rem;
  backdrop-filter: blur(5px);
}
.spinner {
  margin: 0 auto 1rem;
  width: 30px; height: 30px;
  border: 3px solid rgba(30, 41, 59, 0.2);
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-icon { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
.msg.error {
  background: rgba(239, 68, 68, 0.2);
  color: #b91c1c;
  padding: 1rem;
  border-radius: 0.8rem;
  text-align: center;
  font-weight: 700;
  border: 1px solid #ef4444;
}

/* BOTÓN VOLVER */
.back-button-container {
  position: absolute;
  top: 2rem;
  left: 2rem;
}
.btn { border: none; cursor: pointer; border-radius: 999px; font-weight: 600; transition: 0.2s; }
.btn.small { padding: 0.5rem 1rem; font-size: 0.9rem; }
.btn.ghost-dark { background: transparent; color: #1e293b; border: 1px solid rgba(148, 163, 184, 0.6); }
.btn.ghost-dark:hover { background: rgba(15, 23, 42, 0.1); }

/* ANIMACIONES */
.animate-fade { animation: fadeIn 0.5s ease; }
.animate-fade-delayed { animation: fadeIn 0.7s ease backwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

/* RESPONSIVE */
@media (max-width: 768px) {
  .dashboard { padding-left: 1rem; padding-right: 1rem; }
  .alert-card-wide {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
  .alert-right { display: none; } /* Ocultar fecha derecha en móvil */
  .date-mobile { display: inline-block; font-size: 0.8rem; color: #94a3b8; margin-left: auto; }
  .alert-meta { width: 100%; justify-content: space-between; }
}
</style>