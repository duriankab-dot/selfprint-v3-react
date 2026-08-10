/**
 * 💬 ConversationHistory Component — Chat history
 */

import React from 'react';
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
  return (
    <div className="conversation-history">
      {messages.length === 0 ? (
        <div className="history-empty">
          <p className="empty-icon">💬</p>
          <p className="empty-text">ยังไม่มีการสนทนา</p>
          <p className="empty-subtext">เริ่มพูดกับ AI Twin ได้เลย</p>
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
                    {msg.timestamp.toLocaleTimeString('th-TH')}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="history-clear" onClick={onClear}>
            🗑️ ลบประวัติ
          </button>
        </>
      )}
    </div>
  );
};

export default ConversationHistory;
