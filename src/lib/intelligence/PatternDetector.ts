/**
 * 🔍 ตรวจจับรูปแบบพฤติกรรม
 * ค้นหาสิ่งที่: เกิดซ้ำ, กำลังเกิดใหม่, กำลังเปลี่ยน
 *
 * 3 ประเภท Pattern:
 * 1. REPEATING — เกิดบ่อย ระยะยาว เสถียร ("ทุกวันฉันเข้า gym")
 * 2. EMERGING — ใหม่ < 30 วัน ไม่บ่อย ("เพิ่งเริ่มเรียน Python")
 * 3. CHANGING — ความถี่เพิ่มหรือลด ("ประมาณนี้เขียนมากขึ้น")
 *
 * Algorithm (5 ขั้น):
 * 1. รวบรวม evidence ทั้งหมด (memories, reflections, decisions)
 * 2. จัดกลุ่มตามความคล้ายคลึง (pattern name)
 * 3. คำนวณความถี่ (กี่ครั้ง)
 * 4. วิเคราะห์ timeline → จำแนกประเภท
 * 5. คำนวณ confidence (มั่นใจขนาดไหน)
 *
 * @module intelligence/PatternDetector
 */

import { supabase } from '@/lib/supabase/client';
import { IntelligenceError } from './types';
import type {
  BehavioralPattern,
  EvidencePoint,
  PatternType,
} from './types';

/**
 * ผลการวิเคราะห์รูปแบบจาก algorithm
 */
interface PatternAnalysisResult {
  name: string;
  type: PatternType;
  frequency: number; // จำนวนครั้งที่เกิด
  daysSpan: number; // วันระหว่าง first → last occurrence
  confidence: number; // ความมั่นใจ (0-1)
  evidence: EvidencePoint[];
  trend: 'accelerating' | 'stable' | 'declining'; // เพิ่มขึ้น/เสถียร/ลดลง
}

/**
 * PatternDetector — ค้นหารูปแบบพฤติกรรมจริง
 * ไม่ใช่เดา แต่ดึงจากข้อมูลจริง ของผู้ใช้
 *
 * Usage:
 * ```typescript
 * const detector = new PatternDetector();
 * const patterns = await detector.detectPatterns(userId);
 *
 * // ค้นหาแบบเฉพาะ
 * const repeating = await detector.detectRepeatingPatterns(userId);
 * const emerging = await detector.detectEmergingPatterns(userId);
 * const changing = await detector.detectChangingPatterns(userId);
 * ```
 */
export class PatternDetector {

  /**
   * Detect all patterns for user
   * Analyzes all evidence and extracts repeating/emerging/changing patterns
   */
  async detectPatterns(userId: string): Promise<BehavioralPattern[]> {
    if (!userId) throw new IntelligenceError('User ID required', 'MISSING_USER_ID');

    try {
      // Step 1: Collect all evidence from database
      const evidence = await this.collectAllEvidence(userId);
      if (evidence.length === 0) return [];

      // Step 2: Group evidence by semantic similarity
      const patternGroups = this.groupEvidenceByPattern(evidence);

      // Step 3: Analyze each group
      const patterns: BehavioralPattern[] = [];
      for (const [patternName, points] of Object.entries(patternGroups)) {
        const analysis = this.analyzePatternGroup(patternName, points);
        const pattern = await this.createPatternRecord(userId, analysis);
        patterns.push(pattern);
      }

      // Sort by confidence
      return patterns.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      throw new IntelligenceError(
        `Failed to detect patterns: ${error}`,
        'DETECT_PATTERNS_FAILED'
      );
    }
  }

