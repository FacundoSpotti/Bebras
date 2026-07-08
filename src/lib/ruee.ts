export const DEPARTAMENTOS: Record<string, string> = {
  "1101": "Montevideo", "1102": "Artigas", "1103": "Canelones", "1104": "Cerro Largo",
  "1105": "Colonia", "1106": "Durazno", "1107": "Flores", "1108": "Florida",
  "1109": "Lavalleja", "1110": "Maldonado", "1111": "Paysandú", "1112": "Río Negro",
  "1113": "Rivera", "1114": "Rocha", "1115": "Salto", "1116": "San José",
  "1117": "Soriano", "1118": "Tacuarembó", "1119": "Treinta y Tres",
};

export function decodeRuee(codigo: string | number) {
  const s = String(codigo).trim();
  const prefijo = s.slice(0, 4);
  const escuelaNum = parseInt(s.slice(4), 10); // "029" -> 29
  return {
    ruee: s,
    departamento: DEPARTAMENTOS[prefijo] ?? "Desconocido",
    escuela: escuelaNum,
  };
}
