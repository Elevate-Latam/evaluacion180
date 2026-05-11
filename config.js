// ============================================================
//  config.js — Configuración central
//  Edita estas 2 variables antes de publicar
// ============================================================

const CONFIG = {
  // URL del Google Apps Script desplegado como "Aplicación web"
  // Ej: https://script.google.com/macros/s/AKfyc.../exec
  WEBHOOK_URL: 'https://script.google.com/macros/s/AKfycbzHl8xCLs4Mlf2SDA0UnfizldE21SgYoH1dU3engUJxKlfHFnZ26gnoM5cV98wm0tvVkQ/exec',

  // URL base donde está publicado este sitio en GitHub Pages
  // Ej: https://tuusuario.github.io/evaluacion180
  BASE_URL: 'https://elevate-latam.github.io/evaluacion180/',
};

// ── API helper ──────────────────────────────────────────────
async function api(action, payload = {}) {
  const res = await fetch(CONFIG.WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });
  if (!res.ok) throw new Error('Error HTTP ' + res.status);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// ── Competencias por defecto (editables en el panel RRHH) ───
const COMPETENCIAS_DEFAULT = [
  { id: 'c01', nombre: 'Orientación a resultados' },
  { id: 'c02', nombre: 'Trabajo en equipo' },
  { id: 'c03', nombre: 'Comunicación efectiva' },
  { id: 'c04', nombre: 'Liderazgo' },
  { id: 'c05', nombre: 'Innovación y creatividad' },
  { id: 'c06', nombre: 'Gestión del tiempo' },
  { id: 'c07', nombre: 'Adaptabilidad al cambio' },
  { id: 'c08', nombre: 'Orientación al cliente' },
  { id: 'c09', nombre: 'Toma de decisiones' },
  { id: 'c10', nombre: 'Desarrollo de personas' },
  { id: 'c11', nombre: 'Integridad y ética' },
  { id: 'c12', nombre: 'Pensamiento estratégico' },
];

// ── Etiquetas escala Likert ─────────────────────────────────
const LIKERT_LABELS = {
  1: 'Nunca',
  2: 'Raramente',
  3: 'A veces',
  4: 'Frecuentemente',
  5: 'Siempre',
};
