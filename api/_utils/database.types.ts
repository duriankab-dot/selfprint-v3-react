/**
 * Database type definitions for Supabase tables used in API routes
 * Based on actual schema inferred from code
 */
export interface Database {
  public: {
    Tables: {
      push_subscriptions: {
        Row: {
          user_id: string;
          endpoint: string;
          keys_p256dh: string;
          keys_auth: string;
          is_active: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          user_id: string;
          endpoint: string;
          keys_p256dh: string;
          keys_auth: string;
          is_active?: boolean;
        };
        Update: {
          user_id?: string;
          endpoint?: string;
          keys_p256dh?: string;
          keys_auth?: string;
          is_active?: boolean;
        };
      };
      subscriptions: {
        Row: {
          user_id: string;
          tier: string;
          status: string;
          expires_at?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
        };
        Insert: {
          user_id: string;
          tier: string;
          status: string;
          expires_at?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
        };
        Update: {
          user_id?: string;
          tier?: string;
          status?: string;
          expires_at?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
        };
      };
      decision_log: {
        Row: {
          id: string;
          user_id: string;
          hub: string;
          mood: string;
          autonomy_level: number;
          confidence: number;
          hesitation: number;
          response_time_ms: number;
          message_length: number;
          response_length: number;
          created_at?: string;
        };
        Insert: {
          user_id: string;
          hub: string;
          mood: string;
          autonomy_level: number;
          confidence: number;
          hesitation: number;
          response_time_ms: number;
          message_length?: number;
          response_length?: number;
        };
        Update: {
          user_id?: string;
          hub?: string;
          mood?: string;
          autonomy_level?: number;
          confidence?: number;
          hesitation?: number;
          response_time_ms?: number;
          message_length?: number;
          response_length?: number;
        };
      };
      blueprints: {
        Row: {
          id: string;
          user_id: string;
          profile_id?: string | null;
          accuracy_level: number;
          decision_style?: string | null;
          strengths: string[];
          insights: string[];
          opportunities: string[];
          blind_spots: string[];
          prototype_core?: string | null;
          is_latest: boolean;
          source: string;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          user_id: string;
          profile_id?: string | null;
          accuracy_level: number;
          decision_style?: string | null;
          strengths?: string[];
          insights?: string[];
          opportunities?: string[];
          blind_spots?: string[];
          prototype_core?: string | null;
          is_latest?: boolean;
          source?: string;
        };
        Update: {
          user_id?: string;
          profile_id?: string | null;
          accuracy_level?: number;
          decision_style?: string | null;
          strengths?: string[];
          insights?: string[];
          opportunities?: string[];
          blind_spots?: string[];
          prototype_core?: string | null;
          is_latest?: boolean;
          source?: string;
        };
      };
      users_profiles: {
        Row: {
          id: string;
          user_id: string;
          date_of_birth?: string | null;
          time_of_birth?: string | null;
          place_of_birth?: string | null;
          initial_mood?: string | null;
          updated_at?: string;
        };
        Insert: {
          user_id: string;
          date_of_birth?: string | null;
          time_of_birth?: string | null;
          place_of_birth?: string | null;
          initial_mood?: string | null;
        };
        Update: {
          user_id?: string;
          date_of_birth?: string | null;
          time_of_birth?: string | null;
          place_of_birth?: string | null;
          initial_mood?: string | null;
        };
      };
      share_links: {
        Row: {
          id: string;
          user_id: string;
          code: string;
          created_at?: string;
        };
        Insert: {
          user_id: string;
          code: string;
        };
        Update: {
          user_id?: string;
          code?: string;
        };
      };
      personal_models: {
        Row: {
          id: string;
          user_id: string;
          context_data?: any;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          user_id: string;
          context_data?: any;
        };
        Update: {
          user_id?: string;
          context_data?: any;
        };
      };
      journal_queue: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          synced_at?: string | null;
          sync_error?: string | null;
          sync_attempts: number;
          created_at?: string;
        };
        Insert: {
          user_id: string;
          content: string;
          synced_at?: string | null;
          sync_error?: string | null;
          sync_attempts?: number;
        };
        Update: {
          user_id?: string;
          content?: string;
          synced_at?: string | null;
          sync_error?: string | null;
          sync_attempts?: number;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          hub?: string | null;
          mood?: string | null;
          created_at?: string;
        };
        Insert: {
          user_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          hub?: string | null;
          mood?: string | null;
        };
        Update: {
          user_id?: string;
          role?: 'user' | 'assistant' | 'system';
          content?: string;
          hub?: string | null;
          mood?: string | null;
        };
      };
    };
  };
}