import { useEffect, useState, type CSSProperties } from "react";
import { MEDALLAS, medallaGanada, medallasGanadas } from "../config/medallas";
import { TOTAL_MEDALLAS } from "../config/medallas";
import { TOTAL_PAGINAS } from "../config/desafios";

type Props = {
  /** Página recién completada (la que entrega la medalla). */
  pagina: number;
  /** Cuántas páginas tiene completas la clase. */
  paginasCompletas: number;
  /** true si ya completó las 4 páginas. */
  albumCompleto: boolean;
  onCerrar: () => void;
};

/** Se muestra al completar una página: entrega su medalla y deja ver las que
 *  faltan (en gris). Al completar las 4 páginas se suma la medalla final. */
export default function Felicitacion({
  pagina,
  paginasCompletas,
  albumCompleto,
  onCerrar,
}: Props) {
  const ganadas = medallasGanadas(paginasCompletas);
  // Las medallas ya ganadas se muestran de entrada; la nueva se revela con
  // animación para que se sienta el premio.
  const [revelada, setRevelada] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setRevelada(true);
      return;
    }
    const t = setTimeout(() => setRevelada(true), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="feli-overlay">
      <div className="feli__festejo" aria-hidden="true">
        <i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i />
      </div>
      <div className="feli" role="dialog" aria-modal="true" aria-labelledby="feli-titulo">
        <div className="feli__marca" aria-hidden="true">
          {albumCompleto ? `${TOTAL_PAGINAS}/${TOTAL_PAGINAS}` : `Página ${pagina}`}
        </div>
        <h2 id="feli-titulo">
          {albumCompleto ? "¡Álbum completo!" : "¡Página completa!"}
        </h2>
        <p>
          {albumCompleto
            ? `¡Felicitaciones! Entre toda la clase completaron las ${TOTAL_PAGINAS} páginas del Álbum Bebras 2026 y se ganaron las ${TOTAL_MEDALLAS} medallas del pensamiento computacional.`
            : `¡Muy bien! Entre toda la clase completaron la página ${pagina} y se ganaron una medalla más. ${
                pagina < TOTAL_PAGINAS
                  ? `Ya pueden seguir con la página ${pagina + 1}.`
                  : ""
              }`}
        </p>

        <div className="medallas">
          <div className="medallas__titulo">
            <span>Medallas desbloqueadas</span>
            <span className="medallas__contador">
              {ganadas}/{TOTAL_MEDALLAS}
            </span>
          </div>

          <ul className="medallas__grid">
            {MEDALLAS.map((m, i) => {
              const tiene = medallaGanada(m, paginasCompletas);
              // La medalla de la página recién completada entra con animación
              const esNueva = m.pagina === pagina || (albumCompleto && m.pagina === null);
              const visible = tiene && (!esNueva || revelada);
              const style = { "--i": i } as CSSProperties;
              return (
                <li
                  key={m.id}
                  className={
                    "medalla" +
                    (visible ? " medalla--on" : "") +
                    (!tiene ? " medalla--pendiente" : "")
                  }
                  style={style}
                >
                  {esNueva && visible && (
                    <>
                      <span className="medalla__rayos" aria-hidden="true" />
                      <span className="medalla__glow" aria-hidden="true" />
                    </>
                  )}
                  <MedallaImg src={m.img} habilidad={m.habilidad} />
                  {tiene ? (
                    <span className="medalla__check" aria-hidden="true">✓</span>
                  ) : (
                    <span className="medalla__candado" aria-hidden="true">🔒</span>
                  )}
                  <span className="medalla__pie">
                    {tiene
                      ? m.habilidad
                      : m.pagina === null
                        ? "Completá el álbum"
                        : `Página ${m.pagina}`}
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="medallas__cierre">
            {albumCompleto
              ? "¡Colección completa! Cada medalla premia una forma de pensar que usaron para resolver los desafíos."
              : `Faltan ${TOTAL_MEDALLAS - ganadas} medallas. Se ganan completando las páginas que quedan.`}
          </p>
        </div>

        <button type="button" className="feli__cerrar" onClick={onCerrar}>
          {albumCompleto ? "Ver el álbum" : "Seguir jugando"}
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
