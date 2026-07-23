// Las 5 medallas del Álbum Bebras: una por cada habilidad de Pensamiento
// Computacional que cubren los 10 desafíos. Se desbloquean todas al completar
// el álbum (10/10). El arte vive en public/assets/medallas.

export type Medalla = {
  id: string;
  habilidad: string;
  img: string;
};

export const MEDALLAS: Medalla[] = [
  {
    id: "pensamiento-algoritmico",
    habilidad: "Pensamiento algorítmico",
    img: "/assets/medallas/Pensamiento-algoritmico.png",
  },
  {
    id: "abstraccion",
    habilidad: "Abstracción",
    img: "/assets/medallas/Abstraccion.png",
  },
  {
    id: "generalizacion",
    habilidad: "Generalización",
    img: "/assets/medallas/Generalizacion.png",
  },
  {
    id: "descomposicion",
    habilidad: "Descomposición",
    img: "/assets/medallas/Descomposicion.png",
  },
  {
    id: "evaluacion",
    habilidad: "Evaluación",
    img: "/assets/medallas/Evaluacion.png",
  },
];
