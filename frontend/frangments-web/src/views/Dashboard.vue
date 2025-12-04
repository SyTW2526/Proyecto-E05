<template>
  <div class="dashboard">
    <div class="watermark"></div>

    <header class="topbar animate-fade">
      
      <div class="header-left">
        <br></br><br></br><br></br>
        <p class="subtitle">
          Bienvenido de vuelta, {{ auth.nombre || "Jefe" }} ¿qué tienes planeado para hoy?
        </p>
      </div>

      <div class="header-center">
        <img src="@/assets/new_logo_Fragments.png" alt="Fragments" class="header-logo" />
      </div>

      <div class="header-right-spacer"></div>

    </header>

    <section class="cards animate-fade-delayed">
      <article class="card float card-main">
        <div class="card-main-header">
          <div class="card-icon">🔍</div>
          <div>
            <h2 class="card-title">Buscar planes</h2>
            <p class="card-text">Encuentra suscripciones compartidas activas.</p>
          </div>
        </div>
        <div class="card-main-footer">
          <div class="pills">
            <span class="pill">Planes verificados</span>
            <span class="pill pill-soft">Pagos repartidos</span>
          </div>
          <button class="btn small primary" @click="irBuscador">Explorar planes</button>
        </div>
      </article>

      <article class="card float card-main">
        <div class="card-main-header">
          <div class="card-icon secondary-icon">➕</div>
          <div>
            <h2 class="card-title">Crear planes</h2>
            <p class="card-text">Publica tu oferta y comparte gastos.</p>
          </div>
        </div>
        <div class="card-main-footer">
          <div class="pills">
            <span class="pill">Control total</span>
            <span class="pill pill-soft">Cupos limitados</span>
          </div>
          <button class="btn small primary" @click="irOfertas">Crear plan</button>
        </div>
      </article>
    </section>

    <section class="plataformas animate-fade-delayed2">
      <div class="plat-header">
        <div>
          <h3 class="plat-title">Plataformas disponibles</h3>
          <p class="plat-subtitle">Gestiona tus cuentas compartidas desde un único panel.</p>
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
              <button class="btn small ghost" @click.stop="toggleDetalles(plataforma.id)">
                {{ idVisible === plataforma.id ? 'Ocultar' : 'Ver detalles' }}
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

    <div class="bottom right">
      <button class="btn small primary" @click="irQuejas">✉️</button>
      <button class="btn small primary" @click="irFaq">❓</button>
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
  { id: 2, nombre: "Spotify", descripcion: "Música sin anuncios." },
  { id: 3, nombre: "Disney+", descripcion: "Disney, Marvel, Star Wars y Pixar." },
  { id: 4, nombre: "Xbox Game Pass", descripcion: "Juegos ilimitados." },
  { id: 5, nombre: "Canva Pro", descripcion: "Diseño premium." },
  { id: 6, nombre: "Crunchyroll", descripcion: "Anime en simulcast." },
  { id: 7, nombre: "Prime Video", descripcion: "Envíos y Prime Video." },
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

