/**
 * InitialBlueprint.tsx
 *
 * Initial AI Twin Blueprint Display (60-70% accuracy)
 * MEMO V4: "First Aha" - shows what Nova understands so far
 *
 * Displays:
 * - Decision Style
 * - 1-2 Strengths
 * - 1 Blind Spot
 * - Accuracy meter (60% amber)
 * - Nova contextual prompt
 * - Yes/Skip buttons for fine-tuning
 */

import { useLanguage } from '@/context/LanguageContext';

interface BlueprintData {
  decisionStyle: string;
  strengths: string[];
  blindSpot: string;
}

interface InitialBlueprintProps {
  profile: BlueprintData;
  prototypeCore?: string;
  accuracy?: number;
  onContinue: () => void;
  onSkip?: () => void;
  ctaSource?: string;
}

const getNovaMessage = (ctaSource: string | undefined, isTh: boolean): string => {
  if (isTh) {
    switch (ctaSource) {
      case 'why':
        return 'จากส่วน "ทำไม" ที่คุณอ่าน ฉันรู้สึกว่าคุณอยากเข้าใจตัวเองมากขึ้น ตอนนี้ฉันเข้าใจรูปแบบการตัดสินใจของคุณ 60% แล้ว ช่วยตอบ 5 คำถามสั้นๆ เพื่อให้ฉันรู้จักคุณดีขึ้นไหม?';
      case 'how':
        return 'ฉันเห็นว่าคุณอยากเข้าใจกระบวนการ ตอนนี้ฉันเข้าใจวิธีตัดสินใจของคุณ 60% แล้ว ตอบ 5 คำถามเพื่อช่วยให้ฉันไปถึง 85% ได้ไหม?';
      case 'who':
        return 'คุณพร้อมเจาะลึกมากขึ้นแล้ว ตอนนี้ฉันเข้าใจว่าคุณเป็นใคร 60% แล้ว มาปรับความเข้าใจของฉันให้ละเอียดขึ้นด้วยอีก 5 คำถามไหม?';
      case 'next':
        return 'เริ่มกันเลย! ตอนนี้ฉันเข้าใจคุณ 60% แล้ว ช่วยให้ฉันไปถึงความแม่นยำ 85% ด้วยแค่ 5 คำถามสั้นๆ ไหม?';
      default:
        return 'ตอนนี้ฉันเข้าใจว่าคุณเป็นใคร 60% แล้ว ช่วยให้ฉันรู้จักคุณดีขึ้นไหม? แค่ 5 คำถามสั้นๆ จะพาฉันไปถึง 85%';
    }
  }
  switch (ctaSource) {
    case 'why':
      return 'From the "why" section you just read, I can tell you want to understand yourself better. I already understand about 60% of your decision-making style — would you answer 5 quick questions so I can get to know you better?';
    case 'how':
      return "I can see you're curious about the process. I already understand 60% of how you make decisions — 5 questions could help me reach 85%. Want to try?";
    case 'who':
      return "You're ready to go deeper. Right now I understand about 60% of who you are — shall we sharpen that with 5 more questions?";
    case 'next':
      return "Let's get started! I already understand 60% of you — 5 quick questions could get me to 85% accuracy.";
    default:
      return "Right now I understand about 60% of who you are — want to help me know you better? Just 5 quick questions could get me to 85%.";
  }
};

