/**
 * HologramBirth.tsx
 * Twin Birth Animation — "Particle → Asymmetric Living Seed → Twin Emerges"
 *
 * VISUAL DNA:
 *   Particles scatter in void → attract toward asymmetric density cluster →
 *   organic living seed forms → silhouette stabilizes with breathing/wobble →
 *   Twin emerges as a living presence.
 *
 * NO predefined shapes (sphere/crystal/ring/diamond/bloom/wave).
 * Instead: form grows from the Twin's own deterministic traits:
 *   - asymmetric silhouette (from archetype shapeJitterSeed + facetCount)
 *   - particle density variation (densityCenter biased by growth direction)
 *   - growth direction bias (per-user from seeded PRNG)
 *   - facet/detail density (traits.facetCount + facetRadiusRatio)
 *   - motion signature / breathing rhythm (traits.pulseSpeedFactor)
 *   - hue from per-user trait (coreColor from Visual DNA)
 *
 * DETERMINISTIC: Same seedKey + archetype → same visual birth every time.
 * Progressive enhancement: canvas 2D only, no new 3D/WebGL (C5 compliant).
 *
 * TIMING: ~4 seconds total
 *   Phase 1 (0–30%): Particles scattered in void
 *   Phase 2 (30–60%): Attraction — particles gravitate asymmetrically
 *   Phase 3 (60–80%): Living seed forms — organic shape emerges
 *   Phase 4 (80–95%): Twin silhouette stabilizes — breathing/wobble begins
 *   Phase 5 (95–100%): Reveal — "Meet your Twin."
 */

import React, { useEffect, useRef } from 'react';
import type { Archetype } from '@/context/TwinContext';
import { getTwinVisualDNA } from '@/lib/twin/twinVisualDNA';
import { getUniqueTwinTraits } from '@/lib/twin/twinUniqueness';

interface HologramBirthProps {
  onComplete: () => void;
  color?: string;
  primaryArchetype?: Archetype;
  secondaryArchetype?: Archetype;
  seedKey?: string;
}

