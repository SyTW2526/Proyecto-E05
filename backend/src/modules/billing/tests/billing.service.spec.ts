import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { billingService } from "../billing.service"; 
import { planSubRepo } from "../../plan_sub/plan_sub.repositoy"; 
import { transaccionRepo } from "../../transaccion/transaccion.repository"; 
import { carteraRepo } from "../../cartera/cartera.repository"; 
import { miembroGrupoRepo } from "../../miembro_grupo/miembro_grupo.repository"; 
import { grupoRepo } from "../../grupo/grupo.repository"; 
import { createAlerta } from "../../alertas/alertas.repository"; 
import { userRepo } from "../../users/user.repository"; 
import { db } from "../../../config/db"; 

// Mocks de repositorios
vi.mock("../../plan_sub/plan_sub.repositoy", () => ({
  planSubRepo: {
    getAllActivePlans: vi.fn(),
  },
}));
vi.mock("../../transaccion/transaccion.repository", () => ({
  transaccionRepo: {
    getLastByPlanId: vi.fn(),
    create: vi.fn(),
  },
}));
vi.mock("../../cartera/cartera.repository", () => ({
  carteraRepo: {
    findByUserId: vi.fn(),
    updateSaldoDelta: vi.fn(),
  },
}));
vi.mock("../../miembro_grupo/miembro_grupo.repository", () => ({
  miembroGrupoRepo: {
    getMembersByGroup: vi.fn(),
    removeMember: vi.fn(),
  },
}));
vi.mock("../../grupo/grupo.repository", () => ({
  grupoRepo: {
    findById: vi.fn(),
  },
}));
vi.mock("../../alertas/alertas.repository", () => ({
  createAlerta: vi.fn(),
}));
vi.mock("../../users/user.repository", () => ({
  userRepo: {
    findByEmail: vi.fn(),
  },
}));
vi.mock("../../../config/db", () => ({
  db: {
    query: vi.fn(),
  },
}));