export const InitialBlueprint: React.FC<InitialBlueprintProps> = ({
  profile,
  prototypeCore,
  accuracy = 60,
  onContinue,
  onSkip,
  ctaSource,
}) => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const getMeterColor = (value: number): string => {
    if (value < 70) return '#FFA726'; // Amber for 60%
    if (value < 90) return '#FFD54F'; // Yellow for 70-90%
    return '#66BB6A'; // Green for 90%+
  };

  return (
    <div
      style={{
        maxWidth: '700px',
        margin: '0 auto',
        padding: '48px 24px',
        background: `linear-gradient(135deg, var(--accent-light, var(--color-bg-secondary)) 0%, var(--color-bg-primary) 100%)`,
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h2
          style={{
            fontSize: '28px',
            fontWeight: 700,
            marginBottom: '12px',
            color: 'var(--color-text-primary)',
          }}
        >
          🤖 {isTh ? 'AI Twin ของคุณ' : 'Your AI Twin'}
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            margin: 0,
          }}
        >
          {isTh ? 'ความแม่นยำ' : 'Accuracy'} {accuracy}%
        </p>
        {prototypeCore && (
          <span
            style={{
              display: 'inline-block',
              marginTop: '12px',
              padding: '6px 16px',
              borderRadius: '999px',
              background: 'var(--accent-light)',
              color: 'var(--accent-primary)',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            Prototype Core: {prototypeCore}
          </span>
        )}
      </div>

      {/* Blueprint Card */}
      <div
        style={{
          background: 'var(--color-bg-secondary)',
          borderRadius: '12px',
          padding: '32px',
          border: '2px solid var(--accent-light)',
          marginBottom: '32px',
        }}
      >
        {/* Decision Style */}
        <div style={{ marginBottom: '28px' }}>
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            🎯 {isTh ? 'รูปแบบการตัดสินใจ' : 'Decision style'}
          </h3>
          <p
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              margin: '0',
              lineHeight: 1.5,
            }}
          >
            {profile.decisionStyle}
          </p>
        </div>

        {/* Strengths */}
        <div style={{ marginBottom: '28px' }}>
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            💪 {isTh ? 'จุดแข็ง' : 'Strengths'}
          </h3>
          <ul
            style={{
              margin: '0',
              paddingLeft: '20px',
              listStyleType: 'none',
            }}
          >
            {profile.strengths.slice(0, 2).map((strength, index) => (
              <li
                key={index}
                style={{
                  fontSize: '16px',
                  color: 'var(--color-text-primary)',
                  marginBottom: index === 0 ? '8px' : '0',
                  paddingLeft: '20px',
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    color: 'var(--accent-primary)',
                  }}
                >
                  •
                </span>
                {strength}
              </li>
            ))}
          </ul>
        </div>

        {/* Blind Spot */}
        <div>
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            ⚠️ {isTh ? 'จุดบอด' : 'Blind spot'}
          </h3>
          <p
            style={{
              fontSize: '16px',
              color: 'var(--color-text-primary)',
              margin: '0',
              lineHeight: 1.5,
              paddingLeft: '4px',
            }}
          >
            {profile.blindSpot}
          </p>
        </div>
      </div>

      {/* Accuracy Meter */}
      <div style={{ marginBottom: '32px' }}>
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
            {isTh ? 'ความชัดเจน' : 'Clarity'}
          </span>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: getMeterColor(accuracy),
            }}
          >
            {accuracy}%
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: '8px',
            background: 'var(--color-bg-tertiary)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${accuracy}%`,
              height: '100%',
              background: getMeterColor(accuracy),
              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
              borderRadius: '4px',
            }}
          />
        </div>
      </div>

      {/* Nova Message */}
      <div
        style={{
          background: 'var(--accent-light)',
          borderLeft: `4px solid var(--accent-primary)`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '32px',
        }}
      >
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-text-primary)',
            margin: '0',
            lineHeight: 1.6,
            fontStyle: 'italic',
          }}
        >
          <span style={{ fontWeight: 600 }}>SELFPRINT:</span> {getNovaMessage(ctaSource, isTh)}
        </p>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexDirection: 'column',
        }}
      >
        <button
          onClick={onContinue}
          style={{
            width: '100%',
            padding: '14px 24px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--accent-primary)',
            color: 'white',
            fontWeight: 600,
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          ✓ {isTh ? 'ช่วยให้รู้จักฉันดีขึ้น (5 คำถาม)' : 'Help me know you better (5 questions)'}
        </button>
        {onSkip && (
          <button
            onClick={onSkip}
            style={{
              width: '100%',
              padding: '12px 24px',
              borderRadius: '8px',
              border: '2px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text-primary)',
              fontWeight: 600,
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {isTh ? 'ข้ามไปก่อน' : 'Skip for now'}
          </button>
        )}
      </div>
    </div>
  );
};

export default InitialBlueprint;
