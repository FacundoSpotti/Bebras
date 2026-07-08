import { TOTAL_FIGURITAS } from "../config/desafios";

type Props = {
  desbloqueadas: Set<number>;
};

/** Barra segmentada de 10 tramos: rellena el tramo de cada figurita pegada. */
export default function BarraProgreso({ desbloqueadas }: Props) {
  const segmentos = Array.from({ length: TOTAL_FIGURITAS }, (_, i) => i + 1);
  return (
    <div
      className="barra"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={TOTAL_FIGURITAS}
      aria-valuenow={desbloqueadas.size}
      aria-label={`Progreso del álbum: ${desbloqueadas.size} de ${TOTAL_FIGURITAS} figuritas`}
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
