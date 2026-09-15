/**
 * EmotionalIntelligenceEngine.ts — SICE #13
 * Analyzes emotional patterns and trends from user interactions
 */

import { SICEBase } from '../SICEBase';
import type { SICEInput, SICEOutput, EmotionalIntelligenceResult } from '../../../types/sice';
import { supabase } from '../../supabase-service';

export class EmotionalIntelligenceEngine extends SICEBase {
  constructor() {
    super(13, 'EmotionalIntelligenceEngine', 'Analyzes emotional patterns and trends from user interactions');
  }

  async process(_input: SICEInput): Promise<SICEOutput> {
    const startTime = performance.now();

    try {
      const result = await this.analyzeEmotionalPatterns(_input);
      const executionTime = performance.now() - startTime;

      return {
        engineId: this.id,
        engineName: this.name,
        result,
        confidence: 75,
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

  private async analyzeEmotionalPatterns(_input: SICEInput): Promise<EmotionalIntelligenceResult> {
    // Analyze recent conversations for emotional tone
    const { data: messages } = await supabase
      .from('twin_memories')
      .select('content, created_at')
      .eq('twin_id', '') // Would be set with actual twin_id
      .order('created_at', { ascending: false })
      .limit(50);

    if (!messages || messages.length === 0) {
      return {
        emotionalAwareness: 50,
        regulationSkills: [],
        growthOpportunities: ['Continue tracking emotional patterns'],
        recommendedExercises: ['Daily mood journaling', 'Mindfulness practice'],
      };
    }

    // Simple sentiment analysis based on keywords
    const positiveKeywords = ['happy', 'good', 'great', 'excited', 'grateful', 'proud'];
    const negativeKeywords = ['sad', 'bad', 'stressed', 'anxious', 'worried', 'frustrated'];
    
    let positiveCount = 0;
    let negativeCount = 0;

    for (const msg of messages) {
      const content = (msg.content as string).toLowerCase();
      positiveKeywords.forEach((kw) => {
        if (content.includes(kw)) positiveCount++;
      });
      negativeKeywords.forEach((kw) => {
        if (content.includes(kw)) negativeCount++;
      });
    }

    const total = positiveCount + negativeCount || 1;
    const emotionalBalance = (positiveCount / total) * 100;
    const emotionalAwareness = Math.min(90, 50 + (messages.length / 50) * 40);

    return {
      emotionalAwareness: Math.round(emotionalAwareness),
      regulationSkills: emotionalBalance > 60 
        ? ['Positive reframing', 'Gratitude practice']
        : ['Stress management', 'Cognitive restructuring'],
      growthOpportunities: emotionalBalance < 50 
        ? ['Focus on positive experiences', 'Build resilience practices']
        : ['Maintain emotional balance', 'Deepen self-awareness'],
      recommendedExercises: ['Evening reflection', 'Gratitude journal', 'Breathing exercises'],
    };
  }
}
