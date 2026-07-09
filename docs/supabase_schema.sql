-- ============================================================
-- Álbum Bebras 2026 · Esquema Supabase
-- Pegar TODO esto en Supabase → SQL Editor → Run.
-- Idempotente: se puede volver a correr sin romper nada.
-- ============================================================

-- ---------- TABLAS ----------
create table if not exists clases (
  id            text primary key,          -- claseId estable: "1103029-3456-aaaa"
  docente       text not null,             -- DR logueado (dueño de la clase)
  ruee          text not null,
  departamento  text not null,
  escuela       int  not null,
  grado         text not null,
  grupo         text not null,
  maestra       text,                       -- columna "Docente" del Excel (DA), opcional
  label         text not null,
  created_at    timestamptz default now()
);

create table if not exists progreso (
  clase_id     text not null references clases(id) on delete cascade,
  figurita     int  not null,               -- 1..10
  autor        text,                        -- nombre del estudiante que la pegó (scoreboard)
  unlocked_at  timestamptz default now(),
  primary key (clase_id, figurita)
);

-- Migración para bases creadas antes del scoreboard (no rompe si ya existe):
alter table progreso add column if not exists autor text;

-- ---------- REALTIME ----------
-- Publica cambios de 'progreso' para las suscripciones en vivo del álbum y del panel docente.
alter publication supabase_realtime add table progreso;

-- ---------- POLÍTICAS (sin auth; nada sensible) ----------
alter table clases   enable row level security;
alter table progreso enable row level security;

drop policy if exists "clases_all"   on clases;
drop policy if exists "progreso_all" on progreso;

create policy "clases_all"   on clases   for all using (true) with check (true);
create policy "progreso_all" on progreso for all using (true) with check (true);

-- ============================================================
-- SEED DE PRUEBA (opcional) — reproduce el prototipo:
-- Canelones · Escuela 29 · Multigrado, con 4/10 figuritas pegadas.
-- Borralo cuando ya no lo necesites (ver DELETE al final).
-- ============================================================
insert into clases (id, docente, ruee, departamento, escuela, grado, grupo, maestra, label)
values (
  '1103029-3456-aaaa', 'Facundo', '1103029', 'Canelones', 29,
  '3_4_5_6', 'A_A_A_A', 'Silvana',
  'Canelones · Escuela 29 · Multigrado (3ºA 4ºA 5ºA 6ºA)'
)
on conflict (id) do nothing;

insert into progreso (clase_id, figurita) values
  ('1103029-3456-aaaa', 1),
  ('1103029-3456-aaaa', 2),
  ('1103029-3456-aaaa', 3),
  ('1103029-3456-aaaa', 4)
on conflict (clase_id, figurita) do nothing;

-- Link para probar el álbum de esa clase:
--   https://<tu-proyecto>.vercel.app/#/clase/1103029-3456-aaaa
-- (o en local: http://localhost:5173/#/clase/1103029-3456-aaaa)

-- ---------- Para limpiar el seed cuando quieras ----------
-- delete from clases where id = '1103029-3456-aaaa';   -- borra también su progreso (cascade)
