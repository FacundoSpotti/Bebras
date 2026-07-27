import { useEffect, useState, type CSSProperties } from "react";
import type { Desafio } from "../config/desafios";
import { cooldownRestante, formatoRestante } from "../lib/cooldown";

// Color principal de cada selección del set mundialista. Todos distintos.
export type ColorSeleccion = { bg: string; fg: string };

const COLORES_SELECCION: Record<string, ColorSeleccion> = {
  // --- Página 1 ---
  "Uruguay":        { bg: "#55b5e8", fg: "#0b2231" }, // La Celeste
  "Brasil":         { bg: "#009739", fg: "#ffffff" }, // verde de la bandera
  "Canada":         { bg: "#e4002b", fg: "#ffffff" }, // rojo maple
  "Estados Unidos": { bg: "#1e2a5c", fg: "#ffffff" }, // azul marino
  "Colombia":       { bg: "#f0a030", fg: "#3b2405" }, // amarillo dorado
  "Paraguay":       { bg: "#8e2438", fg: "#ffffff" }, // granate albirrojo
  "Ecuador":        { bg: "#ffd100", fg: "#3b2f05" }, // amarillo de La Tri
  "Panama":         { bg: "#005293", fg: "#ffffff" }, // azul de la bandera
  "Mexico":         { bg: "#d5006d", fg: "#ffffff" }, // rosa mexicano
  "Argentina":      { bg: "#7c52d8", fg: "#ffffff" }, // violeta alternativo
  // --- Página 2 ---
  "ESPAÑA":         { bg: "#c60b1e", fg: "#ffffff" },
  "FRANCIA":        { bg: "#12285f", fg: "#ffffff" },
  "ITALIA":         { bg: "#1e6cb4", fg: "#ffffff" },
  "ALEMANIA":       { bg: "#2b2b2b", fg: "#ffffff" },
  "PORTUGAL":       { bg: "#046a38", fg: "#ffffff" },
  "INGLATERRA":     { bg: "#e8ecef", fg: "#0b0b0d" },
  "PAÍSES BAJOS":   { bg: "#ff6b1a", fg: "#ffffff" },
  "BÉLGICA":        { bg: "#c8102e", fg: "#ffffff" },
  "CROACIA":        { bg: "#d02b3c", fg: "#ffffff" },
  "SUIZA":          { bg: "#e30513", fg: "#ffffff" },
  // --- Página 3 ---
  "CHEQUIA":        { bg: "#11457e", fg: "#ffffff" },
  "ESCOCIA":        { bg: "#0d3b76", fg: "#ffffff" },
  "NORUEGA":        { bg: "#ba0c2f", fg: "#ffffff" },
  "SUECIA":         { bg: "#fecc02", fg: "#00295b" },
  "TURKIYE":        { bg: "#e30a17", fg: "#ffffff" },
  "JAPÓN":          { bg: "#0a1e46", fg: "#ffffff" },
  "COREA DEL SUR":  { bg: "#c8102e", fg: "#ffffff" },
  "ARABIA SAUDITA": { bg: "#006c35", fg: "#ffffff" },
  "AUSTRALIA":      { bg: "#f5c518", fg: "#123122" },
  "NUEVA ZELANDA":  { bg: "#1b1b1b", fg: "#ffffff" },
  // --- Página 4 ---
  "MARRUECOS":      { bg: "#b8112f", fg: "#ffffff" },
  "EGIPTO":         { bg: "#c8102e", fg: "#ffffff" },
  "SENEGAL":        { bg: "#00853f", fg: "#ffffff" },
  "GHANA":          { bg: "#f8b300", fg: "#3b2405" },
  "TÚNEZ":          { bg: "#e70013", fg: "#ffffff" },
  "ARGELIA":        { bg: "#007a3d", fg: "#ffffff" },
  "SUDÁFRICA":      { bg: "#007749", fg: "#ffffff" },
  "CONGO":          { bg: "#d21034", fg: "#ffffff" },
  "CABO VERDE":     { bg: "#003893", fg: "#ffffff" },
  "CURAZAO":        { bg: "#002b7f", fg: "#ffffff" },
};

export function colorSeleccion(pais: string): ColorSeleccion {
  return COLORES_SELECCION[pais] ?? { bg: "#0b0b0d", fg: "#ffffff" };
}

