/**
 * Unit Tests for ContextDisplay Component
 * Tests context rendering, section expansion, confidence display
 * @module components/intelligence/__tests__/ContextDisplay.test
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContextDisplay from './ContextDisplay';
import {
  PersonalContext,
  BehavioralPattern,
  Value,
  Goal,
  BlindSpot,
} from '@/lib/intelligence/types';

describe('ContextDisplay Component', () => {
  const mockContext: PersonalContext = {
    userId: 'user-123',
    values: [
      {
        id: 'val-1',
        name: 'Integrity',
        confidence: 0.85,
        evidence: ['ref-1', 'ref-2'],
        inferredFromSources: [],
        inferred: false,
      },
    ],
    goals: [
      {
        id: 'goal-1',
        title: 'Career Growth',
        confidence: 0.75,
        evidence: ['ref-3'],
        inferredFromSources: [],
      },
    ],
    strengths: [],
    blindSpots: [
      {
        id: 'bs-1',
        title: 'Perfectionism',
        confidence: 0.65,
        evidence: ['ref-4'],
        inferredFromSources: [],
        sensitivityLevel: 'medium',
      },
    ],
    emotionalRange: {
      primaryMoods: ['thoughtful', 'driven'],
      volatility: 0.3,
      responseToStress: 'analytical',
      emotionalTriggers: [],
      confidence: 0.7,
    },
    decisionStyle: {
      type: 'analytical',
      description: 'Tends to analyze options thoroughly',
      confidence: 0.8,
      evidence: [],
    },
    relationships: [],
    lastUpdated: new Date(),
    modelVersion: 1,
    confidenceOverall: 0.75,
    sourceCount: 5,
  };

  const mockPatterns: BehavioralPattern[] = [
    {
      id: 'pat-1',
      userId: 'user-123',
      patternName: 'Analysis Paralysis',
      patternType: 'repeating',
      evidencePoints: [
        { date: new Date(), source: 'reflection', sourceId: 'ref-1', excerpt: 'test' },
      ],
      frequency: 'weekly',
      lastDetected: new Date(),
      confidence: 0.8,
      description: 'Tendency to over-analyze decisions',
      aiInsight: 'This pattern affects decision velocity',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  describe('Rendering', () => {
    /**
     * Test 1: Component renders full context
     */
    it('should render full context display', () => {
      render(
        <ContextDisplay context={mockContext} patterns={mockPatterns} />
      );

      expect(screen.getByText('Your Personal Model')).toBeInTheDocument();
      expect(screen.getByText('Values')).toBeInTheDocument();
      expect(screen.getByText('Goals')).toBeInTheDocument();
      expect(screen.getByText('Blind Spots')).toBeInTheDocument();
    });

    /**
     * Test 2: Renders compact view
     */
    it('should render compact view when requested', () => {
      render(
        <ContextDisplay context={mockContext} compact={true} />
      );

      expect(screen.getByText(/Values/i)).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument(); // values count
    });

    /**
     * Test 3: Displays values with confidence
     */
    it('should display values with confidence indicators', () => {
      render(
        <ContextDisplay context={mockContext} expandedSection="values" />
      );

      expect(screen.getByText('Integrity')).toBeInTheDocument();
      expect(screen.getByText('2 evidence')).toBeInTheDocument();
    });
  });

  describe('Section Expansion', () => {
    /**
     * Test 4: Allows toggling section expansion
     */
    it('should toggle section expansion on click', () => {
      render(
        <ContextDisplay context={mockContext} expandedSection="all" />
      );

      const valueButton = screen.getByText('Values').closest('button');
      if (!valueButton) throw new Error('Button not found');

      fireEvent.click(valueButton);

      // After click, section should collapse
      expect(screen.queryByText('Integrity')).not.toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    /**
     * Test 5: Shows behavioral patterns correctly
     */
    it('should display behavioral patterns', () => {
      render(
        <ContextDisplay
          context={mockContext}
          patterns={mockPatterns}
          expandedSection="all"
        />
      );

      expect(screen.getByText('Analysis Paralysis')).toBeInTheDocument();
      expect(screen.getByText(/tendency to over-analyze/i)).toBeInTheDocument();
    });

    /**
     * Test 6: Shows decision style
     */
    it('should display decision style', () => {
      render(
        <ContextDisplay context={mockContext} expandedSection="all" />
      );

      expect(screen.getByText('Decision Style')).toBeInTheDocument();
      expect(screen.getByText(/analytical/i)).toBeInTheDocument();
    });

    /**
     * Test 7: Shows source count and confidence
     */
    it('should display source count and overall confidence', () => {
      render(
        <ContextDisplay context={mockContext} />
      );

      expect(screen.getByText('Data Points:')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument(); // overall confidence
    });
  });

  describe('Master Direction Compliance', () => {
    /**
     * Test 8: Shows Master Direction message
     */
    it('should display Master Direction notice', () => {
      render(
        <ContextDisplay context={mockContext} />
      );

      expect(screen.getByText(/Master Direction/i)).toBeInTheDocument();
      expect(screen.getByText(/built from actual data/i)).toBeInTheDocument();
    });
  });
});
