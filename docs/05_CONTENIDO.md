# 05 · CONTENIDO Y CONFIGURACIÓN

> Actualizado con las **tarjetas reales del Desafío Bebras 2025**. Figuritas = set **mundialista** (decisión B). El país de origen de cada desafío se guarda como dato pero **NO se muestra** en la página (salvo pedido explícito).

## 1. Docentes + clave maestra
```ts
// src/config/docentes.ts
export const DOCENTES = [
  "Facundo", "Thiago", "Celeste", "Sofia", "Constanza",
  "Francesca", "Agustín", "Joaquín", "Jose", "Mikaela",
];

// Clave única para todos los docentes. No es seguridad real.
export const CLAVE_MAESTRA = "CAMBIAR_ESTA_CLAVE";
```

## 2. Los 10 desafíos / figuritas (contenido real)
Reglas del contenido:
- El álbum tiene **10 figuritas** (posición 1..10). Cada una está asociada a una **tarjeta Bebras real** (`cardRef` = número original de la tarjeta).
- **Respuestas siempre de opción múltiple** (`opciones` + `correcta` = id correcto).
- `dificultad` mostrada = la del tramo **Cardenales (5º-6º)** si existe, si no la de **Benteveos (3º-4º)** (tus clases son 3º a 6º).
- **`pais`** = figurita coleccionable del set **mundialista** (tu arte en `assets/figuritas`). Es lo que se muestra en la tarjeta.
- **`origen`** = país de origen del desafío (dato real). Se guarda pero **NO se muestra** en la UI en esta versión. No renderizarlo en el modal ni en la tarjeta.
- `figuritaImg` = arte de la figurita (tu asset). `desafioImg` = imagen del enunciado de la tarjeta (exportar cada tarjeta a `assets/desafios/0N.png`).

Mapa álbum → tarjeta Bebras (con respuesta correcta):
1. Regalo de cumpleaños (card 1, Países Bajos) — **A**
2. Tréboles giratorios (card 2, Irlanda) — **D**
3. Ruidos en el tráfico (card 4, Reino Unido) — **3**
4. Árboles (card 5, Uzbekistán) — **4**
5. Sonajero de Oliva (card 7, Eslovaquia) — **A**
6. Punto de encuentro (card 9, Polonia) — **D**
7. Caramelos (card 10, Lituania) — **B**
8. Pulsera con un mensaje (card 11, Irlanda) — **B**
9. ¿Qué pintó el pintor? (card 13, Estados Unidos) — **A**
10. Laberinto (card 14, Bulgaria) — **8**

