import { useState, type FormEvent } from "react";
import { supabase, supabaseConfigurado } from "../lib/supabase";
import { DOCENTES, CLAVE_MAESTRA } from "../config/docentes";
import { setDocenteActivo } from "../lib/sesion";
import { navegar } from "../App";

type Modo = "inicio" | "estudiante" | "docente";

/** Acepta un código de clase o un link completo pegado y extrae el claseId. */
function extraerClaseId(entrada: string): string {
  const s = entrada.trim();
  const m = s.match(/#\/clase\/([^/\s?]+)/);
  if (m) return decodeURIComponent(m[1]);
  return s;
}

export default function Onboarding() {
  const [modo, setModo] = useState<Modo>("inicio");
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  // estudiante
  const [codigo, setCodigo] = useState("");
  // docente
  const [docente, setDocente] = useState(DOCENTES[0]);
  const [clave, setClave] = useState("");

  function cambiarModo(m: Modo) {
    setModo(m);
    setError(null);
  }

  async function entrarEstudiante(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const id = extraerClaseId(codigo);
    if (!id) {
      setError("Escribí el código o pegá el link que te dio tu docente.");
      return;
    }
    if (!supabaseConfigurado) {
      setError("La app todavía no está configurada. Avisale a tu docente.");
      return;
    }
    setOcupado(true);
    const { data, error: err } = await supabase
      .from("clases")
      .select("id")
      .eq("id", id)
      .maybeSingle();
    setOcupado(false);
    if (err) {
      setError("No pudimos verificar la clase. Revisá tu conexión y probá de nuevo.");
      return;
    }
    if (!data) {
      setError("No encontramos esa clase. Pedile el link a tu docente.");
      return;
    }
    navegar(`#/clase/${id}`);
  }

  function entrarDocente(e: FormEvent) {
    e.preventDefault();
    if (clave !== CLAVE_MAESTRA) {
      setError("Clave incorrecta");
      return;
    }
    setDocenteActivo(docente);
    navegar("#/docente");
  }

  return (
    <div className="onb">
      <div className="onb__card">
        <img
          className="onb__logo"
          src="/assets/Property 1=Default.svg"
          alt="THEA — the electric academy"
        />
        <h1>Álbum Bebras 2026</h1>
        <p className="onb__sub">Desafíos de ingenio para completar entre toda la clase.</p>

        {modo === "inicio" && (
          <div className="onb__opciones">
            <button
              type="button"
              className="onb__rol onb__rol--estudiante"
              onClick={() => cambiarModo("estudiante")}
            >
              <span className="onb__rol-titulo">Soy estudiante</span>
              <span className="onb__rol-desc">Entrá con el link o código de tu clase</span>
            </button>
            <button
              type="button"
              className="onb__rol onb__rol--docente"
              onClick={() => cambiarModo("docente")}
            >
              <span className="onb__rol-titulo">Soy docente</span>
              <span className="onb__rol-desc">Subí tu Excel y gestioná tus clases</span>
            </button>
          </div>
        )}

        {modo === "estudiante" && (
        <form className="onb__form" onSubmit={entrarEstudiante}>
          <label>
            Código de tu clase
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Pegá el link o el código que te dio tu docente"
              autoFocus
            />
          </label>
          {error && <p className="onb__error" role="alert">{error}</p>}
          <button type="submit" className="onb__submit" disabled={ocupado}>
            {ocupado ? "Buscando tu clase…" : "Entrar"}
          </button>
          <button type="button" className="onb__volver" onClick={() => cambiarModo("inicio")}>
            ← Volver
          </button>
        </form>
        )}

        {modo === "docente" && (
        <form className="onb__form" onSubmit={entrarDocente}>
          <label>
            Tu nombre
            <select value={docente} onChange={(e) => setDocente(e.target.value)} autoFocus>
              {DOCENTES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
          <label>
            Clave maestra
            <input
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="La clave compartida del equipo"
            />
          </label>
          {error && <p className="onb__error" role="alert">{error}</p>}
          <button type="submit" className="onb__submit">Entrar</button>
          <button type="button" className="onb__volver" onClick={() => cambiarModo("inicio")}>
            ← Volver
          </button>
        </form>
        )}
      </div>

      <p className="onb__pie">THEA — the electric academy · Desafío Bebras 2026</p>
    </div>
  );
}
