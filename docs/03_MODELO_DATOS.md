# 03 · MODELO DE DATOS

## 1. El Excel del docente
Una sola hoja. Formato **fijo**. Fila 0 = encabezados. Hay **filas vacías** que actúan de separadores (ignorarlas). Columnas relevantes:

| Índice | Columna | Uso |
|---|---|---|
| A | `Cod. CRM (RUEE)` | Código de escuela → departamento + número de escuela |
| B | `Grado` | Grado(s). Multigrado viene como `3_4_5_6` |
| C | `Docente` | Maestra de aula (DA). Opcional para mostrar. **No** es el DR. |
| D | `Grupo` | Grupo(s). Multigrado como `A_A_A_A` (posicional con Grado) |

El resto de columnas (fechas, coordinación, materia, etc.) **se ignoran** en v1.

**Regla:** cada **fila no vacía = una clase**. Las multigrado (`Grado="3_4_5_6"`, `Grupo="A_A_A_A"`) son **una sola clase**.
El **docente dueño** de las clases NO se toma de la columna `Docente` del Excel (esa es la DA): se toma del **docente logueado** en el Onboarding (el DR). Al subir el Excel, todas las clases quedan asociadas a ese DR.

## 2. Decodificación del RUEE
El RUEE tiene 7 dígitos: **4 de prefijo de departamento** + **3 de número de escuela**.
```
1103029  →  prefijo 1103 (Canelones) + escuela 029 → "Canelones · Escuela 29"
```
```ts
// src/lib/ruee.ts
export const DEPARTAMENTOS: Record<string,string> = {
  "1101":"Montevideo","1102":"Artigas","1103":"Canelones","1104":"Cerro Largo",
  "1105":"Colonia","1106":"Durazno","1107":"Flores","1108":"Florida",
  "1109":"Lavalleja","1110":"Maldonado","1111":"Paysandú","1112":"Río Negro",
  "1113":"Rivera","1114":"Rocha","1115":"Salto","1116":"San José",
  "1117":"Soriano","1118":"Tacuarembó","1119":"Treinta y Tres",
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
```

## 3. Identificador estable de clase (claseId)
Debe ser **determinístico** para que el link no cambie al re-subir el Excel. Se arma con RUEE + grado + grupo (sin `_`, en minúsculas):
```ts
// src/lib/clase.ts
export function claseId(ruee: string, grado: string, grupo: string) {
  const g = String(grado).replace(/_/g, "");        // "3_4_5_6" -> "3456"
  const u = String(grupo).replace(/_/g, "").toLowerCase(); // "A_A_A_A" -> "aaaa"
  return `${String(ruee).trim()}-${g}-${u}`;         // "1103029-3456-aaaa"
}
```
Ejemplos:
- Silvana, Canelones 029, `3_4_5_6 / A_A_A_A` → `1103029-3456-aaaa`
- Cecilia 5º A, Paysandú 008 → `1111008-5-a`
- Carolina 4º A, Paysandú 008 → `1111008-4-a` (distinto de la anterior, misma escuela)

## 4. Label legible de la clase
```ts
export function claseLabel(dep: string, escuela: number, grado: string, grupo: string) {
  const grados = String(grado).split("_");
  const grupos = String(grupo).split("_");
  const base = `${dep} · Escuela ${escuela}`;
  if (grados.length === 1) return `${base} · ${grados[0]}º ${grupos[0]}`;
  // multigrado
  const pares = grados.map((gr, i) => `${gr}º${grupos[i] ?? ""}`).join(" ");
  return `${base} · Multigrado (${pares})`;
}
// "Canelones · Escuela 29 · Multigrado (3ºA 4ºA 5ºA 6ºA)"
```

## 5. Esquema Supabase (SQL — correr en el SQL Editor)
```sql
-- Clases (una fila por clase del docente)
create table if not exists clases (
  id            text primary key,          -- claseId estable
  docente       text not null,             -- DR logueado (dueño)
  ruee          text not null,
  departamento  text not null,
  escuela       int  not null,
  grado         text not null,
  grupo         text not null,
  maestra       text,                       -- columna "Docente" del Excel (DA), opcional
  label         text not null,
  created_at    timestamptz default now()
);

-- Progreso: una fila por figurita desbloqueada de cada clase
create table if not exists progreso (
  clase_id     text not null references clases(id) on delete cascade,
  figurita     int  not null,               -- 1..10
  unlocked_at  timestamptz default now(),
  primary key (clase_id, figurita)
);

-- Realtime en progreso
alter publication supabase_realtime add table progreso;

-- Políticas permisivas (sin auth; nada sensible)
alter table clases   enable row level security;
alter table progreso enable row level security;
create policy "clases_all"   on clases   for all using (true) with check (true);
create policy "progreso_all" on progreso for all using (true) with check (true);
```

## 6. Operaciones
**Al subir el Excel (docente):** por cada fila no vacía → `upsert` en `clases` con `id = claseId(...)`, `docente = <DR logueado>`. `upsert` (onConflict `id`) hace la carga **idempotente**: re-subir NO duplica ni borra el progreso (que vive en `progreso`).

**Listar clases del docente:** `select * from clases where docente = <DR>`. Para el progreso: `select clase_id, count(*) from progreso where clase_id in (...) group by clase_id` (o subscribirse a realtime).

**Desbloquear figurita (estudiante):** `upsert` en `progreso` `(clase_id, figurita)`. Idempotente (si ya estaba, no pasa nada).

**Álbum en vivo:** al abrir `#/clase/:claseId`, `select figurita from progreso where clase_id = :claseId`, y **subscribe** al canal realtime filtrando por `clase_id` para recibir nuevos desbloqueos.
```ts
supabase.channel(`progreso:${claseId}`)
  .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'progreso', filter: `clase_id=eq.${claseId}` },
      (payload) => { /* agregar figurita desbloqueada al estado */ })
  .subscribe();
```
