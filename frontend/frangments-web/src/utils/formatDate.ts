export function formatDate(dateStr: string | Date): string {
  if (!dateStr) return "";

  const d = new Date(dateStr);

  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
