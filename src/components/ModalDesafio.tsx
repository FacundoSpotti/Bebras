import { useEffect, useRef, useState } from "react";
import type { Desafio } from "../config/desafios";
import { cooldownRestante, formatoRestante, iniciarCooldown } from "../lib/cooldown";
import { colorSeleccion } from "./Figurita";

type Props = {
  desafio: Desafio;
  claseId: string;
  pegada: boolean; // la clase ya la desbloqueó (puede pasar con el modal abierto)
  onCorrecta: (n: number) => Promise<boolean>; // true si el guardado salió bien
  onClose: () => void;
};

type Feedback =
  | { tipo: "error" }         // respuesta incorrecta
  | { tipo: "guardando" }
  | { tipo: "fallo-guardado" } // upsert falló (red, etc.)
  | null;

export default function ModalDesafio({ desafio, claseId, pegada, onCorrecta, onClose }: Props) {
  const [restante, setRestante] = useState(() => cooldownRestante(claseId, desafio.n));
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [imgRota, setImgRota] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const cerrarRef = useRef<HTMLButtonElement>(null);

  const color = colorSeleccion(desafio.pais);
  const num = String(desafio.n).padStart(2, "0");
  const enCooldown = restante > 0;
  const respondiendo = feedback?.tipo === "guardando";
  const bloqueado = enCooldown || respondiendo || pegada;

  // Cuenta regresiva del cooldown (1s)
  useEffect(() => {
    if (!enCooldown) return;
    const t = setInterval(() => {
      setRestante(cooldownRestante(claseId, desafio.n));
    }, 1000);
    return () => clearInterval(t);
  }, [enCooldown, claseId, desafio.n]);

  // Foco inicial en el botón de cerrar
  useEffect(() => {
    cerrarRef.current?.focus();
  }, []);

  // Escape: primero cierra la imagen ampliada, después el modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (lightbox) setLightbox(false);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, lightbox]);

  async function responder(id: string) {
    if (bloqueado) return;
    if (id === desafio.correcta) {
      setFeedback({ tipo: "guardando" });
      const ok = await onCorrecta(desafio.n);
      if (ok) {
        // se cierra enseguida: la celebración se ve en la figurita
        onClose();
      } else {
        setFeedback({ tipo: "fallo-guardado" });
      }
    } else {
      iniciarCooldown(claseId, desafio.n);
      setRestante(cooldownRestante(claseId, desafio.n));
      setFeedback({ tipo: "error" });
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__head" style={{ background: color.bg, color: color.fg }}>
          <div className="modal__head-info">
            <span className="modal__figunum">Figurita {num}</span>
            <span className="figu__dif">{desafio.dificultad}</span>
          </div>
          <button
            ref={cerrarRef}
            type="button"
            className="modal__x"
            onClick={onClose}
            aria-label="Cerrar desafío"
          >
            ✕
          </button>
        </div>

        <div className="modal__body">
          <h2 className="modal__titulo" id="modal-titulo">{desafio.titulo}</h2>

          {imgRota ? (
            <div className="modal__img-placeholder">
              El enunciado de este desafío todavía no está cargado.
              <br />
              (Falta la imagen <code>{desafio.desafioImg}</code>)
            </div>
          ) : (
            <>
              <button
                type="button"
                className="modal__img-btn"
                onClick={() => setLightbox(true)}
                aria-label="Ampliar el enunciado del desafío"
              >
                <img
                  className="modal__img"
                  src={desafio.desafioImg}
                  alt={`Enunciado del desafío: ${desafio.titulo}`}
                  onError={() => setImgRota(true)}
                />
                <span className="modal__img-hint">Tocá la imagen para verla más grande</span>
              </button>
            </>
          )}

          {/* Si la figurita ya está pegada, el modal es de repaso: se puede
              ver el enunciado y la respuesta, pero no volver a responder. */}
          <p className="modal__pregunta">
            {pegada ? "La respuesta correcta era:" : "¿Cuál es la respuesta?"}
          </p>

          <div className="modal__opciones">
            {desafio.opciones.map((op) => (
              <button
                key={op.id}
                type="button"
                className={`opcion${pegada && op.id === desafio.correcta ? " opcion--correcta" : ""}`}
                disabled={bloqueado}
                onClick={() => responder(op.id)}
              >
                {op.texto}
              </button>
            ))}
          </div>

          {pegada && (
            <div className="modal__feedback modal__feedback--ok" role="status">
              ¡Tu clase ya pegó esta figurita! Estás viendo el desafío resuelto.
            </div>
          )}

          {feedback?.tipo === "guardando" && (
            <div className="modal__feedback" role="status">Guardando…</div>
          )}

          {feedback?.tipo === "fallo-guardado" && (
            <div className="modal__feedback modal__feedback--error" role="alert">
              ¡Era la correcta! Pero no pudimos guardarla. Revisá tu conexión y
              probá de nuevo.
            </div>
          )}

          {feedback?.tipo === "error" && (
            <div className="modal__feedback modal__feedback--error" role="alert">
              Ups, no era esa. Podés seguir con otro desafío y volver en 5 minutos.
            </div>
          )}

          {enCooldown && !pegada && (
            <div className="modal__cooldown" role="status">
              Podés volver a intentar en <strong>{formatoRestante(restante)}</strong>
            </div>
          )}
        </div>
      </div>

      {lightbox && !imgRota && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Enunciado ampliado: ${desafio.titulo}`}
          onClick={(e) => {
            e.stopPropagation();
            setLightbox(false);
          }}
        >
          <button
            type="button"
            className="lightbox__x"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(false);
            }}
            aria-label="Cerrar imagen ampliada"
            autoFocus
          >
            ✕
          </button>
          <img
            className="lightbox__img"
            src={desafio.desafioImg}
            alt={`Enunciado del desafío: ${desafio.titulo}`}
          />
          <p className="lightbox__hint">Tocá en cualquier lado para volver</p>
        </div>
      )}
    </div>
  );
}
