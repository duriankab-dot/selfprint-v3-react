/**
 * SICE #7: EnvironmentEngine
 * Analyzes situational context and environmental factors
 * Provides environment-aware insights and recommendations
 */

import { SICEBase } from '../SICEBase';
import { supabase } from '../../supabase-service';
import type { SICEInput, SICEOutput, EnvironmentResult } from '../../../types/sice';

export interface EnvironmentContext {
  timeOfDay: 'early_morning' | 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: 'weekday' | 'weekend';
  currentSeason: 'spring' | 'summer' | 'fall' | 'winter';
  stressLevel?: number; // 0-100
  recommendations: string[];
}

export class EnvironmentEngine extends SICEBase {
  constructor() {
    super(7, 'EnvironmentEngine', 'Analyzes situational and environmental context');
  }

  async process(input: SICEInput): Promise<SICEOutput> {
    const { result, executionTime } = await this.measureExecution(async () => {
      if (!this.validateInput(input)) {
        return this.getDefaultContext();
      }

      try {
        const context = await this.analyzeEnvironment(input.userId);
        return context;
      } catch (err) {
        console.error('Environment analysis error:', err);
        return this.getDefaultContext();
      }
    });

    const confidence = ((result as EnvironmentResult).stressLevel !== undefined ? 65 : 65);
    return this.createResult(result, confidence, executionTime);
  }

