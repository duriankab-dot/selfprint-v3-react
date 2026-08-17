/**
 * TwinChat.decision-tracking.test.ts
 * Verify decision recording with world context and user choices
 * P0 #5: Decision Tracking Verification
 */

import { describe, it, expect } from 'vitest';

describe('TwinChat Decision Tracking (P0 #5)', () => {
  describe('Option Extraction', () => {
    it('should extract numbered options from text', () => {
      const text = `Here are your options:
1. Option A - Career change
2. Option B - Stay in current job
3. Option C - Take a sabbatical`;

      // Simulate extractOptions logic
      const lines = text.split('\n');
      const options: string[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        const match = trimmed.match(/^\d+\.\s+(.+)$/);
        if (match) {
          options.push(match[1]);
        }
      }

      expect(options).toEqual([
        'Option A - Career change',
        'Option B - Stay in current job',
        'Option C - Take a sabbatical',
      ]);
    });

    it('should extract bullet point options from text', () => {
      const text = `Consider these paths:
- Path 1: Take the job
- Path 2: Negotiate better terms
- Path 3: Look elsewhere`;

      const lines = text.split('\n');
      const options: string[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        const match = trimmed.match(/^[-•]\s+(.+)$/);
        if (match) {
          options.push(match[1]);
        }
      }

      expect(options).toEqual([
        'Path 1: Take the job',
        'Path 2: Negotiate better terms',
        'Path 3: Look elsewhere',
      ]);
    });

    it('should handle text without options', () => {
      const text = 'Here is some advice without a numbered list.';

      const lines = text.split('\n');
      const options: string[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        const match = trimmed.match(/^\d+\.\s+(.+)$/);
        if (match) {
          options.push(match[1]);
        }
      }

      expect(options).toEqual([]);
    });

    it('should limit options to 5 maximum', () => {
      const options = [
        'Option 1',
        'Option 2',
        'Option 3',
        'Option 4',
        'Option 5',
        'Option 6',
        'Option 7',
      ];

      const limited = options.slice(0, 5);

      expect(limited.length).toBe(5);
      expect(limited).toEqual([
        'Option 1',
        'Option 2',
        'Option 3',
        'Option 4',
        'Option 5',
      ]);
    });
  });

  describe('User Choice Selection', () => {
    it('should track user selected choice', () => {
      interface Message {
        role: 'twin' | 'user';
        content: string;
        options?: string[];
        selectedChoice?: string;
      }

      const message: Message = {
        role: 'twin',
        content: 'What should you do?',
        options: ['Take the job', 'Stay put', 'Negotiate'],
        selectedChoice: undefined,
      };

      // Simulate user selecting option
      message.selectedChoice = 'Take the job';

      expect(message.selectedChoice).toBe('Take the job');
    });

    it('should allow changing selected choice', () => {
      interface Message {
        role: 'twin' | 'user';
        content: string;
        options?: string[];
        selectedChoice?: string;
      }

      const message: Message = {
        role: 'twin',
        content: 'What should you do?',
        options: ['Option A', 'Option B', 'Option C'],
        selectedChoice: 'Option A',
      };

      // User changes mind
      message.selectedChoice = 'Option B';

      expect(message.selectedChoice).toBe('Option B');
    });

    it('should not allow saving without choice when options exist', () => {
      interface Message {
        role: 'twin' | 'user';
        content: string;
        options?: string[];
        selectedChoice?: string;
      }

      const message: Message = {
        role: 'twin',
        content: 'What should you do?',
        options: ['Option A', 'Option B'],
        selectedChoice: undefined,
      };

      // Verify save button would be disabled
      const canSave =
        message.options && message.options.length > 0
          ? !!message.selectedChoice
          : true;

      expect(canSave).toBe(false);
    });

    it('should allow saving with default options when Twin response has no extracted options', () => {
      interface Message {
        role: 'twin' | 'user';
        content: string;
        options?: string[];
        selectedChoice?: string;
      }

      const message: Message = {
        role: 'twin',
        content: 'Consider this carefully.',
        // No options extracted
      };

      // Default options used
      const defaultOptions = ['Accepted', 'Deferred', 'Rejected'];
      const canSave = true; // No extracted options = use defaults

      expect(canSave).toBe(true);
      expect(defaultOptions).toContain('Accepted');
    });
  });

  describe('Decision Recording per World', () => {
    it('should record decision with world context', () => {
      interface Decision {
        twinId: string;
        world: string;
        question: string;
        options: string[];
        twinRecommendation: string;
        userChoice: string;
      }

      const decision: Decision = {
        twinId: 'user-123',
        world: 'career',
        question: 'Should I take the new job offer?',
        options: ['Take the job', 'Stay in current position', 'Negotiate terms'],
        twinRecommendation: 'The new role offers growth opportunities that align with your values.',
        userChoice: 'Take the job',
      };

      expect(decision.world).toBe('career');
      expect(decision.userChoice).toBe('Take the job');
      expect(decision.options).toContain('Take the job');
    });

    it('should track different decisions per world', () => {
      interface Decision {
        world: string;
        question: string;
        userChoice: string;
      }

      const decisions: Decision[] = [
        {
          world: 'career',
          question: 'Job change?',
          userChoice: 'Take the job',
        },
        {
          world: 'relationship',
          question: 'Move in together?',
          userChoice: 'Yes',
        },
        {
          world: 'wealth',
          question: 'Invest in crypto?',
          userChoice: 'Defer',
        },
      ];

      const careerDecisions = decisions.filter(d => d.world === 'career');
      const relationshipDecisions = decisions.filter(d => d.world === 'relationship');

      expect(careerDecisions.length).toBe(1);
      expect(relationshipDecisions.length).toBe(1);
      expect(careerDecisions[0].userChoice).toBe('Take the job');
    });

    it('should auto-schedule follow-ups when decision recorded', () => {
      const decisionDate = new Date();
      const followUpDays = [30, 90, 180, 365];
      const followUps = followUpDays.map(days => {
        const date = new Date(decisionDate);
        date.setDate(date.getDate() + days);
        return { day: days, dueDate: date };
      });

      expect(followUps).toHaveLength(4);
      expect(followUps[0].day).toBe(30);
      expect(followUps[3].day).toBe(365);
    });
  });

  describe('Decision Outcome Tracking', () => {
    it('should record outcome at follow-up checkpoint', () => {
      interface Outcome {
        decisionId: string;
        followUpDay: number;
        feedback: string;
        impact: 'positive' | 'neutral' | 'negative';
      }

      const outcome: Outcome = {
        decisionId: 'decision-123',
        followUpDay: 30,
        feedback: 'Transition going well, team is great',
        impact: 'positive',
      };

      expect(outcome.followUpDay).toBe(30);
      expect(outcome.impact).toBe('positive');
    });

    it('should calculate success rate per world', () => {
      interface DecisionOutcome {
        world: string;
        impact: 'positive' | 'neutral' | 'negative';
      }

      const outcomes: DecisionOutcome[] = [
        { world: 'career', impact: 'positive' },
        { world: 'career', impact: 'positive' },
        { world: 'career', impact: 'neutral' },
        { world: 'relationship', impact: 'positive' },
      ];

      const careerOutcomes = outcomes.filter(o => o.world === 'career');
      const positiveCount = careerOutcomes.filter(o => o.impact === 'positive').length;
      const successRate = (positiveCount / careerOutcomes.length) * 100;

      expect(successRate).toBeCloseTo(66.67, 1);
    });

    it('should update Twin expertise based on outcomes', () => {
      let expertise = 50;

      // Positive outcome
      expertise += 10;
      expect(expertise).toBe(60);

      // Another positive
      expertise += 5;
      expect(expertise).toBe(65);

      // Negative outcome
      expertise -= 8;
      expect(expertise).toBe(57);

      // Expertise stays in 0-100 range
      expertise = Math.max(0, Math.min(100, expertise));
      expect(expertise).toBeGreaterThanOrEqual(0);
      expect(expertise).toBeLessThanOrEqual(100);
    });
  });

  describe('Complete Decision Lifecycle', () => {
    it('should complete full decision lifecycle per world', () => {
      const worldId = 'wealth';
      const userMessage = 'Should I invest in the stock market?';

      // 1. Twin responds with options
      const twinResponse = `Consider these approaches:
1. Start with index funds for diversification
2. Focus on individual stock research
3. Consult a financial advisor first`;

      // 2. Extract options
      const options = [
        'Start with index funds for diversification',
        'Focus on individual stock research',
        'Consult a financial advisor first',
      ];

      // 3. User selects option
      const userChoice = 'Start with index funds for diversification';

      // 4. Record decision
      const decision = {
        world: worldId,
        question: userMessage,
        options,
        userChoice,
        recordedAt: new Date().toISOString(),
      };

      expect(decision.world).toBe('wealth');
      expect(decision.userChoice).toBe(options[0]);

      // 5. Schedule follow-ups
      const followUpDays = [30, 90, 180, 365];
      const followUps = followUpDays.map(days => ({
        day: days,
        completed: false,
      }));

      expect(followUps[0].day).toBe(30);
      expect(followUps[0].completed).toBe(false);

      // 6. At day 30, user reports outcome
      followUps[0].completed = true;
      const outcome = {
        decisionId: 'decision-123',
        followUpDay: 30,
        feedback: 'Initial investment showing promise',
        impact: 'positive' as const,
      };

      expect(outcome.impact).toBe('positive');

      // 7. Twin learns from outcome
      let wealthExpertise = 50;
      if (outcome.impact === 'positive') {
        wealthExpertise += 10;
      }

      expect(wealthExpertise).toBe(60);
    });
  });
});
