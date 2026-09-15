/**
 * WellnessEngine.ts — SICE #16
 * Tracks overall wellness across multiple dimensions
 */

import { SICEBase } from '../SICEBase';
import type { SICEInput, SICEOutput, WellnessResult } from '../../../types/sice';
import { supabase } from '../../supabase-service';

export class WellnessEngine extends SICEBase {
  id: number = 16;
  name: string = 'WellnessEngine';
  description: string = 'Tracks overall wellness across multiple dimensions';

  async process(input: SICEInput): Promise<SICEOutput> {
    const startTime = performance.now();

    try {
      const result = await this.analyzeWellness(input);
      const executionTime = performance.now() - startTime;

      return {
        engineId: this.id,
        engineName: this.name,
        result,
        confidence: 68,
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

  private async analyzeWellness(input: SICEInput): Promise<WellnessResult> {
    // Analyze conversations for wellness indicators
    const { data: messages } = await supabase
      .from('twin_memories')
      .select('content, created_at')
      .eq('twin_id', '')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!messages || messages.length === 0) {
      return {
        overallWellness: 50,
        dimensions: [],
        immediateActions: ['Start tracking your wellness journey'],
        longTermRecommendations: ['Regular self-reflection', 'Balanced lifestyle'],
      };
    }

    // Analyze wellness dimensions
    const physicalKeywords = ['exercise', 'sleep', 'eat', 'food', 'energy', 'tired', 'fitness'];
    const mentalKeywords = ['stress', 'focus', 'mind', 'think', 'learn', 'concentrate'];
    const emotionalKeywords = ['happy', 'sad', 'anxious', 'calm', 'mood', 'feel'];
    const socialKeywords = ['friends', 'family', 'alone', 'social', 'connect'];
    const spiritualKeywords = ['meditat', 'grateful', 'purpose', 'meaning', 'peace'];

    let physicalScore = 0;
    let mentalScore = 0;
    let emotionalScore = 0;
    let socialScore = 0;
    let spiritualScore = 0;
    let messageCount = 0;

    for (const msg of messages) {
      const content = (msg.content as string).toLowerCase();
      messageCount++;

      const physCount = physicalKeywords.filter(kw => content.includes(kw)).length;
      const mentCount = mentalKeywords.filter(kw => content.includes(kw)).length;
      const emoCount = emotionalKeywords.filter(kw => content.includes(kw)).length;
      const socCount = socialKeywords.filter(kw => content.includes(kw)).length;
      const spirCount = spiritualKeywords.filter(kw => content.includes(kw)).length;

      physicalScore += Math.min(physCount, 3);
      mentalScore += Math.min(mentCount, 3);
      emotionalScore += Math.min(emoCount, 3);
      socialScore += Math.min(socCount, 3);
      spiritualScore += Math.min(spirCount, 3);
    }

    const avgPhysical = messageCount > 0 ? Math.min(100, (physicalScore / messageCount) * 100 + 40) : 50;
    const avgMental = messageCount > 0 ? Math.min(100, (mentalScore / messageCount) * 100 + 40) : 50;
    const avgEmotional = messageCount > 0 ? Math.min(100, (emotionalScore / messageCount) * 100 + 40) : 50;
    const avgSocial = messageCount > 0 ? Math.min(100, (socialScore / messageCount) * 100 + 40) : 50;
    const avgSpiritual = messageCount > 0 ? Math.min(100, (spiritualScore / messageCount) * 100 + 40) : 50;

    const overallWellness = Math.round((avgPhysical + avgMental + avgEmotional + avgSocial + avgSpiritual) / 5);

    const dimensions = [
      { name: 'Physical', score: Math.round(avgPhysical), trend: 'stable' as const, contributingFactors: ['Activity level', 'Sleep patterns'] },
      { name: 'Mental', score: Math.round(avgMental), trend: 'stable' as const, contributingFactors: ['Focus ability', 'Learning engagement'] },
      { name: 'Emotional', score: Math.round(avgEmotional), trend: 'stable' as const, contributingFactors: ['Mood stability', 'Emotional awareness'] },
      { name: 'Social', score: Math.round(avgSocial), trend: 'stable' as const, contributingFactors: ['Connection quality', 'Social engagement'] },
      { name: 'Spiritual', score: Math.round(avgSpiritual), trend: 'stable' as const, contributingFactors: ['Purpose clarity', 'Inner peace'] },
    ];

    const immediateActions = overallWellness < 60
      ? ['Prioritize sleep and nutrition', 'Take a break for reflection']
      : ['Maintain current habits', 'Set wellness goals'];

    const longTermRecommendations = [
      'Practice daily mindfulness',
      'Maintain work-life balance',
      'Cultivate meaningful relationships',
    ];

    return {
      overallWellness,
      dimensions,
      immediateActions,
      longTermRecommendations,
    };
  }
}
