/**
 * 📌 TwinStatsCard Component — Single stat card
 *
 * **ทำหน้าที่:**
 * - Display single stat (insights / feedback / patterns / memories)
 * - Show icon + label + value
 * - Simple, clean design
 *
 * **Input Props:**
 * - label: string (e.g., "Total Insights")
 * - value: number (e.g., 42)
 * - icon: string (emoji)
 *
 * @module features/TwinStatsCard
 */

import React from 'react';
import './TwinStatsCard.css';

interface TwinStatsCardProps {
  label: string;
  value: number;
  icon: string;
}

export const TwinStatsCard: React.FC<TwinStatsCardProps> = ({ label, value, icon }) => {
  return (
    <div className="twin-stats-card">
      <div className="stats-card__icon">{icon}</div>
      <div className="stats-card__content">
        <p className="stats-card__label">{label}</p>
        <p className="stats-card__value">{value}</p>
      </div>
    </div>
  );
};

export default TwinStatsCard;
