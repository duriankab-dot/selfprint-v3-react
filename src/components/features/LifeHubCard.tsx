/**
 * 🎯 LifeHubCard Component — Card สำหรับ Life Hub
 */

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import './life-hub-card.css';

interface HubCardProps {
  hub: {
    id: string;
    emoji: string;
    name: string;
    thaiName: string;
    score: number;
  };
  isSelected: boolean;
  onSelect: () => void;
}

const LifeHubCard: React.FC<HubCardProps> = ({ hub, isSelected, onSelect }) => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  return (
    <div
      className={`life-hub-card${isSelected ? ' selected' : ''}`}
      onClick={onSelect}
    >
      <div className="card-emoji">{hub.emoji}</div>
      <h3 className="card-name">{isTh ? hub.thaiName : hub.name}</h3>
      <div className="card-score">
        <div className="score-bar">
          <div className="score-fill" style={{ width: `${hub.score}%` }} />
        </div>
        <p className="score-text">{hub.score}/100</p>
      </div>
    </div>
  );
};

export default LifeHubCard;
