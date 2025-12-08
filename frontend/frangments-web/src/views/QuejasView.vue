<template>
  <div class="dashboard quejas-page">
    <div class="watermark"></div>

    <div class="back-button-container">
      <button class="btn small ghost-dark" @click="volver">⬅ Volver</button>
    </div>

    <div class="center-wrapper animate-fade">
      
      <header class="header-centered">
        <h2 class="title-main">Enviar una queja</h2>
        <p class="subtitle-main">Cuéntanos tu problema con un plan, usuario o la plataforma.</p>
      </header>

      <div class="card-wide animate-fade-delayed">
        
        <div class="form-grid">
          <div class="form-item">
            <label for="grupo">Grupo asociado</label>
            <div class="select-wrapper">
              <select id="grupo" v-model.number="idGrupo">
                <option disabled value="null">Selecciona un grupo</option>
                <option v-for="g in grupos" :key="g.id" :value="g.id">
                  {{ g.nombre }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-item">
            <label for="titulo">Asunto</label>
            <input
              id="titulo"
              type="text"
              v-model="titulo"
              placeholder="Ej. Problema con el pago"
            />
          </div>

          <div class="form-item full-width">
            <label for="mensaje">Mensaje</label>
            <textarea
              id="mensaje"
              v-model="mensaje"
              rows="6"
              placeholder="Describe detalladamente qué ha ocurrido..."
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button
            class="btn primary big-btn"
            :disabled="loading || !titulo || !mensaje || !idGrupo"
            @click="enviar"
          >
            {{ loading ? "Enviando..." : "Enviar queja" }}
          </button>
        </div>

        <div v-if="success" class="msg success">
          ✅ Queja enviada correctamente.
        </div>
        <div v-if="errorMsg" class="msg error">
          ❌ {{ errorMsg }}
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useQuejasStore } from "@/stores/queja";
import { useAccountStore } from "@/stores/cuenta";

const router = useRouter();
const quejasStore = useQuejasStore();
const accountStore = useAccountStore();

const titulo = ref("");
const mensaje = ref("");
const idGrupo = ref<number | null>(null);
const loading = ref(false);
const success = ref(false);
const errorMsg = ref("");

const grupos = computed(() => accountStore.grupos);

onMounted(async () => {
  if (!grupos.value.length) await accountStore.userData();
});

const enviar = async () => {
  if (!titulo.value || !mensaje.value || !idGrupo.value) {
    errorMsg.value = "Rellena todos los campos.";
    return;
  }
  loading.value = true;
  success.value = false;
  errorMsg.value = "";

  try {
    await quejasStore.crearQueja({
      titulo: titulo.value,
      mensaje: mensaje.value,
      id_grupo: idGrupo.value,
    });
    success.value = true;
    titulo.value = "";
    mensaje.value = "";
    idGrupo.value = null;
  } catch (err) {
    errorMsg.value = "Error al enviar la queja.";
  } finally {
    loading.value = false;
  }
};

function volver() { router.push({ name: 'dashboard' }); }
</script>

<style scoped>
/* ESTRUCTURA CENTRADA */
.dashboard {
  position: relative;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(120deg, #e0f2ff, #a2b8d9, #1e293b);
  
  /* Flexbox para centrar vertical y horizontalmente */
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "Inter", sans-serif;
}

.watermark {
  position: absolute; inset: -20%; opacity: 0.8; pointer-events: none; z-index: 0;
  background: radial-gradient(circle at 15% 0%, rgba(255,255,255,0.35), transparent 55%),
              radial-gradient(circle at 80% 100%, rgba(59,130,246,0.4), transparent 60%);
}
.dashboard > * { z-index: 1; }

/* CONTENEDOR ANCHO (950px) */
.center-wrapper {
  width: 100%;
  max-width: 950px; /* Aquí controlas cuán "alargado" es el recuadro */
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* HEADER */
.header-centered {
  text-align: center;
}

.title-main {
  font-size: 2.2rem;
  font-weight: 800;
  color: #1e293b;
  text-shadow: 0 1px 2px rgba(255,255,255,0.5);
  margin: 0;
}

.subtitle-main {
  margin-top: 0.5rem;
  color: #475569;
  font-size: 1.1rem;
}

/* TARJETA ANCHA */
.card-wide {
  background: radial-gradient(circle at top left, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.85));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.3);
  padding: 3rem; /* Bastante padding para que respire */
  border-radius: 1.4rem;
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.6);
  color: white;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* GRID LAYOUT PARA APROVECHAR EL ANCHO */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 2 Columnas */
  gap: 2rem;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* El textarea ocupa las 2 columnas */
.full-width {
  grid-column: 1 / -1; 
}

label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #cbd5e1;
  margin-left: 0.2rem;
}

input, select, textarea {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: white;
  padding: 0.9rem 1.1rem;
  border-radius: 0.9rem;
  font-size: 1rem;
  width: 100%;
  outline: none;
  font-family: inherit;
  transition: 0.2s;
}

textarea {
  resize: vertical;
  min-height: 150px;
}

input:focus, select:focus, textarea:focus {
  border-color: #22d3ee;
  background: rgba(30, 41, 59, 0.9);
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.15);
}

.form-actions {
  margin-top: 1rem;
}

.btn { border: none; cursor: pointer; border-radius: 0.8rem; font-weight: 600; transition: 0.2s; }

.big-btn {
  width: 100%;
  padding: 1.1rem;
  font-size: 1.1rem;
  background: linear-gradient(135deg, #4f46e5, #22d3ee);
  color: white;
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.5);
}
.big-btn:hover { filter: brightness(1.1); transform: translateY(-2px); }
.big-btn:disabled { opacity: 0.6; cursor: default; transform: none; }

/* Botón volver */
.back-button-container {
  position: absolute;
  top: 2rem;
  left: 2rem;
}
.btn.small { padding: 0.5rem 1rem; border-radius: 999px; font-size: 0.9rem;}
.btn.ghost-dark {
  background: transparent; color: #1e293b; border: 1px solid rgba(148, 163, 184, 0.6);
}
.btn.ghost-dark:hover { background: rgba(15, 23, 42, 0.1); }

/* Feedback */
.msg { padding: 1rem; border-radius: 0.8rem; text-align: center; font-weight: 600; margin-top: 0.5rem; }
.msg.success { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #10b981; }
.msg.error { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid #ef4444; }

/* Animaciones */
.animate-fade { animation: fadeIn 0.5s ease; }
.animate-fade-delayed { animation: fadeIn 0.7s ease backwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

/* RESPONSIVE: En móvil vuelve a una sola columna */
@media (max-width: 768px) {
  .form-grid { grid-template-columns: 1fr; }
  .card-wide { padding: 1.5rem; }
}
</style>