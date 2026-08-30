/**
 * PasskeySettings.tsx — §34 Passkey Management UI
 *
 * หน้าจัดการ Passkeys ที่ลงทะเบียนไว้:
 * - ดูรายการ Passkeys ทั้งหมด
 * - ลบ Passkey ที่ไม่ต้องการ
 * - เพิ่ม Passkey ใหม่
 *
 * กฎ: CSS ใช้ var(--...) เท่านั้น, userId จาก useAuth().session?.user?.id
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useLangNavigate as useNavigate } from '../hooks/useLangNavigate';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabase-service';
import {
  isPasskeyAvailable,
  createPasskeyCredential,
  arrayBufferToBase64Url,
} from '../lib/auth/webauthn';
import type { RegistrationOptions } from '../lib/auth/webauthn';
import { NavBar } from '../components/layout/NavBar';
import { Footer } from '../components/layout/Footer';
import { BottomNav } from '../components/layout/BottomNav';
import './PasskeySettings.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StoredPasskey {
  id: string;
  credentialId: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
  deviceType: 'platform' | 'cross-platform';
  aaguid?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deviceIcon(type: StoredPasskey['deviceType']): string {
  return type === 'platform' ? '📱' : '🔑';
}

function formatDate(iso: string | null, isTh: boolean): string {
  if (!iso) return isTh ? 'ยังไม่ได้ใช้งาน' : 'Never used';
  return new Date(iso).toLocaleDateString(isTh ? 'th-TH' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

const PasskeySettings: React.FC = () => {
  const { session } = useAuth();
  const userId = session?.user?.id ?? '';
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isTh = language === 'th';

  const [passkeys, setPasskeys] = useState<StoredPasskey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── Redirect ถ้าไม่ได้ login ────────────────────────────────────────────
  useEffect(() => {
    if (!userId) {
      void navigate('/login');
    }
  }, [userId, navigate]);

  // ── Check passkey support ───────────────────────────────────────────────
  useEffect(() => {
    void isPasskeyAvailable().then(setPasskeySupported);
  }, []);

  // ── Load passkeys จาก Supabase ─────────────────────────────────────────
  const loadPasskeys = useCallback(async () => {
    if (!userId || !supabase) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('user_passkeys')
        .select('id, credential_id, name, created_at, last_used_at, device_type, aaguid')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (err) throw err;

      setPasskeys(
        (data ?? []).map((row: Record<string, any>) => ({
          id: row.id as string,
          credentialId: row.credential_id as string,
          name: (row.name as string | null) ?? 'Passkey',
          createdAt: row.created_at as string,
          lastUsedAt: row.last_used_at as string | null,
          deviceType: (row.device_type as StoredPasskey['deviceType']) ?? 'platform',
          aaguid: row.aaguid as string | undefined,
        }))
      );
    } catch (e) {
      setError(isTh ? 'โหลดข้อมูล Passkeys ไม่สำเร็จ — ลองใหม่อีกครั้ง' : 'Failed to load Passkeys — please try again');
    } finally {
      setLoading(false);
    }
  }, [userId, isTh]);

  useEffect(() => {
    void loadPasskeys();
  }, [loadPasskeys]);

  // ── Add new Passkey ─────────────────────────────────────────────────────
  const handleAddPasskey = async () => {
    if (!userId || !supabase) return;
    setAdding(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const email = session?.user?.email ?? userId;

      // Build RegistrationOptions — challenge is generated client-side (no server round-trip)
      const challengeBytes = new Uint8Array(32);
      crypto.getRandomValues(challengeBytes);
      const regOptions: RegistrationOptions = {
        challenge: arrayBufferToBase64Url(challengeBytes.buffer),
        rp: { name: 'Selfprint', id: window.location.hostname },
        user: { id: userId, name: email, displayName: email },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },   // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        timeout: 60_000,
        attestation: 'none',
      };

      const credential = await createPasskeyCredential(regOptions);

      // บันทึก credential ใน Supabase — rawId ใช้เป็น public_key identifier
      const { error: insertErr } = await supabase.from('user_passkeys').insert({
        user_id: userId,
        credential_id: credential.id,
        public_key: credential.rawId,
        name: `Passkey ${new Date().toLocaleDateString(isTh ? 'th-TH' : 'en-US')}`,
        device_type: 'platform',
        counter: 0,
      });

      if (insertErr) throw insertErr;

      setSuccessMsg(isTh ? 'เพิ่ม Passkey ใหม่เรียบร้อยแล้ว ✅' : 'New Passkey added successfully ✅');
      void loadPasskeys();
    } catch (e) {
      const msg = e instanceof Error ? e.message : (isTh ? 'เพิ่ม Passkey ไม่สำเร็จ' : 'Failed to add Passkey');
      setError(msg);
    } finally {
      setAdding(false);
    }
  };

  // ── Delete Passkey ──────────────────────────────────────────────────────
  const handleDelete = async (passkeyId: string) => {
    if (passkeys.length <= 1) {
      setError(isTh
        ? 'ไม่สามารถลบ Passkey สุดท้ายได้ — ต้องมีอย่างน้อย 1 วิธีเข้าสู่ระบบ'
        : 'Cannot delete your last Passkey — you need at least 1 way to sign in');
      return;
    }

    setDeletingId(passkeyId);
    setError(null);
    setSuccessMsg(null);

    if (!supabase) { setError('Database not configured'); return; }
    try {
      const { error: deleteErr } = await supabase
        .from('user_passkeys')
        .delete()
        .eq('id', passkeyId)
        .eq('user_id', userId);

      if (deleteErr) throw deleteErr;

      setSuccessMsg(isTh ? 'ลบ Passkey เรียบร้อยแล้ว' : 'Passkey deleted');
      void loadPasskeys();
    } catch (e) {
      setError(isTh ? 'ลบ Passkey ไม่สำเร็จ — ลองใหม่อีกครั้ง' : 'Failed to delete Passkey — please try again');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="passkey-settings-page">
      <NavBar />

      <main className="passkey-settings-main">
        <div className="passkey-settings-container">
          <div className="passkey-settings-header">
            <button
              className="passkey-back-btn"
              onClick={() => navigate(-1)}
              type="button"
            >
              {isTh ? '← กลับ' : '← Back'}
            </button>
            <h1 className="passkey-settings-title">🔑 {isTh ? 'จัดการ Passkeys' : 'Manage Passkeys'}</h1>
            <p className="passkey-settings-subtitle">
              {isTh
                ? 'Passkey ช่วยให้คุณเข้าสู่ระบบด้วยการสแกนนิ้ว / ใบหน้า / PIN ของอุปกรณ์ได้อย่างปลอดภัย'
                : "Passkeys let you sign in securely with your device's fingerprint, face, or PIN"}
            </p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="passkey-alert passkey-alert--error" role="alert">
              ❌ {error}
              <button
                className="passkey-alert-close"
                onClick={() => setError(null)}
                type="button"
                aria-label={isTh ? 'ปิด' : 'Close'}
              >×</button>
            </div>
          )}
          {successMsg && (
            <div className="passkey-alert passkey-alert--success" role="status">
              {successMsg}
              <button
                className="passkey-alert-close"
                onClick={() => setSuccessMsg(null)}
                type="button"
                aria-label={isTh ? 'ปิด' : 'Close'}
              >×</button>
            </div>
          )}

          {/* Passkey List */}
          <div className="passkey-list-section">
            <div className="passkey-list-header">
              <h2 className="passkey-list-title">
                {isTh ? 'Passkeys ที่ลงทะเบียนแล้ว' : 'Registered Passkeys'}
                <span className="passkey-count">{passkeys.length}</span>
              </h2>

              {passkeySupported && (
                <button
                  className="passkey-add-btn"
                  onClick={() => void handleAddPasskey()}
                  disabled={adding}
                  type="button"
                >
                  {adding
                    ? (isTh ? '⏳ กำลังเพิ่ม...' : '⏳ Adding...')
                    : (isTh ? '+ เพิ่ม Passkey ใหม่' : '+ Add new Passkey')}
                </button>
              )}
            </div>

            {loading ? (
              <div className="passkey-loading">{isTh ? '⏳ กำลังโหลด...' : '⏳ Loading...'}</div>
            ) : passkeys.length === 0 ? (
              <div className="passkey-empty">
                <p>{isTh ? 'ยังไม่มี Passkey ที่ลงทะเบียน' : 'No Passkeys registered yet'}</p>
                {passkeySupported && (
                  <button
                    className="passkey-add-btn passkey-add-btn--large"
                    onClick={() => void handleAddPasskey()}
                    disabled={adding}
                    type="button"
                  >
                    {adding
                      ? (isTh ? '⏳ กำลังเพิ่ม...' : '⏳ Adding...')
                      : (isTh ? '🔑 เพิ่ม Passkey แรก' : '🔑 Add your first Passkey')}
                  </button>
                )}
              </div>
            ) : (
              <ul className="passkey-list">
                {passkeys.map((pk) => (
                  <li key={pk.id} className="passkey-item">
                    <div className="passkey-item-icon">{deviceIcon(pk.deviceType)}</div>
                    <div className="passkey-item-info">
                      <p className="passkey-item-name">{pk.name}</p>
                      <p className="passkey-item-meta">
                        {isTh ? `เพิ่มเมื่อ ${formatDate(pk.createdAt, isTh)}` : `Added ${formatDate(pk.createdAt, isTh)}`}
                        {pk.lastUsedAt && (isTh ? ` · ใช้ล่าสุด ${formatDate(pk.lastUsedAt, isTh)}` : ` · Last used ${formatDate(pk.lastUsedAt, isTh)}`)}
                      </p>
                    </div>
                    <button
                      className="passkey-delete-btn"
                      onClick={() => void handleDelete(pk.id)}
                      disabled={deletingId === pk.id}
                      type="button"
                      aria-label={isTh ? `ลบ ${pk.name}` : `Delete ${pk.name}`}
                    >
                      {deletingId === pk.id ? '⏳' : '🗑'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Security Info */}
          <div className="passkey-security-info">
            <h3 className="passkey-security-title">ℹ️ {isTh ? 'ข้อมูลความปลอดภัย' : 'Security info'}</h3>
            <ul className="passkey-security-list">
              {isTh ? (
                <>
                  <li>Passkeys ไม่มีรหัสผ่านที่ถูกขโมยได้ — เข้าสู่ระบบด้วยชีวมิติของคุณเท่านั้น</li>
                  <li>ข้อมูล Passkey ถูกเก็บในอุปกรณ์ของคุณ ไม่ใช่บนเซิร์ฟเวอร์</li>
                  <li>ถ้าทำอุปกรณ์หาย ยังสามารถเข้าระบบด้วย Google / Apple / Magic Link</li>
                  <li>ลบ Passkey ได้ตลอดเวลา — ต้องมีอย่างน้อย 1 วิธีเข้าสู่ระบบ</li>
                </>
              ) : (
                <>
                  <li>Passkeys have no password that can be stolen — you sign in with your own biometrics</li>
                  <li>Passkey data lives on your device, not on a server</li>
                  <li>If you lose your device, you can still sign in with Google / Apple / Magic Link</li>
                  <li>You can delete a Passkey anytime — you just need at least 1 way to sign in</li>
                </>
              )}
            </ul>
          </div>

          {!passkeySupported && (
            <div className="passkey-unsupported">
              {isTh
                ? '⚠️ อุปกรณ์หรือเบราว์เซอร์นี้ไม่รองรับ Passkey — ลองใช้ Chrome / Safari บน iOS/Android'
                : '⚠️ This device or browser doesn\'t support Passkeys — try Chrome / Safari on iOS/Android'}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default PasskeySettings;
