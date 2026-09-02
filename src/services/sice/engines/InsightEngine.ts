/**
 * SICE #3: InsightEngine
 * Generates insights from patterns (P0 #7.3 - World-aware)
 */

import { SICEBase } from '../SICEBase';
import { supabase } from '../../supabase-service';
import type { SICEInput, SICEOutput, Insight } from '../../../types/sice';

export class InsightEngine extends SICEBase {
  private readonly ACTIONABLE_CONFIDENCE_THRESHOLD = 70;
  private readonly RELEVANCE_THRESHOLD = 60;

  constructor() {
    super(3, 'InsightEngine', 'Generates insights from patterns and data');
  }

  async process(input: SICEInput): Promise<SICEOutput> {
    const { result, executionTime } = await this.measureExecution(async () => {
      if (!this.validateInput(input)) {
        return [];
      }

      const userId = input.userId;
      const world = input.currentWorld || null;

      try {
        // Use PersonalContext from input if available
        const personalContext = (input as any).personalContext;

        // Generate insights from context and patterns
        const insights: Insight[] = [];

        // Insight 1: Emotional State Recommendation
        if (personalContext?.emotionalState) {
          const emotionalInsight = this.generateEmotionalInsight(personalContext, world);
          if (emotionalInsight.relevance >= this.RELEVANCE_THRESHOLD) {
            insights.push(emotionalInsight);
          }
        }

        // Insight 2: Decision Quality Analysis
        const decisionInsight = await this.generateDecisionInsight(userId, world);
        if (decisionInsight && decisionInsight.relevance >= this.RELEVANCE_THRESHOLD) {
          insights.push(decisionInsight);
        }

        // Insight 3: Growth Trend
        const growthInsight = await this.generateGrowthInsight(userId, world);
        if (growthInsight && growthInsight.relevance >= this.RELEVANCE_THRESHOLD) {
          insights.push(growthInsight);
        }

        return insights;
      } catch (err) {
        console.error('Insight generation error:', err);
        return [];
      }
    });

    return this.createResult(result, 65, executionTime);
  }

  private generateEmotionalInsight(personalContext: any, _world: string | null): Insight {
    const emotionalState = personalContext.emotionalState || 'balanced';
    const confidence = Math.min(95, personalContext.confidence * 1.2);

    let title = '';
    let description = '';

    if (emotionalState === 'stressed') {
      title = 'พักใจด้วยสติ';
      description = 'พลังใจของคุณถูกใช้จนหมด ลองพักสักครู่หรือการจดสมาธิดูครับ';
    } else if (emotionalState === 'energetic') {
      title = 'นำพลังของคุณไปใช้ประโยชน์';
      description = 'คุณอยู่ในสภาพมีพลังสูง เวลาที่ดีที่สุดที่จะลุยเป้าหมายท้าทายครับ';
    } else if (emotionalState === 'reflective') {
      title = 'โอกาสทำการสะท้อนตัวเองอย่างลึกซึ้ง';
      description = 'จิตใจของคุณอยู่ในสภาพสำรวจตัวเอง จดบันทึกความคิดของคุณเพื่อความชัดเจนครับ';
    } else {
      title = 'รักษาความสมดุลของคุณ';
      description = 'คุณอยู่ในสภาพอารมณ์ที่สมดุล นี่คือเวลาที่ดีที่สุดสำหรับการตัดสินใจครับ';
    }

    return {
      title,
      description,
      basedOnPatterns: ['emotional_state_analysis'],
      actionable: confidence >= this.ACTIONABLE_CONFIDENCE_THRESHOLD,
      relevance: Math.min(95, confidence),
    };
  }

  private async generateDecisionInsight(userId: string, _world: string | null): Promise<Insight | null> {
    try {
      let query = supabase
        // DECISIONS-USERID-001 FIX: 'decisions' table has no 'world_id'
        // column — only 'world' (verified against the working insert in
        // WorldDecisionRouter.ts). 'user_id' now exists too, see
        // PRODUCTION_DB_CATCHUP_2026-09-01.sql.
        .from('decisions')
        .select('outcome')
        .eq('user_id', userId)
        .limit(20);

      if (_world) {
        query = query.eq('world', _world);
      }

      const { data: decisions } = await query;

      if (!decisions || decisions.length < 3) {
        return null;
      }

      const successCount = decisions.filter((d: any) => d.outcome === 'positive').length;
      const successRate = (successCount / decisions.length) * 100;
      const confidence = Math.min(90, decisions.length * 3);

      if (successRate >= 70) {
        return {
          title: 'รูปแบบการตัดสินใจที่แข็งแกร่ง',
          description: `คุณบรรลุผลลัพธ์เชิงบวกใน ${Math.round(successRate)}% ของการตัดสินใจเมื่อเร็ว ๆ นี้ เชื่อใจสัญชาตญาณของคุณครับ`,
          basedOnPatterns: ['decision_outcomes'],
          actionable: confidence >= this.ACTIONABLE_CONFIDENCE_THRESHOLD,
          relevance: Math.min(90, confidence),
        };
      } else if (successRate >= 50) {
        return {
          title: 'คุณภาพการตัดสินใจกำลังดีขึ้น',
          description: `การตัดสินใจล่าสุดของคุณมีความดีขึ้น เรียนรู้จากผลลัพธ์เพื่อปรับปรุงวิธีการของคุณต่อไปครับ`,
          basedOnPatterns: ['decision_outcomes'],
          actionable: confidence >= this.ACTIONABLE_CONFIDENCE_THRESHOLD,
          relevance: Math.min(85, confidence),
        };
      }

      return null;
    } catch (err) {
      console.error('Decision insight generation error:', err);
      return null;
    }
  }

  private async generateGrowthInsight(userId: string, world: string | null): Promise<Insight | null> {
    try {
      let query = supabase
        .from('world_stats')
        .select('*')
        .eq('user_id', userId);

      if (world) {
        query = query.eq('world_id', world);
      }

      const { data: stats } = await query;

      if (!stats || stats.length === 0) {
        return null;
      }

      const totalEngagement = stats.reduce((sum: number, s: any) => sum + (s.visits_count || 0), 0);
      const totalInsights = stats.reduce((sum: number, s: any) => sum + (s.insights_gained || 0), 0);

      if (totalEngagement >= 20) {
        return {
          title: 'ตรวจพบการเติบโตอย่างสม่ำเสมอ',
          description: `คุณได้รับข้อคิด ${totalInsights} รายการจาก ${totalEngagement} ปฏิสัมพันธ์ ความตระหนักตัวของคุณกำลังพัฒนาครับ`,
          basedOnPatterns: ['engagement_trends'],
          actionable: true,
          relevance: Math.min(88, totalEngagement),
        };
      }

      return null;
    } catch (err) {
      console.error('Growth insight generation error:', err);
      return null;
    }
  }
}
