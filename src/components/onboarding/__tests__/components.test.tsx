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
import { LanguageProvider } from '@/context/LanguageContext';
import { InitialBlueprint } from '../InitialBlueprint';
import { FinetuningQuestions } from '../FinetuningQuestions';
import { FullAnalysis } from '../FullAnalysis';

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <LanguageProvider>
        <EmotionProvider>
          {component}
        </EmotionProvider>
      </LanguageProvider>
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

    // QA-02: the speaker label in the UI was renamed from "Nova:" to
    // "SELFPRINT:" (InitialBlueprint.tsx:308) — Nova is only the internal
    // implementation name now.
    expect(screen.getByText('SELFPRINT:')).toBeInTheDocument();
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

  // QA-02: FullAnalysis was rebuilt as the "WOW2 revelation" flow. It now opens
  // on a 2.5s scanning phase and only then staggers the result cards in, one
  // every 420ms (FullAnalysis.tsx:42-43, 62-101). Nothing these tests looked
  // for exists on the first synchronous paint, so every assertion below has to
  // wait for its slot. Slot 6 (accuracy badge, closing message, CTA) lands
  // around 2.5s + 6*0.42s ≈ 5s, hence the explicit timeouts.
  const REVEAL_TIMEOUT = { timeout: 10000 };

  it('should render with 85%+ accuracy', async () => {
    renderWithProviders(
      <FullAnalysis
        profile={mockProfile}
        accuracy={85}
        onHome={vi.fn()}
      />
    );

    expect(await screen.findByText('85%', {}, REVEAL_TIMEOUT)).toBeInTheDocument();
  });

  it('should display all analysis sections', async () => {
    renderWithProviders(
      <FullAnalysis
        profile={mockProfile}
        accuracy={85}
        onHome={vi.fn()}
      />
    );

    expect(await screen.findByText(/รูปแบบการตัดสินใจ/, {}, REVEAL_TIMEOUT)).toBeInTheDocument();
    expect(await screen.findByText(/จุดแข็งของคุณ/, {}, REVEAL_TIMEOUT)).toBeInTheDocument();
    // QA-02: the insights card header is now "ข้อมูลเชิงลึก" — the trailing
    // "สำคัญ" was dropped (FullAnalysis.tsx:284).
    expect(await screen.findByText(/ข้อมูลเชิงลึก/, {}, REVEAL_TIMEOUT)).toBeInTheDocument();
    expect(await screen.findByText(/โอกาสในการเติบโต/, {}, REVEAL_TIMEOUT)).toBeInTheDocument();
  });

  it('should display correct number of strengths', async () => {
    renderWithProviders(
      <FullAnalysis
        profile={mockProfile}
        accuracy={85}
        onHome={vi.fn()}
      />
    );

    await screen.findByText(/จุดแข็งของคุณ/, {}, REVEAL_TIMEOUT);
    const strengthElements = screen.queryAllByText(/มองการณ์ไกล|ใส่ใจรายละเอียด|มีเหตุผล|ผู้นำ/);
    expect(strengthElements.length).toBeGreaterThanOrEqual(4);
  });

  // QA-02: the old 'should use green color meter for 90%+' test was removed.
  // The accuracy meter it inspected — an inline-hex progress bar whose colour
  // switched at 90% (#66BB6A) / 85% (#FFD54F) — no longer exists. The rebuilt
  // component renders a circular badge coloured entirely from CSS custom
  // properties (var(--accent-primary), FullAnalysis.tsx:340-357), so there is
  // no per-threshold colour left to assert.

  it('should call onHome when the CTA button is clicked', async () => {
    const onHome = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <FullAnalysis
        profile={mockProfile}
        accuracy={85}
        onHome={onHome}
      />
    );

    // QA-02: the final CTA is no longer labelled "แดชบอร์ด" — it reads
    // "ตื่น Twin ของฉัน →" (FullAnalysis.tsx:401).
    const homeBtn = await screen.findByRole('button', { name: /ตื่น Twin ของฉัน/ }, REVEAL_TIMEOUT);
    await user.click(homeBtn);

    expect(onHome).toHaveBeenCalled();
  });

  it('should have a closing message and accuracy caption', async () => {
    renderWithProviders(
      <FullAnalysis
        profile={mockProfile}
        accuracy={85}
        onHome={vi.fn()}
      />
    );

    // QA-02: speaker label renamed "Nova:" → "SELFPRINT:"
    // (FullAnalysis.tsx:379) and the caption copy is now
    // "ความแม่นยำ 85% จาก 12 SICE Engines" (FullAnalysis.tsx:363-365),
    // not "ระดับความชัดเจน 85%".
    expect(await screen.findByText('SELFPRINT:', {}, REVEAL_TIMEOUT)).toBeInTheDocument();
    expect(
      await screen.findByText(/ความแม่นยำ 85% จาก 12 SICE Engines/, {}, REVEAL_TIMEOUT)
    ).toBeInTheDocument();
  });
});

describe('Component Integration', () => {
  it('should pass data through accuracy progression', async () => {
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

    // QA-02: this rerender dropped the LanguageProvider that renderWithProviders
    // supplies, and FullAnalysis calls useLanguage() (FullAnalysis.tsx:52), so it
    // threw "useLanguage must be used within LanguageProvider". It also has to
    // wait for the reveal phase (see the note in the FullAnalysis block above).
    rerender(
      <BrowserRouter>
        <LanguageProvider>
          <EmotionProvider>
            <FullAnalysis
              profile={{ ...profile, insights: [], opportunities: [] }}
              accuracy={85}
              onHome={vi.fn()}
            />
          </EmotionProvider>
        </LanguageProvider>
      </BrowserRouter>
    );

    // Decision style lands in reveal slot 1, the accuracy badge in slot 6 —
    // await each one separately rather than assuming they paint together.
    expect(await screen.findByText('เชิงกลยุทธ์', {}, { timeout: 10000 })).toBeInTheDocument();
    expect(await screen.findByText('85%', {}, { timeout: 10000 })).toBeInTheDocument();
  });
});
