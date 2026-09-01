/**
 * NovaChat.tsx
 * Self Print Universal Guide - Nova Chat Interface
 *
 * IDENTITY: Nova = Warm, guiding presence (NOT the Twin)
 * PHASE: Acts I-II (Discovery → Core Awakening)
 * AFTER: Twin takes over (Act III)
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAIContext } from '../context/AIContext';
import { useNova } from '../context/NovaContext';
import { useLangNavigate as useNavigate } from '../hooks/useLangNavigate';
import { NovaAvatar } from '../components/features/NovaAvatar';
import { saveMessage } from '@/services/supabase-service';
import { NOVA_INITIAL_PROMPT } from '../config/nova-prompts';
import { callNovaAPI } from '../services/NovaAPIService';

export default function NovaChat() {
  const { session } = useAuth();
  const { isNovaActive } = useAIContext();
  const { addInsight } = useNova();
  const navigate = useNavigate();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'nova'; content: string }>>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // NOVACHAT-STRICTMODE-001 FIX: React 18 StrictMode mounts → unmounts →
  // remounts in dev; state is reset to its initial value on the second mount,
  // so `messages.length === 0` is true again and the greeting was appended
  // twice. useRef survives across the strict-mode remount cycle and blocks the
  // second initialization cleanly.
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current && messages.length === 0) {
      initializedRef.current = true;
      setMessages([{ role: 'nova', content: NOVA_INITIAL_PROMPT }]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — intentional mount-only

  // NOVACHAT-DEADEND-001: NovaChat is Act I-II only (pre-Twin guide). Every
  // live entry point in the app (BottomNav, NavBar, TodaySection,
  // ActivitiesPage, ExplorePage — see their own BOTTOMNAV-001/CHATROUTE-001
  // comments) was already patched to skip this page and go straight to
  // /chat/twin once a Twin exists, but this page itself still just showed a
  // dead-end "Your Twin has awakened..." stub with no way forward for
  // anyone who lands here directly (an old bookmark, a stale link, /chat's
  // own redirect). Forward them to the real destination instead.
  useEffect(() => {
    if (session?.user?.id && !isNovaActive) {
      navigate('/chat/twin', { replace: true });
    }
  }, [session, isNovaActive, navigate]);

  // GUARD: Verify user is logged in + Nova (Self Print) is active
  if (!session?.user?.id) {
    return (
      <div className="flex flex-col h-screen items-center justify-center text-center max-w-2xl mx-auto p-4">
        <p className="text-gray-500 mb-4">Please login to begin your Self Print discovery</p>
      </div>
    );
  }

  if (!isNovaActive) {
    // Redirect is handled by the effect above — render nothing while it fires.
    return null;
  }

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage('');
    setIsSending(true);
    setError(null);

    try {
      // GUARD: Ensure userId exists
      if (!session.user?.id) {
        throw new Error('User session lost');
      }

      // Add user message to UI immediately
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

      // Save message to database
      await saveMessage(
        session.user.id,
        'nova-chat',
        'discovery',
        'user',
        userMessage
      );

      // Add insight for pattern detection
      addInsight(userMessage);

      // Convert messages to API format (role: 'user' | 'assistant')
      const apiMessages: Array<{ role: 'user' | 'assistant'; content: string }> = messages
        .filter(m => m.role === 'user' || m.role === 'nova')
        .map(m => ({
          role: (m.role === 'nova' ? 'assistant' : 'user') as 'user' | 'assistant',
          content: m.content
        }))
        .concat([{ role: 'user' as const, content: userMessage }]);

      // Call Nova API to generate response
      // P0-E: use sophisticated hub×mood×archetype prompt builder.
      // Nova is always pre-Twin (maturityScore=0, hub='identity').
      // Archetype defaults to 'sage' — unknown until analysis completes.
      const novaResponse = await callNovaAPI(
        apiMessages,
        'onboarding', // kept for compat (ignored internally now)
        { hub: 'identity', mood: 'ready', archetype: 'sage', maturityScore: 0 }
      );

      // Save Nova's response to database (role must be 'user' | 'assistant')
      await saveMessage(
        session.user.id,
        'nova-chat',
        'discovery',
        'assistant',
        novaResponse
      );

      // Add Nova response to messages
      setMessages(prev => [...prev, {
        role: 'nova',
        content: novaResponse
      }]);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMsg);
      console.error('Nova message error:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4 nova-container">
      {/* Header */}
      <div className="nova-header mb-6 text-center">
        <div className="flex justify-center mb-2">
          <NovaAvatar size="lg" showLabel={true} />
        </div>
        <h1 className="text-3xl font-bold nova-label">Self Print</h1>
        <p className="text-sm text-gray-600 mt-2">Your Universal Guide | Discover Yourself</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 px-2">
        {messages.map((msg, idx) => (
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
        ))}
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
        Self Print remembers context within this session • Ready to awaken your Twin? Continue your discovery
      </div>
    </div>
  );
}
