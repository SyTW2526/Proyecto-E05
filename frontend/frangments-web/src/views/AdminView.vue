<template>
  <div class="dashboard admin-page">
    <div class="watermark"></div>

    <div class="back-button-container">
      <button class="btn small ghost-dark" @click="volverDashboard">
        ⬅ Volver
      </button>
    </div>

    <div class="container-wide animate-fade">
      
      <header class="header-center">
        <h1 class="title-main">Panel de Administración</h1>
        <p class="subtitle-main">Gestión centralizada de usuarios, grupos, ofertas y quejas.</p>
      </header>

      <nav class="nav-pills animate-fade-delayed">
        <button
          class="pill-btn"
          :class="{ active: seccionActiva === 'usuarios' }"
          @click="seccionActiva = 'usuarios'"
        >
          👥 Usuarios
        </button>
        <button
          class="pill-btn"
          :class="{ active: seccionActiva === 'grupos' }"
          @click="seccionActiva = 'grupos'"
        >
          📂 Grupos
        </button>
        <button
          class="pill-btn"
          :class="{ active: seccionActiva === 'ofertas' }"
          @click="seccionActiva = 'ofertas'"
        >
          🏷️ Ofertas
        </button>
        <button
          class="pill-btn"
          :class="{ active: seccionActiva === 'quejas' }"
          @click="seccionActiva = 'quejas'"
        >
          ⚠️ Quejas
        </button>
      </nav>

      <div class="card-wide animate-fade-delayed">
        
        <section v-if="seccionActiva === 'usuarios'">
          <div class="section-header">
            <h3>Usuarios registrados</h3>
            <span class="count-badge">{{ usuarios.length }} total</span>
          </div>

          <div class="table-wrapper">
            <table class="styled-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th class="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in paginatedUsuarios" :key="user.id_usuario">
                  <td class="font-medium">{{ user.nombre }}</td>
                  <td class="text-muted">{{ user.mail }}</td>
                  <td>
                    <span class="role-badge" :class="user.tipo">
                      {{ user.tipo }}
                    </span>
                  </td>
                  <td class="text-right">
                    <button class="btn x-small danger-ghost" @click="eliminarUsuario(user.id_usuario)">
                      🗑 Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="pagination" v-if="totalPagesUsuarios > 1">
            <button class="pager-btn" :disabled="pageUsuarios === 1" @click="goToPageUsuarios(-1)">‹ Anterior</button>
            <span class="pager-info">{{ pageUsuarios }} / {{ totalPagesUsuarios }}</span>
            <button class="pager-btn" :disabled="pageUsuarios === totalPagesUsuarios" @click="goToPageUsuarios(1)">Siguiente ›</button>
          </div>
        </section>

        <section v-if="seccionActiva === 'grupos'">
          <div class="section-header">
            <h3>Grupos registrados</h3>
            <span class="count-badge">{{ grupos.length }} total</span>
          </div>

          <div class="list-wrapper">
            <div v-for="grupo in paginatedGrupos" :key="grupo.id" class="list-row">
              <span class="row-title">{{ grupo.nombre }}</span>
              <button class="btn x-small danger-ghost" @click="eliminarGrupo(grupo.id)">
                🗑 Eliminar
              </button>
            </div>
            <p v-if="grupos.length === 0" class="empty-msg">No hay grupos registrados.</p>
          </div>

          <div class="pagination" v-if="totalPagesGrupos > 1">
            <button class="pager-btn" :disabled="pageGrupos === 1" @click="goToPageGrupos(-1)">‹ Anterior</button>
            <span class="pager-info">{{ pageGrupos }} / {{ totalPagesGrupos }}</span>
            <button class="pager-btn" :disabled="pageGrupos === totalPagesGrupos" @click="goToPageGrupos(1)">Siguiente ›</button>
          </div>
        </section>

        <section v-if="seccionActiva === 'ofertas'">
          <div class="section-header">
            <h3>Ofertas publicadas</h3>
            <span class="count-badge">{{ ofertas.length }} total</span>
          </div>

          <div class="list-wrapper">
            <div v-for="oferta in paginatedOfertas" :key="oferta.id" class="list-row">
              <div class="row-info">
                <span class="row-main">{{ oferta.plataforma }} <span class="price-tag">{{ oferta.precio }}€</span></span>
                <span class="row-sub">Por {{ oferta.usuario }} ({{ oferta.grupo }})</span>
              </div>
              <button class="btn x-small danger-ghost" @click="eliminarOferta(oferta.id)">
                🗑 Eliminar
              </button>
            </div>
            <p v-if="ofertas.length === 0" class="empty-msg">No hay ofertas activas.</p>
          </div>

          <div class="pagination" v-if="totalPagesOfertas > 1">
            <button class="pager-btn" :disabled="pageOfertas === 1" @click="goToPageOfertas(-1)">‹ Anterior</button>
            <span class="pager-info">{{ pageOfertas }} / {{ totalPagesOfertas }}</span>
            <button class="pager-btn" :disabled="pageOfertas === totalPagesOfertas" @click="goToPageOfertas(1)">Siguiente ›</button>
          </div>
        </section>

        <section v-if="seccionActiva === 'quejas'">
          <div class="section-header">
            <h3>Quejas de usuarios</h3>
            <span class="count-badge">{{ quejas.length }} total</span>
          </div>

          <div class="table-wrapper">
            <table class="styled-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Asunto</th>
                  <th style="width: 40%;">Mensaje</th> <th>Estado</th>
                  <th class="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="q in paginatedQuejas" :key="q.id">
                  <td class="text-muted">#{{ q.id }}</td>
                  <td>{{ q.nombreUsuario || ('ID ' + q.idUsuario) }}</td>
                  <td class="font-medium">{{ q.titulo }}</td>
                  
                  <td class="msg-full">{{ q.mensaje }}</td>
                  
                  <td>
                    <span class="status-dot" :class="q.estado"></span> {{ q.estado }}
                  </td>
                  <td class="text-right action-cell">
                    <button v-if="q.estado === 'pendiente'" class="btn x-small success-ghost" @click="cambiarEstadoQueja(q, 'resuelta')">
                      ✓ Resolver
                    </button>
                    <button v-else class="btn x-small warning-ghost" @click="cambiarEstadoQueja(q, 'pendiente')">
                      ↩ Pendiente
                    </button>
                  </td>
                </tr>
                <tr v-if="quejas.length === 0">
                  <td colspan="6" class="empty-msg">No hay quejas registradas.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pagination" v-if="totalPagesQuejas > 1">
            <button class="pager-btn" :disabled="pageQuejas === 1" @click="goToPageQuejas(-1)">‹ Anterior</button>
            <span class="pager-info">{{ pageQuejas }} / {{ totalPagesQuejas }}</span>
            <button class="pager-btn" :disabled="pageQuejas === totalPagesQuejas" @click="goToPageQuejas(1)">Siguiente ›</button>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useAdminStore } from "@/stores/admin";
