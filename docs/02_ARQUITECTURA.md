# 02 · ARQUITECTURA

## Stack
- **Frontend:** Vite + React (JavaScript o TypeScript, preferible TS). SPA.
- **Estilos:** CSS plano o CSS Modules. Sin librerías de UI pesadas. Fuentes vía Google Fonts.
- **Persistencia + tiempo real:** **Supabase** (Postgres + Realtime + JS client `@supabase/supabase-js`). Todo desde el navegador con la **anon key**.
- **Hosting:** **Vercel** (build estático de Vite). No hay funciones serverless propias: el "backend" es Supabase.
- **Cooldown:** `localStorage` (por dispositivo, no va a Supabase).

> Nota de seguridad (aceptada): la anon key es pública y las políticas RLS son permisivas (lectura/escritura anónima en las tablas del proyecto). Es intencional: no hay datos sensibles. No poner nada privado en estas tablas.

## Estructura de carpetas sugerida
```
album-bebras/
├─ index.html
├─ package.json
├─ vite.config.ts
├─ .env.local                 # NO commitear (ver variables abajo)
├─ .env.example
├─ public/
│  └─ assets/                 # ← acá van los assets que ya existen
│     ├─ logotipo.svg                 # logo del nav (THEA)
│     ├─ Property 1=Negro.svg         # logo corto (onboarding)
│     ├─ Property 1=Blanco.svg
│     ├─ Property 1=Default.svg
│     ├─ figuritas/                   # imagen de cada figurita, por país
│     │  ├─ Alemania.png ... etc.
│     └─ desafios/                    # imagen de cada desafío (1..10) — POR CARGAR
│        ├─ 01.png ... 10.png
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx                 # router por hash
│  ├─ lib/
│  │  ├─ supabase.ts          # cliente supabase
│  │  ├─ ruee.ts              # decodificación RUEE + tabla departamentos
│  │  ├─ excel.ts             # parseo del Excel (SheetJS)
│  │  ├─ clase.ts             # derivación de claseId + label
│  │  └─ cooldown.ts          # manejo de cooldown en localStorage
│  ├─ config/
│  │  ├─ desafios.ts          # los 10 desafíos + opciones + respuesta correcta
│  │  ├─ docentes.ts          # lista de docentes + CLAVE_MAESTRA
│  ├─ screens/
│  │  ├─ Onboarding.tsx
│  │  ├─ Album.tsx            # vista estudiante (por clase)
│  │  └─ PanelDocente.tsx
│  └─ components/
│     ├─ Figurita.tsx
│     ├─ ModalDesafio.tsx
│     ├─ BarraProgreso.tsx
│     └─ Felicitacion.tsx
└─ docs/                      # estos .md
```

## Ruteo (sin backend → router por hash)
Vercel sirve estáticos; para no configurar rewrites usar **hash routing**:
- `#/` → **Onboarding**
- `#/clase/:claseId` → **Álbum** de esa clase (este es el link que se comparte a estudiantes)
- `#/docente` → **Panel Docente** (requiere haber pasado el login en Onboarding; si no, redirige a `#/`)

Ejemplo de link de clase: `https://<proyecto>.vercel.app/#/clase/1103029-3456-aaaa`

## Variables de entorno
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
En Vercel: Project → Settings → Environment Variables (mismas dos). En local: `.env.local`.

## Setup de Supabase (pasos, fácil)
1. Crear proyecto gratis en supabase.com.
2. En **SQL Editor**, correr el script de `03_MODELO_DATOS.md` (crea tablas `clases` y `progreso`, habilita Realtime y políticas permisivas).
3. En **Project Settings → API**, copiar **Project URL** y **anon public key** → poner en las variables de entorno.
4. Verificar que Realtime esté activado para la tabla `progreso` (el script lo deja listo).

## Deploy en Vercel
1. `npm create vite@latest` (React + TS), `npm i @supabase/supabase-js xlsx`.
2. Push a GitHub → importar en Vercel.
3. Framework preset: **Vite**. Build: `vite build`. Output: `dist`.
4. Cargar las 2 variables de entorno.
5. Deploy. No se necesitan serverless functions ni rewrites (hash routing).

## Dependencias clave
- `@supabase/supabase-js` — cliente + realtime.
- `xlsx` (SheetJS) — parseo del Excel del docente en el navegador.
