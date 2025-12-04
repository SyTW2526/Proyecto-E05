<template>
  <div class="ofertar page">

    <div class="back-button-container">
      <button type="button" class="btn back" @click="volverDashboard">⬅ Volver</button>
    </div>

    <header class="header">
      <h2>Publicar un nuevo plan</h2>
      <p class="subtitle">Crea un plan y se creará automáticamente su grupo asociado</p>
    </header>

    <form class="form" @submit.prevent="crearPlan">
      <!-- Plataforma -->
      <div class="form-group">
        <label for="plataforma">Plataforma del plan</label>
        <select id="plataforma" v-model.number="form.plataforma" required>
          <option disabled value="">Selecciona una plataforma</option>
          <option v-for="p in plataformas" :key="p.id_plataforma" :value="p.id_plataforma">
            {{ p.nombre }}
          </option>
        </select>
      </div>

      <!-- Precio -->
      <div class="form-group">
        <label for="precio">Precio (€)</label>
        <input
          type="number"
          id="precio"
          v-model.number="form.precio"
          placeholder="Introduce el precio"
          required
          min="0"
          step="0.01"
        />
      </div>

      <!-- Fecha de vencimiento -->
      <div class="form-group">
        <label for="fecha_vencimiento">Fecha de vencimiento</label>
        <input
          type="date"
          id="fecha_vencimiento"
          v-model="form.fecha_vencimiento"
          required
        />
      </div>

      <!-- Número de personas -->
      <div class="form-group">
        <label for="personas">Número de personas</label>
        <input
          type="number"
          id="personas"
          v-model.number="form.personas"
          placeholder="Número de personas que pueden unirse"
          required
          min="1"
        />
      </div>

      <!-- Nombre del grupo (nuevo) -->
      <div class="form-group">
        <label>Nombre del grupo asociado</label>
        <input
          type="text"
          v-model="form.nuevo_grupo"
          placeholder="Escribe el nombre del grupo"
          required
        />
      </div>

      <!-- Botones -->
      <div class="botones">
        <button class="btn publicar" type="submit">Publicar plan</button>
      </div>
    </form>

    <div v-if="mensaje" class="mensaje">{{ mensaje }}</div>
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
    // Traer plataformas
    const respPlataformas = await apiax.get("/plataforma", {
      headers: { Authorization: `Bearer ${token}` },
    });
    plataformas.value = respPlataformas.data;
  } catch (error) {
    console.error("Error cargando plataformas:", error);
    mensaje.value = "❌ Error al cargar las plataformas";
  }
});

async function crearPlan() {
  if (!form.value.plataforma || !form.value.precio || !form.value.fecha_vencimiento || !form.value.nuevo_grupo || !form.value.personas) {
    mensaje.value = "Por favor completa todos los campos";
    return;
  }

  try {
    const nuevoGrupo = await account.createGroup(form.value.nuevo_grupo);
    const id_grupo = nuevoGrupo.id_grupo;

    const token = localStorage.getItem("token");
    await apiax.post(
      "/plan_sub/subscribe",
      {
        id_plataforma: Number(form.value.plataforma),
        precio: form.value.precio,
        fecha_vencimiento: form.value.fecha_vencimiento,
        id_grupo,
        nmiembros: form.value.personas
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    await alertStore.fetchAlertas();
    mensaje.value = "✅ Plan y grupo creado con éxito";
    form.value = { plataforma: "", precio: null, fecha_vencimiento: "", personas: 1, nuevo_grupo: "" };
  } catch (error: any) {
    console.error(error);
    mensaje.value = error.response?.data?.message || "❌ Error al crear el plan";
  }
}

function volverDashboard() {
  router.push({ name: "dashboard" });
}
</script>

<style scoped>
.ofertar {
  min-height: 100vh;
  padding: 3.5rem 3rem 3rem;
  background: linear-gradient(120deg, #e0f2ff, #a2b8d9, #1e293b);
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  color: #e5e7eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

/* BOTÓN VOLVER ARRIBA IZQUIERDA */
.back-button-container {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 40;
}

.back-button-container .btn.back {
  background: #0f172a;
  padding: 0.55rem 1.4rem;
  border-radius: 999px;
  border: none;
  color: #f9fafb;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.9);
  transition: 0.2s ease;
}

.back-button-container .btn.back:hover {
  transform: translateY(-2px);
  background: #111827;
}

/* HEADER */
.header {
  text-align: center;
  margin-top: 1.5rem;
}

.header h2 {
  font-size: 2.1rem;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 0 2px 10px rgba(15, 23, 42, 0.8);
}

.subtitle {
  color: #e5e7eb;
  font-size: 0.95rem;
  margin-top: 0.4rem;
  opacity: 0.9;
}

/* FORMULARIO: PANEL TIPO DASHBOARD */
.form {
  width: 100%;
  max-width: 640px;
  background: radial-gradient(circle at top left,
    rgba(15, 23, 42, 0.96),
    rgba(15, 23, 42, 1)
  );
  backdrop-filter: blur(18px);
  padding: 2.3rem 2.6rem;
  border-radius: 1.6rem;
  box-shadow: 0 26px 60px rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.35);
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #e5e7eb;
}

/* CAMPOS */
input,
select {
  padding: 0.8rem 1rem;
  border-radius: 0.9rem;
  border: 1px solid #334155;
  font-size: 0.95rem;
  outline: none;
  background: rgba(15, 23, 42, 0.95);
  color: #e5e7eb;
}

input::placeholder {
  color: #9ca3af;
}

input:focus,
select:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.35);
}

/* BOTONES */
.botones {
  display: flex;
  justify-content: center;
  margin-top: 0.8rem;
}

.btn {
  font-weight: 600;
  border: none;
  border-radius: 999px;
  padding: 0.75rem 1.8rem;
  cursor: pointer;
}

/* Sin exceso de brillo, pero con look moderno */
.btn.publicar {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #ffffff;
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.55);
  transition: 0.18s ease;
}

.btn.publicar:hover {
  filter: brightness(1.05);
  transform: translateY(-2px);
}

/* MENSAJE RESULTADO */
.mensaje {
  margin-top: 1.4rem;
  font-weight: 600;
  color: #e5e7eb;
  background: rgba(15, 23, 42, 0.9);
  padding: 0.9rem 1.1rem;
  border-radius: 0.9rem;
  border: 1px solid rgba(148, 163, 184, 0.4);
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .ofertar {
    padding: 3.5rem 1.4rem 2.5rem;
  }

  .form {
    padding: 1.8rem 1.6rem;
  }
}
</style>
