<template>
  <div class="dashboard">
    <div class="watermark"></div>

    <header class="topbar animate-fade">
      
      <div class="header-left">
        <p class="welcome-text">
          Bienvenido de vuelta, <span class="user-highlight">{{ auth.nombre || "Jefe" }}</span>.
          <span class="welcome-sub">¿Qué tienes planeado para hoy?</span>
        </p>
      </div>

      <div class="header-center">
        <img src="@/assets/new_logo_Fragments.png" alt="Fragments" class="header-logo" />
      </div>

      <div class="header-right-spacer"></div>

    </header>

    <section class="cards animate-fade-delayed">
      
      <article class="card float card-main">
        <div class="card-body-compact">
          <div class="card-main-header">
            <div class="card-icon-wrapper">
              <div class="card-icon">🔍</div>
            </div>
            <div class="card-content">
              <h2 class="card-title">Buscar planes</h2>
              <p class="card-text">Encuentra suscripciones compartidas activas y únete al ahorro.</p>
            </div>
          </div>
          <div class="card-main-footer-compact">
            <div class="pills">
              <span class="pill">Planes verificados</span>
              <span class="pill pill-soft">Pagos repartidos</span>
            </div>
            <button class="btn small primary glow-effect" @click="irBuscador">Explorar planes</button>
          </div>
        </div>
      </article>

      <article class="card float card-main">
        <div class="card-body-compact">
          <div class="card-main-header">
            <div class="card-icon-wrapper">
              <div class="card-icon secondary-icon">➕</div>
            </div>
            <div class="card-content">
              <h2 class="card-title">Crear planes</h2>
              <p class="card-text">Publica tu oferta, gestiona tu grupo y comparte gastos fácilmente.</p>
            </div>
          </div>
          <div class="card-main-footer-compact">
            <div class="pills">
              <span class="pill">Control total</span>
              <span class="pill pill-soft">Cupos limitados</span>
            </div>
            <button class="btn small primary glow-effect" @click="irOfertas">Crear plan</button>
          </div>
        </div>
      </article>
    </section>

    <section class="plataformas animate-fade-delayed2">
      <div class="plat-header">
        <div>
          <h3 class="plat-title">Plataformas disponibles</h3>
          <p class="plat-subtitle">Gestiona tus cuentas compartidas desde un único panel centralizado.</p>
        </div>
      </div>

      <div class="plataformas-row">
        <button class="plat-nav-btn" :disabled="!canPrev" @click="prevPage">‹</button>

        <div class="plataformas-grid">
          <div
            v-for="(plataforma, i) in visiblePlataformas"
            :key="plataforma.id"
            class="plataforma-card float"
            @click="verPlataforma(plataforma.id)"
          >
            <div class="plat-main">
              <div class="plat-logo">
                 <img :src="getLogo(plataforma.nombre)" :alt="plataforma.nombre" />
              </div>
              <div class="plat-info">
                <h4 class="plat-name">{{ plataforma.nombre }}</h4>
              </div>
            </div>

            <div class="plat-actions">
              <button class="btn x-small ghost" @click.stop="toggleDetalles(plataforma.id)">
                {{ idVisible === plataforma.id ? 'Ocultar' : 'Detalles' }}
              </button>
            </div>

            <div v-if="idVisible === plataforma.id" class="plat-desc animate-slide-down">
               {{ plataforma.descripcion }}
            </div>
          </div>
        </div>

        <button class="plat-nav-btn" :disabled="!canNext" @click="nextPage">›</button>
      </div>
    </section>

    <div class="bottom-dock animate-fade-delayed2">
      <button class="dock-btn primary" @click="irQuejas" title="Enviar Queja">
        <span class="dock-icon">✉️</span>
        <span class="dock-label desktop-only">Buzón</span>
      </button>
      <div class="dock-separator"></div>
      <button class="dock-btn secondary" @click="irFaq" title="Preguntas Frecuentes">
        <span class="dock-icon">❓</span>
        <span class="dock-label desktop-only">Ayuda</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import apiax from "@/apiAxios";

// Imports de imágenes
import canvaLogo from "@/assets/canva_logo.png";
import spotifyLogo from "@/assets/spotify_logo.png";
import disneyLogo from "@/assets/disney_logo.png";
import xboxLogo from "@/assets/xbox_logo.png";
import hboLogo from "@/assets/hbo_logo.png";
import crunchyLogo from "@/assets/crunchyroll_logo.png";
import primeLogo from "@/assets/primevideo_logo.png";

const defaultLogo = hboLogo;
const router = useRouter();
const auth = useAuthStore();
const users = ref<any[]>([]);

