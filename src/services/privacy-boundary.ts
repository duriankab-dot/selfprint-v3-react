/**
 * Privacy Boundary Service
 * § P3.3 - User Data Privacy & GDPR Compliance
 *
 * Handles:
 * - Public vs Private journey modes
 * - Data retention policies
 * - Anonymous mode
 * - GDPR compliance (export, deletion, consent)
 * - User data lifecycle management
 */

import { supabase } from './supabase-service';

/**
 * Privacy mode configuration
 */
export type PrivacyMode = 'public' | 'private' | 'anonymous';

export interface PrivacySettings {
  mode: PrivacyMode;
  allowAnalytics: boolean;
  allowDataRetention: boolean;
  retentionDays: number; // Auto-delete data after X days
  consentGivenAt?: string; // ISO timestamp
  lastUpdatedAt: string;
}

/**
 * User data export for GDPR
 */
export interface UserDataExport {
  profile: Record<string, any>;
  journeys: Array<{
    id: string;
    data: Record<string, any>;
    createdAt: string;
  }>;
  badges: Array<{
    id: string;
    worldId: string;
    unlockedAt?: string;
  }>;
  preferences: PrivacySettings;
  exportedAt: string;
}

/**
 * Privacy Boundary Manager
 */
export class PrivacyBoundaryManager {
  private settings: PrivacySettings | null = null;
  private userId: string | null = null;

  /**
   * Initialize with user
   */
  async initialize(userId: string): Promise<void> {
    this.userId = userId;
    await this.loadSettings();
  }

  /**
   * Load user privacy settings from Supabase
   */
  async loadSettings(): Promise<PrivacySettings> {
    if (!this.userId) {
      return this.getDefaultSettings();
    }

    if (this.settings) {
      return this.settings;
    }

    try {
      const { data, error } = await supabase
        .from('user_privacy_settings')
        .select('*')
        .eq('user_id', this.userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        this.settings = data as PrivacySettings;
        return this.settings;
      }
    } catch (error) {
      console.warn('[Privacy] Failed to load settings:', error);
    }

    this.settings = this.getDefaultSettings();
    return this.settings;
  }

