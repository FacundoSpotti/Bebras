export function claseId(ruee: string, grado: string, grupo: string) {
  const g = String(grado).replace(/_/g, "");               // "3_4_5_6" -> "3456"
  const u = String(grupo).replace(/_/g, "").toLowerCase(); // "A_A_A_A" -> "aaaa"
  return `${String(ruee).trim()}-${g}-${u}`;               // "1103029-3456-aaaa"
}

export function claseLabel(dep: string, escuela: number, grado: string, grupo: string) {
  const grados = String(grado).split("_");
  const grupos = String(grupo).split("_");
  const base = `${dep} · Escuela ${escuela}`;
  if (grados.length === 1) return `${base} · ${grados[0]}º ${grupos[0]}`;
  // multigrado
  const pares = grados.map((gr, i) => `${gr}º${grupos[i] ?? ""}`).join(" ");
  return `${base} · Multigrado (${pares})`;
}
