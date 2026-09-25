import React, { useState, useEffect } from 'react';
import { useLangNavigate as useNavigate } from '../hooks/useLangNavigate';
import { getDecisionLogs } from '../services/supabase-service';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useWorld } from '../context/WorldContext';
import { useTwin } from '../context/TwinContext';
import { useLifecycleStore } from '../store/lifecycleStore';
import { MetaTagManager } from '../components/MetaTagManager';
import { getSeoMetadata } from '../constants/seoMetadata';
import LivingTwin from '../components/dashboard/LivingTwin';
import ExecutiveSummary from '../components/dashboard/ExecutiveSummary';
import { ExplorWorldsCard } from '../components/dashboard/ExplorWorldsCard';
import { AmbientBadge } from '../components/experience/AmbientBadge'; // §46
import { SoundscapePlayer } from '../components/audio'; // §46
import { TwinEvolution } from '../components/twin/TwinEvolution'; // §30
import { TodaySection } from '../components/today/TodaySection'; // §5.2 Dynamic Home
import { NarrativeHook } from '../components/story/NarrativeHook'; // §51 Layer 3
import { CurrentChapter } from '../components/story/CurrentChapter'; // §51 Layer 2
import { AppShell } from '../components/layout/AppShell';
import UserAvatar from '../components/account/UserAvatar';
import '../styles/dashboard.css';
// TC-106: LivingDiagram DataDriver — flag-gated (VITE_FEATURE_LIVING_DIAGRAM)
import { isFeatureEnabled } from '../lib/featureFlags';
import LivingDiagram from '../components/living/LivingDiagram';
import { loadTwinDNA } from '../lib/twinVisualDNA';
import type { TwinVisualDNA } from '../lib/twinVisualDNA';
// TC-111: SoftwareApplication schema (AEO)
import { dashboardSoftwareApplicationSchema } from '../lib/aeoSchemas';
// TC-205: unified pipeline — LivingDiagram ← twinStore.current
import { useTwinStore } from '../store/twinStore';

interface DecisionLog {
  id: string;
  created_at: string;
  hub: string;
  mood: string;
  autonomy_level: number;
  confidence: number;
  response_time_ms: number;
  message_length: number;
  response_length: number;
}

