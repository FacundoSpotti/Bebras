import { useEffect, useState } from "react";
import Onboarding from "./screens/Onboarding";
import Album from "./screens/Album";
import PanelDocente from "./screens/PanelDocente";

// Router por hash (Vercel sirve estáticos, sin rewrites):
//   #/                  → Onboarding
//   #/clase/:claseId    → Álbum de esa clase (link que se comparte)
//   #/docente           → Panel Docente (requiere login previo)

type Ruta =
  | { name: "onboarding" }
  | { name: "album"; claseId: string }
  | { name: "docente" };

function parseHash(hash: string): Ruta {
  const path = hash.replace(/^#/, "");
  const claseMatch = path.match(/^\/clase\/([^/]+)/);
  if (claseMatch) return { name: "album", claseId: decodeURIComponent(claseMatch[1]) };
  if (path.startsWith("/docente")) return { name: "docente" };
  return { name: "onboarding" };
}

export function navegar(hash: string) {
  window.location.hash = hash;
}

export default function App() {
  const [ruta, setRuta] = useState<Ruta>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setRuta(parseHash(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  switch (ruta.name) {
    case "album":
      return <Album claseId={ruta.claseId} key={ruta.claseId} />;
    case "docente":
      return <PanelDocente />;
    default:
      return <Onboarding />;
  }
}
