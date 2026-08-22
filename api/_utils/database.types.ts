/**
 * Database type definitions for Supabase tables used in API routes
 * Based on actual schema inferred from code
 *
 * SCHEMA-TS-001 FIX (2026-08-22): @supabase/supabase-js 2.112.x's
 * PostgrestClient requires each schema to satisfy GenericSchema
 * (Tables/Views/Functions) and each table to satisfy GenericTable
 * (Row/Insert/Update/Relationships) — see
 * node_modules/@supabase/postgrest-js/dist/index.d.mts. This hand-written
 * type file only had Tables{Row/Insert/Update} with no Relationships, and
 * `public` had no Views/Functions keys. TypeScript can't resolve a schema
 * that doesn't satisfy the generic bound, so it silently collapses every
 * row type to `never` — which is why every `data.column_name` access in
 * unified-handler.ts (subscription, blueprint, profile, share modules)
 * failed to compile with "Property '...' does not exist on type 'never'".
 * This did not surface in `npm run build` (tsc -b, vite build) because
 * that project only typechecks src/, not api/ — Vercel's separate function
 * build step is what caught it.
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
