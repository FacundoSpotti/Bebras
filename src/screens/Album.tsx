import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { supabase, supabaseConfigurado, type ClaseRow, type ProgresoRow } from "../lib/supabase";
import { DESAFIOS, TOTAL_FIGURITAS, desafioPorN } from "../config/desafios";
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
  const [feliCerrada, setFeliCerrada] = useState(false);
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
      setPegadas(
        new Map(
          ((progData ?? []) as { figurita: number; autor: string | null }[]).map((p) => [
            p.figurita,
            p.autor,
          ])
        )
      );
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
  const completo = pegadas.size >= TOTAL_FIGURITAS;

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
            {pegadas.size}/{TOTAL_FIGURITAS}
          </div>
        </div>
      </section>

      <section className="progreso">
        <p className="progreso__label">Progreso</p>
        <BarraProgreso desbloqueadas={new Set(pegadas.keys())} />
      </section>

      <main className="grilla">
        {DESAFIOS.map((d, i) => (
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

      {completo && !feliCerrada && <Felicitacion onCerrar={() => setFeliCerrada(true)} />}

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
