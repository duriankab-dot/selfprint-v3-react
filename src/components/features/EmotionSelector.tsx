/**
 * EmotionSelector.tsx
 *
 * ให้ผู้ใช้เลือก 1 ใน 6 moods
 * เมื่อเปลี่ยน mood → Nova ปรับวิธีพูด
 */

import { useEmotion } from '@/context/EmotionContext';
import type { Mood } from '@/context/EmotionContext';
import { useLanguage } from '@/context/LanguageContext';

// ข้อมูล 6 moods
function getMoodOptions(isTh: boolean): Array<{ id: Mood; label: string; description: string; icon: string }> {
  return [
    {
      id: 'stressed',
      label: isTh ? 'เครียด' : 'Stressed',
      description: isTh ? 'กระเด็นไปมา จิตใจปั่น' : 'Pulled in every direction, mind racing',
      icon: '😰',
    },
    {
      id: 'confused',
      label: isTh ? 'สับสน' : 'Confused',
      description: isTh ? 'ไม่รู้เพราะอะไร ทิศทางไม่ชัด' : "Not sure why, direction isn't clear",
      icon: '🤔',
    },
    {
      id: 'confident',
      label: isTh ? 'มั่นใจ' : 'Confident',
      description: isTh ? 'รู้ว่าจะไป ศรัทธาตัวเอง' : 'You know where you\'re going, trust yourself',
      icon: '💪',
    },
    {
      id: 'drained',
      label: isTh ? 'หมดแรง' : 'Drained',
      description: isTh ? 'เหนื่อยมากๆ เต่าเคลื่อน' : 'Exhausted, moving at a crawl',
      icon: '😴',
    },
    {
      id: 'ready',
      label: isTh ? 'พร้อม' : 'Ready',
      description: isTh ? 'อยากเดินหน้า ลุยสิ่งใหม่' : 'Ready to move forward, take on something new',
      icon: '🚀',
    },
    {
      id: 'reflective',
      label: isTh ? 'สะท้อนใจ' : 'Reflective',
      description: isTh ? 'อยากคิด รื่องหาความหมาย' : 'Want to think things through, find meaning',
      icon: '🌙',
    },
  ];
}

interface EmotionSelectorProps {
  className?: string;
}

export const EmotionSelector: React.FC<EmotionSelectorProps> = ({ className = '' }) => {
  const { mood, updateMood } = useEmotion();
  const { language } = useLanguage();
  const isTh = language === 'th';
  const MOOD_OPTIONS = getMoodOptions(isTh);

  return (
    <div className={`emotion-selector ${className}`}>
      <div className="emotion-selector__label">
        <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-text-primary)' }}>
          {isTh ? 'อารมณ์ตอนนี้' : 'Current mood'}
        </p>
      </div>

      {/* Grid 6 mood buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '8px',
        }}
      >
        {MOOD_OPTIONS.map((moodOption) => (
          <button
            key={moodOption.id}
            onClick={() => updateMood(moodOption.id)}
            className={`mood-button ${mood === moodOption.id ? 'active' : ''}`}
            style={{
              padding: '12px 8px',
              borderRadius: '8px',
              border:
                mood === moodOption.id
                  ? '2px solid var(--color-accent-secondary)'
                  : '2px solid var(--color-border)',
              background:
                mood === moodOption.id
                  ? 'var(--color-accent-secondary)10'
                  : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center',
              color: 'var(--color-text-primary)',
              fontWeight: mood === moodOption.id ? 600 : 500,
              fontSize: '13px',
            }}
            title={moodOption.description}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{moodOption.icon}</div>
            <div>{moodOption.label}</div>
          </button>
        ))}
      </div>

      {/* ข้อมูล Mood ปัจจุบัน */}
      {mood && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            background: 'var(--color-accent-secondary)10',
            borderRadius: '8px',
            borderLeft: '4px solid var(--color-accent-secondary)',
          }}
        >
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
            {MOOD_OPTIONS.find((m) => m.id === mood)?.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default EmotionSelector;
