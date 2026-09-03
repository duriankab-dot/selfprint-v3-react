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
      // SCHEMA-TS-002 FIX (3 ก.ย. 2026): blueprints / users_profiles /
      // share_links used to be declared here under `public`, but every query
      // against them in api/unified-handler.ts goes through
      // `.schema('selfprint')` — because migrations 002_profiles_blueprints.sql
      // and 004_share_links.sql create them in a dedicated `selfprint` Postgres
      // schema (this project already has unrelated public.blueprints /
      // public.users_profiles belonging to a different product). There was no
      // `selfprint` key on this interface at all, so `.schema('selfprint')`
      // did not type-check — which nobody noticed because api/ was never in
      // any tsconfig. Moved to the `selfprint` block at the bottom of this file.
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
  /**
   * SCHEMA-TS-002: the dedicated `selfprint` Postgres schema.
   * Source of truth: supabase/migrations/002_profiles_blueprints.sql and
   * supabase/migrations/004_share_links.sql.
   *
   * หมายเหตุ: ยังมี drift ที่ยังไม่ได้แก้ในไฟล์นี้ (ดู FORENSIC_AUDIT_HONEST_
   * STATUS_HANDOFF_TH.md หัวข้อ DB-05) — `blueprints.updated_at` ไม่มีจริงใน
   * migration, `blueprints.version` มีจริงแต่ไม่ได้ประกาศไว้ที่นี่ และตารางอีก
   * ~60 ตารางในระบบยังไม่มี type เลย วิธีแก้ที่ถูกต้องคือ generate ใหม่ทั้งไฟล์
   * ด้วย `supabase gen types typescript --schema public --schema selfprint`
   * หลังจากรวม migration ให้เรียบร้อยก่อน — ยังไม่ทำในรอบนี้เพราะจะไปแตะ
   * migration ที่ apply ไปแล้ว (อยู่ในโซนห้ามแตะ ต้องให้เจ้าของตัดสินใจก่อน)
   */
  selfprint: {
    Tables: {
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
          version?: number;
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
          version?: number;
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
          version?: number;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
