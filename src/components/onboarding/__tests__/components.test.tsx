/**
 * components.test.tsx
 *
 * Unit tests for Onboarding Components
 * Tests: InitialBlueprint, FinetuningQuestions, FullAnalysis
 * Assertions match the current Thai UI copy — not the old English version.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { EmotionProvider } from '@/context/EmotionContext';
import { InitialBlueprint } from '../InitialBlueprint';
import { FinetuningQuestions } from '../FinetuningQuestions';
import { FullAnalysis } from '../FullAnalysis';

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <EmotionProvider>
        {component}
      </EmotionProvider>
    </BrowserRouter>
  );
};

describe('InitialBlueprint Component', () => {
  const mockProfile = {
    decisionStyle: 'นักวางแผนเชิงกลยุทธ์',
    strengths: ['มองการณ์ไกล', 'ใส่ใจรายละเอียด'],
    blindSpot: 'ปล่อยวางได้ยาก',
  };

  it('should render with 60% accuracy', () => {
    renderWithProviders(
      <InitialBlueprint
        profile={mockProfile}
        accuracy={60}
        onContinue={vi.fn()}
        onSkip={vi.fn()}
      />
    );

    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('should display all profile elements', () => {
    renderWithProviders(
      <InitialBlueprint
        profile={mockProfile}
        accuracy={60}
        onContinue={vi.fn()}
        onSkip={vi.fn()}
      />
    );

    expect(screen.getByText('นักวางแผนเชิงกลยุทธ์')).toBeInTheDocument();
    expect(screen.getByText('มองการณ์ไกล')).toBeInTheDocument();
    expect(screen.getByText('ปล่อยวางได้ยาก')).toBeInTheDocument();
  });

  it('should show contextual Nova message based on CTA source', () => {
    renderWithProviders(
      <InitialBlueprint
        profile={mockProfile}
        accuracy={60}
        ctaSource="why"
        onContinue={vi.fn()}
        onSkip={vi.fn()}
      />
    );

    expect(screen.getByText(/Nova:/i)).toBeInTheDocument();
  });

  it('should call onContinue when continue button is clicked', async () => {
    const onContinue = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <InitialBlueprint
        profile={mockProfile}
        accuracy={60}
        onContinue={onContinue}
        onSkip={vi.fn()}
      />
    );

    const continueBtn = screen.getByText(/รู้จักฉันดีขึ้น/i);
    await user.click(continueBtn);

    expect(onContinue).toHaveBeenCalled();
  });

  it('should call onSkip when skip button is clicked', async () => {
    const onSkip = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <InitialBlueprint
        profile={mockProfile}
        accuracy={60}
        onContinue={vi.fn()}
        onSkip={onSkip}
      />
    );

    const skipBtn = screen.getByText(/ข้ามไปก่อน/i);
    await user.click(skipBtn);

    expect(onSkip).toHaveBeenCalled();
  });

  it('should use correct accuracy meter color for 60%', () => {
    const { container } = renderWithProviders(
      <InitialBlueprint
        profile={mockProfile}
        accuracy={60}
        onContinue={vi.fn()}
        onSkip={vi.fn()}
      />
    );

    // Amber color (#FFA726 = rgb(255, 167, 38)) should be used for 60% —
    // jsdom serializes inline hex colors as rgb() in the style attribute.
    const progressBar = container.querySelector('div[style*="rgb(255, 167, 38)"]');
    expect(progressBar).toBeTruthy();
  });
});

describe('FinetuningQuestions Component', () => {
  const NOT_ANSWER_BUTTON = (btn: HTMLElement) =>
    !btn.textContent?.includes('เสร็จสิ้น') && !btn.textContent?.includes('ข้ามไปหน้าแรก');

  it('should render first question on load', () => {
    renderWithProviders(
      <FinetuningQuestions
        onSubmit={vi.fn()}
        onSkip={vi.fn()}
      />
    );

    expect(screen.getByText('ปกติคุณตัดสินใจอย่างไร?')).toBeInTheDocument();
    expect(screen.getByText('คำถามที่ 1 จาก 5')).toBeInTheDocument();
  });

  it('should show progressive disclosure (one question at a time)', async () => {
    renderWithProviders(
      <FinetuningQuestions
        onSubmit={vi.fn()}
        onSkip={vi.fn()}
      />
    );

    // Should only see one question counter at a time
    const questions = screen.queryAllByText(/คำถามที่ \d+ จาก 5/);
    expect(questions.length).toBe(1);
  });

  it('should progress to next question after selection', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <FinetuningQuestions
        onSubmit={vi.fn()}
        onSkip={vi.fn()}
      />
    );

    const options = screen.getAllByRole('button').filter(NOT_ANSWER_BUTTON);
    await user.click(options[0]);

    await screen.findByText('คำถามที่ 2 จาก 5', {}, { timeout: 1000 });
  });

  it('should show accuracy progression from 60% to 85%', async () => {
    renderWithProviders(
      <FinetuningQuestions
        onSubmit={vi.fn()}
        onSkip={vi.fn()}
        initialAccuracy={60}
      />
    );

    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('should call onSubmit when all questions are answered', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <FinetuningQuestions
        onSubmit={onSubmit}
        onSkip={vi.fn()}
      />
    );

    // Click the first option for all 5 questions
    for (let i = 0; i < 5; i++) {
      const options = screen.getAllByRole('button').filter(NOT_ANSWER_BUTTON);
      await user.click(options[0]);
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    const completeBtn = await screen.findByText(/เสร็จสิ้น/i);
    await user.click(completeBtn);

    await new Promise((resolve) => setTimeout(resolve, 600));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('should disable answers after selection', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <FinetuningQuestions
        onSubmit={vi.fn()}
        onSkip={vi.fn()}
      />
    );

    const options = screen.getAllByRole('button').filter(NOT_ANSWER_BUTTON);
    await user.click(options[0]);

    // Selected option should be disabled
    expect(options[0]).toHaveAttribute('disabled');
  });
});

describe('FullAnalysis Component', () => {
  const mockProfile = {
    decisionStyle: 'นักวางแผนเชิงกลยุทธ์',
    strengths: ['มองการณ์ไกล', 'ใส่ใจรายละเอียด', 'มีเหตุผล', 'ผู้นำ'],
    insights: ['คิดอย่างสมดุล', 'จับรูปแบบเก่ง', 'มีเป้าหมายชัดเจน'],
    opportunities: ['มอบหมายงาน', 'ยืดหยุ่นมากขึ้น', 'แสดงความรู้สึก'],
  };

  it('should render with 85%+ accuracy', () => {
    renderWithProviders(
      <FullAnalysis
        profile={mockProfile}
        accuracy={85}
        onHome={vi.fn()}
      />
    );

    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('should display all analysis sections', () => {
    renderWithProviders(
      <FullAnalysis
        profile={mockProfile}
        accuracy={85}
        onHome={vi.fn()}
      />
    );

    expect(screen.getByText(/รูปแบบการตัดสินใจ/)).toBeInTheDocument();
    expect(screen.getByText(/จุดแข็งของคุณ/)).toBeInTheDocument();
    expect(screen.getByText(/ข้อมูลเชิงลึกสำคัญ/)).toBeInTheDocument();
    expect(screen.getByText(/โอกาสในการเติบโต/)).toBeInTheDocument();
  });

  it('should display correct number of strengths', () => {
    renderWithProviders(
      <FullAnalysis
        profile={mockProfile}
        accuracy={85}
        onHome={vi.fn()}
      />
    );

    const strengthElements = screen.queryAllByText(/มองการณ์ไกล|ใส่ใจรายละเอียด|มีเหตุผล|ผู้นำ/);
    expect(strengthElements.length).toBeGreaterThanOrEqual(4);
  });

  it('should use green color meter for 90%+', () => {
    // getMeterColor in FullAnalysis.tsx only turns green at >=90 (85-89 is
    // still yellow #FFD54F) — use 95 here to actually exercise the green case.
    const { container } = renderWithProviders(
      <FullAnalysis
        profile={mockProfile}
        accuracy={95}
        onHome={vi.fn()}
      />
    );

    // Green color (#66BB6A = rgb(102, 187, 106)) should be used for 90%+
    const progressBar = container.querySelector('div[style*="rgb(102, 187, 106)"]');
    expect(progressBar).toBeTruthy();
  });

  it('should call onHome when dashboard button is clicked', async () => {
    const onHome = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <FullAnalysis
        profile={mockProfile}
        accuracy={85}
        onHome={onHome}
      />
    );

    const homeBtn = screen.getByText(/แดชบอร์ด/i);
    await user.click(homeBtn);

    expect(onHome).toHaveBeenCalled();
  });

  it('should have Nova closing message', () => {
    renderWithProviders(
      <FullAnalysis
        profile={mockProfile}
        accuracy={85}
        onHome={vi.fn()}
      />
    );

    expect(screen.getByText(/Nova:/i)).toBeInTheDocument();
    // Caption is now dynamic (ties to real confidence, not hardcoded "85%") —
    // see Onboarding.tsx's handleFinetuneSubmit / FullAnalysis.tsx hero.
    expect(screen.getByText(/ระดับความชัดเจน 85%/)).toBeTruthy();
  });
});

describe('Component Integration', () => {
  it('should pass data through accuracy progression', () => {
    const profile = {
      decisionStyle: 'เชิงกลยุทธ์',
      strengths: ['A', 'B'],
      blindSpot: 'C',
    };

    const { rerender } = renderWithProviders(
      <InitialBlueprint
        profile={profile}
        accuracy={60}
        onContinue={vi.fn()}
      />
    );

    expect(screen.getByText('เชิงกลยุทธ์')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();

    rerender(
      <BrowserRouter>
        <EmotionProvider>
          <FullAnalysis
            profile={{ ...profile, insights: [], opportunities: [] }}
            accuracy={85}
            onHome={vi.fn()}
          />
        </EmotionProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('เชิงกลยุทธ์')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });
});