  /**
   * Get default privacy settings (most restrictive)
   */
  private getDefaultSettings(): PrivacySettings {
    return {
      mode: 'private', // Default to private
      allowAnalytics: false,
      allowDataRetention: true,
      retentionDays: 90, // Auto-delete after 90 days
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  /**
   * Update privacy mode (public / private / anonymous)
   */
  async setPrivacyMode(mode: PrivacyMode): Promise<PrivacySettings> {
    if (!this.userId) {
      throw new Error('User not initialized');
    }

    const settings: PrivacySettings = {
      ...this.settings!,
      mode,
      lastUpdatedAt: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from('user_privacy_settings')
        .upsert({
          user_id: this.userId,
          ...settings,
        });

      if (error) throw error;
      this.settings = settings;
      return settings;
    } catch (error) {
      console.error('[Privacy] Failed to set mode:', error);
      throw error;
    }
  }

  /**
   * Give analytics consent (GDPR)
   */
  async giveAnalyticsConsent(allowed: boolean): Promise<PrivacySettings> {
    if (!this.userId) {
      throw new Error('User not initialized');
    }

    const settings: PrivacySettings = {
      ...this.settings!,
      allowAnalytics: allowed,
      consentGivenAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from('user_privacy_settings')
        .upsert({
          user_id: this.userId,
          ...settings,
        });

      if (error) throw error;

      // Store consent record for audit
      await supabase.from('privacy_consent_log').insert({
        user_id: this.userId,
        consent_type: 'analytics',
        allowed,
        given_at: settings.consentGivenAt,
      });

      this.settings = settings;
      return settings;
    } catch (error) {
      console.error('[Privacy] Failed to give consent:', error);
      throw error;
    }
  }

  /**
   * Set data retention policy (days)
   */
  async setRetentionPolicy(days: number): Promise<PrivacySettings> {
    if (!this.userId) {
      throw new Error('User not initialized');
    }

    if (days < 0 || days > 365) {
      throw new Error('Retention days must be between 0 (delete immediately) and 365');
    }

    const settings: PrivacySettings = {
      ...this.settings!,
      retentionDays: days,
      lastUpdatedAt: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from('user_privacy_settings')
        .upsert({
          user_id: this.userId,
          ...settings,
        });

      if (error) throw error;
      this.settings = settings;
      return settings;
    } catch (error) {
      console.error('[Privacy] Failed to set retention:', error);
      throw error;
    }
  }

  /**
   * Export all user data (GDPR Right to Access)
   */
  async exportAllData(): Promise<UserDataExport> {
    if (!this.userId) {
      throw new Error('User not initialized');
    }

    try {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', this.userId)
        .single();

      // Fetch all journeys
      const { data: journeys } = await supabase
        .from('user_journeys')
        .select('*')
        .eq('user_id', this.userId);

      // Fetch all badges
      const { data: badges } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', this.userId);

      const exportData: UserDataExport = {
        profile: profile || {},
        journeys: (journeys || []).map(j => ({
          id: j.id,
          data: j,
          createdAt: j.created_at,
        })),
        badges: (badges || []).map(b => ({
          id: b.id,
          worldId: b.world_id,
          unlockedAt: b.unlocked_at,
        })),
        preferences: this.settings!,
        exportedAt: new Date().toISOString(),
      };

      // Log export for audit trail
      await supabase.from('privacy_audit_log').insert({
        user_id: this.userId,
        action: 'data_export',
        performed_at: exportData.exportedAt,
      });

      return exportData;
    } catch (error) {
      console.error('[Privacy] Failed to export data:', error);
      throw error;
    }
  }

  /**
   * Permanently delete all user data (GDPR Right to Deletion)
   */
  async deleteAllData(reason?: string): Promise<void> {
    if (!this.userId) {
      throw new Error('User not initialized');
    }

    try {
      // Log deletion request for compliance
      await supabase.from('privacy_audit_log').insert({
        user_id: this.userId,
        action: 'data_deletion_requested',
        metadata: { reason },
        performed_at: new Date().toISOString(),
      });

      // Delete user data in cascading order
      // 1. Delete journeys
      await supabase.from('user_journeys').delete().eq('user_id', this.userId);

      // 2. Delete badges
      await supabase.from('user_badges').delete().eq('user_id', this.userId);

      // 3. Delete privacy settings
      await supabase.from('user_privacy_settings').delete().eq('user_id', this.userId);

      // 4. Delete profile (last)
      await supabase.from('profiles').delete().eq('id', this.userId);

      // 5. Log completion
      await supabase.from('privacy_audit_log').insert({
        user_id: this.userId,
        action: 'data_deletion_completed',
        performed_at: new Date().toISOString(),
      });

      console.log('[Privacy] User data deleted:', this.userId);
    } catch (error) {
      console.error('[Privacy] Failed to delete data:', error);
      throw error;
    }
  }

  /**
   * Check if data should be expired based on retention policy
   */
  async expireOldData(): Promise<number> {
    if (!this.settings) {
      return 0;
    }

    if (this.settings.retentionDays === 0) {
      // Delete immediately (extreme privacy)
      await this.deleteAllData('Retention policy: delete immediately');
      return 1;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.settings.retentionDays);

    try {
      const { count, error } = await supabase
        .from('user_journeys')
        .delete()
        .eq('user_id', this.userId!)
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;

      if ((count || 0) > 0) {
        console.log(
          `[Privacy] Expired ${count} old journeys for user ${this.userId}`
        );
      }

      return count || 0;
    } catch (error) {
      console.error('[Privacy] Failed to expire data:', error);
      return 0;
    }
  }

  /**
   * Get current privacy settings
   */
  getSettings(): PrivacySettings {
    return this.settings || this.getDefaultSettings();
  }

  /**
   * Check if journeys should be stored (based on mode + retention)
   */
  shouldStoreJourney(): boolean {
    const settings = this.getSettings();

    // Never store in anonymous mode
    if (settings.mode === 'anonymous') {
      return false;
    }

    // Always store if retention is enabled
    if (settings.allowDataRetention) {
      return true;
    }

    // Don't store if retention is disabled
    return false;
  }

  /**
   * Check if analytics should be tracked
   */
  shouldTrackAnalytics(): boolean {
    return this.getSettings().allowAnalytics;
  }

  /**
   * Anonymize user data (remove identifiers)
   */
  async anonymizeData(): Promise<void> {
    if (!this.userId) {
      throw new Error('User not initialized');
    }

    try {
      // Clear profile identifiers
      await supabase
        .from('profiles')
        .update({
          full_name: '[Anonymized]',
          email: null,
          phone: null,
        })
        .eq('id', this.userId);

      // Clear journey details (keep only aggregated data)
      await supabase.from('user_journeys').delete().eq('user_id', this.userId);

      console.log('[Privacy] User data anonymized:', this.userId);
    } catch (error) {
      console.error('[Privacy] Failed to anonymize data:', error);
      throw error;
    }
  }
}

/**
 * Singleton instance
 */
export const privacyBoundary = new PrivacyBoundaryManager();
