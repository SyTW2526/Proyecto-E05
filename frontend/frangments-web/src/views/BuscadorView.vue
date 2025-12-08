<template>
  <div class="dashboard buscador-page">
    <div class="watermark"></div>

    <div class="back-button-container">
      <button type="button" class="btn small ghost" @click="volverDashboard">
        ⬅ Volver
      </button>
    </div>

    <header class="buscador-header animate-fade">
      <h2 class="buscador-title">Buscador de Plataformas</h2>
      <p class="buscador-subtitle">
        Encuentra fácilmente las plataformas que te interesan
      </p>
    </header>

    <div class="search-section animate-fade">
      <div class="search-bar">
        <input
          type="text"
          v-model="query"
          placeholder="Buscar plataforma..."
        />
        <button class="btn primary">Buscar</button>
      </div>

      <div class="filters">
        <button
          v-for="(filtro, index) in filtros"
          :key="index"
          :class="['pill', { 'pill-active': filtroSeleccionado === filtro }]"
          @click="seleccionarFiltro(filtro)"
        >
          {{ filtro }}
        </button>
      </div>
    </div>

    <section class="resultados-container animate-fade-delayed">
      <div v-if="resultadosFiltrados.length > 0" class="plataformas-grid">
        <article
          v-for="plataforma in resultadosFiltrados"
          :key="plataforma.id_plataforma"
          class="plataforma-card float"
          @click="verPlanes(plataforma)"
        >
          <div class="plat-content">
            <div class="plat-logo">
               <img
                  v-if="getLogo(plataforma.nombre)"
                  :src="getLogo(plataforma.nombre)"
                  alt="logo"
                />
                <span v-else class="fallback-logo">
                  {{ plataforma.nombre[0] }}
                </span>
            </div>
            <div class="plat-text">
              <h4 class="plat-name">{{ plataforma.nombre }}</h4>
              <span class="plat-cat">{{ plataforma.categoria }}</span>
            </div>
          </div>

          <button class="btn small ghost">Consultar</button>
        </article>
      </div>

      <p v-else class="no-resultados">No se encontraron resultados.</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
// Importa tus imágenes aquí igual que en el dashboard...
import canvaLogo from "@/assets/canva_logo.png";
import spotifyLogo from "@/assets/spotify_logo.png";
import disneyLogo from "@/assets/disney_logo.png";
import xboxLogo from "@/assets/xbox_logo.png";
import hboLogo from "@/assets/hbo_logo.png";
import crunchyLogo from "@/assets/crunchyroll_logo.png";
import primeLogo from "@/assets/primevideo_logo.png";

const logoMap: Record<string, string> = {
  "HBO Max": hboLogo,
  "Spotify": spotifyLogo,
  "Disney+": disneyLogo,
  "Xbox Game Pass": xboxLogo,
  "Canva Pro": canvaLogo,
  "Crunchyroll": crunchyLogo,
  "Prime Video": primeLogo,
};
const getLogo = (nombre: string) => logoMap[nombre] ?? null;

type Plataforma = { id_plataforma: number; nombre: string; categoria: string; };

const router = useRouter();
const plataformas = ref<Plataforma[]>([
  { id_plataforma: 1, nombre: "Spotify",     categoria: "Música"},
  { id_plataforma: 2, nombre: "Disney+",     categoria: "Streaming"},
  { id_plataforma: 3, nombre: "HBO Max",     categoria: "Streaming"},
  { id_plataforma: 4, nombre: "Prime Video", categoria: "Streaming"},
  { id_plataforma: 5, nombre: "Crunchyroll", categoria: "Streaming"},
  { id_plataforma: 6, nombre: "Xbox Game Pass", categoria: "Videojuegos"},
  { id_plataforma: 7, nombre: "Canva Pro",   categoria: "Diseño"},
]);

const query = ref("");
const filtroSeleccionado = ref<string | null>(null);
const filtros = ["Streaming", "Música", "Videojuegos", "Diseño", "Educación"];

const resultadosFiltrados = computed(() =>
  plataformas.value.filter((p) => {
    const coincideTexto = p.nombre.toLowerCase().includes(query.value.toLowerCase());
    const coincideFiltro = !filtroSeleccionado.value || p.categoria === filtroSeleccionado.value;
    return coincideTexto && coincideFiltro;
  })
);

