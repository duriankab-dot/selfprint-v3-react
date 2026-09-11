/**
 * TwinThreeRenderer.tsx — Three.js Living Body for Canonical Twin
 *
 * Master Concept layering:
 *   Three.js = Living Body / Physical Embodiment (this file)
 *   SVG      = Intelligence Language / Signals (TwinPresence)
 *   CSS      = UI / Layout / Surface
 *
 * Creates a procedural 3D mesh from Visual DNA:
 *   - coreShape → geometry type (sphere/crystal/ring/diamond/bloom/wave)
 *   - coreColor / auraColor → material colors
 *   - motionSpeed → breathing animation speed
 *   - per-user deterministic traits (hueShiftDeg, facetCount, shapeJitterSeed)
 *
 * Graceful degradation:
 *   - Falls back to MEDIUM (SVG) if WebGL unavailable
 *   - Respects prefers-reduced-motion (static pose)
 *   - Dispose on unmount
 */

import { useEffect, useRef, useMemo } from 'react';
// @ts-expect-error three module has no bundled declarations
import * as THREE from 'three';
import type { Archetype } from '@/context/TwinContext';
import { getTwinVisualDNA } from '@/lib/twin/twinVisualDNA';
import { getUniqueTwinTraits } from '@/lib/twin/twinUniqueness';
import { useTwinIdentity } from '@/hooks/useTwinIdentity';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ThreeRendererProps {
  primaryArchetype?: Archetype;
  secondaryArchetype?: Archetype;
  worldColor: string;
  seedKey?: string;
  maturityScore?: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function hexToThreeColor(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

function createGeometryFromShape(
  shape: string,
  jitterSeed: number,
  size: number
): THREE.BufferGeometry {
  const rand = (i: number) => {
    const x = Math.sin(i * 127.1 + jitterSeed * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };

  switch (shape) {
    case 'crystal': {
      const geo = new THREE.OctahedronGeometry(size, 0);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        const noise = 1 + (rand(i) - 0.5) * 0.15;
        pos.setXYZ(i, x * noise, y * noise * 1.2, z * noise);
      }
      geo.computeVertexNormals();
      return geo;
    }
    case 'diamond': {
      const geo = new THREE.DodecahedronGeometry(size, 0);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        const stretch = 1 + (rand(i + 100) - 0.5) * 0.2;
        pos.setXYZ(i, x * stretch, y * stretch * 1.3, z * stretch);
      }
      geo.computeVertexNormals();
      return geo;
    }
    case 'ring': {
      return new THREE.TorusGeometry(size * 0.9, size * 0.25, 16, 32);
    }
    case 'bloom': {
      const geo = new THREE.IcosahedronGeometry(size, 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        const dist = Math.sqrt(x * x + y * y + z * z);
        const noise = 1 + Math.sin(dist * 5 + jitterSeed) * 0.12;
        pos.setXYZ(i, x * noise, y * noise, z * noise);
      }
      geo.computeVertexNormals();
      return geo;
    }
    case 'wave': {
      const geo = new THREE.SphereGeometry(size, 32, 32);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        const wave = Math.sin(y * 3 + jitterSeed * 2) * 0.08 * size;
        pos.setXYZ(i, x + wave * 0.3, y + wave * 0.5, z + wave);
      }
      geo.computeVertexNormals();
      return geo;
    }
    default: // sphere
      return new THREE.SphereGeometry(size, 32, 32);
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export function TwinThreeRenderer({
  primaryArchetype,
  secondaryArchetype,
  worldColor,
  seedKey,
  maturityScore,
}: ThreeRendererProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const glowRef = useRef<THREE.Mesh | null>(null);

  const dna = useMemo(
    () => getTwinVisualDNA(primaryArchetype, secondaryArchetype),
    [primaryArchetype, secondaryArchetype]
  );

  const identity = useTwinIdentity({
    primaryArchetype,
    secondaryArchetype,
    seedKey,
    maturityScore,
  });

  const traits = useMemo(
    () => getUniqueTwinTraits(seedKey ?? primaryArchetype ?? 'default-twin'),
    [seedKey, primaryArchetype]
  );

  const isReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // ─── Init Three.js Scene ──────────────────────────────────────────────

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) throw new Error('WebGL not supported');
    } catch {
      return; // Fallback handled by parent
    }

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 4;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(400, 400);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(2, 3, 4);
    scene.add(directionalLight);

    const rimLight = new THREE.DirectionalLight(
      hexToThreeColor(worldColor).getHex(),
      0.3
    );
    rimLight.position.set(-3, 1, -2);
    scene.add(rimLight);

    // Core mesh
    const geometry = createGeometryFromShape(
      dna.coreShape,
      traits.shapeJitterSeed,
      0.8
    );

    const material = new THREE.MeshPhysicalMaterial({
      color: hexToThreeColor(identity.uniqueCoreColor),
      metalness: 0.1,
      roughness: 0.3,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
      transparent: true,
      opacity: 0.9,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Glow shell
    const glowGeo = new THREE.SphereGeometry(1.1, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: hexToThreeColor(identity.uniqueAuraColor),
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glow);
    glowRef.current = glow;

    // ─── Animation Loop ───────────────────────────────────────────────

    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      const speed = identity.glowMult * dna.motionSpeed;

      if (meshRef.current) {
        if (isReducedMotion) {
          meshRef.current.rotation.y = 0;
          meshRef.current.scale.setScalar(1);
        } else {
          meshRef.current.rotation.y = elapsed * 0.3 * speed;
          const breathe = 1 + Math.sin(elapsed * 1.2 * speed) * 0.03;
          meshRef.current.scale.setScalar(breathe);
        }
      }

      if (glowRef.current) {
        if (isReducedMotion) {
          glowRef.current.scale.setScalar(1);
        } else {
          const glowPulse = 1 + Math.sin(elapsed * 0.8 * speed) * 0.08;
          glowRef.current.scale.setScalar(glowPulse);
          glowRef.current.material.opacity = 0.12 + Math.sin(elapsed * speed) * 0.05;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // ─── Resize Handler ───────────────────────────────────────────────

    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;
      const container = mountRef.current;
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);

      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (rendererRef.current.domElement.parentNode === mount) {
          mount.removeChild(rendererRef.current.domElement);
        }
      }

      geometry?.dispose();
      material.dispose();
      glowGeo?.dispose();
      glowMat.dispose();

      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      meshRef.current = null;
      glowRef.current = null;
    };
  }, [dna.coreShape, dna.motionSpeed, identity.uniqueCoreColor, identity.uniqueAuraColor, identity.glowMult, traits.shapeJitterSeed, worldColor, isReducedMotion]);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
