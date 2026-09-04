import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

/**
 * EvolutionaryVisualSystem
 *
 * Scroll-driven SVG animation: Phase 1 (Human → AI Twin build) →
 * Transition (Core Synapse Sphere) → Phase 2 (12 SICE nodes activate) →
 * Climax (Behavioral Map polygon)
 *
 * Ported from the supplied EvolutionaryVisualSystem.jsx reference asset —
 * pure visual port, animation logic unchanged. SICE labels made bilingual
 * (isTh) to match the rest of the site instead of the original's hardcoded
 * Thai-only labels.
 *
 * Usage: <EvolutionaryVisualSystem containerRef={containerRef} isTh={isTh} />
 * Or with external scroll progress (0→1):
 *   <EvolutionaryVisualSystem scrollProgress={progress} isTh={isTh} />
 */

interface EvolutionaryVisualSystemProps {
  containerRef?: RefObject<HTMLElement | null>;
  scrollProgress?: number | null;
  isTh?: boolean;
}

const SICE_TH = [
  'ตัวตน', 'จิตใจ', 'การตัดสินใจ', 'จุดประสงค์',
  'อาชีพ', 'ความมั่งคั่ง', 'ชีวิต', 'การเติบโต',
  'ความสัมพันธ์', 'ความรัก', 'สุขภาพ', 'อนาคต',
];

const SICE_EN = [
  'Self', 'Mind', 'Decisions', 'Purpose',
  'Career', 'Wealth', 'Life', 'Growth',
  'Relationships', 'Love', 'Health', 'Future',
];

const CX = 240, CY = 262, NODE_R = 152, LABEL_R = 186;
const NODE_THRESH = [.04, .07, .10, .13, .32, .35, .38, .41, .60, .63, .66, .69];
const POLY_MOD = [1.0, .86, 1.1, .9, 1.05, .76, 1.14, .89, 1.0, .83, .97, 1.08];

interface TwinRefs {
  head?: SVGElement | null;
  head2?: SVGElement | null;
  neck?: SVGElement | null;
  sh?: SVGElement | null;
  torso?: SVGElement | null;
  spine?: SVGElement | null;
  g1?: SVGElement | null;
  g2?: SVGElement | null;
  g3?: SVGElement | null;
  al?: SVGElement | null;
  ar?: SVGElement | null;
  ll?: SVGElement | null;
  lr?: SVGElement | null;
  cir?: SVGElement | null;
  halo?: SVGElement | null;
  lbl?: SVGElement | null;
}

