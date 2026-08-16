/**
 * NovaChat.tsx
 * Self Print Universal Guide - Nova Chat Page
 * Warm, guiding, helps users discover themselves
 */

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAIContext } from '../context/AIContext';
import { NovaAvatar } from '../components/features/NovaAvatar';
import { saveMessage } from '@/services/supabase-service';

export default function NovaChat() {
  const { session } = useAuth();
  const { switchToNova } = useAIContext();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'nova'; content: string }>>([]);
  const [isSending, setIsSending] = useState(false);

  // Ensure we're on Nova
  switchToNova();

  const handleSend = async () => {
    if (!message.trim() || !session?.user?.id) return;

    const userMessage = message.trim();
    setMessages([...messages, { role: 'user', content: userMessage }]);
    setMessage('');
    setIsSending(true);

    try {
      // Save message to database
      await saveMessage(
        session.user.id,
        'nova-chat',  // hub
        'discovery',  // mood
        'user',
        userMessage
      );

      // TODO: Call Nova API with context to generate response
      // const novaPrompt = getNovaPrompt();
      // const response = await callNova({ messages, systemPrompt: novaPrompt });
      // setMessages(prev => [...prev, { role: 'nova', content: response }]);
    } catch (err) {
      console.error('Failed to save message:', err);
    } finally {
      setIsSending(false);
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col h-screen items-center justify-center text-center max-w-2xl mx-auto p-4">
        <p className="text-gray-500 mb-4">Please login to begin your Self Print discovery with Nova</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4 nova-container">
      {/* Header */}
      <div className="nova-header mb-6 text-center">
        <div className="flex justify-center mb-2">
          <NovaAvatar size="lg" showLabel={true} />
        </div>
        <h1 className="text-3xl font-bold nova-label">Nova</h1>
        <p className="text-sm text-gray-600 mt-2">Your Self Print Guide | Discover Yourself</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 px-2">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-lg mb-2">👋 Welcome to Self Print</p>
            <p className="text-sm">I'm Nova, your guide to self-discovery.</p>
            <p className="text-sm mt-2">Share what's on your mind, and let's explore together.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'nova-message rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {isSending && (
          <div className="flex justify-start">
            <div className="nova-message p-4 rounded-bl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSend()}
          placeholder="Share your thoughts, feelings, or questions..."
          disabled={isSending}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 text-sm"
        />
        <button
          onClick={handleSend}
          disabled={isSending || !message.trim()}
          className="px-6 py-3 bg-amber-400 text-gray-900 rounded-lg hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isSending ? '...' : 'Send'}
        </button>
      </div>

      {/* Info Footer */}
      <div className="text-center text-xs text-gray-400 mt-4 pb-2">
        Nova remembers context within this session • Ready to awaken your Twin? Continue to explore with Nova
      </div>
    </div>
  );
}
