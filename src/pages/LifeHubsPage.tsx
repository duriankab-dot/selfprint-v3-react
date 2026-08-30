/**
 * 🎯 LifeHubsPage.tsx — หน้า Life Hubs
 *
 * 5 Life Areas:
 * 1. Career (อาชีพ)
 * 2. Relationships (ความสัมพันธ์)
 * 3. Health (สุขภาพ)
 * 4. Growth (การเติบโต)
 * 5. Life Balance (สมดุลชีวิต)
 */

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import LifeHubCard from '@/components/features/LifeHubCard';
import './life-hubs-page.css';

type HubType = 'career' | 'relationships' | 'health' | 'growth' | 'balance';

interface Hub {
  id: HubType;
  emoji: string;
  name: string;
  thaiName: string;
  description: string;
  descriptionEn: string;
  score: number; // 0-100
}

const HUBS: Hub[] = [
  {
    id: 'career',
    emoji: '💼',
    name: 'Career',
    thaiName: 'อาชีพ',
    description: 'ความสำเร็จในงาน ทักษะ ความก้าวหน้า',
    descriptionEn: 'Career success, skills, advancement',
    score: 0,
  },
  {
    id: 'relationships',
    emoji: '❤️',
    name: 'Relationships',
    thaiName: 'ความสัมพันธ์',
    description: 'ครอบครัว เพื่อน คู่ครอง',
    descriptionEn: 'Family, friends, partner',
    score: 0,
  },
  {
    id: 'health',
    emoji: '🏃',
    name: 'Health',
    thaiName: 'สุขภาพ',
    description: 'ร่างกาย จิตใจ พลังงาน',
    descriptionEn: 'Body, mind, energy',
    score: 0,
  },
  {
    id: 'growth',
    emoji: '📈',
    name: 'Growth',
    thaiName: 'การเติบโต',
    description: 'การเรียนรู้ ทักษะใหม่ ความคิด',
    descriptionEn: 'Learning, new skills, mindset',
    score: 0,
  },
  {
    id: 'balance',
    emoji: '⚖️',
    name: 'Life Balance',
    thaiName: 'สมดุลชีวิต',
    description: 'เวลาให้ตัวเอง สิ่งที่สำคัญ ความสุข',
    descriptionEn: 'Time for yourself, what matters, happiness',
    score: 0,
  },
];

export const LifeHubsPage: React.FC = () => {
  const { session } = useAuth();
  const userId = session?.user?.id ?? '';
  const { language } = useLanguage();
  const isTh = language === 'th';
  const [selectedHub, setSelectedHub] = useState<HubType | null>(null);

  if (!userId) {
    return (
      <div className="life-hubs-page">
        <p>{isTh ? 'กรุณาเข้าสู่ระบบ' : 'Please sign in'}</p>
      </div>
    );
  }

  return (
    <main className="life-hubs-page">
      <div className="life-hubs-page__header">
        <h1>🎯 {isTh ? 'Life Hubs — 5 พื้นที่ชีวิต' : 'Life Hubs — 5 life areas'}</h1>
        <p>
          {isTh
            ? 'ดูความสมดุลและความก้าวหน้าในแต่ละพื้นที่สำคัญของชีวิต'
            : 'See your balance and progress across each key area of life'}
        </p>
      </div>

      <div className="life-hubs-grid">
        {HUBS.map((hub) => (
          <LifeHubCard
            key={hub.id}
            hub={hub}
            isSelected={selectedHub === hub.id}
            onSelect={() => setSelectedHub(selectedHub === hub.id ? null : hub.id)}
          />
        ))}
      </div>

      {selectedHub && (
        <div className="life-hub-detail">
          <div className="detail-header">
            <h2>
              {HUBS.find((h) => h.id === selectedHub)?.emoji}{' '}
              {isTh ? HUBS.find((h) => h.id === selectedHub)?.thaiName : HUBS.find((h) => h.id === selectedHub)?.name}
            </h2>
            <button
              className="detail-close"
              onClick={() => setSelectedHub(null)}
            >
              ✕
            </button>
          </div>

          <div className="detail-content">
            <div className="detail-section">
              <h3>📊 Score: {HUBS.find((h) => h.id === selectedHub)?.score}/100</h3>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${HUBS.find((h) => h.id === selectedHub)?.score}%` }}
                />
              </div>
            </div>

            <div className="detail-section">
              <h3>📝 {isTh ? 'Insights ที่เกี่ยวข้อง' : 'Related insights'}</h3>
              <p>
                {isTh
                  ? `insights สำหรับ ${HUBS.find((h) => h.id === selectedHub)?.thaiName} จะปรากฏตรงนี้`
                  : `Insights for ${HUBS.find((h) => h.id === selectedHub)?.name} will appear here`}
              </p>
            </div>

            <div className="detail-section">
              <h3>🎯 Goals</h3>
              <p>{isTh ? 'เป้าหมายในพื้นที่นี้จะปรากฏตรงนี้' : 'Goals for this area will appear here'}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default LifeHubsPage;
