import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import './TypingIndicator.css';

interface TypingIndicatorProps {
  show: boolean;
}

/**
 * Animated typing indicator - shows while Nova is thinking
 */
export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ show }) => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  if (!show) return null;

  return (
    <div className="typing-indicator-container">
      <div className="typing-indicator">
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
      </div>
      <span className="typing-text">⏳ {isTh ? 'SELFPRINT กำลังคิด...' : 'SELFPRINT is thinking...'}</span>
    </div>
  );
};

export default TypingIndicator;