export const HologramBirth: React.FC<HologramBirthProps> = ({
  onComplete,
  color = '#3b82f6',
  primaryArchetype,
  secondaryArchetype,
  seedKey,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) / 3.5;

    // Resolve Twin's Visual DNA (deterministic from archetype)
    const visualDNA = getTwinVisualDNA(primaryArchetype, secondaryArchetype);
    const coreColor = color || visualDNA.coreColor;
    const traits = getUniqueTwinTraits(seedKey ?? primaryArchetype ?? 'default-twin');

    // ─── Seeded PRNG (deterministic from seedKey) ──────────────────────
    function seededRandom(seed: number): () => number {
      let s = seed;
      return () => {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0xffffffff;
      };
    }

    const rng = seededRandom(
      traits.shapeJitterSeed * 1000 + traits.hueShiftDeg * 10 + traits.facetCount,
    );

    // ─── Asymmetric Growth Parameters (from Twin traits) ──────────────
    const growthBiasX = (rng() - 0.5) * 0.6; // -0.3 to +0.3
    const growthBiasY = (rng() - 0.5) * 0.6;
    const densityCenterX = 0.5 + growthBiasX * 0.3; // normalized 0–1
    const densityCenterY = 0.5 + growthBiasY * 0.3;
    const breathingSpeed = 0.015 * traits.pulseSpeedFactor;
    const wobbleAmplitude = 0.04 + traits.shapeJitterSeed * 0.02;

    // ─── Particle System ──────────────────────────────────────────────
    interface Particle {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      vx: number;
      vy: number;
      size: number;
      brightness: number;
      phase: number; // for individual oscillation
    }

    const particleCount = 200;
    const particles: Particle[] = [];

    // Generate target positions using asymmetric organic distribution
    // (not a circle — a clustered organic shape)
    function generateTargetPosition(idx: number, total: number): [number, number] {
      const t = idx / total;
      const angle = t * Math.PI * 2 + traits.rotationOffsetDeg * (Math.PI / 180);

      // Asymmetric radius — varies by angle based on seed
      const asymmetryFreq = 3 + Math.floor(traits.facetCount / 2);
      const asymmetryAmp = 0.15 + traits.shapeJitterSeed * 0.1;
      const radiusVariation = 1 + asymmetryAmp * Math.sin(angle * asymmetryFreq + traits.shapeJitterSeed * 5);

      // Density clustering — not uniform around center
      const densityAngle = Math.atan2(densityCenterY - 0.5, densityCenterX - 0.5);
      const densityPull = Math.exp(-Math.pow((angle - densityAngle) % (Math.PI * 2), 2) / 2) * 0.3;
      const finalRadius = maxRadius * (0.4 + radiusVariation * 0.6 + densityPull);

      return [
        centerX + Math.cos(angle) * finalRadius,
        centerY + Math.sin(angle) * finalRadius,
      ];
    }

    for (let i = 0; i < particleCount; i++) {
      const [targetX, targetY] = generateTargetPosition(i, particleCount);
      // Start scattered far away
      const startAngle = rng() * Math.PI * 2;
      const startDistance = maxRadius * (1.5 + rng() * 1.5);

      particles.push({
        x: centerX + Math.cos(startAngle) * startDistance,
        y: centerY + Math.sin(startAngle) * startDistance,
        targetX,
        targetY,
        vx: 0,
        vy: 0,
        size: rng() * 2.5 + 0.5,
        brightness: rng() * 0.5 + 0.5,
        phase: rng() * Math.PI * 2,
      });
    }

    // ─── Organic Silhouette Points ────────────────────────────────────
    // Generate an asymmetric closed curve (the "living seed" outline)
    const silhouettePoints = 60;
    const silhouetteData: Array<{ x: number; y: number; baseR: number }> = [];

    for (let i = 0; i < silhouettePoints; i++) {
      const angle = (i / silhouettePoints) * Math.PI * 2;
      // Asymmetric radius with multiple frequency components
      let r = maxRadius * 0.5;
      r += maxRadius * 0.15 * Math.sin(angle * 3 + traits.shapeJitterSeed * 3);
      r += maxRadius * 0.1 * Math.sin(angle * 5 + traits.shapeJitterSeed * 7);
      r += maxRadius * 0.08 * Math.cos(angle * 2 + traits.rotationOffsetDeg * 0.01);
      // Density bias
      const biasAngle = Math.atan2(growthBiasY, growthBiasX);
      r += maxRadius * 0.06 * Math.cos(angle - biasAngle);

      silhouetteData.push({ x: angle, y: 0, baseR: r });
    }

    // ─── Animation Phases ─────────────────────────────────────────────
    const totalDuration = 4000; // 4 seconds
    let animationId: number;
    let startTime: number | null = null;

    /** Alpha to hex string */
    const alphaHex = (a: number): string =>
      Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = Math.min(timestamp - startTime, totalDuration);
      const progress = elapsed / totalDuration;

      // Clear with fade trail
      ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Breathing offset (phase 4+)
      const breathe = Math.sin(elapsed * breathingSpeed) * wobbleAmplitude * maxRadius;
      const wobbleX = Math.sin(elapsed * breathingSpeed * 0.7) * wobbleAmplitude * maxRadius * 0.5;
      const wobbleY = Math.cos(elapsed * breathingSpeed * 0.9) * wobbleAmplitude * maxRadius * 0.3;

      // ─── Phase 1 (0–30%): Scattered Particles ─────────────────────

      ctx.shadowColor = coreColor;
      ctx.shadowBlur = 15;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const individualPhase = (elapsed * 0.002 + p.phase) % (Math.PI * 2);
        const twinkle = 0.5 + 0.5 * Math.sin(individualPhase);

        // Move toward target based on progress
        const attractionStrength = progress > 0.3 ? Math.min(1, (progress - 0.3) / 0.4) : 0;
        const currentX = p.x + (p.targetX - p.x) * attractionStrength * 0.8 + wobbleX * 0.1;
        const currentY = p.y + (p.targetY - p.y) * attractionStrength * 0.8 + wobbleY * 0.1;

        const opacity = (0.3 + twinkle * 0.5) * (1 - attractionStrength * 0.5);
        ctx.globalAlpha = opacity * p.brightness;
        ctx.fillStyle = coreColor;
        ctx.beginPath();
        ctx.arc(currentX, currentY, p.size * (1 - attractionStrength * 0.3), 0, Math.PI * 2);
        ctx.fill();
      }

      // ─── Phase 2 (30–60%): Attraction + Density Formation ───────────
      const phase2Progress = progress > 0.3 ? Math.min(1, (progress - 0.3) / 0.3) : 0;

      // Draw density glow at asymmetric center
      if (phase2Progress > 0) {
        const glowRadius = maxRadius * (0.2 + phase2Progress * 0.3);
        const gradient = ctx.createRadialGradient(
          centerX + growthBiasX * maxRadius * phase2Progress,
          centerY + growthBiasY * maxRadius * phase2Progress,
          0,
          centerX + growthBiasX * maxRadius * phase2Progress,
          centerY + growthBiasY * maxRadius * phase2Progress,
          glowRadius,
        );
        gradient.addColorStop(0, `${coreColor}${alphaHex(phase2Progress * 0.6)}`);
        gradient.addColorStop(0.5, `${coreColor}${alphaHex(phase2Progress * 0.2)}`);
        gradient.addColorStop(1, `${coreColor}00`);
        ctx.globalAlpha = 1;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(
          centerX + growthBiasX * maxRadius * phase2Progress,
          centerY + growthBiasY * maxRadius * phase2Progress,
          glowRadius,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      // ─── Phase 3 (60–80%): Living Seed Forms ────────────────────────
      const phase3Progress = progress > 0.6 ? Math.min(1, (progress - 0.6) / 0.2) : 0;
      const phase3Ease = phase3Progress * phase3Progress; // ease-in quadratic

      if (phase3Progress > 0) {
        ctx.globalAlpha = phase3Progress;
        ctx.strokeStyle = `${coreColor}${alphaHex(phase3Progress * 0.8)}`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 25;

        ctx.beginPath();
        for (let i = 0; i <= silhouettePoints; i++) {
          const idx = i % silhouettePoints;
          const pt = silhouetteData[idx];
          const r = pt.baseR * (0.3 + phase3Ease * 0.7) + breathe * phase3Ease;
          const px = centerX + Math.cos(pt.x) * r + wobbleX * phase3Ease;
          const py = centerY + Math.sin(pt.x) * r + wobbleY * phase3Ease;

          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();

        // Inner fill (subtle)
        ctx.fillStyle = `${coreColor}${alphaHex(phase3Progress * 0.15)}`;
        ctx.fill();
      }

      // ─── Phase 4 (80–95%): Twin Silhouette Stabilizes ───────────────
      const phase4Progress = progress > 0.8 ? Math.min(1, (progress - 0.8) / 0.15) : 0;

      if (phase4Progress > 0) {
        // Full silhouette with breathing
        ctx.globalAlpha = phase4Progress;
        ctx.strokeStyle = `${coreColor}${alphaHex(phase4Progress)}`;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 35;

        ctx.beginPath();
        for (let i = 0; i <= silhouettePoints; i++) {
          const idx = i % silhouettePoints;
          const pt = silhouetteData[idx];
          // Breathing wobble per-point
          const pointBreath = Math.sin(elapsed * breathingSpeed + pt.x * 2) * breathe;
          const r = pt.baseR + pointBreath + wobbleX * 0.3;
          const px = centerX + Math.cos(pt.x) * r + wobbleX;
          const py = centerY + Math.sin(pt.x) * r + wobbleY;

          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();

        // Inner glow gradient
        const innerGrad = ctx.createRadialGradient(
          centerX + wobbleX * 0.5,
          centerY + wobbleY * 0.5,
          0,
          centerX + wobbleX * 0.5,
          centerY + wobbleY * 0.5,
          maxRadius * 0.5,
        );
        innerGrad.addColorStop(0, `${coreColor}${alphaHex(phase4Progress * 0.3)}`);
        innerGrad.addColorStop(0.6, `${coreColor}${alphaHex(phase4Progress * 0.1)}`);
        innerGrad.addColorStop(1, `${coreColor}00`);
        ctx.fillStyle = innerGrad;
        ctx.fill();

        // Core pulse
        const corePulse = maxRadius * 0.12 * (0.8 + Math.sin(elapsed * breathingSpeed * 1.5) * 0.2);
        ctx.fillStyle = `${coreColor}${alphaHex(phase4Progress * 0.7)}`;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(centerX + wobbleX * 0.5, centerY + wobbleY * 0.5, corePulse, 0, Math.PI * 2);
        ctx.fill();

        // Orbiting facets (like TwinPresence)
        if (phase4Progress > 0.5) {
          const facetOpacity = (phase4Progress - 0.5) * 2;
          const facetRadius = maxRadius * (0.45 + traits.facetRadiusRatio * 0.25);
          const spinDeg = (elapsed * 0.015 * traits.orbitDirection * traits.pulseSpeedFactor) % 360;
          ctx.fillStyle = `${coreColor}${alphaHex(facetOpacity * 0.6)}`;
          ctx.shadowBlur = 8;
          for (let i = 0; i < traits.facetCount; i++) {
            const angle =
              ((360 / traits.facetCount) * i + traits.rotationOffsetDeg + spinDeg) * (Math.PI / 180);
            const fx = centerX + Math.cos(angle) * facetRadius + wobbleX;
            const fy = centerY + Math.sin(angle) * facetRadius + wobbleY;
            ctx.beginPath();
            ctx.arc(fx, fy, 2 * traits.facetSizeRatio, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // ─── Fade out and complete ──────────────────────────────────────
      if (elapsed >= totalDuration) {
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onComplete();
        return;
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [onComplete, color, primaryArchetype, secondaryArchetype, seedKey]);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-lg"
        style={{ background: 'radial-gradient(circle, rgba(30,41,59,0.8) 0%, rgba(15,23,42,1) 100%)' }}
      />
    </div>
  );
};

export default HologramBirth;
