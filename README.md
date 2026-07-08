# Álbum Bebras 2026 · THEA

Álbum de figuritas digital para el **Desafío Bebras 2026** (Ceibal / THEA).
Una **clase entera** desbloquea las 10 figuritas en conjunto resolviendo
desafíos Bebras de opción múltiple. El avance es **compartido y en tiempo
real**: cuando alguien pega una figurita, la ven todos.

- **Stack:** Vite + React + TypeScript · Supabase (Postgres + Realtime) · SheetJS (`xlsx`) · Vercel.
- **Router por hash:** `#/` (Onboarding) · `#/clase/:claseId` (Álbum) · `#/docente` (Panel Docente).
- Especificación completa en [docs/](docs/).

## 1. Setup de Supabase

1. Crear un proyecto gratuito en [supabase.com](https://supabase.com).
2. Abrir **SQL Editor** y pegar **todo** el contenido de
   [`docs/supabase_schema.sql`](docs/supabase_schema.sql) → **Run**.
   Crea las tablas `clases` y `progreso`, habilita Realtime, deja las
   políticas permisivas y carga un **seed de prueba**.
3. En **Project Settings → API**, copiar **Project URL** y **anon public key**.

> La anon key es pública y las políticas RLS son permisivas a propósito:
> no hay datos sensibles en estas tablas. No guardes nada privado ahí.

## 2. Correr en local

```bash
npm install
cp .env.example .env.local   # completar con URL + anon key de Supabase
npm run dev
```

Abrir http://localhost:5173.

### Probar con el seed

El SQL ya deja creada una clase de ejemplo con 4/10 figuritas pegadas:

1. **Álbum:** abrir `http://localhost:5173/#/clase/1103029-3456-aaaa`.
   Se ve "Canelones · Escuela 29 · Multigrado (3ºA 4ºA 5ºA 6ºA)" con **4/10**.
2. **Panel docente:** en `#/`, elegir **Soy docente** → nombre **Facundo** +
   la clave maestra (`CLAVE_MAESTRA` en `src/config/docentes.ts`). La clase
   del seed aparece en la lista con su progreso y el botón **Copiar link**.
3. **Tiempo real:** abrir el álbum en dos pestañas y responder un desafío en
   una; la figurita se pega sola en la otra (y el contador del panel se
   actualiza en vivo).

Para borrar el seed: `delete from clases where id = '1103029-3456-aaaa';`
(al final de `docs/supabase_schema.sql` está comentado).

## 3. Deploy en Vercel

1. Push a GitHub → **Import** en Vercel.
2. Framework preset: **Vite** (build `vite build`, output `dist`). Sin
   funciones serverless ni rewrites (el router es por hash).
3. En **Project Settings → Environment Variables**, cargar:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy. Link de clase de ejemplo:
   `https://<proyecto>.vercel.app/#/clase/1103029-3456-aaaa`

## 4. Flujo de uso

1. El docente (DR) entra por `#/` → **Soy docente** → nombre + clave maestra.
2. En el panel sube su **Excel** de clases (una fila no vacía = una clase;
   multigrado `3_4_5_6 / A_A_A_A` = una sola clase). El `upsert` es
   idempotente: re-subir el Excel no duplica clases ni borra progreso.
3. Copia el **link de cada clase** y lo comparte con los estudiantes.
4. Los estudiantes abren el link, resuelven desafíos y las figuritas se
   pegan **para toda la clase**, en vivo. Respuesta incorrecta → cooldown de
   **5 minutos por figurita, por dispositivo** (localStorage).
5. Al llegar a 10/10 aparece la **felicitación** (con placeholder de premio).

## 5. Configuración en código

| Qué | Dónde |
|---|---|
| Desafíos, opciones y respuesta correcta | `src/config/desafios.ts` |
| Docentes habilitados + clave maestra | `src/config/docentes.ts` |
| Tabla de departamentos (RUEE) | `src/lib/ruee.ts` |
| Imágenes de figuritas | `public/assets/figuritas/<Pais>.png` |
| Imágenes de enunciados | `public/assets/desafios/01.png … 10.png` |

Si falta la imagen de un enunciado o de una figurita, la app **no se rompe**:
muestra un placeholder / fallback visual.

## TODOs pendientes (humano)

- [ ] Exportar las 10 tarjetas Bebras a `public/assets/desafios/01.png … 10.png`.
- [ ] Verificar las **respuestas correctas** y la cantidad de opciones de cada
      desafío contra las tarjetas reales (los desafíos 1 y 6 son A–F).
- [ ] Setear la `CLAVE_MAESTRA` real en `src/config/docentes.ts`.
- [ ] Crear el proyecto Supabase y cargar las variables de entorno (local y Vercel).
- [ ] Definir el **premio final** en `src/components/Felicitacion.tsx` (buscar `PREMIO: definir`).
- [ ] Borrar el seed de prueba de Supabase cuando ya no haga falta.