const Dashboard: React.FC = () => {
  // userId มาจาก Supabase Auth session จริง (ไม่ใช่ localStorage 'userId' เดิม
  // ที่ไม่มีที่ไหนเคย set — เป็น bug เดิมที่ทำให้ insights/trend ว่างเปล่าตลอด
  // ดู docs/HANDOFF_2026-08-09_PHASE5_UNIFIED.md หัวข้อ 5.4)
  const { session } = useAuth();
  const userId = session?.user?.id || '';
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isTh = language === 'th';
  // P0 #5: World context for world-specific insights (reserved for future use)
  useWorld();
  // TWIN-VISUAL-001: get maturityScore for LivingTwin evolution
  const { twin } = useTwin();
  // RECOVERY-001: lifecycle status drives the resume entry banner below
  const lifecycleStatus = useLifecycleStore((state) => state.status);
  const seoData = getSeoMetadata('dashboard', language);

  // TC-106: LivingDiagram data — DNA + 12 SICE scores + confidence proxy.
  // scores มาจาก onboarding_sice_snapshot (persisted ตอน handleFinetuneSubmit);
  // confidence proxy = twin.maturityScore/100 (0..1); version จาก DNA.
  const [dnaScores, setDnaScores] = useState<number[] | null>(null);
  useEffect(() => {
    if (!isFeatureEnabled('LIVING_DIAGRAM')) return;
    try {
      const raw = localStorage.getItem('onboarding_sice_snapshot');
      if (!raw) return;
      const snap = JSON.parse(raw) as { scores?: { engineName: string; score: number }[] };
      if (!Array.isArray(snap.scores) || snap.scores.length === 0) return;
      const scores = Array.from({ length: 12 }, (_, i) => {
        const s = snap.scores?.[i]?.score;
        return typeof s === 'number' ? Math.max(0, Math.min(1, s / 100)) : 0.5;
      });
      setDnaScores(scores);
    } catch { /* corrupted snapshot — defaults remain */ }
  }, []);

  const livingDna: TwinVisualDNA | undefined = isFeatureEnabled('LIVING_DIAGRAM')
    ? loadTwinDNA() ?? undefined
    : undefined;
  const livingConfidence = twin ? Math.max(0, Math.min(1, (twin.maturityScore ?? 30) / 100)) : undefined;

  // TC-205: UNIFIED_PIPELINE on → twinStore.current (UnifiedAnalysis) leads:
  // scores/confidence/version มาจาก mergeLayers จริง ไม่ใช่ localStorage proxy
  const pipelineOn = isFeatureEnabled('UNIFIED_PIPELINE');
  const storeCurrent = useTwinStore((s) => s.current);
  const diagramScores = storeCurrent?.scores ?? dnaScores ?? undefined;
  const diagramConfidence = pipelineOn && storeCurrent ? storeCurrent.confidence : livingConfidence;
  const diagramVersion = pipelineOn && storeCurrent ? storeCurrent.version : livingDna?.version;

  // APPSHELL-002 FIX: Dashboard only needs the 3 most recent decision logs
  // for the preview strip below — the full filterable/exportable log now
  // lives on IntelligenceHub.tsx (see "Deep Intelligence" link below).
  const [logs, setLogs] = useState<DecisionLog[]>([]);

  useEffect(() => {
    if (!userId) return;

    const fetchLogs = async () => {
      const data = await getDecisionLogs(userId, undefined, undefined, undefined, undefined, 3);
      setLogs(data);
    };

    fetchLogs();
  }, [userId]);

  return (
    <>
      {seoData && (
        <MetaTagManager
          title={seoData.title}
          description={seoData.description}
          keywords={seoData.keywords?.join(', ')}
          ogImage={seoData.ogImage}
          canonicalUrl={`/${language}/dashboard`}
          additionalScripts={[
            // TC-111: SoftwareApplication — dashboard feature surface (AEO)
            {
              type: 'application/ld+json',
              content: JSON.stringify(dashboardSoftwareApplicationSchema(
                language === 'th' ? 'th-TH' : 'en-US',
                `https://selfprint.one/${language}/dashboard`,
              )),
            },
          ]}
        />
      )}
      <AppShell>
        {/* TwinEvolution renders as an overlay — it reads from context,
            no layout impact on the shell */}
        {userId && <TwinEvolution />}
        <div className="page-content">
          <div className="dashboard" data-testid="dashboard-container">

          {/* RECOVERY-001: Resume entry — V5 §4 requires existing users get a clear
              continuation point instead of repeating a completed journey */}
          {lifecycleStatus === 'TWIN_ALIVE' && (
            <div className="dashboard-resume-banner">
              <p className="dashboard-resume-banner__text">✨ {isTh ? 'Twin ของคุณพร้อมแล้ว' : 'Your Twin is ready'}</p>
              <button
                className="dashboard-resume-banner__cta"
                onClick={() => navigate('/chat/twin')}
              >
                {isTh ? 'เข้าสู่ Twin ของคุณ →' : 'Go to your Twin →'}
              </button>
            </div>
          )}
          {lifecycleStatus === 'WORLD_ACTIVE' && (
            <div className="dashboard-resume-banner">
              <p className="dashboard-resume-banner__text">🌍 {isTh ? 'ไปต่อในโลกของคุณ' : 'Continue in your world'}</p>
              <button
                className="dashboard-resume-banner__cta"
                onClick={() => navigate('/worlds')}
              >
                {isTh ? 'ไปต่อยัง Worlds →' : 'Continue to Worlds →'}
              </button>
            </div>
          )}

          {/* User avatar + name — P3 avatar-on-dashboard */}
          {userId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '0 4px' }}>
              <UserAvatar
                displayName={session?.user?.user_metadata?.full_name || session?.user?.email || 'User'}
                size="md"
                userId={userId}
                twinId={twin?.id}
                onClick={() => navigate('/menu')}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {session?.user?.user_metadata?.full_name || session?.user?.email || 'User'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  {lifecycleStatus === 'TWIN_ALIVE' ? (isTh ? 'Twin พร้อมแล้ว' : 'Twin ready') : lifecycleStatus === 'WORLD_ACTIVE' ? (isTh ? 'กำลังใช้งาน' : 'Active') : (isTh ? 'กำลังเริ่มต้น' : 'Getting started')}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TODAY-HIERARCHY-001 (7 ก.ย. 2026, Phase 5.1 §6 TODAY):
              "TODAY = what matters to me now" — one hierarchy, not competing
              cards: Twin presence → what matters now → one primary insight →
              recommended action → your day → recent evolution. Previously the
              action-card grid (§6's "your day", a secondary/supporting layer)
              rendered ABOVE the Twin and the primary insight, and Twin presence
              (LivingTwin) sat below both — the reverse of the spec order.
              Surgical reorder only — no section was removed, ExecutiveSummary's
              own multi-line insight content is unchanged (that's Track C content
              work, out of scope here), just repositioned. */}

          {/* "What matters now" — greeting only, cards moved below (§6 secondary layer) */}
          <TodaySection hasHistory={logs.length > 0} variant="header" />

          {/* Twin presence — §3 states, §4 cosmic visual, §5 processing states */}
          {/* TWIN-VISUAL-001: pass maturityScore to enable evolution */}
          {/* DASHBOARD-TWIN-GHOST-001: previously rendered unconditionally with
              maturityScore defaulted to 30, so a spinning Twin appeared even
              when `twin` (TwinContext) was null — i.e. no Twin actually exists
              yet. That directly contradicted TwinChat.tsx's own guard ("Your
              Twin hasn't awakened yet"), showing the user two different answers
              to "does my Twin exist?" on two screens. Only render once a real
              Twin is loaded. */}
          {twin && <LivingTwin maturityScore={twin.maturityScore ?? 30} />}

          {/* TC-106: LivingDiagram DataDriver — same narrative diagram as
              landing/onboarding, now driven by real SICE scores (flag-gated) */}
          {isFeatureEnabled('LIVING_DIAGRAM') && (
            <div style={{ maxWidth: 420, margin: '0 auto 24px', height: 360 }}>
              <LivingDiagram
                mode="dashboard"
                dna={livingDna ?? undefined}
                scores={diagramScores}
                confidence={diagramConfidence}
                version={diagramVersion}
                isTh={isTh}
                mobileSheet
              />
            </div>
          )}

          {/* Layer 3: MICRO STORY — today's single most important beat (§51) */}
          <NarrativeHook />

          {/* One primary insight — Phase 3: human-language AI Twin overview (§8-9) */}
          <ExecutiveSummary />

          {/* Layer 2: CURRENT CHAPTER — dominant patterns for this period (§51) */}
          <CurrentChapter />

          {/* Recommended action — §6's explicit CTA layer ("Explore with Twin"),
              distinct from LivingTwin's own action buttons above (those are
              Twin-card chrome; this is the Today-hierarchy's own next-step). */}
          <div className="dashboard-recommended-action">
            <button
              className="dashboard-recommended-action__cta"
              onClick={() => navigate('/chat/twin')}
            >
              💬 {isTh ? 'สำรวจต่อกับทวิน →' : 'Explore with Twin →'}
            </button>
          </div>

          {/* Your day — §6 secondary layer: check-in / reflection / decision /
              activity / tomorrow, as supporting actions after the primary insight. */}
          <TodaySection hasHistory={logs.length > 0} variant="actions" />

          {/* Recent evolution — most recent decision-log activity */}
          {/* APPSHELL-002 FIX: Command Center shows only a 3-item decision
              preview + a link to the full Intelligence hub — Insights, Trend,
              Patterns, full Decision Log + Export, Growth Space, Ask Coach,
              Analytics Summary, Intelligence Panel, and Advanced Intelligence
              panels all now live on IntelligenceHub.tsx (/intelligence). */}
          {logs.length > 0 && (
            <div className="decision-preview">
              <h2>{isTh ? 'การตัดสินใจล่าสุด' : 'Recent Decisions'}</h2>
              <ul className="decision-preview__list">
                {logs.map((log) => (
                  <li key={log.id} className="decision-preview__item">
                    <span className="decision-preview__hub">{log.hub}</span>
                    <span className="decision-preview__mood">{log.mood}</span>
                    <span className="decision-preview__date">
                      {new Date(log.created_at).toLocaleDateString(isTh ? 'th-TH' : 'en-US')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* §46 Ambient + Soundscape — compact strip. Below the core Today
              hierarchy now (was between the card grid and ExecutiveSummary). */}
          <div style={{ display: 'flex', gap: '0.75rem', padding: '0 4px', marginBottom: 'var(--space-xl, 24px)', flexWrap: 'wrap', alignItems: 'center' }}>
            <AmbientBadge showSoundscape compact />
            <SoundscapePlayer compact />
          </div>

          {/* P0 #7 — Explore Worlds quick action (Recommended Worlds) */}
          <ExplorWorldsCard />

          <div className="command-center-link">
            <button
              className="command-center-link__cta"
              onClick={() => navigate('/intelligence')}
            >
              🧬 {isTh ? 'ดูรายละเอียดปัญญาเชิงลึก →' : 'View Deep Intelligence →'}
            </button>
          </div>
          </div>

          {/* Privacy Center link — Master Direction §38. Kept deliberately
              low-key (no card/shadow chrome) — a legal/utility link shouldn't
              visually compete with the real CTAs above it. */}
          <div style={{ textAlign: 'center', padding: 'var(--space-sm, 8px) 0 var(--space-lg, 20px)' }}>
            <button
              onClick={() => navigate('/privacy')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.8rem',
                color: 'var(--color-text-tertiary)',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '4px 8px',
                transition: 'color 150ms',
              }}
            >
              🔒 {isTh ? 'ความเป็นส่วนตัว' : 'Privacy / PDPA'}
            </button>
          </div>
        </div>
      </AppShell>
    </>
  );
};

export default Dashboard;
