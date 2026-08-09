import React from 'react';
import './InsightsCard.css';

interface InsightsCardProps {
  label: string;
  value: string | number;
  subtitle: string;
}

const InsightsCard: React.FC<InsightsCardProps> = ({ label, value, subtitle }) => {
  return (
    <div className="insights-card">
      <div className="insights-label">{label}</div>
      <div className="insights-value">{value}</div>
      <div className="insights-subtitle">{subtitle}</div>
    </div>
  );
};

export default InsightsCard;
