import { FIGURITAS_POR_PAGINA } from "../config/desafios";

type Props = {
  /** Figuritas ya pegadas (subconjunto de `items`). */
  desbloqueadas: Set<number>;
  /** Figuritas que representa la barra. Por defecto, las 10 de la página 1. */
  items?: number[];
};

/** Barra segmentada: un tramo por figurita de la página. */
export default function BarraProgreso({ desbloqueadas, items }: Props) {
  const segmentos =
    items ?? Array.from({ length: FIGURITAS_POR_PAGINA }, (_, i) => i + 1);
  const hechas = segmentos.filter((n) => desbloqueadas.has(n)).length;
  return (
    <div
      className="barra"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={segmentos.length}
      aria-valuenow={hechas}
      aria-label={`Progreso de la página: ${hechas} de ${segmentos.length} figuritas`}
    >
      {segmentos.map((n) => (
        <span
          key={n}
          className={`barra__seg${desbloqueadas.has(n) ? " barra__seg--on" : ""}`}
        />
      ))}
    </div>
  );
}
