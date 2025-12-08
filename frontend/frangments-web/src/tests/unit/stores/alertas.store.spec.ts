import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAlertStore } from "@/stores/alertas";
import { alertasService } from "@/api/alertas.service";
import { Alerta } from "@/domain/alerta";

// Mock del servicio
vi.mock("@/api/alertas.service", () => ({
  alertasService: {
    getAll: vi.fn(),
    marcarTodasVistas: vi.fn(),
  },
}));

describe("useAlertStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("fetchAlertas carga alertas y actualiza estado loading/error", async () => {
    const store = useAlertStore();
    
    // Mock data (ya instancias de Alerta, simulando que el servicio ya mapeó)
    const mockAlertas = [
      new Alerta(1, "A1", "info", false, "2023-01-01", "2023-01-01"),
      new Alerta(2, "A2", "warning", true, "2023-01-02", "2023-01-02"),
    ];

    (alertasService.getAll as any).mockResolvedValue(mockAlertas);

    const promise = store.fetchAlertas();
    expect(store.isLoading).toBe(true); // Loading activo durante llamada

    await promise;

    expect(store.isLoading).toBe(false);
    expect(store.alertas).toHaveLength(2);
    expect(store.alertas[0].mensaje).toBe("A1");
    expect(store.alertasNoVistas).toBe(1); // Solo la primera no es vista
  });

  it("fetchAlertas maneja error", async () => {
    const store = useAlertStore();
    (alertasService.getAll as any).mockRejectedValue(new Error("Fail"));

    await store.fetchAlertas();

    expect(store.error).toBe("Error cargando alertas");
    expect(store.isLoading).toBe(false);
    expect(store.alertas).toEqual([]);
  });

  it("marcarTodasComoVistas llama al servicio y actualiza estado local", async () => {
    const store = useAlertStore();
    
    // Estado inicial: 2 alertas no vistas
    store.alertas = [
      new Alerta(1, "A1", "info", false, "", ""),
      new Alerta(2, "A2", "info", false, "", ""),
    ];

    (alertasService.marcarTodasVistas as any).mockResolvedValue();
    (alertasService.getAll as any).mockResolvedValue([]); // fetchAlertas se llama después

    await store.marcarTodasComoVistas();

    expect(alertasService.marcarTodasVistas).toHaveBeenCalled();
    expect(alertasService.getAll).toHaveBeenCalled();
  });

  it("toggleDropdown alterna visibilidad", () => {
    const store = useAlertStore();
    expect(store.showDropdown).toBe(false);
    
    store.toggleDropdown();
    expect(store.showDropdown).toBe(true);
    
    store.toggleDropdown();
    expect(store.showDropdown).toBe(false);
  });
});