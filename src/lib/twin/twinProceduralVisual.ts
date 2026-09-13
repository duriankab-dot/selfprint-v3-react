/**
 * twinProceduralVisual.ts
 *
 * Generates an asymmetric, unique visual shape for each Twin based on
 * user traits (seeded deterministic procedural generation).
 * 
 * Each user gets a unique shape — no two twins look identical.
 * Color derived from mood/archetype. Shape derived from birth data + SICE scores.
 * 
 * Rendered as canvas 2D for performance.
 */

export interface ProceduralVisualConfig {
  /** Seeded from user traits for deterministic output */
  seed: string;
  /** Primary color from mood/archetype */
  primaryColor: string;
  /** Secondary accent color */
  accentColor?: string;
  /** Complexity: 1 = simple blob, 5 = complex organic form */
  complexity?: number;
}

interface Vertex {
  x: number;
  y: number;
}

/**
 * Generate a seeded random number (deterministic for same seed)
 */
function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return function() {
    hash = (hash * 1664525 + 1013904223) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

/**
 * Generate asymmetric vertices for a procedural shape
 */
function generateVertices(config: ProceduralVisualConfig): Vertex[] {
  const rand = seededRandom(config.seed);
  const numPoints = 8 + Math.floor(rand() * 8); // 8-15 points
  const baseRadius = 80 + rand() * 40;
  const vertices: Vertex[] = [];
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    // Asymmetric radius variation
    const radiusVariation = 0.6 + rand() * 0.8;
    const x = Math.cos(angle) * baseRadius * radiusVariation;
    const y = Math.sin(angle) * baseRadius * radiusVariation * (0.7 + rand() * 0.6);
    vertices.push({ x, y });
  }
  
  return vertices;
}

/**
 * Draw procedural shape on canvas
 */
export function drawProceduralVisual(
  canvas: HTMLCanvasElement,
  config: ProceduralVisualConfig
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Generate shape vertices
  const vertices = generateVertices(config);
  
  // Create gradient fill
  const gradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, 120
  );
  gradient.addColorStop(0, config.primaryColor);
  gradient.addColorStop(0.7, config.primaryColor + '80');
  gradient.addColorStop(1, config.primaryColor + '20');
  
  // Draw main shape with smooth curves
  ctx.beginPath();
  ctx.moveTo(centerX + vertices[0].x, centerY + vertices[0].y);
  
  for (let i = 0; i < vertices.length; i++) {
    const current = vertices[i];
    const next = vertices[(i + 1) % vertices.length];
    
    const midX = (centerX + current.x + centerX + next.x) / 2;
    const midY = (centerY + current.y + centerY + next.y) / 2;
    
    ctx.quadraticCurveTo(
      centerX + current.x,
      centerY + current.y,
      midX,
      midY
    );
  }
  
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Add subtle glow effect
  ctx.shadowColor = config.primaryColor;
  ctx.shadowBlur = 20;
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Add accent elements if available
  if (config.accentColor && config.complexity && config.complexity > 2) {
    const rand = seededRandom(config.seed + '-accent');
    const numAccents = Math.floor(rand() * 3) + 1;
    
    for (let i = 0; i < numAccents; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = 40 + rand() * 60;
      const accentX = centerX + Math.cos(angle) * dist;
      const accentY = centerY + Math.sin(angle) * dist;
      const accentSize = 3 + rand() * 5;
      
      ctx.beginPath();
      ctx.arc(accentX, accentY, accentSize, 0, Math.PI * 2);
      ctx.fillStyle = config.accentColor + '60';
      ctx.fill();
    }
  }
}

/**
 * Generate procedural config from user traits
 */
export function createProceduralConfigFromTraits(
  birthDate: string,
  mood: string,
  archetype: string,
  siceScores?: { science: number; intuition: number; creative: number; experience: number }
): ProceduralVisualConfig {
  // Create deterministic seed from traits
  const seed = [birthDate, mood, archetype]
    .filter(Boolean)
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');
  
  // Derive primary color from mood
  const moodColors: Record<string, string> = {
    calm: '#6366F1',
    happy: '#F59E0B',
    curious: '#10B981',
    thoughtful: '#8B5CF6',
    excited: '#EF4444',
    ready: '#3B82F6',
  };
  
  const primaryColor = moodColors[mood?.toLowerCase()] || '#6366F1';
  
  // Derive accent from archetype
  const archetypeAccents: Record<string, string> = {
    sage: '#10B981',
    warrior: '#EF4444',
    healer: '#F59E0B',
    creator: '#8B5CF6',
    explorer: '#3B82F6',
  };
  
  const accentColor = archetypeAccents[archetype?.toLowerCase()] || undefined;
  
  // Complexity from SICE scores average
  let complexity = 3;
  if (siceScores) {
    const avg = (siceScores.science + siceScores.intuition + siceScores.creative + siceScores.experience) / 4;
    complexity = Math.max(1, Math.min(5, Math.round(avg / 20)));
  }
  
  return {
    seed,
    primaryColor,
    accentColor,
    complexity,
  };
}
