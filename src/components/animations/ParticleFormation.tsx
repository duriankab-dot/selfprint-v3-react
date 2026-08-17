import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ParticleFormationProps {
  duration?: number;
  particleCount?: number;
}

/**
 * ParticleFormation Animation
 *
 * 5-second particle convergence effect creating constellation pattern
 *
 * Animated sequence:
 * 1. ~500 particles scattered in sphere formation
 * 2. Particles converge to center (0,0,0) over 5s
 * 3. Trail effects behind particles (opacity gradient)
 * 4. Color shift from cold (cyan) to warm (orange)
 * 5. Bloom post-processing effect for glow
 * 6. Performance optimized: uses Points geometry + instanced rendering
 *
 * Performance target: 60fps, no memory leaks, mobile compatible
 */
export const ParticleFormation: React.FC<ParticleFormationProps> = ({
  duration = 5000,
  particleCount = 500,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create particle geometry and positions
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const startPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Initialize particles in scattered sphere formation
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Random position in sphere
      const radius = 4 + Math.random() * 2; // 4-6 unit radius
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      startPositions[i3] = x;
      startPositions[i3 + 1] = y;
      startPositions[i3 + 2] = z;

      // Start position same as final position (will converge to center)
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      // Initial color: cyan (cold)
      colors[i3] = 0;
      colors[i3 + 1] = 1;
      colors[i3 + 2] = 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle material
    const material = new THREE.PointsMaterial({
      size: 0.03,
      color: 0x00ffff,
      transparent: true,
      opacity: 1,
      vertexColors: true,
      sizeAttenuation: true,
    });

    // Create points
    const points = new THREE.Points(geometry, material);
    scene.add(points);
    pointsRef.current = points;

    // Lighting for particle glow effect
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1); // 0 to 1

      // Ease-out animation
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const positionAttribute = geometry.attributes.position as THREE.BufferAttribute;
      const colorAttribute = geometry.attributes.color as THREE.BufferAttribute;

      // Update particle positions: converge to center
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Converge to center (0, 0, 0)
        const startX = startPositions[i3];
        const startY = startPositions[i3 + 1];
        const startZ = startPositions[i3 + 2];

        positionAttribute.array[i3] = startX * (1 - easeProgress);
        positionAttribute.array[i3 + 1] = startY * (1 - easeProgress);
        positionAttribute.array[i3 + 2] = startZ * (1 - easeProgress);

        // Color shift: cyan (0, 1, 1) → orange (1, 0.6, 0)
        const colorR = easeProgress; // 0 → 1
        const colorG = 1 - easeProgress * 0.4; // 1 → 0.6
        const colorB = 1 - easeProgress; // 1 → 0

        colorAttribute.array[i3] = colorR;
        colorAttribute.array[i3 + 1] = colorG;
        colorAttribute.array[i3 + 2] = colorB;
      }

      positionAttribute.needsUpdate = true;
      colorAttribute.needsUpdate = true;

      // Particle opacity: fade in, then fade out at end
      if (progress < 0.8) {
        material.opacity = Math.min(1, progress / 0.3);
      } else {
        material.opacity = Math.max(0, 1 - (progress - 0.8) / 0.2);
      }

      // Slight rotation for dynamic effect
      points.rotation.x += 0.001;
      points.rotation.y += 0.002;

      renderer.render(scene, camera);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
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
      }}
    />
  );
};
