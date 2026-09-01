/**
 * TwinChat.tsx
 * Personal AI Twin chat interface with world-specific expertise
 *
 * IDENTITY: Twin = Personal expert (NOT Nova)
 * PHASE: Act III+ (Life, growth, expertise per world)
 * WORLD AWARENESS: Twin adapts expertise based on current world
 * QUERY PARAM: ?world=<worldId> (optional)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useLangNavigate as useNavigate } from '../hooks/useLangNavigate';
import { useAuth } from '../context/AuthContext';
import { useTwin } from '../context/TwinContext';
import { useWorld } from '../context/WorldContext';
import { useLanguage } from '../context/LanguageContext';
import { useUserStore } from '../store/userStore';
import { useAnalysisStore } from '../store/analysisStore';
import { WORLDS, type WorldId } from '../constants/worlds';
import { WorldContextHeader } from '../components/chat/WorldContextHeader';
import { WorldTabs } from '../components/WorldTabs';
import { TwinNav } from '../components/twin/TwinNav';
import { NavRail } from '../components/layout/NavRail';
import { BottomNav } from '../components/layout/BottomNav';
import { supabase } from '@/services/supabase-service';
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

// CHATMESSAGES-001 FIX: this page used to call saveMessage() from
// supabase-service.ts, which inserts into 'chat_messages' — a table that
// migration 011_chat_messages.sql created only for the (now archived)
// offline journal-sync feature. It was never applied to the live database,
// so every call here was failing with PGRST205 "Could not find the table
// 'public.chat_messages'" (verified live on selfprint.one — every message
// sent, every reply received, both 404'd silently). Worse: this also meant
// no Twin conversation ever reached twin_memories, the table
// loadRecentMemories()/the SICE engines actually read from — so the Twin
// never accumulated real conversational memory. Writing directly to
// twin_memories instead, matching the exact shape already used successfully
// elsewhere (CoreAwakeningService.ts's birth-memory insert): twin_id,
// world_id (uppercased to match the table's CHECK constraint — WorldId
// values here are lowercase, e.g. 'career', but the constraint only allows
// 'self'/'SELF' plus uppercase for every other world), role, content.
async function saveTwinMemory(
  twinId: string,
  worldId: WorldId | null,
  role: 'user' | 'twin',
  content: string,
) {
  if (!supabase) return;
  try {
    await supabase.from('twin_memories').insert({
      twin_id: twinId,
      world_id: worldId ? worldId.toUpperCase() : 'self',
      role,
      content,
    });
  } catch {
    // Non-fatal — Twin still responds even if memory persistence fails
  }
}

/**
 * Extract options from Twin response.
 * Looks for numbered lists (1., 2., 3.) or bullet points.
 * Pure function — no component state; lives at module level.
 */
function extractOptions(text: string): string[] {
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
}

