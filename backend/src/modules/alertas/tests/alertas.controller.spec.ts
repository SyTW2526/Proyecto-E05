import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAlertas,
  marcarTodasAlertasVistas,
  marcarAlertaVista,
} from "../alertas.controller"; 
import * as alertasRepo from "../alertas.repository"; 
import { userRepo } from "../../users/user.repository"; 


vi.mock("../alertas.repository", () => ({
  findAlertasByUsuario: vi.fn(),
  markAllAlertasRead: vi.fn(),
  markAlertaRead: vi.fn(),
}));

vi.mock("../../users/user.repository", () => ({
  userRepo: {
    findByEmail: vi.fn(),
  },
}));

describe("alertasController", () => {
  let req: any;
  let res: any;
  let json: any;
  let status: any;
  let send: any;

  const mockUser = {
    id_usuario: 5,
    nombre: "Test User",
    email: "test@test.com",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    json = vi.fn().mockReturnThis();
    status = vi.fn().mockReturnThis();
    send = vi.fn().mockReturnThis();

    res = { json, status, send, statusCode: 200 } as any;
    req = {
      jwt: { email: "test@test.com" },
      params: {},
    } as any;
  });

  // ==========================================================
  // TEST: getAlertas
  // ==========================================================
  describe("getAlertas", () => {
    it("devuelve 401 si no hay email en el JWT", async () => {
      req.jwt = {}; 

      await getAlertas(req, res);

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "No autenticado" })
      );
    });

    it("devuelve 404 si el usuario no existe", async () => {
      // Forzamos el mock usando 'as any' o vi.mocked si prefieres
      (userRepo.findByEmail as any).mockResolvedValue(null);

      await getAlertas(req, res);

      expect(userRepo.findByEmail).toHaveBeenCalledWith("test@test.com");
      expect(status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Usuario no encontrado" })
      );
    });

    it("devuelve la lista de alertas formateada correctamente (200)", async () => {
      (userRepo.findByEmail as any).mockResolvedValue(mockUser);

      const mockRows = [
        {
          id_alerta: 101,
          mensaje: "Hola mundo",
          tipo: "INFO",
          leida: false,
          fecha_creacion: new Date("2023-01-01"),
        },
      ];

      // Mockeamos la función exportada del repo de alertas
      (alertasRepo.findAlertasByUsuario as any).mockResolvedValue(mockRows);

      await getAlertas(req, res);

      expect(alertasRepo.findAlertasByUsuario).toHaveBeenCalledWith(mockUser.id_usuario);
      expect(json).toHaveBeenCalledWith([
        {
          id: 101,
          mensaje: "Hola mundo",
          tipo: "INFO",
          vista: false,
          fecha: mockRows[0].fecha_creacion,
          createdAt: mockRows[0].fecha_creacion,
        },
      ]);
    });

    it("devuelve 500 si falla el repositorio", async () => {
      (userRepo.findByEmail as any).mockResolvedValue(mockUser);
      (alertasRepo.findAlertasByUsuario as any).mockRejectedValue(new Error("DB Error"));

      await getAlertas(req, res);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Error obteniendo alertas" })
      );
    });
  });

  // ==========================================================
  // TEST: marcarTodasAlertasVistas
  // ==========================================================
  describe("marcarTodasAlertasVistas", () => {
    it("devuelve 401 si no hay JWT", async () => {
      req.jwt = undefined;
      await marcarTodasAlertasVistas(req, res);
      expect(status).toHaveBeenCalledWith(401);
    });

    it("devuelve 404 si usuario no existe", async () => {
      (userRepo.findByEmail as any).mockResolvedValue(null);
      await marcarTodasAlertasVistas(req, res);
      expect(status).toHaveBeenCalledWith(404);
    });

    it("devuelve 204 si marca todo con éxito", async () => {
      (userRepo.findByEmail as any).mockResolvedValue(mockUser);
      (alertasRepo.markAllAlertasRead as any).mockResolvedValue(true);

      await marcarTodasAlertasVistas(req, res);

      expect(alertasRepo.markAllAlertasRead).toHaveBeenCalledWith(mockUser.id_usuario);
      expect(status).toHaveBeenCalledWith(204);
      expect(send).toHaveBeenCalled();
    });

    it("devuelve 500 si falla el repo", async () => {
      (userRepo.findByEmail as any).mockResolvedValue(mockUser);
      (alertasRepo.markAllAlertasRead as any).mockRejectedValue(new Error("Fail"));

      await marcarTodasAlertasVistas(req, res);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Error marcando alertas" })
      );
    });
  });

  // ==========================================================
  // TEST: marcarAlertaVista
  // ==========================================================
  describe("marcarAlertaVista", () => {
    it("devuelve 400 si el ID en params no es un número", async () => {
      (userRepo.findByEmail as any).mockResolvedValue(mockUser);
      req.params.id = "abc"; 

      await marcarAlertaVista(req, res);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "ID de alerta inválido" })
      );
    });

    it("devuelve 404 si la alerta no existe o no pertenece al usuario", async () => {
      (userRepo.findByEmail as any).mockResolvedValue(mockUser);
      req.params.id = "99";

      (alertasRepo.markAlertaRead as any).mockResolvedValue(null);

      await marcarAlertaVista(req, res);

      expect(alertasRepo.markAlertaRead).toHaveBeenCalledWith(99, mockUser.id_usuario);
      expect(status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Alerta no encontrada" })
      );
    });

    it("devuelve la alerta actualizada (200) si todo va bien", async () => {
      (userRepo.findByEmail as any).mockResolvedValue(mockUser);
      req.params.id = "50";

      const mockUpdatedRow = {
        id_alerta: 50,
        mensaje: "Alerta individual",
        tipo: "WARNING",
        leida: true,
        fecha_creacion: new Date(),
      };

      (alertasRepo.markAlertaRead as any).mockResolvedValue(mockUpdatedRow);

      await marcarAlertaVista(req, res);

      expect(json).toHaveBeenCalledWith({
        id: 50,
        mensaje: "Alerta individual",
        tipo: "WARNING",
        vista: false, // !leida -> !true -> false
        fecha: mockUpdatedRow.fecha_creacion,
        createdAt: mockUpdatedRow.fecha_creacion,
      });
    });

    it("devuelve 500 si hay error interno", async () => {
      (userRepo.findByEmail as any).mockResolvedValue(mockUser);
      req.params.id = "50";
      (alertasRepo.markAlertaRead as any).mockRejectedValue(new Error("Boom"));

      await marcarAlertaVista(req, res);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Error marcando alerta" })
      );
    });
  });
});