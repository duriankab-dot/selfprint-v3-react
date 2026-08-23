/**
 * HologramBirth.tsx
 * Twin hologram birth animation
 *
 * VISUAL: Particles forming shape → light pulsing → Twin emerges
 * AUDIO: Ambient sound building → sacred tone
 * TIMING: 3-4 seconds of pure WOW
 *
 * TWINPRESENCE-005: previously always converged into a plain circle
 * regardless of archetype (only `color` varied) — every user's Twin was
 * born looking identical. Now draws the Twin's actual archetype shape
 * (sphere/crystal/ring/diamond/bloom/wave) plus this Twin's own unique
 * traits (hue shift, facet "constellation", polygon jitter, spin
 * direction) — the same seed/traits TwinPresence.tsx uses in the World,
 * so the Twin being born here is visibly the same one the user meets
 * afterward, not a generic placeholder.
 */

import React, { useEffect, useRef } from 'react';
import type { TwinCoreShape } from '../../lib/twin/twinVisualDNA';
import { getUniqueTwinTraits, shiftHue } from '../../lib/twin/twinUniqueness';

interface HologramBirthProps {
  onComplete: () => void;
  color?: string;
  /** Twin's archetype core shape — defaults to 'sphere' if not yet known. */
  shape?: TwinCoreShape;
  /** Stable per-user seed (session.user.id is used pre-birth, before a
   *  Twin row/id exists) — drives this Twin's unique traits. */
  seedKey?: string;
}

