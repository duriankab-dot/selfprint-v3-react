/**
 * TwinHologramBirth.tsx
 * Canvas-based hologram birth animation (12 seconds, 60fps target)
 * Particle cloud → silhouette → glow → name → pulse stabilization
 */

import { useEffect, useRef } from 'react';

interface TwinHologramBirthProps {
  twinName: string;
  onComplete: () => void;
  autoPlay?: boolean;
}

export function TwinHologramBirth({
  twinName,
  onComplete,
  autoPlay = true,
}: TwinHologramBirthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const stateRef = useRef({
    startTime: 0,
    currentPhase: 0,
  });

  useEffect(() => {
    if (!autoPlay) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 600;

    const state = stateRef.current;
    state.startTime = Date.now();

    const particleSystem = {
      particles: [] as Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        life: number;
        size: number;
      }>,
      sihouettePoints: [] as Array<{ x: number; y: number; alpha: number }>,
    };

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Initialize silhouette points (humanoid form outline)
    const initSilhouette = () => {
      const points: typeof particleSystem.sihouettePoints = [];
      // Head circle
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        points.push({
          x: centerX + Math.cos(angle) * 30,
          y: centerY - 100 + Math.sin(angle) * 30,
          alpha: 0,
        });
      }
      // Upper body
      for (let i = 0; i < 10; i++) {
        points.push({
          x: centerX - 35 + (i / 10) * 70,
          y: centerY - 40,
          alpha: 0,
        });
      }
      // Lower body
      for (let i = 0; i < 10; i++) {
        points.push({
          x: centerX - 30 + (i / 10) * 60,
          y: centerY + 40,
          alpha: 0,
        });
      }
      particleSystem.sihouettePoints = points;
    };

    initSilhouette();

    const animate = () => {
      const elapsed = Date.now() - state.startTime;
      const totalDuration = 12000; // 12 seconds
      const progress = Math.min(elapsed / totalDuration, 1);

      // Clear canvas
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)'; // Deep blue tint
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Phase 1: Particle cloud (0-3 sec, 0-0.25 progress)
      if (progress < 0.25) {
        drawParticleCloud(ctx, progress / 0.25, centerX, centerY);
      }

      // Phase 2: Silhouette emerges (3-6 sec, 0.25-0.5 progress)
      if (progress >= 0.25 && progress < 0.5) {
        const phaseProgress = (progress - 0.25) / 0.25;
        drawParticleCloud(ctx, 1 - phaseProgress * 0.5, centerX, centerY);
        drawSilhouette(
          ctx,
          particleSystem.sihouettePoints,
          phaseProgress,
          centerX,
          centerY
        );
      }

      // Phase 3: Glow intensifies (6-8 sec, 0.5-0.67 progress)
      if (progress >= 0.5 && progress < 0.67) {
        const phaseProgress = (progress - 0.5) / 0.17;
        drawSilhouette(
          ctx,
          particleSystem.sihouettePoints,
          1,
          centerX,
          centerY
        );
        drawGlow(ctx, phaseProgress, centerX, centerY);
      }

      // Phase 4: Name appears (8-10 sec, 0.67-0.83 progress)
      if (progress >= 0.67 && progress < 0.83) {
        const phaseProgress = (progress - 0.67) / 0.16;
        drawSilhouette(
          ctx,
          particleSystem.sihouettePoints,
          1,
          centerX,
          centerY
        );
        drawGlow(ctx, 1, centerX, centerY);
        drawName(ctx, twinName, phaseProgress, centerX, centerY);
      }

      // Phase 5: Pulse stabilization (10-12 sec, 0.83-1 progress)
      if (progress >= 0.83) {
        const phaseProgress = (progress - 0.83) / 0.17;
        const pulseScale = 1 + Math.sin(phaseProgress * Math.PI) * 0.05;
        drawSilhouette(
          ctx,
          particleSystem.sihouettePoints,
          1,
          centerX,
          centerY,
          pulseScale
        );
        drawGlow(ctx, 1 + phaseProgress * 0.2, centerX, centerY, pulseScale);
        drawName(ctx, twinName, 1, centerX, centerY);
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [twinName, onComplete, autoPlay]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full max-w-lg border-2 border-indigo-500 rounded-lg"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
      />
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400">Your Twin is being born...</p>
      </div>
    </div>
  );
}

// Helper functions for drawing phases

function drawParticleCloud(
  ctx: CanvasRenderingContext2D,
  alpha: number,
  centerX: number,
  centerY: number
) {
  const particleCount = 60;
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 150;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;

    const particleAlpha = alpha * (1 - Math.random() * 0.3);
    ctx.fillStyle = `rgba(99, 102, 241, ${particleAlpha})`;
    ctx.beginPath();
    ctx.arc(x, y, 2 + Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSilhouette(
  ctx: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number; alpha: number }>,
  alpha: number,
  centerX: number,
  centerY: number,
  scale = 1
) {
  ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
  ctx.lineWidth = 2;
  ctx.fillStyle = `rgba(99, 102, 241, ${alpha * 0.2})`;

  ctx.beginPath();
  points.forEach((point, idx) => {
    const scaledX = centerX + (point.x - centerX) * scale;
    const scaledY = centerY + (point.y - centerY) * scale;
    if (idx === 0) ctx.moveTo(scaledX, scaledY);
    else ctx.lineTo(scaledX, scaledY);
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawGlow(
  ctx: CanvasRenderingContext2D,
  intensity: number,
  centerX: number,
  centerY: number,
  scale = 1
) {
  const glowRadius = 100 * scale;
  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    glowRadius * 0.5,
    centerX,
    centerY,
    glowRadius
  );
  gradient.addColorStop(0, `rgba(99, 102, 241, ${intensity * 0.4})`);
  gradient.addColorStop(0.5, `rgba(99, 102, 241, ${intensity * 0.1})`);
  gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
  ctx.fill();
}

function drawName(
  ctx: CanvasRenderingContext2D,
  name: string,
  alpha: number,
  centerX: number,
  centerY: number
) {
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, centerX, centerY + 150);

  // Glow effect on text
  ctx.strokeStyle = `rgba(99, 102, 241, ${alpha * 0.5})`;
  ctx.lineWidth = 2;
  ctx.strokeText(name, centerX, centerY + 150);
}
