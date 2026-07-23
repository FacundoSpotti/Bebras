# Guía de contexto — Álbum Bebras 2026

> Documento de referencia para diseñar la **guía docente en PDF apaisado**.
> Todo lo que sigue está **verificado contra el código y la app corriendo**
> (no hay suposiciones). Los textos de interfaz están transcriptos **literales**,
> con tildes y signos. Las capturas viven en `docs/capturas/` (sección 11).

---

## 1. Qué es la app

**Álbum Bebras 2026** es un **álbum de figuritas digital** para el Desafío
Bebras de Pensamiento Computacional (Ceibal / THEA — the electric academy).
Una **clase entera** desbloquea en conjunto **10 figuritas** resolviendo 10
desafíos Bebras de **opción múltiple**. El avance es **compartido por clase y
en tiempo real**: cuando alguien acierta un desafío, la figurita se "pega"
para toda la clase y aparece al instante en los demás dispositivos. No hay
nota ni competencia; la meta es completar el álbum entre todos.

Es una web (Vite + React + Supabase, deploy en Vercel) con **router por hash**
y **tres pantallas** + un modal de desafío + una pantalla de felicitación.

---

## 2. Roles

### Docente (DR = docente remoto)
- Entra por la pantalla de inicio → **Soy docente** → elige su nombre + **clave maestra**.
- **Sube su Excel** de clases (o agrega clases **manualmente**).
- Ve la **lista de sus clases** con el progreso `X/10` en vivo.
- Copia el **link** o el **código** de cada clase para repartir a sus estudiantes.
- Ve, en vivo, qué **estudiantes están conectados** a cada álbum (tipo Kahoot).
- Puede **eliminar** una clase.

### Estudiante / clase
- Entra por el **link** (o pega el **código**) que le da el docente.
- La primera vez escribe **su nombre** (queda guardado en ese dispositivo).
- Ve el **álbum de su clase** con las 10 figuritas y el progreso actual.
- Abre una figurita bloqueada → resuelve el desafío de opción múltiple.
- Si acierta, la figurita se **pega para toda la clase**; si falla, espera **5 minutos**.
- Ve el **scoreboard** de quién pegó cada figurita.
- No inicia sesión ni tiene cuenta.

---

## 3. Flujo del DOCENTE (paso a paso)

1. **Abrir la app.** Ve la pantalla de inicio (`#/`) con el título
   **"ÁLBUM BEBRAS 2026"**, el subtítulo **"Desafíos de ingenio para
   completar entre toda la clase."** y dos tarjetas:
   **"Soy estudiante"** ("Entrá con el link o código de tu clase") y
   **"Soy docente"** ("Subí tu Excel y gestioná tus clases"). → *Captura 01.*

2. **Elegir "Soy docente".** Aparece el formulario:
   - **"Tu nombre"**: menú desplegable con los docentes precargados.
   - **"Clave maestra"**: campo de contraseña (placeholder
     *"La clave compartida del equipo"*).
   - Botón **"Entrar"**. Si la clave está mal: mensaje **"Clave incorrecta"**.
   → *Captura 02.*

3. **Entrar al panel** (`#/docente`). Saludo **"¡Hola, <Nombre>!"** y botón
   **"Salir"**. Al principio, sin clases, la sección "Tus clases" muestra:
   *"Todavía no tenés clases cargadas. Subí tu Excel acá arriba y van a
   aparecer todas juntas."* → *Captura 03.*