const logoMap: Record<string, string> = {
  "HBO Max": hboLogo,
  "Spotify": spotifyLogo,
  "Disney+": disneyLogo,
  "Xbox Game Pass": xboxLogo,
  "Canva Pro": canvaLogo,
  "Crunchyroll": crunchyLogo,
  "Prime Video": primeLogo,
};
const getLogo = (nombre: string) => logoMap[nombre] ?? defaultLogo;

const plataformas = ref([
  { id: 1, nombre: "HBO Max", descripcion: "Series y pelis de HBO, Max Originals y más." },
  { id: 2, nombre: "Spotify", descripcion: "Música sin anuncios para todos." },
  { id: 3, nombre: "Disney+", descripcion: "Disney, Marvel, Star Wars y Pixar." },
  { id: 4, nombre: "Xbox Game Pass", descripcion: "Juegos ilimitados en consola y PC." },
  { id: 5, nombre: "Canva Pro", descripcion: "Diseño premium colaborativo." },
  { id: 6, nombre: "Crunchyroll", descripcion: "Anime en simulcast y sin ads." },
  { id: 7, nombre: "Prime Video", descripcion: "Envíos rápidos y streaming." },
]);

// Carrusel
const pageSize = 4;
const currentIndex = ref(0);

const visiblePlataformas = computed(() =>
  plataformas.value.slice(currentIndex.value, currentIndex.value + pageSize)
);
const canPrev = computed(() => currentIndex.value > 0);
const canNext = computed(() => currentIndex.value + pageSize < plataformas.value.length);
function prevPage() { if (canPrev.value) currentIndex.value -= pageSize; }
function nextPage() { if (canNext.value) currentIndex.value += pageSize; }

// Toggle Detalles
const idVisible = ref<number | null>(null);
function toggleDetalles(id: number) {
  idVisible.value = idVisible.value === id ? null : id;
}

onMounted(async () => {
  try {
    if (!auth.user) await auth.fetchMe();
    if (!auth.isAuthenticated) return router.push({ name: "login" });
    const { data } = await apiax.get("/users");
    users.value = data ?? [];
  } catch {
    router.push({ name: "login" });
  }
});

function irBuscador() { router.push({ name: "buscador" }); }
function irOfertas() { router.push({ name: "ofertar" }); }
function verPlataforma(id: number) { router.push({ name: "plataforma-detalle", params: { id } }); }
function irFaq() { router.push({ name: "faq" }); }
function irQuejas() { router.push({ name: "quejas" }); }

</script>

<style scoped>
/* === CONFIGURACIÓN BASE === */
.dashboard {
  position: relative;
  min-height: 100vh;
  padding: 2rem 3rem 6rem; /* Padding inferior para el dock */
  background: linear-gradient(120deg, #e0f2ff, #a2b8d9, #1e293b);
  color: #f9fafb;
  /* Fuente principal (se hereda en todos los textos salvo que se especifique otra) */
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  overflow-x: hidden;
}

.watermark {
  position: absolute;
  inset: -20%;
  background:
    radial-gradient(circle at 10% 10%, rgba(255,255,255,0.3), transparent 50%),
    radial-gradient(circle at 90% 90%, rgba(59,130,246,0.3), transparent 50%);
  opacity: 0.6;
  pointer-events: none;
  z-index: 0;
  filter: blur(40px);
}

.dashboard > *:not(.watermark) {
  position: relative;
  z-index: 1;
}

/* === TOPBAR === */
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left; 
}

/* TEXTO DE BIENVENIDA UNIFICADO (Fuente Inter) */
.welcome-text {
  /* Eliminamos 'Playfair Display' para que herede "Inter" */
  font-size: 1.4rem;
  font-weight: 600; /* Un poco de peso para que destaque similar a los títulos */
  color: #1e293b;
  margin: 0;
  line-height: 1.3;
  text-shadow: 0 1px 2px rgba(255,255,255,0.5);
}

.user-highlight {
  font-weight: 800; /* Extra bold para el nombre */
  color: #2563eb;
}

.welcome-sub {
  display: block;
  font-size: 1.05rem;
  font-weight: 400;
  color: #475569;
  margin-top: 0.3rem;
  /* Hereda Inter */
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.header-logo {
  width: 180px;
  height: auto;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.15));
  transition: transform 0.3s ease;
}
.header-logo:hover { transform: scale(1.05); }

.header-right-spacer { flex: 1; }


