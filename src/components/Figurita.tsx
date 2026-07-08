import { useState } from "react";
import type { Desafio } from "../config/desafios";

// Paleta viva del prototipo, cíclica por posición de figurita.
const PALETA = ["#fb4747", "#ffbc00", "#fb5d7f", "#8a5ad1", "#00b8a2", "#4478be"];

export function colorFigurita(n: number): string {
  return PALETA[(n - 1) % PALETA.length];
}

type Props = {
  desafio: Desafio;
  pegada: boolean;
  animada: boolean; // recién desbloqueada → animación de "pegado"
  onAbrir: (n: number) => void;
};

export default function Figurita({ desafio, pegada, animada, onAbrir }: Props) {
  const [imgRota, setImgRota] = useState(false);
  const color = colorFigurita(desafio.n);
  const num = String(desafio.n).padStart(2, "0");

  if (pegada) {
    return (
      <div
        className={`figu figu--pegada${animada ? " figu--anim" : ""}`}
        aria-label={`Figurita ${num}: ${desafio.pais}, ¡pegada!`}
      >
        <span className="figu__check" aria-hidden="true">✓ ¡Pegada!</span>
        {imgRota ? (
          // Fallback si falta la imagen del país
          <div className="figu__fallback" style={{ background: color }}>
            <span>{desafio.pais}</span>
          </div>
        ) : (
          <div className="figu__img-wrap">
            <img
              src={desafio.figuritaImg}
              alt={`Figurita de ${desafio.pais}`}
              onError={() => setImgRota(true)}
            />
          </div>
        )}
        <div className="figu__foot" style={{ background: color }}>
          {desafio.pais}
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="figu"
      onClick={() => onAbrir(desafio.n)}
      aria-label={`Figurita ${num}: ${desafio.titulo}. Todavía no está pegada, tocá para abrir el desafío.`}
    >
      <span className="figu__head" style={{ background: color }}>
        <span className="figu__pais">{desafio.pais}</span>
        <span className="figu__dif">{desafio.dificultad}</span>
      </span>
      <span className="figu__cuerpo">
        <small>Figurita</small>
        <span className="figu__numero">{num}</span>
      </span>
      <span className="figu__foot" style={{ background: color }}>
        {desafio.titulo}
      </span>
    </button>
  );
}
