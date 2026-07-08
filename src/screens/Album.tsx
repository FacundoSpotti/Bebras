import { useCallback, useEffect, useState } from "react";
import { supabase, supabaseConfigurado, type ClaseRow, type ProgresoRow } from "../lib/supabase";
import { DESAFIOS, TOTAL_FIGURITAS, desafioPorN } from "../config/desafios";
import BarraProgreso from "../components/BarraProgreso";
import Figurita from "../components/Figurita";
import ModalDesafio from "../components/ModalDesafio";
import Felicitacion from "../components/Felicitacion";

type Props = { claseId: string };

type Estado = "cargando" | "ok" | "no-encontrada" | "error";

// Franjas decorativas de la banda del título (como en el prototipo)
const DECO = ["#ffbc00", "#fb4747", "#fb5d7f", "#8a5ad1"];

export default function Album({ claseId }: Props) {
  const [estado, setEstado] = useState<Estado>("cargando");
  const [clase, setClase] = useState<ClaseRow | null>(null);
  const [pegadas, setPegadas] = useState<Set<number>>(new Set());
  const [animadas, setAnimadas] = useState<Set<number>>(new Set());
  const [modalN, setModalN] = useState<number | null>(null);
  const [feliCerrada, setFeliCerrada] = useState(false);

  const agregarFigurita = useCallback((n: number, animar: boolean) => {
    setPegadas((prev) => {
      if (prev.has(n)) return prev;
      const next = new Set(prev);
      next.add(n);
      return next;
    });
    if (animar) {
      setAnimadas((prev) => new Set(prev).add(n));
    }
  }, []);

  // Carga inicial: clase + progreso
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
        .select("figurita")
        .eq("clase_id", claseId);
      if (cancelado) return;
      if (progError) {
        setEstado("error");
        return;
      }
      setPegadas(new Set((progData ?? []).map((p: { figurita: number }) => p.figurita)));
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
          const fila = payload.new as ProgresoRow;
          agregarFigurita(fila.figurita, true);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [claseId, agregarFigurita]);

  // Respuesta correcta → upsert compartido (idempotente)
  const desbloquear = useCallback(
    async (n: number): Promise<boolean> => {
      const { error } = await supabase
        .from("progreso")
        .upsert({ clase_id: claseId, figurita: n }, { onConflict: "clase_id,figurita" });
      if (error) return false;
      agregarFigurita(n, true);
      return true;
    },
    [claseId, agregarFigurita]
  );

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
        <p>Un segundito, estamos despegando las figuritas. ✨</p>
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

  const desafioModal = modalN != null ? desafioPorN(modalN) : undefined;
  const completo = pegadas.size >= TOTAL_FIGURITAS;

  return (
    <div>
      <header className="nav">
        <img className="nav__logo" src="/assets/logotipo.svg" alt="THEA — the electric academy" />
        <span className="nav__clase">{clase.label}</span>
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
        <BarraProgreso desbloqueadas={pegadas} />
      </section>

      <main className="grilla">
        {DESAFIOS.map((d) => (
          <Figurita
            key={d.n}
            desafio={d}
            pegada={pegadas.has(d.n)}
            animada={animadas.has(d.n)}
            onAbrir={setModalN}
          />
        ))}
      </main>

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
    </div>
  );
}
