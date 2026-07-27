import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { supabase, supabaseConfigurado, type ClaseRow, type ProgresoRow } from "../lib/supabase";
import {
  TOTAL_FIGURITAS,
  TOTAL_PAGINAS,
  FIGURITAS_POR_PAGINA,
  desafioPorN,
  desafiosDePagina,
  pegadasDePagina,
  paginaCompleta,
  paginaDesbloqueada,
  ultimaPaginaDesbloqueada,
} from "../config/desafios";
import { getNombreEstudiante, setNombreEstudiante } from "../lib/estudiante";
import BarraProgreso from "../components/BarraProgreso";
import Figurita from "../components/Figurita";
import ModalDesafio from "../components/ModalDesafio";
import Felicitacion from "../components/Felicitacion";

type Props = { claseId: string };

type Estado = "cargando" | "ok" | "no-encontrada" | "error";

type Toast = { id: number; texto: string };

// Franjas decorativas de la banda del título (como en el prototipo)
const DECO = ["#ffbc00", "#fb4747", "#fb5d7f", "#8a5ad1"];

export default function Album({ claseId }: Props) {
  const [estado, setEstado] = useState<Estado>("cargando");
  const [clase, setClase] = useState<ClaseRow | null>(null);
  // figurita → autor (null si no sabemos quién la pegó)
  const [pegadas, setPegadas] = useState<Map<number, string | null>>(new Map());
  const [animadas, setAnimadas] = useState<Set<number>>(new Set());
  const [modalN, setModalN] = useState<number | null>(null);
  // Página que se está mirando (1..4). Se ajusta sola al cargar el progreso.
  const [pagina, setPagina] = useState(1);
  // Página cuya medalla se está festejando (null = no hay festejo abierto).
  const [festejo, setFestejo] = useState<number | null>(null);
  // Páginas que ya estaban completas al abrir: no se vuelven a festejar.
  const yaFestejadas = useRef<Set<number> | null>(null);
  const [nombre, setNombre] = useState<string | null>(() => getNombreEstudiante());
  const [nombreInput, setNombreInput] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const nombreRef = useRef(nombre);
  nombreRef.current = nombre;

  const agregarFigurita = useCallback((n: number, autor: string | null, animar: boolean) => {
    setPegadas((prev) => {
      if (prev.has(n)) return prev;
      const next = new Map(prev);
      next.set(n, autor);
      return next;
    });
    if (animar) {
      setAnimadas((prev) => new Set(prev).add(n));
    }
  }, []);

  const avisar = useCallback((texto: string) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, texto }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  // Carga inicial: clase + progreso (con autor)
  useEffect(() => {
    if (!supabaseConfigurado) {
      setEstado("error");
      return;
    }
    let cancelado = false;

    (async () => {
      const { data: claseData, error: claseError } = await supabase
        .from("clases")
        .select("*")
        .eq("id", claseId)
        .maybeSingle();
      if (cancelado) return;
      if (claseError) {
        setEstado("error");
        return;
      }
      if (!claseData) {
        setEstado("no-encontrada");
        return;
      }
      setClase(claseData as ClaseRow);

      const { data: progData, error: progError } = await supabase
        .from("progreso")
        .select("figurita, autor")
        .eq("clase_id", claseId);
      if (cancelado) return;
      if (progError) {
        setEstado("error");
        return;
      }
      const mapa = new Map(
        ((progData ?? []) as { figurita: number; autor: string | null }[]).map((p) => [
          p.figurita,
          p.autor,
        ])
      );
      setPegadas(mapa);
      // Las páginas que ya venían completas no disparan festejo al entrar.
      const set = new Set(mapa.keys());
      const completasAlEntrar = new Set<number>();
      for (let p = 1; p <= TOTAL_PAGINAS; p++) {
        if (paginaCompleta(p, set)) completasAlEntrar.add(p);
      }
      yaFestejadas.current = completasAlEntrar;
      // Arrancar en la última página desbloqueada (donde está el trabajo).
      setPagina(ultimaPaginaDesbloqueada(set));
      setEstado("ok");
    })();

    return () => {
      cancelado = true;
    };
  }, [claseId]);

  // Realtime: nuevos desbloqueos de esta clase (hechos por cualquiera)
  useEffect(() => {
    if (!supabaseConfigurado) return;
    const channel = supabase
      .channel(`progreso:${claseId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "progreso", filter: `clase_id=eq.${claseId}` },
        (payload) => {
          const fila = payload.new as ProgresoRow & { autor?: string | null };
          const autor = fila.autor ?? null;
          agregarFigurita(fila.figurita, autor, true);
          // Aviso solo si lo pegó otra persona (mi propio acierto ya se ve)
          if (autor && autor !== nombreRef.current) {
            const d = desafioPorN(fila.figurita);
            avisar(`${autor} pegó la figurita ${String(fila.figurita).padStart(2, "0")}${d ? ` · ${d.pais}` : ""}`);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [claseId, agregarFigurita, avisar]);

  // Presencia: el estudiante se anuncia en el canal de su clase para que
  // el docente pueda ver en vivo quién está conectado (estilo Kahoot).
  // Es efímero: al cerrar la pestaña desaparece solo, no se guarda nada.
  useEffect(() => {
    if (!supabaseConfigurado || estado !== "ok" || !nombre) return;
    const channel = supabase.channel(`presencia:${claseId}`, {
      config: { presence: { key: nombre } },
    });
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channel.track({ nombre, desde: Date.now() });
      }
    });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [claseId, estado, nombre]);

  // Respuesta correcta → upsert compartido (idempotente), con autor
  const desbloquear = useCallback(
    async (n: number): Promise<boolean> => {
      const { error } = await supabase
        .from("progreso")
        .upsert(
          { clase_id: claseId, figurita: n, autor: nombreRef.current },
          { onConflict: "clase_id,figurita" }
        );
      if (error) return false;
      agregarFigurita(n, nombreRef.current, true);
      return true;
    },
    [claseId, agregarFigurita]
  );

  // Festejo: cuando una página se completa DURANTE la sesión, entrega su
  // medalla. Las que ya venían completas al entrar no vuelven a festejarse
  // (para eso está el botón "Ver nuestras medallas").
  useEffect(() => {
    if (estado !== "ok" || !yaFestejadas.current) return;
    const set = new Set(pegadas.keys());
    for (let p = 1; p <= TOTAL_PAGINAS; p++) {
      if (paginaCompleta(p, set) && !yaFestejadas.current.has(p)) {
        yaFestejadas.current.add(p);
        setFestejo(p);
        break;
      }
    }
  }, [pegadas, estado]);

  function guardarNombre(e: FormEvent) {
    e.preventDefault();
    const n = nombreInput.trim();
    if (!n) return;
    setNombreEstudiante(n);
    setNombre(n);
  }

  if (!supabaseConfigurado) {
    return (
      <div className="estado">
        <h2>Falta configurar la app</h2>
        <p>
          No están las variables de Supabase (<code>VITE_SUPABASE_URL</code> y{" "}
          <code>VITE_SUPABASE_ANON_KEY</code>). Avisale a tu docente o al equipo THEA.
        </p>
      </div>
    );
  }

  if (estado === "cargando") {
    return (
      <div className="estado">
        <h2>Cargando tu álbum…</h2>
        <p>Un segundito, estamos despegando las figuritas.</p>
      </div>
    );
  }

  if (estado === "no-encontrada") {
    return (
      <div className="estado">
        <h2>No encontramos esa clase</h2>
        <p>
          Puede que el link esté incompleto. Pedile el link a tu docente y
          probá de nuevo.
        </p>
        <a className="estado__accion" href="#/">Ir al inicio</a>
      </div>
    );
  }

  if (estado === "error" || !clase) {
    return (
      <div className="estado">
        <h2>Algo salió mal</h2>
        <p>No pudimos cargar el álbum. Revisá tu conexión y recargá la página.</p>
        <a className="estado__accion" href="#/">Ir al inicio</a>
      </div>
    );
  }

  // Antes de entrar al álbum, cada estudiante pone su nombre (una sola vez
  // por dispositivo). Sirve para el registro de quién pega cada figurita.
  if (!nombre) {
    return (
      <div className="onb">
        <form className="onb__card gate" onSubmit={guardarNombre}>
          <img
            className="onb__logo"
            src="/assets/Property 1=Default.svg"
            alt="THEA — the electric academy"
          />
          <h1>¡Hola!</h1>
          <p className="onb__sub">
            Estás entrando al álbum de <strong>{clase.label}</strong>.
            <br />
            Contanos tu nombre para saber quién pega cada figurita.
          </p>
          <div className="onb__form">
            <label>
              Tu nombre
              <input
                type="text"
                value={nombreInput}
                onChange={(e) => setNombreInput(e.target.value)}
                placeholder="Escribí tu nombre"
                maxLength={30}
                autoFocus
              />
            </label>
            <button type="submit" className="onb__submit" disabled={!nombreInput.trim()}>
              Entrar al álbum
            </button>
          </div>
        </form>
      </div>
    );
  }

  const desafioModal = modalN != null ? desafioPorN(modalN) : undefined;
  const setPegadas_ = new Set(pegadas.keys());
  const completo = pegadas.size >= TOTAL_FIGURITAS;

  // Estado de la página que se está mirando
  const abierta = paginaDesbloqueada(pagina, setPegadas_);
  const desafiosPag = desafiosDePagina(pagina);
  const pegadasPag = pegadasDePagina(pagina, setPegadas_);
  // Cuántas páginas completas tiene la clase (define las medallas ganadas)
  let paginasCompletas = 0;
  for (let p = 1; p <= TOTAL_PAGINAS; p++) {
    if (paginaCompleta(p, setPegadas_)) paginasCompletas++;
  }

  // Scoreboard: cuántas figuritas pegó cada estudiante (y cuáles)
  const score = new Map<string, number[]>();
  for (const [fig, autor] of pegadas) {
    if (!autor) continue;
    const lista = score.get(autor) ?? [];
    lista.push(fig);
    score.set(autor, lista);
  }
  const ranking = [...score.entries()]
    .map(([autor, figus]) => ({ autor, figus: figus.sort((a, b) => a - b) }))
    .sort((a, b) => b.figus.length - a.figus.length || a.autor.localeCompare(b.autor));

  return (
    <div>
      <header className="nav">
        <img className="nav__logo" src="/assets/logotipo.svg" alt="THEA — the electric academy" />
        <span className="nav__clase">
          {clase.label}
          <span className="nav__usuario">{nombre}</span>
        </span>
      </header>

      <section className="banda">
        <div className="banda__titulos">
          <h1>Album Bebras 2026</h1>
          <p>Desafíos de ingenio</p>
        </div>
        <div className="banda__derecha" aria-hidden="true">
          <div className="banda__deco">
            {DECO.map((c) => (
              <span key={c} style={{ background: c }} />
            ))}
          </div>
          <div className="banda__contador">
            {pegadasPag}/{FIGURITAS_POR_PAGINA}
          </div>
        </div>
      </section>

      {/* Navegación entre las 4 páginas del álbum */}
      <section className="paginas" aria-label="Páginas del álbum">
        <button
          type="button"
          className="paginas__flecha"
          onClick={() => setPagina((p) => Math.max(1, p - 1))}
          disabled={pagina <= 1}
          aria-label="Página anterior"
        >
          ‹
        </button>
        <div className="paginas__lista">
          {Array.from({ length: TOTAL_PAGINAS }, (_, i) => i + 1).map((p) => {
            const libre = paginaDesbloqueada(p, setPegadas_);
            const lista = paginaCompleta(p, setPegadas_);
            return (
              <button
                key={p}
                type="button"
                className={
                  "paginas__item" +
                  (p === pagina ? " paginas__item--activa" : "") +
                  (!libre ? " paginas__item--bloqueada" : "") +
                  (lista ? " paginas__item--completa" : "")
                }
                onClick={() => setPagina(p)}
                aria-current={p === pagina ? "page" : undefined}
                aria-label={
                  `Página ${p}` +
                  (lista ? ", completa" : !libre ? ", bloqueada" : "") +
                  `: ${pegadasDePagina(p, setPegadas_)} de ${FIGURITAS_POR_PAGINA} figuritas`
                }
              >
                <span className="paginas__num">{p}</span>
                <span className="paginas__estado">
                  {lista ? "✓" : !libre ? "🔒" : `${pegadasDePagina(p, setPegadas_)}/${FIGURITAS_POR_PAGINA}`}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="paginas__flecha"
          onClick={() => setPagina((p) => Math.min(TOTAL_PAGINAS, p + 1))}
          disabled={pagina >= TOTAL_PAGINAS}
          aria-label="Página siguiente"
        >
          ›
        </button>
        <span className="paginas__total">
          Álbum completo: {pegadas.size}/{TOTAL_FIGURITAS}
        </span>
      </section>

      <section className="progreso">
        <p className="progreso__label">Progreso · Página {pagina}</p>
        <BarraProgreso
          desbloqueadas={new Set(desafiosPag.filter((d) => pegadas.has(d.n)).map((d) => d.n))}
          items={desafiosPag.map((d) => d.n)}
        />
        {paginasCompletas > 0 && (
          <button
            type="button"
            className="ver-medallas"
            onClick={() => setFestejo(Math.min(paginasCompletas, TOTAL_PAGINAS))}
          >
            Ver nuestras medallas
          </button>
        )}
      </section>

      {abierta ? (
        <main className="grilla">
          {desafiosPag.map((d, i) => (
            <Figurita
              key={d.n}
              desafio={d}
              claseId={claseId}
              pegada={pegadas.has(d.n)}
              autor={pegadas.get(d.n) ?? null}
              animada={animadas.has(d.n)}
              indice={i}
              onAbrir={setModalN}
            />
          ))}
        </main>
      ) : (
        <>
          {/* Página bloqueada: se ve en blanco y negro, sin poder jugarla */}
          <div className="bloqueo">
            <p className="bloqueo__titulo">Página {pagina} bloqueada</p>
            <p className="bloqueo__texto">
              Para abrirla, primero completá la página {pagina - 1}.
            </p>
            <button
              type="button"
              className="bloqueo__accion"
              onClick={() => setPagina(pagina - 1)}
            >
              Ir a la página {pagina - 1}
            </button>
          </div>
          <main className="grilla grilla--bloqueada" aria-hidden="true">
            {desafiosPag.map((d, i) => (
              <Figurita
                key={d.n}
                desafio={d}
                claseId={claseId}
                pegada={false}
                autor={null}
                animada={false}
                indice={i}
                onAbrir={() => {}}
              />
            ))}
          </main>
        </>
      )}

      {ranking.length > 0 && (
        <section className="score">
          <h2 className="score__titulo">Scoreboard de la clase</h2>
          <p className="score__hint">Quién pegó cada figurita. Lo importante es completarlo entre todos.</p>
          <ol className="score__lista">
            {ranking.map((r, i) => (
              <li className="score__fila" key={r.autor}>
                <span className="score__pos">{i + 1}</span>
                <span className="score__nombre">
                  {r.autor}
                  {r.autor === nombre && <span className="score__vos"> (vos)</span>}
                </span>
                <span className="score__figus">
                  {r.figus.map((f) => (
                    <span className="score__chip" key={f}>{String(f).padStart(2, "0")}</span>
                  ))}
                </span>
                <span className="score__total">
                  {r.figus.length} {r.figus.length === 1 ? "figurita" : "figuritas"}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {desafioModal && (
        <ModalDesafio
          desafio={desafioModal}
          claseId={claseId}
          pegada={pegadas.has(desafioModal.n)}
          onCorrecta={desbloquear}
          onClose={() => setModalN(null)}
        />
      )}

      {festejo !== null && (
        <Felicitacion
          pagina={festejo}
          paginasCompletas={paginasCompletas}
          albumCompleto={completo}
          onCerrar={() => setFestejo(null)}
        />
      )}

      {toasts.length > 0 && (
        <div className="toasts" role="status" aria-live="polite">
          {toasts.map((t) => (
            <div className="toast" key={t.id}>{t.texto}</div>
          ))}
        </div>
      )}
    </div>
  );
}
