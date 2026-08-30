/**
 * 💬 ConversationHistory Component — Chat history
 */

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import './conversation-history.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface ConversationHistoryProps {
  messages: Message[];
  onClear: () => void;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  messages,
  onClear,
}) => {
  const { language } = useLanguage();
  const isTh = language === 'th';
  return (
    <div className="conversation-history">
      {messages.length === 0 ? (
        <div className="history-empty">
          <p className="empty-icon">💬</p>
          <p className="empty-text">{isTh ? 'ยังไม่มีการสนทนา' : 'No conversation yet'}</p>
          <p className="empty-subtext">{isTh ? 'เริ่มพูดกับ AI Twin ได้เลย' : 'Start talking with your AI Twin'}</p>
        </div>
      ) : (
        <>
          <div className="history-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message message-${msg.role}`}>
                <span className="message-role">
                  {msg.role === 'user' ? '👤' : '🤖'}
                </span>
                <div className="message-content">
                  <p className="message-text">{msg.text}</p>
                  <span className="message-time">
                    {msg.timestamp.toLocaleTimeString(isTh ? 'th-TH' : 'en-US')}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="history-clear" onClick={onClear}>
            🗑️ {isTh ? 'ลบประวัติ' : 'Clear history'}
          </button>
        </>
      )}
    </div>
  );
};

export default ConversationHistory;
