// scripts/capturas.mjs
// Genera de forma reproducible las 12 capturas de la Guía Docente
// (docs/capturas/*.png) usando Playwright contra el dev server local.
//
// Requisitos:
//   - npm run dev corriendo en http://localhost:5173
//   - .env.local con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
//   - npm i -D playwright && npx playwright install chromium
//
// Uso:  node scripts/capturas.mjs
//
// El script CREA datos de prueba temporales en Supabase (docente "Celeste"
// + 3 clases ficticias), toma las capturas, y al final BORRA esas 3 clases
// (cascade borra su progreso). No toca ningún otro dato.

import { chromium } from "playwright";
import { readFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "docs", "capturas");
mkdirSync(OUT, { recursive: true });

// ---- Config Supabase (lee .env.local) ----
const env = readFileSync(join(ROOT, ".env.local"), "utf8");
const URL = env.match(/VITE_SUPABASE_URL=(.+)/)[1].trim();
const KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.+)/)[1].trim();
const BASE = "http://localhost:5173";

const H = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};

// ---- Datos de prueba (ficticios, NO reales) ----
const DOCENTE = "Celeste";
const NOMBRE_ALUMNO = "Martina";

const CLASES = [
  {
    id: "1103029-3456-aaaa", docente: DOCENTE, ruee: "1103029",
    departamento: "Canelones", escuela: 29, grado: "3_4_5_6", grupo: "A_A_A_A",
    maestra: "Silvana",
    label: "Canelones · Escuela 29 · Multigrado (3ºA 4ºA 5ºA 6ºA)",
  },
  {
    id: "1111008-5-a", docente: DOCENTE, ruee: "1111008",
    departamento: "Paysandú", escuela: 8, grado: "5", grupo: "A",
    maestra: "Ana",
    label: "Paysandú · Escuela 8 · 5º A",
  },
  {
    id: "1101044-4-b", docente: DOCENTE, ruee: "1101044",
    departamento: "Montevideo", escuela: 44, grado: "4", grupo: "B",
    maestra: "Lucía",
    label: "Montevideo · Escuela 44 · 4º B",
  },
];
const ALBUM = CLASES[0].id; // clase que se usa para las capturas del álbum
const AUTORES = ["Martina", "Bruno", "Sofía", "Thiago", "Valen", "Emma", "Lucas"];

