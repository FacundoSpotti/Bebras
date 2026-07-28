import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** true si las variables de entorno de Supabase están seteadas. */
export const supabaseConfigurado = Boolean(url && anonKey);

// Con placeholders el cliente no explota al importarse; las pantallas
// chequean `supabaseConfigurado` y muestran un mensaje claro si falta config.
export const supabase = createClient(
  url ?? "https://placeholder.supabase.co",
  anonKey ?? "placeholder-anon-key"
);

export type ClaseRow = {
  id: string;
  docente: string;
  ruee: string;
  departamento: string;
  escuela: number;
  grado: string;
  grupo: string;
  maestra: string | null;
  label: string;
  /** false (default) = álbum colectivo; true = cada estudiante arma el suyo. */
  modo_individual?: boolean;
  created_at?: string;
};

export type ProgresoRow = {
  clase_id: string;
  figurita: number;
  /** Estudiante que la pegó. Es parte de la PK: en modo individual cada uno
   *  tiene su propia fila para la misma figurita. */
  autor: string;
  unlocked_at?: string;
};
