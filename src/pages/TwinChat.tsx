/**
 * TwinChat.tsx
 * Personal AI Twin chat interface with world-specific expertise
 *
 * IDENTITY: Twin = Personal expert (NOT Nova)
 * PHASE: Act III+ (Life, growth, expertise per world)
 * WORLD AWARENESS: Twin adapts expertise based on current world
 * QUERY PARAM: ?world=<worldId> (optional)
 */

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTwin } from '../context/TwinContext';
import { useWorld } from '../context/WorldContext';
import { useUserStore } from '../store/userStore';
import { useAnalysisStore } from '../store/analysisStore';
import { WORLDS, type WorldId } from '../constants/worlds';
import { WorldContextHeader } from '../components/chat/WorldContextHeader';
import { WorldTabs } from '../components/WorldTabs';
import { saveMessage, supabase } from '@/services/supabase-service';
import { callTwinAPI } from '../services/TwinAPIService';
import { loadRecentMemories } from '../lib/memory/loadRecentMemories';
import { recordWorldInteraction } from '../services/WorldExpertiseService';
import * as DecisionService from '../services/DecisionService';

interface Message {
  role: 'user' | 'twin';
  content: string;
  world?: WorldId;
  options?: string[]; // Extracted options from Twin response
  selectedChoice?: string; // User's selected option
}

