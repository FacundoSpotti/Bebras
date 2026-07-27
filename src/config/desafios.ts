// Los 40 desafíos del álbum, repartidos en 4 páginas de 10 (tarjetas reales
// del Desafío Bebras). `origen` = país de origen del desafío: es un DATO, NO
// se muestra en la UI. `pais` = figurita coleccionable (set mundialista).
//
// NUMERACIÓN: las figuritas van de 1 a 40 de corrido. La página 1 conserva
// las figuritas 1..10 originales, así el progreso ya guardado sigue valiendo.
//   Página 1 → 1..10   Página 2 → 11..20   Página 3 → 21..30   Página 4 → 31..40

export type Opcion = { id: string; texto: string };
export type Desafio = {
  n: number;              // posición en el álbum (1..40)
  pagina: number;         // página del álbum (1..4)
  cardRef: number;        // nº de tarjeta Bebras original
  titulo: string;
  origen: string;         // país de origen del desafío (dato, NO se muestra)
  dificultad: "Fácil" | "Media" | "Difícil";
  habilidades: string[];  // habilidades de PC de la tarjeta
  pais: string;           // figurita coleccionable (set mundialista)
  figuritaImg: string;    // /assets/figuritas/<pais>.png
  desafioImg: string;     // imagen del enunciado
  opciones: Opcion[];
  correcta: string;       // id de la opción correcta
};

const L = (...ids: string[]): Opcion[] =>          // helper A/B/C/D...
  ids.map(id => ({ id: id.toLowerCase(), texto: id }));
const N = (...nums: number[]): Opcion[] =>          // helper numérico
  nums.map(n => ({ id: String(n), texto: String(n) }));
const T = (...textos: string[]): Opcion[] =>        // helper textual
  textos.map(t => ({ id: t.toLowerCase().replace(/[^a-z0-9]+/gi, "-"), texto: t }));