describe("billingService", () => {
  // Datos mock estándar
  const mockPlan = {
    id_plan: 10,
    id_grupo: 100,
    precio_plan: 30, // 30€ total
    fecha_inicio_cobro: new Date("2023-01-01T00:00:00Z"),
  };

  const mockGrupo = {
    id_grupo: 100,
    nombre: "Grupo Test",
    id_jefe: 1, // Jefe es ID 1
  };

  const mockAdmin = { id_usuario: 999, email: "administrador@admin" };

  beforeEach(() => {
    vi.clearAllMocks();
    // Configuración por defecto de mocks para evitar errores de undefined
    (userRepo.findByEmail as any).mockResolvedValue(mockAdmin);
    (grupoRepo.findById as any).mockResolvedValue(mockGrupo);
    (planSubRepo.getAllActivePlans as any).mockResolvedValue([mockPlan]);
    // Por defecto, simulamos que nunca se ha cobrado (para que intente cobrar)
    (transaccionRepo.getLastByPlanId as any).mockResolvedValue(null);
    // Transacción creada mock
    (transaccionRepo.create as any).mockResolvedValue({
      id_transaccion: 500,
      fecha_trans: new Date(),
    });
  });

  afterEach(() => {
    vi.useRealTimers(); // Restaurar el reloj si lo manipulamos
  });

  // ==========================================================
  // TEST: runBillingNow
  // ==========================================================
  describe("runBillingNow", () => {
    it("NO cobra si todavía no ha pasado el mes desde el último cobro", async () => {
      // Simulamos que se cobró ayer
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);

      (transaccionRepo.getLastByPlanId as any).mockResolvedValue({
        fecha_trans: ayer,
      });

      await billingService.runBillingNow();

      // No debe buscar miembros ni intentar cobrar
      expect(miembroGrupoRepo.getMembersByGroup).not.toHaveBeenCalled();
      expect(carteraRepo.updateSaldoDelta).not.toHaveBeenCalled();
    });

    it("NO cobra si solo está el jefe en el grupo", async () => {
      // Miembros: solo el jefe
      const miembros = [{ id_usuario: 1 }];
      (miembroGrupoRepo.getMembersByGroup as any).mockResolvedValue(miembros);

      await billingService.runBillingNow();

      expect(carteraRepo.updateSaldoDelta).not.toHaveBeenCalled();
    });

    it("EXPULSA al usuario si no tiene saldo suficiente", async () => {
      // Miembros: Jefe (1) y Usuario Pobre (2)
      const miembros = [{ id_usuario: 1 }, { id_usuario: 2 }];
      (miembroGrupoRepo.getMembersByGroup as any).mockResolvedValue(miembros);

      // Calculamos cuánto debería pagar: 30 / 2 = 15 base.
      // Usuario paga: 15 * 1.15 = 17.25
      // Simulamos saldo insuficiente (10€)
      (carteraRepo.findByUserId as any).mockImplementation(async (id: number) => {
        if (id === 2) return { saldo: 10 };
        return { saldo: 1000 };
      });

      await billingService.runBillingNow();

      // Debe haber intentado expulsar al usuario 2
      expect(miembroGrupoRepo.removeMember).toHaveBeenCalledWith(100, 2);
      // Debe crear alerta de expulsión
      expect(createAlerta).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: "EXPULSION_SUSCRIPCION",
          id_usuario: 2,
        })
      );
      // NO debe haber movido dinero
      expect(carteraRepo.updateSaldoDelta).not.toHaveBeenCalled();
    });

    it("COBRA correctamente si tiene saldo suficiente", async () => {
      // Miembros: Jefe (1) y Usuario Rico (2)
      const miembros = [{ id_usuario: 1 }, { id_usuario: 2 }];
      (miembroGrupoRepo.getMembersByGroup as any).mockResolvedValue(miembros);

      // Saldo de sobra (50€)
      (carteraRepo.findByUserId as any).mockImplementation(async (id: number) => {
        if (id === 2) return { saldo: 50 };
        return { saldo: 1000 };
      });

      await billingService.runBillingNow();

      // Cálculos esperados:
      // Base = 15
      // Usuario paga = 17.25
      // Jefe recibe = 15 * 1.10 = 16.50
      // Plataforma = 17.25 - 16.50 = 0.75

      // 1. Restar al usuario
      expect(carteraRepo.updateSaldoDelta).toHaveBeenCalledWith(2, -17.25);
      // 2. Sumar al jefe
      expect(carteraRepo.updateSaldoDelta).toHaveBeenCalledWith(1, 16.5);
      // 3. Sumar al admin/plataforma
      expect(carteraRepo.updateSaldoDelta).toHaveBeenCalledWith(999, 0.75);

      // 4. Crear transacción
      expect(transaccionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id_usuario_origen: 2,
          precio: 17.25,
          comision: 0.75,
        })
      );

      // 5. Crear alerta de cobro
      expect(createAlerta).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: "COBRO_SUSCRIPCION",
          id_usuario: 2,
        })
      );
    });
  });

  // ==========================================================
  // TEST: checkLowBalance
  // ==========================================================
  describe("checkLowBalance", () => {
    it("NO hace nada si falta mucho para el cobro", async () => {
      // Simulamos que se cobró ayer, falta casi un mes
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      (transaccionRepo.getLastByPlanId as any).mockResolvedValue({
        fecha_trans: ayer,
      });

      await billingService.checkLowBalance();

      // No debe chequear usuarios
      expect(miembroGrupoRepo.getMembersByGroup).not.toHaveBeenCalled();
    });

    it("CREA ALERTA si estamos en la ventana de aviso (3 días) y saldo es bajo", async () => {
      // Mockeamos el tiempo actual
      const ahora = new Date("2023-02-01T10:00:00Z");
      vi.setSystemTime(ahora);

      // Último cobro fue hace 29 días (toca en 2 días, dentro de la ventana de 3)
      const hace29dias = new Date(ahora);
      hace29dias.setDate(ahora.getDate() - 29);

      (transaccionRepo.getLastByPlanId as any).mockResolvedValue({
        fecha_trans: hace29dias,
      });

      // Miembros: Jefe (1) y Usuario Pobre (2)
      const miembros = [{ id_usuario: 1 }, { id_usuario: 2 }];
      (miembroGrupoRepo.getMembersByGroup as any).mockResolvedValue(miembros);

      // Saldo bajo (5€, necesita 17.25)
      (carteraRepo.findByUserId as any).mockImplementation(async (id: number) => {
        if (id === 2) return { saldo: 5 };
        return { saldo: 1000 };
      });

      await billingService.checkLowBalance();

      expect(createAlerta).toHaveBeenCalledWith(
        expect.objectContaining({
          id_usuario: 2,
          tipo: "SALDO_BAJO",
          metadata: expect.objectContaining({
            saldo_actual: 5,
            importe_necesario: 17.25,
          }),
        })
      );
    });

    it("NO crea alerta si tiene saldo suficiente", async () => {
      // Mismo escenario de tiempo (ventana de aviso)
      const ahora = new Date("2023-02-01T10:00:00Z");
      vi.setSystemTime(ahora);
      const hace29dias = new Date(ahora);
      hace29dias.setDate(ahora.getDate() - 29);

      (transaccionRepo.getLastByPlanId as any).mockResolvedValue({
        fecha_trans: hace29dias,
      });

      const miembros = [{ id_usuario: 1 }, { id_usuario: 2 }];
      (miembroGrupoRepo.getMembersByGroup as any).mockResolvedValue(miembros);

      // Saldo suficiente (100€)
      (carteraRepo.findByUserId as any).mockResolvedValue({ saldo: 100 });

      await billingService.checkLowBalance();

      expect(createAlerta).not.toHaveBeenCalled();
    });
  });
});