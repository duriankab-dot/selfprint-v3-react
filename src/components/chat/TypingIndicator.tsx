import React from 'react';
import './TypingIndicator.css';

interface TypingIndicatorProps {
  show: boolean;
}

/**
 * Animated typing indicator - shows while Nova is thinking
 */
export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="typing-indicator-container">
      <div className="typing-indicator">
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
      </div>
      <span className="typing-text">⏳ Nova กำลังคิด...</span>
    </div>
  );
};

export default TypingIndicator;
