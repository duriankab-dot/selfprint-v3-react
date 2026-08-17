/**
 * HologramBirth.tsx
 * Twin hologram birth animation
 *
 * VISUAL: Particles forming shape → light pulsing → Twin emerges
 * AUDIO: Ambient sound building → sacred tone
 * TIMING: 3-4 seconds of pure WOW
 */

import React, { useEffect, useRef } from 'react';

interface HologramBirthProps {
  onComplete: () => void;
  color?: string;
}

export const HologramBirth: React.FC<HologramBirthProps> = ({
  onComplete,
  color = '#3b82f6'
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

    const animate = (timestamp: number) => {
      const elapsed = Math.min(timestamp, totalDuration);
      animationProgress = elapsed / totalDuration;

      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw particles moving toward center
      ctx.fillStyle = `${color}80`;
      ctx.shadowColor = color;
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

      // Draw emerging hologram shape (circle)
      if (animationProgress > 0.3) {
        const formProgress = (animationProgress - 0.3) / 0.7;
        const radius = maxRadius * formProgress;
        const opacity = Math.min(1, formProgress * 2);

        // Outer glow
        ctx.strokeStyle = `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 3;
        ctx.shadowColor = color;
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glow
        ctx.strokeStyle = `${color}${Math.round(opacity * 150).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();

        // Pulsing core
        const coreSize = radius * 0.3 * (0.8 + Math.sin(timestamp * 0.01) * 0.2);
        ctx.fillStyle = `${color}${Math.round(opacity * 200).toString(16).padStart(2, '0')}`;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2);
        ctx.fill();
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
  }, [onComplete, color]);

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
