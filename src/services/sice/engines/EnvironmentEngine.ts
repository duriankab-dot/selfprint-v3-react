/**
 * SICE #7: EnvironmentEngine
 * Analyzes situational context and environmental factors
 * Provides environment-aware insights and recommendations
 */

import { SICEBase } from '../SICEBase';
import type { SICEInput, SICEOutput } from '../../../types/sice';

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
        const context = this.analyzeEnvironment();
        return context;
      } catch (err) {
        console.error('Environment analysis error:', err);
        return this.getDefaultContext();
      }
    });

    return this.createResult(result, 60, executionTime);
  }

  /**
   * Analyze current environmental context
   */
  private analyzeEnvironment(): EnvironmentContext {
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

    // Generate recommendations based on context
    const recommendations = this.generateRecommendations(timeOfDay, dayType, season);

    return {
      timeOfDay,
      dayOfWeek: dayType,
      currentSeason: season,
      stressLevel: this.estimateStressLevel(timeOfDay, dayType),
      recommendations,
    };
  }

  /**
   * Generate context-aware recommendations
   */
  private generateRecommendations(
    timeOfDay: string,
    dayType: string,
    season: string
  ): string[] {
    const recs: string[] = [];

    // Time-based recommendations
    if (timeOfDay === 'early_morning') {
      recs.push('Great time for reflective thinking and planning');
    } else if (timeOfDay === 'morning') {
      recs.push('Energy levels high - tackle important decisions');
    } else if (timeOfDay === 'afternoon') {
      recs.push('Afternoon slump common - consider a break');
    } else if (timeOfDay === 'evening') {
      recs.push('Wind down mode - good for reviewing and reflection');
    } else if (timeOfDay === 'night') {
      recs.push('Late night - prioritize rest and recovery');
    }

    // Day type recommendations
    if (dayType === 'weekend') {
      recs.push('Weekend mode - good time for deep work or relaxation');
    } else {
      recs.push('Weekday rhythm - balance work with self-care');
    }

    // Season recommendations
    if (season === 'spring') {
      recs.push('Spring energy - ideal for new initiatives and growth');
    } else if (season === 'summer') {
      recs.push('Summer vitality - maintain momentum on goals');
    } else if (season === 'fall') {
      recs.push('Fall transition - prepare for changes and reflections');
    } else if (season === 'winter') {
      recs.push('Winter slowdown - focus on internal goals and well-being');
    }

    return recs.slice(0, 3);
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