export const DESAFIOS: Desafio[] = [
  // ===================== PÁGINA 1 · figuritas 1..10 =====================
  { n: 1, pagina: 1, cardRef: 1, titulo: "Regalo de cumpleaños", origen: "Países Bajos",
    dificultad: "Fácil", habilidades: ["Pensamiento algorítmico"],
    pais: "Uruguay", figuritaImg: "/assets/figuritas/Uruguay.png", desafioImg: "/assets/desafios/01.jpg",
    opciones: L("A", "B", "C", "D", "E", "F"), correcta: "a" },

  { n: 2, pagina: 1, cardRef: 2, titulo: "Tréboles giratorios", origen: "Irlanda",
    dificultad: "Fácil", habilidades: ["Abstracción", "Generalización"],
    pais: "Brasil", figuritaImg: "/assets/figuritas/Brasil.png", desafioImg: "/assets/desafios/02.jpg",
    opciones: L("A", "B", "C", "D"), correcta: "d" },

  { n: 3, pagina: 1, cardRef: 4, titulo: "Ruidos en el tráfico", origen: "Reino Unido",
    dificultad: "Fácil", habilidades: ["Abstracción", "Pensamiento algorítmico"],
    pais: "Canada", figuritaImg: "/assets/figuritas/Canada.png", desafioImg: "/assets/desafios/03.jpg",
    opciones: N(2, 3, 4, 5), correcta: "3" },

  { n: 4, pagina: 1, cardRef: 5, titulo: "Árboles", origen: "Uzbekistán",
    dificultad: "Fácil", habilidades: ["Pensamiento algorítmico", "Evaluación"],
    pais: "Estados Unidos", figuritaImg: "/assets/figuritas/Estados Unidos.png", desafioImg: "/assets/desafios/04.jpg",
    opciones: N(3, 4, 5, 6), correcta: "4" },

  { n: 5, pagina: 1, cardRef: 7, titulo: "Sonajero de Oliva", origen: "Eslovaquia",
    dificultad: "Fácil", habilidades: ["Generalización"],
    pais: "Colombia", figuritaImg: "/assets/figuritas/Colombia.png", desafioImg: "/assets/desafios/05.jpg",
    opciones: L("A", "B", "C", "D"), correcta: "a" },

  { n: 6, pagina: 1, cardRef: 9, titulo: "Punto de encuentro", origen: "Polonia",
    dificultad: "Media", habilidades: ["Abstracción", "Descomposición"],
    pais: "Paraguay", figuritaImg: "/assets/figuritas/Paraguay.png", desafioImg: "/assets/desafios/06.jpg",
    opciones: L("A", "B", "C", "D", "E", "F"), correcta: "d" },

  { n: 7, pagina: 1, cardRef: 10, titulo: "Caramelos", origen: "Lituania",
    dificultad: "Media", habilidades: ["Descomposición", "Evaluación"],
    pais: "Ecuador", figuritaImg: "/assets/figuritas/Ecuador.png", desafioImg: "/assets/desafios/07.jpg",
    opciones: L("A", "B", "C", "D"), correcta: "b" },

  { n: 8, pagina: 1, cardRef: 11, titulo: "Pulsera con un mensaje", origen: "Irlanda",
    dificultad: "Media", habilidades: ["Generalización", "Descomposición"],
    pais: "Panama", figuritaImg: "/assets/figuritas/Panama.png", desafioImg: "/assets/desafios/08.jpg",
    opciones: L("A", "B", "C", "D"), correcta: "b" },

  { n: 9, pagina: 1, cardRef: 13, titulo: "¿Qué pintó el pintor?", origen: "Estados Unidos",
    dificultad: "Difícil", habilidades: ["Abstracción"],
    pais: "Mexico", figuritaImg: "/assets/figuritas/Mexico.png", desafioImg: "/assets/desafios/09.jpg",
    opciones: L("A", "B", "C", "D"), correcta: "a" },

  { n: 10, pagina: 1, cardRef: 14, titulo: "Laberinto", origen: "Bulgaria",
    dificultad: "Difícil", habilidades: ["Pensamiento algorítmico"],
    pais: "Argentina", figuritaImg: "/assets/figuritas/Argentina.png", desafioImg: "/assets/desafios/10.jpg",
    opciones: N(6, 7, 8, 9), correcta: "8" },

  // ===================== PÁGINA 2 · figuritas 11..20 =====================
  { n: 11, pagina: 2, cardRef: 1, titulo: "Vías del tren", origen: "Portugal",
    dificultad: "Fácil", habilidades: ["Pensamiento algorítmico"],
    pais: "ESPAÑA", figuritaImg: "/assets/figuritas/ESPAÑA.png", desafioImg: "/assets/desafios_p2/01.jpg",
    opciones: L("A", "B", "C", "D"), correcta: "d" },

  { n: 12, pagina: 2, cardRef: 2, titulo: "Cola de castor", origen: "Lituania",
    dificultad: "Fácil", habilidades: ["Generalización"],
    pais: "FRANCIA", figuritaImg: "/assets/figuritas/FRANCIA.png", desafioImg: "/assets/desafios_p2/02.jpg",
    opciones: N(1, 2, 3, 4, 5, 6), correcta: "3" },

  { n: 13, pagina: 2, cardRef: 4, titulo: "Pinturas Bebras", origen: "Bebras",
    dificultad: "Fácil", habilidades: ["Generalización"],
    pais: "ITALIA", figuritaImg: "/assets/figuritas/ITALIA.png", desafioImg: "/assets/desafios_p2/04.jpg",
    opciones: L("A", "B", "C", "D"), correcta: "b" },

  { n: 14, pagina: 2, cardRef: 5, titulo: "Samba castor", origen: "Bebras",
    dificultad: "Media", habilidades: ["Abstracción"],
    pais: "ALEMANIA", figuritaImg: "/assets/figuritas/ALEMANIA.png", desafioImg: "/assets/desafios_p2/05.jpg",
    opciones: L("A", "B", "C", "D"), correcta: "c" },

  { n: 15, pagina: 2, cardRef: 6, titulo: "Observación del bosque", origen: "Bebras",
    dificultad: "Media", habilidades: ["Abstracción", "Evaluación"],
    pais: "PORTUGAL", figuritaImg: "/assets/figuritas/PORTUGAL.png", desafioImg: "/assets/desafios_p2/06.jpg",
    opciones: N(2, 3, 4, 5), correcta: "3" },

  { n: 16, pagina: 2, cardRef: 7, titulo: "Castores olvidadizos", origen: "Bebras",
    dificultad: "Media", habilidades: ["Pensamiento algorítmico"],
    pais: "INGLATERRA", figuritaImg: "/assets/figuritas/INGLATERRA.png", desafioImg: "/assets/desafios_p2/07.jpg",
    opciones: L("A", "B", "C", "D"), correcta: "b" },

  { n: 17, pagina: 2, cardRef: 9, titulo: "Rellenos de hamburguesa", origen: "Bebras",
    dificultad: "Media", habilidades: ["Generalización"],
    pais: "PAÍSES BAJOS", figuritaImg: "/assets/figuritas/PAÍSES BAJOS.png", desafioImg: "/assets/desafios_p2/09.jpg",
    opciones: N(1, 2, 3, 4), correcta: "1" },

  { n: 18, pagina: 2, cardRef: 10, titulo: "Castorpesos", origen: "Bebras",
    dificultad: "Difícil", habilidades: ["Evaluación"],
    pais: "BÉLGICA", figuritaImg: "/assets/figuritas/BÉLGICA.png", desafioImg: "/assets/desafios_p2/10.jpg",
    opciones: N(2, 3, 4, 5), correcta: "3" },

  { n: 19, pagina: 2, cardRef: 11, titulo: "Laberinto de colores", origen: "Bebras",
    dificultad: "Difícil", habilidades: ["Pensamiento algorítmico"],
    pais: "CROACIA", figuritaImg: "/assets/figuritas/CROACIA.png", desafioImg: "/assets/desafios_p2/11.jpg",
    opciones: L("A", "B", "C", "D"), correcta: "d" },

  { n: 20, pagina: 2, cardRef: 13, titulo: "Estacionamiento de robots", origen: "Bebras",
    dificultad: "Difícil", habilidades: ["Pensamiento algorítmico", "Evaluación"],
    pais: "SUIZA", figuritaImg: "/assets/figuritas/SUIZA.png", desafioImg: "/assets/desafios_p2/13.jpg",
    opciones: N(9, 10, 11, 12), correcta: "11" },

  // ===================== PÁGINA 3 · figuritas 21..30 =====================
  { n: 21, pagina: 3, cardRef: 1, titulo: "Alienígenas amigables", origen: "Turquía",
    dificultad: "Fácil", habilidades: ["Descomposición"],
    pais: "CHEQUIA", figuritaImg: "/assets/figuritas/CHEQUIA.png", desafioImg: "/assets/desafios_p3/01.jpg",
    opciones: N(2, 3, 4, 5), correcta: "3" },

  { n: 22, pagina: 3, cardRef: 2, titulo: "Riccas", origen: "Canadá",
    dificultad: "Fácil", habilidades: ["Pensamiento algorítmico"],
    pais: "ESCOCIA", figuritaImg: "/assets/figuritas/ESCOCIA.png", desafioImg: "/assets/desafios_p3/02.jpg",
    opciones: L("A", "B", "C", "D"), correcta: "d" },

  { n: 23, pagina: 3, cardRef: 4, titulo: "La caza de la frutilla", origen: "Eslovenia",
    dificultad: "Fácil", habilidades: ["Pensamiento algorítmico"],
    pais: "NORUEGA", figuritaImg: "/assets/figuritas/NORUEGA.png", desafioImg: "/assets/desafios_p3/04.jpg",
    opciones: N(1, 2, 3, 4), correcta: "2" },

  { n: 24, pagina: 3, cardRef: 5, titulo: "Manzanas, bananas, brócoli y zanahorias", origen: "Canadá",
    dificultad: "Media", habilidades: ["Pensamiento algorítmico"],
    pais: "SUECIA", figuritaImg: "/assets/figuritas/SUECIA.png", desafioImg: "/assets/desafios_p3/05.jpg",
    opciones: N(0, 1, 2, 3), correcta: "1" },

  { n: 25, pagina: 3, cardRef: 6, titulo: "Centro de la ciudad", origen: "Austria",
    dificultad: "Media", habilidades: ["Pensamiento algorítmico", "Evaluación"],
    pais: "TURKIYE", figuritaImg: "/assets/figuritas/TURKIYE.png", desafioImg: "/assets/desafios_p3/06.jpg",
    opciones: N(45, 50, 55, 60), correcta: "55" },

  { n: 26, pagina: 3, cardRef: 7, titulo: "Rango", origen: "China",
    dificultad: "Media", habilidades: ["Pensamiento algorítmico"],
    pais: "JAPÓN", figuritaImg: "/assets/figuritas/JAPÓN.png", desafioImg: "/assets/desafios_p3/07.jpg",
    opciones: N(2, 3, 4, 5), correcta: "3" },

  { n: 27, pagina: 3, cardRef: 9, titulo: "La cadena más larga", origen: "Ucrania",
    dificultad: "Media", habilidades: ["Evaluación"],
    pais: "COREA DEL SUR", figuritaImg: "/assets/figuritas/COREA DEL SUR.png", desafioImg: "/assets/desafios_p3/09.jpg",
    opciones: N(7, 8, 9, 10), correcta: "9" },

  { n: 28, pagina: 3, cardRef: 10, titulo: "Habitaciones y puertas", origen: "Japón",
    dificultad: "Difícil", habilidades: ["Pensamiento algorítmico", "Evaluación"],
    pais: "ARABIA SAUDITA", figuritaImg: "/assets/figuritas/ARABIA SAUDITA.png", desafioImg: "/assets/desafios_p3/10.jpg",
    opciones: N(2, 3, 4, 5), correcta: "3" },

  { n: 29, pagina: 3, cardRef: 12, titulo: "Alpinista", origen: "Canadá",
    dificultad: "Difícil", habilidades: ["Pensamiento algorítmico"],
    pais: "AUSTRALIA", figuritaImg: "/assets/figuritas/AUSTRALIA.png", desafioImg: "/assets/desafios_p3/12.jpg",
    opciones: N(2, 3, 4, 5), correcta: "3" },

  { n: 30, pagina: 3, cardRef: 13, titulo: "Rompecabezas de habitaciones", origen: "Lituania",
    dificultad: "Difícil", habilidades: ["Pensamiento algorítmico"],
    pais: "NUEVA ZELANDA", figuritaImg: "/assets/figuritas/NUEVA ZELANDA.png", desafioImg: "/assets/desafios_p3/13.jpg",
    opciones: L("A", "B", "C", "D"), correcta: "c" },

  // ===================== PÁGINA 4 · figuritas 31..40 =====================
  { n: 31, pagina: 4, cardRef: 1, titulo: "Huellas", origen: "Uruguay",
    dificultad: "Fácil", habilidades: ["Abstracción"],
    pais: "MARRUECOS", figuritaImg: "/assets/figuritas/MARRUECOS.png", desafioImg: "/assets/desafios_p4/01.jpg",
    opciones: T("Gato", "Oso", "Conejo", "Vaca"), correcta: "conejo" },

  { n: 32, pagina: 4, cardRef: 2, titulo: "Agentes secretos", origen: "Pakistán",
    dificultad: "Fácil", habilidades: ["Pensamiento algorítmico", "Descomposición"],
    pais: "EGIPTO", figuritaImg: "/assets/figuritas/EGIPTO.png", desafioImg: "/assets/desafios_p4/02.jpg",
    opciones: T("ODKNSZ", "QFMPUB", "PELOTA", "QFNPUC"), correcta: "qfmpub" },

  { n: 33, pagina: 4, cardRef: 5, titulo: "Adornos navideños", origen: "Reino Unido",
    dificultad: "Fácil", habilidades: ["Pensamiento algorítmico"],
    pais: "SENEGAL", figuritaImg: "/assets/figuritas/SENEGAL.png", desafioImg: "/assets/desafios_p4/05.jpg",
    opciones: T("A → B → C → D", "C → A → D → B", "B → D → A → C", "D → C → B → A"),
    correcta: "c-a-d-b" },

  { n: 34, pagina: 4, cardRef: 4, titulo: "Búsqueda del tesoro", origen: "Islandia",
    dificultad: "Media", habilidades: ["Descomposición"],
    pais: "GHANA", figuritaImg: "/assets/figuritas/GHANA.png", desafioImg: "/assets/desafios_p4/04.jpg",
    opciones: T("Vela", "Bosque", "Cofre", "Cueva"), correcta: "cueva" },

  { n: 35, pagina: 4, cardRef: 6, titulo: "Cuadrados para colorear", origen: "Eslovaquia",
    dificultad: "Media", habilidades: ["Descomposición"],
    pais: "TÚNEZ", figuritaImg: "/assets/figuritas/TÚNEZ.png", desafioImg: "/assets/desafios_p4/06.jpg",
    opciones: N(7, 8, 9, 10), correcta: "9" },

  { n: 36, pagina: 4, cardRef: 9, titulo: "Mesa de comedor", origen: "Indonesia",
    dificultad: "Media", habilidades: ["Abstracción"],
    pais: "ARGELIA", figuritaImg: "/assets/figuritas/ARGELIA.png", desafioImg: "/assets/desafios_p4/09.jpg",
    opciones: T("Ana", "Bruno", "Clara"), correcta: "ana" },

  { n: 37, pagina: 4, cardRef: 11, titulo: "Llevando palos", origen: "Japón",
    dificultad: "Media", habilidades: ["Abstracción", "Pensamiento algorítmico"],
    pais: "SUDÁFRICA", figuritaImg: "/assets/figuritas/SUDÁFRICA.png", desafioImg: "/assets/desafios_p4/11.jpg",
    opciones: N(4, 5, 6, 7), correcta: "6" },

  { n: 38, pagina: 4, cardRef: 10, titulo: "Caperucita Roja", origen: "Estonia",
    dificultad: "Difícil", habilidades: ["Evaluación", "Descomposición"],
    pais: "CONGO", figuritaImg: "/assets/figuritas/CONGO.png", desafioImg: "/assets/desafios_p4/10.jpg",
    opciones: T("Oso y oveja", "Zorro y zorrillo", "Oso y zorro", "Oveja y zorrillo"),
    correcta: "zorro-y-zorrillo" },

  { n: 39, pagina: 4, cardRef: 13, titulo: "Viaje a casa de los abuelos", origen: "Macedonia del Norte",
    dificultad: "Difícil", habilidades: ["Pensamiento algorítmico"],
    pais: "CABO VERDE", figuritaImg: "/assets/figuritas/CABO VERDE.png", desafioImg: "/assets/desafios_p4/13.jpg",
    opciones: T("A → C → E → F", "A → D → F", "A → B → D → E → F", "A → B → G → F"),
    correcta: "a-b-d-e-f" },

  { n: 40, pagina: 4, cardRef: 14, titulo: "La llave inglesa", origen: "Arabia Saudita",
    dificultad: "Difícil", habilidades: ["Pensamiento algorítmico"],
    pais: "CURAZAO", figuritaImg: "/assets/figuritas/CURAZAO.png", desafioImg: "/assets/desafios_p4/14.jpg",
    opciones: N(3, 4, 5, 6), correcta: "4" },
];

