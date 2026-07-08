// Cooldown de 5 minutos por figurita, POR DISPOSITIVO (localStorage).
// Es independiente del desbloqueo compartido: un error de un estudiante
// no frena a los demás. Persistente entre recargas (se guarda el
// timestamp de FIN del cooldown).

export const COOLDOWN_MS = 5 * 60 * 1000;

const key = (claseId: string, figurita: number) =>
  `cooldown::${claseId}::${figurita}`;

/** Inicia el cooldown y devuelve el timestamp (ms) en que termina. */
export function iniciarCooldown(claseId: string, figurita: number): number {
  const fin = Date.now() + COOLDOWN_MS;
  try {
    localStorage.setItem(key(claseId, figurita), String(fin));
  } catch {
    // localStorage no disponible (modo privado, etc.): el cooldown
    // solo vive en memoria durante esta sesión — no rompemos.
  }
  return fin;
}

/** Milisegundos restantes de cooldown (0 si no hay o ya expiró). */
export function cooldownRestante(claseId: string, figurita: number): number {
  let fin = 0;
  try {
    fin = Number(localStorage.getItem(key(claseId, figurita)) ?? 0);
  } catch {
    return 0;
  }
  const restante = fin - Date.now();
  if (restante <= 0) {
    limpiarCooldown(claseId, figurita);
    return 0;
  }
  return restante;
}

export function limpiarCooldown(claseId: string, figurita: number) {
  try {
    localStorage.removeItem(key(claseId, figurita));
  } catch {
    // ignorar
  }
}

/** Formatea ms restantes como "M:SS" para la cuenta regresiva. */
export function formatoRestante(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
