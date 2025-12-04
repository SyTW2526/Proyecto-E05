import { Request, Response } from "express";
import { miembroGrupoRepo } from "./miembro_grupo.repository";  
import { createAlerta } from "../alertas/alertas.repository";
import { userRepo } from "../users/user.repository";
import { grupoRepo } from "../grupo/grupo.repository";

export const miembroGrupoController = {
  // Agregar un miembro a un grupo
  async addMember(req: Request, res: Response) {
    const { id_grupo, id_usuario } = req.body;
    if (!id_grupo || !id_usuario) {
      return res.status(400).json({ message: "Faltan campos" });
    }
    try {
      const member = await miembroGrupoRepo.addMemberToGroup({ id_grupo, id_usuario });
      return res.status(201).json({
        message: "Miembro agregado con éxito",
        member,
      });
    } catch (error: any) {
      console.error("Error agregando miembro:", error);
      return res.status(500).json({ message: "Error al agregar miembro", error: error.message });
    }
  },

  // Obtener los miembros de un grupo
  async getMembers(req: Request, res: Response) {
    const { id_grupo } = req.params;

    try {
      const members = await miembroGrupoRepo.getMembersByGroup(Number(id_grupo));
      return res.json(members);
    } catch (error: any) {
      console.error("Error obteniendo los miembros:", error);
      return res.status(500).json({ message: "Error al obtener miembros", error: error.message });
    }
  },

  // Eliminar un miembro de un grupo
  async removeMember(req: Request, res: Response) {
    const { id_grupo, id_usuario } = req.body;
    
    try {
      const member = await miembroGrupoRepo.removeMemberFromGroup({ id_grupo, id_usuario });
      return res.json({
        message: "Miembro eliminado con éxito",
        member,
      });
    } catch (error: any) {
      console.error("Error eliminando miembro:", error);
      return res.status(500).json({ message: "Error al eliminar miembro", error: error.message });
    }
  },

  async leaveGroup(req: Request, res: Response) {
    try {
      // viene del authMiddleware
      const jwtPayload = (req as any).jwt as { email: string };
      if (!jwtPayload?.email) {
        return res.status(401).json({ message: "No autorizado" });
      }

      const user = await userRepo.findByEmail(jwtPayload.email);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const { id_grupo } = req.body;
      if (!id_grupo) {
        return res.status(400).json({ message: "Falta id_grupo" });
      }

      const grupo = await grupoRepo.findById(id_grupo);
      if (!grupo) {
        return res.status(404).json({ message: "Grupo no encontrado" });
      }

      // (opcional) evitar que el jefe se salga así a lo loco
      if (grupo.id_jefe === user.id_usuario) {
        return res.status(400).json({
          message:
            "El jefe del grupo no puede abandonar el grupo. Debe cerrarlo o gestionarlo desde administración.",
        });
      }

      const esMiembro = await miembroGrupoRepo.isUserInGroup(
        id_grupo,
        user.id_usuario
      );
      if (!esMiembro) {
        return res
          .status(400)
          .json({ message: "No formas parte de este grupo" });
      }

      // eliminar del grupo
      await miembroGrupoRepo.removeMemberFromGroup({
        id_grupo,
        id_usuario: user.id_usuario,
      });

      // 🔔 Alerta para el usuario
      await createAlerta({
        id_usuario: user.id_usuario,
        tipo: "HAS_SALIDO_GRUPO",
        titulo: "Has salido de un grupo",
        mensaje: `Has salido del grupo "${grupo.nombre}".`,
        id_grupo,
        id_plan: null,
        metadata: {},
      });

      // 🔔 Alerta para el jefe
      if (grupo.id_jefe) {
        await createAlerta({
          id_usuario: grupo.id_jefe,
          tipo: "USUARIO_ABANDONA_GRUPO",
          titulo: "Un miembro ha abandonado tu grupo",
          mensaje: `${user.nombre} ha abandonado tu grupo "${grupo.nombre}".`,
          id_grupo,
          id_plan: null,
          metadata: {
            id_usuario: user.id_usuario,
            nombre_usuario: user.nombre,
          },
        });
      }

      return res.json({ message: "Has salido del grupo correctamente" });
    } catch (error: any) {
      console.error("Error al salir de grupo:", error);
      return res.status(500).json({
        message: "Error al salir del grupo",
        error: error.message,
      });
    }
  },
};
