import { useEffect, useState, type CSSProperties } from "react";
import { MEDALLAS } from "../config/medallas";

type Props = {
  onCerrar: () => void;
};

/** Se muestra al llegar a 10/10. Sin competencia: lo importante es participar.
 *  El premio son las 5 medallas de Pensamiento Computacional, que se
 *  desbloquean una por una y quedan a la vista todas juntas. */
export default function Felicitacion({ onCerrar }: Props) {
  // Cuántas medallas ya se revelaron (para el contador y el cierre del reveal).
  const [reveladas, setReveladas] = useState(0);
  const totalMedallas = MEDALLAS.length;
  const completo = reveladas >= totalMedallas;

  // Revela las medallas de a una, con ritmo (efecto "premio").
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setReveladas(totalMedallas);
      return;
    }
    const timers = MEDALLAS.map((_, i) =>
      setTimeout(() => setReveladas((r) => Math.max(r, i + 1)), 650 + i * 620)
    );
    return () => timers.forEach(clearTimeout);
  }, [totalMedallas]);

  return (
    <div className="feli-overlay">
      <div className="feli__festejo" aria-hidden="true">
        <i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i />
      </div>
      <div className="feli" role="dialog" aria-modal="true" aria-labelledby="feli-titulo">
        <div className="feli__marca" aria-hidden="true">10/10</div>
        <h2 id="feli-titulo">¡Álbum completo!</h2>
        <p>
          ¡Felicitaciones! Entre toda la clase pegaron las 10 figuritas del
          Álbum Bebras 2026. Y como premio, ¡se ganaron las 5 medallas del
          pensamiento computacional!
        </p>

        <div className="medallas">
          <div className="medallas__titulo">
            <span>Medallas desbloqueadas</span>
            <span className="medallas__contador">
              {Math.min(reveladas, totalMedallas)}/{totalMedallas}
            </span>
          </div>

          <ul className="medallas__grid">
            {MEDALLAS.map((m, i) => {
              const visible = i < reveladas;
              const style = { "--i": i } as CSSProperties;
              return (
                <li
                  key={m.id}
                  className={`medalla${visible ? " medalla--on" : ""}`}
                  style={style}
                >
                  <span className="medalla__rayos" aria-hidden="true" />
                  <span className="medalla__glow" aria-hidden="true" />
                  <MedallaImg src={m.img} habilidad={m.habilidad} />
                  <span className="medalla__check" aria-hidden="true">✓</span>
                </li>
              );
            })}
          </ul>

          {completo && (
            <p className="medallas__cierre">
              ¡Colección completa! Cada medalla premia una forma de pensar que
              usaron para resolver los desafíos.
            </p>
          )}
        </div>

        <button type="button" className="feli__cerrar" onClick={onCerrar}>
          Ver el álbum
        </button>
      </div>
    </div>
  );
}

/** Imagen de la medalla con fallback si el archivo no está. */
function MedallaImg({ src, habilidad }: { src: string; habilidad: string }) {
  const [rota, setRota] = useState(false);
  if (rota) {
    return (
      <span className="medalla__fallback" aria-hidden="true">
        {habilidad}
      </span>
    );
  }
  return (
    <img
      className="medalla__img"
      src={src}
      alt={`Medalla: ${habilidad}`}
      onError={() => setRota(true)}
    />
  );
}
