/**
 * src/pages/TwinSettingsPage.tsx
 * Twin settings & preferences (P0 #7.1)
 * Configure Twin personality, notification preferences, world focus
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTwin } from '../context/TwinContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase-service';
import '../styles/twin-settings.css';

interface TwinPreferences {
  personality_tone: 'warm' | 'analytical' | 'playful' | 'supportive';
  notification_frequency: 'high' | 'medium' | 'low' | 'none';
  default_world: string | null;
  voice_enabled: boolean;
  daily_brief_enabled: boolean;
  personality_evolution_enabled: boolean;
}

export default function TwinSettingsPage() {
  const { session } = useAuth();
  const { currentWorld } = useTwin();
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
      if (!session?.user?.id) throw new Error('User not authenticated');

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
      setSaveError(error instanceof Error ? error.message : 'Failed to save preferences');
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
    return <div className="twin-settings-page loading">Loading preferences...</div>;
  }

  return (
    <div className="twin-settings-page">
      <div className="twin-settings-container">
        <header className="twin-settings-header">
          <h1>Twin Settings</h1>
          <p>Customize your Twin's personality and behavior</p>
        </header>

        <div className="twin-settings-content">
          {/* Personality Tone */}
          <section className="settings-section">
            <h2>Personality Tone</h2>
            <p className="section-description">How should your Twin communicate?</p>
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
                    {tone.charAt(0).toUpperCase() + tone.slice(1)}
                  </span>
                  <span className="option-hint">
                    {tone === 'warm' && 'Caring and empathetic'}
                    {tone === 'analytical' && 'Logical and detailed'}
                    {tone === 'playful' && 'Fun and light-hearted'}
                    {tone === 'supportive' && 'Encouraging and balanced'}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Notification Frequency */}
          <section className="settings-section">
            <h2>Notification Frequency</h2>
            <p className="section-description">How often should Twin reach out?</p>
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
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Feature Toggles */}
          <section className="settings-section">
            <h2>Features</h2>
            <div className="settings-toggles">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={prefs.voice_enabled}
                  onChange={(e) => setPrefs({ ...prefs, voice_enabled: e.target.checked })}
                  disabled={isSaving}
                />
                <span>Voice Chat</span>
              </label>
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={prefs.daily_brief_enabled}
                  onChange={(e) => setPrefs({ ...prefs, daily_brief_enabled: e.target.checked })}
                  disabled={isSaving}
                />
                <span>Daily Brief</span>
              </label>
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={prefs.personality_evolution_enabled}
                  onChange={(e) => setPrefs({ ...prefs, personality_evolution_enabled: e.target.checked })}
                  disabled={isSaving}
                />
                <span>Personality Evolution</span>
              </label>
            </div>
          </section>

          {/* Default World */}
          <section className="settings-section">
            <h2>Default World</h2>
            <p className="section-description">Which world should Twin focus on by default?</p>
            <input
              type="text"
              placeholder="Leave empty for no preference"
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
              {isSaving || saveMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleReset}
              disabled={isSaving || saveMutation.isPending}
              className="btn btn-secondary"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
