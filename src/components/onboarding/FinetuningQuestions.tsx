/**
 * FinetuningQuestions.tsx
 *
 * Fine-tuning Flow (60% → 85% accuracy)
 * MEMO V4: Progressive disclosure - one question at a time
 *
 * Features:
 * - Conversational flow with Nova guidance
 * - One question per screen (progressive disclosure)
 * - Real-time accuracy improvement visualization (60%→85%)
 * - Mood-aware styling
 * - Context-aware messaging
 */

import { useState } from 'react';

interface Question {
  id: string;
  text: string;
  novaContext: string; // What Nova says before this question
  options: string[];
}

interface FinetuningQuestionsProps {
  onSubmit: (answers: Record<string, string>) => void | Promise<void>;
  onSkip: () => void;
  initialAccuracy?: number;
}

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'ปกติคุณตัดสินใจอย่างไร?',
    novaContext: 'มาเจาะลึกรูปแบบการตัดสินใจของคุณกัน',
    options: ['ใช้สัญชาตญาณ', 'ใช้เหตุผล', 'ใช้ความรู้สึก', 'สมดุลทั้งสองอย่าง'],
  },
  {
    id: 'q2',
    text: 'อะไรทำให้คุณมีพลังมากที่สุดในการทำงาน?',
    novaContext: 'อยากรู้ว่าอะไรเป็นแรงขับเคลื่อนของคุณ',
    options: ['ผู้คน', 'ไอเดีย', 'ธรรมชาติ', 'ความสำเร็จ'],
  },
  {
    id: 'q3',
    text: 'สภาพแวดล้อมการทำงานในอุดมคติของคุณคือแบบไหน?',
    novaContext: 'คุณทำงานได้ดีที่สุดที่ไหน?',
    options: ['มีระบบชัดเจน', 'ยืดหยุ่น', 'ทำงานร่วมกับผู้อื่น', 'ทำงานคนเดียว'],
  },
  {
    id: 'q4',
    text: 'คุณรับมือกับความเครียดอย่างไร?',
    novaContext: 'คุณฟื้นตัวกลับมาได้อย่างไร?',
    options: ['ลงมือทำ', 'ทบทวนตัวเอง', 'พูดคุยกับคนอื่น', 'พักผ่อน'],
  },
  {
    // คำถามนี้ตรงกับ Q3 ของแบบทดสอบจริงใน astrovera-v2 (index.html #q3) —
    // ใช้คำถาม+ตัวเลือกเดียวกันเพื่อให้ answerToPhaseKey() ใน
    // astrovera-adapter.ts map คำตอบกลับเป็น phaseKey ('a'|'b'|'c'|'d') ได้
    // ตรงกับความหมายจริงที่ Astrovera Psychology module คาดหวัง แทนที่จะเดา
    // จาก mood (ดู docs/HANDOFF_2026-08-09_PHASE5_UNIFIED.md)
    id: 'q5',
    text: 'ในช่วงชีวิตตอนนี้ คุณรู้สึกอย่างไร?',
    novaContext: 'ข้อสุดท้าย — คำถามนี้ช่วยให้ Nova เข้าใจจังหวะชีวิตตอนนี้ของคุณ',
    options: [
      'กำลังสร้างและเริ่มต้นสิ่งใหม่',
      'ขยายและพัฒนาสิ่งที่มีอยู่',
      'ต้องการพักและปรับทิศทาง',
      'อยู่ในช่วงเปลี่ยนแปลงครั้งใหญ่',
    ],
  },
];

const getAccuracyForProgress = (answered: number, baseAccuracy: number): number => {
  // baseAccuracy% → baseAccuracy+25% progression as questions are answered
  return baseAccuracy + (answered * 25) / QUESTIONS.length;
};

const getAccuracyColor = (value: number): string => {
  if (value < 75) return '#FFA726'; // Amber 60-75%
  if (value < 90) return '#FFD54F'; // Yellow 75-90%
  return '#66BB6A'; // Green 85%+
};

