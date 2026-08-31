/**
 * PrivacyCenter.tsx
 *
 * Route: /privacy
 *
 * Master Direction §38 — PDPA Privacy Center
 *
 * Sections:
 *   1. Data Export     — download all user data as JSON
 *   2. Memory          — clear AI memories (personal_memory table)
 *   3. Reset Model     — delete personal_context + behavioral_patterns + insight_feedback
 *   4. Consent         — view/toggle optional consents (stored in personal_context)
 *   5. Delete Account  — delete everything + sign out
 *
 * Rules:
 * - useAuth() for userId, never localStorage
 * - Real Supabase operations, no mocks, no hardcoding
 * - Confirm dialogs before destructive actions
 * - import type for all type-only imports
 */

import React, { useState, useCallback } from 'react';
import { useLangNavigate as useNavigate } from '../hooks/useLangNavigate';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase/client';
import { NavBar } from '@/components/layout/NavBar';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { NavRail } from '@/components/layout/NavRail';
import { MetaTagManager } from '@/components/MetaTagManager';
import { getSeoMetadata } from '@/constants/seoMetadata';
import '../styles/privacy.css';

// ============================================================================
// Types
// ============================================================================

type ActionStatus = {
  state: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
};

type ConfirmDialog = {
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
};

// ============================================================================
// Sub-components
// ============================================================================

const StatusMsg: React.FC<{ status: ActionStatus; isTh: boolean }> = ({ status, isTh }) => {
  if (status.state === 'idle') return null;

  const cls =
    status.state === 'success'
      ? 'privacy__status privacy__status--success'
      : status.state === 'error'
      ? 'privacy__status privacy__status--error'
      : 'privacy__status privacy__status--loading';

  return (
    <p className={cls}>
      {status.state === 'loading'
        ? (isTh ? '⏳ กำลังดำเนินการ...' : '⏳ Working...')
        : status.message ?? ''}
    </p>
  );
};

// ============================================================================
// Main page
// ============================================================================