export default function TwinChat() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { twin, loading: twinLoading, setCurrentWorld } = useTwin();
  const { setCurrentWorld: setWorldContextCurrentWorld } = useWorld();
  // TWINLANG-001 FIX: this page never read the site language at all — the
  // Twin's system prompt had no language instruction (see twin-prompts.ts)
  // so it could reply in either language regardless of /th vs /en.
  const { language } = useLanguage();
  // TWINCHAT-UI-001 FIX: page had zero useLanguage-driven UI text (only the
  // AI's own replies were language-aware via TWINLANG-001) and never used
  // the .twin-container/.twin-message theme already built in nova-twin.css
  // — it rendered with raw gray/blue Tailwind utilities instead. Both fixed
  // below: isTh gates every UI string, and the JSX now uses the Twin theme.
  const isTh = language === 'th';
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
  }, [location.state, twin, session, handleSend]);

  // TWINKNOWLEDGE-001: twin.fullAnalysis is the complete, original Full
  // Analysis persisted onto the Twin row at birth (see CoreAwakening.tsx +
  // migration 034_twin_full_analysis.sql) — prefer it outright, no
  // reconstruction needed, whenever it's present.
  useEffect(() => {
    if (currentAnalysis || !twin?.fullAnalysis) return;
    setCurrentAnalysis(twin.fullAnalysis);
  }, [currentAnalysis, twin?.fullAnalysis, setCurrentAnalysis]);

  // ANALYSIS-PERSIST-001 FIX: fallback for twins created BEFORE
  // TWINKNOWLEDGE-001 (twin.fullAnalysis is null for those) — reconstructs a
  // rougher approximation from awakening_essence.personal_intelligence so
  // even older Twins aren't left with zero context. Twins created after the
  // fix above never reach this: the effect above already set currentAnalysis.
  // NOTE: data lives in awakening_essence.personal_intelligence (NOT profiles_blueprints.final_analysis)
  useEffect(() => {
    if (currentAnalysis || twin?.fullAnalysis || !session?.user?.id || !supabase) return;

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

  // TWINCHAT-STALECLOSURE-001 FIX: handleSend used to be a plain const defined
  // after the early-return guards, making it impossible to list in any hook's
  // deps array (Rules of Hooks: useCallback must precede every conditional
  // return). Moved here — before all guards — and wrapped in useCallback so the
  // useEffect at ~line 144 can safely depend on it without a stale closure.
  // extractOptions was also promoted to module level (pure function, no deps).
  const handleSend = useCallback(async (overrideText?: string) => {
    const textToSend = overrideText ?? message;
    if (!textToSend.trim()) return;

    const userMessage = textToSend.trim();
    setMessage('');
    setIsSending(true);
    setError(null);

    try {
      // GUARD: Ensure userId exists
      if (!session.user?.id) {
        throw new Error(isTh ? 'เซสชันผู้ใช้หมดอายุ' : 'User session lost');
      }

      // Add user message to UI immediately
      setMessages(prev => [...prev, {
        role: 'user',
        content: userMessage,
        world: currentWorld || undefined
      }]);

      // Save message to database with world tag
      await saveTwinMemory(twin.id, currentWorld ?? null, 'user', userMessage);

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
        language,                   // TWINLANG-001 FIX: Twin replies in the site's language
      );

      // Save Twin's response to database
      await saveTwinMemory(twin.id, currentWorld ?? null, 'twin', twinResponse);

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
      const errorMsg = err instanceof Error
        ? err.message
        : (isTh ? 'ส่งข้อความไม่สำเร็จ' : 'Failed to send message');
      setError(errorMsg);
      console.error('Twin message error:', err);
    } finally {
      setIsSending(false);
    }
  }, [message, messages, twin, session, currentWorld, currentAnalysis, userProfile, language, isTh]);

  // TWINCHAT-LOADING-001: TwinContext's fetch from Supabase is async — right
  // after login/navigation, `twin` is briefly null purely because the fetch
  // hasn't resolved yet, not because no Twin exists. The guard below used to
  // treat both cases identically ("hasn't awakened yet"), which is wrong
  // and misleading during that window. Show a neutral loading state instead
  // while TwinContext is still checking.
  if (twinLoading) {
    return (
      <div className="twin-container flex flex-col h-screen items-center justify-center text-center max-w-2xl mx-auto p-4">
        <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          {isTh ? 'กำลังโหลดทวินของคุณ...' : 'Loading your Twin...'}
        </p>
      </div>
    );
  }

  // GUARD: Check if Twin exists
  // TWINGUARD-001 FIX: this used to be small secondary-colored text with no
  // way forward — a dead end. Now large, centered, with a CTA straight into
  // Core Awakening (the only thing this screen actually needs the user to
  // do).
  if (!twin) {
    return (
      <div className="flex flex-col h-screen">
        <NavRail />
        <BottomNav />
        <div className="twin-container flex flex-col flex-1 items-center justify-center text-center max-w-2xl mx-auto p-6">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }} aria-hidden="true">💫</div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              margin: '0 0 12px',
              lineHeight: 1.3,
            }}
          >
            {isTh ? 'ทวินของคุณยังไม่ตื่น' : "Your Twin hasn't awakened yet"}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 28px', fontSize: '1rem' }}>
            {isTh
              ? 'ทำ Core Awakening ให้เสร็จก่อน เพื่อให้ทวินของคุณตื่นขึ้นและพร้อมคุยกับคุณ'
              : 'Complete Core Awakening first so your Twin can awaken and start talking with you.'}
          </p>
          <button
            onClick={() => navigate('/core-awakening')}
            style={{
              padding: '14px 32px',
              borderRadius: 12,
              border: 'none',
              background: '#6366f1',
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            {isTh ? '✨ ไปที่ Core Awakening' : '✨ Go to Core Awakening'}
          </button>
        </div>
      </div>
    );
  }

  // GUARD: Check if user is logged in
  if (!session?.user?.id) {
    return (
      <div className="twin-container flex flex-col h-screen items-center justify-center text-center max-w-2xl mx-auto p-4">
        <p className="mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          {isTh ? 'กรุณาเข้าสู่ระบบเพื่อคุยกับทวินของคุณ' : 'Please login to chat with your Twin'}
        </p>
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
        throw new Error(
          isTh ? 'ไม่พบข้อความคำถามและคำตอบ' : 'Could not find decision and response'
        );
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
      const errorMsg = err instanceof Error
        ? err.message
        : (isTh ? 'บันทึกการตัดสินใจไม่สำเร็จ' : 'Failed to save decision');
      console.error('Save decision error:', err);
      setError(errorMsg);
    } finally {
      setSavingDecisionIndex(null);
    }
  };

  // World selection now handled by WorldTabs component using WorldContext

  const handleSelectChoice = (messageIndex: number, choice: string) => {
    setMessages(prev =>
      prev.map((msg, idx) =>
        idx === messageIndex ? { ...msg, selectedChoice: choice } : msg
      )
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <NavRail />
      {/* TWINCHAT-EXIT-001 FIX: this page only ever rendered NavRail
          (desktop-only, hidden below 1024px) and TwinNav's own BackButton
          is deliberately hidden on the 'chat' tab (see TwinNav.tsx) since
          /chat/twin is a BottomNav root destination — except BottomNav
          itself was never actually rendered here, so on mobile there was
          truly no way out of this page at all ("ไม่มีปุ่มออก"). Same
          NavRail+BottomNav pairing every other root tab page (Dashboard,
          WorldsHub) already uses. */}
      <BottomNav />
      {/* APPSHELL-004: Twin app-space sub-nav — Conversation / What Twin
          Knows / Personality / Settings. Sits above the chat column, not
          inside it, so the conversation itself stays a plain focused
          column (no Dashboard-style cards wrapping it). */}
      <TwinNav currentTab="chat" />
      <div className="twin-container flex flex-col flex-1 min-h-0 max-w-2xl mx-auto p-4 w-full">
      {/* World Context Header */}
      {currentWorld && <WorldContextHeader world={currentWorld} />}

      <div className="twin-header text-center mb-4">
        <span className="twin-label">{isTh ? 'ทวินของคุณ' : 'Your Twin'}</span>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)', margin: 0 }}>
          💫 {twin.name || (isTh ? 'ทวินของฉัน' : 'My Twin')}
        </h1>
      </div>

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
          <div className="text-center py-8" style={{ color: 'var(--color-text-tertiary)' }}>
            {currentWorld
              ? (isTh
                  ? `เริ่มคุยกับทวินเรื่อง${WORLDS[currentWorld]?.nameTh || WORLDS[currentWorld]?.name || currentWorld}`
                  : `Start a conversation with your Twin about ${WORLDS[currentWorld]?.name || currentWorld}`)
              : (isTh ? 'เริ่มคุยกับทวิน AI ของคุณ' : 'Start a conversation with your AI Twin')}
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={`${idx}-${msg.role}`}>
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user' ? 'twin-message-user rounded-br-none' : 'twin-message rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
              {/* Options selector (if Twin response has options) */}
              {msg.role === 'twin' && msg.options && msg.options.length > 0 && !savedDecisionIds.has(idx) && (
                <div className="flex flex-wrap gap-2 justify-start mt-2 ml-0">
                  {msg.options.map((option, optIdx) => (
                    <button
                      key={option || optIdx}
                      onClick={() => handleSelectChoice(idx, option)}
                      className={`text-xs px-3 py-1 rounded border transition-colors ${
                        msg.selectedChoice === option
                          ? 'text-white'
                          : 'hover:opacity-80'
                      }`}
                      style={
                        msg.selectedChoice === option
                          ? { background: '#6366f1', borderColor: '#6366f1' }
                          : {
                              background: 'var(--color-bg-primary)',
                              color: 'var(--color-text-secondary)',
                              borderColor: 'var(--color-border)',
                            }
                      }
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
                    title={
                      msg.options && msg.options.length > 0 && !msg.selectedChoice
                        ? (isTh ? 'เลือกตัวเลือกก่อน' : 'Select an option first')
                        : (isTh ? 'บันทึกเป็นการตัดสินใจ' : 'Save as decision')
                    }
                  >
                    {savingDecisionIndex === idx
                      ? (isTh ? 'กำลังบันทึก...' : 'Saving...')
                      : `💾 ${isTh ? 'บันทึกเป็นการตัดสินใจ' : 'Save as Decision'}`}
                  </button>
                </div>
              )}
              {savedDecisionIds.has(idx) && (
                <div className="flex justify-start mt-1 ml-0">
                  <span className="text-xs text-green-600 font-semibold">
                    ✅ {isTh ? 'บันทึกการตัดสินใจแล้ว' : 'Decision saved'}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
        {isSending && (
          <div className="flex justify-start">
            <div className="twin-message p-3 rounded-lg rounded-bl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#6366f1' }} />
                <div className="w-2 h-2 rounded-full animate-bounce delay-100" style={{ background: '#6366f1' }} />
                <div className="w-2 h-2 rounded-full animate-bounce delay-200" style={{ background: '#6366f1' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      {/* TWINCHAT-COMPOSER-001 FIX: composer used to stretch full-width with
          small (text-sm) type and a thin single-pixel border — read as a
          generic web chatbot text box. Now hugs the right side of the
          column (justify-end + a capped input width instead of flex-1),
          with bigger text/padding and a visible 2px border so it reads as
          a deliberate app input, not a chat widget. */}
      <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid var(--color-border)', justifyContent: 'flex-end' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSend()}
          placeholder={
            currentWorld
              ? (isTh
                  ? `ถามทวินเรื่อง${WORLDS[currentWorld]?.nameTh || WORLDS[currentWorld]?.name}...`
                  : `Ask your Twin about ${WORLDS[currentWorld]?.name}...`)
              : (isTh ? 'ส่งข้อความถึงทวินของคุณ...' : 'Message your Twin...')
          }
          disabled={isSending}
          className="p-4 rounded-xl focus:outline-none focus:ring-2 disabled:opacity-50 text-base"
          style={{
            width: 'min(100%, 440px)',
            flex: '0 1 auto',
            border: '2px solid var(--color-border)',
            background: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)',
            fontSize: '1.05rem',
          }}
        />
        <button
          onClick={() => handleSend()}
          disabled={isSending || !message.trim()}
          className="px-7 py-4 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base transition-colors hover:opacity-90"
          style={{ background: '#6366f1', flexShrink: 0 }}
        >
          {isSending ? '...' : (isTh ? 'ส่ง' : 'Send')}
        </button>
      </div>
      </div>
    </div>
  );
}