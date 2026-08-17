import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HolographicBirthProps {
  duration?: number;
}

/**
 * HolographicBirth Animation
 *
 * 10-second 3D crystallization effect using Three.js
 *
 * Animated sequence:
 * 1. Icosahedron mesh initializes (transparent)
 * 2. Wireframe effect with glow material
 * 3. Vertex positions crystallize inward over 10s
 * 4. Iridescent gradient animation (purple→pink→blue)
 * 5. Point lights with color trails
 * 6. Smooth convergence creating "birth" effect
 *
 * Performance target: 60fps on desktop, WebGL mobile compatible
 */
export const HolographicBirth: React.FC<HolographicBirthProps> = ({ duration = 10000 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
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
    camera.position.z = 2.5;

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

    // Geometry: Icosahedron (crystalline shape)
    const geometry = new THREE.IcosahedronGeometry(1, 4);

    // Store original positions for animation
    const originalPositions = new Float32Array(geometry.attributes.position.array);
    const targetPositions = new Float32Array(originalPositions);

    // Crystallize inward: scale positions toward center
    for (let i = 0; i < targetPositions.length; i += 3) {
      const x = targetPositions[i];
      const y = targetPositions[i + 1];
      const z = targetPositions[i + 2];
      const distance = Math.sqrt(x * x + y * y + z * z);
      if (distance > 0) {
        const scaleFactor = 0.3; // Crystallize inward to 30% size
        targetPositions[i] = (x / distance) * scaleFactor;
        targetPositions[i + 1] = (y / distance) * scaleFactor;
        targetPositions[i + 2] = (z / distance) * scaleFactor;
      }
    }

    // Wireframe material with glow effect
    const material = new THREE.MeshPhongMaterial({
      color: 0xff1493, // Initial color
      wireframe: false,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5,
      shininess: 100,
      transparent: true,
      opacity: 0.85,
    });

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Add wireframe overlay for crystalline effect
    const wireframeGeometry = geometry.clone();
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6,
    });
    const wireframeLines = new THREE.LineSegments(
      new THREE.EdgesGeometry(wireframeGeometry),
      wireframeMaterial
    );
    mesh.add(wireframeLines);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add point lights with color animation
    const lightPositions: Array<{ pos: [number, number, number]; color: number }> = [
      { pos: [1, 1, 1], color: 0xff00ff }, // Magenta
      { pos: [-1, 1, 1], color: 0x00ffff }, // Cyan
      { pos: [0, -1, 1], color: 0xffff00 }, // Yellow
    ];

    const pointLights = lightPositions.map(({ pos, color }) => {
      const light = new THREE.PointLight(color, 1.5);
      light.position.set(pos[0], pos[1], pos[2]);
      scene.add(light);
      return light;
    });

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

      // Animate vertex positions from original to crystallized
      const positionAttribute = geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < positionAttribute.count * 3; i += 3) {
        const originalX = originalPositions[i];
        const originalY = originalPositions[i + 1];
        const originalZ = originalPositions[i + 2];

        const targetX = targetPositions[i];
        const targetY = targetPositions[i + 1];
        const targetZ = targetPositions[i + 2];

        // Ease-out animation
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        positionAttribute.array[i] = originalX + (targetX - originalX) * easeProgress;
        positionAttribute.array[i + 1] = originalY + (targetY - originalY) * easeProgress;
        positionAttribute.array[i + 2] = originalZ + (targetZ - originalZ) * easeProgress;
      }
      positionAttribute.needsUpdate = true;

      // Rotate mesh
      mesh.rotation.x += 0.003;
      mesh.rotation.y += 0.005;
      mesh.rotation.z += 0.002;

      // Animate material color (purple → pink → blue)
      const hue = 0.8 + progress * 0.4; // 0.8 (purple) to 1.2 (wraps to blue)
      const color = new THREE.Color().setHSL((hue % 1), 0.8, 0.5);
      material.color.copy(color);

      // Animate light colors
      pointLights.forEach((light, index) => {
        const lightHue = (hue + (index * 0.3)) % 1;
        const lightColor = new THREE.Color().setHSL(lightHue, 1, 0.5);
        light.color.copy(lightColor);

        // Light intensity pulsing
        light.intensity = 1.5 + Math.sin(progress * Math.PI) * 0.5;
      });

      // Opacity fade-out at end
      material.opacity = Math.max(0.7, 1 - progress * 0.3);

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
      wireframeMaterial.dispose();
      renderer.dispose();
    };
  }, [duration]);

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