export const HologramBirth: React.FC<HologramBirthProps> = ({
  onComplete,
  color = '#3b82f6',
  shape = 'sphere',
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
    const maxRadius = Math.min(canvas.width, canvas.height) / 3;

    const traits = getUniqueTwinTraits(seedKey ?? shape ?? 'default-twin');
    const uniqueColor = shiftHue(color, traits.hueShiftDeg);

    // Particle system for hologram birth
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      size: number;
    }

    const particles: Particle[] = [];
    let animationProgress = 0;
    const totalDuration = 3000; // 3 seconds
    let animationId: number;

    // Create particles
    const particleCount = 150;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = maxRadius * 1.2;
      particles.push({
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2,
        life: 1,
        size: Math.random() * 3 + 1,
      });
    }

    /** Vertex points for a jittered regular polygon — same math as the
     *  SVG version in TwinPresence.tsx (jitteredPolygonPoints) so the
     *  crystal/diamond silhouette born here matches what appears in the
     *  World afterward. */
    const polygonPoints = (vertexCount: number, radius: number, startAngleDeg: number): Array<[number, number]> => {
      const pts: Array<[number, number]> = [];
      for (let i = 0; i < vertexCount; i++) {
        const angle = ((startAngleDeg + (360 / vertexCount) * i) * Math.PI) / 180;
        const wobble = 1 + 0.14 * Math.sin(traits.shapeJitterSeed * 100 + i * 2.4);
        const r = radius * wobble;
        pts.push([centerX + r * Math.cos(angle), centerY + r * Math.sin(angle)]);
      }
      return pts;
    };

    const tracePolygon = (pts: Array<[number, number]>) => {
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.closePath();
    };

    const alphaHex = (a: number) => Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');

    const animate = (timestamp: number) => {
      const elapsed = Math.min(timestamp, totalDuration);
      animationProgress = elapsed / totalDuration;

      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw particles moving toward center
      ctx.fillStyle = `${uniqueColor}80`;
      ctx.shadowColor = uniqueColor;
      ctx.shadowBlur = 20;

      particles.forEach((particle) => {
        const progress = animationProgress;

        // Particles move toward center
        const targetX = centerX;
        const targetY = centerY;
        particle.x += (targetX - particle.x) * progress * 0.05;
        particle.y += (targetY - particle.y) * progress * 0.05;

        // Fade out at end
        particle.life = 1 - progress * 0.3;

        ctx.globalAlpha = particle.life;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Draw emerging hologram shape — the Twin's real archetype shape,
      // not always a circle.
      if (animationProgress > 0.3) {
        const formProgress = (animationProgress - 0.3) / 0.7;
        const radius = maxRadius * formProgress;
        const opacity = Math.min(1, formProgress * 2);

        ctx.save();
        ctx.strokeStyle = `${uniqueColor}${alphaHex(opacity)}`;
        ctx.lineWidth = 3;
        ctx.shadowColor = uniqueColor;
        ctx.shadowBlur = 30;

        switch (shape) {
          case 'crystal':
            tracePolygon(polygonPoints(4, radius, -90 + traits.rotationOffsetDeg));
            ctx.stroke();
            break;
          case 'diamond':
            tracePolygon(polygonPoints(4, radius * 0.9, traits.rotationOffsetDeg));
            ctx.stroke();
            break;
          case 'ring':
            ctx.lineWidth = 9;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
            break;
          case 'bloom':
            for (let p = 0; p < 6; p++) {
              const petalAngle = ((p * 60 + traits.rotationOffsetDeg) * Math.PI) / 180;
              const px = centerX + Math.cos(petalAngle) * radius * 0.5;
              const py = centerY + Math.sin(petalAngle) * radius * 0.5;
              ctx.beginPath();
              ctx.ellipse(px, py, radius * 0.28, radius * 0.5, petalAngle, 0, Math.PI * 2);
              ctx.stroke();
            }
            break;
          case 'wave': {
            ctx.beginPath();
            for (let a = 0; a <= 360; a += 10) {
              const rad = (a * Math.PI) / 180;
              const wob = radius * (0.85 + 0.15 * Math.sin(rad * 3 + traits.shapeJitterSeed * 10));
              const x = centerX + Math.cos(rad) * wob;
              const y = centerY + Math.sin(rad) * wob;
              if (a === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
            break;
          }
          case 'sphere':
          default:
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Inner glow (all shapes)
        ctx.strokeStyle = `${uniqueColor}${alphaHex(opacity * 0.6)}`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();

        // Pulsing core — speed varies per Twin (traits.pulseSpeedFactor)
        const coreSize = radius * 0.3 * (0.8 + Math.sin(timestamp * 0.01 * traits.pulseSpeedFactor) * 0.2);
        ctx.fillStyle = `${uniqueColor}${alphaHex(opacity * 0.78)}`;
        ctx.shadowColor = uniqueColor;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2);
        ctx.fill();

        // TWINPRESENCE-005: orbiting facets — this Twin's own
        // "constellation" (count/radius/spin from its unique traits),
        // fading in once the core has mostly formed, matching the ongoing
        // World presence's OrbitFacets.
        if (formProgress > 0.5) {
          const facetOpacity = Math.min(1, (formProgress - 0.5) * 2) * opacity;
          const facetRadius = radius * (0.55 + traits.facetRadiusRatio * 0.4) + 14;
          const spinDeg = (timestamp * 0.02 * traits.orbitDirection * traits.pulseSpeedFactor) % 360;
          ctx.fillStyle = `${uniqueColor}${alphaHex(facetOpacity * 0.8)}`;
          ctx.shadowBlur = 8;
          for (let i = 0; i < traits.facetCount; i++) {
            const angle = ((360 / traits.facetCount) * i + traits.rotationOffsetDeg + spinDeg) * (Math.PI / 180);
            const fx = centerX + Math.cos(angle) * facetRadius;
            const fy = centerY + Math.sin(angle) * facetRadius;
            ctx.beginPath();
            ctx.arc(fx, fy, 2.2 * traits.facetSizeRatio, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();
      }

      if (elapsed < totalDuration) {
        animationId = requestAnimationFrame(animate);
      } else {
        // Animation complete
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onComplete();
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [onComplete, color, shape, seedKey]);

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