/* === CARDS PRINCIPALES === */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.card {
  background: radial-gradient(circle at top left, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 1.5rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  min-height: auto;
}

.card-body-compact {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.card-main-header {
  display: flex;
  gap: 1.2rem;
  align-items: flex-start;
}

.card-icon-wrapper { flex-shrink: 0; }

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
}

.secondary-icon {
  background: linear-gradient(135deg, #d946ef, #a855f7);
  box-shadow: 0 8px 20px rgba(168, 85, 247, 0.4);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
}

.card-text {
  margin: 0;
  font-size: 0.95rem;
  color: #94a3b8;
  line-height: 1.5;
}

.card-main-footer-compact {
  margin-top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.pills { display: flex; gap: 0.5rem; }
.pill {
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.pill-soft {
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
  border-color: rgba(59, 130, 246, 0.3);
}

/* === PLATAFORMAS === */
.plataformas {
  background: rgba(30, 41, 59, 0.7);
  padding: 2rem 2.5rem;
  border-radius: 1.8rem;
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
}
.plat-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem; }
.plat-title { margin: 0; font-size: 1.4rem; font-weight: 700; color: #fff; }
.plat-subtitle { margin: 0.3rem 0 0; font-size: 0.95rem; color: #94a3b8; }
.plataformas-row { display: flex; align-items: center; gap: 1.5rem; }
.plat-nav-btn { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); width: 40px; height: 40px; border-radius: 50%; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; transition: all 0.2s ease; }
.plat-nav-btn:hover:not(:disabled) { background: #2563eb; border-color: #2563eb; transform: scale(1.1); }
.plat-nav-btn:disabled { opacity: 0.3; cursor: default; }
.plataformas-grid { flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
.plataforma-card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 1rem 1.2rem; border-radius: 1.2rem; cursor: pointer; display: flex; flex-direction: column; gap: 0.8rem; transition: all 0.2s ease; position: relative; overflow: hidden; }
.plataforma-card:hover { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.3); transform: translateY(-5px); }
.plat-main { display: flex; align-items: center; gap: 1rem; }
.plat-logo { width: 48px; height: 48px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; padding: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
.plat-logo img { width: 100%; height: 100%; object-fit: contain; border-radius: 50%; }
.plat-name { margin: 0; font-size: 1rem; font-weight: 600; color: #fff; }
.plat-actions { display: flex; justify-content: flex-end; }
.plat-desc { margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.85rem; color: #cbd5e1; line-height: 1.4; }

/* === BOTONES GENERALES === */
.btn { border: none; cursor: pointer; border-radius: 999px; font-weight: 600; transition: all 0.2s ease; }
.btn.primary { background: linear-gradient(135deg, #2563eb, #06b6d4); color: white; padding: 0.6rem 1.2rem; font-size: 0.9rem; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4); }
.btn.primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.6); filter: brightness(1.1); }
.btn.ghost { background: transparent; color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.4); }
.btn.ghost:hover { color: #fff; border-color: #fff; background: rgba(255,255,255,0.05); }
.btn.small { padding: 0.5rem 1rem; font-size: 0.85rem; }
.btn.x-small { padding: 0.3rem 0.8rem; font-size: 0.75rem; }

/* === BOTTOM DOCK === */
.bottom-dock {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  background: rgba(30, 41, 59, 0.85);
  backdrop-filter: blur(20px);
  padding: 0.5rem 0.8rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  z-index: 100;
}

.dock-btn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: transparent;
  border: none;
  color: #e2e8f0;
  padding: 0.6rem 1rem;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  font-size: 0.95rem;
}

.dock-btn:hover { background: rgba(255, 255, 255, 0.1); transform: translateY(-2px); }
.dock-btn.primary { color: #60a5fa; }
.dock-btn.secondary { color: #c084fc; }
.dock-icon { font-size: 1.4rem; }
.dock-separator { width: 1px; height: 24px; background: rgba(255, 255, 255, 0.15); margin: 0 0.5rem; }

/* ANIMACIONES */
.glow-effect:hover { box-shadow: 0 0 15px rgba(37, 99, 235, 0.5); }
.float:hover { transform: translateY(-5px); }
.animate-fade { animation: fadeIn 0.6s ease-out; }
.animate-fade-delayed { animation: fadeIn 0.8s ease-out backwards; }
.animate-fade-delayed2 { animation: fadeIn 1s ease-out backwards; }
.animate-slide-down { animation: slideDown 0.3s ease-out; }

@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); max-height: 0; } to { opacity: 1; transform: translateY(0); max-height: 200px; } }

/* RESPONSIVE */
@media (max-width: 1024px) { .plataformas-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) {
  .dashboard { padding: 2rem 1.5rem 7rem; }
  .topbar { flex-direction: column; gap: 1rem; }
  .header-left, .header-center, .header-right-spacer { width: 100%; text-align: center; }
  .welcome-text { font-size: 1.2rem; }
  .cards { grid-template-columns: 1fr; }
  .plataformas-grid { grid-template-columns: 1fr; }
  .plataformas-row { flex-wrap: wrap; justify-content: center; }
  .plat-nav-btn { display: none; }
  .plataformas-grid { display: flex; flex-direction: column; width: 100%; }
  .desktop-only { display: none; } 
}
</style>