import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import BuscadorView from "@/views/BuscadorView.vue";
import { useRouter } from "vue-router";

// Mock del router
vi.mock("vue-router", () => ({
  useRouter: vi.fn(),
}));

describe("BuscadorView", () => {
  let pushMock: any;

  beforeEach(() => {
    pushMock = vi.fn();
    (useRouter as any).mockReturnValue({ push: pushMock });
  });

  it("muestra todas las plataformas por defecto", () => {
    const wrapper = mount(BuscadorView);
    const cards = wrapper.findAll(".plataforma-card");
    expect(cards.length).toBe(7);
  });

  it("filtra por texto en el input de búsqueda", async () => {
    const wrapper = mount(BuscadorView);

    const input = wrapper.get("input");
    await input.setValue("spotify");

    const cards = wrapper.findAll(".plataforma-card");
    expect(cards.length).toBe(1);
    expect(cards[0].text()).toContain("Spotify");
  });

  it("filtra por categoría al pulsar un filtro", async () => {
    const wrapper = mount(BuscadorView);

    // CORRECCIÓN: Buscamos el botón por su clase nueva (.pill) y texto
    const streamingBtn = wrapper
      .findAll(".pill")
      .find((b) => b.text() === "Streaming");
    
    // Verificamos que exista antes de trigger
    expect(streamingBtn).toBeDefined();
    await streamingBtn?.trigger("click");

    const cards = wrapper.findAll(".plataforma-card");
    // Disney+, HBO Max, Prime Video, Crunchyroll => 4
    expect(cards.length).toBe(4);
  });

  it("al pulsar Consultar navega a la vista de planes con los params correctos", async () => {
    const wrapper = mount(BuscadorView);
    const firstCard = wrapper.find(".plataforma-card");
    const btnConsultar = firstCard.find("button"); // El único botón dentro de la card es "Consultar"
    
    // Obtenemos el texto del nombre para verificar el parámetro
    const platName = firstCard.find(".plat-name").text();

    await btnConsultar.trigger("click");

    expect(pushMock).toHaveBeenCalledWith({
      name: "planes-plataforma",
      params: expect.objectContaining({
        plataforma: platName,
      }),
    });
  });

  it("botón Volver redirige a dashboard", async () => {
    const wrapper = mount(BuscadorView);
  
    const backBtn = wrapper.get(".back-button-container button");
    
    await backBtn.trigger("click");
    expect(pushMock).toHaveBeenCalledWith({ name: "dashboard" });
  });
});