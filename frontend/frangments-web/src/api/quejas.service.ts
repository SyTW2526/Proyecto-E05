import apiax from "@/apiAxios";

export interface QuejaPayload {
  titulo: string;
  mensaje: string;
  id_grupo: number;
}

export const quejaService = {
  async crearQueja(payload: QuejaPayload) {
    const { data } = await apiax.post("/quejas", payload);
    return data;
  },

  async obtenerQuejas(estado?: string) {
    const { data } = await apiax.get("/quejas", {
      params: estado ? { estado } : {},
    });
    return data;
  },

  async actualizarQueja(id_queja: number, estado: "pendiente" | "resuelta") {
    const { data } = await apiax.patch(`/quejas/${id_queja}`, { estado });
    return data;
  },
};
