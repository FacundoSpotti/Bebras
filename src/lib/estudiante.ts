// Nombre del estudiante en ESTE dispositivo (localStorage).
// Se pide una sola vez al entrar al álbum y se usa para registrar
// quién pegó cada figurita (columna `autor` de `progreso`).

const KEY = "nombreEstudiante";

export function getNombreEstudiante(): string | null {
  try {
    const n = localStorage.getItem(KEY);
    return n && n.trim() ? n.trim() : null;
  } catch {
    return null;
  }
}

export function setNombreEstudiante(nombre: string) {
  try {
    localStorage.setItem(KEY, nombre.trim());
  } catch {
    // sin localStorage: el nombre vive solo en memoria durante la sesión
  }
}
