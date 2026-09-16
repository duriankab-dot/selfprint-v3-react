/**
 * SocialConnectionEngine.ts — SICE #14
 * Tracks social relationship patterns and connections
 */

import { SICEBase } from '../SICEBase';
import type { SICEInput, SICEOutput, SocialConnectionResult } from '../../../types/sice';
import { supabase } from '../../supabase-service';

export class SocialConnectionEngine extends SICEBase {
  constructor() {
    super(14, 'SocialConnectionEngine', 'Tracks social relationship patterns and connections');
  }

  async process(input: SICEInput): Promise<SICEOutput> {
    const startTime = performance.now();

    try {
      const result = await this.analyzeSocialConnections(input);
      const executionTime = performance.now() - startTime;

      return {
        engineId: this.id,
        engineName: this.name,
        result,
        confidence: 70,
        executionTime,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        engineId: this.id,
        engineName: this.name,
        result: null,
        confidence: 0,
        executionTime: performance.now() - startTime,
        error: errorMsg,
      };
    }
  }

  private getEmptySocialResult(): SocialConnectionResult {
    return {
      totalRelationships: 0,
      strongestConnections: [],
      connectionGaps: ['No social data available yet'],
      socialHealthScore: 50,
      recommendations: ['Share more about your relationships'],
    };
  }

  private async analyzeSocialConnections(input: SICEInput): Promise<SocialConnectionResult> {
    if (!supabase) return this.getEmptySocialResult();

    // Resolve the user's Twin first — twin_memories is keyed by twin_id, not user_id
    const { data: twin } = await supabase
      .from('twins')
      .select('id')
      .eq('user_id', input.userId)
      .maybeSingle();

    if (!twin) return this.getEmptySocialResult();

    // Analyze conversations for social topics
    const { data: messages } = await supabase
      .from('twin_memories')
      .select('content, created_at')
      .eq('twin_id', twin.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!messages || messages.length === 0) {
      return this.getEmptySocialResult();
    }

    // Analyze social keywords
    const familyKeywords = ['mom', 'dad', 'family', 'parent', 'sibling'];
    const friendKeywords = ['friend', 'buddy', 'pal', 'best friend'];
    const workKeywords = ['work', 'colleague', 'boss', 'team', 'office'];
    const romanticKeywords = ['partner', 'boyfriend', 'girlfriend', 'spouse', 'relationship'];

    let familyCount = 0;
    let friendCount = 0;
    let workCount = 0;
    let romanticCount = 0;

    for (const msg of messages) {
      const content = (msg.content as string).toLowerCase();
      familyKeywords.forEach((kw) => { if (content.includes(kw)) familyCount++; });
      friendKeywords.forEach((kw) => { if (content.includes(kw)) friendCount++; });
      workKeywords.forEach((kw) => { if (content.includes(kw)) workCount++; });
      romanticKeywords.forEach((kw) => { if (content.includes(kw)) romanticCount++; });
    }

    const relationships = [
      { name: 'Family', count: familyCount },
      { name: 'Friends', count: friendCount },
      { name: 'Work', count: workCount },
      { name: 'Romantic', count: romanticCount },
    ].filter(r => r.count > 0);

    const strongestConnections = relationships
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(r => r.name);

    const connectionGaps = relationships.length < 3 
      ? ['Try to discuss more diverse relationships'] 
      : [];

    const socialHealthScore = Math.min(90, 40 + relationships.length * 15);

    return {
      totalRelationships: relationships.length,
      strongestConnections,
      connectionGaps,
      socialHealthScore,
      recommendations: relationships.length < 2 
        ? ['Explore new social connections', 'Join community activities']
        : ['Maintain current relationships', 'Deepen existing connections'],
    };
  }
}
