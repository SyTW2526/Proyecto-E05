import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CuentaView from "@/views/CuentaView.vue"; 
import { createTestingPinia } from "@pinia/testing";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useAccountStore } from "@/stores/cuenta";
import apiax from "@/apiAxios"; 

// 1. Mockear Vue Router
vi.mock("vue-router", () => ({
  useRouter: vi.fn(),
}));

// 2. Mockear Axios
vi.mock("@/apiAxios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("CuentaView", () => {
  let pushMock: any;

  beforeEach(() => {
    pushMock = vi.fn();
    (useRouter as any).mockReturnValue({ push: pushMock });
    vi.clearAllMocks();

    // Resetear mocks de axios por defecto
    (apiax.get as any).mockResolvedValue({ data: {} });
    (apiax.post as any).mockResolvedValue({ data: {} });
  });

  const mountWithStore = (initialState: any = {}, stubActions = true) => {
    return mount(CuentaView, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              auth: { isAuthenticated: true, user: { nombre: "Pepe", email: "pepe@test.com", telefono: "123456789" } },
              cuenta: { grupos: [], suscripciones: [], loading: false, saldo: 0 }, // Estado base
              ...initialState
            },
            stubActions: stubActions, 
          }),
        ],
      },
    });
  };

  it("si el usuario está autenticado, llama a account.userData al montar", async () => {
    const wrapper = mountWithStore({}, true);
    const accountStore = useAccountStore();
    expect(accountStore.userData).toHaveBeenCalled();
  });

  it("si NO está autenticado, redirige a login", async () => {
    mount(CuentaView, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: { auth: { isAuthenticated: false, user: null } },
            stubActions: true,
          }),
        ],
      },
    });
    await flushPromises();
    expect(pushMock).toHaveBeenCalledWith({ name: "login" });
  });

  it("muestra los datos personales y el saldo", async () => {
    const wrapper = mountWithStore({}, true);
    const accountStore = useAccountStore();

    // Forzamos el estado directamente
    accountStore.$patch({ saldo: 20 });
    await wrapper.vm.$nextTick(); // Esperar reactividad

    const text = wrapper.text();
    expect(text).toContain("Pepe");
    expect(text).toContain("pepe@test.com");
    expect(text).toContain("20");
  });

  it("muestra grupos y suscripciones cuando existen", async () => {
    const wrapper = mountWithStore({}, true);
    const accountStore = useAccountStore();

    // Forzamos el estado con grupos y suscripciones
    accountStore.$patch({
      saldo: 20,
      loading: false,
      grupos: [{ id: 1, nombre: "Grupo 1" }],
      suscripciones: [{ id: 1, nombre: "Spotify", precio: 3.5, fechaVencimiento: "2025-01-01" }]
    });
    await wrapper.vm.$nextTick();

    const text = wrapper.text();
    expect(text).toContain("Mis Grupos");
    expect(text).toContain("Grupo 1");
    expect(text).toContain("Suscripciones Activas");
    expect(text).toContain("Spotify");
  });

  it("muestra '...' cuando loading es true", async () => {
    const wrapper = mountWithStore({}, true);
    const accountStore = useAccountStore();

    // Forzamos loading
    accountStore.$patch({ loading: true });
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".saldo-value").text()).toContain("...");
  });

  it("botón Volver redirige a dashboard", async () => {
    const wrapper = mountWithStore({}, true);
    await wrapper.get(".back-button-container button").trigger("click");
    expect(pushMock).toHaveBeenCalledWith({ name: "dashboard" });
  });

  it("botón Añadir saldo redirige a plataformaPago", async () => {
    const wrapper = mountWithStore({}, true);
    const btnSaldo = wrapper.find(".btn.primary-glow"); 
    await btnSaldo.trigger("click");
    expect(pushMock).toHaveBeenCalledWith({ name: "plataformapago" });
  });

  it("botón Cerrar sesión llama a logout y redirige a login", async () => {
    const wrapper = mountWithStore({}, true);
    const authStore = useAuthStore();
    
    // Mockeamos la acción logout
    authStore.logout = vi.fn();

    const btnLogout = wrapper.find(".btn.danger-ghost");
    await btnLogout.trigger("click");

    expect(authStore.logout).toHaveBeenCalled();
    await flushPromises(); 
    expect(pushMock).toHaveBeenCalledWith({ name: "login" });
  });
});