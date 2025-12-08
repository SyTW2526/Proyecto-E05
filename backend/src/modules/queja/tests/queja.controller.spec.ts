import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  crearQueja,
  listarQuejas,
  actualizarQueja,
} from "../queja.controller"; 
import { db } from "../../../config/db";
import { userRepo } from "../../users/user.repository"; 

vi.mock("../../../config/db", () => ({
  db: {
    query: vi.fn(),
  },
}));

vi.mock("../../users/user.repository", () => ({
  userRepo: {
    findByEmail: vi.fn(),
  },
}));

describe("quejaController", () => {
  let req: any;
  let res: any;
  let json: any;
  let status: any;

  // Datos mock
  const mockUserNormal = {
    id_usuario: 10,
    nombre: "Pepe",
    email: "pepe@test.com",
    tipo: "normal",
  };

  const mockUserAdmin = {
    id_usuario: 99,
    nombre: "Admin",
    email: "admin@test.com",
    tipo: "admin",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    json = vi.fn().mockReturnThis();
    status = vi.fn().mockReturnThis();

    res = { json, status } as any;
    req = {
      jwt: { email: "test@test.com" },
      body: {},
      params: {},
      query: {},
    } as any;
  });

  // Helper para tipado seguro del mock
  const mockedUserRepo = vi.mocked(userRepo);
  const mockedDb = vi.mocked(db);

  // ==========================================================
  // TEST: crearQueja
  // ==========================================================
  describe("crearQueja", () => {
    it("devuelve 401 si no hay email en JWT", async () => {
      req.jwt = {}; // Sin email
      await crearQueja(req, res);
      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: "No autorizado" }));
    });

    it("devuelve 404 si el usuario no existe", async () => {
      // Usamos el helper mockedUserRepo para acceder a los métodos del mock
      mockedUserRepo.findByEmail.mockResolvedValue(null);
      
      await crearQueja(req, res);
      expect(status).toHaveBeenCalledWith(404);
    });

    it("devuelve 400 si faltan campos obligatorios", async () => {
      mockedUserRepo.findByEmail.mockResolvedValue(mockUserNormal);
      req.body = { titulo: "Solo titulo" }; // Falta mensaje e id_grupo

      await crearQueja(req, res);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "titulo, mensaje e id_grupo son obligatorios" })
      );
    });

    it("devuelve 201 y la queja creada si todo es correcto", async () => {
      mockedUserRepo.findByEmail.mockResolvedValue(mockUserNormal);
      req.body = {
        titulo: "Problema X",
        mensaje: "Detalle X",
        id_grupo: 5,
      };

      const mockCreatedQueja = { id_queja: 1, ...req.body };
      // Simulamos respuesta de pg: result.rows[0]
      mockedDb.query.mockResolvedValue({ rows: [mockCreatedQueja] } as any);

      await crearQueja(req, res);

      expect(db.query).toHaveBeenCalled();
      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith(mockCreatedQueja);
    });

    it("devuelve 500 si falla la base de datos", async () => {
      mockedUserRepo.findByEmail.mockResolvedValue(mockUserNormal);
      req.body = { titulo: "T", mensaje: "M", id_grupo: 1 };
      mockedDb.query.mockRejectedValue(new Error("DB Error"));

      await crearQueja(req, res);

      expect(status).toHaveBeenCalledWith(500);
    });
  });

  // ==========================================================
  // TEST: listarQuejas
  // ==========================================================
  describe("listarQuejas", () => {
    it("devuelve 401 si no hay JWT", async () => {
      req.jwt = undefined;
      await listarQuejas(req, res);
      expect(status).toHaveBeenCalledWith(401);
    });

    it("devuelve 403 si el usuario NO es admin", async () => {
      mockedUserRepo.findByEmail.mockResolvedValue(mockUserNormal); // Tipo 'normal'
      await listarQuejas(req, res);
      expect(status).toHaveBeenCalledWith(403);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Solo admin puede ver quejas" })
      );
    });

    it("devuelve 200 y la lista de quejas si es admin", async () => {
      mockedUserRepo.findByEmail.mockResolvedValue(mockUserAdmin); // Tipo 'admin'
      
      const mockRows = [
        { id_queja: 1, titulo: "Q1" },
        { id_queja: 2, titulo: "Q2" },
      ];
      mockedDb.query.mockResolvedValue({ rows: mockRows } as any);

      await listarQuejas(req, res);

      expect(json).toHaveBeenCalledWith(mockRows);
    });

    it("aplica filtro de estado si viene en query params", async () => {
      mockedUserRepo.findByEmail.mockResolvedValue(mockUserAdmin);
      req.query = { estado: "pendiente" };
      mockedDb.query.mockResolvedValue({ rows: [] } as any);

      await listarQuejas(req, res);

      const calls = mockedDb.query.mock.calls;
      const sqlQuery = calls[0][0]; 
      const sqlParams = calls[0][1];

      expect(sqlQuery).toContain("WHERE q.estado = $1");
      expect(sqlParams).toEqual(["pendiente"]);
    });

    it("devuelve 500 si hay error en BD", async () => {
      mockedUserRepo.findByEmail.mockResolvedValue(mockUserAdmin);
      mockedDb.query.mockRejectedValue(new Error("Fail"));
      await listarQuejas(req, res);
      expect(status).toHaveBeenCalledWith(500);
    });
  });

  // ==========================================================
  // TEST: actualizarQueja
  // ==========================================================
  describe("actualizarQueja", () => {
    it("devuelve 403 si el usuario no es admin", async () => {
      mockedUserRepo.findByEmail.mockResolvedValue(mockUserNormal);
      await actualizarQueja(req, res);
      expect(status).toHaveBeenCalledWith(403);
    });

    it("devuelve 400 si falta el estado en el body", async () => {
      mockedUserRepo.findByEmail.mockResolvedValue(mockUserAdmin);
      req.body = {}; // Sin estado
      await actualizarQueja(req, res);
      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: "estado es obligatorio" }));
    });

    it("devuelve 400 si el estado es inválido", async () => {
      mockedUserRepo.findByEmail.mockResolvedValue(mockUserAdmin);
      req.body = { estado: "inventado" }; // No es 'pendiente' ni 'resuelta'
      await actualizarQueja(req, res);
      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: "estado inválido" }));
    });

    it("devuelve 404 si la queja no existe (rowCount 0)", async () => {
      mockedUserRepo.findByEmail.mockResolvedValue(mockUserAdmin);
      req.params.id = "999";
      req.body = { estado: "resuelta" };

      mockedDb.query.mockResolvedValue({ rowCount: 0, rows: [] } as any);

      await actualizarQueja(req, res);

      expect(status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: "Queja no encontrada" }));
    });

    it("devuelve 200 y la queja actualizada si todo va bien", async () => {
      mockedUserRepo.findByEmail.mockResolvedValue(mockUserAdmin);
      req.params.id = "10";
      req.body = { estado: "resuelta" };

      const mockUpdatedQueja = { id_queja: 10, estado: "resuelta", fecha_resuelta: new Date() };
      mockedDb.query.mockResolvedValue({ rowCount: 1, rows: [mockUpdatedQueja] } as any);

      await actualizarQueja(req, res);

      expect(json).toHaveBeenCalledWith(mockUpdatedQueja);
    });

    it("devuelve 500 si falla la base de datos", async () => {
      mockedUserRepo.findByEmail.mockResolvedValue(mockUserAdmin);
      req.body = { estado: "pendiente" };
      mockedDb.query.mockRejectedValue(new Error("Boom"));

      await actualizarQueja(req, res);

      expect(status).toHaveBeenCalledWith(500);
    });
  });
});