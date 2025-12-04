import { defineStore } from "pinia";
import { quejaService, QuejaPayload } from "@/api/quejas.service";
import { Queja } from "@/domain/queja";

type QuejasState = {
  quejas: Queja[];
  loading: boolean;
};

export const useQuejasStore = defineStore("quejas", {
  state: (): QuejasState => ({
    quejas: [],
    loading: false,
  }),

  actions: {
    async fetchQuejas(estado?: string) {
      this.loading = true;
      try {
        const data = await quejaService.obtenerQuejas(estado);
        this.quejas = (data ?? []).map((q: any) => Queja.fromDTO(q));
      } finally {
        this.loading = false;
      }
    },

    async marcarEstado(queja: Queja, estado: "pendiente" | "resuelta") {
      const data = await quejaService.actualizarQueja(queja.id, estado);
      const actualizada = Queja.fromDTO(data);

      const idx = this.quejas.findIndex((q) => q.id === queja.id);
      if (idx !== -1) this.quejas[idx] = actualizada;

      return actualizada;
    },

    async crearQueja(payload: QuejaPayload) {
      const data = await quejaService.crearQueja(payload);
      const q = Queja.fromDTO(data);
      this.quejas.push(q);
      return q;
    },
  },
});
