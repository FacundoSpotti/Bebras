import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { supabase, supabaseConfigurado, type ClaseRow, type ProgresoRow } from "../lib/supabase";
import { parseExcel, filasAClases } from "../lib/excel";
import { TOTAL_FIGURITAS } from "../config/desafios";
import { getDocenteActivo, limpiarDocenteActivo } from "../lib/sesion";
import { navegar } from "../App";

type Feedback = { tipo: "ok" | "error"; texto: string } | null;

function linkDeClase(claseId: string): string {
  return `${window.location.origin}${window.location.pathname}#/clase/${claseId}`;
}

export default function PanelDocente() {
  const docente = getDocenteActivo();
  const [clases, setClases] = useState<ClaseRow[]>([]);
  const [progreso, setProgreso] = useState<Record<string, Set<number>>>({});
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const misClasesRef = useRef<Set<string>>(new Set());

  // Guard: sin docente logueado → volver al Onboarding
  useEffect(() => {
    if (!docente) navegar("#/");
  }, [docente]);

  const cargarClases = useCallback(async () => {
    if (!docente || !supabaseConfigurado) {
      setCargando(false);
      return;
    }
    setCargando(true);
    const { data: clasesData, error } = await supabase
      .from("clases")
      .select("*")
      .eq("docente", docente)
      .order("label");
    if (error) {
      setFeedback({ tipo: "error", texto: "No pudimos cargar tus clases. Probá recargar la página." });
      setCargando(false);
      return;
    }
    const lista = (clasesData ?? []) as ClaseRow[];
    setClases(lista);
    misClasesRef.current = new Set(lista.map((c) => c.id));

    const mapa: Record<string, Set<number>> = {};
    for (const c of lista) mapa[c.id] = new Set();
    if (lista.length > 0) {
      const { data: progData } = await supabase
        .from("progreso")
        .select("clase_id, figurita")
        .in("clase_id", lista.map((c) => c.id));
      for (const p of (progData ?? []) as ProgresoRow[]) {
        mapa[p.clase_id]?.add(p.figurita);
      }
    }
    setProgreso(mapa);
    setCargando(false);
  }, [docente]);

  useEffect(() => {
    cargarClases();
  }, [cargarClases]);

  // Progreso en vivo: cualquier INSERT en progreso de una de mis clases
  useEffect(() => {
    if (!supabaseConfigurado || !docente) return;
    const channel = supabase
      .channel("progreso:panel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "progreso" },
        (payload) => {
          const fila = payload.new as ProgresoRow;
          if (!misClasesRef.current.has(fila.clase_id)) return;
          setProgreso((prev) => {
            const next = { ...prev };
            next[fila.clase_id] = new Set(next[fila.clase_id] ?? []);
            next[fila.clase_id].add(fila.figurita);
            return next;
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [docente]);

  async function subirExcel(e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = ""; // permite re-subir el mismo archivo
    if (!archivo || !docente) return;
    setFeedback(null);
    setSubiendo(true);
    try {
      const filas = await parseExcel(await archivo.arrayBuffer());
      if (filas.length === 0) {
        setFeedback({
          tipo: "error",
          texto: "No encontramos clases en ese archivo. Fijate que sea el Excel con las columnas RUEE, Grado, Docente y Grupo.",
        });
        return;
      }
      const filasClases = filasAClases(filas, docente);
      const { error } = await supabase
        .from("clases")
        .upsert(filasClases, { onConflict: "id" });
      if (error) {
        setFeedback({ tipo: "error", texto: "No pudimos guardar las clases. Revisá tu conexión y probá de nuevo." });
        return;
      }
      setFeedback({
        tipo: "ok",
        texto: `${filasClases.length} ${filasClases.length === 1 ? "clase cargada" : "clases cargadas"} ✔`,
      });
      await cargarClases();
    } catch {
      setFeedback({ tipo: "error", texto: "No pudimos leer ese archivo. ¿Es un .xlsx válido?" });
    } finally {
      setSubiendo(false);
    }
  }

  async function copiarLink(claseId: string) {
    const link = linkDeClase(claseId);
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // fallback para navegadores sin clipboard API
      const ta = document.createElement("textarea");
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopiado(claseId);
    setTimeout(() => setCopiado((actual) => (actual === claseId ? null : actual)), 2000);
  }

  function salir() {
    limpiarDocenteActivo();
    navegar("#/");
  }

  if (!docente) return null;

  if (!supabaseConfigurado) {
    return (
      <div className="estado">
        <h2>Falta configurar Supabase</h2>
        <p>
          Completá <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code> en{" "}
          <code>.env.local</code> (ver README) y recargá.
        </p>
      </div>
    );
  }

  return (
    <div className="panel">
      <header className="nav">
        <img className="nav__logo" src="/assets/logotipo.svg" alt="THEA — the electric academy" />
        <span className="nav__clase">Panel docente</span>
      </header>

      <main className="panel__main">
        <div className="panel__saludo">
          <h1>¡Hola, {docente}! 👋</h1>
          <button type="button" className="panel__salir" onClick={salir}>
            Salir
          </button>
        </div>

        <section className="panel__card">
          <h2>Subir Excel de clases</h2>
          <p className="panel__hint">
            Subí tu planilla (.xlsx). Cada fila se convierte en una clase con su
            link. Podés volver a subirla cuando quieras: se actualiza sin perder
            el progreso.
          </p>
          <input
            className="panel__file"
            type="file"
            accept=".xlsx,.xls"
            onChange={subirExcel}
            disabled={subiendo}
            aria-label="Subir Excel de clases"
          />
          {subiendo && <div className="panel__feedback">Procesando el Excel…</div>}
          {feedback && (
            <div
              className={`panel__feedback panel__feedback--${feedback.tipo}`}
              role={feedback.tipo === "error" ? "alert" : "status"}
            >
              {feedback.texto}
            </div>
          )}
        </section>

        <section className="panel__card">
          <h2>Tus clases</h2>
          <p className="panel__hint">
            Compartí el link de cada clase con sus estudiantes. El progreso se
            actualiza solo, en vivo.
          </p>

          {cargando && <p className="panel__vacio">Cargando tus clases…</p>}

          {!cargando && clases.length === 0 && (
            <p className="panel__vacio">
              Todavía no tenés clases cargadas. Subí tu Excel acá arriba y van a
              aparecer todas juntas. 🙌
            </p>
          )}

          {!cargando &&
            clases.map((c) => {
              const n = progreso[c.id]?.size ?? 0;
              return (
                <div className="clase-item" key={c.id}>
                  <div className="clase-item__info">
                    <div className="clase-item__label">{c.label}</div>
                    {c.maestra && (
                      <div className="clase-item__maestra">Maestra: {c.maestra}</div>
                    )}
                  </div>
                  <div className="clase-item__prog">
                    <span className="clase-item__contador">
                      {n}/{TOTAL_FIGURITAS}
                    </span>
                    <span className="mini-barra" aria-hidden="true">
                      <span style={{ width: `${(n / TOTAL_FIGURITAS) * 100}%` }} />
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`clase-item__copiar${copiado === c.id ? " clase-item__copiar--ok" : ""}`}
                    onClick={() => copiarLink(c.id)}
                  >
                    {copiado === c.id ? "¡Copiado! ✓" : "Copiar link"}
                  </button>
                </div>
              );
            })}
        </section>
      </main>
    </div>
  );
}
