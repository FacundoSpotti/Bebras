import { decodeRuee } from "./ruee";
import { claseId, claseLabel } from "./clase";
import type { ClaseRow } from "./supabase";

// El Excel del docente: una sola hoja, formato fijo.
// Fila 0 = encabezados. Filas vacías = separadores (se ignoran).
//   A (0) = Cod. CRM (RUEE) · B (1) = Grado · C (2) = Docente (maestra de
//   aula, DA — NO es el dueño) · D (3) = Grupo. El resto se ignora en v1.

export type FilaExcel = {
  ruee: string;
  grado: string;
  maestra: string | null;
  grupo: string;
};

export async function parseExcel(data: ArrayBuffer): Promise<FilaExcel[]> {
  // Import dinámico: SheetJS solo se descarga en el Panel Docente,
  // no en el álbum de los estudiantes.
  const XLSX = await import("xlsx");
  const wb = XLSX.read(data, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) return [];
  const rows = XLSX.utils.sheet_to_json<(string | number | undefined)[]>(ws, {
    header: 1,
    raw: true,
  });

  const filas: FilaExcel[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0) continue; // fila vacía (separador)
    const ruee = String(r[0] ?? "").trim();
    const grado = String(r[1] ?? "").trim();
    const grupo = String(r[3] ?? "").trim();
    if (!ruee || !grado || !grupo) continue; // fila incompleta → se ignora
    const maestra = String(r[2] ?? "").trim() || null;
    filas.push({ ruee, grado, maestra, grupo });
  }
  return filas;
}

/**
 * Convierte las filas del Excel en filas listas para `upsert` en `clases`.
 * El dueño es SIEMPRE el docente (DR) logueado, no la columna Docente
 * del Excel (esa es la maestra de aula → `maestra`).
 */
export function filasAClases(filas: FilaExcel[], docente: string): ClaseRow[] {
  return filas.map((f) => {
    const { ruee, departamento, escuela } = decodeRuee(f.ruee);
    return {
      id: claseId(ruee, f.grado, f.grupo),
      docente,
      ruee,
      departamento,
      escuela,
      grado: f.grado,
      grupo: f.grupo,
      maestra: f.maestra,
      label: claseLabel(departamento, escuela, f.grado, f.grupo),
    };
  });
}
