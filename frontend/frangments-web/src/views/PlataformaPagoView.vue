<template>
  <div class="dashboard pago-page">
    <div class="watermark"></div>

    <div class="back-button-container">
      <button class="btn small ghost-dark" @click="volverCuenta">
        ⬅ Volver
      </button>
    </div>

    <div class="container-wide animate-fade">
      
      <header class="header-center">
        <h1 class="title-main">Ingresar Saldo</h1>
        <p class="subtitle-main">Añade fondos a tu cuenta de forma rápida y segura.</p>
      </header>

      <div class="card-wide animate-fade-delayed">
        
        <div class="form-stack">
          <div class="form-item">
            <label for="cantidad">Cantidad a ingresar (€)</label>
            <input 
              id="cantidad"
              v-model.number="cantidad"
              type="number"
              min="1"
              step="0.01"
              placeholder="Ej. 50.00"
              class="input-lg"
              @keyup.enter="añadirSaldo"
            />
          </div>
        </div>

        <div class="form-actions">
          <button class="btn primary big-btn full-width" @click="añadirSaldo" :disabled="loading">
            <span v-if="!loading">Añadir Saldo</span>
            <span v-else>Procesando...</span>
          </button>
        </div>

        <div v-if="mensaje" :class="['msg', tipoMensaje]">
          {{ mensaje }}
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import apiax from "@/apiAxios";

const router = useRouter();
const auth = useAuthStore();

const cantidad = ref<number | null>(null);
const mensaje = ref("");
const tipoMensaje = ref("success"); 
const loading = ref(false);

async function añadirSaldo() {
  if (!cantidad.value || cantidad.value <= 0) {
    mensaje.value = "Por favor, introduce una cantidad válida.";
    tipoMensaje.value = "error";
    return;
  }

  const id_usuario = auth.user?.id;
  if (!id_usuario) {
    mensaje.value = "Error de sesión. Vuelve a conectarte.";
    tipoMensaje.value = "error";
    return;
  }

  loading.value = true;
  mensaje.value = "";

  try {
    const token = localStorage.getItem("token");
    await apiax.post(
      `/cartera/${id_usuario}/recargar`,
      { cantidad: cantidad.value },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    mensaje.value = "✅ Saldo añadido correctamente.";
    tipoMensaje.value = "success";

    if (auth.user && auth.user.saldo !== undefined) {
      auth.user.saldo += cantidad.value;
    }

    cantidad.value = null; 

    setTimeout(() => {
        volverCuenta();
    }, 1500);

  } catch (error: any) {
    console.error("Error:", error);
    mensaje.value = error.response?.data?.message || "❌ Error al procesar el pago.";
    tipoMensaje.value = "error";
  } finally {
    loading.value = false;
  }
}

function volverCuenta() {
  router.push({ name: "cuenta" });
}
</script>

<style scoped>
/* CONFIGURACIÓN DE PÁGINA (ALINEADA ARRIBA) */
.dashboard {
  position: relative;
  min-height: 100vh;
  /* Padding-top alto (6rem) para que el contenido empiece arriba y no en el centro */
  padding: 6rem 2rem 3rem; 
  background: linear-gradient(120deg, #e0f2ff, #a2b8d9, #1e293b);
  
  /* Flex start para subir el contenido */
  display: flex;
  justify-content: center;
  align-items: flex-start; 
  font-family: "Inter", sans-serif;
}

.watermark {
  position: absolute; inset: -20%; opacity: 0.8; pointer-events: none; z-index: 0;
  background: radial-gradient(circle at 15% 0%, rgba(255,255,255,0.35), transparent 55%),
              radial-gradient(circle at 80% 100%, rgba(59,130,246,0.4), transparent 60%);
}
.dashboard > * { z-index: 1; }

/* CONTENEDOR ANCHO (Similar a Publicar Plan) */
.container-wide {
  width: 100%;
  max-width: 900px; /* Ancho generoso */
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 0 auto;
}

/* HEADER CENTRADO */
.header-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
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

/* TARJETA */
.card-wide {
  background: radial-gradient(circle at top left, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.9));
  border: 1px solid rgba(148, 163, 184, 0.3);
  padding: 3.5rem 4rem; /* Padding interno grande para que se vea robusta */
  border-radius: 1.4rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.6);
  color: white;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* FORMULARIO */
.form-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  width: 100%;
}

label {
  font-size: 1rem;
  font-weight: 600;
  color: #cbd5e1;
  margin-left: 0.2rem;
}

/* INPUT GRANDE Y LIMPIO */
.input-lg {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: white;
  padding: 1.2rem 1.5rem;
  border-radius: 0.9rem;
  font-size: 1.2rem;
  width: 100%;
  outline: none;
  font-family: inherit;
  transition: 0.2s;
}

.input-lg:focus {
  border-color: #22c55e;
  background: rgba(30, 41, 59, 0.9);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
}

/* BOTONES */
.form-actions { margin-top: 1rem; }

.btn { border: none; cursor: pointer; border-radius: 0.8rem; font-weight: 600; transition: 0.2s; }

.big-btn {
  padding: 1.2rem; 
  font-size: 1.2rem;
  background: linear-gradient(135deg, #10b981, #22c55e); 
  color: #ffffff;
  box-shadow: 0 10px 30px rgba(22, 163, 74, 0.4);
}
.big-btn:hover { filter: brightness(1.1); transform: translateY(-2px); }
.big-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
.full-width { width: 100%; }

.back-button-container { position: absolute; top: 2rem; left: 2rem; }
.btn.small { padding: 0.5rem 1rem; font-size: 0.9rem; border-radius: 999px; }
.btn.ghost-dark {
  background: transparent; color: #1e293b; border: 1px solid rgba(148, 163, 184, 0.6);
}
.btn.ghost-dark:hover { background: rgba(15, 23, 42, 0.1); }

/* MENSAJES */
.msg {
  padding: 1rem; border-radius: 0.8rem; text-align: center; font-weight: 600; margin-top: 0.5rem;
}
.msg.success { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #10b981; }
.msg.error { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid #ef4444; }

/* ANIMACIONES */
.animate-fade { animation: fadeIn 0.5s ease; }
.animate-fade-delayed { animation: fadeIn 0.7s ease backwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

/* RESPONSIVE */
@media (max-width: 768px) {
  .dashboard { padding: 5rem 1rem 2rem; }
  .card-wide { padding: 2rem; }
}
</style>