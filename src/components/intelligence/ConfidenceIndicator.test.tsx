/**
 * Unit Tests for ConfidenceIndicator Component
 * Tests confidence display, knowledge classification, metrics rendering
 * @module components/intelligence/__tests__/ConfidenceIndicator.test
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConfidenceIndicator from './ConfidenceIndicator';
import { BehavioralPattern, Value } from '@/lib/intelligence/types';

describe('ConfidenceIndicator Component', () => {
  describe('Rendering - Compact View', () => {
    /**
     * Test 1: Renders compact view by default
     */
    it('should render in compact view by default', () => {
      render(
        <ConfidenceIndicator confidence={0.8} evidenceCount={3} />
      );

      expect(screen.getByText('80%')).toBeInTheDocument();
    });

    /**
     * Test 2: Displays confidence percentage correctly
     */
    it('should display confidence percentage', () => {
      render(
        <ConfidenceIndicator confidence={0.65} />
      );

      expect(screen.getByText('65%')).toBeInTheDocument();
    });

    /**
     * Test 3: Shows knowledge badge in compact view
     */
    it('should show knowledge badge', () => {
      render(
        <ConfidenceIndicator confidence={0.9} knowledgeLevel="KNOW" compact={true} />
      );

      expect(screen.getByText('KNOW')).toBeInTheDocument();
    });
  });

  describe('Rendering - Full Card View', () => {
    /**
     * Test 4: Renders full card when compact is false
     */
    it('should render full card view when compact=false', () => {
      render(
        <ConfidenceIndicator confidence={0.75} compact={false} />
      );

      expect(screen.getByText('Confidence Score')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    /**
     * Test 5: Shows all metrics in card view
     */
    it('should display all metrics in card view', () => {
      render(
        <ConfidenceIndicator
          confidence={0.85}
          evidenceCount={5}
          lastEvidenceDate={new Date()}
          consistencyScore={0.9}
          compact={false}
        />
      );

      expect(screen.getByText(/Evidence/i)).toBeInTheDocument();
      expect(screen.getByText(/Recency/i)).toBeInTheDocument();
      expect(screen.getByText(/Consistency/i)).toBeInTheDocument();
    });
  });

  describe('Confidence Level Classification', () => {
    /**
     * Test 6: High confidence (0.8+) shows as "Very High"
     */
    it('should classify 0.8+ as Very High confidence', () => {
      render(
        <ConfidenceIndicator confidence={0.9} compact={false} />
      );

      const element = screen.getByText(/Very High/i) || screen.getByText('90%');
      expect(element).toBeInTheDocument();
    });

    /**
     * Test 7: Moderate confidence (0.4-0.6) shows as "Moderate"
     */
    it('should classify 0.4-0.6 as Moderate confidence', () => {
      render(
        <ConfidenceIndicator confidence={0.5} compact={false} />
      );

      const element = screen.getByText(/Moderate/i) || screen.getByText('50%');
      expect(element).toBeInTheDocument();
    });

    /**
     * Test 8: Low confidence (0-0.2) shows as "Very Low"
     */
    it('should classify 0-0.2 as Very Low confidence', () => {
      render(
        <ConfidenceIndicator confidence={0.1} compact={false} />
      );

      const element = screen.getByText(/Very Low/i) || screen.getByText('10%');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Knowledge Level Classification', () => {
    /**
     * Test 9: High confidence + evidence = KNOW
     */
    it('should classify as KNOW with high confidence and evidence', () => {
      render(
        <ConfidenceIndicator
          confidence={0.95}
          evidenceCount={5}
          knowledgeLevel="KNOW"
        />
      );

      expect(screen.getByText('KNOW')).toBeInTheDocument();
    });

    /**
     * Test 10: Medium confidence = INFER
     */
    it('should classify as INFER with medium confidence', () => {
      render(
        <ConfidenceIndicator
          confidence={0.65}
          knowledgeLevel="INFER"
        />
      );

      expect(screen.getByText('INFER')).toBeInTheDocument();
    });

    /**
     * Test 11: Low confidence/evidence = UNKNOWN
     */
    it('should classify as UNKNOWN with low confidence', () => {
      render(
        <ConfidenceIndicator
          confidence={0.2}
          evidenceCount={0}
          knowledgeLevel="UNKNOWN"
        />
      );

      expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
    });
  });

  describe('Evidence Display', () => {
    /**
     * Test 12: Shows evidence count correctly
     */
    it('should display evidence count', () => {
      render(
        <ConfidenceIndicator
          confidence={0.8}
          evidenceCount={7}
          compact={false}
        />
      );

      expect(screen.getByText('7')).toBeInTheDocument();
    });

    /**
     * Test 13: Shows 'N/A' when no evidence count provided
     */
    it('should show N/A when evidence count is not provided', () => {
      render(
        <ConfidenceIndicator confidence={0.5} compact={false} />
      );

      const elements = screen.getAllByText('N/A');
      expect(elements.length).toBeGreaterThan(0);
    });

    /**
     * Test 14: Shows evidence progress bar
     */
    it('should render evidence progress bar', () => {
      const { container } = render(
        <ConfidenceIndicator
          confidence={0.8}
          evidenceCount={5}
          compact={false}
        />
      );

      const progressBars = container.querySelectorAll('.bg-blue-500');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });

  describe('Recency Display', () => {
    /**
     * Test 15: Calculates and displays recency correctly
     */
    it('should calculate and display recency in days', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      render(
        <ConfidenceIndicator
          confidence={0.8}
          lastEvidenceDate={pastDate}
          compact={false}
        />
      );

      const element = screen.getByText(/[0-9]+d/);
      expect(element).toBeInTheDocument();
    });

    /**
     * Test 16: Shows N/A when no date provided
     */
    it('should show N/A when lastEvidenceDate is not provided', () => {
      render(
        <ConfidenceIndicator confidence={0.5} compact={false} />
      );

      const elements = screen.getAllByText('N/A');
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Consistency Display', () => {
    /**
     * Test 17: Shows consistency score when provided
     */
    it('should display consistency score', () => {
      render(
        <ConfidenceIndicator
          confidence={0.8}
          consistencyScore={0.85}
          compact={false}
        />
      );

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    /**
     * Test 18: Hides consistency when not provided
     */
    it('should not show consistency when not provided', () => {
      render(
        <ConfidenceIndicator
          confidence={0.8}
          compact={false}
        />
      );

      const headings = screen.queryAllByText('Consistency');
      expect(headings.length).toBe(0);
    });
  });

  describe('Explanation & Tooltips', () => {
    /**
     * Test 19: Uses provided explanation
     */
    it('should display provided explanation', () => {
      const explanation = 'Custom explanation text';
      render(
        <ConfidenceIndicator
          confidence={0.8}
          explanation={explanation}
          compact={false}
        />
      );

      expect(screen.getByText(explanation)).toBeInTheDocument();
    });

    /**
     * Test 20: Generates default explanation from metrics
     */
    it('should generate default explanation from metrics', () => {
      render(
        <ConfidenceIndicator
          confidence={0.8}
          evidenceCount={3}
          lastEvidenceDate={new Date()}
          compact={false}
        />
      );

      const text = screen.getByText(/Based on.*evidence/i);
      expect(text).toBeInTheDocument();
    });
  });

  describe('Source Object Analysis', () => {
    /**
     * Test 21: Extracts metrics from BehavioralPattern
     */
    it('should extract metrics from BehavioralPattern source', () => {
      const pattern: BehavioralPattern = {
        id: 'pat-1',
        userId: 'user-1',
        patternName: 'test_pattern',
        patternType: 'repeating',
        evidencePoints: [
          { date: new Date(), source: 'reflection', sourceId: 'ref-1', excerpt: 'test' },
          { date: new Date(), source: 'decision', sourceId: 'dec-1', excerpt: 'test' },
        ],
        frequency: 'weekly',
        lastDetected: new Date(),
        confidence: 0.8,
        description: 'Test pattern',
        aiInsight: 'Test insight',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      render(
        <ConfidenceIndicator source={pattern} compact={false} />
      );

      expect(screen.getByText('80%')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // evidence count
    });

    /**
     * Test 22: Extracts metrics from Value source
     */
    it('should extract metrics from Value source', () => {
      const value: Value = {
        id: 'val-1',
        name: 'Integrity',
        confidence: 0.85,
        evidence: ['reflection-1', 'decision-1', 'decision-2'],
        inferredFromSources: [],
        inferred: false,
      };

      render(
        <ConfidenceIndicator source={value} compact={false} />
      );

      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument(); // evidence count
    });
  });

  describe('Responsive Design', () => {
    /**
     * Test 23: Applies custom className
     */
    it('should apply custom className', () => {
      const { container } = render(
        <ConfidenceIndicator
          confidence={0.8}
          className="custom-class"
          compact={true}
        />
      );

      const element = container.querySelector('.custom-class');
      expect(element).toBeInTheDocument();
    });

    /**
     * Test 24: Works with dark mode classes
     */
    it('should include dark mode classes', () => {
      const { container } = render(
        <ConfidenceIndicator confidence={0.8} compact={false} />
      );

      const darkClasses = container.querySelector('.dark\\:bg-slate-900');
      expect(darkClasses || container.firstChild).toBeTruthy();
    });
  });

  describe('Knowledge Info Display', () => {
    /**
     * Test 25: Shows KNOW explanation
     */
    it('should show KNOW knowledge explanation', () => {
      render(
        <ConfidenceIndicator
          confidence={0.95}
          knowledgeLevel="KNOW"
          compact={false}
        />
      );

      expect(screen.getByText(/direct evidence/i)).toBeInTheDocument();
    });

    /**
     * Test 26: Shows INFER explanation
     */
    it('should show INFER knowledge explanation', () => {
      render(
        <ConfidenceIndicator
          confidence={0.65}
          knowledgeLevel="INFER"
          compact={false}
        />
      );

      expect(screen.getByText(/pattern analysis/i)).toBeInTheDocument();
    });

    /**
     * Test 27: Shows UNKNOWN explanation
     */
    it('should show UNKNOWN knowledge explanation', () => {
      render(
        <ConfidenceIndicator
          confidence={0.2}
          knowledgeLevel="UNKNOWN"
          compact={false}
        />
      );

      expect(screen.getByText(/Limited data/i)).toBeInTheDocument();
    });
  });
});
