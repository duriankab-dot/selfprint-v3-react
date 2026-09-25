/**
 * SVGCore.tsx — TC-102: Pure parameterized SVG scene extracted from
 * EvolutionaryVisualSystem (visual port, phase math preserved).
 *
 * 4 phases, identical thresholds to the original:
 *   Phase 1  (0 → 0.43)  Human → AI Twin build (streams, ISM grid, twin draw-on)
 *   Transition (0.38 → 0.60) Core Synapse Sphere
 *   Phase 2  (0.56 → 1.0) 12 SICE nodes activate
 *   Climax   (0.84 → 1.0) Behavioral Map polygon
 *
 * Purity contract:
 *   - Pure function of props → same props, identical pixels (testable)
 *   - No effects / no refs / no window access — drivers feed `progress`
 *   - DNA-driven: figure shape + hues derive from TwinVisualDNA (hsl only —
 *     zero hardcoded hex/rgb so the token gate stays green on this file)
 */

import type { TwinVisualDNA } from '../../lib/twinVisualDNA';
import {
  dnaPrimaryColor,
  dnaAccentColor,
  dnaSoftColor,
} from '../../lib/twinVisualDNA';

export const SICE_LABELS_TH = [
  'ตัวตน', 'จิตใจ', 'การตัดสินใจ', 'จุดประสงค์',
  'อาชีพ', 'ความมั่งคั่ง', 'ชีวิต', 'การเติบโต',
  'ความสัมพันธ์', 'ความรัก', 'สุขภาพ', 'อนาคต',
];

export const SICE_LABELS_EN = [
  'Self', 'Mind', 'Decisions', 'Purpose',
  'Career', 'Wealth', 'Life', 'Growth',
  'Relationships', 'Love', 'Health', 'Future',
];

const CX = 240, CY = 262, NODE_R = 152, LABEL_R = 186;
const NODE_THRESH = [.04, .07, .10, .13, .32, .35, .38, .41, .60, .63, .66, .69];
const POLY_MOD = [1.0, .86, 1.1, .9, 1.05, .76, 1.14, .89, 1.0, .83, .97, 1.08];

export interface SVGCoreProps {
  /** Overall story progress 0..1 (drivers compute it) */
  progress: number;
  /** Twin DNA — shape asymmetry + hues (default: deterministic neutral) */
  dna?: TwinVisualDNA;
  /** 12 SICE labels (render order = node order) */
  labels?: string[];
  /** 12 behavioral scores 0..1 — data-driven polygon (dashboard mode) */
  scores?: number[];
  /** 0..1 — draws a confidence arc around the core (data mode) */
  confidence?: number;
  /** CSS animations on (false when prefers-reduced-motion) */
  animate?: boolean;
  /** Hide the bottom engine caption (embedded contexts) */
  compact?: boolean;
}

const DEFAULT_DNA: TwinVisualDNA = {
  headShape: 'oval',
  eyeOffset: 0,
  shoulderTilt: 0,
  spineCurvature: 1,
  limbLengthRatio: 1,
  primaryHue: 190,
  accentHue: 265,
  pulseRhythm: 1,
  dominantSICE: 'self',
  blindSpotVisual: 'noise',
  version: 1,
  seed: 'default',
};

// ─── Math helpers (same curves as the original) ────────────────────────
const cl01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const eio = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

function polyPoints(scale: number, scores?: number[]): string {
  return Array.from({ length: 12 }, (_, i) => {
    const rad = ((i / 12) * 360 - 90) * Math.PI / 180;
    const mod = scores ? lerp(0.55, 1.18, cl01(scores[i] ?? 0)) : POLY_MOD[i];
    const r = NODE_R * mod * scale;
    return `${CX + r * Math.cos(rad)},${CY + r * Math.sin(rad)}`;
  }).join(' ');
}

/** Head geometry per DNA shape (rx/ry + inner-circle scale) */
function headGeometry(shape: TwinVisualDNA['headShape']): { rx: number; ry: number; inner: number } {
  switch (shape) {
    case 'round': return { rx: 23, ry: 23, inner: 12 };
    case 'angular': return { rx: 24, ry: 21, inner: 10 };
    case 'pear': return { rx: 20, ry: 25, inner: 13 };
    case 'oval':
    default: return { rx: 21, ry: 25, inner: 12 };
  }
}

