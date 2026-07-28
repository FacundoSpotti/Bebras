-- ============================================================
-- Álbum Bebras 2026 · Esquema Supabase
-- Pegar TODO esto en Supabase → SQL Editor → Run.
-- Idempotente: se puede volver a correr sin romper nada.
-- ============================================================

-- ---------- TABLAS ----------
create table if not exists clases (
  id              text primary key,          -- claseId estable: "1103029-3456-aaaa"
  docente         text not null,             -- DR logueado (dueño de la clase)
  ruee            text not null,
  departamento    text not null,
  escuela         int  not null,
  grado           text not null,
  grupo           text not null,
  maestra         text,                       -- columna "Docente" del Excel (DA), opcional
  label           text not null,
  modo_individual boolean not null default false, -- false = álbum colectivo (default)
  created_at      timestamptz default now()
);

-- Una fila por figurita desbloqueada. `autor` = nombre del estudiante que la
-- pegó (el que guarda su navegador). Forma parte de la clave primaria para
-- que en MODO INDIVIDUAL cada estudiante tenga su propia figurita sin pisar
-- la de un compañero. En modo colectivo alcanza con que exista una fila.
create table if not exists progreso (
  clase_id     text not null references clases(id) on delete cascade,
  figurita     int  not null,               -- 1..40
  autor        text not null default '',    -- estudiante que la pegó (scoreboard)
  unlocked_at  timestamptz default now(),
  primary key (clase_id, figurita, autor)
);

-- ---------- MIGRACIONES (para bases que ya existían) ----------
-- Se pueden correr varias veces y NO borran progreso.

-- 1) Scoreboard: quién pegó cada figurita.
alter table progreso add column if not exists autor text;

-- 2) Modo individual por clase. Las clases que ya están en uso quedan en
--    modo colectivo (false), así no cambia nada de lo que ya funciona.
alter table clases add column if not exists modo_individual boolean not null default false;

-- 3) Clave primaria por estudiante: habilita que dos estudiantes de la misma
--    clase tengan la misma figurita cuando el modo es individual.
update progreso set autor = '' where autor is null;
alter table progreso alter column autor set default '';
alter table progreso alter column autor set not null;
do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu
      on tc.constraint_name = kcu.constraint_name
    where tc.table_name = 'progreso' and tc.constraint_type = 'PRIMARY KEY'
    group by tc.constraint_name
    having count(*) = 2      -- PK vieja: (clase_id, figurita)
  ) then
    alter table progreso drop constraint progreso_pkey;
    alter table progreso add constraint progreso_pkey primary key (clase_id, figurita, autor);
  end if;
end $$;

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

insert into progreso (clase_id, figurita, autor) values
  ('1103029-3456-aaaa', 1, 'Martina'),
  ('1103029-3456-aaaa', 2, 'Bruno'),
  ('1103029-3456-aaaa', 3, 'Sofía'),
  ('1103029-3456-aaaa', 4, 'Thiago')
on conflict (clase_id, figurita, autor) do nothing;

-- Link para probar el álbum de esa clase:
--   https://<tu-proyecto>.vercel.app/#/clase/1103029-3456-aaaa
-- (o en local: http://localhost:5173/#/clase/1103029-3456-aaaa)

-- ---------- Para limpiar el seed cuando quieras ----------
-- delete from clases where id = '1103029-3456-aaaa';   -- borra también su progreso (cascade)