/** Cantidad de páginas del álbum. */
export const TOTAL_PAGINAS = 4;
/** Figuritas por página (todas las páginas tienen la misma cantidad). */
export const FIGURITAS_POR_PAGINA = 10;
/** Total de figuritas del álbum completo. */
export const TOTAL_FIGURITAS = DESAFIOS.length;

export function desafioPorN(n: number): Desafio | undefined {
  return DESAFIOS.find(d => d.n === n);
}

/** Los 10 desafíos de una página (1..4). */
export function desafiosDePagina(pagina: number): Desafio[] {
  return DESAFIOS.filter(d => d.pagina === pagina);
}

/** Cuántas figuritas de esa página están pegadas. */
export function pegadasDePagina(pagina: number, pegadas: Set<number>): number {
  return desafiosDePagina(pagina).filter(d => pegadas.has(d.n)).length;
}

/** Una página está completa cuando sus 10 figuritas están pegadas. */
export function paginaCompleta(pagina: number, pegadas: Set<number>): boolean {
  return pegadasDePagina(pagina, pegadas) >= FIGURITAS_POR_PAGINA;
}

/**
 * La página 1 siempre está abierta; cada página siguiente se habilita
 * al completar la anterior.
 */
export function paginaDesbloqueada(pagina: number, pegadas: Set<number>): boolean {
  if (pagina <= 1) return true;
  return paginaCompleta(pagina - 1, pegadas);
}

/** Última página desbloqueada (a la que conviene llevar al estudiante). */
export function ultimaPaginaDesbloqueada(pegadas: Set<number>): number {
  let p = 1;
  while (p < TOTAL_PAGINAS && paginaCompleta(p, pegadas)) p++;
  return p;
}
