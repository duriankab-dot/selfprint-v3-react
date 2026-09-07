/**
 * useTwinFidelity.ts
 *
 * PHASE0 forensic (docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md §"ถ้าจะทำ Twin 4
 * fidelity state (HIGH / MEDIUM / LOW / FALLBACK)") — step 1 of 3 before
 * the Twin facade: the single place that decides how much motion/detail a
 * device gets, from:
 *   - prefers-reduced-motion (OS accessibility signal — always wins)
 *   - Save-Data / navigator.connection.saveData (explicit user data pref)
 *   - navigator.hardwareConcurrency / navigator.deviceMemory (weak device)
 *   - pointer: coarse (touch — soft signal only, not decisive on its own)
 *
 * Renderer ladder (the <Twin /> facade decides which renderer per tier —
 * this hook only classifies the device):
 *   FALLBACK → div + gradient, zero motion
 *   LOW      → CSS keyframes only (cheap orb, no SVG)
 *   MEDIUM   → SVG + CSS var pipeline (today's TwinPresence, full detail)
 *   HIGH     → reserved, not implemented — PHASE0 §"ข้อสรุปตรง ๆ" decided
 *              against WebGL for now (three.js ~350kB gzip vs. current
 *              ~250kB gzip initial bundle isn't justified without real
 *              Lighthouse/WebPageTest numbers to argue from). The facade
 *              renders MEDIUM for a 'HIGH' classification until that
 *              renderer exists.
 */
import { useEffect, useState } from 'react';

export type TwinFidelity = 'FALLBACK' | 'LOW' | 'MEDIUM' | 'HIGH';

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  connection?: EventTarget & { saveData?: boolean };
};

function classify(): TwinFidelity {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'MEDIUM'; // SSR/non-browser — safe default, matches today's app default
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'FALLBACK';
  }

  const nav = navigator as NavigatorWithHints;

  if (nav.connection?.saveData) {
    return 'FALLBACK';
  }

  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory; // GB — undefined on browsers that don't expose it (Safari/Firefox)
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

  // Weak device — low core count or an explicit low-memory signal.
  if (cores <= 2 || (memory !== undefined && memory <= 2)) {
    return 'LOW';
  }

  // Strong desktop-class device — reserved for a future HIGH renderer.
  if (!coarsePointer && cores >= 8 && (memory === undefined || memory >= 8)) {
    return 'HIGH';
  }

  return 'MEDIUM';
}

/**
 * Live Twin render-fidelity tier for the current device. Reacts at
 * runtime to the OS reduced-motion toggle and Save-Data connection changes
 * (both can change mid-session without a reload); hardwareConcurrency /
 * deviceMemory are read once since they don't change during a session.
 */
export function useTwinFidelity(): TwinFidelity {
  const [fidelity, setFidelity] = useState<TwinFidelity>(() => classify());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setFidelity(classify());

    motionQuery.addEventListener('change', update);
    const connection = (navigator as NavigatorWithHints).connection;
    connection?.addEventListener?.('change', update);

    return () => {
      motionQuery.removeEventListener('change', update);
      connection?.removeEventListener?.('change', update);
    };
  }, []);

  return fidelity;
}
