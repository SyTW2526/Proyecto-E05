<template>
  <div class="dashboard faq-page">
    <div class="watermark"></div>

    <div class="back-button-container">
      <button class="btn small ghost-dark" @click="irDashboard">
        ⬅ Volver
      </button>
    </div>

    <header class="header-center animate-fade">
      <h1 class="title-main">Preguntas Frecuentes</h1>
      <p class="subtitle-main">Todo lo que necesitas saber sobre cómo compartir gastos en Fragments.</p>
    </header>

    <section class="faq-container animate-fade-delayed">
      <div
        v-for="(faq, index) in faqs"
        :key="index"
        class="faq-card float"
        :class="{ 'active': faq.abierto }"
        @click="toggle(index)"
      >
        <div class="faq-header-item">
          <span class="faq-question-text">{{ faq.pregunta }}</span>
          <span class="arrow" :class="{ open: faq.abierto }">▼</span>
        </div>

        <div class="faq-body" v-show="faq.abierto">
          <div class="divider"></div>
          <p class="faq-answer-text">{{ faq.respuesta }}</p>
        </div>
      </div>
    </section>

    <div class="faq-footer">
      <p>¿No encuentras tu respuesta?</p>
      <button class="btn primary" @click="irQuejas">Contáctanos</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const faqs = ref([
  {
    pregunta: "¿Qué es Fragments y cómo funciona?",
    respuesta: "Fragments es una plataforma de economía colaborativa para gestionar suscripciones digitales compartidas. Facilitamos la creación de grupos, gestión de pagos y seguridad entre miembros.",
    abierto: true,
  },
  {
    pregunta: "¿Cómo me uno a un plan existente?",
    respuesta: "Ve al buscador en el dashboard, filtra por plataforma (Spotify, Netflix...) y solicita unirte. Si hay cupo, entrarás al grupo al instante.",
    abierto: false,
  },
  {
    pregunta: "¿Cómo creo mi propia oferta?",
    respuesta: "Desde 'Crear planes' en el dashboard. Rellena plataforma, precio, fecha y cupos. Se creará un grupo asociado automáticamente.",
    abierto: false,
  },
  {
    pregunta: "¿Es seguro compartir mis datos?",
    respuesta: "Sí. No almacenamos contraseñas bancarias. Para credenciales de streaming, recomendamos usar el chat seguro del grupo una vez confirmado el pago.",
    abierto: false,
  },
  {
    pregunta: "¿Cómo funcionan los pagos y el saldo?",
    respuesta: "Recargas saldo en tu cuenta y nosotros lo distribuimos al administrador del plan mes a mes, garantizando que todos paguen su parte.",
    abierto: false,
  },
  {
    pregunta: "¿Qué pasa si el administrador cambia la contraseña?",
    respuesta: "Puedes reportarlo en 'Quejas'. Retendremos el pago al administrador hasta resolver la disputa o te reembolsaremos.",
    abierto: false,
  },
  {
    pregunta: "¿Puedo cancelar cuando quiera?",
    respuesta: "Sí, puedes salir en cualquier momento. Si sales a mitad de ciclo, tu acceso sigue hasta la fecha de vencimiento.",
    abierto: false,
  },
]);

function toggle(i: number) {
  faqs.value[i].abierto = !faqs.value[i].abierto;
}
function irDashboard() { router.push({ name: "dashboard" }); }
function irQuejas() { router.push({ name: "quejas" }); }
</script>

<style scoped>
.dashboard {
  position: relative;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(120deg, #e0f2ff, #a2b8d9, #1e293b);
  font-family: "Inter", sans-serif;
  color: #f9fafb;
}

.watermark {
  position: absolute; inset: -20%; opacity: 0.8; pointer-events: none; z-index: 0;
  background: radial-gradient(circle at 15% 0%, rgba(255,255,255,0.35), transparent 55%),
              radial-gradient(circle at 80% 100%, rgba(59,130,246,0.4), transparent 60%);
}
.dashboard > * { z-index: 1; }

/* --- HEADER FIXED --- */
.header-center {
  display: flex;          /* Flexbox activado */
  flex-direction: column; /* IMPORTANTE: Apilar verticalmente */
  align-items: center;    /* Centrado horizontal */
  justify-content: center;
  text-align: center;
  margin-top: 1rem;
  margin-bottom: 3rem;
  gap: 0.5rem;            /* Espacio entre título y subtítulo */
}

.title-main {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  text-shadow: 0 1px 2px rgba(255,255,255,0.6);
  margin: 0;
  line-height: 1.1;
}

.subtitle-main {
  margin: 0;
  color: #475569;
  font-size: 1.1rem;
  max-width: 600px;
}
/* -------------------- */

.faq-container {
  width: 100%;
  max-width: 1000px; 
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faq-card {
  background: radial-gradient(circle at top left, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.95));
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 1.2rem;
  padding: 1.2rem 1.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.4);
}

.faq-card:hover {
  transform: translateY(-3px);
  border-color: rgba(129, 140, 248, 0.6);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.6);
}

.faq-card.active {
  background: radial-gradient(circle at top left, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 1));
  border-color: #60a5fa;
}

.faq-header-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.faq-question-text {
  font-weight: 600;
  font-size: 1.1rem;
  color: #f1f5f9;
}

.arrow {
  color: #94a3b8;
  font-size: 0.9rem;
  transition: transform 0.3s ease;
}
.arrow.open { transform: rotate(180deg); color: #60a5fa; }

.faq-body { animation: slideDown 0.3s ease-out; }
.divider { height: 1px; background: rgba(148, 163, 184, 0.2); margin: 1rem 0; }
.faq-answer-text { color: #cbd5e1; line-height: 1.6; font-size: 0.95rem; }

.faq-footer { margin-top: 3rem; text-align: center; color: #1e293b; font-weight: 500; }
.faq-footer p { margin-bottom: 0.5rem; }

/* Botones */
.btn { border: none; cursor: pointer; border-radius: 999px; font-weight: 600; transition: 0.2s; }
.btn.small { padding: 0.5rem 1rem; font-size: 0.9rem; }
.btn.primary {
  padding: 0.7rem 1.5rem;
  background: linear-gradient(135deg, #4f46e5, #22d3ee);
  color: white;
  box-shadow: 0 5px 15px rgba(37, 99, 235, 0.4);
}
.btn.primary:hover { transform: translateY(-2px); filter: brightness(1.1); }
.back-button-container { position: absolute; top: 2rem; left: 2rem; }
.btn.ghost-dark { background: transparent; color: #1e293b; border: 1px solid rgba(148, 163, 184, 0.6); }
.btn.ghost-dark:hover { background: rgba(15, 23, 42, 0.1); }

.animate-fade { animation: fadeIn 0.5s ease; }
.animate-fade-delayed { animation: fadeIn 0.7s ease backwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
</style>