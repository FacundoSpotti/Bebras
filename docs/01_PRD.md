# 01 · PRD — Álbum Bebras 2026 (THEA)

## Qué es
Aplicación web para el **Desafío Bebras 2026** de Pensamiento Computacional (Ceibal / THEA). Un **álbum de figuritas digital, edición mundialista**, que una **clase completa** va desbloqueando en conjunto resolviendo desafíos. Cada figurita se "pega" cuando se responde correctamente su desafío.

Marca: **THEA — the electric academy**.

## Objetivo de producto
- Que los estudiantes de una clase resuelvan los 10 desafíos Bebras de forma motivadora (gamificación tipo álbum de figuritas), sin nota ni competencia.
- Que el docente remoto (DR) controle el progreso de cada una de sus clases en tiempo real y reparta un link por clase.

## Alcance (v1)
- **Solo 3 pantallas** (ver `04_PANTALLAS.md`): Onboarding, Álbum (estudiante), Panel docente.
- 10 figuritas / 10 desafíos, **los mismos para todas las clases** en esta versión.
- Respuestas siempre de **opción múltiple**.
- Álbum **compartido por clase** y **en tiempo real** (todos ven el mismo avance).
- Sin sistema de cuentas real: el login docente es un `select` de nombres + una **clave maestra única**. No hay datos sensibles.
- Deploy en **Vercel**, sin servidor propio; la persistencia y el tiempo real los da **Supabase** (plan gratuito).

## Fuera de alcance (v1)
- El premio final concreto (se define después): dejar una pantalla de felicitación con un espacio/placeholder para el premio.
- Autenticación real, roles avanzados, panel de administración.
- Edición de desafíos desde la UI (los desafíos se configuran en código, ver `05_CONTENIDO.md`).

## Roles
- **Estudiante:** entra por el **link de su clase** (se lo pasa el docente). Ve el álbum de su clase, abre desafíos, responde y desbloquea figuritas. No inicia sesión.
- **Docente (DR):** entra por Onboarding → elige su nombre + clave maestra → **sube su Excel** → ve la lista de sus clases con progreso y el link de cada una.

## Flujo general (ver diagrama USERFLOW)
```
                         ┌──────────────┐
                         │  ONBOARDING  │
                         └──────┬───────┘
              Estudiante ┌──────┴───────┐ Docente (+clave maestra)
                         ▼              ▼
                 ┌──────────────┐  ┌──────────────────┐
                 │  ÁLBUM CLASE │  │  PANEL DOCENTE   │
                 │ (por link)   │  │ - sube Excel     │
                 │ - hacer      │  │ - lista clases   │
                 │   desafíos   │  │ - progreso vivo  │
                 │ - guardado   │  │ - link por clase │
                 │   automático │  └──────────────────┘
                 └──────┬───────┘
                        │  se actualiza en tiempo real
                        └────────────► (visible en Panel Docente)
```

## Criterios de aceptación (resumen)
1. Un docente sube su Excel y aparecen **exactamente sus clases** (una por fila; multigrado = una sola clase).
2. Cada clase tiene un **link estable** (no cambia si el docente vuelve a subir el Excel).
3. Abrir el link de una clase muestra el álbum de esa clase con el progreso actual.
4. Responder bien un desafío desbloquea la figurita **para toda la clase** y se refleja en vivo en otros dispositivos y en el panel docente.
5. Responder mal inicia un **cooldown de 5 minutos por dispositivo** para esa figurita; el estudiante puede seguir con otras.
6. Al completar las 10, se muestra la **felicitación** (con espacio para el premio).
7. Todo corre en Vercel; la data vive en Supabase.