const EvolutionaryVisualSystem: React.FC<EvolutionaryVisualSystemProps> = ({
  containerRef,
  scrollProgress = null,
  isTh = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const nodesRef = useRef<SVGCircleElement[]>([]);
  const labelsRef = useRef<SVGTextElement[]>([]);
  const spokesRef = useRef<SVGLineElement[]>([]);
  const pulsesRef = useRef<SVGLineElement[]>([]);
  const twinRef = useRef<TwinRefs>({});

  const SICE = isTh ? SICE_TH : SICE_EN;

  // Init: build 12 nodes
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const gnodes = svg.getElementById('gnodes');
    if (!gnodes || gnodes.children.length > 0) return; // already built

    const SVG_NS = 'http://www.w3.org/2000/svg';
    nodesRef.current = [];
    labelsRef.current = [];
    spokesRef.current = [];
    pulsesRef.current = [];

    SICE.forEach((lbl, i) => {
      const deg = (i / 12) * 360 - 90;
      const rad = deg * Math.PI / 180;
      const nx = CX + NODE_R * Math.cos(rad);
      const ny = CY + NODE_R * Math.sin(rad);
      const lx = CX + LABEL_R * Math.cos(rad);
      const ly = CY + LABEL_R * Math.sin(rad);
      const col = i < 4 ? '#06E8F8' : i < 8 ? '#5B5CEB' : '#818CF8';

      // spoke
      const spk = document.createElementNS(SVG_NS, 'line');
      spk.setAttribute('x1', String(CX));
      spk.setAttribute('y1', String(CY));
      spk.setAttribute('x2', String(nx));
      spk.setAttribute('y2', String(ny));
      spk.setAttribute('stroke', col);
      spk.setAttribute('stroke-width', '.45');
      spk.setAttribute('stroke-dasharray', '4 4');
      spk.setAttribute('opacity', '0');
      spk.style.transition = 'opacity .5s ease';
      gnodes.appendChild(spk);
      spokesRef.current.push(spk);

      // electric pulse line
      const pul = document.createElementNS(SVG_NS, 'line');
      pul.setAttribute('x1', String(CX));
      pul.setAttribute('y1', String(CY));
      pul.setAttribute('x2', String(nx));
      pul.setAttribute('y2', String(ny));
      pul.setAttribute('stroke', col);
      pul.setAttribute('stroke-width', '1.6');
      pul.setAttribute('stroke-dasharray', NODE_R + ' ' + NODE_R);
      pul.setAttribute('stroke-dashoffset', String(NODE_R));
      pul.setAttribute('opacity', '0');
      pul.style.transition = 'stroke-dashoffset .4s ease,opacity .3s ease';
      gnodes.appendChild(pul);
      pulsesRef.current.push(pul);

      // dot
      const dot = document.createElementNS(SVG_NS, 'circle');
      dot.setAttribute('cx', String(nx));
      dot.setAttribute('cy', String(ny));
      dot.setAttribute('r', '5');
      dot.setAttribute('fill', col);
      dot.setAttribute('opacity', '0');
      dot.style.transition = 'opacity .45s ease';
      gnodes.appendChild(dot);
      nodesRef.current.push(dot as unknown as SVGCircleElement);

      // label
      const normDeg = ((deg % 360) + 360) % 360;
      const anchor = normDeg > 15 && normDeg < 165 ? 'start' : normDeg > 195 && normDeg < 345 ? 'end' : 'middle';
      const txt = document.createElementNS(SVG_NS, 'text');
      txt.setAttribute('x', String(lx));
      txt.setAttribute('y', String(ly + 3));
      txt.setAttribute('text-anchor', anchor);
      txt.setAttribute('dominant-baseline', 'middle');
      txt.setAttribute('font-size', '9');
      txt.setAttribute('font-weight', '600');
      txt.setAttribute('fill', col);
      txt.setAttribute('opacity', '0');
      txt.setAttribute('font-family', "'Inter','Noto Sans Thai',sans-serif");
      txt.style.transition = 'opacity .5s ease';
      txt.textContent = lbl;
      gnodes.appendChild(txt);
      labelsRef.current.push(txt as unknown as SVGTextElement);
    });

    // Cache twin element refs
    const bySvgId = (id: string) => svg.getElementById(id) as SVGElement | null;
    twinRef.current = {
      head: bySvgId('t-head'),
      head2: bySvgId('t-head2'),
      neck: bySvgId('t-neck'),
      sh: bySvgId('t-sh'),
      torso: bySvgId('t-torso'),
      spine: bySvgId('t-spine'),
      g1: bySvgId('t-g1'),
      g2: bySvgId('t-g2'),
      g3: bySvgId('t-g3'),
      al: bySvgId('t-al'),
      ar: bySvgId('t-ar'),
      ll: bySvgId('t-ll'),
      lr: bySvgId('t-lr'),
      cir: bySvgId('t-cir'),
      halo: bySvgId('t-halo'),
      lbl: bySvgId('t-label'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helpers
  const cl01 = (v: number) => Math.max(0, Math.min(1, v));
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const eio = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  // Polygon points for Behavioral Map
  const polyPts = (scale: number) => {
    return SICE.map((_, i) => {
      const rad = ((i / 12) * 360 - 90) * Math.PI / 180;
      const r = NODE_R * POLY_MOD[i] * scale;
      return `${CX + r * Math.cos(rad)},${CY + r * Math.sin(rad)}`;
    }).join(' ');
  };

  // Main scroll animation
  const updateAnimation = (progress: number) => {
    const svg = svgRef.current;
    if (!svg) return;

    const p = cl01(progress);
    const bySvgId = (id: string) => svg.getElementById(id) as SVGElement | null;

    // Phase values
    const ph1 = eio(cl01(p / 0.43));
    const phT = eio(cl01((p - 0.38) / 0.22));
    const ph2 = eio(cl01((p - 0.56) / 0.44));
    const phC = eio(cl01((p - 0.84) / 0.16));

    // Phase 1 opacity
    const p1op = cl01(1 - phT * 1.6);
    const gp1 = bySvgId('gp1');
    if (gp1) gp1.style.opacity = String(p1op);

    // Human
    const ghuman = bySvgId('ghuman');
    if (ghuman) ghuman.style.opacity = String(cl01(ph1 * 7));

    // Streams
    const gstreams = bySvgId('gstreams');
    if (gstreams) gstreams.style.opacity = String(ph1);

    // ISM grid
    const gism = bySvgId('gism');
    if (gism) gism.style.opacity = String(cl01((ph1 - 0.18) * 2.5));

    // AI Twin dashoffset
    const t = twinRef.current;
    if (t.head) t.head.setAttribute('stroke-dashoffset', String(lerp(145, 0, cl01(ph1 * 1.5))));
    if (t.head2) t.head2.style.opacity = String(cl01((ph1 - 0.14) * 5));
    if (t.neck) t.neck.style.opacity = String(cl01((ph1 - 0.2) * 6));
    if (t.sh) t.sh.setAttribute('stroke-dashoffset', String(lerp(82, 0, cl01((ph1 - 0.24) * 2.2))));
    if (t.torso) t.torso.setAttribute('stroke-dashoffset', String(lerp(248, 0, cl01((ph1 - 0.3) * 2))));
    if (t.spine) t.spine.style.opacity = String(cl01((ph1 - 0.36) * 6) * 0.22);

    const go = cl01((ph1 - 0.36) * 6) * 0.18;
    if (t.g1) t.g1.style.opacity = String(go);
    if (t.g2) t.g2.style.opacity = String(go);
    if (t.g3) t.g3.style.opacity = String(go);

    if (t.al) t.al.setAttribute('stroke-dashoffset', String(lerp(100, 0, cl01((ph1 - 0.4) * 3))));
    if (t.ar) t.ar.setAttribute('stroke-dashoffset', String(lerp(100, 0, cl01((ph1 - 0.43) * 3))));
    if (t.ll) t.ll.setAttribute('stroke-dashoffset', String(lerp(90, 0, cl01((ph1 - 0.5) * 3))));
    if (t.lr) t.lr.setAttribute('stroke-dashoffset', String(lerp(90, 0, cl01((ph1 - 0.53) * 3))));

    const cp = cl01((ph1 - 0.74) * 4);
    if (t.cir) {
      t.cir.style.opacity = String(cp * 0.7);
      t.cir.setAttribute('stroke-dashoffset', String(lerp(200, 0, cp)));
    }
    if (t.halo) t.halo.style.opacity = String(cl01((ph1 - 0.7) * 4) * 0.5);
    if (t.lbl) t.lbl.style.opacity = String(cl01((ph1 - 0.8) * 5) * 0.7);

    // Transition: Synapse Sphere
    const gsphere = bySvgId('gsphere');
    if (gsphere) gsphere.style.opacity = String(phT);

    // Phase 2: 12 SICE nodes
    const gnodes = bySvgId('gnodes');
    if (gnodes) gnodes.style.opacity = String(ph2);

    nodesRef.current.forEach((_, i) => {
      const np = cl01((ph2 - NODE_THRESH[i]) / 0.1);
      nodesRef.current[i].style.opacity = String(np);
      spokesRef.current[i].style.opacity = String(np * 0.35);
      labelsRef.current[i].style.opacity = String(np * 0.82);

      const pp = cl01((ph2 - NODE_THRESH[i]) / 0.07);
      const pf = cl01((ph2 - NODE_THRESH[i] - 0.09) / 0.08);
      pulsesRef.current[i].style.opacity = String(pp * (1 - pf) * 0.65);
      pulsesRef.current[i].setAttribute('stroke-dashoffset', String(lerp(NODE_R, 0, pp)));
    });

    // Climax: Behavioral Map
    const gmap = bySvgId('gmap') as SVGPolygonElement | null;
    if (gmap) {
      if (phC > 0) {
        gmap.setAttribute('points', polyPts(phC));
        gmap.style.opacity = String(phC * 0.65);
      } else {
        gmap.style.opacity = '0';
      }
    }
  };

  // Floating labels
  //
  // RAFLOOP-001 FIX (4 ก.ย. 2026) — loop นี้อยู่บน **หน้าแรก** และเดิมมีปัญหา 3 ข้อ:
  //   1. รันตลอดเวลาไม่มีวันหยุด แม้ผู้ใช้สลับแท็บไปทำอย่างอื่น → กินแบตมือถือ
  //   2. อ่าน `lbl.style.opacity` กลับจาก DOM ทุกเฟรม × 12 label = บังคับให้
  //      เบราว์เซอร์คำนวณ style ใหม่ทุกครั้ง (layout thrash) เฟรมละ 12 รอบ
  //   3. **ไม่เช็ค prefers-reduced-motion เลยระดับ JS** — ผู้ใช้ที่ตั้งค่าลด
  //      การเคลื่อนไหวไว้ (เมาง่าย / vestibular disorder) ยังโดน motion เต็ม ๆ
  //
  // แก้รอบนี้: (1) ไม่สร้าง loop เลยถ้าผู้ใช้ขอลด motion  (2) หยุด loop เมื่อ
  // แท็บถูกซ่อนแล้วกลับมาต่อเมื่อกลับมาดู  (3) อ่าน opacity จาก dataset.op ก่อน
  // ถ้ามี (เผื่อจุดที่ set opacity เขียนค่าคู่มาให้)
  //
  // ⚠️ ข้อ 2 ของปัญหา (layout thrash จากการอ่าน style กลับจาก DOM) **ยังแก้ไม่หมด**
  // เพราะยังไม่มีจุดไหนเขียน dataset.op — fallback จึงยังอ่าน style.opacity อยู่
  // การแก้ให้จบต้องรื้อ updateAnimation ซึ่งเป็นงานของ Track C (ดู F-07)
  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return; // ไม่ต้องสร้าง loop เลย

    let raf = 0;
    let running = true;

    const floatLabels = () => {
      if (!running) return;
      const now = Date.now();
      labelsRef.current.forEach((lbl, i) => {
        // อ่านจาก dataset ที่ updateAnimation เขียนไว้ แทนการอ่าน style กลับจาก DOM
        const op = parseFloat(lbl.dataset.op ?? lbl.style.opacity) || 0;
        if (op > 0.05) {
          const fy = Math.sin(now / 1300 + i * 0.72) * 2.8;
          lbl.style.transform = `translateY(${fy}px)`;
        }
      });
      raf = requestAnimationFrame(floatLabels);
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(floatLabels);
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    raf = requestAnimationFrame(floatLabels);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Scroll handling
  useEffect(() => {
    if (scrollProgress !== null && scrollProgress !== undefined) {
      // External scroll progress provided
      updateAnimation(scrollProgress);
      return;
    }

    // Internal scroll calculation
    const handleScroll = () => {
      if (!containerRef?.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const raw = total > 0 ? -rect.top / total : 0;
      const p = cl01(raw);
      updateAnimation(p);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll(); // init

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollProgress, containerRef]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 480 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <radialGradient id="evs-rg-human" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5B5CEB" stopOpacity=".32" />
          <stop offset="100%" stopColor="#5B5CEB" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="evs-rg-twin" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#06E8F8" stopOpacity=".3" />
          <stop offset="100%" stopColor="#06E8F8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="evs-rg-orb" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#06E8F8" stopOpacity=".65" />
          <stop offset="35%" stopColor="#5B5CEB" stopOpacity=".35" />
          <stop offset="100%" stopColor="#5B5CEB" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="evs-rg-orb-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5B5CEB" stopOpacity=".22" />
          <stop offset="100%" stopColor="#5B5CEB" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="evs-lg-stream" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5B5CEB" stopOpacity=".9" />
          <stop offset="55%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#06E8F8" stopOpacity=".9" />
        </linearGradient>
        <filter id="evs-f-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <style>{`
          @keyframes evs-pulse { 0%,100% { opacity: .35; } 50% { opacity: .7; } }
          @keyframes evs-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes evs-spin-rev { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
          @keyframes evs-orb { 0%,100% { opacity: .06; } 50% { opacity: .14; } }
          @keyframes evs-stream { 0% { stroke-dashoffset: 60; } 100% { stroke-dashoffset: 0; } }
          @keyframes evs-particle { 0% { opacity: 1; transform: translateX(0); } 80% { opacity: .7; } 100% { opacity: 0; transform: translateX(145px); } }
        `}</style>
      </defs>

      {/* P1: HUMAN + AI TWIN + STREAMS + ISM GRID */}
      <g id="gp1">
        <ellipse cx="240" cy="265" rx="190" ry="150" fill="url(#evs-rg-human)" style={{ animation: 'evs-orb 5s ease-in-out infinite' }} />

        <g id="gstreams" opacity={0}>
          <line x1="168" y1="205" x2="312" y2="205" stroke="url(#evs-lg-stream)" strokeWidth=".7" strokeDasharray="13 11" style={{ animation: 'evs-stream 1.9s linear infinite' }} />
          <line x1="168" y1="222" x2="312" y2="219" stroke="url(#evs-lg-stream)" strokeWidth="1.1" strokeDasharray="14 10" style={{ animation: 'evs-stream 1.7s .2s linear infinite' }} />
          <line x1="168" y1="239" x2="312" y2="238" stroke="url(#evs-lg-stream)" strokeWidth="1.7" strokeDasharray="18 8" style={{ animation: 'evs-stream 1.6s .08s linear infinite' }} />
          <line x1="168" y1="256" x2="312" y2="258" stroke="url(#evs-lg-stream)" strokeWidth="1.1" strokeDasharray="13 11" style={{ animation: 'evs-stream 1.95s .32s linear infinite' }} />
          <line x1="168" y1="272" x2="312" y2="275" stroke="url(#evs-lg-stream)" strokeWidth=".7" strokeDasharray="10 13" style={{ animation: 'evs-stream 2.1s .45s linear infinite' }} />
          <circle cx="182" cy="230" r="2.4" fill="#5B5CEB" opacity=".9" style={{ animation: 'evs-particle 2s 0s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' }} />
          <circle cx="198" cy="247" r="2" fill="#06E8F8" opacity=".85" style={{ animation: 'evs-particle 2s .5s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' }} />
          <circle cx="175" cy="260" r="1.7" fill="#818CF8" opacity=".8" style={{ animation: 'evs-particle 2.2s .85s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' }} />
          <circle cx="192" cy="213" r="1.5" fill="#06E8F8" opacity=".75" style={{ animation: 'evs-particle 1.85s .3s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' }} />
        </g>

        <g id="gism" opacity={0}>
          <text x="385" y="152" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#06E8F8" opacity=".42" letterSpacing="2">INITIAL STATE MATRIX</text>
          <g stroke="#06E8F8" strokeWidth=".35" strokeOpacity=".14">
            {[322, 346, 370, 394, 418, 442].map(x => <line key={`v${x}`} x1={x} y1="158" x2={x} y2="368" />)}
            {[174, 198, 222, 246, 270, 294, 318, 342].map(y => <line key={`h${y}`} x1="320" y1={y} x2="444" y2={y} />)}
          </g>
        </g>

        <g id="ghuman" filter="url(#evs-f-glow)" opacity={0}>
          <circle cx="118" cy="108" r="23" stroke="#5B5CEB" strokeWidth="1.5" fill="none" opacity=".75" />
          <circle cx="118" cy="108" r="12" stroke="#5B5CEB" strokeWidth=".7" fill="none" opacity=".32" />
          <line x1="118" y1="131" x2="118" y2="150" stroke="#5B5CEB" strokeWidth="1.4" opacity=".65" />
          <path d="M79 152 Q118 144 157 152" stroke="#5B5CEB" strokeWidth="1.4" fill="none" opacity=".72" />
          <path d="M82 154 L77 248 L118 260 L159 248 L154 154" stroke="#5B5CEB" strokeWidth="1.15" fill="none" opacity=".58" />
          <line x1="118" y1="154" x2="118" y2="260" stroke="#5B5CEB" strokeWidth=".65" opacity=".22" strokeDasharray="4 4" />
          <line x1="81" y1="178" x2="155" y2="178" stroke="#5B5CEB" strokeWidth=".4" opacity=".2" />
          <line x1="79" y1="202" x2="157" y2="202" stroke="#5B5CEB" strokeWidth=".4" opacity=".2" />
          <line x1="78" y1="226" x2="158" y2="226" stroke="#5B5CEB" strokeWidth=".4" opacity=".18" />
          <path d="M82 160 L65 218 L71 240" stroke="#5B5CEB" strokeWidth="1.15" fill="none" opacity=".56" />
          <path d="M154 160 L171 218 L165 240" stroke="#5B5CEB" strokeWidth="1.15" fill="none" opacity=".56" />
          <path d="M95 260 L88 334 L95 346" stroke="#5B5CEB" strokeWidth="1.15" fill="none" opacity=".52" />
          <path d="M141 260 L148 334 L141 346" stroke="#5B5CEB" strokeWidth="1.15" fill="none" opacity=".52" />
          <ellipse cx="118" cy="224" rx="46" ry="66" fill="url(#evs-rg-human)" opacity=".55" />
          <text x="118" y="370" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#5B5CEB" opacity=".55" letterSpacing="2.5">HUMAN</text>
        </g>

        <g id="gtwin" filter="url(#evs-f-glow)">
          <circle id="t-head" cx="362" cy="108" r="23" stroke="#06E8F8" strokeWidth="1.5" fill="none" strokeDasharray="145" strokeDashoffset="145" />
          <circle id="t-head2" cx="362" cy="108" r="12" stroke="#818CF8" strokeWidth=".7" fill="none" opacity={0} />
          <line id="t-neck" x1="362" y1="131" x2="362" y2="150" stroke="#06E8F8" strokeWidth="1.4" opacity={0} />
          <path id="t-sh" d="M323 152 Q362 144 401 152" stroke="#06E8F8" strokeWidth="1.4" fill="none" strokeDasharray="82" strokeDashoffset="82" />
          <path id="t-torso" d="M326 154 L321 248 L362 260 L403 248 L398 154" stroke="#06E8F8" strokeWidth="1.15" fill="none" strokeDasharray="248" strokeDashoffset="248" />
          <line id="t-spine" x1="362" y1="154" x2="362" y2="260" stroke="#06E8F8" strokeWidth=".65" opacity={0} strokeDasharray="4 4" />
          <line id="t-g1" x1="325" y1="178" x2="399" y2="178" stroke="#06E8F8" strokeWidth=".4" opacity={0} />
          <line id="t-g2" x1="323" y1="202" x2="401" y2="202" stroke="#06E8F8" strokeWidth=".4" opacity={0} />
          <line id="t-g3" x1="322" y1="226" x2="402" y2="226" stroke="#06E8F8" strokeWidth=".4" opacity={0} />
          <path id="t-al" d="M326 160 L309 218 L315 240" stroke="#818CF8" strokeWidth="1.15" fill="none" strokeDasharray="100" strokeDashoffset="100" />
          <path id="t-ar" d="M398 160 L415 218 L409 240" stroke="#818CF8" strokeWidth="1.15" fill="none" strokeDasharray="100" strokeDashoffset="100" />
          <path id="t-ll" d="M339 260 L332 334 L339 346" stroke="#818CF8" strokeWidth="1.15" fill="none" strokeDasharray="90" strokeDashoffset="90" />
          <path id="t-lr" d="M385 260 L392 334 L385 346" stroke="#818CF8" strokeWidth="1.15" fill="none" strokeDasharray="90" strokeDashoffset="90" />
          <path id="t-cir" d="M362 118 L362 188 L342 224 M362 152 L382 188 M342 204 L394 204" stroke="#06E8F8" strokeWidth=".85" fill="none" opacity={0} strokeDasharray="200" strokeDashoffset="200" />
          <ellipse id="t-halo" cx="362" cy="226" rx="46" ry="66" fill="url(#evs-rg-twin)" opacity={0} />
          <text id="t-label" x="362" y="370" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#06E8F8" opacity={0} letterSpacing="2.5">AI TWIN</text>
        </g>
      </g>

      {/* TRANSITION: CORE SYNAPSE SPHERE */}
      <g id="gsphere" opacity={0}>
        <circle cx="240" cy="262" r="110" fill="url(#evs-rg-orb-glow)" style={{ animation: 'evs-orb 3.5s ease-in-out infinite' }} />
        <circle cx="240" cy="262" r="88" stroke="#5B5CEB" strokeWidth="1.2" fill="none" opacity=".45" />
        <ellipse cx="240" cy="262" rx="88" ry="22" stroke="#06E8F8" strokeWidth="1" fill="none" opacity=".5" strokeDasharray="12 5" />
        <ellipse cx="240" cy="262" rx="22" ry="88" stroke="#818CF8" strokeWidth="0.9" fill="none" opacity=".38" strokeDasharray="10 6" />
        <ellipse cx="240" cy="262" rx="88" ry="22" stroke="#5B5CEB" strokeWidth="0.8" fill="none" opacity=".32" strokeDasharray="9 7" transform="rotate(45,240,262)" />
        <ellipse cx="240" cy="262" rx="88" ry="22" stroke="#5B5CEB" strokeWidth="0.8" fill="none" opacity=".32" strokeDasharray="9 7" transform="rotate(-45,240,262)" />
        <circle cx="240" cy="262" r="56" stroke="#818CF8" strokeWidth="0.7" fill="none" opacity=".28" strokeDasharray="6 4" />
        <ellipse cx="240" cy="262" rx="56" ry="14" stroke="#06E8F8" strokeWidth="0.7" fill="none" opacity=".3" strokeDasharray="7 5" />
        <ellipse cx="240" cy="262" rx="14" ry="56" stroke="#818CF8" strokeWidth="0.6" fill="none" opacity=".22" strokeDasharray="7 6" />

        <g style={{ transformOrigin: '240px 262px', animation: 'evs-spin 16s linear infinite' }}>
          <ellipse cx="240" cy="262" rx="88" ry="22" stroke="#06E8F8" strokeWidth="0.6" fill="none" opacity=".18" strokeDasharray="5 22" transform="rotate(30,240,262)" />
          <circle r="3.5" fill="#06E8F8" opacity=".9" filter="url(#evs-f-glow)">
            <animateMotion dur="16s" repeatCount="indefinite">
              <mpath href="#evs-orbit-path-1" />
            </animateMotion>
          </circle>
        </g>

        <g style={{ transformOrigin: '240px 262px', animation: 'evs-spin-rev 11s linear infinite' }}>
          <ellipse cx="240" cy="262" rx="56" ry="14" stroke="#818CF8" strokeWidth="0.6" fill="none" opacity=".18" strokeDasharray="4 16" transform="rotate(-30,240,262)" />
          <circle r="2.5" fill="#818CF8" opacity=".85" filter="url(#evs-f-glow)">
            <animateMotion dur="11s" repeatCount="indefinite">
              <mpath href="#evs-orbit-path-2" />
            </animateMotion>
          </circle>
        </g>

        <path id="evs-orbit-path-1" d="M328,262 A88,22 0 1,1 327.99,262Z" fill="none" />
        <path id="evs-orbit-path-2" d="M296,262 A56,14 0 1,0 295.99,262Z" fill="none" />

        <circle cx="240" cy="262" r="26" fill="url(#evs-rg-orb)" opacity=".85" style={{ animation: 'evs-pulse 2.8s ease-in-out infinite' }} />
        <circle cx="240" cy="262" r="10" fill="white" opacity=".9" filter="url(#evs-f-glow)" style={{ animation: 'evs-pulse 2.2s .3s ease-in-out infinite' }} />

        <g stroke="#06E8F8" strokeWidth="0.7" opacity=".35" fill="none">
          <path d="M240 196 L240 328" strokeDasharray="20 8" style={{ animation: 'evs-stream 2.2s ease-in-out infinite' }} />
          <path d="M152 262 L328 262" strokeDasharray="20 8" style={{ animation: 'evs-stream 2.4s .4s ease-in-out infinite' }} />
          <path d="M178 200 L302 324" strokeDasharray="16 10" style={{ animation: 'evs-stream 2.8s .2s ease-in-out infinite' }} />
          <path d="M302 200 L178 324" strokeDasharray="16 10" style={{ animation: 'evs-stream 3s .6s ease-in-out infinite' }} />
        </g>

        <text x="240" y="232" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#06E8F8" opacity=".6" letterSpacing="3">CORE SYNAPSE</text>
        <text x="240" y="299" textAnchor="middle" fontSize="5.5" fontWeight="600" fill="#818CF8" opacity=".45" letterSpacing="2.5">SELFPRINT ENGINE</text>
      </g>

      {/* P2: 12 SICE NODES */}
      <g id="gnodes" opacity={0}></g>

      {/* CLIMAX: BEHAVIORAL MAP POLYGON */}
      <polygon id="gmap" points="" fill="url(#evs-rg-orb-glow)" stroke="#06E8F8" strokeWidth="1.3" strokeOpacity=".65" opacity={0} filter="url(#evs-f-glow)" />

      {/* BOTTOM LABEL */}
      <text x="240" y="510" textAnchor="middle" fontSize="7.5" fill="#5B5CEB" opacity=".28" letterSpacing="4">SELFPRINT ENGINE · 12 SICE DIMENSIONS</text>
    </svg>
  );
};

export default EvolutionaryVisualSystem;
