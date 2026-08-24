import React, { useEffect, useRef } from 'react';

interface CelebrationSequenceProps {
  duration?: number;
  particleCount?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

/**
 * CelebrationSequence Animation
 *
 * 5-second celebratory confetti burst effect
 *
 * Animated sequence:
 * 1. Confetti-like particles burst upward from center
 * 2. Gravity and wind physics applied
 * 3. Particles fade with opacity curve
 * 4. Screen shake effect (CSS transform)
 * 5. Color flashes and text glow animation
 * 6. Accessibility: no rapid flashing, safe opacity ranges
 *
 * Performance target: 60fps, smooth feel, no seizure-inducing effects
 */
export const CelebrationSequence: React.FC<CelebrationSequenceProps> = ({
  duration = 5000,
  particleCount = 80,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Color palette for confetti
    const colors = ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF', '#06FFA5'];

    // Initialize particles
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.random() - 0.5) * Math.PI * 1.5; // Burst upward
      const speed = 3 + Math.random() * 4; // 3-7 units/frame

      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: Math.sin(angle) * speed,
        vy: -Math.cos(angle) * speed,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 12,
      });
    }
    particlesRef.current = particles;

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Physics constants
    const gravity = 0.15;
    const wind = 0.02;
    const friction = 0.99;

    // Animation loop
    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1); // 0 to 1

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Apply physics
        p.vy += gravity;
        p.vx += wind;
        p.vx *= friction;
        p.vy *= friction;

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Fade out
        p.life = Math.max(0, 1 - progress);

        // Remove if off-screen or dead
        if (p.y > canvas.height + 50 || p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Draw particle
        ctx.save();
        ctx.globalAlpha = p.life * 0.8; // Max 80% opacity (accessibility)
        ctx.fillStyle = p.color;

        // Slight rotation effect for visual interest
        ctx.translate(p.x, p.y);
        ctx.rotate((currentTime / 1000) * 2);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);

        ctx.restore();
      }

      // Screen shake effect
      const shakeIntensity = Math.sin(progress * Math.PI * 8) * (1 - progress) * 3;
      if (container) {
        container.style.transform = `translate(${shakeIntensity}px, 0)`;
      }

      // Color flash overlay (gentle, not rapid)
      if (progress > 0.2 && progress < 0.8) {
        const flashIntensity = Math.sin(progress * Math.PI * 3) * 0.15; // Max 15% (safe)
        ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Final cleanup
        if (container) {
          container.style.transform = 'translate(0, 0)';
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (container) {
        container.style.transform = 'translate(0, 0)';
      }
    };
  }, [duration, particleCount]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
        transition: 'transform 0.05s ease-out',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
      {/* Text glow animation */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#ffffff',
          textAlign: 'center',
          textShadow: `0 0 20px rgba(255, 106, 183, 0.8),
                       0 0 40px rgba(251, 86, 7, 0.6)`,
          animation: 'celebration-glow 2s ease-in-out infinite',
          zIndex: 11,
        }}
      >
        Twin Awakened! ✨
      </div>
      <style>{`
        @keyframes celebration-glow {
          0%, 100% {
            opacity: 0.7;
            text-shadow: 0 0 20px rgba(255, 106, 183, 0.8),
                         0 0 40px rgba(251, 86, 7, 0.6);
          }
          50% {
            opacity: 1;
            text-shadow: 0 0 30px rgba(255, 106, 183, 1),
                         0 0 60px rgba(251, 86, 7, 0.8),
                         0 0 90px rgba(56, 134, 252, 0.6);
          }
        }
      `}</style>
    </div>
  );
};
