/**
 * SICEOrchestratorImpl.ts
 * 12 SICE visible implementation + orchestration
 */

export const SICE_ENGINES = [
  { id: 'identity', name: 'Identity SICE', focus: 'Who you are' },
  { id: 'cognitive', name: 'Cognitive SICE', focus: 'How you think' },
  { id: 'emotional', name: 'Emotional SICE', focus: 'How you feel' },
  { id: 'behavioral', name: 'Behavioral SICE', focus: 'What you do' },
  { id: 'social', name: 'Social SICE', focus: 'How you connect' },
  { id: 'career', name: 'Career SICE', focus: 'Your work' },
  { id: 'financial', name: 'Financial SICE', focus: 'Your wealth' },
  { id: 'health', name: 'Health SICE', focus: 'Your wellbeing' },
  { id: 'decision', name: 'Decision SICE', focus: 'Your choices' },
  { id: 'growth', name: 'Growth SICE', focus: 'Your evolution' },
  { id: 'purpose', name: 'Purpose SICE', focus: 'Your meaning' },
  { id: 'future', name: 'Future SICE', focus: 'Your potential' },
];

/**
 * Orchestrate SICE engines based on context
 */
export function orchestrateSICE(context: string): string[] {
  const weights: Record<string, number> = {};

  // Initialize all SICEs
  SICE_ENGINES.forEach(sice => {
    weights[sice.id] = 0;
  });

  // Weight based on context keywords
  const contextLower = context.toLowerCase();

  if (contextLower.includes('work') || contextLower.includes('job')) {
    weights['career'] += 3;
    weights['decision'] += 2;
  }
  if (contextLower.includes('money') || contextLower.includes('finance')) {
    weights['financial'] += 3;
  }
  if (contextLower.includes('relationship') || contextLower.includes('love')) {
    weights['social'] += 3;
    weights['emotional'] += 2;
  }
  if (contextLower.includes('growth') || contextLower.includes('learn')) {
    weights['growth'] += 3;
  }
  if (contextLower.includes('decision') || contextLower.includes('choice')) {
    weights['decision'] += 3;
  }

  // Always activate core engines
  weights['identity'] += 1;
  weights['cognitive'] += 1;
  weights['purpose'] += 1;

  // Sort by weight (descending)
  return SICE_ENGINES
    .map(sice => ({ ...sice, weight: weights[sice.id] }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5) // Top 5 active
    .map(sice => sice.name);
}

/**
 * Get SICE contribution score
 */
export function calculateSICEContribution(
  userInteractions: number,
  successRate: number
): number {
  const baseScore = 30;
  const interactionBonus = Math.min(userInteractions * 5, 40);
  const successBonus = successRate * 30;

  return Math.min(100, baseScore + interactionBonus + successBonus);
}
