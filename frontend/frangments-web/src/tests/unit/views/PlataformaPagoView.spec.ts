import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import PlataformaPagoView from "@/views/PlataformaPagoView.vue";
import { createTestingPinia } from "@pinia/testing";
import { useRouter } from "vue-router";
import apiax from "@/apiAxios";

// Mocks
vi.mock("vue-router", () => ({
  useRouter: vi.fn(),
}));
vi.mock("@/apiAxios");

describe("PlataformaPagoView", () => {
  let pushMock: any;

  beforeEach(() => {
    pushMock = vi.fn();
    (useRouter as any).mockReturnValue({ push: pushMock });
    vi.clearAllMocks();
  });

  it("muestra mensaje si la cantidad no es válida y no llama a la API", async () => {
    const wrapper = mount(PlataformaPagoView, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: { auth: { user: { id: 1, saldo: 10 } } },
            createSpy: vi.fn,
          }),
        ],
      },
    });

    // Selector actualizado al nuevo botón grande
    const btn = wrapper.get("button.btn.primary.big-btn");
    await btn.trigger("click");
    await flushPromises();

    expect(apiax.post).not.toHaveBeenCalled();
    // El texto exacto de tu script
    expect(wrapper.text()).toContain("Por favor, introduce una cantidad válida");
  });

  it("con cantidad válida llama a la API, actualiza saldo y limpia el input", async () => {
    (apiax.post as any).mockResolvedValue({ data: { message: "OK" } });

    const wrapper = mount(PlataformaPagoView, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: { auth: { user: { id: 1, saldo: 10 } } },
            stubActions: false, 
          }),
        ],
      },
    });

    const input = wrapper.find("input.input-lg");
    await input.setValue(50);

    const btn = wrapper.get("button.btn.primary.big-btn");
    await btn.trigger("click");
    await flushPromises();

    expect(apiax.post).toHaveBeenCalledWith(
      "/cartera/1/recargar",
      { cantidad: 50 },
      expect.anything()
    );
    
    expect(wrapper.text()).toContain("Saldo añadido correctamente");
    expect((input.element as HTMLInputElement).value).toBe("");
  });

  it("en caso de error muestra mensaje de error del backend o genérico", async () => {
    const wrapper = mount(PlataformaPagoView, {
      global: {
        plugins: [
          createTestingPinia({ initialState: { auth: { user: { id: 1 } } } }),
        ],
      },
    });

    const input = wrapper.find("input.input-lg");
    const btn = wrapper.get("button.btn.primary.big-btn");

    // Mock error
    (apiax.post as any).mockRejectedValueOnce({
      response: { data: { message: "Error backend" } },
    });

    await input.setValue(10);
    await btn.trigger("click");
    await flushPromises();
    
    expect(wrapper.text()).toContain("Error backend");
  });

  it("botón volver navega a cuenta", async () => {
    const wrapper = mount(PlataformaPagoView, {
      global: { plugins: [createTestingPinia()] },
    });

    // Selector actualizado para el botón dentro del contenedor
    const backBtn = wrapper.get(".back-button-container button");
    await backBtn.trigger("click");

    expect(pushMock).toHaveBeenCalledWith({ name: "cuenta" });
  });
});