# 00 · PROMPT PARA CLAUDE CODE (Antigravity)

> Pegá este prompt en Claude Code, con los archivos `docs/01_PRD.md` … `docs/05_CONTENIDO.md` presentes en el repo. Antes de correr, dejá los assets en `public/assets/` (logos y `figuritas/`; `desafios/` puede ir después).

---

Sos un ingeniero frontend senior. Vas a construir una app web completa siguiendo **al pie de la letra** la especificación en `docs/01_PRD.md`, `docs/02_ARQUITECTURA.md`, `docs/03_MODELO_DATOS.md`, `docs/04_PANTALLAS.md` y `docs/05_CONTENIDO.md`. El esquema de base de datos ya está listo en `docs/supabase_schema.sql` (esquema + seed de prueba). Leé todos los `.md` antes de escribir código y respetá los nombres de archivos, rutas y esquemas que ahí se definen.

## Resumen ejecutable
- **App:** "Álbum Bebras 2026" para THEA. Álbum de figuritas digital que una **clase entera** desbloquea en conjunto resolviendo 10 desafíos Bebras de opción múltiple.
- **Stack:** Vite + React + TypeScript. Persistencia y tiempo real con **Supabase** (`@supabase/supabase-js`). Parseo de Excel con **SheetJS (`xlsx`)**. Deploy en Vercel (build estático, sin serverless propio). **Router por hash.**
- **3 pantallas + 1 modal:** Onboarding (`#/`), Álbum por clase (`#/clase/:claseId`), Panel Docente (`#/docente`), y Modal de Desafío dentro del álbum.

## Requisitos que NO podés equivocar
1. **claseId estable** = `${ruee}-${grado sin "_"}-${grupo sin "_" en minúsculas}` (ver `03_MODELO_DATOS.md`). Los links de clase dependen de esto y no deben cambiar al re-subir el Excel.
2. **RUEE:** 4 dígitos de departamento + 3 de escuela. Usar la tabla `DEPARTAMENTOS` de `03_MODELO_DATOS.md`.
3. **Cada fila no vacía del Excel = una clase.** Multigrado (`3_4_5_6` / `A_A_A_A`) es **una** clase. Ignorar filas vacías. El **dueño** de las clases es el **docente logueado** (DR), no la columna `Docente` del Excel (esa es la maestra de aula → guardar como `maestra`, opcional).
4. **Álbum compartido por clase y en tiempo real:** el desbloqueo se guarda en Supabase (`progreso`) y se propaga por Realtime a todos los que tengan abierta esa clase y al Panel Docente.
5. **Cooldown = 5 min por figurita, por dispositivo, en `localStorage`.** Independiente del desbloqueo compartido. Intentos infinitos con 5 min entre fallos. Persistente entre recargas (guardar timestamp de fin).
6. **`upsert` idempotente:** re-subir el Excel no duplica clases ni borra progreso.
7. **Sin auth real:** login docente = `select` de nombres + `CLAVE_MAESTRA` (constante). RLS permisivo. No poner datos sensibles.

## Pasos
1. Scaffolding Vite + React + TS. Instalar `@supabase/supabase-js` y `xlsx`.
2. Crear la estructura de `02_ARQUITECTURA.md`. Implementar `lib/` (`supabase`, `ruee`, `excel`, `clase`, `cooldown`) y `config/` (`desafios`, `docentes`) tal como están especificados; podés copiar los snippets de los docs.
3. Implementar las 3 pantallas + modal + felicitación según `04_PANTALLAS.md`, respetando el layout del prototipo (imagen de referencia: cabecera negra con logo + clase, título + barra de progreso de 10 tramos, grilla 5×2 de figuritas, tarjeta con PAÍS/DIFICULTAD/FIGURITA 0N/TÍTULO).
4. Realtime: al abrir un álbum, cargar `progreso` de la clase y suscribirse a INSERTs filtrados por `clase_id`.
5. Panel docente: subir Excel → parsear → `upsert` en `clases` con `docente` = DR logueado → listar clases con progreso (en vivo) + link copiable por clase.
6. Estados vacíos y de error con copy claro y amable (ver tono en `05_CONTENIDO.md`). Responsive (mobile: grilla a 2/1 columnas), foco de teclado visible, `prefers-reduced-motion` respetado.
7. Incluir `.env.example` y un `README.md` con los pasos de Supabase + Vercel. **NO reescribas el SQL**: usá el archivo ya provisto `docs/supabase_schema.sql` (referencialo desde el README como "pegar en Supabase → SQL Editor"). Ese archivo ya trae el esquema + un seed de prueba.
8. **Seed de prueba:** el proyecto tiene que funcionar de una con el seed de `docs/supabase_schema.sql` (clase de ejemplo `1103029-3456-aaaa`, "Canelones · Escuela 29", con 4/10 figuritas pegadas). Documentá en el README cómo probar: abrir `#/clase/1103029-3456-aaaa` (debe verse el álbum con 4/10) y loguearse como docente **Facundo** para ver esa clase en el panel. No hardcodees el seed en el código de la app: vive solo en el SQL.
9. No romper si faltan imágenes de `assets/desafios/` (placeholder) ni si un país de `desafios.ts` no tiene imagen (fallback visual).

## Entregable
Proyecto que corre con `npm run dev` y buildea con `npm run build`. Con las variables de Supabase seteadas, el flujo completo debe funcionar: docente sube Excel → obtiene links → estudiante abre el link → resuelve → figurita se pega para toda la clase en vivo → al completar 10/10 aparece la felicitación (con placeholder de premio).

Al terminar, dejá una lista de TODOs pendientes del humano (los de la checklist de `05_CONTENIDO.md`: imágenes de desafíos, respuestas correctas, clave maestra, proyecto Supabase, premio).
