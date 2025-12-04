// src/modules/users/user.routes.ts
import { Router } from "express";
import { userController } from "./user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const r = Router();

// 🔓 públicas
r.post("/", userController.register);          // POST /api/users
r.post("/login", userController.login);        // POST /api/users/login

// 🔒 privadas
r.get("/me", authMiddleware, userController.me);            // GET /api/users/me
r.get("/data", authMiddleware, userController.getUserData); // GET /api/users/data
r.post("/logout", authMiddleware, userController.logout);   // POST /api/users/logout

export default r;
