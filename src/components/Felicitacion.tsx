type Props = {
  onCerrar: () => void;
};

/** Se muestra al llegar a 10/10. Sin competencia: lo importante es participar. */
export default function Felicitacion({ onCerrar }: Props) {
  return (
    <div className="feli-overlay">
      <div className="feli" role="dialog" aria-modal="true" aria-labelledby="feli-titulo">
        <div className="feli__emoji" aria-hidden="true">🎉🏆🎉</div>
        <h2 id="feli-titulo">¡Álbum completo!</h2>
        <p>
          ¡Felicitaciones! Entre toda la clase pegaron las 10 figuritas del
          Álbum Bebras 2026. Resolvieron cada desafío pensando en equipo, y eso
          es lo más importante: haber participado y aprendido juntos.
        </p>

        {/* PREMIO: definir — completar cuando esté el premio final
            (imagen, código, certificado, etc.) */}
        <div className="feli__premio">
          🎁 Acá va el premio para la clase.
          <br />
          <small>(Muy pronto: ¡estamos preparando algo lindo!)</small>
        </div>

        <button type="button" className="feli__cerrar" onClick={onCerrar} autoFocus>
          Ver el álbum
        </button>
      </div>
    </div>
  );
}