```ts
// src/config/desafios.ts
export type Opcion = { id: string; texto: string };
export type Desafio = {
  n: number;              // posición en el álbum (1..10)
  cardRef: number;        // nº de tarjeta Bebras original
  titulo: string;
  origen: string;         // país de origen del desafío (dato, NO se muestra)
  dificultad: "Fácil" | "Media" | "Difícil";
  habilidades: string[];  // habilidades de PC de la tarjeta
  pais: string;           // figurita coleccionable (set mundialista)
  figuritaImg: string;    // /assets/figuritas/<pais>.png
  desafioImg: string;     // /assets/desafios/0N.png  (exportar tarjeta)
  opciones: Opcion[];
  correcta: string;       // id de la opción correcta
};

const L = (...ids: string[]): Opcion[] =>          // helper A/B/C/D...
  ids.map(id => ({ id: id.toLowerCase(), texto: id }));
const N = (...nums: number[]): Opcion[] =>          // helper numérico
  nums.map(n => ({ id: String(n), texto: String(n) }));

export const DESAFIOS: Desafio[] = [
  { n:1,  cardRef:1,  titulo:"Regalo de cumpleaños", origen:"Países Bajos",
    dificultad:"Fácil",  habilidades:["Pensamiento algorítmico"],
    pais:"Alemania",  figuritaImg:"/assets/figuritas/Alemania.png",  desafioImg:"/assets/desafios/01.png",
    opciones:L("A","B","C","D","E","F"), correcta:"a" },

  { n:2,  cardRef:2,  titulo:"Tréboles giratorios", origen:"Irlanda",
    dificultad:"Fácil",  habilidades:["Abstracción","Generalización"],
    pais:"Brasil",    figuritaImg:"/assets/figuritas/Brasil.png",    desafioImg:"/assets/desafios/02.png",
    opciones:L("A","B","C","D"), correcta:"d" },

  { n:3,  cardRef:4,  titulo:"Ruidos en el tráfico", origen:"Reino Unido",
    dificultad:"Fácil",  habilidades:["Abstracción","Pensamiento algorítmico"],
    pais:"Canadá",    figuritaImg:"/assets/figuritas/Canadá.png",    desafioImg:"/assets/desafios/03.png",
    opciones:N(2,3,4,5), correcta:"3" },

  { n:4,  cardRef:5,  titulo:"Árboles", origen:"Uzbekistán",
    dificultad:"Fácil",  habilidades:["Pensamiento algorítmico","Evaluación"],
    pais:"Japón",     figuritaImg:"/assets/figuritas/Japón.png",     desafioImg:"/assets/desafios/04.png",
    opciones:N(3,4,5,6), correcta:"4" },

  { n:5,  cardRef:7,  titulo:"Sonajero de Oliva", origen:"Eslovaquia",
    dificultad:"Fácil",  habilidades:["Generalización"],
    pais:"Francia",   figuritaImg:"/assets/figuritas/Francia.png",   desafioImg:"/assets/desafios/05.png",
    opciones:L("A","B","C","D"), correcta:"a" },

  { n:6,  cardRef:9,  titulo:"Punto de encuentro", origen:"Polonia",
    dificultad:"Media",  habilidades:["Abstracción","Descomposición"],
    pais:"Australia", figuritaImg:"/assets/figuritas/Australia.png", desafioImg:"/assets/desafios/06.png",
    opciones:L("A","B","C","D","E","F"), correcta:"d" },

  { n:7,  cardRef:10, titulo:"Caramelos", origen:"Lituania",
    dificultad:"Media",  habilidades:["Descomposición","Evaluación"],
    pais:"Sudáfrica", figuritaImg:"/assets/figuritas/Sudáfrica.png", desafioImg:"/assets/desafios/07.png",
    opciones:L("A","B","C","D"), correcta:"b" },

  { n:8,  cardRef:11, titulo:"Pulsera con un mensaje", origen:"Irlanda",
    dificultad:"Media",  habilidades:["Generalización","Descomposición"],
    pais:"Italia",    figuritaImg:"/assets/figuritas/Italia.png",    desafioImg:"/assets/desafios/08.png",
    opciones:L("A","B","C","D"), correcta:"b" },

  { n:9,  cardRef:13, titulo:"¿Qué pintó el pintor?", origen:"Estados Unidos",
    dificultad:"Difícil", habilidades:["Abstracción"],
    pais:"México",    figuritaImg:"/assets/figuritas/México.png",    desafioImg:"/assets/desafios/09.png",
    opciones:L("A","B","C","D"), correcta:"a" },

  { n:10, cardRef:14, titulo:"Laberinto", origen:"Bulgaria",
    dificultad:"Difícil", habilidades:["Pensamiento algorítmico"],
    pais:"Argentina", figuritaImg:"/assets/figuritas/Argentina.png", desafioImg:"/assets/desafios/10.png",
    opciones:N(6,7,8,9), correcta:"8" },
];
```
> Notas:
> - Verificá que los nombres de `pais` coincidan **exactamente** con tus archivos en `assets/figuritas` (ojo con tildes: `Canadá`, `Japón`, `México`, `Sudáfrica`). Si tus archivos no tienen tildes, ajustá acá.
> - `origen` es solo dato: **no** se muestra (§5). Queda listo por si más adelante lo querés mostrar.
> - Los desafíos 1 y 6 tienen opciones **A–F** (no solo A–D). Verificá contra la imagen real.
> - Distractores de los numéricos (3, 4, 10) son sugeridos; ajustables.

## 3. Marca THEA
- Nombre: **THEA — the electric academy**.
- Logos en `public/assets`:
  - `logotipo.svg` → logo completo, para el **nav** (cabecera del álbum y del panel).
  - `Property 1=Negro.svg`, `Property 1=Blanco.svg`, `Property 1=Default.svg` → versión corta, para el **Onboarding** (elegir la variante que contraste con el fondo).
