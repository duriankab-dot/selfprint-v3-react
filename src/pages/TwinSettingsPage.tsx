/**
 * src/pages/TwinSettingsPage.tsx
 * Twin settings & preferences (P0 #7.1)
 * Configure Twin personality, notification preferences, world focus
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTwin } from '../context/TwinContext';
import { useLanguage } from '../context/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase-service';
import { TwinNav } from '../components/twin/TwinNav';
import { NavRail } from '../components/layout/NavRail';
import '../styles/twin-settings.css';

interface TwinPreferences {
  personality_tone: 'warm' | 'analytical' | 'playful' | 'supportive';
  notification_frequency: 'high' | 'medium' | 'low' | 'none';
  default_world: string | null;
  voice_enabled: boolean;
  daily_brief_enabled: boolean;
  personality_evolution_enabled: boolean;
}

// TWINSETTINGS-I18N-001 FIX: page had zero useLanguage() — 100% hardcoded
// English regardless of /th vs /en ("ภาษาใน...ตั้งค่าก็ต้องเป็นภาษาไทยธรรมชาติด้วย").
const TONE_LABELS: Record<TwinPreferences['personality_tone'], { en: string; th: string; hintEn: string; hintTh: string }> = {
  warm: { en: 'Warm', th: 'อบอุ่น', hintEn: 'Caring and empathetic', hintTh: 'เอาใจใส่ เข้าอกเข้าใจ' },
  analytical: { en: 'Analytical', th: 'เชิงวิเคราะห์', hintEn: 'Logical and detailed', hintTh: 'มีเหตุผล ละเอียดรอบคอบ' },
  playful: { en: 'Playful', th: 'สนุกสนาน', hintEn: 'Fun and light-hearted', hintTh: 'สนุก เป็นกันเอง' },
  supportive: { en: 'Supportive', th: 'ให้กำลังใจ', hintEn: 'Encouraging and balanced', hintTh: 'ให้กำลังใจ สมดุล' },
};

const FREQ_LABELS: Record<TwinPreferences['notification_frequency'], { en: string; th: string }> = {
  high: { en: 'High', th: 'บ่อย' },
  medium: { en: 'Medium', th: 'ปานกลาง' },
  low: { en: 'Low', th: 'น้อย' },
  none: { en: 'None', th: 'ไม่ต้องแจ้งเตือน' },
};

export default function TwinSettingsPage() {
  const { session } = useAuth();
  const { currentWorld } = useTwin();
  const { language } = useLanguage();
  const isTh = language === 'th';
  const queryClient = useQueryClient();

  const [prefs, setPrefs] = useState<TwinPreferences>({
    personality_tone: 'supportive',
    notification_frequency: 'medium',
    default_world: currentWorld || null,
    voice_enabled: false,
    daily_brief_enabled: true,
    personality_evolution_enabled: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load preferences from user_metadata
  const { data: userPrefs, isLoading } = useQuery({
    queryKey: ['twinPreferences', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data: { user } } = await supabase.auth.getUser();
      return user?.user_metadata?.twin_preferences as TwinPreferences | undefined;
    },
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    if (userPrefs) {
      setPrefs(userPrefs);
    }
  }, [userPrefs]);

  // Save preferences mutation
  const saveMutation = useMutation({
    mutationFn: async (newPrefs: TwinPreferences) => {
      if (!session?.user?.id) throw new Error(isTh ? 'เซสชันผู้ใช้หมดอายุ' : 'User not authenticated');

      const { error } = await supabase.auth.updateUser({
        data: {
          twin_preferences: newPrefs,
        },
      });

      if (error) throw error;
      return newPrefs;
    },
    onSuccess: (data) => {
      setPrefs(data);
      setSaveError(null);
      queryClient.invalidateQueries({ queryKey: ['twinPreferences', session?.user?.id] });
    },
    onError: (error) => {
      setSaveError(error instanceof Error ? error.message : (isTh ? 'บันทึกการตั้งค่าไม่สำเร็จ' : 'Failed to save preferences'));
    },
  });

  const handleSave = async () => {
    setIsSaving(true);
    await saveMutation.mutateAsync(prefs);
    setIsSaving(false);
  };

  const handleReset = () => {
    if (userPrefs) {
      setPrefs(userPrefs);
    }
  };

  if (isLoading) {
    return (
      <div className="twin-settings-page loading">
        {isTh ? 'กำลังโหลดการตั้งค่า...' : 'Loading preferences...'}
      </div>
    );
  }

  return (
    <div className="twin-settings-page">
      <NavRail />
      {/* APPSHELL-004: Twin app-space sub-nav */}
      <TwinNav currentTab="settings" />
      <div className="twin-settings-container">
        <header className="twin-settings-header">
          <h1>{isTh ? 'ตั้งค่าทวิน' : 'Twin Settings'}</h1>
          <p>{isTh ? 'ปรับแต่งบุคลิกภาพและพฤติกรรมของทวินคุณ' : "Customize your Twin's personality and behavior"}</p>
        </header>

        <div className="twin-settings-content">
          {/* Personality Tone */}
          <section className="settings-section">
            <h2>{isTh ? 'โทนบุคลิกภาพ' : 'Personality Tone'}</h2>
            <p className="section-description">{isTh ? 'ทวินของคุณควรพูดคุยกับคุณแบบไหน?' : 'How should your Twin communicate?'}</p>
            <div className="settings-options">
              {(['warm', 'analytical', 'playful', 'supportive'] as const).map((tone) => (
                <label key={tone} className="option-label">
                  <input
                    type="radio"
                    name="personality_tone"
                    value={tone}
                    checked={prefs.personality_tone === tone}
                    onChange={(e) => setPrefs({ ...prefs, personality_tone: e.target.value as TwinPreferences['personality_tone'] })}
                    disabled={isSaving}
                  />
                  <span className="option-name">
                    {isTh ? TONE_LABELS[tone].th : TONE_LABELS[tone].en}
                  </span>
                  <span className="option-hint">
                    {isTh ? TONE_LABELS[tone].hintTh : TONE_LABELS[tone].hintEn}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Notification Frequency */}
          <section className="settings-section">
            <h2>{isTh ? 'ความถี่การแจ้งเตือน' : 'Notification Frequency'}</h2>
            <p className="section-description">{isTh ? 'ทวินควรทักคุณบ่อยแค่ไหน?' : 'How often should Twin reach out?'}</p>
            <div className="settings-options">
              {(['high', 'medium', 'low', 'none'] as const).map((freq) => (
                <label key={freq} className="option-label">
                  <input
                    type="radio"
                    name="notification_frequency"
                    value={freq}
                    checked={prefs.notification_frequency === freq}
                    onChange={(e) => setPrefs({ ...prefs, notification_frequency: e.target.value as TwinPreferences['notification_frequency'] })}
                    disabled={isSaving}
                  />
                  <span className="option-name">
                    {isTh ? FREQ_LABELS[freq].th : FREQ_LABELS[freq].en}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Feature Toggles */}
          <section className="settings-section">
            <h2>{isTh ? 'ฟีเจอร์' : 'Features'}</h2>
            <div className="settings-toggles">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={prefs.voice_enabled}
                  onChange={(e) => setPrefs({ ...prefs, voice_enabled: e.target.checked })}
                  disabled={isSaving}
                />
                <span>{isTh ? 'แชทด้วยเสียง' : 'Voice Chat'}</span>
              </label>
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={prefs.daily_brief_enabled}
                  onChange={(e) => setPrefs({ ...prefs, daily_brief_enabled: e.target.checked })}
                  disabled={isSaving}
                />
                <span>{isTh ? 'สรุปประจำวัน' : 'Daily Brief'}</span>
              </label>
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={prefs.personality_evolution_enabled}
                  onChange={(e) => setPrefs({ ...prefs, personality_evolution_enabled: e.target.checked })}
                  disabled={isSaving}
                />
                <span>{isTh ? 'พัฒนาการบุคลิกภาพ' : 'Personality Evolution'}</span>
              </label>
            </div>
          </section>

          {/* Default World */}
          <section className="settings-section">
            <h2>{isTh ? 'โลกเริ่มต้น' : 'Default World'}</h2>
            <p className="section-description">{isTh ? 'ทวินควรโฟกัสที่โลกไหนเป็นค่าเริ่มต้น?' : 'Which world should Twin focus on by default?'}</p>
            <input
              type="text"
              placeholder={isTh ? 'เว้นว่างไว้หากไม่มีโลกที่ต้องการ' : 'Leave empty for no preference'}
              value={prefs.default_world || ''}
              onChange={(e) => setPrefs({ ...prefs, default_world: e.target.value || null })}
              disabled={isSaving}
              className="text-input"
            />
          </section>

          {/* Error Message */}
          {saveError && <div className="error-message">{saveError}</div>}

          {/* Action Buttons */}
          <div className="settings-actions">
            <button
              onClick={handleSave}
              disabled={isSaving || saveMutation.isPending}
              className="btn btn-primary"
            >
              {isSaving || saveMutation.isPending
                ? (isTh ? 'กำลังบันทึก...' : 'Saving...')
                : (isTh ? 'บันทึกการเปลี่ยนแปลง' : 'Save Changes')}
            </button>
            <button
              onClick={handleReset}
              disabled={isSaving || saveMutation.isPending}
              className="btn btn-secondary"
            >
              {isTh ? 'ล้างค่า' : 'Reset'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