<style>
/* === CONTENEDOR GENERAL DASHBOARD (con brillo) === */
.dashboard {
  position: relative;
  min-height: 100vh;
  padding: 1.25rem 2rem 2rem;
  background: linear-gradient(120deg, #e0f2ff, #a2b8d9, #1e293b);
  color: #f9fafb;
  font-family: "Inter", system-ui, -apple-system, sans-serif;

  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  overflow: hidden;
}

/* Capa de “brillo” suave por encima del gradient */
.watermark {
  position: absolute;
  inset: -20%;
  background:
    radial-gradient(circle at 15% 0%, rgba(255,255,255,0.35), transparent 55%),
    radial-gradient(circle at 80% 100%, rgba(59,130,246,0.4), transparent 60%);
  opacity: 0.8;
  pointer-events: none;
  z-index: 0;
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
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  flex: 1;
}

.subtitle {
  font-size: 1.05rem;
  font-weight: 500;
  color: rgba(15, 23, 42, 0.8);
  letter-spacing: 0.3px;
  text-shadow: 0 1px 2px rgba(255,255,255,0.6);
  backdrop-filter: blur(1px);
  margin: 0;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.header-logo {
  width: 200px;
  height: auto;
  opacity: 0.9;
  filter: drop-shadow(0 8px 22px rgba(15,23,42,0.4));
}

.header-right-spacer {
  flex: 1;
}

/* === CARDS PRINCIPALES === */
.cards {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.card {
  flex: 1;
  min-width: 260px;
  background: radial-gradient(circle at top left,
              rgba(15, 23, 42, 0.95),
              rgba(15, 23, 42, 0.75));
  border: 1px solid rgba(148, 163, 184, 0.35);
  padding: 1.7rem 1.8rem;
  border-radius: 1.4rem;
  backdrop-filter: blur(16px);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.7);
}

.card-main {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.card-main-header {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.card-icon {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: radial-gradient(circle at 30% 20%, #22d3ee, #4f46e5);
  box-shadow: 0 0 25px rgba(56, 189, 248, 0.6);
}

.secondary-icon {
  background: radial-gradient(circle at 30% 20%, #a855f7, #ec4899);
  box-shadow: 0 0 25px rgba(236, 72, 153, 0.6);
}

.card-title {
  font-size: 1.35rem;
  font-weight: 700;
}

.card-text {
  opacity: 0.9;
  font-size: 0.92rem;
}

.card-main-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.pill {
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  font-size: 0.75rem;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.7);
}

.pill-soft {
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.7);
}

/* === BOTONES === */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border: none;
  cursor: pointer;
  border-radius: 0.8rem;
  padding: 0.6rem 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  transition: 0.25s;
  background: rgba(15, 23, 42, 0.4);
  color: #e5e7eb;
  backdrop-filter: blur(10px);
}

.btn.small {
  padding: 0.4rem 0.9rem;
  font-size: 0.82rem;
  border-radius: 999px;
}

.btn.primary {
  background: linear-gradient(135deg, #4f46e5, #22d3ee);
  color: white;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.7);
}

.btn.primary:hover {
  filter: brightness(1.08);
  transform: translateY(-2px) scale(1.02);
}

.btn.ghost {
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.7);
  color: #e5e7eb;
}

.btn.ghost:hover {
  background: rgba(15, 23, 42, 0.7);
  border-color: #e5e7eb;
}

/* === PLATAFORMAS === */
.plataformas {
  background: rgba(15, 23, 42, 0.8);
  padding: 1.6rem 1.5rem 1.8rem;
  border-radius: 1.4rem;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(148, 163, 184, 0.33);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.85);
}

.plat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}

.plat-title {
  margin: 0;
  font-weight: 700;
  font-size: 1.05rem;
}

.plat-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  opacity: 0.9;
}

/* Carrusel row */
.plataformas-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  align-items: center;
  margin-top: 1.2rem;
}

.plat-nav-btn {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.6);
  width: 36px;
  height: 36px;
  border-radius: 999px;
  color: #e5e7eb;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(15,23,42,0.7);
  transition: 0.25s;
}

.plat-nav-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  background: rgba(30, 64, 175, 0.9);
  border-color: rgba(191, 219, 254, 0.9);
}

.plat-nav-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.plataformas-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

/* Tarjeta plataforma con brillo */
.plataforma-card {
  background: radial-gradient(circle at top left,
              rgba(30, 64, 175, 0.9),
              rgba(15, 23, 42, 0.95));
  padding: 0.9rem 1rem;
  border-radius: 1.1rem;
  border: 1px solid rgba(129, 140, 248, 0.35);
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

/* Halo de luz al hover */
.plataforma-card::before {
  content: "";
  position: absolute;
  inset: -60%;
  background: radial-gradient(circle at top left,
              rgba(96, 165, 250, 0.25),
              transparent 60%);
  opacity: 0;
  transition: opacity 0.35s ease;
}

.plataforma-card:hover::before {
  opacity: 1;
}

.plat-main {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 1;
}

.plat-actions {
  z-index: 1;
}

/* Logo circular */
.plat-logo {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 18px rgba(248, 250, 252, 0.45);
}

.plat-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.plat-name {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.plat-desc {
  font-size: 0.85rem;
  color: #e5e7eb;
  padding-top: 0.4rem;
  border-top: 1px solid rgba(148,163,184,0.4);
}

/* EFECTO FLOTANTE GENERAL */
.float {
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.float:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 35px rgba(15, 23, 42, 0.8);
  border-color: rgba(129, 140, 248, 0.8);
}

/* BOTÓN FAQ FLOTANTE */
.bottom.right {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999;
}

.bottom.right .btn.small {
  padding: 0.4rem 0.6rem;
  font-size: 1rem;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ANIMACIONES */
.animate-fade {
  animation: fadeIn 0.4s ease;
}
.animate-fade-delayed {
  animation: fadeIn 0.6s ease;
}
.animate-fade-delayed2 {
  animation: fadeIn 0.8s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .dashboard {
    padding: 1.5rem 1.2rem 2.5rem;
  }
  .cards {
    flex-direction: column;
  }
  .card-main-footer {
    align-items: flex-start;
  }
}
</style>
