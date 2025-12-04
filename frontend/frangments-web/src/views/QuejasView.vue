<template>
  <div class="quejas-page">
    
    <!-- 🡐 BOTÓN VOLVER -->
    <button class="btn-volver" @click="router.push({ name: 'dashboard' })">
      ⬅ Volver
    </button>

    <div class="quejas-container">
      <h2 class="title">Enviar una queja</h2>
      <p class="subtitle">
        Cuéntanos tu problema con un plan, un usuario o la plataforma.
      </p>

      <div class="card-form">
        <div class="field">
          <label for="grupo">Grupo</label>
          <select id="grupo" v-model.number="idGrupo">
            <option disabled value="">Selecciona un grupo</option>
            <option v-for="g in grupos" :key="g.id" :value="g.id">
              {{ g.nombre }}
            </option>
          </select>
        </div>

        <div class="field">
          <label for="titulo">Asunto</label>
          <input
            id="titulo"
            type="text"
            v-model="titulo"
            placeholder="Ej. Problema con un grupo de Netflix"
          />
        </div>

        <div class="field">
          <label for="mensaje">Mensaje</label>
          <textarea
            id="mensaje"
            v-model="mensaje"
            rows="5"
            placeholder="Describe qué ha pasado con el grupo, el pago o el usuario…"
          ></textarea>
        </div>

        <button
          class="btn-send"
          :disabled="loading || !titulo || !mensaje || !idGrupo"
          @click="enviar"
        >
          {{ loading ? "Enviando..." : "Enviar queja" }}
        </button>

        <p v-if="success" class="success-msg">
          Queja enviada correctamente. Gracias por avisarnos.
        </p>
        <p v-if="errorMsg" class="error-msg">
          {{ errorMsg }}
        </p>
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
  if (!grupos.value.length) {
    await accountStore.userData();
  }
});

const enviar = async () => {
  if (!titulo.value || !mensaje.value) {
    errorMsg.value = "Debes rellenar asunto y mensaje.";
    return;
  }
  if (!idGrupo.value) {
    errorMsg.value = "Debes seleccionar un grupo.";
    return;
  }

  if (loading.value) return;

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
    console.error("Error al crear queja:", err);
    errorMsg.value =
      "Ha ocurrido un error al enviar la queja. Inténtalo de nuevo.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.quejas-page {
  min-height: 100vh;
  padding: 3rem 1.5rem 4rem;
  background: linear-gradient(120deg, #e0f2ff, #a2b8d9, #1e293b);
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.btn-volver {
  position: fixed;
  top: 20px;
  left: 20px;            
  z-index: 9000;
  background: #0f172a;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
  transition: 0.2s;
}

.btn-volver:hover {
  background: #1e293b;
  transform: translateY(-2px);
}

.quejas-container {
  width: 100%;
  max-width: 720px;
  color: #f9fafb;
}

.title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.subtitle {
  opacity: 0.9;
  margin-bottom: 1.6rem;
}

.card-form {
  background: rgba(15, 23, 42, 0.9);
  padding: 1.8rem 1.9rem;
  border-radius: 1.4rem;
  border: 1px solid rgba(148, 163, 184, 0.4);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.85);
  margin-top: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.2rem;
}

.field label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #e5e7eb;
}

.field input,
.field textarea {
  border-radius: 0.9rem;
  border: 1px solid rgba(148, 163, 184, 0.7);
  background: rgba(15, 23, 42, 0.8);
  color: #e5e7eb;
  padding: 0.7rem 0.9rem;
  font-size: 0.9rem;
  outline: none;
  resize: vertical;
  box-shadow: 0 0 0 rgba(59, 130, 246, 0);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.field input::placeholder,
.field textarea::placeholder {
  color: rgba(148, 163, 184, 0.9);
}

.field input:focus,
.field textarea:focus {
  border-color: rgba(129, 140, 248, 0.9);
  background: rgba(15, 23, 42, 0.95);
  box-shadow: 0 0 0 1px rgba(129, 140, 248, 0.7);
}

.field select {
  border-radius: 0.9rem;
  border: 1px solid rgba(148, 163, 184, 0.7);
  background: rgba(15, 23, 42, 0.8);
  color: #e5e7eb;
  padding: 0.7rem 0.9rem;
  font-size: 0.9rem;
  outline: none;
  box-shadow: 0 0 0 rgba(59, 130, 246, 0);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.field select:focus {
  border-color: rgba(129, 140, 248, 0.9);
  background: rgba(15, 23, 42, 0.95);
  box-shadow: 0 0 0 1px rgba(129, 140, 248, 0.7);
}

.btn-send {
  width: 100%;
  margin-top: 0.4rem;
  border: none;
  cursor: pointer;
  border-radius: 999px;
  padding: 0.7rem 1.2rem;
  font-weight: 600;
  font-size: 0.95rem;
  background: linear-gradient(135deg, #4f46e5, #22d3ee);
  color: #ffffff;
  box-shadow: 0 12px 30px rgba(37, 99, 235, 0.7);
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
}

.btn-send:hover:enabled {
  transform: translateY(-2px);
  filter: brightness(1.05);
  box-shadow: 0 16px 38px rgba(37, 99, 235, 0.85);
}

.btn-send:disabled {
  opacity: 0.6;
  cursor: default;
  box-shadow: none;
}

.success-msg {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #bbf7d0;
}

.error-msg {
  margin-top: 0.8rem;
  font-size: 0.9rem;
  color: #fecaca;
}
</style>