import { useQuejasStore } from "@/stores/queja";

const router = useRouter();
const auth = useAuthStore();
const admin = useAdminStore();
const quejasStore = useQuejasStore();

const seccionActiva = ref("usuarios");

// Computeds
const usuarios = computed(() => admin.users);
const grupos = computed(() => admin.grupos);
const ofertas = computed(() => admin.ofertas);
const quejas = computed(() => quejasStore.quejas);

onMounted(async () => {
  try {
    if (!auth.user) await auth.fetchMe();
    if (!auth.isAdmin) return router.push({ name: "dashboard" });

    await admin.loadAll();
    await quejasStore.fetchQuejas();
  } catch (err) {
    console.error("Error al cargar datos de administración:", err);
  }
});

// Acciones
async function eliminarUsuario(id: number) { if (confirm("¿Eliminar usuario?")) await admin.eliminarUsuario(id); }
async function eliminarGrupo(id: number) { if (confirm("¿Eliminar grupo?")) await admin.eliminarGrupo(id); }
async function eliminarOferta(id: number) { if (confirm("¿Eliminar oferta?")) await admin.eliminarOferta(id); }
async function cambiarEstadoQueja(q: any, estado: "pendiente" | "resuelta") { await quejasStore.marcarEstado(q, estado); }
function volverDashboard() { router.push({ name: "dashboard" }); }

// Paginación
const pageSize = 10;
const pageUsuarios = ref(1);
const pageGrupos = ref(1);
const pageOfertas = ref(1);
const pageQuejas = ref(1);

const usePagination = (data: any, page: any) => {
  const total = computed(() => Math.max(1, Math.ceil(data.value.length / pageSize)));
  const paginated = computed(() => {
    const start = (page.value - 1) * pageSize;
    return data.value.slice(start, start + pageSize);
  });
  return { total, paginated };
};

const { total: totalPagesUsuarios, paginated: paginatedUsuarios } = usePagination(usuarios, pageUsuarios);
const { total: totalPagesGrupos, paginated: paginatedGrupos } = usePagination(grupos, pageGrupos);
const { total: totalPagesOfertas, paginated: paginatedOfertas } = usePagination(ofertas, pageOfertas);
const { total: totalPagesQuejas, paginated: paginatedQuejas } = usePagination(quejas, pageQuejas);

const goToPageUsuarios = (delta: number) => {
  pageUsuarios.value = Math.min(totalPagesUsuarios.value, Math.max(1, pageUsuarios.value + delta));
};

const goToPageGrupos = (delta: number) => {
  pageGrupos.value = Math.min(totalPagesGrupos.value, Math.max(1, pageGrupos.value + delta));
};

const goToPageOfertas = (delta: number) => {
  pageOfertas.value = Math.min(totalPagesOfertas.value, Math.max(1, pageOfertas.value + delta));
};

const goToPageQuejas = (delta: number) => {
  pageQuejas.value = Math.min(totalPagesQuejas.value, Math.max(1, pageQuejas.value + delta));
};
</script>

