import { describe, it, expect } from "vitest";
import { Alerta } from "@/domain/alerta";

describe("Alerta.fromDTO", () => {
  it("mapea correctamente un DTO completo", () => {
    const dto = {
      id: 101,
      mensaje: "Pago realizado",
      tipo: "pago",
      vista: true,
      fecha: "2023-01-01",
      createdAt: "2023-01-01T10:00:00Z"
    };

    const alerta = Alerta.fromDTO(dto);

    expect(alerta).toBeInstanceOf(Alerta);
    expect(alerta.id).toBe(101);
    expect(alerta.mensaje).toBe("Pago realizado");
    expect(alerta.tipo).toBe("pago");
    expect(alerta.vista).toBe(true);
    expect(alerta.fecha).toBe("2023-01-01");
    expect(alerta.createdAt).toBe("2023-01-01T10:00:00Z");
  });

  it("asigna valores por defecto si faltan campos opcionales", () => {
    const dto = {
      id: 202,
      mensaje: "Alerta simple",
      tipo: "info",
      // vista falta -> default false
      // fecha falta -> usa createdAt
    };
    // Simulamos que createdAt viene
    const dtoConFecha = { ...dto, createdAt: "2023-05-05" };

    const alerta = Alerta.fromDTO(dtoConFecha);

    expect(alerta.vista).toBe(false); // Default
    expect(alerta.fecha).toBe("2023-05-05"); // Fallback a createdAt
  });

  it("maneja el fallback de fechas cruzado (si falta createdAt usa fecha)", () => {
    const dto = {
      id: 303,
      mensaje: "Test fecha",
      tipo: "warning",
      fecha: "2023-12-31"
      // createdAt falta -> usa fecha
    };

    const alerta = Alerta.fromDTO(dto);

    expect(alerta.createdAt).toBe("2023-12-31");
  });
});