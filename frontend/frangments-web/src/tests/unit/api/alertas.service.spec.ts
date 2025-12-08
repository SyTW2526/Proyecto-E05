import { describe, it, expect, vi, beforeEach } from "vitest";
import apiax from "@/apiAxios";
import { alertasService } from "@/api/alertas.service";
import { Alerta } from "@/domain/alerta";

// 1. Mock de Axios
vi.mock("@/apiAxios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// 2. Mock de la clase de dominio Alerta
// Simulamos que fromDTO simplemente devuelve el objeto añadiendo una marca para verificar que pasó por ahí
vi.mock("@/domain/alerta", () => ({
  Alerta: {
    fromDTO: vi.fn((dto) => ({ ...dto, _mapped: true })),
  },
}));

describe("alertasService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Test getAll ---
  it("getAll hace GET /alertas y mapea los resultados", async () => {
    const mockData = [{ id: 1, mensaje: "Test 1" }, { id: 2, mensaje: "Test 2" }];
    
    // Simulamos respuesta de axios
    (apiax.get as any).mockResolvedValueOnce({ data: mockData });

    const res = await alertasService.getAll();

    expect(apiax.get).toHaveBeenCalledWith("/alertas");
    // Verificamos que llamó al mapper del dominio
    expect(Alerta.fromDTO).toHaveBeenCalledTimes(2);
    // Verificamos que devuelve el array mapeado
    expect(res).toHaveLength(2);
    expect((res[0] as any)._mapped).toBe(true);
  });

  it("getAll devuelve array vacío si la respuesta no es un array", async () => {
    (apiax.get as any).mockResolvedValueOnce({ data: { error: "algo raro" } });

    const res = await alertasService.getAll();

    expect(apiax.get).toHaveBeenCalledWith("/alertas");
    expect(res).toEqual([]);
  });

  // --- Test marcarTodasVistas ---
  it("marcarTodasVistas hace POST a /alertas/marcar-todas-vistas", async () => {
    (apiax.post as any).mockResolvedValueOnce({ data: { ok: true } });

    await alertasService.marcarTodasVistas();

    expect(apiax.post).toHaveBeenCalledWith("/alertas/marcar-todas-vistas");
  });

  // --- Test marcarUnaVista ---
  it("marcarUnaVista hace POST a /alertas/:id/vista y devuelve la alerta mapeada", async () => {
    const mockAlerta = { id: 10, leida: true };
    (apiax.post as any).mockResolvedValueOnce({ data: mockAlerta });

    const res = await alertasService.marcarUnaVista(10);

    expect(apiax.post).toHaveBeenCalledWith("/alertas/10/vista");
    expect(Alerta.fromDTO).toHaveBeenCalledWith(mockAlerta);
    expect((res as any)._mapped).toBe(true);
  });
});