4. **Cargar clases.** Dos formas:
   - **Subir Excel** (sección *"Subir Excel de clases"*): botón de archivo
     `.xlsx`. Al terminar: *"N clases cargadas ✓"*. Cada fila no vacía se
     convierte en una clase (ver §6).
   - **Agregar una clase manualmente** (sección *"Agregar una clase
     manualmente"*): campos **RUEE**, **Grado**, **Grupo**,
     **Maestra (opcional)** y botón **"Agregar clase"**. Para multigrado se
     usan guiones bajos (grado `3_4_5_6`, grupo `A_A_A_A`).

5. **Ver la lista de clases** (sección *"Tus clases"*). Por cada clase:
   nombre legible, **Maestra: <nombre>** (si hay), **Código: `<claseId>`**,
   el progreso **`X/10`** con mini-barra, y los botones **"Copiar link"**,
   **"Copiar código"** y **"Eliminar"**. → *Capturas 04 y 05.*

6. **Repartir el acceso.** El docente copia el **link** (se abre directo) o el
   **código** (el estudiante lo pega en "Soy estudiante"). El progreso de cada
   clase se actualiza **solo, en vivo**.

7. **Monitorear conexiones.** La sección *"Estudiantes conectados"* muestra,
   en vivo, quién tiene el álbum abierto. Si nadie está conectado:
   *"Nadie tiene el álbum abierto en este momento. Cuando un estudiante entre
   con el link o el código, aparece acá al instante."*

8. **Salir.** El botón **"Salir"** cierra la sesión y vuelve al inicio.

---

## 4. Flujo de la CLASE / ESTUDIANTE (paso a paso)

1. **Abrir el link de la clase** (`#/clase/<código>`). La primera vez pide el
   nombre: **"¡Hola!"**, *"Estás entrando al álbum de <clase>. Contanos tu
   nombre para saber quién pega cada figurita."*, campo **"Tu nombre"**
   (placeholder *"Escribí tu nombre"*) y botón **"Entrar al álbum"**.
   *(Alternativa: en el inicio, "Soy estudiante" → pegar link o código.)*

2. **Ver el álbum** (`#/clase/:claseId`). Cabecera negra con el logo THEA, el
   nombre de la clase y el nombre del estudiante. Debajo, el bloque
   **"ALBUM BEBRAS 2026 / DESAFÍOS DE INGENIO"**, el contador **`X/10`**, la
   etiqueta **"PROGRESO"** con barra de 10 tramos, y la **grilla de 10
   figuritas** (5×2 en desktop). → *Captura 06 (álbum vacío).*

3. **Abrir un desafío.** Al tocar una figurita **bloqueada** se abre el
   **modal**: encabezado con **"Figurita 0N"** + dificultad, título del
   desafío, la **imagen del enunciado** (con la ayuda *"Tocá la imagen para
   verla más grande"*), la pregunta **"¿Cuál es la respuesta?"** y los
   **botones de opción** (letras A–D / A–F o números, según el desafío).
   → *Captura 07.*

4. **Responder.**
   - **Correcta:** la figurita se **pega para toda la clase** (animación de
     celebración con confetti), el modal se cierra y el contador sube. En la
     figurita pegada dice **"✓ Pegada"** y **"la pegó <nombre>"**.
     → *Captura 08.*
   - **Incorrecta:** mensaje *"Ups, no era esa. Podés seguir con otro desafío
     y volver en 5 minutos."* y cuenta regresiva *"Podés volver a intentar en
     M:SS"*. La figurita queda **en pausa** (gris) en ese dispositivo.
     → *Captura 09.*

5. **Seguir con otras.** El estudiante puede resolver las demás figuritas
   mientras espera. El **scoreboard** ("SCOREBOARD DE LA CLASE") lista quién
   pegó cada figurita. → *Captura 10 (álbum 4/10).*

6. **Completar el álbum.** Al llegar a **10/10** aparece la **felicitación**:
   badge **"10/10"**, **"¡Álbum completo!"**, el mensaje de festejo y un
   espacio de **premio** (placeholder). Botón **"Ver el álbum"**.
   → *Capturas 11 (álbum completo) y 12 (felicitación).*

---

## 5. Reglas de funcionamiento

- **Álbum compartido por clase.** El progreso (qué figuritas están pegadas)
  vive en Supabase por `clase_id`. Todos los que abren el mismo link ven el
  **mismo** avance. Desbloquear una figurita la pega para **toda la clase**,
  no solo para quien respondió.

- **Tiempo real.** Al abrir el álbum se cargan las figuritas pegadas y se abre
  una suscripción en vivo. Cuando alguien acierta, aparece en los demás
  dispositivos al instante (con un aviso tipo *"<nombre> pegó la figurita 0N ·
  <país>"*) y el panel docente actualiza el contador solo.

- **Cooldown de 5 minutos.** Una respuesta incorrecta **no frena a la clase**:
  solo pone **esa** figurita en pausa **en ese dispositivo** durante 5
  minutos. Es **por dispositivo y por figurita**, con **intentos infinitos**
  (siempre 5 minutos entre un fallo y el siguiente). Persiste aunque se
  recargue la página (se guarda en el navegador, en `localStorage`). Si la
  clase pega esa figurita mientras uno está en pausa, gana el desbloqueo
  compartido y se muestra pegada.

- **Guardado automático.** No hay botón de "guardar": cada figurita pegada se
  registra sola en la base. El estudiante puede cerrar y volver; el álbum
  sigue como estaba.

- **Link de clase estable.** El código de clase (`claseId`) se arma de forma
  determinística con **RUEE + grado + grupo** (sin guiones bajos, en
  minúsculas). Ejemplo: RUEE `1103029`, grado `3_4_5_6`, grupo `A_A_A_A` →
  **`1103029-3456-aaaa`**. Como no depende de fechas ni de un ID aleatorio,
  el link **no cambia** si el docente vuelve a subir el Excel: se puede
  repartir una vez y sirve siempre. Formato del link:
  `https://<dominio>/#/clase/<claseId>`.

- **Sin cuentas ni datos sensibles.** No hay autenticación real: el "login"
  docente es elegir un nombre + una clave maestra compartida. No se guardan
  datos personales de estudiantes (solo el nombre que cada uno escribe, para
  el scoreboard).

---

## 6. Requisitos previos (docente)

Antes de empezar, el docente necesita:
- El **nombre** con el que figura en la lista de docentes de la app.
- La **clave maestra** (única, compartida por el equipo).
- Su **Excel de clases** (o los datos para cargarlas a mano: RUEE, grado, grupo).

### Formato exacto del Excel
Una sola hoja. **Fila 0 = encabezados.** Se leen **4 columnas por posición**
(el resto de las columnas se ignoran):

| Columna (posición) | Contenido | Uso en la app |
|---|---|---|
| **A** (1ª) | Cod. CRM (**RUEE**) | Código de escuela → departamento + Nº de escuela |
| **B** (2ª) | **Grado** | Grado(s). Multigrado como `3_4_5_6` |
| **C** (3ª) | **Docente** | Maestra de aula → se guarda como "maestra" (opcional). **No** es la dueña de la clase. |
| **D** (4ª) | **Grupo** | Grupo(s). Multigrado como `A_A_A_A` (posicional con Grado) |

Reglas:
- **Cada fila no vacía = una clase.** Las **filas vacías** actúan de separador
  y se ignoran. Una fila sin RUEE, sin grado o sin grupo también se ignora.
- **Multigrado = una sola clase** (`Grado="3_4_5_6"`, `Grupo="A_A_A_A"`).
- La **dueña de la clase** es siempre el **docente logueado** (no la columna
  "Docente" del Excel, que es la maestra de aula).
- Volver a subir el Excel es **idempotente**: actualiza las clases **sin
  duplicarlas ni borrar el progreso**.

El **RUEE** tiene 7 dígitos: **4 de departamento + 3 de Nº de escuela**
(ej.: `1103029` → `1103` = Canelones + `029` = Escuela 29). Departamentos
reconocidos: Montevideo (1101), Artigas (1102), Canelones (1103), Cerro Largo
(1104), Colonia (1105), Durazno (1106), Flores (1107), Florida (1108),
Lavalleja (1109), Maldonado (1110), Paysandú (1111), Río Negro (1112), Rivera
(1113), Rocha (1114), Salto (1115), San José (1116), Soriano (1117),
Tacuarembó (1118), Treinta y Tres (1119).

---

## 7. Errores comunes y cómo resolverlos

| Problema | Causa probable | Solución |
|---|---|---|
| **"Clave incorrecta"** al entrar como docente | La clave maestra no coincide | Verificar la clave compartida del equipo (distingue mayúsculas). |
| El **link no abre** la clase / *"No encontramos esa clase. Pedile el link a tu docente."* | El código está incompleto/mal pegado, o la clase todavía no fue cargada | Copiar el link de nuevo desde el panel (botón "Copiar link") y verificar que la clase exista en "Tus clases". |
| El **Excel no carga** clases / *"No encontramos clases en ese archivo…"* | El archivo no tiene el formato esperado (columnas RUEE/Grado/Docente/Grupo) o está vacío | Revisar que la 1ª hoja tenga esas columnas en ese orden y filas con RUEE, grado y grupo. |
| La **clase no aparece** en el panel | Se cargó con **otro** nombre de docente | Cada clase pertenece al docente que la subió; entrar con el mismo nombre con que se cargó. |
| La **figurita no se desbloquea** al responder | Respuesta incorrecta (queda en pausa 5 min) o problema de conexión | Esperar la cuenta regresiva; si dice *"no pudimos guardarla"*, revisar internet y reintentar. |
| *"El RUEE tiene que tener 7 dígitos"* al agregar clase manual | El RUEE no tiene 7 dígitos | Ingresar los 7 dígitos completos (4 de departamento + 3 de escuela). |
| El **enunciado del desafío no se ve** (placeholder) | Falta la imagen de esa tarjeta | Es un pendiente de carga de imágenes; no rompe la app (ver §Pendientes). |
| El álbum **no actualiza en vivo** | Conexión interrumpida | Recargar la página; el progreso se vuelve a cargar desde la base. |

---

## 8. Contenido del álbum (10 figuritas)

> Sin respuestas correctas (la guía puede circular). El "país" es la figurita
> coleccionable (set mundialista); el país de origen del desafío **no** se
> muestra en la app.

| # | Figurita (país) | Título del desafío | Dificultad |
|---|---|---|---|
| 01 | Uruguay | Regalo de cumpleaños | Fácil |
| 02 | Brasil | Tréboles giratorios | Fácil |
| 03 | Canadá | Ruidos en el tráfico | Fácil |
| 04 | Estados Unidos | Árboles | Fácil |
| 05 | Colombia | Sonajero de Oliva | Fácil |
| 06 | Paraguay | Punto de encuentro | Media |
| 07 | Ecuador | Caramelos | Media |
| 08 | Panamá | Pulsera con un mensaje | Media |
| 09 | México | ¿Qué pintó el pintor? | Difícil |
| 10 | Argentina | Laberinto | Difícil |

Los desafíos **01** y **06** tienen 6 opciones (**A–F**); **02, 05, 07, 08,
09** tienen 4 opciones (**A–D**); **03, 04, 10** son **numéricos** (botones con
números).

---

## 9. Textos de interfaz (inventario literal)

### Pantalla de inicio (Onboarding)
- Título: **ÁLBUM BEBRAS 2026** *(en mayúsculas por estilo; en el código "Álbum Bebras 2026")*
- Subtítulo: **Desafíos de ingenio para completar entre toda la clase.**
- Tarjeta: **Soy estudiante** — *Entrá con el link o código de tu clase*
- Tarjeta: **Soy docente** — *Subí tu Excel y gestioná tus clases*
- Pie: **THEA — the electric academy · Desafío Bebras 2026**

**Rama estudiante:** label **Código de tu clase**; placeholder *"Pegá el link
o el código que te dio tu docente"*; botones **Entrar** / **Buscando tu
clase…** / **← Volver**. Errores: *"Escribí el código o pegá el link que te dio
tu docente."*, *"No encontramos esa clase. Pedile el link a tu docente."*,
*"No pudimos verificar la clase. Revisá tu conexión y probá de nuevo."*

**Rama docente:** labels **Tu nombre** (select) y **Clave maestra**;
placeholder *"La clave compartida del equipo"*; botón **Entrar**; error
**Clave incorrecta**.

### Álbum (estudiante)
- Puerta de nombre: **¡Hola!** · *Estás entrando al álbum de <clase>.* ·
  *Contanos tu nombre para saber quién pega cada figurita.* · label **Tu
  nombre** · placeholder *Escribí tu nombre* · botón **Entrar al álbum**.
- Título: **Album Bebras 2026** / **Desafíos de ingenio** · contador **X/10**
- Etiqueta: **Progreso**
- Figurita bloqueada: país (arriba izq.), dificultad (**Fácil** / **Media** /
  **Difícil**), **Figurita** + número **0N**, y el título del desafío abajo.
- Figurita en pausa (cooldown): chip **En pausa · M:SS**
- Figurita pegada: **✓ Pegada** y **la pegó <nombre>**
- Scoreboard: **Scoreboard de la clase** · *Quién pegó cada figurita. Lo
  importante es completarlo entre todos.* · **(vos)** · **N figurita** /
  **N figuritas**
- Aviso en vivo (toast): **<nombre> pegó la figurita 0N · <país>**
- Cargando: **Cargando tu álbum…** / *Un segundito, estamos despegando las figuritas.*
- No encontrada: **No encontramos esa clase** / *Puede que el link esté
  incompleto. Pedile el link a tu docente y probá de nuevo.* / **Ir al inicio**
- Error: **Algo salió mal** / *No pudimos cargar el álbum. Revisá tu conexión
  y recargá la página.* / **Ir al inicio**

### Modal de desafío
- Encabezado: **Figurita 0N** + dificultad · botón **Cerrar desafío** (✕)
- Ayuda de imagen: **Tocá la imagen para verla más grande**
- Pregunta: **¿Cuál es la respuesta?**
- Ya pegada: *"¡Tu clase ya pegó esta figurita! Podés cerrar y seguir con otra."*
- Guardando: **Guardando…**
- Falló el guardado: *"¡Era la correcta! Pero no pudimos guardarla. Revisá tu
  conexión y probá de nuevo."*
- Incorrecta: *"Ups, no era esa. Podés seguir con otro desafío y volver en 5
  minutos."*
- Cooldown: **Podés volver a intentar en M:SS**
- Imagen ampliada (lightbox): **Tocá en cualquier lado para volver**

### Felicitación
- Badge **10/10** · **¡Álbum completo!**
- *"¡Felicitaciones! Entre toda la clase pegaron las 10 figuritas del Álbum
  Bebras 2026. Resolvieron cada desafío pensando en equipo, y eso es lo más
  importante: haber participado y aprendido juntos."*
- Premio (placeholder): **Acá va el premio para la clase.** / *(Muy pronto:
  ¡estamos preparando algo lindo!)*
- Botón **Ver el álbum**

### Panel docente
- Nav: **Panel docente** · Saludo **¡Hola, <Nombre>!** · botón **Salir**
- **Subir Excel de clases** — *Subí tu planilla (.xlsx). Cada fila se convierte
  en una clase con su link. Podés volver a subirla cuando quieras: se
  actualiza sin perder el progreso.* · **Procesando el Excel…** ·
  **N clases cargadas ✓** · errores: *"No encontramos clases en ese archivo.
  Fijate que sea el Excel con las columnas RUEE, Grado, Docente y Grupo."*,
  *"No pudimos guardar las clases. Revisá tu conexión y probá de nuevo."*,
  *"No pudimos leer ese archivo. ¿Es un .xlsx válido?"*
- **Agregar una clase manualmente** — *Si no tenés el Excel a mano, cargá la
  clase acá. Para multigrado usá guiones bajos: grado `3_4_5_6` y grupo
  `A_A_A_A`.* · labels **RUEE**, **Grado**, **Grupo**, **Maestra (opcional)** ·
  botones **Agregar clase** / **Agregando…** · errores: *"El RUEE tiene que
  tener 7 dígitos (ej.: 1103029)."*, *"Completá grado y grupo (para multigrado
  usá guiones bajos: 3_4_5_6 y A_A_A_A)."*
- **Tus clases** — *Compartí el link o el código de cada clase con sus
  estudiantes: con el código pueden entrar desde la pantalla de inicio
  eligiendo "Soy estudiante". El progreso se actualiza solo, en vivo.* ·
  vacío: *"Todavía no tenés clases cargadas. Subí tu Excel acá arriba y van a
  aparecer todas juntas."* · **Cargando tus clases…**
- Tarjeta de clase: **Maestra: <nombre>** · **Código: <claseId>** · **X/10** ·
  botones **Copiar link** / **¡Copiado! ✓** · **Copiar código** · **Eliminar**
- Confirmación de borrado: *"¿Eliminar la clase "<clase>"? Se borra también su
  progreso (las figuritas pegadas). Esta acción no se puede deshacer."*
- **Estudiantes conectados** — *Quiénes tienen abierto el álbum ahora mismo, en
  vivo. Los que se van quedan marcados como "salió". La lista se arma mientras
  tenés el panel abierto y se reinicia sola al cerrarlo.* · contador
  **N ahora** · marca **salió** · vacío: *"Nadie tiene el álbum abierto en
  este momento. Cuando un estudiante entre con el link o el código, aparece
  acá al instante."*

---

## 10. Estilos reales de la app

### Tipografía
- La web usa **Mozaic HUM** (fuente de marca THEA), cargada localmente vía
  `@font-face` desde `public/assets/fonts/` en 6 pesos (Regular 400, Medium
  500, SemiBold 600, Bold 700, ExtraBold 800, Black 900).
- Fallback: `system-ui, -apple-system, "Segoe UI", sans-serif`.
- Los títulos van en mayúsculas y peso alto (800–900); el cuerpo en 400–600.

### Colores reales (variables CSS de la app)
| Nombre | Hex | Uso en la app |
|---|---|---|
| Teal | `#00b8a2` | Contador X/10, "pegada", acentos |
| Violeta | `#8a5ad1` | Rol docente, borde del premio |
| Amarillo | `#ffbc00` | Franjas, hover de opciones |
| Rosa | `#fb5d7f` | Franjas / acentos |
| Azul | `#4478be` | Foco de teclado |
| Rojo | `#fb4747` | Errores / franjas |
| Negro | `#0b0b0d` | Cabecera del álbum, texto, botones |
| Gris | `#c1c1c8` | Figurita en pausa / bordes |
| Gris claro | `#ececec` | Fondos de tarjeta / banda |
| Blanco | `#ffffff` | Fondo general |

Radio de borde base: `14px`. Sombra base:
`0 6px 24px rgba(11,11,13,0.12)`.

Cada figurita pegada usa además el **color de su selección** (bandera):
Uruguay `#55b5e8`, Brasil `#009739`, Canadá `#e4002b`, Estados Unidos
`#1e2a5c`, Colombia `#f0a030`, Paraguay `#8e2438`, Ecuador `#ffd100`, Panamá
`#005293`, México `#d5006d`, Argentina `#7c52d8`.

### Diferencias con el design system de THEA (anexo)
Los hexes del anexo de marca son ligeramente distintos de las variables CSS de
la app (la app usa una paleta más saturada, cercana al prototipo). Ejemplos:
Teal anexo `#00BDAA` vs app `#00b8a2`; Azul (Bebras) anexo `#427CBE` vs app
`#4478be`; Rosa anexo `#FE5C85` vs app `#fb5d7f`; Negro anexo `#222222` vs app
`#0b0b0d`; Off-white anexo `#EEEEEE` vs app gris claro `#ececec`. **Para el PDF,
usar la paleta de marca del anexo** (sección siguiente), con el **azul
`#427CBE` como acento de esta guía** (es el color de Bebras).

---

## 11. Índice de capturas

Todas a **1600×1000 @2x** (PNG). Las de panel/álbum completo son más altas por
capturar la página completa. Ruta local: `docs/capturas/`.

| Archivo | Qué muestra | Link RAW de GitHub |
|---|---|---|
| `01-onboarding.png` | Pantalla de inicio (Soy estudiante / Soy docente) | `https://raw.githubusercontent.com/FacundoSpotti/Bebras/main/docs/capturas/01-onboarding.png` |
| `02-login-docente.png` | Formulario docente (nombre + clave maestra) | `https://raw.githubusercontent.com/FacundoSpotti/Bebras/main/docs/capturas/02-login-docente.png` |
| `03-panel-vacio.png` | Panel docente sin clases (estado vacío) | `https://raw.githubusercontent.com/FacundoSpotti/Bebras/main/docs/capturas/03-panel-vacio.png` |
| `04-panel-con-clases.png` | Panel con 3 clases, progreso y links | `https://raw.githubusercontent.com/FacundoSpotti/Bebras/main/docs/capturas/04-panel-con-clases.png` |
| `05-panel-copiar-link.png` | Detalle de una clase (Copiar link / código) | `https://raw.githubusercontent.com/FacundoSpotti/Bebras/main/docs/capturas/05-panel-copiar-link.png` |
| `06-album-vacio.png` | Álbum 0/10, 10 figuritas bloqueadas | `https://raw.githubusercontent.com/FacundoSpotti/Bebras/main/docs/capturas/06-album-vacio.png` |
| `07-modal-desafio.png` | Modal con enunciado y opciones | `https://raw.githubusercontent.com/FacundoSpotti/Bebras/main/docs/capturas/07-modal-desafio.png` |
| `08-respuesta-correcta.png` | Figurita pegada + celebración + 1/10 | `https://raw.githubusercontent.com/FacundoSpotti/Bebras/main/docs/capturas/08-respuesta-correcta.png` |
| `09-cooldown.png` | Respuesta incorrecta + cuenta regresiva 5:00 | `https://raw.githubusercontent.com/FacundoSpotti/Bebras/main/docs/capturas/09-cooldown.png` |
| `10-album-parcial.png` | Álbum 4/10 (mezcla pegadas / bloqueadas) | `https://raw.githubusercontent.com/FacundoSpotti/Bebras/main/docs/capturas/10-album-parcial.png` |
| `11-album-completo.png` | Álbum 10/10 + scoreboard | `https://raw.githubusercontent.com/FacundoSpotti/Bebras/main/docs/capturas/11-album-completo.png` |
| `12-felicitacion.png` | Felicitación al completar el álbum | `https://raw.githubusercontent.com/FacundoSpotti/Bebras/main/docs/capturas/12-felicitacion.png` |

> **IMPORTANTE:** estos links RAW solo funcionan si el repositorio
> `FacundoSpotti/Bebras` es **público** y las capturas fueron **pusheadas** a
> la rama `main`. Si el repo es privado, los links dan 404 (ver nota al final).

---

## Estados no incluidos / pendientes

- Todas las pantallas de la lista fueron capturadas. **No hay estados
  faltantes** en las capturas pedidas.
- La captura **02** muestra el `<select>` de nombres **cerrado**: los menús
  desplegables nativos del sistema operativo no se pueden renderizar
  "abiertos" en una captura automatizada. Si se necesita mostrarlo desplegado,
  hay que hacerlo con una captura manual del navegador.
- El **premio** de la felicitación es un **placeholder** ("Acá va el premio
  para la clase") — todavía no está definido el premio real.
- Las **imágenes de los enunciados** (`docs/`→`public/assets/desafios/`) ya
  están cargadas; si faltara alguna, el modal muestra un placeholder sin
  romperse.

---

# ANEXO · Design system de THEA (referencia para el PDF)

### Paleta (logos oficiales)
| Color | Hex | Uso |
|---|---|---|
| Teal | `#00BDAA` | Metodología |
| Violeta | `#875FD9` | Gestión de tiempo |
| Amarillo | `#FEB700` | Herramientas |
| Rosa | `#FE5C85` | Programa y SEA |
| **Azul** | **`#427CBE`** | **BEBRAS ← acento de esta guía** |
| Rojo | `#FE4545` | Feedback |
| Negro | `#222222` | Fondos oscuros / texto |
| Off-white | `#EEEEEE` | Texto sobre oscuro |
| Blanco | `#FFFFFF` | Fondo de slides de contenido |

### Logos disponibles (SVG, en `public/assets/`)
- `logotipo.svg` — "the electric academy" completo, multicolor (usado en el nav)
- `Property 1=Default.svg` — "thea" corto multicolor (usado en el inicio y el favicon)
- `Property 1=Blanco.svg` — "thea" corto en `#EEEEEE`
- `Property 1=Negro.svg` — "thea" corto en `#222222`
- *(Ceibal y PC no están en este repo; sumarlos aparte si el PDF los usa.)*

### Tipografía
La web usa **Mozaic HUM** (sans geométrica de x-height alta, 'a' de doble
piso), cargada localmente. Para el PDF, usar Mozaic si está disponible; si no,
una sans geométrica equivalente.

### Layout de referencia (slides 1920×1080, apaisado)
- **Portada:** bloque superior negro `#222222` con título grande en blanco;
  abajo fondo blanco con tarjetas de colores redondeadas (radio ~24px); logos
  abajo a la izquierda; logo PC arriba a la derecha.
- **Slide de contenido:** pestaña de color arriba a la izquierda (esquina
  inferior derecha redondeada) con ícono + nombre de sección en bold +
  pregunta en regular; título grande en negro; cuerpo de texto; logos abajo a
  la izquierda; número de página abajo a la derecha.

---

## Lista de links RAW (para copiar)

```
https://raw.githubusercontent.com/FacundoSpotti/Bebras/main/docs/capturas/01-onboarding.png
https://raw.githubusercontent.com/FacundoSpotti/Bebras/main/docs/capturas/02-login-docente.png
https://raw.githubusercontent.com/FacundoSpotti/Bebras/main/docs/capturas/03-panel-vacio.png
https://raw.githubusercontent.com/FacundoSpotti/Bebras/main/docs/capturas/04-panel-con-clases.png
https://raw.githubusercontent.com/FacundoSpotti/Bebras/main/docs/capturas/05-panel-copiar-link.png
https://raw.githubusercontent.com/FacundoSpotti/Bebras/main/docs/capturas/06-album-vacio.png
https://raw.githubusercontent.com/FacundoSpotti/Bebras/main/docs/capturas/07-modal-desafio.png
https://raw.githubusercontent.com/FacundoSpotti/Bebras/main/docs/capturas/08-respuesta-correcta.png
https://raw.githubusercontent.com/FacundoSpotti/Bebras/main/docs/capturas/09-cooldown.png
https://raw.githubusercontent.com/FacundoSpotti/Bebras/main/docs/capturas/10-album-parcial.png
https://raw.githubusercontent.com/FacundoSpotti/Bebras/main/docs/capturas/11-album-completo.png
https://raw.githubusercontent.com/FacundoSpotti/Bebras/main/docs/capturas/12-felicitacion.png
```

> Los links quedan **operativos una vez que el repo sea público y se haga push
> a `main`** (ver la conversación: ese paso quedó pendiente de confirmación por
> la exposición de la clave maestra).