export default function SVGCore({
  progress,
  dna = DEFAULT_DNA,
  labels = SICE_LABELS_EN,
  scores,
  confidence,
  animate = true,
  compact = false,
}: SVGCoreProps) {
  const p = cl01(progress);

  // Phase values — identical easing/thresholds to the original EVS
  const ph1 = eio(cl01(p / 0.43));
  const phT = eio(cl01((p - 0.38) / 0.22));
  const ph2 = eio(cl01((p - 0.56) / 0.44));
  const phC = eio(cl01((p - 0.84) / 0.16));

  const primary = dnaPrimaryColor(dna);
  const accent = dnaAccentColor(dna);
  const soft = dnaSoftColor(dna);

  // Twin figure DNA params
  const head = headGeometry(dna.headShape);
  const tilt = dna.shoulderTilt;
  const spineCtrlX = 362 + (dna.spineCurvature - 1) * 90;
  const armY = (v: number) => Math.round(160 + (v - 160) * dna.limbLengthRatio);
  const legY = (v: number) => Math.round(260 + (v - 260) * dna.limbLengthRatio);

  // Phase opacities (clamped)
  const p1op = cl01(1 - phT * 1.6);

  const pulseDur = `${(2.8 / dna.pulseRhythm).toFixed(2)}s`;
  const spinDur = `${(16 / dna.pulseRhythm).toFixed(1)}s`;

  return (
    <svg
      viewBox="0 0 480 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', height: '100%', display: 'block' }}
      data-testid="living-svg-core"
      data-progress={p.toFixed(3)}
    >
      <defs>
        <radialGradient id="ld-rg-human" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={soft} stopOpacity=".32" />
          <stop offset="100%" stopColor={soft} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ld-rg-twin" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={primary} stopOpacity=".3" />
          <stop offset="100%" stopColor={primary} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ld-rg-orb" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={primary} stopOpacity=".65" />
          <stop offset="35%" stopColor={soft} stopOpacity=".35" />
          <stop offset="100%" stopColor={soft} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ld-rg-orb-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={soft} stopOpacity=".22" />
          <stop offset="100%" stopColor={soft} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ld-lg-stream" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={soft} stopOpacity=".9" />
          <stop offset="55%" stopColor={primary} />
          <stop offset="100%" stopColor={accent} stopOpacity=".9" />
        </linearGradient>
        <filter id="ld-f-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {animate && (
          <style>{`
            @keyframes ld-pulse { 0%,100% { opacity: .35; } 50% { opacity: .7; } }
            @keyframes ld-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes ld-spin-rev { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
            @keyframes ld-orb { 0%,100% { opacity: .06; } 50% { opacity: .14; } }
            @keyframes ld-stream { 0% { stroke-dashoffset: 60; } 100% { stroke-dashoffset: 0; } }
            @keyframes ld-particle { 0% { opacity: 1; transform: translateX(0); } 80% { opacity: .7; } 100% { opacity: 0; transform: translateX(145px); } }
          `}</style>
        )}
      </defs>

      {/* ── PHASE 1: HUMAN + AI TWIN + STREAMS + ISM GRID ── */}
      <g id="ld-gp1" style={{ opacity: p1op }}>
        <ellipse cx="240" cy="265" rx="190" ry="150" fill="url(#ld-rg-human)" style={animate ? { animation: `ld-orb 5s ease-in-out infinite` } : undefined} />

        <g id="ld-gstreams" style={{ opacity: String(ph1) }}>
          <line x1="168" y1="205" x2="312" y2="205" stroke="url(#ld-lg-stream)" strokeWidth=".7" strokeDasharray="13 11" style={animate ? { animation: 'ld-stream 1.9s linear infinite' } : undefined} />
          <line x1="168" y1="222" x2="312" y2="219" stroke="url(#ld-lg-stream)" strokeWidth="1.1" strokeDasharray="14 10" style={animate ? { animation: 'ld-stream 1.7s .2s linear infinite' } : undefined} />
          <line x1="168" y1="239" x2="312" y2="238" stroke="url(#ld-lg-stream)" strokeWidth="1.7" strokeDasharray="18 8" style={animate ? { animation: 'ld-stream 1.6s .08s linear infinite' } : undefined} />
          <line x1="168" y1="256" x2="312" y2="258" stroke="url(#ld-lg-stream)" strokeWidth="1.1" strokeDasharray="13 11" style={animate ? { animation: 'ld-stream 1.95s .32s linear infinite' } : undefined} />
          <line x1="168" y1="272" x2="312" y2="275" stroke="url(#ld-lg-stream)" strokeWidth=".7" strokeDasharray="10 13" style={animate ? { animation: 'ld-stream 2.1s .45s linear infinite' } : undefined} />
          <circle cx="182" cy="230" r="2.4" fill={soft} opacity=".9" style={animate ? { animation: 'ld-particle 2s 0s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' } : undefined} />
          <circle cx="198" cy="247" r="2" fill={primary} opacity=".85" style={animate ? { animation: 'ld-particle 2s .5s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' } : undefined} />
          <circle cx="175" cy="260" r="1.7" fill={accent} opacity=".8" style={animate ? { animation: 'ld-particle 2.2s .85s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' } : undefined} />
          <circle cx="192" cy="213" r="1.5" fill={primary} opacity=".75" style={animate ? { animation: 'ld-particle 1.85s .3s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' } : undefined} />
        </g>

        <g id="ld-gism" style={{ opacity: String(cl01((ph1 - 0.18) * 2.5)) }}>
          <text x="385" y="152" textAnchor="middle" fontSize="7.5" fontWeight="700" fill={primary} opacity=".42" letterSpacing="2" style={{ letterSpacing: 2 }}>INITIAL STATE MATRIX</text>
          <g stroke={primary} strokeWidth=".35" style={{ strokeOpacity: 0.14 }}>
            {[322, 346, 370, 394, 418, 442].map((x) => <line key={`v${x}`} x1={x} y1="158" x2={x} y2="368" />)}
            {[174, 198, 222, 246, 270, 294, 318, 342].map((y) => <line key={`h${y}`} x1="320" y1={y} x2="444" y2={y} />)}
          </g>
        </g>

        <g id="ld-ghuman" filter="url(#ld-f-glow)" style={{ opacity: String(cl01(ph1 * 7)) }}>
          <circle cx="118" cy="108" r="23" style={{ stroke: soft, strokeWidth: 1.5, fill: 'none', opacity: 0.75 }} />
          <circle cx="118" cy="108" r="12" style={{ stroke: soft, strokeWidth: 0.7, fill: 'none', opacity: 0.32 }} />
          <line x1="118" y1="131" x2="118" y2="150" style={{ stroke: soft, strokeWidth: 1.4, opacity: 0.65 }} />
          <path d="M79 152 Q118 144 157 152" style={{ stroke: soft, strokeWidth: 1.4, fill: 'none', opacity: 0.72 }} />
          <path d="M82 154 L77 248 L118 260 L159 248 L154 154" style={{ stroke: soft, strokeWidth: 1.15, fill: 'none', opacity: 0.58 }} />
          <line x1="118" y1="154" x2="118" y2="260" style={{ stroke: soft, strokeWidth: 0.65, opacity: 0.22, strokeDasharray: '4 4' }} />
          <line x1="81" y1="178" x2="155" y2="178" style={{ stroke: soft, strokeWidth: 0.4, opacity: 0.2 }} />
          <line x1="79" y1="202" x2="157" y2="202" style={{ stroke: soft, strokeWidth: 0.4, opacity: 0.2 }} />
          <line x1="78" y1="226" x2="158" y2="226" style={{ stroke: soft, strokeWidth: 0.4, opacity: 0.18 }} />
          <path d="M82 160 L65 218 L71 240" style={{ stroke: soft, strokeWidth: 1.15, fill: 'none', opacity: 0.56 }} />
          <path d="M154 160 L171 218 L165 240" style={{ stroke: soft, strokeWidth: 1.15, fill: 'none', opacity: 0.56 }} />
          <path d="M95 260 L88 334 L95 346" style={{ stroke: soft, strokeWidth: 1.15, fill: 'none', opacity: 0.52 }} />
          <path d="M141 260 L148 334 L141 346" style={{ stroke: soft, strokeWidth: 1.15, fill: 'none', opacity: 0.52 }} />
          <ellipse cx="118" cy="224" rx="46" ry="66" fill="url(#ld-rg-human)" opacity=".55" />
          <text x="118" y="370" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={soft} opacity=".55" style={{ letterSpacing: 2.5 }}>HUMAN</text>
        </g>

        {/* AI Twin — DNA-parameterized figure */}
        <g id="ld-gtwin" filter="url(#ld-f-glow)">
          <ellipse cx="362" cy="108" rx={head.rx} ry={head.ry} style={{ stroke: primary, strokeWidth: 1.5, fill: 'none', strokeDasharray: 145, strokeDashoffset: lerp(145, 0, cl01(ph1 * 1.5)) }} />
          <circle cx={362 + dna.eyeOffset} cy="108" r={head.inner} style={{ stroke: accent, strokeWidth: 0.7, fill: 'none', opacity: cl01((ph1 - 0.14) * 5) }} />
          <line x1="362" y1="131" x2="362" y2="150" style={{ stroke: primary, strokeWidth: 1.4, opacity: cl01((ph1 - 0.2) * 6) }} />
          <g transform={tilt !== 0 ? `rotate(${tilt.toFixed(2)} 362 152)` : undefined}>
            <path d="M323 152 Q362 144 401 152" style={{ stroke: primary, strokeWidth: 1.4, fill: 'none', strokeDasharray: 82, strokeDashoffset: lerp(82, 0, cl01((ph1 - 0.24) * 2.2)) }} />
          </g>
          <path d="M326 154 L321 248 L362 260 L403 248 L398 154" style={{ stroke: primary, strokeWidth: 1.15, fill: 'none', strokeDasharray: 248, strokeDashoffset: lerp(248, 0, cl01((ph1 - 0.3) * 2)) }} />
          <path d={`M362 154 Q ${spineCtrlX.toFixed(1)} 207 362 260`} style={{ stroke: primary, strokeWidth: 0.65, opacity: cl01((ph1 - 0.36) * 6) * 0.22, fill: 'none', strokeDasharray: '4 4' }} />
          <line x1="325" y1="178" x2="399" y2="178" style={{ stroke: primary, strokeWidth: 0.4, opacity: String(go_op(ph1)) }} />
          <line x1="323" y1="202" x2="401" y2="202" style={{ stroke: primary, strokeWidth: 0.4, opacity: String(go_op(ph1)) }} />
          <line x1="322" y1="226" x2="402" y2="226" style={{ stroke: primary, strokeWidth: 0.4, opacity: String(go_op(ph1)) }} />
          <path d={`M326 160 L309 ${armY(218)} L315 ${armY(240)}`} style={{ stroke: accent, strokeWidth: 1.15, fill: 'none', strokeDasharray: 100, strokeDashoffset: lerp(100, 0, cl01((ph1 - 0.4) * 3)) }} />
          <path d={`M398 160 L415 ${armY(218)} L409 ${armY(240)}`} style={{ stroke: accent, strokeWidth: 1.15, fill: 'none', strokeDasharray: 100, strokeDashoffset: lerp(100, 0, cl01((ph1 - 0.43) * 3)) }} />
          <path d={`M339 260 L332 ${legY(334)} L339 ${legY(346)}`} style={{ stroke: accent, strokeWidth: 1.15, fill: 'none', strokeDasharray: 90, strokeDashoffset: lerp(90, 0, cl01((ph1 - 0.5) * 3)) }} />
          <path d={`M385 260 L392 ${legY(334)} L385 ${legY(346)}`} style={{ stroke: accent, strokeWidth: 1.15, fill: 'none', strokeDasharray: 90, strokeDashoffset: lerp(90, 0, cl01((ph1 - 0.53) * 3)) }} />
          <path d="M362 118 L362 188 L342 224 M362 152 L382 188 M342 204 L394 204" style={{ stroke: primary, strokeWidth: 0.85, fill: 'none', opacity: cp_op(ph1) * 0.7, strokeDasharray: 200, strokeDashoffset: lerp(200, 0, cp_op(ph1)) }} />
          <ellipse cx="362" cy="226" rx="46" ry="66" fill="url(#ld-rg-twin)" style={{ opacity: String(cl01((ph1 - 0.7) * 4) * 0.5) }} />
          <text x="362" y="370" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={primary} style={{ letterSpacing: 2.5, opacity: String(cl01((ph1 - 0.8) * 5) * 0.7) }}>AI TWIN</text>
        </g>
      </g>

      {/* ── TRANSITION: CORE SYNAPSE SPHERE ── */}
      <g id="ld-gsphere" style={{ opacity: String(phT) }}>
        <circle cx="240" cy="262" r="110" fill="url(#ld-rg-orb-glow)" style={animate ? { animation: 'ld-orb 3.5s ease-in-out infinite' } : undefined} />
        <circle cx="240" cy="262" r="88" style={{ stroke: soft, strokeWidth: 1.2, fill: 'none', opacity: 0.45 }} />
        <ellipse cx="240" cy="262" rx="88" ry="22" style={{ stroke: primary, strokeWidth: 1, fill: 'none', opacity: 0.5, strokeDasharray: '12 5' }} />
        <ellipse cx="240" cy="262" rx="22" ry="88" style={{ stroke: accent, strokeWidth: 0.9, fill: 'none', opacity: 0.38, strokeDasharray: '10 6' }} />
        <ellipse cx="240" cy="262" rx="88" ry="22" style={{ stroke: soft, strokeWidth: 0.8, fill: 'none', opacity: 0.32, strokeDasharray: '9 7' }} transform="rotate(45,240,262)" />
        <ellipse cx="240" cy="262" rx="88" ry="22" style={{ stroke: soft, strokeWidth: 0.8, fill: 'none', opacity: 0.32, strokeDasharray: '9 7' }} transform="rotate(-45,240,262)" />
        <circle cx="240" cy="262" r="56" style={{ stroke: accent, strokeWidth: 0.7, fill: 'none', opacity: 0.28, strokeDasharray: '6 4' }} />
        <ellipse cx="240" cy="262" rx="56" ry="14" style={{ stroke: primary, strokeWidth: 0.7, fill: 'none', opacity: 0.3, strokeDasharray: '7 5' }} />
        <ellipse cx="240" cy="262" rx="14" ry="56" style={{ stroke: accent, strokeWidth: 0.6, fill: 'none', opacity: 0.22, strokeDasharray: '7 6' }} />

        <g style={{ transformOrigin: '240px 262px', animation: animate ? `ld-spin ${spinDur} linear infinite` : undefined }}>
          <ellipse cx="240" cy="262" rx="88" ry="22" style={{ stroke: primary, strokeWidth: 0.6, fill: 'none', opacity: 0.18, strokeDasharray: '5 22' }} transform="rotate(30,240,262)" />
          <circle r="3.5" fill={primary} opacity=".9" filter="url(#ld-f-glow)" />
        </g>
        <g style={{ transformOrigin: '240px 262px', animation: animate ? 'ld-spin-rev 11s linear infinite' : undefined }}>
          <ellipse cx="240" cy="262" rx="56" ry="14" style={{ stroke: accent, strokeWidth: 0.6, fill: 'none', opacity: 0.18, strokeDasharray: '4 16' }} transform="rotate(-30,240,262)" />
          <circle r="2.5" fill={accent} opacity=".85" filter="url(#ld-f-glow)" />
        </g>

        <circle cx="240" cy="262" r="26" fill="url(#ld-rg-orb)" opacity=".85" style={animate ? { animation: `ld-pulse ${pulseDur} ease-in-out infinite` } : undefined} />
        <circle cx="240" cy="262" r="10" fill="white" opacity=".9" filter="url(#ld-f-glow)" style={animate ? { animation: `ld-pulse ${(2.2 / dna.pulseRhythm).toFixed(2)}s .3s ease-in-out infinite` } : undefined} />

        {/* Data-mode confidence arc: visible when confidence provided */}
        {confidence !== undefined && (
          <circle
            cx="240" cy="262" r="72"
            style={{
              stroke: accent,
              strokeWidth: 2,
              fill: 'none',
              strokeLinecap: 'round',
              strokeDasharray: `${(2 * Math.PI * 72 * cl01(confidence)).toFixed(1)} ${2 * Math.PI * 72}`,
              transform: 'rotate(-90deg)',
              transformOrigin: '240px 262px',
            }}
          />
        )}

        <g style={{ stroke: primary, strokeWidth: 0.7, opacity: 0.35, fill: 'none' }}>
          <path d="M240 196 L240 328" strokeDasharray="20 8" style={animate ? { animation: 'ld-stream 2.2s ease-in-out infinite' } : undefined} />
          <path d="M152 262 L328 262" strokeDasharray="20 8" style={animate ? { animation: 'ld-stream 2.4s .4s ease-in-out infinite' } : undefined} />
          <path d="M178 200 L302 324" strokeDasharray="16 10" style={animate ? { animation: 'ld-stream 2.8s .2s ease-in-out infinite' } : undefined} />
          <path d="M302 200 L178 324" strokeDasharray="16 10" style={animate ? { animation: 'ld-stream 3s .6s ease-in-out infinite' } : undefined} />
        </g>

        <text x="240" y="232" textAnchor="middle" fontSize="6.5" fontWeight="700" fill={primary} opacity=".6" style={{ letterSpacing: 3 }}>CORE SYNAPSE</text>
        <text x="240" y="299" textAnchor="middle" fontSize="5.5" fontWeight="600" fill={accent} opacity=".45" style={{ letterSpacing: 2.5 }}>SELFPRINT ENGINE</text>
      </g>

      {/* ── PHASE 2: 12 SICE NODES ── */}
      <g id="ld-gnodes" style={{ opacity: String(ph2) }}>
        {labels.map((lbl, i) => {
          const deg = (i / 12) * 360 - 90;
          const rad = deg * Math.PI / 180;
          const nx = CX + NODE_R * Math.cos(rad);
          const ny = CY + NODE_R * Math.sin(rad);
          const lx = CX + LABEL_R * Math.cos(rad);
          const ly = CY + LABEL_R * Math.sin(rad);
          const col = i < 4 ? primary : i < 8 ? soft : accent;
          const np = cl01((ph2 - NODE_THRESH[i]) / 0.1);
          const pp = cl01((ph2 - NODE_THRESH[i]) / 0.07);
          const pf = cl01((ph2 - NODE_THRESH[i] - 0.09) / 0.08);
          const normDeg = ((deg % 360) + 360) % 360;
          const anchor = normDeg > 15 && normDeg < 165 ? 'start' : normDeg > 195 && normDeg < 345 ? 'end' : 'middle';
          const dotR = scores ? 4 + scores[i] * 3 : 5;
          return (
            <g key={i}>
              <line x1={CX} y1={CY} x2={nx} y2={ny} style={{ stroke: col, strokeWidth: 0.45, opacity: String(np * 0.35), strokeDasharray: '4 4' }} />
              <line x1={CX} y1={CY} x2={nx} y2={ny} style={{ stroke: col, strokeWidth: 1.6, opacity: String(pp * (1 - pf) * 0.65), strokeDasharray: `${NODE_R} ${NODE_R}`, strokeDashoffset: String(lerp(NODE_R, 0, pp)) }} />
              <circle cx={nx} cy={ny} r={dotR.toFixed(1)} style={{ fill: col, opacity: String(np) }} />
              <text x={lx} y={ly + 3} textAnchor={anchor} dominantBaseline="middle" fontSize="9" fontWeight="600" style={{ fill: col, opacity: String(np * 0.82), fontFamily: "'Inter','Noto Sans Thai',sans-serif" }}>{lbl}</text>
            </g>
          );
        })}
      </g>

      {/* ── CLIMAX: BEHAVIORAL MAP POLYGON ── */}
      <polygon
        points={phC > 0 ? polyPoints(phC, scores) : ''}
        fill="url(#ld-rg-orb-glow)"
        style={{ stroke: primary, strokeWidth: 1.3, strokeOpacity: 0.65, opacity: String(phC > 0 ? phC * 0.65 : 0) }}
        filter="url(#ld-f-glow)"
      />

      {/* ── BOTTOM CAPTION ── */}
      {!compact && (
        <text x="240" y="510" textAnchor="middle" fontSize="7.5" fill={soft} opacity=".28" style={{ letterSpacing: 4 }}>SELFPRINT ENGINE · 12 SICE DIMENSIONS</text>
      )}
    </svg>
  );
}

// Phase opacity helpers (kept outside component for purity/readability)
function go_op(ph1: number): number {
  return cl01((ph1 - 0.36) * 6) * 0.18;
}
function cp_op(ph1: number): number {
  return cl01((ph1 - 0.74) * 4);
}