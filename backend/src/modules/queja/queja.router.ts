import { Router } from "express";
import { crearQueja, listarQuejas, actualizarQueja } from "./queja.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

export const quejaRouter = Router();

// Usuario crea queja
quejaRouter.post("/", authMiddleware, crearQueja);

// Admin lista quejas (opcionalmente filtradas por estado)
quejaRouter.get("/", authMiddleware, listarQuejas);

// Admin marca como resuelta / cambia estado
quejaRouter.patch("/:id", authMiddleware, actualizarQueja);