export function FinetuningQuestions({
  onSubmit,
  onSkip,
  initialAccuracy = 60,
}: FinetuningQuestionsProps) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answered, setAnswered] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const currentQuestion = QUESTIONS[currentQuestionIdx];
  const accuracy = getAccuracyForProgress(answered, initialAccuracy);
  const isLastQuestion = currentQuestionIdx === QUESTIONS.length - 1;
  const allAnswered = answered === QUESTIONS.length;

  const handleAnswer = (option: string) => {
    if (answers[currentQuestion.id]) return; // Already answered this question

    const newAnswers = { ...answers, [currentQuestion.id]: option };
    setAnswers(newAnswers);
    setAnswered((prev) => prev + 1);

    // Auto-progress to next question after brief delay
    if (!isLastQuestion) {
      setTimeout(() => {
        setCurrentQuestionIdx((prev) => prev + 1);
      }, 300);
    }
  };

  const handleComplete = () => {
    setIsCompleting(true);
    setTimeout(() => {
      onSubmit(answers);
    }, 500);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, var(--accent-light, var(--color-bg-secondary)) 0%, var(--color-bg-primary) 100%)`,
        padding: '48px 24px',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          width: '100%',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 700,
              marginBottom: '12px',
              color: 'var(--color-text-primary)',
              textAlign: 'center',
            }}
          >
            ปรับแต่ง Twin ของคุณ 🎯
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              textAlign: 'center',
              margin: 0,
            }}
          >
            {QUESTIONS.length} คำถามเพื่อไปถึงความแม่นยำ 85%
          </p>
        </div>

        {/* Accuracy Meter */}
        <div style={{ marginBottom: '48px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
              }}
            >
              ความชัดเจน
            </span>
            <span
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: getAccuracyColor(accuracy),
              }}
            >
              {Math.round(accuracy)}%
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '10px',
              background: 'var(--color-bg-tertiary)',
              borderRadius: '5px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${accuracy}%`,
                height: '100%',
                background: getAccuracyColor(accuracy),
                transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: '5px',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '16px',
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
            }}
          >
            <span>60% (เริ่มต้น)</span>
            <span style={{ marginLeft: 'auto' }}>85% (เป้าหมาย)</span>
          </div>
        </div>

        {/* Question Card */}
        <div
          style={{
            background: 'var(--color-bg-secondary)',
            borderRadius: '12px',
            padding: '32px',
            border: '2px solid var(--accent-light)',
            marginBottom: '32px',
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            opacity: isCompleting ? 0.5 : 1,
            transition: 'opacity 0.3s',
          }}
        >
          {/* Nova Context */}
          <div
            style={{
              background: 'var(--accent-light)',
              borderLeft: `4px solid var(--accent-primary)`,
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px',
            }}
          >
            <p
              style={{
                fontSize: '13px',
                color: 'var(--color-text-primary)',
                margin: 0,
                fontStyle: 'italic',
                lineHeight: 1.4,
              }}
            >
              <span style={{ fontWeight: 600 }}>Nova:</span> {currentQuestion.novaContext}
            </p>
          </div>

          {/* Question */}
          <div style={{ marginBottom: '24px' }}>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                margin: '0 0 16px 0',
                lineHeight: 1.4,
              }}
            >
              {currentQuestion.text}
            </h3>
            <p
              style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                margin: 0,
              }}
            >
              คำถามที่ {currentQuestionIdx + 1} จาก {QUESTIONS.length}
            </p>
          </div>

          {/* Options */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={!!answers[currentQuestion.id] || isCompleting}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '2px solid var(--color-border)',
                  background:
                    answers[currentQuestion.id] === option
                      ? 'var(--accent-primary)'
                      : 'transparent',
                  color:
                    answers[currentQuestion.id] === option
                      ? 'white'
                      : 'var(--color-text-primary)',
                  fontWeight:
                    answers[currentQuestion.id] === option ? 600 : 500,
                  fontSize: '14px',
                  cursor: answers[currentQuestion.id] ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: answers[currentQuestion.id] && answers[currentQuestion.id] !== option ? 0.3 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!answers[currentQuestion.id] && !isCompleting) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      'var(--accent-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!answers[currentQuestion.id]) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      'var(--color-border)';
                  }
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Dots */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            marginBottom: '32px',
          }}
        >
          {QUESTIONS.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background:
                  idx < answered
                    ? 'var(--accent-primary)'
                    : idx === currentQuestionIdx
                    ? 'var(--color-border)'
                    : 'var(--color-bg-tertiary)',
                transition: 'all 0.3s',
                opacity: idx <= currentQuestionIdx ? 1 : 0.4,
              }}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexDirection: 'column',
          }}
        >
          {allAnswered && (
            <button
              onClick={handleComplete}
              disabled={isCompleting}
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--accent-primary)',
                color: 'white',
                fontWeight: 600,
                fontSize: '16px',
                cursor: isCompleting ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                opacity: isCompleting ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isCompleting)
                  (e.currentTarget as HTMLButtonElement).style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                if (!isCompleting)
                  (e.currentTarget as HTMLButtonElement).style.opacity = '1';
              }}
            >
              {isCompleting ? '✓ กำลังอัปเดต...' : '✓ เสร็จสิ้น (ความแม่นยำ 85%)'}
            </button>
          )}
          {/* Skip is always visible — users should never be forced through questions */}
          <button
            onClick={onSkip}
            disabled={isCompleting}
            style={{
              width: '100%',
              padding: '12px 24px',
              borderRadius: '8px',
              border: '2px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              fontWeight: 500,
              fontSize: '14px',
              cursor: isCompleting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              opacity: isCompleting ? 0.5 : 0.7,
            }}
            onMouseEnter={(e) => {
              if (!isCompleting) (e.currentTarget as HTMLButtonElement).style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              if (!isCompleting) (e.currentTarget as HTMLButtonElement).style.opacity = '0.7';
            }}
          >
            ข้ามไปก่อน (ความแม่นยำ {Math.round(accuracy)}%)
          </button>
        </div>
      </div>
    </div>
  );
}