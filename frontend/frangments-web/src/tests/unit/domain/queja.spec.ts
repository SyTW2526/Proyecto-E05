import { describe, it, expect } from "vitest";
import { Queja } from "@/domain/queja";

describe("Queja.fromDTO", () => {
  it("mapea un DTO completo desde la base de datos (snake_case)", () => {
    const dto = {
      id_queja: 50,
      titulo: "Error login",
      mensaje: "No puedo entrar",
      estado: "resuelta",
      fecha_creacion: "2023-01-01",
      fecha_resuelta: "2023-01-02",
      id_usuario: 1,
      id_grupo: 10,
      nombre_usuario: "Pepe",
      mail_usuario: "pepe@mail.com",
      nombre_grupo: "Grupo Test"
    };

    const queja = Queja.fromDTO(dto);

    expect(queja.id).toBe(50);
    expect(queja.titulo).toBe("Error login");
    expect(queja.estado).toBe("resuelta");
    expect(queja.fechaCreacion).toBe("2023-01-01");
    expect(queja.fechaResuelta).toBe("2023-01-02");
    expect(queja.idUsuario).toBe(1);
    expect(queja.idGrupo).toBe(10);
    expect(queja.nombreUsuario).toBe("Pepe");
    expect(queja.nombreGrupo).toBe("Grupo Test");
  });

  it("mapea un DTO estilo frontend (camelCase) o mixto", () => {
    const dto = {
      id: 60, // En lugar de id_queja
      titulo: "Bug visual",
      mensaje: "Texto roto",
      // estado falta -> default pendiente
      fechaCreacion: "2023-02-01", // camelCase
      fechaResuelta: null,
      id_usuario: 2
    };

    const queja = Queja.fromDTO(dto);

    expect(queja.id).toBe(60);
    expect(queja.estado).toBe("pendiente"); // Default
    expect(queja.fechaCreacion).toBe("2023-02-01");
    expect(queja.fechaResuelta).toBeNull();
  });

  it("asigna null a idGrupo si no viene", () => {
    const dto = {
      id: 70,
      titulo: "T",
      mensaje: "M",
      id_usuario: 3,
      // id_grupo falta
    };

    const queja = Queja.fromDTO(dto);
    expect(queja.idGrupo).toBeNull();
  });
});