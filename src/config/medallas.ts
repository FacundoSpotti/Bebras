// Las 5 medallas del Álbum Bebras: una por cada habilidad de Pensamiento
// Computacional. Se ganan de a una: cada página completada entrega su
// medalla, y la quinta corona el álbum completo (las 4 páginas).
// El arte vive en public/assets/medallas.

import { TOTAL_PAGINAS } from "./desafios";

export type Medalla = {
  id: string;
  habilidad: string;
  img: string;
  /** Página que la desbloquea (1..4). `null` = se gana al completar el álbum. */
  pagina: number | null;
};

export const MEDALLAS: Medalla[] = [
  {
    id: "pensamiento-algoritmico",
    habilidad: "Pensamiento algorítmico",
    img: "/assets/medallas/Pensamiento-algoritmico.png",
    pagina: 1,
  },
  {
    id: "abstraccion",
    habilidad: "Abstracción",
    img: "/assets/medallas/Abstraccion.png",
    pagina: 2,
  },
  {
    id: "generalizacion",
    habilidad: "Generalización",
    img: "/assets/medallas/Generalizacion.png",
    pagina: 3,
  },
  {
    id: "descomposicion",
    habilidad: "Descomposición",
    img: "/assets/medallas/Descomposicion.png",
    pagina: 4,
  },
  {
    id: "evaluacion",
    habilidad: "Evaluación",
    img: "/assets/medallas/Evaluacion.png",
    pagina: null, // álbum completo
  },
];

export const TOTAL_MEDALLAS = MEDALLAS.length;

/** La medalla que entrega una página (undefined si esa página no da). */
export function medallaDePagina(pagina: number): Medalla | undefined {
  return MEDALLAS.find(m => m.pagina === pagina);
}

/** La medalla final (la del álbum completo). */
export function medallaFinal(): Medalla | undefined {
  return MEDALLAS.find(m => m.pagina === null);
}

/**
 * Cuántas medallas tiene ganadas la clase: una por cada página completa,
 * más la final si completó las 4 páginas.
 */
export function medallasGanadas(paginasCompletas: number): number {
  const porPagina = Math.min(paginasCompletas, TOTAL_PAGINAS);
  const final = paginasCompletas >= TOTAL_PAGINAS ? 1 : 0;
  return porPagina + final;
}

/** ¿Esta medalla ya está ganada, con N páginas completas? */
export function medallaGanada(m: Medalla, paginasCompletas: number): boolean {
  if (m.pagina === null) return paginasCompletas >= TOTAL_PAGINAS;
  return paginasCompletas >= m.pagina;
}
