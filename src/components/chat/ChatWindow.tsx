import React, { useEffect, useRef } from 'react';
import { useChat } from '@/features/chat/hooks/useChat';
import { useLanguage } from '@/context/LanguageContext';

interface ChatWindowProps {
  siceContext?: string;
  character?: 'nova' | 'elite';
}

export function ChatWindow({ character = 'nova' }: ChatWindowProps) {
  const { messages, isLoading, sendMessage } = useChat();
  const { language } = useLanguage();
  const isTh = language === 'th';
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const charName = character === 'nova' ? 'SELFPRINT' : 'Elite';
  const charEmoji = character === 'nova' ? '✨' : '👑';

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="text-lg font-bold">
          {charEmoji} {charName} — {isTh ? 'AI Twin ของคุณ' : 'Your AI Twin'}
        </h2>
        <p className="text-sm text-gray-600">
          {isTh ? 'คำแนะนำที่ปรับให้เข้ากับการตัดสินใจของคุณ' : 'Advice tailored to your decisions'}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-12">
            <p className="text-2xl mb-2">{charEmoji}</p>
            <p>{isTh ? 'ทักทายเพื่อเริ่มบทสนทนา' : 'Say hello to start the conversation'}</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={`msg-${index}`}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-900 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg rounded-bl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={isTh ? 'ถามอะไรก็ได้...' : 'Ask anything...'}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-medium"
          >
            {isTh ? 'ส่ง' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}