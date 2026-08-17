/**
 * 🎯 LifeHubCard Component — Card สำหรับ Life Hub
 */

import React from 'react';
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
  return (
    <div
      className={`life-hub-card${isSelected ? ' selected' : ''}`}
      onClick={onSelect}
    >
      <div className="card-emoji">{hub.emoji}</div>
      <h3 className="card-name">{hub.thaiName}</h3>
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
