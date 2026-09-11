/**
 * ImmersiveTwinChat.tsx — Living Space for Twin Conversation
 *
 * Full-screen immersive experience:
 *   LAYER 0: WorldEnvironment (animated contextual background)
 *   LAYER 1: Canonical Twin (full presence, centered/lower-middle)
 *   LAYER 2: Contextual effects (particles, light)
 *   LAYER 3: Primary Controls (input + send)
 *   LAYER 4: Temporary UI (drawers/sheets for WorldTabs, TwinNav, etc.)
 *
 * Preserves ALL existing chat business logic from TwinChat.tsx:
 *   - Message send/receive via callTwinAPI
 *   - Memory persistence to twin_memories
 *   - SICE context injection (fullAnalysis, userProfile, memories)
 *   - World-aware expertise
 *   - Decision logging
 *   - Language support (Thai/English)
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useLangNavigate as useNavigate } from '@/hooks/useLangNavigate';
import { useAuth } from '@/context/AuthContext';
import { useTwin } from '@/context/TwinContext';
import { useWorld } from '@/context/WorldContext';
import { useLanguage } from '@/context/LanguageContext';
import { useUserStore } from '@/store/userStore';
import { useAnalysisStore } from '@/store/analysisStore';
import { WORLDS, type WorldId } from '@/constants/worlds';
import type { Decision, DecisionOutcome } from '@/types/decision';
import { WorldTransitionEngine } from '@/lib/visual/WorldTransitionEngine';
import { AppShell } from '@/components/layout/AppShell';
import { supabase } from '@/services/supabase-service';
import { callTwinAPI } from '@/services/TwinAPIService';
import { loadRecentMemories } from '@/lib/memory/loadRecentMemories';
import { recordWorldInteraction } from '@/services/WorldExpertiseService';
import * as DecisionService from '@/services/DecisionService';
import { Twin } from '@/components/twin/Twin';
import { WorldEnvironment } from '@/components/world/WorldEnvironment';
import { useTwinStates } from '@/hooks/useTwinStates';
import { Helmet } from 'react-helmet-async';
import { getSeoMetadata } from '@/constants/seoMetadata';
import { ProvenanceStrip } from '@/components/story/ProvenanceStrip';
import type { CSSProperties } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'twin';
  content: string;
  world?: WorldId;
  options?: string[];
  selectedChoice?: string;
}

// ─── Database helpers (same as original TwinChat) ─────────────────────────────

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
    // Non-fatal
  }
}

function extractOptions(text: string): string[] {
  const lines = text.split('\n');
  const options: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    const numberedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    const bulletMatch = trimmed.match(/^[-•]\s+(.+)$/);
    if (numberedMatch) options.push(numberedMatch[1]);
    else if (bulletMatch) options.push(bulletMatch[1]);
  }
  return options.slice(0, 5);
}

// ─── World Drawer Component ───────────────────────────────────────────────────

function WorldDrawer({
  isOpen,
  currentWorld,
  onSelect,
  onClose,
  isTh,
}: {
  isOpen: boolean;
  currentWorld: WorldId | null;
  onSelect: (world: WorldId) => void;
  onClose: () => void;
  isTh: boolean;
}) {
  return (
    <>
      <div className={`immersive-overlay-backdrop ${isOpen ? 'is-open' : ''}`} onClick={onClose} />
      <div className={`immersive-drawer ${isOpen ? 'is-open' : ''}`}>
        <div className="drawer-handle" />
        <div className="immersive-panel-header">
          <h3 className="immersive-panel-title">{isTh ? 'โลก' : 'Worlds'}</h3>
          <button className="immersive-panel-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
          {Object.values(WORLDS).map((w) => (
            <button
              key={w.id}
              onClick={() => { onSelect(w.id); onClose(); }}
              style={{
                padding: '10px 8px',
                borderRadius: 12,
                border: currentWorld === w.id ? `2px solid ${w.color}` : '1px solid var(--color-border)',
                background: currentWorld === w.id ? `${w.color}22` : 'transparent',
                color: 'var(--color-text-primary)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 4 }}>{w.emoji ?? '🌍'}</div>
              {isTh ? w.nameTh : w.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ImmersiveTwinChat() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { twin, loading: twinLoading, setCurrentWorld } = useTwin();
  const { setCurrentWorld: setWorldContextCurrentWorld } = useWorld();
  const { language } = useLanguage();
  const isTh = language === 'th';
  const seoData = getSeoMetadata('twin', language);

  const userProfile = useUserStore(s => s.profile);
  const updateProfile = useUserStore(s => s.updateProfile);
  const currentAnalysis = useAnalysisStore(s => s.currentAnalysis);
  const setCurrentAnalysis = useAnalysisStore(s => s.setCurrentAnalysis);
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [_error, setError] = useState<string | null>(null);
  const [currentWorld, setLocalWorld] = useState<WorldId | null>(null);
  const [savingDecisionIndex, setSavingDecisionIndex] = useState<number | null>(null);
  const [savedDecisionIds, setSavedDecisionIds] = useState<Set<number>>(new Set());
  const autoSentInitialMessage = useRef(false);

  // Twin interaction states
  const {
    current: _twinState,
    startListening,
    stopListening,
    startThinking,
    stopThinking,
    startResponding,
    stopResponding,
    cssVars: twinStateCssVars,
  } = useTwinStates('idle');

  // World drawer
  const [showWorldDrawer, setShowWorldDrawer] = useState(false);

  // World transition tracking
  const transitionEngine = useMemo(() => new WorldTransitionEngine(), []);
  const [transitioning, setTransitioning] = useState(false);
  const [_activeTransition, setActiveTransition] = useState<string | null>(null);

  // Handle world change with narrative transition
  const handleWorldChange = useCallback((newWorld: WorldId) => {
    const oldWorld = currentWorld;
    const config = transitionEngine.computeTransition(oldWorld, newWorld);

    if (config.type !== 'none') {
      setTransitioning(true);
      setActiveTransition(config.type);

      // Trigger CSS animations
      const container = document.querySelector('.world-transition-container');
      if (container instanceof HTMLElement) {
        container.className = `world-transition-container world-transition--${config.type}`;
      }

      // Clear transition after animation completes
      setTimeout(() => {
        setTransitioning(false);
        setActiveTransition(null);
        transitionEngine.clearTransition();
      }, config.duration);
    } else {
      transitionEngine.clearTransition();
    }
  }, [currentWorld, transitionEngine]);

  // Loading guard
  if (twinLoading) {
    return (
      <AppShell hideNav>
        <div className="immersive-page" style={{ background: 'var(--color-bg-primary)' }}>
          <div className="flex items-center justify-center h-full">
            <p style={{ color: 'var(--color-text-secondary)' }}>
              {isTh ? 'กำลังโหลดทวินของคุณ...' : 'Loading your Twin...'}
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  // No twin yet
  if (!twin) {
    return (
      <AppShell hideNav>
        <div className="immersive-page">
          <WorldEnvironment worldId="self" />
          <div className="flex flex-col items-center justify-center h-full p-6" style={{ position: 'relative', zIndex: 30 }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }} aria-hidden="true">💫</div>
            <h1 style={{ fontSize: 'clamp(1.25rem, 6vw, 1.75rem)', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 12px', lineHeight: 1.3 }}>
              {isTh ? 'Twin ของคุณยังไม่ตื่น' : "Your Twin hasn't awakened yet"}
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 28px', fontSize: '1rem' }}>
              {isTh ? 'ทำ Core Awakening ให้เสร็จก่อน เพื่อให้ทวินของคุณตื่นขึ้นและพร้อมคุยกับคุณ' : 'Complete Core Awakening first so your Twin can awaken and start talking with you.'}
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
              {`✨ ${isTh ? 'ตื่นรู้ตัวตน' : 'Core Awakening'}`}
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  // Not logged in
  if (!session?.user?.id) {
    return (
      <AppShell hideNav>
        <div className="immersive-page">
          <WorldEnvironment worldId="self" />
          <div className="flex items-center justify-center h-full">
            <p style={{ color: 'var(--color-text-secondary)' }}>
              {isTh ? 'กรุณาเข้าสู่ระบบเพื่อคุยกับทวินของคุณ' : 'Please login to chat with your Twin'}
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  // ─── Sync world param from URL ──────────────────────────────────────────
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

  // ─── Auto-send initial message from route state ─────────────────────────
  useEffect(() => {
    if (!twin || !session?.user?.id) return;
    const initial = (location.state as { initialMessage?: string } | null)?.initialMessage;
    if (initial && !autoSentInitialMessage.current) {
      autoSentInitialMessage.current = true;
      handleSend(initial);
    }
  }, [location.state, twin, session]);

  // ─── Load analysis from Twin.fullAnalysis ───────────────────────────────
  useEffect(() => {
    if (currentAnalysis || !twin?.fullAnalysis) return;
    setCurrentAnalysis(twin.fullAnalysis);
  }, [currentAnalysis, twin?.fullAnalysis, setCurrentAnalysis]);

  // ─── Recover birth date from DB ─────────────────────────────────────────
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
  }, [session?.user?.id, userProfile.birthDate, updateProfile]);

  // ─── Build twinProfile for API call ─────────────────────────────────────
  const twinProfile = useMemo(() => {
    const a = currentAnalysis ?? twin?.fullAnalysis ?? null;
    const parts = [
      `IDENTITY: ${twin.name} | Archetype: ${twin.primaryArchetype ?? 'unknown'}${twin.secondaryArchetype ? ` / ${twin.secondaryArchetype}` : ''} | Maturity: ${twin.maturityScore ?? 30}/100`,
      userProfile.birthDate
        ? `BIRTH DATA: ${userProfile.birthDate}${userProfile.birthTime ? ` ${userProfile.birthTime}` : ''}${userProfile.birthPlace ? ` — ${userProfile.birthPlace}` : ''}`
        : null,
      a?.selfOverview ? `BEHAVIORAL OVERVIEW:\n${a.selfOverview}` : null,
      a?.strengths?.length ? `STRENGTHS:\n${a.strengths.map(s => `• ${s.name}: ${s.description}`).join('\n')}` : null,
      a?.blindSpots?.length ? `BLIND SPOTS:\n${a.blindSpots.map(b => `• ${b.title} (sensitivity: ${b.sensitivity}): ${b.description}`).join('\n')}` : null,
      a?.behavioralPatterns?.length ? `BEHAVIORAL PATTERNS:\n${a.behavioralPatterns.slice(0, 5).map(p => `• [${p.type}] ${p.name}: ${p.insight}`).join('\n')}` : null,
      a?.journey ? `JOURNEY STAGE: ${a.journey.currentStage}\n${a.journey.description}\nGrowing in: ${a.journey.growing.join(', ')}\nChanging: ${a.journey.changing.join(', ')}\nStill working on: ${a.journey.stillWorking.join(', ')}` : null,
      a?.focusAreas?.length ? `FOCUS AREAS: ${a.focusAreas.join(', ')}` : null,
      a?.guidance?.length ? `GUIDANCE FROM ANALYSIS:\n${a.guidance.map(g => `• ${g}`).join('\n')}` : null,
      a?.nextSteps?.length ? `RECOMMENDED NEXT STEPS:\n${a.nextSteps.map(s => `• ${s}`).join('\n')}` : null,
      a?.modelAccuracy ? `ANALYSIS CONFIDENCE: ${Math.round(a.modelAccuracy * 100)}%` : null,
    ].filter(Boolean).join('\n\n');
    return parts;
  }, [currentAnalysis, twin, userProfile]);

  // ─── Top insight for header ─────────────────────────────────────────────
  const topInsight = useMemo(() => {
    const a = currentAnalysis ?? twin?.fullAnalysis ?? null;
    if (!a) return null;
    return a.guidance?.[0] || a.focusAreas?.[0] || a.selfOverview || null;
  }, [currentAnalysis, twin?.fullAnalysis]);

  // ─── Choice consequence ─────────────────────────────────────────────────
  const [choiceConsequence, setChoiceConsequence] = useState<{
    decision: Decision;
    outcome: DecisionOutcome;
  } | null>(null);

  useEffect(() => {
    if (!twin?.id) return;
    let cancelled = false;
    DecisionService.getUserDecisions(twin.id, currentWorld ?? undefined)
      .then(async (decisions) => {
        if (cancelled || decisions.length === 0) return;
        const recent = decisions.slice(0, 10);
        const outcomesByDecision = await DecisionService.getDecisionOutcomesBatch(recent.map(d => d.id));
        for (const decision of recent) {
          const outcomes = outcomesByDecision.get(decision.id) ?? [];
          if (outcomes.length > 0 && !cancelled) {
            const latest = outcomes[outcomes.length - 1];
            setChoiceConsequence({ decision, outcome: latest });
            return;
          }
        }
        if (!cancelled) setChoiceConsequence(null);
      })
      .catch(() => { if (!cancelled) setChoiceConsequence(null); });
    return () => { cancelled = true; };
  }, [twin?.id, currentWorld]);

  // ─── Handle send ────────────────────────────────────────────────────────
  const handleSend = useCallback(async (overrideText?: string) => {
    const textToSend = overrideText ?? message;
    if (!textToSend.trim()) return;
    if (!twin || !session) return;

    const userMessage = textToSend.trim();
    setMessage('');
    setIsSending(true);
    setError(null);

    try {
      if (!session?.user?.id) {
        throw new Error(isTh ? 'เซสชันผู้ใช้หมดอายุ' : 'User session lost');
      }

      setMessages(prev => [...prev, {
        role: 'user',
        content: userMessage,
        world: currentWorld || undefined
      }]);

      await saveTwinMemory(twin.id, currentWorld ?? null, 'user', userMessage);

      const apiMessages: Array<{ role: 'user' | 'assistant'; content: string }> = messages
        .filter(m => m.role === 'user' || m.role === 'twin')
        .map(m => ({
          role: (m.role === 'twin' ? 'assistant' : 'user') as 'user' | 'assistant',
          content: m.content
        }))
        .concat([{ role: 'user' as const, content: userMessage }]);

      const recentMemories = await loadRecentMemories(twin.id, currentWorld ?? null);

      // Trigger listening state
      startListening();

      const twinResponse = await callTwinAPI(
        apiMessages,
        twin.name || 'Twin',
        twinProfile,
        currentWorld || undefined,
        recentMemories,
        language,
      );

      await saveTwinMemory(twin.id, currentWorld ?? null, 'twin', twinResponse);

      const options = extractOptions(twinResponse);

      // Stop listening, start thinking briefly, then responding
      stopListening();
      startThinking();

      setMessages(prev => [...prev, {
        role: 'twin',
        content: twinResponse,
        world: currentWorld || undefined,
        options: options.length > 0 ? options : undefined,
      }]);

      stopThinking();
      startResponding();

      if (currentWorld) {
        recordWorldInteraction(twin.id, currentWorld).catch((err) =>
          console.error('Failed to record world interaction:', err)
        );
      }

      setTimeout(() => stopResponding(), 1500);

    } catch (err) {
      const errorMsg = err instanceof Error
        ? err.message
        : (isTh ? 'ส่งข้อความไม่สำเร็จ' : 'Failed to send message');
      setError(errorMsg);
      console.error('Twin message error:', err);
      stopListening();
      stopThinking();
      stopResponding();
    } finally {
      setIsSending(false);
    }
  }, [message, messages, twin, session, currentWorld, twinProfile, language, isTh, startListening, stopListening, startThinking, stopThinking, startResponding, stopResponding]);

  // ─── Decision handling ──────────────────────────────────────────────────
  const handleSaveDecision = async (messageIndex: number) => {
    if (!session.user?.id || !currentWorld) return;
    setSavingDecisionIndex(messageIndex);
    try {
      let userMessage = '';
      let twinMessage = '';
      for (let i = messageIndex; i >= 0; i--) {
        if (messages[i].role === 'user' && !userMessage) userMessage = messages[i].content;
        if (messages[i].role === 'twin' && !twinMessage) twinMessage = messages[i].content;
      }
      if (!userMessage || !twinMessage) {
        throw new Error(isTh ? 'ไม่พบข้อความคำถามและคำตอบ' : 'Could not find decision and response');
      }
      const twinMsg = messages[messageIndex];
      const options = twinMsg.options && twinMsg.options.length > 0 ? twinMsg.options : ['Accepted', 'Deferred', 'Rejected'];
      const choice = twinMsg.selectedChoice || 'Accepted';
      const decision = await DecisionService.recordDecision(session.user.id, currentWorld, userMessage, options, twinMessage, choice);
      if (decision) setSavedDecisionIds(prev => new Set(prev).add(messageIndex));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : (isTh ? 'บันทึกการตัดสินใจไม่สำเร็จ' : 'Failed to save decision');
      console.error('Save decision error:', err);
      setError(errorMsg);
    } finally {
      setSavingDecisionIndex(null);
    }
  };

  const handleSelectChoice = (messageIndex: number, choice: string) => {
    setMessages(prev => prev.map((msg, idx) => idx === messageIndex ? { ...msg, selectedChoice: choice } : msg));
  };

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      {seoData && (
        <Helmet>
          <title>{seoData.title}</title>
          <meta name="description" content={seoData.description} />
          {seoData.keywords && <meta name="keywords" content={seoData.keywords.join(', ')} />}
          {seoData.ogImage && <meta property="og:image" content={seoData.ogImage} />}
          <link rel="canonical" href={`/${language}/chat/twin`} />
        </Helmet>
      )}

      <AppShell hideNav>
        <div className="immersive-page">
          {/* World Transition Container (between Layer 0 and Layer 1) */}
          <div className="world-transition-container" />

          {/* Lighting transition flash */}
          {transitioning && (
            <div className="lighting-transition-overlay is-active" />
          )}

          {/* Layer 0: World Environment */}
          <div className="layer-world">
            <WorldEnvironment worldId={currentWorld || 'self'} />
          </div>

          {/* Layer 1: Canonical Twin */}
          <div className="layer-twin" style={twinStateCssVars as CSSProperties}>
            <div className="twin-presence-wrap">
              <Twin
                variant="presence"
                primaryArchetype={twin.primaryArchetype}
                secondaryArchetype={twin.secondaryArchetype}
                worldColor={currentWorld ? (WORLDS[currentWorld]?.color ?? '#22D3EE') : '#22D3EE'}
                seedKey={session.user.id ?? twin.id}
                maturityScore={twin.maturityScore}
              />
            </div>
          </div>

          {/* Layer 3+4: Content area with chat and controls */}
          <div className="immersive-content">
            {/* Minimal header — Twin label + world + actions */}
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 35,
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pointerEvents: 'none',
            }}>
              {/* Left: Twin label */}
              <div style={{ pointerEvents: 'auto' }}>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#A5B4FC',
                  letterSpacing: 0.5,
                }}>
                  💫 {isTh ? 'ทวินของคุณ' : 'Your Twin'}
                </span>
                {topInsight && (
                  <p style={{
                    fontSize: 12,
                    color: 'var(--color-text-tertiary)',
                    margin: '2px 0 0',
                    maxWidth: 200,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {topInsight}
                  </p>
                )}
              </div>

              {/* Right: World button + settings */}
              <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
                <button
                  onClick={() => setShowWorldDrawer(true)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: '1px solid var(--glass-border)',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(12px)',
                    color: 'var(--color-text-primary)',
                    fontSize: 16,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={isTh ? 'เลือกโลก' : 'Select world'}
                >
                  🌍
                </button>
              </div>
            </div>

            {/* Choice consequence — shown above messages */}
            {choiceConsequence && (
              <div style={{ padding: '0 16px', marginTop: 60, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
                <ProvenanceStrip patternCount={undefined} />
              </div>
            )}

            {/* Messages area */}
            <div className="immersive-chat-area">
              {messages.length === 0 ? (
                <div className="text-center py-12" style={{ color: 'var(--color-text-tertiary)' }}>
                  {currentWorld
                    ? (isTh ? `เริ่มคุยกับทวินเรื่อง${WORLDS[currentWorld]?.nameTh || WORLDS[currentWorld]?.name || currentWorld}` : `Start a conversation with your Twin about ${WORLDS[currentWorld]?.name || currentWorld}`)
                    : (isTh ? 'เริ่มคุยกับทวิน AI ของคุณ' : 'Start a conversation with your AI Twin')}
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={`${idx}-${msg.role}`} style={{ marginBottom: 8 }}>
                    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`immersive-message ${msg.role === 'user' ? 'immersive-message--user' : 'immersive-message--twin'}`}>
                        {msg.content}
                      </div>
                    </div>
                    {/* Options */}
                    {msg.role === 'twin' && msg.options && msg.options.length > 0 && !savedDecisionIds.has(idx) && (
                      <div className="flex flex-wrap gap-2 justify-start mt-2">
                        {msg.options.map((option, optIdx) => (
                          <button
                            key={option || optIdx}
                            onClick={() => handleSelectChoice(idx, option)}
                            style={{
                              padding: '4px 12px',
                              borderRadius: 16,
                              fontSize: 12,
                              border: msg.selectedChoice === option ? '1.5px solid #6366f1' : '1px solid var(--color-border)',
                              background: msg.selectedChoice === option ? '#6366f1' : 'var(--color-bg-primary)',
                              color: msg.selectedChoice === option ? 'white' : 'var(--color-text-secondary)',
                              cursor: 'pointer',
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Save decision */}
                    {msg.role === 'twin' && currentWorld && !savedDecisionIds.has(idx) && (
                      <div className="flex justify-start mt-1">
                        <button
                          onClick={() => handleSaveDecision(idx)}
                          disabled={savingDecisionIndex === idx || (msg.options && msg.options.length > 0 && !msg.selectedChoice)}
                          style={{
                            fontSize: 11,
                            padding: '3px 10px',
                            background: 'var(--color-bg-tertiary)',
                            borderRadius: 8,
                            border: 'none',
                            color: 'var(--color-text-secondary)',
                            cursor: 'pointer',
                            opacity: (msg.options && msg.options.length > 0 && !msg.selectedChoice) ? 0.5 : 1,
                          }}
                        >
                          {savingDecisionIndex === idx
                            ? (isTh ? 'กำลังบันทึก...' : 'Saving...')
                            : `💾 ${isTh ? 'บันทึกเป็นการตัดสินใจ' : 'Save as Decision'}`}
                        </button>
                      </div>
                    )}
                    {savedDecisionIds.has(idx) && (
                      <div className="flex justify-start mt-1">
                        <span className="text-xs" style={{ color: '#10B981', fontWeight: 600 }}>
                          ✅ {isTh ? 'บันทึกการตัดสินใจแล้ว' : 'Decision saved'}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
              {isSending && (
                <div className="flex justify-start">
                  <div className="immersive-message immersive-message--twin">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#6366f1' }} />
                      <div className="w-2 h-2 rounded-full animate-bounce delay-100" style={{ background: '#6366f1' }} />
                      <div className="w-2 h-2 rounded-full animate-bounce delay-200" style={{ background: '#6366f1' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Layer 3: Primary Controls — input + send */}
            <div className="layer-primary">
              <div className="primary-controls">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSend()}
                  placeholder={
                    currentWorld
                      ? `${language === 'th' ? 'ถามทวินเรื่อง' : 'Ask your Twin about'} ${WORLDS[currentWorld]?.nameTh || WORLDS[currentWorld]?.name}...`
                      : (isTh ? 'พิมพ์ข้อความ...' : 'Type a message...')
                  }
                  disabled={isSending}
                  className="primary-input"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isSending || !message.trim()}
                  className="primary-send-btn"
                >
                  {isSending ? '...' : (isTh ? 'ส่ง' : 'Send')}
                </button>
              </div>
            </div>
          </div>

          {/* Layer 4: World Drawer */}
          <WorldDrawer
            isOpen={showWorldDrawer}
            currentWorld={currentWorld}
            onSelect={(world) => {
              setLocalWorld(world);
              setCurrentWorld(world);
              handleWorldChange(world);
            }}
            onClose={() => setShowWorldDrawer(false)}
            isTh={isTh}
          />
        </div>
      </AppShell>
    </>
  );
}
