1. Tablas
Solo hay dos, ambas en el schema public de Postgres (Supabase):

Tabla	Qué representa
clases	El "grupo". Cada fila es una clase; su id es el código que el estudiante usa para "entrar" (#/clase/:id). No hay tabla de "estudiantes" ni de "sesiones de entrada" — entrar a la clase es solo un SELECT, no un INSERT.
progreso	Las figuritas desbloqueadas. Una fila = una figurita pegada por una clase.
No hay más tablas (ni Supabase Auth de por medio: es 100% anon key).

2. Columnas
clases

Columna	Tipo	Obligatoria
id	text	sí (PK)
docente	text	sí
ruee	text	sí
departamento	text	sí
escuela	integer	sí
grado	text	sí
grupo	text	sí
maestra	text	no
label	text	sí
created_at	timestamptz	no (default now())
progreso

Columna	Tipo	Obligatoria
clase_id	text	sí (PK parte 1, FK)
figurita	integer	sí (PK parte 2)
autor	text	no
unlocked_at	timestamptz	no (default now())
Ojo para generar datos de prueba: figurita no tiene CHECK de rango — la DB acepta cualquier entero, el límite 1–10 lo impone solo el código React. Si tu test manda valores fuera de rango no va a rebotar.

3. Foreign keys
Una sola: progreso.clase_id → clases.id (ON DELETE CASCADE). Para insertar en progreso, ese clase_id tiene que existir antes en clases.

Te dejé creada una clase dedicada para no ensuciar datos reales:


id: 9999999-9-test
label: "Clase de prueba de carga"
Usala como clase_id en todo tu test de progreso. (Nota al margen, no relacionada con tu pedido: encontré varias clases del docente Facundo con grupo tipo 46181/46182/46183 — parecen residuo de una prueba de carga de Excel anterior, no algo que yo haya generado.)

4. UNIQUE / restricciones de repetición
progreso tiene PK compuesta (clase_id, figurita): eso es lo que impide que la misma clase pegue dos veces la misma figurita (intento repetido = conflicto, resuelto con upsert on conflict).
No existe una restricción de "un alumno no puede entrar dos veces al mismo grupo", porque no existe el concepto de alumno en la DB. autor es un campo de texto libre, no está en ninguna constraint — dos filas distintas podrían tener el mismo autor sin problema, y nada impide que "Juan" aparezca como autor de la figurita 3 y la figurita 7 sin registro de que es "el mismo" Juan más allá del string literal.
El "quién está conectado ahora" (panel docente) no toca Postgres: es Supabase Realtime Presence, un canal efímero en memoria del lado del servicio Realtime, no una tabla. Si tu test de capacidad apunta a la DB, ese tráfico no la va a estresar; si querés medir esa parte específicamente, es otro sistema (WebSocket/Phoenix channels de Supabase), no SQL.
5. RLS y anon key
RLS está activo en ambas tablas, pero con policies permisivas: USING (true) WITH CHECK (true) para ALL (select/insert/update/delete), rol public. Verificado recién en vivo: la anon key sola —sin login, sin token de usuario— pudo insertar en clases, insertar en progreso y leer ambas (ver llamadas arriba, todo HTTP 201/200). No hace falta crear usuarios de prueba, la anon key ya puede todo.

6. ¿Hace falta estar logueado para escribir?
No. Todo el flujo de la app (estudiante y docente) usa la misma anon key pública para leer y escribir. El "login" de docente (nombre + CLAVE_MAESTRA) y el nombre del estudiante son solo estado de cliente (sessionStorage/localStorage); la base de datos no los valida ni los conoce.

Snippets listos para tu herramienta de carga (mismo camino que usa la app real, vía PostgREST + anon key)

# Desbloquear figurita (lo que hace un estudiante al responder bien)
curl -X POST "$SUPABASE_URL/rest/v1/progreso" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"clase_id":"9999999-9-test","figurita":2,"autor":"bot-001"}'

# Leer progreso de la clase (lo que hace el álbum al cargar)
curl "$SUPABASE_URL/rest/v1/progreso?clase_id=eq.9999999-9-test&select=figurita,autor" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY"
Algo a tener en cuenta para capacidad real (no pedido, pero relevante)
Realtime solo está habilitado en progreso (no en clases) — el fan-out de WebSocket por INSERT ocurre ahí.
clases no tiene índice en docente, y el panel docente hace where docente = X: con muchas filas eso es sequential scan. Si tu test simula muchos docentes/clases, es el punto más probable de degradación, no progreso (que solo tiene su PK compuesta).