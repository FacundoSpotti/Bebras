// Los 10 desafíos del álbum (tarjetas reales del Desafío Bebras 2025).
// `origen` = país de origen del desafío: es un DATO, NO se muestra en la UI.
// `pais`   = figurita coleccionable del set mundialista (assets reales).
// NOTA: los países de `pais` se ajustaron a los archivos que existen en
// public/assets/figuritas (set América, sin tildes) — ver 05_CONTENIDO.md §6.

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
  { n: 1, cardRef: 1, titulo: "Regalo de cumpleaños", origen: "Países Bajos",
    dificultad: "Fácil", habilidades: ["Pensamiento algorítmico"],
    pais: "Uruguay", figuritaImg: "/assets/figuritas/Uruguay.png", desafioImg: "/assets/desafios/01.png",
    opciones: L("A", "B", "C", "D", "E", "F"), correcta: "a" },

  { n: 2, cardRef: 2, titulo: "Tréboles giratorios", origen: "Irlanda",
    dificultad: "Fácil", habilidades: ["Abstracción", "Generalización"],
    pais: "Brasil", figuritaImg: "/assets/figuritas/Brasil.png", desafioImg: "/assets/desafios/02.png",
    opciones: L("A", "B", "C", "D"), correcta: "d" },

  { n: 3, cardRef: 4, titulo: "Ruidos en el tráfico", origen: "Reino Unido",
    dificultad: "Fácil", habilidades: ["Abstracción", "Pensamiento algorítmico"],
    pais: "Canada", figuritaImg: "/assets/figuritas/Canada.png", desafioImg: "/assets/desafios/03.png",
    opciones: N(2, 3, 4, 5), correcta: "3" },

  { n: 4, cardRef: 5, titulo: "Árboles", origen: "Uzbekistán",
    dificultad: "Fácil", habilidades: ["Pensamiento algorítmico", "Evaluación"],
    pais: "Estados Unidos", figuritaImg: "/assets/figuritas/Estados Unidos.png", desafioImg: "/assets/desafios/04.png",
    opciones: N(3, 4, 5, 6), correcta: "4" },

  { n: 5, cardRef: 7, titulo: "Sonajero de Oliva", origen: "Eslovaquia",
    dificultad: "Fácil", habilidades: ["Generalización"],
    pais: "Colombia", figuritaImg: "/assets/figuritas/Colombia.png", desafioImg: "/assets/desafios/05.png",
    opciones: L("A", "B", "C", "D"), correcta: "a" },

  { n: 6, cardRef: 9, titulo: "Punto de encuentro", origen: "Polonia",
    dificultad: "Media", habilidades: ["Abstracción", "Descomposición"],
    pais: "Paraguay", figuritaImg: "/assets/figuritas/Paraguay.png", desafioImg: "/assets/desafios/06.png",
    opciones: L("A", "B", "C", "D", "E", "F"), correcta: "d" },

  { n: 7, cardRef: 10, titulo: "Caramelos", origen: "Lituania",
    dificultad: "Media", habilidades: ["Descomposición", "Evaluación"],
    pais: "Ecuador", figuritaImg: "/assets/figuritas/Ecuador.png", desafioImg: "/assets/desafios/07.png",
    opciones: L("A", "B", "C", "D"), correcta: "b" },

  { n: 8, cardRef: 11, titulo: "Pulsera con un mensaje", origen: "Irlanda",
    dificultad: "Media", habilidades: ["Generalización", "Descomposición"],
    pais: "Panama", figuritaImg: "/assets/figuritas/Panama.png", desafioImg: "/assets/desafios/08.png",
    opciones: L("A", "B", "C", "D"), correcta: "b" },

  { n: 9, cardRef: 13, titulo: "¿Qué pintó el pintor?", origen: "Estados Unidos",
    dificultad: "Difícil", habilidades: ["Abstracción"],
    pais: "Mexico", figuritaImg: "/assets/figuritas/Mexico.png", desafioImg: "/assets/desafios/09.png",
    opciones: L("A", "B", "C", "D"), correcta: "a" },

  { n: 10, cardRef: 14, titulo: "Laberinto", origen: "Bulgaria",
    dificultad: "Difícil", habilidades: ["Pensamiento algorítmico"],
    pais: "Argentina", figuritaImg: "/assets/figuritas/Argentina.png", desafioImg: "/assets/desafios/10.png",
    opciones: N(6, 7, 8, 9), correcta: "8" },
];

export const TOTAL_FIGURITAS = DESAFIOS.length;

export function desafioPorN(n: number): Desafio | undefined {
  return DESAFIOS.find(d => d.n === n);
}
