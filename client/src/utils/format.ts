export const formatDate = (iso?: string | Date): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${String(d.getDate()).padStart(2, "0")}-${months[d.getMonth()]}-${d.getFullYear()}`;
};

/** `$4050.00` (no thousands separator) as used in list rows of the reference design. */
export const plainMoney = (n: number): string => `$${n.toFixed(2)}`;

export const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

export const pluralize = (n: number, one: string, many: string): string =>
  `${n} ${n === 1 ? one : many}`;

export const errorMessage = (err: unknown): string =>
  (err as { message?: string } | null)?.message || "Something went wrong";