export default function TwinChat() {
  const { session } = useAuth();
  const { twin, setCurrentWorld } = useTwin();
  const { setCurrentWorld: setWorldContextCurrentWorld } = useWorld();
  // TWIN-MEMORY-001: pull onboarding data that Nova collected so Twin is
  // "intelligent from birth" — knows the user before the first message.
  const userProfile = useUserStore(s => s.profile);
  const updateProfile = useUserStore(s => s.updateProfile);
  const currentAnalysis = useAnalysisStore(s => s.currentAnalysis);
  const setCurrentAnalysis = useAnalysisStore(s => s.setCurrentAnalysis);
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentWorld, setLocalWorld] = useState<WorldId | null>(null);
  const [savingDecisionIndex, setSavingDecisionIndex] = useState<number | null>(null);
  const [savedDecisionIds, setSavedDecisionIds] = useState<Set<number>>(new Set());
  const autoSentInitialMessage = useRef(false);

  // TWINCHAT-HOOKS-001 FIX: these two effects used to sit *after* the
  // "GUARD: Check if Twin exists" / "GUARD: Check if user is logged in"
  // early returns below — a Rules of Hooks violation. If twin/session
  // ever flip from null -> defined between renders of this same mounted
  // instance (e.g. TwinContext finishes its async load slightly after
  // this page mounts), the early return means React sees fewer hooks
  // called on the first render than on the next one, and throws
  // "Rendered more hooks than during the previous render." Every hook
  // must run unconditionally on every render, so both effects moved
  // above the guards; each effect now checks twin/session for itself
  // before touching them, and the guards moved below, after all hooks.

  // Extract and validate world param from URL
  // DISCONNECT-001 FIX: also sync WorldContext's currentWorld here, so
  // WorldTabs (which reads WorldContext, not this component's local state)
  // correctly highlights the world that arrived via ?world= — previously
  // only TwinContext's copy was set, leaving WorldTabs looking stale/wrong
  // on arrival even though the AI prompt itself was already using the
  // right world.
  useEffect(() => {
    const worldParam = searchParams.get('world');
    if (worldParam && typeof worldParam === 'string') {
      const isValidWorld = Object.keys(WORLDS).includes(worldParam);
      if (isValidWorld) {
        const world = worldParam as WorldId;
        setLocalWorld(world);
        setCurrentWorld(world);
        setWorldContextCurrentWorld(world);
      }
    }
  }, [searchParams, setCurrentWorld, setWorldContextCurrentWorld]);

  // CHATROUTE-001 FIX: several entry points (Today section, Activities,
  // Explore) navigate here with { state: { initialMessage } } to start a
  // specific guided prompt — but nothing ever read it, so the prompt
  // silently vanished and the user landed on an empty chat instead of the
  // activity they picked. Auto-send it once on arrival.
  useEffect(() => {
    if (!twin || !session?.user?.id) return;
    const initial = (location.state as { initialMessage?: string } | null)?.initialMessage;
    if (initial && !autoSentInitialMessage.current) {
      autoSentInitialMessage.current = true;
      handleSend(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, twin, session]);

  // ANALYSIS-PERSIST-001 FIX: fetch analysis from database when store is empty.
  // Without this, Twin is only smart in the first session — on reload,
  // currentAnalysis becomes null and Twin loses all strengths/blindSpots context.
  // NOTE: data lives in awakening_essence.personal_intelligence (NOT profiles_blueprints.final_analysis)
  useEffect(() => {
    if (currentAnalysis || !session?.user?.id || !supabase) return;

    const fetchAnalysisFromDB = async () => {
      try {
        // Fetch latest awakening essence (real analysis source)
        const { data, error } = await supabase
          .from('awakening_essence')
          .select('personal_intelligence, sice_results, synthesis')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();  // maybeSingle → null on 0 rows, no PGRST116

        if (error) {
          console.warn('Failed to fetch essence from DB:', error.message);
          return;
        }

        if (data?.personal_intelligence) {
          const pi = data.personal_intelligence as {
            userUnderstanding?: number;
            recommendedAction?: string;
            confidence?: number;
            insights?: string[];
            nextStepsSuggested?: string[];
            warningsOrCautions?: string[];
          };
          const synth = (data.synthesis ?? {}) as {
            themes?: string[];
            agreements?: string[];
            confidenceScore?: number;
          };
          const siceArr = Array.isArray(data.sice_results) ? data.sice_results : [];

          // Map PersonalIntelligence + synthesis → FullAnalysisOutput shape
          setCurrentAnalysis({
            selfOverview: [pi.recommendedAction, ...(pi.insights ?? []).slice(0, 2)].filter(Boolean).join(' '),
            behavioralPatterns: [],
            strengths: (synth.themes ?? []).slice(0, 4).map((t, i) => ({
              name: t,
              description: (pi.insights ?? [])[i] ?? t,
              confidence: (pi.confidence ?? 70) / 100,
              evidence: [],
            })),
            blindSpots: (pi.warningsOrCautions ?? []).map(w => ({
              title: w,
              description: w,
              sensitivity: 'medium',
              confidence: 0.65,
            })),
            trends: [],
            journey: {
              currentStage: 'awakening',
              description: pi.recommendedAction ?? '',
              growing: (synth.agreements ?? []).slice(0, 2),
              changing: [],
              stillWorking: [],
            },
            focusAreas: (pi.insights ?? []).slice(0, 3),
            guidance: pi.insights ?? [],
            nextSteps: pi.nextStepsSuggested ?? [],
            generatedAt: new Date(),
            modelAccuracy: (pi.confidence ?? 70) / 100,
            sourceCount: siceArr.length > 0 ? siceArr.length : 12,
          });
        }
      } catch (err) {
        console.error('Error fetching essence from DB:', err);
      }
    };

    fetchAnalysisFromDB();
    // Run once on mount; dependencies are controlled by the early return
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  // BIRTHDATE-RECOVER-001: userStore no longer persists birthDate to localStorage
  // (G1-LOCALSTORAGE-POLICY). Recover it from selfprint.users_profiles so twinProfile
  // always includes birth data context.
  useEffect(() => {
    if (userProfile.birthDate || !session?.user?.id || !supabase) return;
    supabase
      .schema('selfprint')
      .from('users_profiles')
      .select('date_of_birth, time_of_birth, place_of_birth')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.date_of_birth) {
          updateProfile({
            birthDate: String(data.date_of_birth),
            birthTime: data.time_of_birth ? String(data.time_of_birth) : undefined,
            birthPlace: data.place_of_birth ? String(data.place_of_birth) : undefined,
          });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  // GUARD: Check if Twin exists
  if (!twin) {
    return (
      <div className="flex flex-col h-screen items-center justify-center text-center max-w-2xl mx-auto p-4">
        <p className="text-gray-500 mb-4">Your Twin hasn't awakened yet. Complete Core Awakening first.</p>
      </div>
    );
  }

  // GUARD: Check if user is logged in
  if (!session?.user?.id) {
    return (
      <div className="flex flex-col h-screen items-center justify-center text-center max-w-2xl mx-auto p-4">
        <p className="text-gray-500 mb-4">Please login to chat with your Twin</p>
      </div>
    );
  }

  const handleSaveDecision = async (messageIndex: number) => {
    if (!session.user?.id || !currentWorld) return;

    setSavingDecisionIndex(messageIndex);

    try {
      // Find the user message and Twin response
      let userMessage = '';
      let twinMessage = '';

      for (let i = messageIndex; i >= 0; i--) {
        if (messages[i].role === 'user' && !userMessage) {
          userMessage = messages[i].content;
        }
        if (messages[i].role === 'twin' && !twinMessage) {
          twinMessage = messages[i].content;
        }
      }

      if (!userMessage || !twinMessage) {
        throw new Error('Could not find decision and response');
      }

      // Get message data
      const twinMsg = messages[messageIndex];
      const options = twinMsg.options && twinMsg.options.length > 0
        ? twinMsg.options
        : ['Accepted', 'Deferred', 'Rejected'];
      const choice = twinMsg.selectedChoice || 'Accepted';

      // Record decision with world context
      const decision = await DecisionService.recordDecision(
        session.user.id,
        currentWorld,
        userMessage,
        options,
        twinMessage,
        choice
      );

      if (decision) {
        // Mark this message index as having a saved decision
        setSavedDecisionIds(prev => new Set(prev).add(messageIndex));
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save decision';
      console.error('Save decision error:', err);
      setError(errorMsg);
    } finally {
      setSavingDecisionIndex(null);
    }
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText ?? message;
    if (!textToSend.trim()) return;

    const userMessage = textToSend.trim();
    setMessage('');
    setIsSending(true);
    setError(null);

    try {
      // GUARD: Ensure userId exists
      if (!session.user?.id) {
        throw new Error('User session lost');
      }

      // Add user message to UI immediately
      setMessages(prev => [...prev, {
        role: 'user',
        content: userMessage,
        world: currentWorld || undefined
      }]);

      // Save message to database with world tag
      await saveMessage(
        session.user.id,
        currentWorld ? `twin-chat-${currentWorld}` : 'twin-chat',
        'chat',
        'user',
        userMessage,
        50 // autonomyLevel
      );

      // Convert messages to API format (role: 'user' | 'assistant')
      const apiMessages: Array<{ role: 'user' | 'assistant'; content: string }> = messages
        .filter(m => m.role === 'user' || m.role === 'twin')
        .map(m => ({
          role: (m.role === 'twin' ? 'assistant' : 'user') as 'user' | 'assistant',
          content: m.content
        }))
        .concat([{ role: 'user' as const, content: userMessage }]);

      // P0-I: Load recent twin_memories for context injection
      // Fire-and-forget: if fetch fails, memories = [] and Twin still responds
      const recentMemories = await loadRecentMemories(
        twin.id,
        currentWorld ?? null,
      );

      // TWIN-MEMORY-001: full behavioral profile — Twin knows the user from Nova's 12 SICE engines.
      // Formatted as readable text (not raw JSON) so the LLM can use it confidently.
      // All fields null-guarded so missing data degrades gracefully.
      const a = currentAnalysis;
      const twinProfile = [
        `IDENTITY: ${twin.name} | Archetype: ${twin.primaryArchetype ?? 'unknown'}${twin.secondaryArchetype ? ` / ${twin.secondaryArchetype}` : ''} | Maturity: ${twin.maturityScore ?? 30}/100`,

        userProfile.birthDate
          ? `BIRTH DATA: ${userProfile.birthDate}${userProfile.birthTime ? ` ${userProfile.birthTime}` : ''}${userProfile.birthPlace ? ` — ${userProfile.birthPlace}` : ''}`
          : null,

        a?.selfOverview
          ? `BEHAVIORAL OVERVIEW:\n${a.selfOverview}`
          : null,

        a?.strengths?.length
          ? `STRENGTHS:\n${a.strengths.map(s => `• ${s.name}: ${s.description}`).join('\n')}`
          : null,

        a?.blindSpots?.length
          ? `BLIND SPOTS:\n${a.blindSpots.map(b => `• ${b.title} (sensitivity: ${b.sensitivity}): ${b.description}`).join('\n')}`
          : null,

        a?.behavioralPatterns?.length
          ? `BEHAVIORAL PATTERNS:\n${a.behavioralPatterns.slice(0, 5).map(p => `• [${p.type}] ${p.name}: ${p.insight}`).join('\n')}`
          : null,

        a?.journey
          ? `JOURNEY STAGE: ${a.journey.currentStage}\n${a.journey.description}\nGrowing in: ${a.journey.growing.join(', ')}\nChanging: ${a.journey.changing.join(', ')}\nStill working on: ${a.journey.stillWorking.join(', ')}`
          : null,

        a?.focusAreas?.length
          ? `FOCUS AREAS: ${a.focusAreas.join(', ')}`
          : null,

        a?.guidance?.length
          ? `GUIDANCE FROM ANALYSIS:\n${a.guidance.map(g => `• ${g}`).join('\n')}`
          : null,

        a?.nextSteps?.length
          ? `RECOMMENDED NEXT STEPS:\n${a.nextSteps.map(s => `• ${s}`).join('\n')}`
          : null,

        a?.modelAccuracy
          ? `ANALYSIS CONFIDENCE: ${Math.round(a.modelAccuracy * 100)}%`
          : null,
      ].filter(Boolean).join('\n\n');

      const twinResponse = await callTwinAPI(
        apiMessages,
        twin.name || 'Twin',
        twinProfile,
        currentWorld || undefined,
        recentMemories,             // P0-I: inject memories into [RELEVANT MEMORY]
      );

      // Save Twin's response to database (role must be 'user' | 'assistant')
      await saveMessage(
        session.user.id,
        currentWorld ? `twin-chat-${currentWorld}` : 'twin-chat',
        'chat',
        'assistant',
        twinResponse,
        50 // autonomyLevel
      );

      // Extract options from Twin response
      const options = extractOptions(twinResponse);

      // Add Twin response to messages with extracted options
      setMessages(prev => [...prev, {
        role: 'twin',
        content: twinResponse,
        world: currentWorld || undefined,
        options: options.length > 0 ? options : undefined,
      }]);

      // P0-D: record real per-world expertise growth. WorldExpertiseService
      // existed and was fully built (twin_world_expertise table) but had
      // zero production callers — expertise never actually accumulated with
      // use. Non-blocking: a failure here must not break the chat response
      // the user already received.
      if (currentWorld) {
        recordWorldInteraction(twin.id, currentWorld).catch((err) =>
          console.error('Failed to record world interaction:', err)
        );
      }

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMsg);
      console.error('Twin message error:', err);
    } finally {
      setIsSending(false);
    }
  };

  // World selection now handled by WorldTabs component using WorldContext

  /**
   * Extract options from Twin response
   * Looks for numbered lists (1., 2., 3.) or bullet points
   */
  const extractOptions = (text: string): string[] => {
    const lines = text.split('\n');
    const options: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      // Match "1. Option text" or "- Option text"
      const numberedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
      const bulletMatch = trimmed.match(/^[-•]\s+(.+)$/);

      if (numberedMatch) {
        options.push(numberedMatch[1]);
      } else if (bulletMatch) {
        options.push(bulletMatch[1]);
      }
    }

    // Return up to 5 options (reasonable limit)
    return options.slice(0, 5);
  };

  const handleSelectChoice = (messageIndex: number, choice: string) => {
    setMessages(prev =>
      prev.map((msg, idx) =>
        idx === messageIndex ? { ...msg, selectedChoice: choice } : msg
      )
    );
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      {/* World Context Header */}
      {currentWorld && <WorldContextHeader world={currentWorld} />}

      <h1 className="text-2xl font-bold text-center mb-4">
        💫 {twin.name || 'My Twin'}
      </h1>

      {/* World Selector Tabs */}
      {/* DISCONNECT-001 FIX: onWorldSelect keeps this page's own local
          currentWorld (the one actually sent to callTwinAPI) in sync with
          the tab that was clicked — previously only WorldContext updated,
          so switching tabs here never changed the AI's world context. */}
      <WorldTabs
        className="mb-4"
        onWorldSelect={(world) => {
          setLocalWorld(world);
          setCurrentWorld(world);
        }}
      />

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            {currentWorld
              ? `Start a conversation with your Twin about ${WORLDS[currentWorld]?.name || currentWorld}`
              : 'Start a conversation with your AI Twin'}
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx}>
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                  {msg.content}
                </div>
              </div>
              {/* Options selector (if Twin response has options) */}
              {msg.role === 'twin' && msg.options && msg.options.length > 0 && !savedDecisionIds.has(idx) && (
                <div className="flex flex-wrap gap-2 justify-start mt-2 ml-0">
                  {msg.options.map((option, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectChoice(idx, option)}
                      className={`text-xs px-3 py-1 rounded border transition-colors ${
                        msg.selectedChoice === option
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
              {/* Save Decision button for Twin messages */}
              {msg.role === 'twin' && currentWorld && !savedDecisionIds.has(idx) && (
                <div className="flex justify-start mt-2 ml-0">
                  <button
                    onClick={() => handleSaveDecision(idx)}
                    disabled={savingDecisionIndex === idx || (msg.options && msg.options.length > 0 && !msg.selectedChoice)}
                    className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title={msg.options && msg.options.length > 0 && !msg.selectedChoice ? 'Select an option first' : 'Save as decision'}
                  >
                    {savingDecisionIndex === idx ? 'Saving...' : '💾 Save as Decision'}
                  </button>
                </div>
              )}
              {savedDecisionIds.has(idx) && (
                <div className="flex justify-start mt-1 ml-0">
                  <span className="text-xs text-green-600 font-semibold">✅ Decision saved</span>
                </div>
              )}
            </div>
          ))
        )}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 p-3 rounded-lg">
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
          placeholder={currentWorld ? `Ask your Twin about ${WORLDS[currentWorld]?.name}...` : 'Message your Twin...'}
          disabled={isSending}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 text-sm"
        />
        <button
          onClick={() => handleSend()}
          disabled={isSending || !message.trim()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isSending ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}