// Sesión del docente (DR) activo. No es auth real: solo recuerda quién
// pasó el login del Onboarding durante esta pestaña (sessionStorage).

const KEY = "docenteActivo";

export function getDocenteActivo(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setDocenteActivo(nombre: string) {
  try {
    sessionStorage.setItem(KEY, nombre);
  } catch {
    // sin sessionStorage la sesión no persiste; el guard redirige a #/
  }
}

export function limpiarDocenteActivo() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignorar
  }
}
