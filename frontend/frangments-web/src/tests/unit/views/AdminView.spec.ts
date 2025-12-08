import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import AdminView from "@/views/AdminView.vue";
import { createTestingPinia } from "@pinia/testing";
import { useRouter } from "vue-router";

vi.mock("vue-router", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/stores/admin", () => ({
    useAdminStore: vi.fn(() => ({
        users: [], grupos: [], ofertas: [], loadAll: vi.fn(),
        eliminarUsuario: vi.fn(), eliminarGrupo: vi.fn(), eliminarOferta: vi.fn()
    }))
}));
vi.mock("@/stores/queja", () => ({
    useQuejasStore: vi.fn(() => ({
        quejas: [], fetchQuejas: vi.fn(), marcarEstado: vi.fn()
    }))
}));

describe("AdminView", () => {
  let pushMock: any;

  beforeEach(() => {
    pushMock = vi.fn();
    (useRouter as any).mockReturnValue({ push: pushMock });
    vi.clearAllMocks();
  });

  // Configuración común de montaje con Pinia
  const mountOptions = {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            auth: { isAdmin: true, user: { nombre: "Admin" } },
          },
          stubActions: false, 
        }),
      ],
    },
  };

  it("muestra la sección de usuarios por defecto", () => {
    const wrapper = mount(AdminView, mountOptions);
    // Verificar que se renderiza el título de la sección usuarios
    expect(wrapper.text()).toContain("Usuarios registrados"); 
  });

  it("cambia de sección al hacer click en los botones de navegación", async () => {
    const wrapper = mount(AdminView, mountOptions);
    
    // Busca el botón de Grupos (ahora es .pill-btn) por su texto
    const btnGrupos = wrapper.findAll(".pill-btn").find(b => b.text().includes("Grupos"));
    
    if (btnGrupos) {
        await btnGrupos.trigger("click");
        // Verifica que cambia el contenido
        expect(wrapper.text()).toContain("Grupos registrados"); 
    } else {
        throw new Error("Botón de Grupos no encontrado");
    }
  });

  it("redirige al dashboard al pulsar Volver", async () => {
    const wrapper = mount(AdminView, mountOptions);
    
    // Selector actualizado
    const btnVolver = wrapper.find(".back-button-container button");
    await btnVolver.trigger("click");
    
    expect(pushMock).toHaveBeenCalledWith({ name: "dashboard" });
  });
});