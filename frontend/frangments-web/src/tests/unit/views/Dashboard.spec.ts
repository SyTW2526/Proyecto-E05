import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils"; // Importar flushPromises
import DashboardView from "@/views/Dashboard.vue";
import { createTestingPinia } from "@pinia/testing";
import { useRouter } from "vue-router";
import apiax from "@/apiAxios"; 

// Mock Router
vi.mock("vue-router", () => ({
  useRouter: vi.fn(),
}));

// Mock Axios
vi.mock("@/apiAxios", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("DashboardView", () => {
  let pushMock: any;

  beforeEach(() => {
    pushMock = vi.fn();
    (useRouter as any).mockReturnValue({ push: pushMock });
    vi.clearAllMocks();
    (apiax.get as any).mockResolvedValue({ data: [] });
  });

  const mountOptions = {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            auth: { user: { nombre: "Pepe" }, isAuthenticated: true },
          },
          stubActions: false,
        }),
      ],
    },
  };

  it("muestra saludo con el nombre del usuario", () => {
    const wrapper = mount(DashboardView, mountOptions);
    expect(wrapper.text()).toContain("Pepe");
  });

  it("tiene tarjetas de plataformas visibles (paginadas)", () => {
    const wrapper = mount(DashboardView, mountOptions);
    // El pageSize es 4, así que debería haber 4 cards visibles
    const cards = wrapper.findAll(".plataforma-card");
    expect(cards.length).toBe(4); 
  });

  it("botones de navegación llevan a las rutas correctas", async () => {
    const wrapper = mount(DashboardView, mountOptions);

    // Explorar planes
    const btnBuscar = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Explorar planes"));
    
    if (btnBuscar) {
        await btnBuscar.trigger("click");
        expect(pushMock).toHaveBeenCalledWith({ name: "buscador" });
    }

    // Crear plan
    const btnCrear = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Crear plan"));
    
    if (btnCrear) {
        await btnCrear.trigger("click");
        expect(pushMock).toHaveBeenCalledWith({ name: "ofertar" });
    }
  });

  it("al hacer click en una plataforma navega a plataforma-detalle con el id correcto", async () => {
    const wrapper = mount(DashboardView, mountOptions);
    
    // Clic en la primera tarjeta de plataforma
    const firstCard = wrapper.find(".plataforma-card");
    await firstCard.trigger("click");

    expect(pushMock).toHaveBeenCalledWith({
      name: "plataforma-detalle",
      params: expect.objectContaining({ id: expect.any(Number) }),
    });
  });

  it("si no está autenticado, redirige a login", async () => {
    mount(DashboardView, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: { auth: { isAuthenticated: false } },
          }),
        ],
      },
    });
    
    // Esperamos a que se resuelvan las promesas del onMounted
    await flushPromises();

    expect(pushMock).toHaveBeenCalledWith({ name: "login" });
  });
});