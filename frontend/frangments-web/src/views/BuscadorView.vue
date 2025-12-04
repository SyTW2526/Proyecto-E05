<template>
  <div class="page buscador-page">
    <!-- BOTÓN VOLVER GLOBAL -->
    <div class="back-button-container">
      <button type="button" class="btn back" @click="volverDashboard">
        ⬅ Volver
      </button>
    </div>

    <!-- HEADER -->
    <header class="buscador-header animate-fade">
      <h2 class="buscador-title">Buscador de Plataformas</h2>
      <p class="buscador-subtitle">
        Encuentra fácilmente las plataformas que te interesan
      </p>
    </header>

    <!-- BARRA BUSQUEDA -->
    <div class="search-bar">
      <input
        type="text"
        v-model="query"
        placeholder="Buscar plataforma..."
      />
      <button class="btn primary">Buscar</button>
    </div>

    <!-- FILTROS -->
    <div class="filters">
      <button
        v-for="(filtro, index) in filtros"
        :key="index"
        :class="['filter-pill', { active: filtroSeleccionado === filtro }]"
        @click="seleccionarFiltro(filtro)"
      >
        {{ filtro }}
      </button>
    </div>

    <!-- RESULTADOS -->
    <section class="resultados animate-fade-delayed">
      <div v-if="resultadosFiltrados.length > 0" class="panel-glass resultados-panel">
        <div class="plataformas-grid">
          <article
            v-for="plataforma in resultadosFiltrados"
            :key="plataforma.id_plataforma"
            class="card-radial float plataforma-pill"
          >
            <div class="plat-main">
              <!-- Avatar tipo dashboard (letra) -->
              <div class="plat-avatar">
                <img
                  v-if="getLogo(plataforma.nombre)"
                  :src="getLogo(plataforma.nombre)"
                  alt="logo"
                  class="plat-logo"
                />
                <span v-else>
                  {{ plataforma.nombre[0] }}
                </span>
              </div>

              <div class="plat-info">
                <h3 class="plat-name">{{ plataforma.nombre }}</h3>
              </div>
            </div>

            <div class="plat-actions">
              <button class="btn small ghost" @click.stop="verPlanes(plataforma)">
                Consultar
              </button>
            </div>
          </article>
        </div>
      </div>

      <p v-else class="no-resultados">No se encontraron resultados.</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
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


type Plataforma = {
  id_plataforma: number;
  nombre: string;
  categoria: string;
};

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

function seleccionarFiltro(filtro: string) {
  filtroSeleccionado.value =
    filtroSeleccionado.value === filtro ? null : filtro;
}

function volverDashboard() {
  router.push({ name: "dashboard" });
}

function verPlanes(plataforma: Plataforma) {
  router.push({
    name: "planes-plataforma",
    params: {
      id_plataforma: plataforma.id_plataforma,
      plataforma: plataforma.nombre,
    },
  });
}
</script>

<style scoped>
.buscador-page {
  align-items: stretch;
  background: linear-gradient(120deg, #e0f2ff, #a2b8d9, #1e293b);
}

/* HEADER */
.buscador-header {
  text-align: center;
  margin-bottom: 1.8rem;
}

.buscador-title {
  font-size: 2rem;
  font-weight: 800;
  color: #ffffff;
}

.buscador-subtitle {
  margin-top: 0.25rem;
  color: #e5e7eb;
  font-size: 0.95rem;
  opacity: 0.9;
}

/* SEARCH BAR */
.search-bar {
  width: 100%;
  max-width: 720px;
  margin: 0 auto 1.4rem;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
}

.search-bar input {
  padding: 0.8rem 1rem;
  border-radius: 999px;
  border: 1px solid #cbd5e1;
  font-size: 0.95rem;
  outline: none;
  background: #f9fafb;
  color: #0f172a;
}

.search-bar input::placeholder {
  color: #9ca3af;
}

.search-bar input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.35);
}

/* FILTROS */
.filters {
  width: 100%;
  max-width: 720px;
  margin: 0 auto 2rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.6rem;
}

.filter-pill {
  background: rgba(255, 255, 255, 0.75);
  border-radius: 999px;
  padding: 0.45rem 1.1rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.85rem;
  color: #111827;
  border: 1px solid rgba(148, 163, 184, 0.7);
  transition: 0.2s ease;
}

.filter-pill:hover {
  background: #e0e7ff;
}

.filter-pill.active {
  background: #4f46e5;
  color: #ffffff;
  border-color: transparent;
}

/* RESULTADOS */
.resultados {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto 2rem;
}

.resultados-panel {
  padding: 2rem 2.2rem;
}

/* GRID DE PLATAFORMAS: estilo parecido al dashboard */
.plataformas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.4rem;
}

.plataforma-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1.4rem;
}

.plat-main {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.plat-avatar {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 0 18px rgba(248, 250, 252, 0.45);
}

.plat-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.plat-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #f9fafb;
}

.plat-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.plat-desc {
  margin: 0;
  font-size: 0.85rem;
  color: #d1d5db;
}

.plat-actions {
  flex-shrink: 0;
}

.no-resultados {
  margin-top: 1.5rem;
  text-align: center;
  color: #e5e7eb;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .search-bar {
    grid-template-columns: 1fr;
  }

  .resultados-panel {
    padding: 1.5rem 1.4rem;
  }

  .plataforma-pill {
    flex-direction: column;
    align-items: flex-start;
  }

  .plat-actions {
    align-self: stretch;
  }
}
</style>