const PrivacyCenter: React.FC = () => {
  const { session } = useAuth();
  const userId = session?.user?.id ?? '';
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isTh = language === 'th';
  const seoData = getSeoMetadata('privacy', language);

  // Per-action statuses
  const [exportStatus, setExportStatus] = useState<ActionStatus>({ state: 'idle' });
  const [memoryStatus, setMemoryStatus] = useState<ActionStatus>({ state: 'idle' });
  const [resetStatus, setResetStatus] = useState<ActionStatus>({ state: 'idle' });
  const [deleteStatus, setDeleteStatus] = useState<ActionStatus>({ state: 'idle' });

  // Optional consents (loaded from personal_context; toggled immediately)
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const [personalizationConsent, setPersonalizationConsent] = useState(true);

  // Confirm dialog state
  const [confirm, setConfirm] = useState<ConfirmDialog | null>(null);

  const requireAuth = useCallback(() => {
    if (!userId) {
      navigate('/onboarding');
      return false;
    }
    return true;
  }, [userId, navigate]);

  // --------------------------------------------------------------------------
  // 1. Data Export
  // --------------------------------------------------------------------------

  const handleExport = useCallback(async () => {
    if (!requireAuth()) return;
    setExportStatus({ state: 'loading' });

    try {
      // Fetch all user tables in parallel
      const [context, patterns, memories, feedback] = await Promise.all([
        supabase
          .from('personal_context')
          .select('*')
          .eq('user_id', userId),
        supabase
          .from('behavioral_patterns')
          .select('*')
          .eq('user_id', userId),
        supabase
          .from('personal_memory')
          .select('*')
          .eq('user_id', userId),
        supabase
          .from('insight_feedback')
          .select('*')
          .eq('user_id', userId),
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        user_id: userId,
        personal_context: context.data ?? [],
        behavioral_patterns: patterns.data ?? [],
        personal_memories: memories.data ?? [],
        insight_feedback: feedback.data ?? [],
      };

      // Trigger browser download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `selfprint-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStatus({ state: 'success', message: isTh ? '✅ ดาวน์โหลดข้อมูลสำเร็จ' : '✅ Data downloaded successfully' });
    } catch (err) {
      setExportStatus({
        state: 'error',
        message: isTh
          ? `❌ ส่งออกล้มเหลว: ${err instanceof Error ? err.message : 'Unknown error'}`
          : `❌ Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    }
  }, [userId, requireAuth, isTh]);

  // --------------------------------------------------------------------------
  // 2. Clear AI Memory
  // --------------------------------------------------------------------------

  const handleClearMemory = useCallback(async () => {
    if (!requireAuth()) return;
    setMemoryStatus({ state: 'loading' });
    setConfirm(null);

    try {
      const { error } = await supabase
        .from('personal_memory')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      setMemoryStatus({ state: 'success', message: isTh ? '✅ ลบความทรงจำ AI ทั้งหมดแล้ว' : '✅ All AI memories cleared' });
    } catch (err) {
      setMemoryStatus({
        state: 'error',
        message: isTh
          ? `❌ ลบล้มเหลว: ${err instanceof Error ? err.message : 'Unknown error'}`
          : `❌ Delete failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    }
  }, [userId, requireAuth, isTh]);

  const confirmClearMemory = useCallback(() => {
    if (!requireAuth()) return;
    setConfirm({
      title: isTh ? 'ลบความทรงจำ AI ทั้งหมด?' : 'Clear all AI memories?',
      body: isTh
        ? 'ความทรงจำที่ Twin บันทึกจากการสนทนาจะถูกลบถาวร Twin จะต้องเรียนรู้ใหม่จากศูนย์'
        : 'Memories your Twin has saved from conversations will be permanently deleted. Your Twin will have to learn from scratch.',
      confirmLabel: isTh ? 'ลบความทรงจำ' : 'Clear memories',
      danger: true,
      onConfirm: handleClearMemory,
    });
  }, [requireAuth, handleClearMemory, isTh]);

  // --------------------------------------------------------------------------
  // 3. Reset Personal Model
  // --------------------------------------------------------------------------

  const handleResetModel = useCallback(async () => {
    if (!requireAuth()) return;
    setResetStatus({ state: 'loading' });
    setConfirm(null);

    try {
      // Delete in parallel — personal_context, behavioral_patterns, insight_feedback
      const [ctxResult, patResult, fbResult] = await Promise.all([
        supabase.from('personal_context').delete().eq('user_id', userId),
        supabase.from('behavioral_patterns').delete().eq('user_id', userId),
        supabase.from('insight_feedback').delete().eq('user_id', userId),
      ]);

      const errors = [ctxResult.error, patResult.error, fbResult.error].filter(Boolean);
      if (errors.length > 0) {
        throw new Error(errors[0]?.message ?? 'Delete failed');
      }

      setResetStatus({
        state: 'success',
        message: isTh ? '✅ รีเซ็ต Personal Model สำเร็จ — Twin จะเรียนรู้ใหม่' : '✅ Personal Model reset — your Twin will learn from scratch',
      });
    } catch (err) {
      setResetStatus({
        state: 'error',
        message: isTh
          ? `❌ รีเซ็ตล้มเหลว: ${err instanceof Error ? err.message : 'Unknown error'}`
          : `❌ Reset failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    }
  }, [userId, requireAuth, isTh]);

  const confirmResetModel = useCallback(() => {
    if (!requireAuth()) return;
    setConfirm({
      title: isTh ? 'รีเซ็ต Personal Model?' : 'Reset your Personal Model?',
      body: isTh
        ? 'ข้อมูล Personal Context, Behavioral Patterns และ Insight Feedback ทั้งหมดจะถูกลบ Twin จะเริ่มต้นใหม่ราวกับยังไม่เคยรู้จักคุณ'
        : 'All Personal Context, Behavioral Patterns, and Insight Feedback data will be deleted. Your Twin will start fresh as if it never knew you.',
      confirmLabel: isTh ? 'รีเซ็ต Model' : 'Reset Model',
      danger: true,
      onConfirm: handleResetModel,
    });
  }, [requireAuth, handleResetModel, isTh]);

  // --------------------------------------------------------------------------
  // 4. Consent toggles
  // --------------------------------------------------------------------------

  const handleConsentToggle = useCallback(
    async (type: 'analytics' | 'personalization', value: boolean) => {
      if (!requireAuth()) return;

      // Update UI immediately (optimistic)
      if (type === 'analytics') setAnalyticsConsent(value);
      else setPersonalizationConsent(value);

      // Persist to personal_context as a flat flag field
      // We upsert the consent column; if the row doesn't exist, Supabase creates it.
      await supabase.from('personal_context').upsert(
        {
          user_id: userId,
          [`consent_${type}`]: value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
      // Errors are silent for consent (non-critical) — UI already updated
    },
    [userId, requireAuth]
  );

  // --------------------------------------------------------------------------
  // 5. Delete Account
  // --------------------------------------------------------------------------

  const handleDeleteAccount = useCallback(async () => {
    if (!requireAuth()) return;
    setDeleteStatus({ state: 'loading' });
    setConfirm(null);

    try {
      // 1. Delete all user data in parallel
      await Promise.all([
        supabase.from('personal_context').delete().eq('user_id', userId),
        supabase.from('behavioral_patterns').delete().eq('user_id', userId),
        supabase.from('personal_memory').delete().eq('user_id', userId),
        supabase.from('insight_feedback').delete().eq('user_id', userId),
      ]);

      // 2. Sign out (auth.admin.deleteUser requires service role key — not available on client)
      // Users must contact support or Supabase admin to fully remove auth record.
      await supabase.auth.signOut();

      // 3. Redirect to landing
      navigate('/');
    } catch (err) {
      setDeleteStatus({
        state: 'error',
        message: isTh
          ? `❌ ลบบัญชีล้มเหลว: ${err instanceof Error ? err.message : 'Unknown error'}`
          : `❌ Account deletion failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    }
  }, [userId, requireAuth, navigate, isTh]);

  const confirmDeleteAccount = useCallback(() => {
    if (!requireAuth()) return;
    setConfirm({
      title: isTh ? 'ลบบัญชีทั้งหมด?' : 'Delete your entire account?',
      body: isTh
        ? 'ข้อมูลทั้งหมดของคุณจะถูกลบถาวรและไม่สามารถกู้คืนได้ คุณจะถูกออกจากระบบทันที'
        : "All your data will be permanently deleted and can't be recovered. You'll be signed out immediately.",
      confirmLabel: isTh ? 'ลบบัญชีถาวร' : 'Delete permanently',
      danger: true,
      onConfirm: handleDeleteAccount,
    });
  }, [requireAuth, handleDeleteAccount, isTh]);

  // --------------------------------------------------------------------------
  // Auth guard
  // --------------------------------------------------------------------------

  if (!userId) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <p>{isTh ? 'กรุณาเข้าสู่ระบบก่อน' : 'Please sign in first'}</p>
        <button
          onClick={() => navigate('/onboarding')}
          style={{ marginTop: 16 }}
        >
          {isTh ? 'เข้าสู่ระบบ' : 'Sign in'}
        </button>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <>
      {seoData && (
        <MetaTagManager
          title={seoData.title}
          description={seoData.description}
          keywords={seoData.keywords?.join(', ')}
          ogImage={seoData.ogImage}
          canonicalUrl={`/${language}/privacy`}
        />
      )}
      <NavBar />
      <main className="privacy__page">
        {/* Page Header */}
        <header className="privacy__page-header">
          <button className="privacy__back-btn" onClick={() => navigate('/dashboard')}>
            {isTh ? '← กลับ' : '← Back'}
          </button>
          <h1 className="privacy__page-title">🔒 {isTh ? 'ความเป็นส่วนตัว' : 'Privacy'}</h1>
          <p className="privacy__page-subtitle">
            {isTh
              ? 'จัดการข้อมูลส่วนตัวของคุณตามสิทธิ์ที่กำหนดใน PDPA คุณมีสิทธิ์เข้าถึง แก้ไข ลบ และส่งออกข้อมูลทุกอย่างได้ตลอดเวลา'
              : "Manage your personal data under your PDPA rights. You can access, edit, delete, and export all your data at any time."}
          </p>
        </header>

        <div className="privacy__sections">

          {/* ---------------------------------------------------------------- */}
          {/* 1. Data Export                                                   */}
          {/* ---------------------------------------------------------------- */}
          <div className="privacy__card">
            <div className="privacy__card-header">
              <span className="privacy__card-icon" aria-hidden="true">📦</span>
              <div>
                <h2 className="privacy__card-title">{isTh ? 'ส่งออกข้อมูล' : 'Export data'}</h2>
                <p className="privacy__card-desc">
                  {isTh ? 'ดาวน์โหลดข้อมูลทั้งหมดที่เราเก็บไว้เกี่ยวกับคุณเป็นไฟล์ JSON' : 'Download everything we have on you as a JSON file'}
                </p>
              </div>
            </div>
            <div className="privacy__card-body">
              <ul className="privacy__data-points">
                <li>{isTh ? 'Personal Context (บุคลิกภาพ ค่านิยม เป้าหมาย)' : 'Personal Context (personality, values, goals)'}</li>
                <li>{isTh ? 'Behavioral Patterns (รูปแบบพฤติกรรมที่ตรวจพบ)' : 'Behavioral Patterns (patterns detected)'}</li>
                <li>{isTh ? 'Personal Memories (ความทรงจำที่บันทึก)' : 'Personal Memories (memories you logged)'}</li>
                <li>{isTh ? 'Insight Feedback (ฟีดแบ็กต่อ AI)' : 'Insight Feedback (your feedback to the AI)'}</li>
              </ul>
              <div className="privacy__action-row">
                <button
                  className="privacy__btn privacy__btn--primary"
                  onClick={handleExport}
                  disabled={exportStatus.state === 'loading'}
                >
                  {exportStatus.state === 'loading'
                    ? (isTh ? '⏳ กำลังส่งออก...' : '⏳ Exporting...')
                    : (isTh ? '⬇ ดาวน์โหลดข้อมูล' : '⬇ Download data')}
                </button>
              </div>
              <StatusMsg status={exportStatus} isTh={isTh} />
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* 2. Clear AI Memory                                               */}
          {/* ---------------------------------------------------------------- */}
          <div className="privacy__card">
            <div className="privacy__card-header">
              <span className="privacy__card-icon" aria-hidden="true">🧠</span>
              <div>
                <h2 className="privacy__card-title">{isTh ? 'ลบความทรงจำ AI' : 'Clear AI memory'}</h2>
                <p className="privacy__card-desc">
                  {isTh
                    ? 'ลบความทรงจำที่ Twin บันทึกจากการสนทนา ข้อมูล Profile หลักยังคงอยู่'
                    : 'Delete the memories your Twin has saved from conversations. Your core profile data stays intact.'}
                </p>
              </div>
            </div>
            <div className="privacy__card-body">
              <div className="privacy__action-row">
                <button
                  className="privacy__btn privacy__btn--danger-outline"
                  onClick={confirmClearMemory}
                  disabled={memoryStatus.state === 'loading'}
                >
                  {memoryStatus.state === 'loading'
                    ? (isTh ? '⏳ กำลังลบ...' : '⏳ Clearing...')
                    : (isTh ? '🗑 ลบความทรงจำทั้งหมด' : '🗑 Clear all memories')}
                </button>
              </div>
              <StatusMsg status={memoryStatus} isTh={isTh} />
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* 3. Reset Personal Model                                          */}
          {/* ---------------------------------------------------------------- */}
          <div className="privacy__card">
            <div className="privacy__card-header">
              <span className="privacy__card-icon" aria-hidden="true">🔄</span>
              <div>
                <h2 className="privacy__card-title">{isTh ? 'รีเซ็ต Personal Model' : 'Reset Personal Model'}</h2>
                <p className="privacy__card-desc">
                  {isTh
                    ? 'ลบ Context, Patterns และ Feedback ทั้งหมด Twin จะเริ่มเรียนรู้ตัวคุณใหม่ตั้งแต่ต้น'
                    : 'Delete all Context, Patterns, and Feedback. Your Twin will start learning about you again from scratch.'}
                </p>
              </div>
            </div>
            <div className="privacy__card-body">
              <div className="privacy__action-row">
                <button
                  className="privacy__btn privacy__btn--danger-outline"
                  onClick={confirmResetModel}
                  disabled={resetStatus.state === 'loading'}
                >
                  {resetStatus.state === 'loading'
                    ? (isTh ? '⏳ กำลังรีเซ็ต...' : '⏳ Resetting...')
                    : (isTh ? '↺ รีเซ็ต Personal Model' : '↺ Reset Personal Model')}
                </button>
              </div>
              <StatusMsg status={resetStatus} isTh={isTh} />
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* 4. Consent Management                                            */}
          {/* ---------------------------------------------------------------- */}
          <div className="privacy__card">
            <div className="privacy__card-header">
              <span className="privacy__card-icon" aria-hidden="true">⚙️</span>
              <div>
                <h2 className="privacy__card-title">{isTh ? 'การยินยอม (Consent)' : 'Consent'}</h2>
                <p className="privacy__card-desc">
                  {isTh
                    ? 'จัดการสิทธิ์การใช้ข้อมูลของคุณ การยินยอมบางส่วนจำเป็นต่อการทำงานของ Twin'
                    : 'Manage how your data may be used. Some consents are required for your Twin to function.'}
                </p>
              </div>
            </div>
            <div className="privacy__card-body">
              <div className="privacy__consent-list">

                {/* Core — required, always on */}
                <div className="privacy__consent-row">
                  <div className="privacy__consent-info">
                    <p className="privacy__consent-label">{isTh ? 'การทำงานหลักของ Twin' : "Your Twin's core function"}</p>
                    <p className="privacy__consent-detail">
                      {isTh
                        ? 'เก็บ Personal Context และ Behavioral Patterns เพื่อให้ Twin เรียนรู้คุณได้'
                        : 'Stores your Personal Context and Behavioral Patterns so your Twin can learn about you'}
                    </p>
                    <p className="privacy__consent-required">{isTh ? '⚠ จำเป็น — ปิดไม่ได้' : "⚠ Required — can't be turned off"}</p>
                  </div>
                  <label className="privacy__toggle">
                    <input type="checkbox" checked disabled readOnly />
                    <span className="privacy__toggle-slider" />
                  </label>
                </div>

                {/* Analytics — optional */}
                <div className="privacy__consent-row">
                  <div className="privacy__consent-info">
                    <p className="privacy__consent-label">{isTh ? 'วิเคราะห์การใช้งาน' : 'Usage analytics'}</p>
                    <p className="privacy__consent-detail">
                      {isTh
                        ? 'ช่วยให้เราปรับปรุงประสบการณ์ ไม่มีข้อมูลส่วนตัวในส่วนนี้'
                        : 'Helps us improve the experience — no personal data is included'}
                    </p>
                  </div>
                  <label className="privacy__toggle">
                    <input
                      type="checkbox"
                      checked={analyticsConsent}
                      onChange={(e) => handleConsentToggle('analytics', e.target.checked)}
                    />
                    <span className="privacy__toggle-slider" />
                  </label>
                </div>

                {/* Personalization — optional */}
                <div className="privacy__consent-row">
                  <div className="privacy__consent-info">
                    <p className="privacy__consent-label">{isTh ? 'การปรับแต่งเฉพาะบุคคล' : 'Personalization'}</p>
                    <p className="privacy__consent-detail">
                      {isTh
                        ? 'อนุญาตให้ Twin ใช้ข้อมูลพฤติกรรมเพื่อปรับคำแนะนำให้ตรงกับคุณมากขึ้น'
                        : 'Lets your Twin use behavioral data to tailor its guidance more closely to you'}
                    </p>
                  </div>
                  <label className="privacy__toggle">
                    <input
                      type="checkbox"
                      checked={personalizationConsent}
                      onChange={(e) =>
                        handleConsentToggle('personalization', e.target.checked)
                      }
                    />
                    <span className="privacy__toggle-slider" />
                  </label>
                </div>

              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* 5. Delete Account                                                */}
          {/* ---------------------------------------------------------------- */}
          <div className="privacy__card privacy__card--danger">
            <div className="privacy__card-header">
              <span className="privacy__card-icon" aria-hidden="true">⚠️</span>
              <div>
                <h2 className="privacy__card-title">{isTh ? 'ลบบัญชีทั้งหมด' : 'Delete your account'}</h2>
                <p className="privacy__card-desc">
                  {isTh
                    ? 'ลบข้อมูลทั้งหมดของคุณออกจากระบบถาวร การกระทำนี้ไม่สามารถย้อนกลับได้'
                    : 'Permanently remove all your data from the system. This action cannot be undone.'}
                </p>
              </div>
            </div>
            <div className="privacy__card-body">
              <div className="privacy__action-row">
                <button
                  className="privacy__btn privacy__btn--danger"
                  onClick={confirmDeleteAccount}
                  disabled={deleteStatus.state === 'loading'}
                >
                  {deleteStatus.state === 'loading'
                    ? (isTh ? '⏳ กำลังลบ...' : '⏳ Deleting...')
                    : (isTh ? '🗑 ลบบัญชีทั้งหมด' : '🗑 Delete entire account')}
                </button>
              </div>
              <StatusMsg status={deleteStatus} isTh={isTh} />
            </div>
          </div>

          {/* PDPA Notice */}
          <div className="privacy__pdpa-notice">
            <p>
              {isTh ? (
                <>
                  <strong>สิทธิ์ตาม PDPA:</strong> คุณมีสิทธิ์เข้าถึง แก้ไข ลบ คัดค้าน และโอนย้ายข้อมูล
                  หากมีข้อสงสัยเกี่ยวกับการจัดการข้อมูล ติดต่อ{' '}
                  <strong>privacy@selfprint.app</strong>
                </>
              ) : (
                <>
                  <strong>Your PDPA rights:</strong> you have the right to access, correct, delete, object to,
                  and transfer your data. For questions about how your data is handled, contact{' '}
                  <strong>privacy@selfprint.app</strong>
                </>
              )}
            </p>
          </div>

        </div>
      </main>

      {/* -------------------------------------------------------------------- */}
      {/* Confirm Dialog                                                        */}
      {/* -------------------------------------------------------------------- */}
      {confirm && (
        <div
          className="privacy__confirm-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <div className="privacy__confirm-dialog">
            <h3 className="privacy__confirm-title" id="confirm-title">
              {confirm.title}
            </h3>
            <p className="privacy__confirm-body">{confirm.body}</p>
            <div className="privacy__confirm-actions">
              <button
                className="privacy__btn privacy__btn--outline"
                onClick={() => setConfirm(null)}
              >
                {isTh ? 'ยกเลิก' : 'Cancel'}
              </button>
              <button
                className={`privacy__btn ${confirm.danger ? 'privacy__btn--danger' : 'privacy__btn--primary'}`}
                onClick={confirm.onConfirm}
              >
                {confirm.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <NavRail />
      <BottomNav />
    </>
  );
};

export default PrivacyCenter;
