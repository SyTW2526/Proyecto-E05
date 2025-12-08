import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useQuejasStore } from "@/stores/queja";
import { quejaService } from "@/api/quejas.service"; // Asegúrate de la ruta correcta
import { Queja } from "@/domain/queja";

vi.mock("@/api/quejas.service", () => ({
  quejaService: {
    obtenerQuejas: vi.fn(),
    actualizarQueja: vi.fn(),
    crearQueja: vi.fn(),
  },
}));

describe("useQuejasStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("fetchQuejas obtiene datos y mapea a dominio", async () => {
    const store = useQuejasStore();
    
    // Mock respuesta raw del backend
    const mockData = [
      { id: 1, titulo: "Q1", estado: "pendiente" },
      { id: 2, titulo: "Q2", estado: "resuelta" },
    ];
    (quejaService.obtenerQuejas as any).mockResolvedValue(mockData);

    const promise = store.fetchQuejas();
    expect(store.loading).toBe(true);

    await promise;

    expect(store.loading).toBe(false);
    expect(store.quejas).toHaveLength(2);
    expect(store.quejas[0]).toBeInstanceOf(Queja);
    expect(store.quejas[0].titulo).toBe("Q1");
  });

  it("crearQueja llama al servicio y añade al estado", async () => {
    const store = useQuejasStore();
    const payload = { titulo: "Nueva", mensaje: "test", id_grupo: 1 };
    
    const mockResponse = { id: 10, ...payload, estado: "pendiente" };
    (quejaService.crearQueja as any).mockResolvedValue(mockResponse);

    await store.crearQueja(payload);

    expect(quejaService.crearQueja).toHaveBeenCalledWith(payload);
    expect(store.quejas).toHaveLength(1);
    expect(store.quejas[0].id).toBe(10);
  });

  it("marcarEstado actualiza la queja en la lista", async () => {
    const store = useQuejasStore();
    
    // Estado inicial
    const q1 = new Queja(1, "Q1", "msg", "pendiente", "", null, 1, null);
    const q2 = new Queja(2, "Q2", "msg", "pendiente", "", null, 2, null);
    store.quejas = [q1, q2];

    // Mock respuesta actualización
    const mockUpdated = { ...q1, estado: "resuelta" }; // DTO simulado
    (quejaService.actualizarQueja as any).mockResolvedValue(mockUpdated);

    await store.marcarEstado(q1, "resuelta");

    expect(quejaService.actualizarQueja).toHaveBeenCalledWith(1, "resuelta");
    expect(store.quejas[0].estado).toBe("resuelta");
    expect(store.quejas[1].estado).toBe("pendiente"); // La otra no cambia
  });
});