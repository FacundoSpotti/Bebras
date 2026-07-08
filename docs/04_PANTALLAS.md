# 04 · PANTALLAS

Son **3 pantallas** + un **modal**. Router por hash.

---

## 1. Onboarding — `#/`
Pantalla de entrada. Marca THEA (usar logo corto `Property 1=…svg`, elegir el color que contraste con el fondo).

**Contenido:**
- Logo THEA + título "Álbum Bebras 2026".
- Dos opciones grandes: **Soy estudiante** / **Soy docente**.

**Si elige Estudiante:**
- Como el acceso normal es por el **link de la clase**, esta rama es un *fallback* para quien cae en la raíz.
- Mostrar un campo "Código de tu clase" (o "pegá el link que te dio tu docente") + botón "Entrar".
- Al enviar, navegar a `#/clase/<codigo>`. Si el código no existe en `clases`, mostrar mensaje amable: "No encontramos esa clase. Pedile el link a tu docente."

**Si elige Docente:**
- `select` con los **nombres precargados** (ver `05_CONTENIDO.md`).
- Campo de **clave maestra** (única para todos).
- Botón "Entrar". Validación: nombre elegido + `clave === CLAVE_MAESTRA`.
- Si es correcto: guardar en memoria/sessionStorage el docente activo y navegar a `#/docente`. Si no: mensaje "Clave incorrecta".

---

## 2. Álbum (estudiante) — `#/clase/:claseId`
Es lo que ve la clase. Basado en el prototipo (imagen `Prototipo.jpg`).

**Cabecera (nav negra):**
- Izquierda: logo THEA (`logotipo.svg`).
- Derecha: identificación de la clase (ej. "Canelones, Escuela 29 · 4º A") tomada del `label` de la clase.

**Bloque título + progreso:**
- "ALBUM BEBRAS 2026 / DESAFÍOS DE INGENIO".
- Contador `X/10` (figuritas pegadas).
- Barra de progreso segmentada de 10 tramos (rellena las desbloqueadas).

**Grilla de 10 figuritas** (5 columnas × 2 filas en desktop; responsive a 2/1 columnas en mobile):
- **Figurita bloqueada:** tarjeta con cabecera de color (`PAÍS` a la izquierda, badge `DIFICULTAD` a la derecha), cuerpo gris con "FIGURITA 0N", y footer con `TÍTULO`. Aspecto de hueco por completar. Cursor pointer.
- **Figurita desbloqueada:** muestra la **imagen del país** (`assets/figuritas/<Pais>.png`), con un pequeño estado "pegada" (cinta / check). Ya no abre desafío.
- Click en una **bloqueada** → abre el **Modal de desafío**.

**Estado en vivo:** suscripción realtime a `progreso` de esa clase. Si otro estudiante desbloquea una figurita, se actualiza sola (animación de "pegado").

**Al completar 10/10:** mostrar **Felicitación** (pantalla 4).

---

## 3. Modal de desafío (dentro del Álbum)
Se abre sobre la misma pantalla al clickear una figurita bloqueada.

**Contenido:**
- Encabezado: país + nº de figurita + dificultad.
- **Imagen del desafío** (`assets/desafios/0N.png`) — es el enunciado Bebras.
- **Opciones múltiples** (botones A/B/C/D o el set configurado). Ver `05_CONTENIDO.md`.
- Botón cerrar (X).

**Al responder:**
- **Correcta:** desbloquear → `upsert` en `progreso` (clase_id, figurita) → animación de figurita "pegada" → cerrar modal → actualizar barra/contador. Si llega a 10/10 → Felicitación.
- **Incorrecta:** iniciar **cooldown de 5 minutos** para **esa** figurita en **este dispositivo** (localStorage). Mensaje: "Ups, no era esa. Podés seguir con otro desafío y volver en 5 minutos." Deshabilitar el botón de responder de esa figurita y mostrar cuenta regresiva. El estudiante cierra y sigue con otras.

**Reglas del cooldown (`src/lib/cooldown.ts`):**
- Clave: `cooldown::<claseId>::<figurita>` = timestamp (ms) de fin (`Date.now() + 5*60*1000`).
- Al abrir el modal de una figurita en cooldown: mostrar la cuenta regresiva y **no** permitir responder hasta que expire.
- Es **por dispositivo** (localStorage), independiente del desbloqueo (que es compartido). Un error de un estudiante **no** frena a los demás.
- **Intentos infinitos**, siempre con 5 min entre intento fallido y el siguiente, por figurita.
- Persistente entre recargas (se guarda el timestamp, al volver se calcula lo que resta).
- Si la figurita ya fue desbloqueada por la clase mientras estaba en cooldown, se muestra como pegada (el desbloqueo compartido gana).

---

## 4. Felicitación (álbum completo)
- Se muestra al llegar a 10/10.
- Mensaje de felicitación a la clase (tono alegre, sin competencia; alineado a Bebras: "lo importante es haber participado").
- **Espacio para el premio** (placeholder): dejar un componente/section claramente marcado `// PREMIO: definir` para completar después (imagen, código, certificado, etc.).

---

## 5. Panel Docente — `#/docente`
Simple. Requiere haber pasado el login (si no hay docente activo → redirigir a `#/`).

**Contenido:**
- Saludo con el nombre del docente (DR) activo.
- **Subir Excel:** input de archivo `.xlsx`. Al subir: parsear (SheetJS), decodificar RUEE, derivar claseId + label, `upsert` en `clases` con `docente = <DR activo>`. Feedback: "N clases cargadas".
- **Lista de clases** del docente (`where docente = <DR>`):
  - Por clase: `label`, progreso `X/10` (contador o mini-barra), y el **link de la clase** (`#/clase/<claseId>`) con botón **Copiar link**.
  - Progreso idealmente **en vivo** (realtime) o al menos refrescable con un botón.
- Botón "Salir" (limpia el docente activo, vuelve a `#/`).

**Notas:**
- Si el docente sube el Excel de nuevo, las clases se actualizan sin perder el progreso (upsert por `id`; el progreso vive en otra tabla).
- No hay seguridad real: cualquiera con la clave maestra entra. Es intencional.