function seleccionarFiltro(f: string) { filtroSeleccionado.value = filtroSeleccionado.value === f ? null : f; }
function volverDashboard() { router.push({ name: "dashboard" }); }
function verPlanes(p: Plataforma) {
  router.push({ name: "planes-plataforma", params: { id_plataforma: p.id_plataforma, plataforma: p.nombre } });
}
</script>

<style scoped>
/* ESTILOS GLOBALES DASHBOARD */
.dashboard {
  position: relative;
  min-height: 100vh;
  padding: 1rem 2rem;
  background: linear-gradient(120deg, #e0f2ff, #a2b8d9, #1e293b);
  color: #f9fafb;
  font-family: "Inter", sans-serif;
  display: flex;
  flex-direction: column;
}

.watermark {
  position: absolute;
  inset: -20%;
  background: radial-gradient(circle at 15% 0%, rgba(255,255,255,0.35), transparent 55%),
              radial-gradient(circle at 80% 100%, rgba(59,130,246,0.4), transparent 60%);
  opacity: 0.8;
  pointer-events: none;
  z-index: 0;
}
.dashboard > * { position: relative; z-index: 1; }

/* HEADER */
.buscador-header {
  text-align: center;
  margin-top: 1rem;
  margin-bottom: 2rem;
}
.buscador-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: rgba(15, 23, 42, 0.9);
  text-shadow: 0 1px 2px rgba(255,255,255,0.6);
  margin: 0;
}
.buscador-subtitle {
  margin-top: 0.5rem;
  color: rgba(15, 23, 42, 0.75);
  font-weight: 500;
}

/* BUSCADOR Y FILTROS */
.search-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.search-bar {
  display: flex;
  width: 100%;
  max-width: 600px;
  background: rgba(15, 23, 42, 0.6);
  padding: 0.5rem;
  border-radius: 999px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(148, 163, 184, 0.4);
}
.search-bar input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 0.5rem 1.5rem;
  color: white;
  outline: none;
}
.search-bar input::placeholder { color: rgba(229, 231, 235, 0.7); }

.filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.8rem;
}

/* PILLS */
.pill {
  padding: 0.5rem 1.2rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.15);
  border: 1px solid rgba(148, 163, 184, 0.4);
  color: #1e293b;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}
.pill:hover { background: rgba(15, 23, 42, 0.25); }
.pill-active {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
  box-shadow: 0 5px 15px rgba(79, 70, 229, 0.4);
}

/* GRID DE RESULTADOS (WIDE) */
.resultados-container {
  width: 100%;
  max-width: 1600px; /* Ancho máximo muy grande para llenar pantalla */
  margin: 0 auto;
}

.plataformas-grid {
  display: grid;
  /* Grid adaptable que llena el ancho */
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.plataforma-card {
  background: radial-gradient(circle at top left, rgba(30, 64, 175, 0.9), rgba(15, 23, 42, 0.95));
  border: 1px solid rgba(129, 140, 248, 0.35);
  border-radius: 1.4rem;
  padding: 1.2rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
}
.plataforma-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px rgba(15, 23, 42, 0.6);
  border-color: rgba(129, 140, 248, 0.8);
}

.plat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.plat-logo {
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.plat-logo img { width: 100%; height: 100%; object-fit: contain; }
.fallback-logo { font-weight: bold; font-size: 1.2rem; color: #0f172a; }

.plat-text { display: flex; flex-direction: column; }
.plat-name { margin: 0; color: white; font-weight: 700; font-size: 1.1rem; }
.plat-cat { font-size: 0.85rem; color: #94a3b8; }

/* BOTONES */
.btn {
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}
.btn.primary {
  padding: 0.6rem 1.5rem;
  background: linear-gradient(135deg, #4f46e5, #22d3ee);
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
}
.btn.primary:hover { filter: brightness(1.1); transform: scale(1.02); }

.btn.ghost {
  background: rgba(255,255,255,0.1);
  color: white;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  border: 1px solid rgba(255,255,255,0.2);
}
.btn.ghost:hover { background: rgba(255,255,255,0.2); }

/* Botón volver (flotante top-left) */
.back-button-container {
  position: absolute;
  top: 1.5rem;
  left: 2rem;
}
.back-button-container .btn.ghost { color: #1e293b; border-color: rgba(148,163,184,0.5); }

/* ANIMACIONES */
.animate-fade { animation: fadeIn 0.5s ease; }
.animate-fade-delayed { animation: fadeIn 0.7s ease backwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
</style>