- Paleta del prototipo (colores vivos): amarillo/dorado, rojo/coral, rosa, violeta y verde-agua. Fondo claro; cabecera del álbum negra.
- Tono de copy: alegre, para primaria (3º–6º), sin competencia.

## 4. Formato de las opciones en el modal
- Desafíos con opciones por letra (A–D o A–F): mostrar la imagen del enunciado y **botones con las letras** (`opciones`).
- Numéricos (Ruidos, Árboles, Laberinto): botones con los números.
- `correcta` guarda el `id` de la opción correcta.
- **No mostrar** el país de origen (`origen`) en ningún lado de esta versión.

## 5. País de origen: guardado pero oculto
Decisión tomada: **figurita = set mundialista** (tu arte). El `origen` del desafío queda en los datos (`desafios.ts`) pero **no se renderiza** en la página. Si en el futuro querés mostrarlo (p. ej. "Este desafío viene de …"), ya está el campo listo.

## 6. Checklist de assets / datos a completar
- [ ] `assets/desafios/01..10.png` — exportar las 10 tarjetas elegidas.
- [ ] Verificar que los nombres de figuritas (`pais`) coincidan con los archivos de `assets/figuritas` (tildes).
- [ ] Verificar cantidad de opciones por desafío (1 y 6 son A–F).
- [ ] Setear `CLAVE_MAESTRA`.
- [ ] Proyecto Supabase + variables de entorno.
- [ ] Definir el premio final (pantalla de felicitación).

---

## ANEXO · Las 14 tarjetas Bebras 2025 (referencia completa)
Dificultad por categoría: G=Gorriones(1-2), B=Benteveos(3-4), C=Cardenales(5-6), H=Horneros(7-9), T=Teros(EMS). F=fácil, M=medio, D=difícil, "-"=no aplica.

| Card | Título | Origen | G | B | C | H | T | Habilidad(es) | Respuesta | ¿Opción múltiple? |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Regalo de cumpleaños | Países Bajos | M | F | - | - | - | Alg. | **A** | Sí (A–F) |
| 2 | Tréboles giratorios | Irlanda | M | F | F | - | - | Abs., Gen. | **D** | Sí (A–D) |
| 3 | Dibujando un velero | Polonia | M | F | - | - | - | Alg. | 2 puntos (imagen) | **No** |
| 4 | Ruidos en el tráfico | Reino Unido | M | F | F | - | - | Abs., Alg. | **3 casas** | Numérica |
| 5 | Árboles | Uzbekistán | M | F | F | - | - | Alg., Eval. | **4 árboles** | Numérica |
| 6 | Transportador de juguetes | Estonia | D | M | F | - | - | Alg. | Pelota naranja | **No** |
| 7 | Sonajero de Oliva | Eslovaquia | D | M | F | - | - | Gen. | **A** | Sí (A–D) |
| 8 | Abrir el paquete | Estonia | - | D | M | F | F | Gen. | Imagen (letra ?) | Sí (A–D), falta letra |
| 9 | Punto de encuentro | Polonia | - | D | M | F | F | Abs., Desc. | **D** | Sí (A–F) |
| 10 | Caramelos | Lituania | - | D | M | F | F | Desc., Eval. | **B** | Sí (A–D) |
| 11 | Pulsera con un mensaje | Irlanda | - | D | M | F | F | Gen., Desc. | **B** | Sí (A–D) |
| 12 | Fiesta de disfraces | Uruguay | - | D | M | F | F | Gen. | Asignación | **No** |
| 13 | ¿Qué pintó el pintor? | Estados Unidos | - | - | D | M | F | Abs. | **A** | Sí (A–D) |
| 14 | Laberinto | Bulgaria | - | - | D | M | M | Alg. | **8** | Numérica |

**En uso (10):** cards 1, 2, 4, 5, 7, 9, 10, 11, 13, 14.
**Fuera (4):** 3, 6, 12 (no son opción múltiple) y 8 (solución en imagen, sin letra). Si querés sumar alguna, hay que definirle formato/opciones.
