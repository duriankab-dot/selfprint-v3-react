/**
 * Integration Tests for ConfidenceIndicator Component
 * Tests component with real EvidenceAnalyzer calculations
 * @module components/intelligence/__integration__/ConfidenceIndicator.integration.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConfidenceIndicator from './ConfidenceIndicator';
import { BehavioralPattern, EvidencePoint, KnowledgeLevel } from '@/lib/intelligence/types';

describe('ConfidenceIndicator Integration Tests', () => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  describe('Integration: Component displays real metrics from source objects', () => {
    /**
     * Test 1: Display high confidence pattern with recent evidence
     * Verifies: real behavioral pattern → component → shows confidence + evidence
     */
    it('should display high confidence from behavioral pattern with recent evidence', () => {
      const mockPattern: BehavioralPattern = {
        id: 'pattern-1',
        userId: 'user-123',
        patternName: 'analytical_decision_making',
        description: 'Tends to analyze problems deeply before making decisions',
        confidence: 0.92,
        evidenceCount: 8,
        evidencePoints: [
          {
            id: 'ev-1',
            date: now,
            context: 'Spent 2 hours analyzing project requirements before starting',
            weight: 1.0,
          },
          {
            id: 'ev-2',
            date: sevenDaysAgo,
            context: 'Created detailed decision matrix before choosing tool',
            weight: 1.0,
          },
        ],
        consistencyScore: 0.88,
        createdAt: new Date('2026-01-01'),
        updatedAt: now,
      };

      render(
        <ConfidenceIndicator
          source={mockPattern}
          compact={false}
        />
      );

      // Verify confidence displayed
      expect(screen.getByText(/92%/i)).toBeInTheDocument();

      // Verify knowledge level - KNOW (high confidence + recent evidence)
      expect(screen.getByText(/KNOW/i)).toBeInTheDocument();

      // Verify evidence count shown
      expect(screen.getByText(/8 evidence/i)).toBeInTheDocument();

      // Verify consistency displayed
      expect(screen.getByText(/88%/i)).toBeInTheDocument();

      // Verify recency is good (recent evidence)
      expect(screen.getByText(/Just now|Today|1 day ago|This week/i)).toBeInTheDocument();
    });

    /**
     * Test 2: Display medium confidence (INFER) with moderate evidence
     * Verifies: mid-range confidence calculated correctly
     */
    it('should display medium confidence with INFER classification', () => {
      const mockPattern: BehavioralPattern = {
        id: 'pattern-2',
        userId: 'user-123',
        patternName: 'risk_averse',
        description: 'Tends to avoid high-risk decisions',
        confidence: 0.65,
        evidenceCount: 4,
        evidencePoints: [
          {
            id: 'ev-1',
            date: thirtyDaysAgo,
            context: 'Chose stable option over innovative one',
            weight: 0.8,
          },
          {
            id: 'ev-2',
            date: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
            context: 'Requested risk assessment before proceeding',
            weight: 0.7,
          },
        ],
        consistencyScore: 0.62,
        createdAt: new Date('2026-02-01'),
        updatedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      };

      render(
        <ConfidenceIndicator
          source={mockPattern}
          compact={false}
        />
      );

      // Verify confidence displayed
      expect(screen.getByText(/65%/i)).toBeInTheDocument();

      // Verify knowledge level - INFER (medium confidence)
      expect(screen.getByText(/INFER/i)).toBeInTheDocument();

      // Verify evidence count
      expect(screen.getByText(/4 evidence/i)).toBeInTheDocument();

      // Verify consistency shown
      expect(screen.getByText(/62%/i)).toBeInTheDocument();

      // Verify recency indicates older evidence
      expect(screen.getByText(/weeks? ago|month ago/i)).toBeInTheDocument();
    });

    /**
     * Test 3: Display low confidence (UNKNOWN) with minimal/old evidence
     * Verifies: low confidence + old evidence → UNKNOWN classification
     */
    it('should display low confidence with UNKNOWN classification for insufficient data', () => {
      const mockPattern: BehavioralPattern = {
        id: 'pattern-3',
        userId: 'user-123',
        patternName: 'creative_thinking',
        description: 'Approaches problems creatively',
        confidence: 0.35,
        evidenceCount: 1,
        evidencePoints: [
          {
            id: 'ev-1',
            date: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000), // 4+ months ago
            context: 'One creative solution observed',
            weight: 0.4,
          },
        ],
        consistencyScore: 0.25,
        createdAt: new Date('2026-04-01'),
        updatedAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000),
      };

      render(
        <ConfidenceIndicator
          source={mockPattern}
          compact={false}
        />
      );

      // Verify low confidence displayed
      expect(screen.getByText(/35%/i)).toBeInTheDocument();

      // Verify knowledge level - UNKNOWN (low confidence or insufficient evidence)
      expect(screen.getByText(/UNKNOWN/i)).toBeInTheDocument();

      // Verify single evidence shown
      expect(screen.getByText(/1 evidence/i)).toBeInTheDocument();

      // Verify old recency
      expect(screen.getByText(/months? ago|long ago/i)).toBeInTheDocument();
    });

    /**
     * Test 4: Compact mode displays essential metrics only
     * Verifies: compact view shows confidence badge efficiently
     */
    it('should display compact badge with core metrics', () => {
      const mockPattern: BehavioralPattern = {
        id: 'pattern-4',
        userId: 'user-123',
        patternName: 'leadership',
        description: 'Natural leader',
        confidence: 0.87,
        evidenceCount: 6,
        evidencePoints: [
          { id: 'ev-1', date: sevenDaysAgo, context: 'Led team meeting', weight: 1.0 },
        ],
        consistencyScore: 0.85,
        createdAt: new Date('2026-03-01'),
        updatedAt: sevenDaysAgo,
      };

      render(
        <ConfidenceIndicator
          source={mockPattern}
          compact={true}
        />
      );

      // Verify compact badge shown with confidence
      expect(screen.getByText(/87%/i)).toBeInTheDocument();

      // Verify badge shows KNOW level
      expect(screen.getByText(/KNOW/i)).toBeInTheDocument();

      // Verify evidence count visible in compact
      expect(screen.getByText(/6/i)).toBeInTheDocument();
    });

    /**
     * Test 5: No evidence edge case (new pattern)
     * Verifies: handles zero evidence gracefully
     */
    it('should handle pattern with no evidence gracefully', () => {
      const mockPattern: BehavioralPattern = {
        id: 'pattern-5',
        userId: 'user-123',
        patternName: 'public_speaking',
        description: 'Comfortable speaking in public',
        confidence: 0.0,
        evidenceCount: 0,
        evidencePoints: [],
        consistencyScore: 0,
        createdAt: now,
        updatedAt: now,
      };

      render(
        <ConfidenceIndicator
          source={mockPattern}
          compact={false}
        />
      );

      // Verify zero confidence shown
      expect(screen.getByText(/0%/i)).toBeInTheDocument();

      // Verify UNKNOWN classification (no data)
      expect(screen.getByText(/UNKNOWN/i)).toBeInTheDocument();

      // Verify zero evidence displayed
      expect(screen.getByText(/0 evidence/i)).toBeInTheDocument();

      // Verify message about insufficient data
      expect(screen.getByText(/insufficient data|no evidence|not enough/i)).toBeInTheDocument();
    });

    /**
     * Test 6: Manual props override + evidence calculation
     * Verifies: manual props work correctly with real calculations
     */
    it('should calculate recency factor correctly from manual props', () => {
      const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

      render(
        <ConfidenceIndicator
          confidence={0.78}
          evidenceCount={5}
          knowledgeLevel="INFER"
          lastEvidenceDate={oneDayAgo}
          consistencyScore={0.75}
          explanation="Based on 5 observations over 2 weeks"
        />
      );

      // Verify all metrics displayed
      expect(screen.getByText(/78%/i)).toBeInTheDocument();
      expect(screen.getByText(/5 evidence/i)).toBeInTheDocument();
      expect(screen.getByText(/INFER/i)).toBeInTheDocument();
      expect(screen.getByText(/1 day ago|yesterday|recently/i)).toBeInTheDocument();
      expect(screen.getByText(/Based on 5 observations/i)).toBeInTheDocument();
    });

    /**
     * Test 7: Consistency score impact on visual indication
     * Verifies: low consistency shows inconsistent data warning
     */
    it('should indicate inconsistent evidence when consistency is low', () => {
      const mockPattern: BehavioralPattern = {
        id: 'pattern-6',
        userId: 'user-123',
        patternName: 'mood',
        description: 'Stable emotional state',
        confidence: 0.55,
        evidenceCount: 6,
        evidencePoints: [
          { id: 'ev-1', date: now, context: 'Happy', weight: 1.0 },
          { id: 'ev-2', date: sevenDaysAgo, context: 'Sad', weight: 1.0 },
        ],
        consistencyScore: 0.28, // Low consistency
        createdAt: new Date('2026-05-01'),
        updatedAt: now,
      };

      render(
        <ConfidenceIndicator
          source={mockPattern}
          compact={false}
        />
      );

      // Verify low consistency shown
      expect(screen.getByText(/28%/i)).toBeInTheDocument();

      // Verify visual warning about inconsistency
      expect(screen.getByText(/inconsistent|mixed|variable/i)).toBeInTheDocument();
    });

    /**
     * Test 8: Perfect confidence (1.0) with abundant recent evidence
     * Verifies: high confidence + recent evidence = KNOW
     */
    it('should classify as KNOW with perfect confidence and recent evidence', () => {
      const mockPattern: BehavioralPattern = {
        id: 'pattern-7',
        userId: 'user-123',
        patternName: 'technical_proficiency',
        description: 'Strong technical skills',
        confidence: 1.0,
        evidenceCount: 15,
        evidencePoints: [
          { id: 'ev-1', date: now, context: 'Solved complex architecture problem', weight: 1.0 },
          { id: 'ev-2', date: sevenDaysAgo, context: 'Led tech review', weight: 1.0 },
        ],
        consistencyScore: 0.98,
        createdAt: new Date('2026-01-01'),
        updatedAt: now,
      };

      render(
        <ConfidenceIndicator
          source={mockPattern}
          compact={false}
        />
      );

      // Verify perfect confidence
      expect(screen.getByText(/100%/i)).toBeInTheDocument();

      // Verify KNOW classification
      expect(screen.getByText(/KNOW/i)).toBeInTheDocument();

      // Verify abundant evidence
      expect(screen.getByText(/15 evidence/i)).toBeInTheDocument();

      // Verify high consistency
      expect(screen.getByText(/98%/i)).toBeInTheDocument();
    });
  });

  describe('Master Direction Compliance: Never Pretend to Know', () => {
    /**
     * Test 9: Always show actual confidence, never hide uncertainty
     * Verifies: UNKNOWN is shown when appropriate
     */
    it('should show UNKNOWN classification honestly when confidence is low', () => {
      const mockPattern: BehavioralPattern = {
        id: 'pattern-8',
        userId: 'user-123',
        patternName: 'leadership_potential',
        description: 'Has leadership potential',
        confidence: 0.45,
        evidenceCount: 2,
        evidencePoints: [
          { id: 'ev-1', date: thirtyDaysAgo, context: 'One leadership experience', weight: 0.5 },
        ],
        consistencyScore: 0.40,
        createdAt: new Date('2026-06-01'),
        updatedAt: thirtyDaysAgo,
      };

      render(
        <ConfidenceIndicator
          source={mockPattern}
          compact={false}
        />
      );

      // Should show UNKNOWN, not pretend to know
      expect(screen.getByText(/UNKNOWN/i)).toBeInTheDocument();

      // Should show low confidence explicitly
      expect(screen.getByText(/45%/i)).toBeInTheDocument();

      // Should show low evidence count
      expect(screen.getByText(/2 evidence/i)).toBeInTheDocument();

      // Should NOT show "definitely" or "certainly" language
      expect(screen.queryByText(/definitely|certainly|definitely true/i)).not.toBeInTheDocument();
    });
  });
});