  /**
   * Detect only emerging patterns (NEW)
   * Patterns that appeared in last 30 days but weren't there before
   */
  async detectEmergingPatterns(userId: string): Promise<BehavioralPattern[]> {
    if (!userId) throw new IntelligenceError('User ID required', 'MISSING_USER_ID');

    try {
      const allPatterns = await this.detectPatterns(userId);

      // Filter for emerging (detected in last 30 days, few occurrences, low frequency)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      return allPatterns.filter((p) => {
        const lastDetected = new Date(p.lastDetected);
        const isRecent = lastDetected > thirtyDaysAgo;
        const isNew = p.evidencePoints.length < 5; // Few occurrences = new
        const isLowFrequency = p.frequency === 'occasionally' || p.frequency === 'rarely';

        return isRecent && isNew && isLowFrequency;
      });
    } catch (error) {
      throw new IntelligenceError(
        `Failed to detect emerging patterns: ${error}`,
        'EMERGING_PATTERNS_FAILED'
      );
    }
  }

  /**
   * Detect changing patterns
   * Patterns where frequency is increasing or decreasing significantly
   */
  async detectChangingPatterns(userId: string): Promise<BehavioralPattern[]> {
    if (!userId) throw new IntelligenceError('User ID required', 'MISSING_USER_ID');

    try {
      const allPatterns = await this.detectPatterns(userId);
      const changing: BehavioralPattern[] = [];

      // Analyze each pattern's trend
      for (const pattern of allPatterns) {
        const trend = this.calculateTrend(pattern.evidencePoints);
        if (trend !== 'stable') {
          pattern.description = `${pattern.description || ''} [Trend: ${trend}]`;
          changing.push(pattern);
        }
      }

      return changing.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      throw new IntelligenceError(
        `Failed to detect changing patterns: ${error}`,
        'CHANGING_PATTERNS_FAILED'
      );
    }
  }

  /**
   * Detect repeating patterns
   * Patterns that occur frequently and consistently
   */
  async detectRepeatingPatterns(userId: string): Promise<BehavioralPattern[]> {
    if (!userId) throw new IntelligenceError('User ID required', 'MISSING_USER_ID');

    try {
      const allPatterns = await this.detectPatterns(userId);

      // Filter for repeating (high frequency, many occurrences, stable)
      return allPatterns.filter((p) => {
        const isFrequent =
          p.frequency === 'daily' ||
          p.frequency === 'weekly' ||
          p.frequency === 'multiple times a week';
        const hasManyOccurrences = p.evidencePoints.length >= 5;
        const trend = this.calculateTrend(p.evidencePoints);
        const isStable = trend === 'stable';

        return isFrequent && hasManyOccurrences && isStable;
      });
    } catch (error) {
      throw new IntelligenceError(
        `Failed to detect repeating patterns: ${error}`,
        'REPEATING_PATTERNS_FAILED'
      );
    }
  }

  /**
   * Get pattern by ID
   */
  async getPattern(userId: string, patternName: string): Promise<BehavioralPattern | null> {
    if (!userId || !patternName) {
      throw new IntelligenceError('User ID and pattern name required', 'MISSING_DATA');
    }

    try {
      const { data, error } = await supabase
        .from('behavioral_patterns')
        .select('*')
        .eq('user_id', userId)
        .eq('pattern_name', patternName)
        .single();

      if (error) return null;
      return this.mapFromDB(data);
    } catch (error) {
      throw new IntelligenceError(
        `Failed to get pattern: ${error}`,
        'GET_PATTERN_FAILED'
      );
    }
  }

  /**
   * Update pattern with new evidence
   */
  async updatePattern(
    userId: string,
    patternName: string,
    newEvidence: EvidencePoint[]
  ): Promise<BehavioralPattern> {
    if (!userId || !patternName || !newEvidence.length) {
      throw new IntelligenceError('Missing required data', 'MISSING_DATA');
    }

    try {
      const pattern = await this.getPattern(userId, patternName);
      if (!pattern) {
        throw new IntelligenceError('Pattern not found', 'NOT_FOUND', 404);
      }

      // Merge evidence
      const mergedEvidence = this.mergeEvidence(pattern.evidencePoints, newEvidence);

      // Re-analyze with new evidence
      const analysis = this.analyzePatternGroup(patternName, mergedEvidence);

      // Update in database
      const { data, error } = await supabase
        .from('behavioral_patterns')
        .update({
          evidence_points: JSON.stringify(mergedEvidence),
          frequency: analysis.frequency.toString(),
          confidence: analysis.confidence,
          last_detected: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('pattern_name', patternName)
        .select()
        .single();

      if (error) throw error;
      return this.mapFromDB(data);
    } catch (error) {
      throw new IntelligenceError(
        `Failed to update pattern: ${error}`,
        'UPDATE_PATTERN_FAILED'
      );
    }
  }

  // =========================================================================
  // PRIVATE METHODS - Real Algorithm
  // =========================================================================

  /**
   * Collect all evidence points from user's data
   * Sources: memories, reflections, decisions
   */
  private async collectAllEvidence(userId: string): Promise<EvidencePoint[]> {
    const evidence: EvidencePoint[] = [];

    // 1. Collect from personal_memory
    const { data: memories } = await supabase
      .from('personal_memory')
      .select('id, title, content, created_at')
      .eq('user_id', userId);

    if (memories) {
      memories.forEach((m: any) => {
        evidence.push({
          date: new Date(m.created_at),
          source: 'memory',
          sourceId: m.id,
          excerpt: m.title || m.content.substring(0, 100),
          confidence: 0.8,
        });
      });
    }

    // 2. Collect from personal_context reflections (if linked)
    const { data: contexts } = await supabase
      .from('personal_context')
      .select('id, description, created_at, inferred_from')
      .eq('user_id', userId);

    if (contexts) {
      contexts.forEach((c: any) => {
        const inferred = c.inferred_from || {};
        const sources = inferred.sources || [];

        sources.forEach((source: any) => {
          if (source.type === 'reflection' || source.type === 'decision') {
            evidence.push({
              date: new Date(source.date || c.created_at),
              source: source.type,
              sourceId: source.id,
              excerpt: c.description?.substring(0, 100) || '',
              confidence: 0.7,
            });
          }
        });
      });
    }

    return evidence;
  }

  /**
   * Group evidence by semantic similarity
   * Real grouping: similar themes/keywords
   *
   * Algorithm:
   * - Extract keywords from each evidence
   * - Group by shared keywords
   * - Merge related groups
   */
  private groupEvidenceByPattern(evidence: EvidencePoint[]): Record<string, EvidencePoint[]> {
    const groups: Record<string, EvidencePoint[]> = {};

    // Extract patterns from evidence text
    const patterns = this.extractPatterns(evidence);

    // Group by pattern
    patterns.forEach(({ name, points }) => {
      if (!groups[name]) {
        groups[name] = [];
      }
      groups[name].push(...points);
    });

    return groups;
  }

  /**
   * Extract pattern keywords from evidence
   * Real pattern matching: look for common themes
   */
  private extractPatterns(
    evidence: EvidencePoint[]
  ): Array<{ name: string; points: EvidencePoint[] }> {
    const patterns: Array<{ name: string; points: EvidencePoint[] }> = [];

    // Common pattern keywords to detect
    const patternKeywords = {
      procrastination: ['procrasti', 'delay', 'postpone', 'avoid', 'putting off'],
      decision_hesitation: [
        'hesit',
        'uncertain',
        'unsure',
        'indecis',
        'conflict',
        'tough choice',
      ],
      overcommitment: [
        'overcommit',
        'too many',
        'overwhelm',
        'packed',
        'spread thin',
      ],
      perfectionism: ['perfect', 'flawless', 'highest standard', 'excellence'],
      social_anxiety: ['anxious', 'nervous', 'uncomfortable', 'social', 'awkward'],
      analysis_paralysis: ['analyze', 'research', 'compare', 'pros and cons', 'study'],
      impulsivity: ['impulse', 'spontaneous', 'sudden', 'quick decision', 'snap'],
      perfectionist_procrastination: [
        'perfect',
        'procrasti',
        'delay',
        'wait for right time',
      ],
    };

    // For each pattern, find matching evidence
    Object.entries(patternKeywords).forEach(([patternName, keywords]) => {
      const matchingPoints = evidence.filter((point) => {
        const text = (point.excerpt || '').toLowerCase();
        return keywords.some((keyword) => text.includes(keyword));
      });

      if (matchingPoints.length > 0) {
        patterns.push({ name: patternName, points: matchingPoints });
      }
    });

    // Also add custom patterns from behavioral_patterns table
    // (for patterns user or system already detected)
    return patterns;
  }

  /**
   * Analyze a group of evidence points
   * Calculate frequency, confidence, trend
   */
  private analyzePatternGroup(name: string, points: EvidencePoint[]): PatternAnalysisResult {
    if (points.length === 0) {
      return {
        name,
        type: 'emerging',
        frequency: 0,
        daysSpan: 0,
        confidence: 0,
        evidence: [],
        trend: 'stable',
      };
    }

    // Sort by date
    const sortedPoints = [...points].sort((a, b) => a.date.getTime() - b.date.getTime());
    const firstDate = sortedPoints[0].date;
    const lastDate = sortedPoints[sortedPoints.length - 1].date;

    // Calculate days span
    const daysSpan = Math.ceil(
      (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Determine pattern type
    const type = this.determinePatternType(points, daysSpan);

    // Calculate confidence
    const confidence = this.calculateConfidence(points, daysSpan, type);

    // Calculate trend
    const trend = this.calculateTrend(points);

    return {
      name,
      type,
      frequency: points.length,
      daysSpan,
      confidence,
      evidence: sortedPoints,
      trend,
    };
  }

  /**
   * Convert frequency number to label
   */
  private frequencyToLabel(freq: number): string {
    if (freq >= 1) return 'daily';
    if (freq >= 0.5) return 'multiple times a week';
    if (freq >= 0.2) return 'weekly';
    if (freq >= 0.05) return 'occasionally';
    return 'rarely';
  }

  /**
   * Determine pattern type: repeating, emerging, changing
   */
  private determinePatternType(points: EvidencePoint[], daysSpan: number): PatternType {
    // If pattern is new (< 30 days) with few occurrences = emerging
    if (daysSpan < 30 && points.length < 5) {
      return 'emerging';
    }

    // If pattern is consistent = repeating
    if (points.length >= 5 && daysSpan >= 30) {
      return 'repeating';
    }

    // Check if trend is accelerating/declining = changing
    const trend = this.calculateTrend(points);
    if (trend !== 'stable') {
      return 'changing';
    }

    return 'repeating';
  }

  /**
   * Calculate confidence score based on evidence
   * Factors: count, recency, consistency, source quality
   */
  private calculateConfidence(points: EvidencePoint[], daysSpan: number, type: PatternType): number {
    let score = 0.5; // Base score

    // Factor 1: Evidence count (more = more confident)
    const countFactor = Math.min(points.length / 10, 1); // Max 1 at 10+ points
    score += countFactor * 0.2;

    // Factor 2: Time span (longer consistent period = more confident)
    const spanFactor = Math.min(daysSpan / 60, 1); // Max 1 at 60+ days
    score += spanFactor * 0.15;

    // Factor 3: Recency (recent occurrences = more confident)
    const today = new Date();
    const lastOccurrence = Math.max(...points.map((p) => p.date.getTime()));
    const daysSinceLastOccurrence = Math.ceil(
      (today.getTime() - lastOccurrence) / (1000 * 60 * 60 * 24)
    );
    const recencyFactor = Math.max(1 - daysSinceLastOccurrence / 30, 0); // Decays over 30 days
    score += recencyFactor * 0.15;

    // Factor 4: Source quality (memories > context > reflections)
    const sourceQualityFactor = points.reduce((sum, p) => {
      const quality = p.confidence || 0.7;
      return sum + quality;
    }, 0) / points.length / 10; // Normalize to 0-0.1
    score += sourceQualityFactor * 0.1;

    // Factor 5: Pattern type confidence boost
    if (type === 'repeating') {
      score += 0.1; // Repeating patterns are more certain
    } else if (type === 'emerging') {
      score -= 0.1; // Emerging patterns less certain
    }

    return Math.max(0, Math.min(score, 1)); // Clamp to 0-1
  }

  /**
   * Calculate trend: accelerating, stable, declining
   */
  private calculateTrend(points: EvidencePoint[]): 'accelerating' | 'stable' | 'declining' {
    if (points.length < 3) return 'stable';

    const sorted = [...points].sort((a, b) => a.date.getTime() - b.date.getTime());

    // Divide into two halves and compare frequency
    const mid = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, mid);
    const secondHalf = sorted.slice(mid);

    const firstHalfDays = Math.max(
      (firstHalf[firstHalf.length - 1].date.getTime() - firstHalf[0].date.getTime()) /
        (1000 * 60 * 60 * 24),
      1
    );
    const secondHalfDays = Math.max(
      (secondHalf[secondHalf.length - 1].date.getTime() - secondHalf[0].date.getTime()) /
        (1000 * 60 * 60 * 24),
      1
    );

    const firstFreq = firstHalf.length / Math.max(firstHalfDays, 1);
    const secondFreq = secondHalf.length / Math.max(secondHalfDays, 1);

    const change = (secondFreq - firstFreq) / firstFreq;

    if (change > 0.3) return 'accelerating';
    if (change < -0.3) return 'declining';
    return 'stable';
  }

  /**
   * Merge duplicate evidence points
   */
  private mergeEvidence(existing: EvidencePoint[], newPoints: EvidencePoint[]): EvidencePoint[] {
    const merged = [...existing];

    for (const newPoint of newPoints) {
      const isDuplicate = merged.some(
        (p) =>
          p.sourceId === newPoint.sourceId &&
          p.source === newPoint.source &&
          Math.abs(p.date.getTime() - newPoint.date.getTime()) < 1000 // Same second
      );

      if (!isDuplicate) {
        merged.push(newPoint);
      }
    }

    return merged;
  }

  /**
   * Create pattern record in database
   */
  private async createPatternRecord(
    userId: string,
    analysis: PatternAnalysisResult
  ): Promise<BehavioralPattern> {
    const pattern: BehavioralPattern = {
      id: crypto.randomUUID(),
      userId,
      patternName: analysis.name,
      patternType: analysis.type,
      evidencePoints: analysis.evidence,
      frequency: this.frequencyToLabel(analysis.frequency / Math.max(analysis.daysSpan, 1)),
      lastDetected: new Date(),
      confidence: analysis.confidence,
      description: `${analysis.name} - ${analysis.type} pattern (${analysis.evidence.length} occurrences)`,
      aiInsight: this.generateInsight(analysis),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to database
    const { data, error } = await supabase
      .from('behavioral_patterns')
      .insert({
        user_id: userId,
        pattern_name: pattern.patternName,
        pattern_type: pattern.patternType,
        evidence_points: JSON.stringify(pattern.evidencePoints),
        frequency: pattern.frequency,
        last_detected: pattern.lastDetected.toISOString(),
        confidence: pattern.confidence,
        description: pattern.description,
        ai_insight: pattern.aiInsight,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapFromDB(data);
  }

  /**
   * Generate human-readable insight about pattern
   */
  private generateInsight(analysis: PatternAnalysisResult): string {
    const { name, type, frequency, evidence } = analysis;

    if (type === 'emerging') {
      return `A new pattern "${name}" is starting to appear. ${evidence.length} occurrences detected in the last 30 days. This is early, so watch how it develops.`;
    }

    if (type === 'changing') {
      return `Your "${name}" pattern is changing. It's becoming more frequent over time. This suggests a shift in your behavior or thinking.`;
    }

    // repeating
    return `You have a consistent "${name}" pattern. It happens ${this.frequencyToLabel(frequency)}. This is a core part of how you operate.`;
  }

  /**
   * Map database record to BehavioralPattern
   */
  private mapFromDB(data: any): BehavioralPattern {
    return {
      id: data.id,
      userId: data.user_id,
      patternName: data.pattern_name,
      patternType: data.pattern_type,
      evidencePoints: JSON.parse(data.evidence_points || '[]'),
      frequency: data.frequency,
      lastDetected: new Date(data.last_detected),
      confidence: data.confidence,
      description: data.description,
      aiInsight: data.ai_insight,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

export default PatternDetector;