const GRIS_COOLDOWN: ColorSeleccion = { bg: "#c1c1c8", fg: "#3a3a42" };

// Partículas de la celebración de desbloqueo (colores de la paleta THEA)
const CONFETTI = ["#ffbc00", "#fb4747", "#fb5d7f", "#8a5ad1", "#00b8a2", "#4478be"];

type Props = {
  desafio: Desafio;
  claseId: string;
  pegada: boolean;
  autor: string | null; // quién la pegó (si se sabe)
  animada: boolean;     // recién desbloqueada → celebración
  indice: number;       // posición en la grilla, para la animación de entrada
  onAbrir: (n: number) => void;
};

export default function Figurita({ desafio, claseId, pegada, autor, animada, indice, onAbrir }: Props) {
  const [imgRota, setImgRota] = useState(false);
  const [restanteCd, setRestanteCd] = useState(() =>
    cooldownRestante(claseId, desafio.n)
  );

  // Refresca el estado de cooldown de ESTA tarjeta (1s). Si no hay
  // cooldown el estado queda en 0 y React no re-renderiza.
  useEffect(() => {
    if (pegada) return;
    const t = setInterval(() => {
      setRestanteCd(cooldownRestante(claseId, desafio.n));
    }, 1000);
    return () => clearInterval(t);
  }, [claseId, desafio.n, pegada]);

  const enCooldown = !pegada && restanteCd > 0;
  const color = enCooldown ? GRIS_COOLDOWN : colorSeleccion(desafio.pais);
  const num = String(desafio.n).padStart(2, "0");
  const delayEntrada = { "--entrada-delay": `${indice * 60}ms` } as CSSProperties;

  if (pegada) {
    const c = colorSeleccion(desafio.pais);
    return (
      <button
        type="button"
        className={`figu figu--pegada${animada ? " figu--anim" : ""}`}
        style={delayEntrada}
        onClick={() => onAbrir(desafio.n)}
        aria-label={`Figurita ${num}: ${desafio.pais}, pegada${autor ? ` por ${autor}` : ""}. Tocá para ver el desafío.`}
      >
        {animada && (
          <span className="figu__festejo" aria-hidden="true">
            {CONFETTI.concat(CONFETTI).map((cc, i) => (
              <i key={i} style={{ background: cc }} />
            ))}
          </span>
        )}
        <span className="figu__check" aria-hidden="true">✓ Pegada</span>
        {imgRota ? (
          // Fallback si falta la imagen del país
          <span className="figu__fallback" style={{ background: c.bg, color: c.fg }}>
            <span>{desafio.pais}</span>
          </span>
        ) : (
          <span className="figu__img-wrap">
            <img
              src={desafio.figuritaImg}
              alt={`Figurita de ${desafio.pais}`}
              onError={() => setImgRota(true)}
            />
          </span>
        )}
        <span className="figu__ver" aria-hidden="true">Ver desafío</span>
        <span className="figu__foot" style={{ background: c.bg, color: c.fg }}>
          {desafio.pais}
          {autor && <span className="figu__autor">la pegó {autor}</span>}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`figu${enCooldown ? " figu--cooldown" : ""}`}
      style={delayEntrada}
      onClick={() => onAbrir(desafio.n)}
      aria-label={
        enCooldown
          ? `Figurita ${num}: ${desafio.titulo}. En pausa, podés volver a intentar en ${formatoRestante(restanteCd)}.`
          : `Figurita ${num}: ${desafio.titulo}. Todavía no está pegada, tocá para abrir el desafío.`
      }
    >
      <span className="figu__head" style={{ background: color.bg, color: color.fg }}>
        <span className="figu__pais">{desafio.pais}</span>
        <span className="figu__dif">{desafio.dificultad}</span>
      </span>
      <span className="figu__cuerpo">
        <small>Figurita</small>
        <span className="figu__numero">{num}</span>
        {enCooldown && (
          <span className="figu__cooldown-chip">
            En pausa · {formatoRestante(restanteCd)}
          </span>
        )}
      </span>
      <span className="figu__foot" style={{ background: color.bg, color: color.fg }}>
        {desafio.titulo}
      </span>
    </button>
  );
}
