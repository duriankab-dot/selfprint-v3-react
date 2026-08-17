/**
 * EmotionSelector.tsx
 *
 * ให้ผู้ใช้เลือก 1 ใน 6 moods
 * เมื่อเปลี่ยน mood → Nova ปรับวิธีพูด
 */

import { useEmotion } from '@/context/EmotionContext';
import type { Mood } from '@/context/EmotionContext';

// ข้อมูล 6 moods
const MOOD_OPTIONS: Array<{ id: Mood; label: string; description: string; icon: string }> = [
  {
    id: 'stressed',
    label: 'เครียด',
    description: 'กระเด็นไปมา จิตใจปั่น',
    icon: '😰',
  },
  {
    id: 'confused',
    label: 'สับสน',
    description: 'ไม่รู้เพราะอะไร ทิศทางไม่ชัด',
    icon: '🤔',
  },
  {
    id: 'confident',
    label: 'มั่นใจ',
    description: 'รู้ว่าจะไป ศรัทธาตัวเอง',
    icon: '💪',
  },
  {
    id: 'drained',
    label: 'หมดแรง',
    description: 'เหนื่อยมากๆ เต่าเคลื่อน',
    icon: '😴',
  },
  {
    id: 'ready',
    label: 'พร้อม',
    description: 'อยากเดินหน้า ลุยสิ่งใหม่',
    icon: '🚀',
  },
  {
    id: 'reflective',
    label: 'สะท้อนใจ',
    description: 'อยากคิด รื่องหาความหมาย',
    icon: '🌙',
  },
];

interface EmotionSelectorProps {
  className?: string;
}

export const EmotionSelector: React.FC<EmotionSelectorProps> = ({ className = '' }) => {
  const { mood, updateMood } = useEmotion();

  return (
    <div className={`emotion-selector ${className}`}>
      <div className="emotion-selector__label">
        <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-text-primary)' }}>
          อารมณ์ตอนนี้
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
