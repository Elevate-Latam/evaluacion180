// ============================================================
//  config.js — Configuración central del sistema
//  Edita las 2 variables antes de publicar en GitHub Pages
// ============================================================

const CONFIG = {
  WEBHOOK_URL: 'https://script.google.com/macros/s/AKfycbzDKKC_7kbFJwRfDJVKmji4i1y1CCx-DKtzlDe8KwddqBeoDq-IlF_CwYEmfbNhsH8mCQ/exec',
  BASE_URL:    'https://elevate-latam.github.io/evaluacion180/',
};

// ── API helper (GET para evitar CORS) ───────────────────────
async function api(action, payload = {}) {
  const url = CONFIG.WEBHOOK_URL
    + '?action=' + encodeURIComponent(action)
    + '&payload=' + encodeURIComponent(JSON.stringify(payload));
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  if (!res.ok) throw new Error('Error HTTP ' + res.status);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// ── Competencias por defecto ─────────────────────────────────
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

// ── Escala Likert ────────────────────────────────────────────
const LIKERT_LABELS = {
  1: 'Nunca',
  2: 'Raramente',
  3: 'A veces',
  4: 'Frecuentemente',
  5: 'Siempre',
};

// ── Semáforo de colores por puntaje ─────────────────────────
function scoreColor(v) {
  if (!v || v === 0) return '#94A3B8';
  if (v >= 4.5) return '#16A34A';
  if (v >= 3.5) return '#65A30D';
  if (v >= 2.5) return '#D97706';
  if (v >= 1.5) return '#DC2626';
  return '#991B1B';
}

function scoreBg(v) {
  if (!v || v === 0) return '#F1F5F9';
  if (v >= 4.5) return '#DCFCE7';
  if (v >= 3.5) return '#ECFCCB';
  if (v >= 2.5) return '#FEF3C7';
  if (v >= 1.5) return '#FEE2E2';
  return '#FEE2E2';
}

function nivelLabel(v) {
  if (!v) return '—';
  if (v >= 4.5) return 'Sobresaliente';
  if (v >= 3.5) return 'Por encima del estándar';
  if (v >= 2.5) return 'En desarrollo';
  if (v >= 1.5) return 'Por mejorar';
  return 'Crítico';
}

// ── Interpretaciones descriptivas de brecha ─────────────────
function interpretarBrecha(comp, promLider, promAuto, nivel) {
  const brecha = promLider !== null && promAuto !== null ? promLider - promAuto : null;
  const brechaAbs = brecha !== null ? Math.abs(brecha) : null;

  let texto = '';
  let tipo = 'neutro'; // positivo | negativo | neutro | alineado

  if (promLider === null || promAuto === null) {
    return { texto: 'Evaluación incompleta — faltan datos de una de las dos perspectivas.', tipo: 'neutro', brecha: null };
  }

  // Nivel de dominio base
  if (nivel >= 4.5) {
    texto = `Muestra un dominio sobresaliente en ${comp}. Esta es una fortaleza consolidada que puede aprovecharse para mentorear a otros.`;
  } else if (nivel >= 3.5) {
    texto = `Demuestra un buen desempeño en ${comp}, por encima del estándar esperado. Con práctica consistente puede alcanzar un nivel sobresaliente.`;
  } else if (nivel >= 2.5) {
    texto = `Se encuentra en proceso de desarrollo en ${comp}. Hay una base sólida pero requiere práctica deliberada y acompañamiento.`;
  } else {
    texto = `Existe una brecha significativa en ${comp} que requiere atención prioritaria. Se recomienda incluirla en el plan de desarrollo inmediato.`;
  }

  // Análisis de brecha percepción
  if (brechaAbs >= 1.0) {
    if (brecha > 0) {
      texto += ` Se detecta una diferencia importante: el líder percibe un desempeño notablemente superior a la autopercepción del colaborador. Esto puede indicar subestimación o falta de confianza.`;
      tipo = 'positivo';
    } else {
      texto += ` Se detecta una diferencia importante: el colaborador se percibe con mayor dominio del que observa el líder. Esto sugiere una oportunidad de alineación de expectativas.`;
      tipo = 'negativo';
    }
  } else if (brechaAbs >= 0.5) {
    if (brecha > 0) {
      texto += ` El líder valora ligeramente más alto que la autopercepción del colaborador.`;
      tipo = 'positivo';
    } else {
      texto += ` El colaborador se autovalora ligeramente por encima de lo que percibe el líder.`;
      tipo = 'negativo';
    }
  } else {
    texto += ` Existe buena alineación entre la percepción del líder y la autoevaluación del colaborador.`;
    tipo = 'alineado';
  }

  return { texto, tipo, brecha };
}

// ── Recomendaciones 70-20-10 por nivel ──────────────────────
function recomendaciones7020(comp, nivel) {
  const recs = {
    critico: {
      label: 'Desarrollo urgente',
      r70: `Asignar tareas supervisadas que requieran aplicar ${comp} en situaciones reales de bajo riesgo. Definir microobjetivos semanales medibles.`,
      r20: `Establecer sesiones quincenales de retroalimentación con el líder directo. Asignar un mentor interno con fortaleza en esta competencia.`,
      r10: `Completar un curso o taller estructurado de ${comp} (presencial o e-learning) en los próximos 30 días.`,
    },
    desarrollo: {
      label: 'En desarrollo',
      r70: `Ampliar la exposición a proyectos que demanden el uso frecuente de ${comp}. Incorporar esta competencia como foco en los objetivos del próximo trimestre.`,
      r20: `Participar en grupos de trabajo o comunidades de práctica relacionadas. Recibir retroalimentación estructurada mensual del líder.`,
      r10: `Leer bibliografía especializada o completar un módulo de e-learning de media jornada sobre ${comp}.`,
    },
    estandar: {
      label: 'Estándar sólido',
      r70: `Asumir proyectos de mayor complejidad o visibilidad que requieran demostrar ${comp} en contextos desafiantes.`,
      r20: `Compartir mejores prácticas con el equipo. Participar en redes profesionales o foros donde se discuta esta competencia.`,
      r10: `Explorar casos de estudio avanzados o asistir a conferencias del sector relacionadas con ${comp}.`,
    },
    sobresaliente: {
      label: 'Fortaleza — multiplicar',
      r70: `Liderar iniciativas que permitan al colaborador actuar como referente en ${comp} para el equipo o la organización.`,
      r20: `Asumir un rol formal de mentor o coach en esta competencia para colaboradores en etapas anteriores de desarrollo.`,
      r10: `Explorar certificaciones avanzadas o contribuir como ponente/facilitador en espacios internos de aprendizaje.`,
    },
  };

  let key = 'desarrollo';
  if (nivel < 2.0) key = 'critico';
  else if (nivel < 3.5) key = 'desarrollo';
  else if (nivel < 4.5) key = 'estandar';
  else key = 'sobresaliente';

  return { ...recs[key], comp, nivel };
}
