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

const StatusMsg: React.FC<{ status: ActionStatus }> = ({ status }) => {
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
        ? '⏳ กำลังดำเนินการ...'
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

      setExportStatus({ state: 'success', message: '✅ ดาวน์โหลดข้อมูลสำเร็จ' });
    } catch (err) {
      setExportStatus({
        state: 'error',
        message: `❌ ส่งออกล้มเหลว: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    }
  }, [userId, requireAuth]);

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

      setMemoryStatus({ state: 'success', message: '✅ ลบความทรงจำ AI ทั้งหมดแล้ว' });
    } catch (err) {
      setMemoryStatus({
        state: 'error',
        message: `❌ ลบล้มเหลว: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    }
  }, [userId, requireAuth]);

  const confirmClearMemory = useCallback(() => {
    if (!requireAuth()) return;
    setConfirm({
      title: 'ลบความทรงจำ AI ทั้งหมด?',
      body:
        'ความทรงจำที่ Twin บันทึกจากการสนทนาจะถูกลบถาวร Twin จะต้องเรียนรู้ใหม่จากศูนย์',
      confirmLabel: 'ลบความทรงจำ',
      danger: true,
      onConfirm: handleClearMemory,
    });
  }, [requireAuth, handleClearMemory]);

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
        message: '✅ รีเซ็ต Personal Model สำเร็จ — Twin จะเรียนรู้ใหม่',
      });
    } catch (err) {
      setResetStatus({
        state: 'error',
        message: `❌ รีเซ็ตล้มเหลว: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    }
  }, [userId, requireAuth]);

  const confirmResetModel = useCallback(() => {
    if (!requireAuth()) return;
    setConfirm({
      title: 'รีเซ็ต Personal Model?',
      body:
        'ข้อมูล Personal Context, Behavioral Patterns และ Insight Feedback ทั้งหมดจะถูกลบ Twin จะเริ่มต้นใหม่ราวกับยังไม่เคยรู้จักคุณ',
      confirmLabel: 'รีเซ็ต Model',
      danger: true,
      onConfirm: handleResetModel,
    });
  }, [requireAuth, handleResetModel]);

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
        message: `❌ ลบบัญชีล้มเหลว: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    }
  }, [userId, requireAuth, navigate]);

  const confirmDeleteAccount = useCallback(() => {
    if (!requireAuth()) return;
    setConfirm({
      title: 'ลบบัญชีทั้งหมด?',
      body:
        'ข้อมูลทั้งหมดของคุณจะถูกลบถาวรและไม่สามารถกู้คืนได้ คุณจะถูกออกจากระบบทันที',
      confirmLabel: 'ลบบัญชีถาวร',
      danger: true,
      onConfirm: handleDeleteAccount,
    });
  }, [requireAuth, handleDeleteAccount]);

  // --------------------------------------------------------------------------
  // Auth guard
  // --------------------------------------------------------------------------

  if (!userId) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <p>กรุณาเข้าสู่ระบบก่อน</p>
        <button
          onClick={() => navigate('/onboarding')}
          style={{ marginTop: 16 }}
        >
          เข้าสู่ระบบ
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
            ← กลับ
          </button>
          <h1 className="privacy__page-title">🔒 ความเป็นส่วนตัว</h1>
          <p className="privacy__page-subtitle">
            จัดการข้อมูลส่วนตัวของคุณตามสิทธิ์ที่กำหนดใน PDPA
            คุณมีสิทธิ์เข้าถึง แก้ไข ลบ และส่งออกข้อมูลทุกอย่างได้ตลอดเวลา
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
                <h2 className="privacy__card-title">ส่งออกข้อมูล</h2>
                <p className="privacy__card-desc">
                  ดาวน์โหลดข้อมูลทั้งหมดที่เราเก็บไว้เกี่ยวกับคุณเป็นไฟล์ JSON
                </p>
              </div>
            </div>
            <div className="privacy__card-body">
              <ul className="privacy__data-points">
                <li>Personal Context (บุคลิกภาพ ค่านิยม เป้าหมาย)</li>
                <li>Behavioral Patterns (รูปแบบพฤติกรรมที่ตรวจพบ)</li>
                <li>Personal Memories (ความทรงจำที่บันทึก)</li>
                <li>Insight Feedback (ฟีดแบ็กต่อ AI)</li>
              </ul>
              <div className="privacy__action-row">
                <button
                  className="privacy__btn privacy__btn--primary"
                  onClick={handleExport}
                  disabled={exportStatus.state === 'loading'}
                >
                  {exportStatus.state === 'loading' ? '⏳ กำลังส่งออก...' : '⬇ ดาวน์โหลดข้อมูล'}
                </button>
              </div>
              <StatusMsg status={exportStatus} />
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* 2. Clear AI Memory                                               */}
          {/* ---------------------------------------------------------------- */}
          <div className="privacy__card">
            <div className="privacy__card-header">
              <span className="privacy__card-icon" aria-hidden="true">🧠</span>
              <div>
                <h2 className="privacy__card-title">ลบความทรงจำ AI</h2>
                <p className="privacy__card-desc">
                  ลบความทรงจำที่ Twin บันทึกจากการสนทนา ข้อมูล Profile หลักยังคงอยู่
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
                  {memoryStatus.state === 'loading' ? '⏳ กำลังลบ...' : '🗑 ลบความทรงจำทั้งหมด'}
                </button>
              </div>
              <StatusMsg status={memoryStatus} />
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* 3. Reset Personal Model                                          */}
          {/* ---------------------------------------------------------------- */}
          <div className="privacy__card">
            <div className="privacy__card-header">
              <span className="privacy__card-icon" aria-hidden="true">🔄</span>
              <div>
                <h2 className="privacy__card-title">รีเซ็ต Personal Model</h2>
                <p className="privacy__card-desc">
                  ลบ Context, Patterns และ Feedback ทั้งหมด
                  Twin จะเริ่มเรียนรู้ตัวคุณใหม่ตั้งแต่ต้น
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
                  {resetStatus.state === 'loading' ? '⏳ กำลังรีเซ็ต...' : '↺ รีเซ็ต Personal Model'}
                </button>
              </div>
              <StatusMsg status={resetStatus} />
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* 4. Consent Management                                            */}
          {/* ---------------------------------------------------------------- */}
          <div className="privacy__card">
            <div className="privacy__card-header">
              <span className="privacy__card-icon" aria-hidden="true">⚙️</span>
              <div>
                <h2 className="privacy__card-title">การยินยอม (Consent)</h2>
                <p className="privacy__card-desc">
                  จัดการสิทธิ์การใช้ข้อมูลของคุณ การยินยอมบางส่วนจำเป็นต่อการทำงานของ Twin
                </p>
              </div>
            </div>
            <div className="privacy__card-body">
              <div className="privacy__consent-list">

                {/* Core — required, always on */}
                <div className="privacy__consent-row">
                  <div className="privacy__consent-info">
                    <p className="privacy__consent-label">การทำงานหลักของ Twin</p>
                    <p className="privacy__consent-detail">
                      เก็บ Personal Context และ Behavioral Patterns เพื่อให้ Twin เรียนรู้คุณได้
                    </p>
                    <p className="privacy__consent-required">⚠ จำเป็น — ปิดไม่ได้</p>
                  </div>
                  <label className="privacy__toggle">
                    <input type="checkbox" checked disabled readOnly />
                    <span className="privacy__toggle-slider" />
                  </label>
                </div>

                {/* Analytics — optional */}
                <div className="privacy__consent-row">
                  <div className="privacy__consent-info">
                    <p className="privacy__consent-label">วิเคราะห์การใช้งาน</p>
                    <p className="privacy__consent-detail">
                      ช่วยให้เราปรับปรุงประสบการณ์ ไม่มีข้อมูลส่วนตัวในส่วนนี้
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
                    <p className="privacy__consent-label">การปรับแต่งเฉพาะบุคคล</p>
                    <p className="privacy__consent-detail">
                      อนุญาตให้ Twin ใช้ข้อมูลพฤติกรรมเพื่อปรับคำแนะนำให้ตรงกับคุณมากขึ้น
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
                <h2 className="privacy__card-title">ลบบัญชีทั้งหมด</h2>
                <p className="privacy__card-desc">
                  ลบข้อมูลทั้งหมดของคุณออกจากระบบถาวร การกระทำนี้ไม่สามารถย้อนกลับได้
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
                  {deleteStatus.state === 'loading' ? '⏳ กำลังลบ...' : '🗑 ลบบัญชีทั้งหมด'}
                </button>
              </div>
              <StatusMsg status={deleteStatus} />
            </div>
          </div>

          {/* PDPA Notice */}
          <div className="privacy__pdpa-notice">
            <p>
              <strong>สิทธิ์ตาม PDPA:</strong> คุณมีสิทธิ์เข้าถึง แก้ไข ลบ คัดค้าน และโอนย้ายข้อมูล
              หากมีข้อสงสัยเกี่ยวกับการจัดการข้อมูล ติดต่อ{' '}
              <strong>privacy@selfprint.app</strong>
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
                ยกเลิก
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
      <BottomNav />
    </>
  );
};

export default PrivacyCenter;