<style scoped>
/* CONFIGURACIÓN GLOBAL */
.dashboard {
  position: relative;
  min-height: 100vh;
  padding: 4rem 2rem 3rem; 
  background: linear-gradient(120deg, #e0f2ff, #a2b8d9, #1e293b);
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

.container-wide {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 0 auto;
}

/* HEADER */
.header-center {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
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

/* NAV PILLS */
.nav-pills {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.pill-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.7rem 1.5rem;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  color: #1e293b;
  transition: all 0.2s ease;
  backdrop-filter: blur(5px);
}

.pill-btn:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

.pill-btn.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
  box-shadow: 0 5px 15px rgba(37, 99, 235, 0.4);
}

/* PANEL PRINCIPAL */
.card-wide {
  background: radial-gradient(circle at top left, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.92));
  border: 1px solid rgba(148, 163, 184, 0.3);
  padding: 2.5rem;
  border-radius: 1.4rem;
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.6);
  color: white;
  min-height: 500px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 1rem;
}

.section-header h3 { margin: 0; font-size: 1.3rem; color: #f1f5f9; }
.count-badge {
  background: rgba(255,255,255,0.1);
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  font-size: 0.85rem;
  color: #94a3b8;
}

/* TABLAS */
.table-wrapper { overflow-x: auto; }
.styled-table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }

.styled-table th {
  text-align: left;
  padding: 1rem;
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.styled-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  color: #e2e8f0;
  vertical-align: top; /* Alineado arriba por si el mensaje es largo */
}

.styled-table tr:hover { background: rgba(255, 255, 255, 0.03); }

.font-medium { font-weight: 600; color: #fff; }
.text-muted { color: #94a3b8; font-size: 0.9rem; }
.text-right { text-align: right; }

/* === ARREGLO PARA MENSAJES LARGOS === */
.msg-full {
  white-space: pre-wrap;  /* Respeta saltos de línea y envuelve texto */
  word-wrap: break-word;  /* Rompe palabras largas si es necesario */
  max-width: 400px;       /* Limita el ancho para no romper la tabla */
  line-height: 1.5;
  color: #cbd5e1;
}

/* Listas */
.list-row {
  display: flex; justify-content: space-between; align-items: center; padding: 1rem;
  background: rgba(255,255,255,0.03); border-radius: 0.8rem; margin-bottom: 0.8rem;
  border: 1px solid rgba(255,255,255,0.05);
}
.row-title { font-weight: 600; color: #fff; }
.row-info { display: flex; flex-direction: column; gap: 0.2rem; }
.row-main { font-weight: 600; color: #fff; }
.price-tag { color: #60a5fa; margin-left: 0.5rem; }
.row-sub { font-size: 0.85rem; color: #94a3b8; }
.empty-msg { text-align: center; padding: 2rem; color: #64748b; font-style: italic; }

/* Badges */
.role-badge { padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; background: rgba(59, 130, 246, 0.2); color: #93c5fd; }
.status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 5px; }
.status-dot.pendiente { background: #facc15; box-shadow: 0 0 5px #facc15; }
.status-dot.resuelta { background: #4ade80; box-shadow: 0 0 5px #4ade80; }

/* Botones */
.btn { border: none; cursor: pointer; border-radius: 0.5rem; font-weight: 600; transition: 0.2s; }
.x-small { padding: 0.4rem 0.8rem; font-size: 0.8rem; white-space: nowrap; }

.danger-ghost { background: rgba(239, 68, 68, 0.15); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); }
.danger-ghost:hover { background: rgba(239, 68, 68, 0.25); color: #fff; }

.success-ghost { background: rgba(34, 197, 94, 0.15); color: #86efac; border: 1px solid rgba(34, 197, 94, 0.3); }
.success-ghost:hover { background: rgba(34, 197, 94, 0.25); color: #fff; }

.warning-ghost { background: rgba(234, 179, 8, 0.15); color: #fde047; border: 1px solid rgba(234, 179, 8, 0.3); }
.warning-ghost:hover { background: rgba(234, 179, 8, 0.25); color: #fff; }

.back-button-container { position: absolute; top: 2rem; left: 2rem; }
.small { padding: 0.5rem 1rem; font-size: 0.85rem; border-radius: 999px; }
.ghost-dark { background: transparent; color: #1e293b; border: 1px solid rgba(148, 163, 184, 0.6); }
.ghost-dark:hover { background: rgba(15, 23, 42, 0.1); }

/* Paginación */
.pagination { display: flex; justify-content: flex-end; align-items: center; gap: 1rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1); }
.pager-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 0.4rem 1rem; border-radius: 0.5rem; cursor: pointer; transition: 0.2s; }
.pager-btn:hover:not(:disabled) { background: rgba(255,255,255,0.2); }
.pager-btn:disabled { opacity: 0.3; cursor: default; }
.pager-info { font-size: 0.9rem; color: #94a3b8; }

/* Animaciones */
.animate-fade { animation: fadeIn 0.5s ease; }
.animate-fade-delayed { animation: fadeIn 0.7s ease backwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 768px) {
  .dashboard { padding: 5rem 1rem 2rem; }
  .card-wide { padding: 1.5rem; }
  .nav-pills { gap: 0.5rem; }
  .pill-btn { padding: 0.5rem 1rem; font-size: 0.9rem; }
}
</style>