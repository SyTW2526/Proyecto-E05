export class Queja {
  constructor(
    public id: number,
    public titulo: string,
    public mensaje: string,
    public estado: "pendiente" | "resuelta",
    public fechaCreacion: string,
    public fechaResuelta: string | null,
    public idUsuario: number,
    public idGrupo: number | null,
    public nombreUsuario?: string,
    public mailUsuario?: string,
    public nombreGrupo?: string,
  ) {}

  static fromDTO(d: any): Queja {
    return new Queja(
      d.id_queja ?? d.id,          
      d.titulo,
      d.mensaje,
      d.estado ?? "pendiente",
      d.fecha_creacion ?? d.fechaCreacion ?? new Date().toISOString(),
      d.fecha_resuelta ?? d.fechaResuelta ?? null,
      d.id_usuario,
      d.id_grupo ?? null,
      d.nombre_usuario,
      d.mail_usuario,
      d.nombre_grupo,
    );
  }
}
