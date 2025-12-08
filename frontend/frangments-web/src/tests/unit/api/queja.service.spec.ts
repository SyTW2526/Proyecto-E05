import { describe, it, expect, vi, beforeEach } from "vitest";
import apiax from "@/apiAxios";
import { quejaService } from "@/api/quejas.service"; 

vi.mock("@/apiAxios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("quejaService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Test crearQueja ---
  it("crearQueja hace POST a /quejas con el payload", async () => {
    const payload = { titulo: "Error", mensaje: "No va", id_grupo: 1 };
    const mockResponse = { id: 1, ...payload };

    (apiax.post as any).mockResolvedValueOnce({ data: mockResponse });

    const res = await quejaService.crearQueja(payload);

    expect(apiax.post).toHaveBeenCalledWith("/quejas", payload);
    expect(res).toEqual(mockResponse);
  });

  // --- Test obtenerQuejas ---
  it("obtenerQuejas hace GET /quejas sin params si no se pasa estado", async () => {
    (apiax.get as any).mockResolvedValueOnce({ data: [] });

    await quejaService.obtenerQuejas();

    expect(apiax.get).toHaveBeenCalledWith("/quejas", { params: {} });
  });

  it("obtenerQuejas hace GET /quejas con params si se pasa estado", async () => {
    (apiax.get as any).mockResolvedValueOnce({ data: [] });

    await quejaService.obtenerQuejas("pendiente");

    expect(apiax.get).toHaveBeenCalledWith("/quejas", {
      params: { estado: "pendiente" },
    });
  });

  // --- Test actualizarQueja ---
  it("actualizarQueja hace PATCH a /quejas/:id con el nuevo estado", async () => {
    const mockResponse = { id: 5, estado: "resuelta" };
    (apiax.patch as any).mockResolvedValueOnce({ data: mockResponse });

    const res = await quejaService.actualizarQueja(5, "resuelta");

    expect(apiax.patch).toHaveBeenCalledWith("/quejas/5", { estado: "resuelta" });
    expect(res).toEqual(mockResponse);
  });
});