  /**
   * Analyze current environmental context with Twin state integration
   */
  private async analyzeEnvironment(userId: string): Promise<any> {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const month = now.getMonth();

    // Determine time of day
    let timeOfDay: 'early_morning' | 'morning' | 'afternoon' | 'evening' | 'night';
    if (hour >= 5 && hour < 9) timeOfDay = 'early_morning';
    else if (hour >= 9 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';

    // Determine day type
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dayType: 'weekday' | 'weekend' = isWeekend ? 'weekend' : 'weekday';

    // Determine season
    let season: 'spring' | 'summer' | 'fall' | 'winter';
    if (month >= 2 && month < 5) season = 'spring';
    else if (month >= 5 && month < 8) season = 'summer';
    else if (month >= 8 && month < 11) season = 'fall';
    else season = 'winter';

    // Get Twin's current state and world context
    const twinContext = await this.getTwinContext(userId);

    // Generate context-aware recommendations
    const recommendations = this.generateRecommendations(
      timeOfDay,
      dayType,
      season,
      twinContext.currentMood,
      twinContext.activeWorld
    );

    const stressLevel = this.estimateStressLevel(timeOfDay, dayType);
    const confidence = Math.min(90, 50 + (twinContext.dataPoints * 2));

    return {
      timeOfDay,
      dayOfWeek: dayType,
      currentSeason: season,
      stressLevel,
      recommendations,
      twinState: twinContext,
      confidence,
    };
  }

  /**
   * Get Twin's current state and active world
   */
  private async getTwinContext(userId: string): Promise<any> {
    try {
      if (!supabase) {
        return { currentMood: 'neutral', activeWorld: 'general', dataPoints: 0 };
      }

      // Fetch Twin's latest memories to infer mood
      // TWINS406-001 FIX: .maybeSingle() — no Twin yet is a normal state.
      const { data: twin } = await supabase
        .from('twins')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!twin) {
        return { currentMood: 'neutral', activeWorld: 'general', dataPoints: 0 };
      }

      // Get latest memory for mood inference
      const { data: memories } = await supabase
        .from('twin_memories')
        .select('content')
        .eq('twin_id', twin.id)
        .order('created_at', { ascending: false })
        .limit(1);

      let mood = 'neutral';
      if (memories && memories[0]) {
        const content = memories[0].content.toLowerCase();
        if (content.includes('excited') || content.includes('energetic')) mood = 'energized';
        else if (content.includes('tired') || content.includes('exhausted')) mood = 'tired';
        else if (content.includes('stressed') || content.includes('anxious')) mood = 'stressed';
        else if (content.includes('focused') || content.includes('determined')) mood = 'focused';
      }

      // Get most common world from recent decisions
      const { data: decisions } = await supabase
        .from('decisions')
        .select('world')
        .eq('twin_id', twin.id)
        .order('created_at', { ascending: false })
        .limit(10);

      let activeWorld = 'general';
      if (decisions && decisions.length > 0) {
        const worldCounts: Record<string, number> = {};
        decisions.forEach((d: any) => {
          const w = d.world || 'general';
          worldCounts[w] = (worldCounts[w] || 0) + 1;
        });
        activeWorld = Object.entries(worldCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'general';
      }

      return {
        currentMood: mood,
        activeWorld,
        dataPoints: decisions?.length || 0,
      };
    } catch (err) {
      this.log('Error getting Twin context', err);
      return { currentMood: 'neutral', activeWorld: 'general', dataPoints: 0 };
    }
  }

  /**
   * Generate context-aware recommendations adapted for Twin state and world
   */
  private generateRecommendations(
    timeOfDay: string,
    dayType: string,
    season: string,
    currentMood: string,
    activeWorld: string
  ): string[] {
    const recs: string[] = [];

    // Mood-aware time-based recommendations
    if (timeOfDay === 'early_morning') {
      if (currentMood === 'tired') {
        recs.push('Take time to ease into your day gently');
      } else {
        recs.push('Great time for reflective thinking and planning');
      }
    } else if (timeOfDay === 'morning') {
      if (currentMood === 'energized') {
        recs.push('Energy levels high - tackle complex decisions now');
      } else if (currentMood === 'stressed') {
        recs.push('Start with easier tasks to build momentum');
      } else {
        recs.push('Energy levels good - tackle important decisions');
      }
    } else if (timeOfDay === 'afternoon') {
      if (currentMood === 'tired') {
        recs.push('Fatigue likely - take a restorative break');
      } else {
        recs.push('Afternoon slump common - consider a strategic break');
      }
    } else if (timeOfDay === 'evening') {
      if (currentMood === 'focused') {
        recs.push('Leverage focus for reflective work on ${activeWorld} world');
      } else {
        recs.push('Wind down mode - good for reviewing and reflection');
      }
    } else if (timeOfDay === 'night') {
      recs.push('Late night - prioritize rest and recovery');
    }

    // World-specific recommendations
    if (activeWorld && activeWorld !== 'general') {
      recs.push(`Focus on ${activeWorld} - you've been active here recently`);
    }

    // Day type + mood recommendations
    if (dayType === 'weekend') {
      if (currentMood === 'stressed') {
        recs.push('Weekend opportunity - allow yourself restoration');
      } else {
        recs.push('Weekend mode - good time for deep work or relaxation');
      }
    } else {
      recs.push('Weekday rhythm - balance ${activeWorld} world with self-care');
    }

    // Season recommendations
    if (season === 'spring') {
      recs.push('Spring energy - ideal for new initiatives and growth');
    } else if (season === 'summer') {
      recs.push('Summer vitality - maintain momentum on your ${activeWorld} goals');
    } else if (season === 'fall') {
      recs.push('Fall transition - prepare for changes in your ${activeWorld} world');
    } else if (season === 'winter') {
      recs.push('Winter slowdown - focus on internal goals and well-being');
    }

    return recs.slice(0, 4);
  }

  /**
   * Estimate stress level based on time and day
   */
  private estimateStressLevel(timeOfDay: string, dayType: string): number {
    let baseStress = 50; // neutral

    // Time-based stress patterns
    if (timeOfDay === 'early_morning') baseStress = 35; // calm
    else if (timeOfDay === 'morning') baseStress = 60; // building
    else if (timeOfDay === 'afternoon') baseStress = 70; // peak
    else if (timeOfDay === 'evening') baseStress = 55; // winding down
    else if (timeOfDay === 'night') baseStress = 40; // calm

    // Day type adjustment
    if (dayType === 'weekend') {
      baseStress = Math.max(30, baseStress - 15);
    } else {
      baseStress = Math.min(80, baseStress + 10);
    }

    return Math.round(baseStress);
  }

  /**
   * Default context for errors
   */
  private getDefaultContext(): EnvironmentContext {
    return {
      timeOfDay: 'afternoon',
      dayOfWeek: 'weekday',
      currentSeason: 'fall',
      stressLevel: 50,
      recommendations: ['Insufficient context data'],
    };
  }
}
