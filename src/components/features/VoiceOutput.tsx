/**
 * 🔊 VoiceOutput — Text-to-speech UI control
 * useVoiceTwin hook ใน VoiceChat.tsx จัดการ SpeechSynthesis ทั้งหมด
 * Component นี้แสดง last assistant message + ปุ่มให้ฟังซ้ำ
 */

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import './voice-output.css';

interface VoiceOutputProps {
  isSpeaking: boolean;
  lastMessage: string;
  onSpeak: (text: string) => void;
}

const VoiceOutput: React.FC<VoiceOutputProps> = ({ isSpeaking, lastMessage, onSpeak }) => {
  const { language } = useLanguage();
  const isTh = language === 'th';

  const handleSpeak = () => {
    if (!lastMessage) return;
    onSpeak(lastMessage);
  };

  return (
    <div className="voice-output">
      <button
        className={`voice-output__btn${isSpeaking ? ' speaking' : ''}`}
        onClick={handleSpeak}
        disabled={!lastMessage || isSpeaking}
        title={isTh ? 'อ่านคำตอบล่าสุดอีกครั้ง' : 'Replay last response'}
        aria-label={isTh ? 'อ่านซ้ำ' : 'Replay'}
      >
        🔊
      </button>
      <span className="voice-output__status">
        {isSpeaking
          ? (isTh ? 'กำลังอ่าน...' : 'Speaking...')
          : (lastMessage
            ? (isTh ? 'กดเพื่ออ่านซ้ำ' : 'Press to replay')
            : (isTh ? 'รอคำตอบ' : 'Waiting for reply'))}
      </span>
    </div>
  );
};

export default VoiceOutput;
