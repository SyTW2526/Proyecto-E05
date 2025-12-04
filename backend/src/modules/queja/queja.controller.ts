import { Request, Response } from "express";
import { db } from "../../config/db";
import { userRepo } from "../users/user.repository";

export const crearQueja = async (req: Request, res: Response) => {
  try {
    const jwtPayload = (req as any).jwt as { email: string };
    if (!jwtPayload?.email) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const user = await userRepo.findByEmail(jwtPayload.email);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const idUsuario = user.id_usuario;
    const { titulo, mensaje, id_grupo } = req.body;

    if (!titulo || !mensaje || !id_grupo) {
      return res
        .status(400)
        .json({ error: "titulo, mensaje e id_grupo son obligatorios" });
    }

    const result = await db.query(
      `
      INSERT INTO queja (id_usuario, id_grupo, titulo, mensaje)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [idUsuario, id_grupo, titulo, mensaje]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error("Error crearQueja:", err);
    return res
      .status(500)
      .json({ error: "Error al crear la queja", detalle: err.message });
  }
};

export const listarQuejas = async (req: Request, res: Response) => {
  try {
    // Solo admin
    const jwtPayload = (req as any).jwt as { email: string };
    if (!jwtPayload?.email) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const user = await userRepo.findByEmail(jwtPayload.email);
    if (!user || user.tipo !== "admin") {
      return res.status(403).json({ error: "Solo admin puede ver quejas" });
    }

    const { estado } = req.query;
    const params: any[] = [];
    let where = "";

    if (estado) {
      params.push(estado);
      where = "WHERE q.estado = $" + params.length;
    }

    const result = await db.query(
      `
      SELECT
        q.*,
        u.nombre AS nombre_usuario,
        u.mail   AS mail_usuario,
        g.nombre AS nombre_grupo
      FROM queja q
      JOIN usuario u ON u.id_usuario = q.id_usuario
      LEFT JOIN grupo g ON g.id_grupo = q.id_grupo
      ${where}
      ORDER BY q.fecha_creacion DESC
      `,
      params
    );

    return res.json(result.rows);
  } catch (err: any) {
    console.error("Error listarQuejas:", err);
    return res.status(500).json({ error: "Error al obtener las quejas" });
  }
};

export const actualizarQueja = async (req: Request, res: Response) => {
  try {
    // Solo admin
    const jwtPayload = (req as any).jwt as { email: string };
    if (!jwtPayload?.email) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const user = await userRepo.findByEmail(jwtPayload.email);
    if (!user || user.tipo !== "admin") {
      return res
        .status(403)
        .json({ error: "Solo admin puede actualizar quejas" });
    }

    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ error: "estado es obligatorio" });
    }

    if (estado !== "pendiente" && estado !== "resuelta") {
      return res.status(400).json({ error: "estado inválido" });
    }

    const result = await db.query(
      `
      UPDATE queja
      SET
        estado = $1,
        fecha_resuelta = CASE WHEN $2 = 'resuelta' THEN NOW() ELSE NULL END
      WHERE id_queja = $3
      RETURNING *
      `,
      [estado, estado, id]   // <- estado va dos veces, pero con índices distintos
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Queja no encontrada" });
    }

    return res.json(result.rows[0]);
  } catch (err: any) {
    console.error("Error actualizarQueja:", err);
    return res
      .status(500)
      .json({ error: "Error al actualizar la queja", detalle: err.message });
  }
};