// ---- Helpers REST ----
async function delClase(id) {
  await fetch(`${URL}/rest/v1/clases?id=eq.${id}`, { method: "DELETE", headers: H });
}
async function upsertClase(c) {
  const r = await fetch(`${URL}/rest/v1/clases`, {
    method: "POST",
    headers: { ...H, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(c),
  });
  if (!r.ok) throw new Error(`upsertClase ${c.id}: ${r.status} ${await r.text()}`);
}
async function setProgreso(claseId, figus) {
  await fetch(`${URL}/rest/v1/progreso?clase_id=eq.${claseId}`, { method: "DELETE", headers: H });
  if (figus.length === 0) return;
  const rows = figus.map((f, i) => ({ clase_id: claseId, figurita: f, autor: AUTORES[i % AUTORES.length] }));
  const r = await fetch(`${URL}/rest/v1/progreso`, {
    method: "POST",
    headers: { ...H, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(rows),
  });
  if (!r.ok) throw new Error(`setProgreso ${claseId}: ${r.status} ${await r.text()}`);
}

// ---- Helpers Playwright ----
async function ready(page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  await page.waitForTimeout(600);
}
async function shot(page, name, opts = {}) {
  await page.screenshot({ path: join(OUT, name), fullPage: !!opts.fullPage });
  console.log("  ✓", name);
}

async function main() {
  // Estado inicial limpio para los datos de captura
  for (const c of CLASES) await delClase(c.id);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 2,
  });
  // Sesión de docente (Celeste) + nombre de alumno (Martina) preseteados
  await context.addInitScript(
    ([doc, alumno]) => {
      try {
        sessionStorage.setItem("docenteActivo", doc);
        localStorage.setItem("nombreEstudiante", alumno);
      } catch {}
    },
    [DOCENTE, NOMBRE_ALUMNO]
  );
  const page = await context.newPage();

  console.log("Capturas:");

  // 01 · Onboarding
  await page.goto(`${BASE}/#/`);
  await ready(page);
  await shot(page, "01-onboarding.png");

  // 02 · Login docente (form con select + clave)
  await page.getByRole("button", { name: "Soy docente" }).click();
  await page.waitForTimeout(300);
  await page.getByPlaceholder("La clave compartida del equipo").fill("THEA2026");
  await page.waitForTimeout(200);
  await shot(page, "02-login-docente.png");

  // 03 · Panel vacío (Celeste todavía sin clases)
  await page.goto(`${BASE}/#/docente`);
  // Esperar a que termine la carga async (el websocket de realtime hace que
  // networkidle dispare antes; hay que esperar el contenido real).
  await page.getByText("Todavía no tenés clases cargadas", { exact: false }).waitFor();
  await ready(page);
  await shot(page, "03-panel-vacio.png", { fullPage: true });

  // Insertar las 3 clases con progreso para el panel
  for (const c of CLASES) await upsertClase(c);
  await setProgreso(CLASES[0].id, [1, 2, 3, 4]);       // Canelones 4/10
  await setProgreso(CLASES[1].id, [1, 2, 3, 4, 5, 6, 7]); // Paysandú 7/10
  await setProgreso(CLASES[2].id, [1, 2]);             // Montevideo 2/10

  // 04 · Panel con clases
  await page.goto(`${BASE}/#/docente`);
  await page.reload(); // fuerza re-fetch (misma hash-URL no re-monta solo)
  await page.waitForFunction(() => document.querySelectorAll(".clase-item").length >= 3);
  await ready(page);
  await shot(page, "04-panel-con-clases.png", { fullPage: true });

  // 05 · Detalle: tarjeta de clase con botones Copiar link / Copiar código
  const item = page.locator(".clase-item").first();
  await item.scrollIntoViewIfNeeded();
  await item.screenshot({ path: join(OUT, "05-panel-copiar-link.png") });
  console.log("  ✓ 05-panel-copiar-link.png");

  // ----- Álbum (clase Canelones) -----
  // 06 · Álbum vacío 0/10
  await setProgreso(ALBUM, []);
  await page.goto(`${BASE}/#/clase/${ALBUM}`);
  await page.waitForSelector(".grilla");
  await ready(page);
  await shot(page, "06-album-vacio.png", { fullPage: true });

  // 07 · Modal de desafío (figurita 1)
  await page.locator("button.figu").first().click();
  await page.waitForSelector(".modal");
  await ready(page);
  await shot(page, "07-modal-desafio.png");

  // 08 · Respuesta correcta (figurita 1 → correcta "A") + celebración
  await page.getByRole("button", { name: "A", exact: true }).click();
  await page.waitForSelector(".modal", { state: "detached" }).catch(() => {});
  await page.waitForTimeout(300); // atrapa el confetti a mitad de vuelo
  await shot(page, "08-respuesta-correcta.png");

  // 09 · Cooldown (abrir figurita 2 y responder mal → cuenta regresiva)
  await page.locator("button.figu").first().click(); // ahora la 1 es "pegada" (div), primera button = figurita 2
  await page.waitForSelector(".modal");
  await ready(page);
  await page.getByRole("button", { name: "A", exact: true }).click(); // la 2 correcta es "D" → "A" es incorrecta
  await page.waitForSelector(".modal__cooldown");
  await page.waitForTimeout(400);
  await shot(page, "09-cooldown.png");
  await page.keyboard.press("Escape"); // cierra el modal

  // 10 · Álbum parcial 4/10
  await setProgreso(ALBUM, [1, 2, 3, 4]);
  await page.goto(`${BASE}/#/clase/${ALBUM}`);
  await page.reload(); // veníamos del mismo álbum: forzar re-fetch del progreso
  await page.waitForSelector(".grilla");
  await ready(page);
  await shot(page, "10-album-parcial.png", { fullPage: true });

  // 11 y 12 · Álbum completo + felicitación
  await setProgreso(ALBUM, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  await page.goto(`${BASE}/#/clase/${ALBUM}`);
  await page.reload(); // forzar re-fetch para ver 10/10
  await page.waitForSelector(".grilla");
  await ready(page);
  // Al llegar a 10/10 se muestra la felicitación por encima del álbum
  await page.waitForSelector(".feli");
  await page.waitForTimeout(500);
  // Quitar los toasts de realtime (avisos "fulano pegó...") para una toma limpia
  await page.evaluate(() => document.querySelectorAll(".toasts").forEach((e) => e.remove()));
  await shot(page, "12-felicitacion.png");
  // Cerrar la felicitación para ver el álbum 10/10 limpio
  await page.getByRole("button", { name: "Ver el álbum" }).click();
  await page.waitForSelector(".feli", { state: "detached" }).catch(() => {});
  await ready(page);
  await page.evaluate(() => document.querySelectorAll(".toasts").forEach((e) => e.remove()));
  await shot(page, "11-album-completo.png", { fullPage: true });

  await browser.close();

  // ---- Limpieza: borrar las 3 clases de prueba (cascade borra progreso) ----
  for (const c of CLASES) await delClase(c.id);
  console.log("Datos de prueba temporales eliminados. Listo.");
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
