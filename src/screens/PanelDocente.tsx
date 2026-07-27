import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
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

  // Presencia: clase → { nombre → sigue conectado }. La lista se arma
  // mientras el panel está abierto y se reinicia al cerrarlo (no se guarda).
  const [presencia, setPresencia] = useState<Record<string, Record<string, boolean>>>({});

  // Alta manual de clase
  const [manualRuee, setManualRuee] = useState("");
  const [manualGrado, setManualGrado] = useState("");
  const [manualGrupo, setManualGrupo] = useState("");
  const [manualMaestra, setManualMaestra] = useState("");
  const [agregando, setAgregando] = useState(false);

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
        texto: `${filasClases.length} ${filasClases.length === 1 ? "clase cargada" : "clases cargadas"} ✓`,
      });
      await cargarClases();
    } catch {
      setFeedback({ tipo: "error", texto: "No pudimos leer ese archivo. ¿Es un .xlsx válido?" });
    } finally {
      setSubiendo(false);
    }
  }

  // Observa la presencia de cada clase (quién tiene el álbum abierto ahora).
  // Los que se van quedan en la lista marcados como "salió".
  useEffect(() => {
    if (!supabaseConfigurado || clases.length === 0) return;
    const canales = clases.map((c) => {
      const ch = supabase.channel(`presencia:${c.id}`);
      ch.on("presence", { event: "sync" }, () => {
        const online = new Set<string>();
        for (const metas of Object.values(ch.presenceState())) {
          for (const m of metas as { nombre?: string }[]) {
            if (m.nombre) online.add(m.nombre);
          }
        }
        setPresencia((prev) => {
          const vistos = { ...(prev[c.id] ?? {}) };
          for (const n of Object.keys(vistos)) vistos[n] = online.has(n);
          for (const n of online) vistos[n] = true;
          return { ...prev, [c.id]: vistos };
        });
      }).subscribe();
      return ch;
    });
    return () => {
      canales.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [clases]);

  async function agregarClaseManual(e: FormEvent) {
    e.preventDefault();
    if (!docente) return;
    setFeedback(null);
    const ruee = manualRuee.trim();
    const grado = manualGrado.trim();
    const grupo = manualGrupo.trim();
    if (!/^\d{7}$/.test(ruee)) {
      setFeedback({ tipo: "error", texto: "El RUEE tiene que tener 7 dígitos (ej.: 1103029)." });
      return;
    }
    if (!grado || !grupo) {
      setFeedback({ tipo: "error", texto: "Completá grado y grupo (para multigrado usá guiones bajos: 3_4_5_6 y A_A_A_A)." });
      return;
    }
    setAgregando(true);
    const [fila] = filasAClases(
      [{ ruee, grado, grupo, maestra: manualMaestra.trim() || null }],
      docente
    );
    const { error } = await supabase.from("clases").upsert(fila, { onConflict: "id" });
    setAgregando(false);
    if (error) {
      setFeedback({ tipo: "error", texto: "No pudimos guardar la clase. Revisá tu conexión y probá de nuevo." });
      return;
    }
    setFeedback({ tipo: "ok", texto: `Clase "${fila.label}" agregada ✓` });
    setManualRuee("");
    setManualGrado("");
    setManualGrupo("");
    setManualMaestra("");
    await cargarClases();
  }

  async function resetearClase(clase: ClaseRow) {
    const seguro = window.confirm(
      `¿Reiniciar el progreso de "${clase.label}"?\n\nSe borran TODAS las figuritas pegadas de las 4 páginas y la clase vuelve a empezar de cero (solo queda abierta la página 1). La clase no se borra. Esta acción no se puede deshacer.`
    );
    if (!seguro) return;
    const { error } = await supabase.from("progreso").delete().eq("clase_id", clase.id);
    if (error) {
      setFeedback({ tipo: "error", texto: "No pudimos reiniciar la clase. Probá de nuevo." });
      return;
    }
    setProgreso((prev) => ({ ...prev, [clase.id]: new Set() }));
    setFeedback({ tipo: "ok", texto: `Progreso de "${clase.label}" reiniciado ✓` });
  }

  async function eliminarClase(clase: ClaseRow) {
    const seguro = window.confirm(
      `¿Eliminar la clase "${clase.label}"?\n\nSe borra también su progreso (las figuritas pegadas). Esta acción no se puede deshacer.`
    );
    if (!seguro) return;
    const { error } = await supabase.from("clases").delete().eq("id", clase.id);
    if (error) {
      setFeedback({ tipo: "error", texto: "No pudimos eliminar la clase. Probá de nuevo." });
      return;
    }
    setClases((prev) => prev.filter((c) => c.id !== clase.id));
    misClasesRef.current.delete(clase.id);
    setFeedback({ tipo: "ok", texto: `Clase "${clase.label}" eliminada.` });
  }

  async function copiar(texto: string, key: string) {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      // fallback para navegadores sin clipboard API
      const ta = document.createElement("textarea");
      ta.value = texto;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopiado(key);
    setTimeout(() => setCopiado((actual) => (actual === key ? null : actual)), 2000);
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
          <h1>¡Hola, {docente}!</h1>
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
        </section>

        <section className="panel__card">
          <h2>Agregar una clase manualmente</h2>
          <p className="panel__hint">
            Si no tenés el Excel a mano, cargá la clase acá. Para multigrado
            usá guiones bajos: grado <code>3_4_5_6</code> y grupo <code>A_A_A_A</code>.
          </p>
          <form className="panel__form" onSubmit={agregarClaseManual}>
            <label>
              RUEE
              <input
                type="text"
                value={manualRuee}
                onChange={(e) => setManualRuee(e.target.value)}
                placeholder="1103029"
                inputMode="numeric"
                maxLength={7}
                required
              />
            </label>
            <label>
              Grado
              <input
                type="text"
                value={manualGrado}
                onChange={(e) => setManualGrado(e.target.value)}
                placeholder="4 (o 3_4_5_6)"
                required
              />
            </label>
            <label>
              Grupo
              <input
                type="text"
                value={manualGrupo}
                onChange={(e) => setManualGrupo(e.target.value)}
                placeholder="A (o A_A_A_A)"
                required
              />
            </label>
            <label>
              Maestra (opcional)
              <input
                type="text"
                value={manualMaestra}
                onChange={(e) => setManualMaestra(e.target.value)}
                placeholder="Nombre de la maestra de aula"
              />
            </label>
            <button type="submit" className="panel__agregar" disabled={agregando}>
              {agregando ? "Agregando…" : "Agregar clase"}
            </button>
          </form>
        </section>

        {feedback && (
          <div
            className={`panel__feedback panel__feedback--${feedback.tipo}`}
            role={feedback.tipo === "error" ? "alert" : "status"}
          >
            {feedback.texto}
          </div>
        )}

        <section className="panel__card">
          <h2>Tus clases</h2>
          <p className="panel__hint">
            Compartí el link o el código de cada clase con sus estudiantes: con
            el código pueden entrar desde la pantalla de inicio eligiendo
            "Soy estudiante". El progreso se actualiza solo, en vivo.
          </p>

          {cargando && <p className="panel__vacio">Cargando tus clases…</p>}

          {!cargando && clases.length === 0 && (
            <p className="panel__vacio">
              Todavía no tenés clases cargadas. Subí tu Excel acá arriba y van a
              aparecer todas juntas.
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
                    <div className="clase-item__codigo">
                      Código: <code>{c.id}</code>
                    </div>
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
                    className={`clase-item__copiar${copiado === `${c.id}:link` ? " clase-item__copiar--ok" : ""}`}
                    onClick={() => copiar(linkDeClase(c.id), `${c.id}:link`)}
                  >
                    {copiado === `${c.id}:link` ? "¡Copiado! ✓" : "Copiar link"}
                  </button>
                  <button
                    type="button"
                    className={`clase-item__copiar clase-item__copiar--codigo${copiado === `${c.id}:codigo` ? " clase-item__copiar--ok" : ""}`}
                    onClick={() => copiar(c.id, `${c.id}:codigo`)}
                  >
                    {copiado === `${c.id}:codigo` ? "¡Copiado! ✓" : "Copiar código"}
                  </button>
                  <button
                    type="button"
                    className="clase-item__reset"
                    onClick={() => resetearClase(c)}
                    aria-label={`Reiniciar el progreso de la clase ${c.label}`}
                    title="Borra las figuritas pegadas y vuelve a empezar"
                  >
                    Reiniciar progreso
                  </button>
                  <button
                    type="button"
                    className="clase-item__eliminar"
                    onClick={() => eliminarClase(c)}
                    aria-label={`Eliminar la clase ${c.label}`}
                    title="Eliminar clase"
                  >
                    Eliminar
                  </button>
                </div>
              );
            })}
        </section>

        <section className="panel__card">
          <h2>Estudiantes conectados</h2>
          <p className="panel__hint">
            Quiénes tienen abierto el álbum ahora mismo, en vivo. Los que se
            van quedan marcados como "salió". La lista se arma mientras tenés
            el panel abierto y se reinicia sola al cerrarlo.
          </p>
          {(() => {
            const grupos = clases
              .map((c) => ({
                clase: c,
                nombres: Object.entries(presencia[c.id] ?? {}).sort(([a], [b]) =>
                  a.localeCompare(b)
                ),
              }))
              .filter((g) => g.nombres.length > 0);
            if (grupos.length === 0) {
              return (
                <p className="panel__vacio">
                  Nadie tiene el álbum abierto en este momento. Cuando un
                  estudiante entre con el link o el código, aparece acá al
                  instante.
                </p>
              );
            }
            return grupos.map((g) => (
              <div className="presencia" key={g.clase.id}>
                <div className="presencia__clase">
                  {g.clase.label}
                  <span className="presencia__contador">
                    {g.nombres.filter(([, online]) => online).length} ahora
                  </span>
                </div>
                <div className="presencia__lista">
                  {g.nombres.map(([nombre, online]) => (
                    <span
                      className={`presencia__chip${online ? "" : " presencia__chip--fuera"}`}
                      key={nombre}
                    >
                      <i aria-hidden="true" />
                      {nombre}
                      {!online && <small>salió</small>}
                    </span>
                  ))}
                </div>
              </div>
            ));
          })()}
        </section>
      </main>
    </div>
  );
}
