import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import OfertarView from "@/views/OfertarView.vue";
import apiax from "@/apiAxios";
import { createTestingPinia } from "@pinia/testing";
import { useRouter } from "vue-router";
import { useAccountStore } from "@/stores/cuenta";

// ---- Mocks ----
vi.mock("vue-router", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/apiAxios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("OfertarView", () => {
  let pushMock: any;

  beforeEach(() => {
    pushMock = vi.fn();
    (useRouter as any).mockReturnValue({ push: pushMock });
    vi.clearAllMocks();

    localStorage.setItem("token", "fake-token");

    // Mock por defecto para GET /plataforma
    (apiax.get as any).mockResolvedValue({
      data: [{ id_plataforma: 1, nombre: "Netflix" }],
    });
  });

  // Helper para montar con Pinia
  const mountWithStore = () => {
    return mount(OfertarView, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              auth: { user: { id: 1 } },
            },
            stubActions: false, // Permitir llamadas reales a mocks de acciones
          }),
        ],
      },
    });
  };

  it("muestra el título de publicar oferta", async () => {
    const wrapper = mountWithStore();
    await flushPromises();

    expect(wrapper.text()).toContain("Publicar un nuevo plan");
    expect(wrapper.text()).toContain(
      "Crea un plan y se creará automáticamente su grupo asociado"
    );
  });

  it("si faltan campos, muestra mensaje de validación y no llama al backend", async () => {
    const wrapper = mountWithStore();
    const accountStore = useAccountStore();

    await flushPromises(); // carga plataformas

    const form = wrapper.get("form");
    await form.trigger("submit.prevent");
    await flushPromises();

    expect(wrapper.text()).toContain("Completa todos los campos");
    expect(accountStore.createGroup).not.toHaveBeenCalled();
    expect(apiax.post).not.toHaveBeenCalled();
  });

  it("con todos los campos, crea grupo, llama al backend y limpia el formulario", async () => {
    const wrapper = mountWithStore();
    const accountStore = useAccountStore();

    (accountStore.createGroup as any).mockResolvedValue({ id_grupo: 123 });

    await flushPromises();

    
    // Select
    const select = wrapper.find("select");
    await select.setValue(1); // Netflix (id 1)

    // Inputs (buscamos por orden o placeholder/tipo si no tienen ID único fácil)
    const inputs = wrapper.findAll("input");

    await inputs[0].setValue(12.99); // Precio
    await inputs[1].setValue("2025-12-31"); // Fecha
    await inputs[2].setValue(4); // Personas
    await inputs[3].setValue("Grupo Netflix"); // Nombre grupo

    // Mock respuesta final
    (apiax.post as any).mockResolvedValue({
      data: { message: "ok" },
    });

    const form = wrapper.get("form");
    await form.trigger("submit.prevent");
    await flushPromises();

    expect(accountStore.createGroup).toHaveBeenCalledWith("Grupo Netflix");
    
    // Verificar llamada al backend para crear plan
    expect(apiax.post).toHaveBeenCalledWith(
      "/plan_sub/subscribe",
      expect.objectContaining({
        id_plataforma: 1,
        precio: 12.99,
        fecha_vencimiento: "2025-12-31",
        id_grupo: 123,
        nmiembros: 4,
      }),
      expect.anything() // headers
    );

    expect(wrapper.text()).toContain("Plan creado con éxito");
  });

  it("botón volver navega a dashboard", async () => {
    const wrapper = mountWithStore();
    
    // Selector actualizado
    const backBtn = wrapper.get(".back-button-container button");
    await backBtn.trigger("click");

    expect(pushMock).toHaveBeenCalledWith({ name: "dashboard" });
  });
});