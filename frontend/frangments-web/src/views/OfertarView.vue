<template>
  <div class="dashboard ofertar-page">
    <div class="watermark"></div>

    <div class="back-button-container">
      <button type="button" class="btn small ghost-dark" @click="volverDashboard">⬅ Volver</button>
    </div>

    <div class="container-wide animate-fade">
      <header class="header-center">
        <h2 class="title-main">Publicar un nuevo plan</h2>
        <p class="subtitle-main">Crea un plan y se creará automáticamente su grupo asociado</p>
      </header>

      <form class="card-wide animate-fade-delayed" @submit.prevent="crearPlan">
        
        <div class="form-grid">
          <div class="form-item full-width">
            <label>Plataforma del plan</label>
            <div class="select-wrapper">
              <select v-model.number="form.plataforma" required>
                <option disabled value="">Selecciona una plataforma</option>
                <option v-for="p in plataformas" :key="p.id_plataforma" :value="p.id_plataforma">
                  {{ p.nombre }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-item">
            <label>Precio (€)</label>
            <input
              type="number"
              v-model.number="form.precio"
              placeholder="0.00"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div class="form-item">
            <label>Fecha de vencimiento</label>
            <input
              type="date"
              v-model="form.fecha_vencimiento"
              required
            />
          </div>

          <div class="form-item">
            <label>Personas</label>
            <input
              type="number"
              v-model.number="form.personas"
              placeholder="1"
              required
              min="1"
            />
          </div>

          <div class="form-item full-width">
            <label>Nombre del grupo asociado</label>
            <input
              type="text"
              v-model="form.nuevo_grupo"
              placeholder="Ej: Netflix Familia Pérez"
              required
            />
          </div>
        </div>

        <div class="form-actions">
          <button class="btn primary big" type="submit">Publicar plan</button>
        </div>

      </form>

      <div v-if="mensaje" class="mensaje-floating">{{ mensaje }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAccountStore } from "@/stores/cuenta";
import { useAlertStore } from "@/stores/alertas";
import apiax from "@/apiAxios";

const router = useRouter();
const plataformas = ref<Array<{ id_plataforma: number; nombre: string }>>([]);
const mensaje = ref("");
const account = useAccountStore();
const alertStore = useAlertStore();

const form = ref({
  plataforma: "" as number | "",
  precio: null as number | null,
  fecha_vencimiento: "",
  personas: 1 as number,
  nuevo_grupo: "",
});

onMounted(async () => {
  try {
    const token = localStorage.getItem("token");
    const resp = await apiax.get("/plataforma", { headers: { Authorization: `Bearer ${token}` } });
    plataformas.value = resp.data;
  } catch (error) { mensaje.value = "❌ Error al cargar plataformas"; }
});

async function crearPlan() {
  if (!form.value.plataforma || !form.value.precio || !form.value.fecha_vencimiento || !form.value.nuevo_grupo) {
    mensaje.value = "Completa todos los campos"; return;
  }
  try {
    const nuevoGrupo = await account.createGroup(form.value.nuevo_grupo);
    const token = localStorage.getItem("token");
    await apiax.post("/plan_sub/subscribe", {
        id_plataforma: Number(form.value.plataforma),
        precio: form.value.precio,
        fecha_vencimiento: form.value.fecha_vencimiento,
        id_grupo: nuevoGrupo.id_grupo,
        nmiembros: form.value.personas
      }, { headers: { Authorization: `Bearer ${token}` } });
    
    await alertStore.fetchAlertas();
    mensaje.value = "✅ Plan creado con éxito";
    setTimeout(() => router.push({ name: 'dashboard' }), 1500);
  } catch (e) { mensaje.value = "❌ Error al crear el plan"; }
}
function volverDashboard() { router.push({ name: "dashboard" }); }
</script>

<style scoped>
/* BASE */
.dashboard {
  position: relative;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(120deg, #e0f2ff, #a2b8d9, #1e293b);
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

.container-wide {
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* --- HEADER CORREGIDO --- */
.header-center { 
  display: flex;          /* Usamos Flexbox */
  flex-direction: column; /* IMPORTANTE: Apilar verticalmente */
  align-items: center;    /* Centrar horizontalmente */
  justify-content: center;
  text-align: center; 
  gap: 0.5rem;            /* Espacio entre título y subtítulo */
  margin-bottom: 1rem;
}

.title-main { 
  font-size: 2.5rem;      /* Un poco más grande para destacar */
  font-weight: 800; 
  color: #1e293b; 
  margin: 0; 
  line-height: 1.2;
  text-shadow: 0 1px 2px rgba(255,255,255,0.5); 
}

.subtitle-main { 
  color: #475569; 
  margin: 0; 
  font-size: 1.1rem; 
  font-weight: 500;
}
/* ------------------------ */

/* TARJETA FORMULARIO */
.card-wide {
  background: radial-gradient(circle at top left, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.85));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.3);
  padding: 2.5rem 3rem;
  border-radius: 1.4rem;
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.6);
  color: white;
}

/* GRID */
.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem 2rem;
}

.form-item { display: flex; flex-direction: column; gap: 0.5rem; }
.full-width { grid-column: 1 / -1; }

label { font-size: 0.9rem; font-weight: 600; color: #cbd5e1; margin-left: 0.2rem; }

input, select {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: white;
  padding: 0.8rem 1rem;
  border-radius: 0.8rem;
  font-size: 1rem;
  width: 100%;
  outline: none;
  transition: 0.2s;
}
input:focus, select:focus {
  border-color: #22d3ee;
  background: rgba(30, 41, 59, 0.9);
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.15);
}

/* BOTONES */
.form-actions { margin-top: 2rem; }
.btn { border: none; cursor: pointer; border-radius: 0.8rem; font-weight: 600; transition: 0.2s; }

.btn.primary.big {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  background: linear-gradient(135deg, #4f46e5, #22d3ee);
  color: white;
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.5);
}
.btn.primary.big:hover { filter: brightness(1.1); transform: translateY(-2px); }

.back-button-container { position: absolute; top: 2rem; left: 2rem; }
.btn.ghost-dark {
  background: transparent; color: #1e293b; border: 1px solid rgba(148, 163, 184, 0.6);
  padding: 0.5rem 1rem; border-radius: 999px;
}
.btn.ghost-dark:hover { background: rgba(15, 23, 42, 0.1); }

.mensaje-floating {
  margin-top: 1rem; text-align: center; background: #10b981; color: white;
  padding: 1rem; border-radius: 0.8rem; font-weight: bold;
}

@media (max-width: 768px) {
  .form-grid { grid-template-columns: 1fr; }
  .container-wide { padding: 0 1rem; }
  .card-wide { padding: 1.5rem; }
  .header-center { margin-bottom: 1.5rem; }
}
</style>