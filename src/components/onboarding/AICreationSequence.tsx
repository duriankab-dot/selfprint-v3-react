/**
 * AICreationSequence.tsx
 *
 * "AI Twin Birth" Animation
 * 2-3 second visual sequence replacing loading spinner
 * MEMO V4: Shows AI creation in progress with personality
 *
 * Stages:
 * 1. "Analyzing your birth..." (0-1 sec)
 * 2. "Creating your AI Twin..." (1-2 sec)
 * 3. "Connecting personality..." (2-3 sec)
 */

import { useState, useEffect } from 'react';

interface AICreationSequenceProps {
  onComplete: () => void;
  className?: string;
}

type CreationStage = 0 | 1 | 2;

const STAGE_TIMINGS = {
  0: { text: 'กำลังวิเคราะห์วันเกิดของคุณ...', duration: 1000 },
  1: { text: 'กำลังสร้าง AI Twin ของคุณ...', duration: 1000 },
  2: { text: 'กำลังเชื่อมต่อบุคลิกภาพ...', duration: 1000 },
};

export const AICreationSequence: React.FC<AICreationSequenceProps> = ({
  onComplete,
  className = '',
}) => {
  const [stage, setStage] = useState<CreationStage>(0);
  const [isComplete, setIsComplete] = useState(false);

  // Progress through stages
  useEffect(() => {
    if (stage === 2) {
      const timer = setTimeout(() => {
        setIsComplete(true);
        setTimeout(onComplete, 500); // Brief delay after completion
      }, STAGE_TIMINGS[2].duration);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setStage((prev) => (prev + 1) as CreationStage);
    }, STAGE_TIMINGS[stage].duration);

    return () => clearTimeout(timer);
  }, [stage, onComplete]);

  const getIcon = (): string => {
    switch (stage) {
      case 0:
        return '🔍'; // Analyzing
      case 1:
        return '✨'; // Creating
      case 2:
        return '🧠'; // Connecting
      default:
        return '🤖';
    }
  };

  return (
    <div
      className={`ai-creation-sequence ${className}`}
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
          textAlign: 'center',
          maxWidth: '500px',
        }}
      >
        {/* Animated Icon */}
        <div
          style={{
            fontSize: '120px',
            marginBottom: '32px',
            animation: `pulse-creation 1s ease-in-out infinite`,
            animationDelay: `var(--mood-animation-delay, 0ms)`,
          }}
        >
          {getIcon()}
        </div>

        {/* Animated Particles Background */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '300px',
            height: '300px',
            zIndex: -1,
            opacity: 0.1,
          }}
        >
          {/* Particle circles that appear based on stage */}
          {stage >= 0 && (
            <div
              style={{
                position: 'absolute',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: '2px solid var(--accent-primary)',
                animation: `orbit-stage0 2s linear infinite`,
              }}
            />
          )}
          {stage >= 1 && (
            <div
              style={{
                position: 'absolute',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '2px solid var(--accent-secondary)',
                animation: `orbit-stage1 2s linear infinite reverse`,
              }}
            />
          )}
          {stage >= 2 && (
            <div
              style={{
                position: 'absolute',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                border: '2px solid var(--accent-light)',
                animation: `orbit-stage2 3s linear infinite`,
              }}
            />
          )}
        </div>

        {/* Main Text */}
        <h2
          style={{
            fontSize: '32px',
            fontWeight: 700,
            marginBottom: '24px',
            color: 'var(--color-text-primary)',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: `all var(--mood-animation-duration, 300ms) ease`,
          }}
        >
          {STAGE_TIMINGS[stage].text}
        </h2>

        {/* Progress Indicator */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            marginTop: '32px',
          }}
        >
          {[0, 1, 2].map((dot) => (
            <div
              key={dot}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: dot <= stage ? 'var(--accent-primary)' : 'var(--color-border)',
                transition: 'all 300ms ease',
                opacity: dot <= stage ? 1 : 0.3,
              }}
            />
          ))}
        </div>

        {/* Completion Message */}
        {isComplete && (
          <div
            style={{
              marginTop: '48px',
              padding: '24px',
              backgroundColor: 'var(--color-bg-secondary)',
              borderRadius: '12px',
              animation: 'fade-in 500ms ease-out',
            }}
          >
            <p
              style={{
                fontSize: '16px',
                color: 'var(--color-text-primary)',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              ✨ AI Twin ของคุณถือกำเนิดแล้ว! มาดูกันว่าตอนนี้ฉันเข้าใจอะไรเกี่ยวกับคุณบ้าง...
            </p>
          </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes pulse-creation {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes orbit-stage0 {
          from {
            transform: rotate(0deg) translateX(150px);
          }
          to {
            transform: rotate(360deg) translateX(150px);
          }
        }

        @keyframes orbit-stage1 {
          from {
            transform: rotate(0deg) translateX(100px);
          }
          to {
            transform: rotate(360deg) translateX(100px);
          }
        }

        @keyframes orbit-stage2 {
          from {
            transform: rotate(0deg) translateX(200px);
          }
          to {
            transform: rotate(360deg) translateX(200px);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AICreationSequence;
