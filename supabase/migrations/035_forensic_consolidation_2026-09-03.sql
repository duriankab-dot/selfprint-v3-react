-- ============================================================================
-- 035_forensic_consolidation_2026-09-03.sql
--
-- สรุปจาก forensic audit 3 ก.ย. 2026 (ตรวจซอร์สโค้ดจริง .ts/.tsx เทียบกับ
-- .sql ทุกไฟล์ใน repo — ไม่เชื่อเอกสาร .md ใด ๆ)
--
-- เป้าหมาย: ปิดช่องว่างระหว่าง "โค้ดที่รันจริง" กับ "schema ที่ migration
-- ที่ apply แล้วสร้างไว้จริง" ทุกไฟล์ในไฟล์นี้ปลอดภัยรันซ้ำได้
-- (IF NOT EXISTS / DROP POLICY ก่อน CREATE / DO dollar-quote guard) และ "ห้ามทำลาย
-- ข้อมูล" ตามกฎ — ไม่มี DROP TABLE / DROP COLUMN / TRUNCATE / DELETE จริง
-- ในไฟล์นี้เลย
--
-- อ้างอิง: D:\selfprint-v3-react (path ทั้งหมด relative จาก root repo)
-- ============================================================================


-- ============================================================================
-- SECTION 0 — PRE-FLIGHT: DB จริงมีอะไรอยู่แล้วบ้าง
-- ============================================================================
-- GUARD-001 (4 ก.ย. 2026): รันครั้งแรกแล้วล้มที่ `public.daily_briefs does not
-- exist` — พิสูจน์ว่า migration ใน repo **ไม่ได้ถูก apply ขึ้น production ครบ**
-- (ดูคำถามเปิดข้อ 5 ในไฟล์ forensic) ไฟล์นี้จึงถูกแก้ให้ทุกคำสั่งที่แตะตาราง
-- ที่ "อาจไม่มี" ถูกห่อด้วย DO $guard$ ... EXCEPTION WHEN undefined_table
-- แปลว่า: ตารางไหนไม่มี จะ RAISE NOTICE ข้ามไป ไม่ทำให้ทั้งไฟล์ล้ม
-- ดู NOTICE ทั้งหมดได้ที่แท็บ Logs/Messages ของ SQL Editor
--
-- บล็อกนี้บอกก่อนว่าตารางที่ไฟล์นี้จะแตะ มีจริงกี่ตัว
SELECT
  t.name AS expected_table,
  CASE WHEN to_regclass(t.name) IS NULL THEN '❌ ไม่มี — จะถูกข้าม'
       ELSE '✅ มี' END AS status
FROM (VALUES
  ('public.twins'), ('public.decision_log'), ('public.decision_patterns'),
  ('public.personal_contexts'), ('public.personal_context'),
  ('public.daily_briefs'), ('public.twin_learning_profiles'),
  ('public.twin_state'), ('public.twin_personality'), ('public.twin_capabilities'),
  ('public.twin_memory'), ('public.twin_memories'),
  ('public.conversations'), ('public.messages'),
  ('public.conversation_settings'), ('public.conversation_memory'),
  ('public.notification_queue'), ('public.notification_analytics'),
  ('public.notification_schedule'), ('public.follow_up_schedule'),
  ('public.world_stats'), ('public.world_preferences'),
  ('public.auth_rate_limits'), ('public.awakening_essence'),
  ('public.user_credentials'), ('public.user_profiles'),
  ('selfprint.users_profiles'), ('selfprint.blueprints'), ('selfprint.share_links'),
  ('selfprint.performance_metrics'), ('selfprint.autonomy_signals')
) AS t(name)
ORDER BY 2 DESC, 1;


-- ============================================================================
-- SECTION A0 — schema selfprint ต้องมีก่อน (GUARD-002)
-- ============================================================================
-- migration 002_profiles_blueprints.sql เป็นคนสร้าง schema นี้ ถ้าไฟล์นั้นไม่เคย
-- ถูก apply บน DB ตัวนี้ ทุกคำสั่งที่แตะ selfprint.* จะล้มด้วย 3F000
CREATE SCHEMA IF NOT EXISTS selfprint;

GRANT USAGE ON SCHEMA selfprint TO anon, authenticated, service_role;


-- ============================================================================
-- SECTION A — ตารางที่โค้ด live เรียกจริง แต่ไม่มี migration ไหนสร้างไว้
-- ============================================================================
-- หมายเหตุสำคัญ: เช็คแล้วว่าตารางต่อไปนี้ที่เคยสงสัยว่าขาด แท้จริงมีแต่
-- "โค้ดที่เรียกมันตายแล้ว" (ไม่มีใคร import เข้า route/component ที่ live) —
-- ไม่ได้สร้างในไฟล์นี้ เพราะสร้างไปก็ไม่มีใครใช้ (ดูรายงานส่วน Deliverable 3):
--   profiles_blueprints (SelfPrintOrchestrator.ts — 0 importer)
--   pattern_analysis    (ConversationAnalyzer.ts / DecisionIntelligence.ts — 0 importer)
--   detected_patterns   (TwinEvolutionService.ts — importer เดียวคือ component ที่ตายแล้ว)
--   alerts              (AlertingService.ts — 0 importer)
--   user_privacy_settings, privacy_consent_log, user_journeys, user_badges
--                        (privacy-boundary.ts — importer เดียวคือ usePrivacy.ts ที่ไม่มีใครใช้)

-- ---------------------------------------------------------------------------
-- A.1 unlocked_badges — WorldBadgeTracker.ts (LIVE: import โดย WorldContext.tsx)
-- src/services/WorldBadgeTracker.ts:29,67,81 — .from('unlocked_badges')
-- ---------------------------------------------------------------------------
DO $guard$ BEGIN
  EXECUTE $sp$CREATE TABLE IF NOT EXISTS public.unlocked_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  world_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, badge_id, world_id)
)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] ตารางที่ FK ชี้ไปยังไม่มี: %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE INDEX IF NOT EXISTS idx_unlocked_badges_user_world
  ON public.unlocked_badges(user_id, world_id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$ALTER TABLE public.unlocked_badges ENABLE ROW LEVEL SECURITY$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "Users can view own unlocked badges" ON public.unlocked_badges$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "Users can view own unlocked badges"
  ON public.unlocked_badges FOR SELECT
  USING (auth.uid() = user_id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "Users can unlock own badges" ON public.unlocked_badges$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "Users can unlock own badges"
  ON public.unlocked_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$GRANT SELECT, INSERT ON public.unlocked_badges TO authenticated$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;



-- ---------------------------------------------------------------------------
-- A.2 user_passkeys — PasskeySettings.tsx (LIVE: route /settings/passkeys)
-- src/pages/PasskeySettings.tsx:92-93,149-156,186 —
--   .from('user_passkeys').select('id, credential_id, name, created_at,
--   last_used_at, device_type, aaguid') / .insert({user_id, credential_id,
--   public_key, name, device_type, counter}) / .delete()
--
-- ⚠️ คำเตือนสำคัญ (ดูรายงาน Deliverable 2 + Open Questions):
-- การ login/register passkey จริง (supabase/functions/auth-register-passkey,
-- auth-verify-passkey) อ่าน/เขียน 'user_credentials' (migration 012) ไม่ใช่
-- 'user_passkeys' นี้เลย — สองตารางนี้คือคนละตัวที่ไม่เชื่อมกัน หน้า Settings
-- นี้ปัจจุบัน "ใช้งานไม่ได้จริง" (แสดง/เพิ่ม/ลบ passkey ที่ระบบ login จริงไม่รู้จัก)
-- สร้างตารางนี้ไว้เพื่อให้โค้ดที่มีอยู่รันได้ไม่ error ก่อน — การแก้ให้ถูกจุด
-- (redirect ไป user_credentials หรือ sync สองตาราง) ต้องเป็นการตัดสินใจ
-- ระดับสถาปัตยกรรมจากเจ้าของโปรเจกต์ ไม่ใช่สิ่งที่ SQL migration ควรเดาเอง
-- ---------------------------------------------------------------------------
DO $guard$ BEGIN
  EXECUTE $sp$CREATE TABLE IF NOT EXISTS public.user_passkeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Passkey',
  device_type TEXT DEFAULT 'platform',
  aaguid TEXT,
  counter INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] ตารางที่ FK ชี้ไปยังไม่มี: %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE INDEX IF NOT EXISTS idx_user_passkeys_user_id ON public.user_passkeys(user_id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$ALTER TABLE public.user_passkeys ENABLE ROW LEVEL SECURITY$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "Users can view own passkeys" ON public.user_passkeys$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "Users can view own passkeys"
  ON public.user_passkeys FOR SELECT
  USING (auth.uid() = user_id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "Users can add own passkeys" ON public.user_passkeys$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "Users can add own passkeys"
  ON public.user_passkeys FOR INSERT
  WITH CHECK (auth.uid() = user_id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "Users can delete own passkeys" ON public.user_passkeys$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "Users can delete own passkeys"
  ON public.user_passkeys FOR DELETE
  USING (auth.uid() = user_id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$GRANT SELECT, INSERT, DELETE ON public.user_passkeys TO authenticated$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;



-- ---------------------------------------------------------------------------
-- A.3 sice_feedback — AIFeedbackLoop.ts + SICEOrchestrator.ts (LIVE: engine
-- ทำงานทุกครั้งที่ orchestrate() รัน รวมถึงระหว่าง startAwakening())
-- src/services/sice/engines/AIFeedbackLoop.ts:103,227
-- src/services/sice/SICEOrchestrator.ts:358-375
--
-- หมายเหตุ: ตารางนี้ + ทั้ง 3 fix ด้านล่าง (A.3 ถึง B ส่วน decisions/user_id,
-- user_profiles) เคยถูกรันเป็น ad hoc SQL ตรงใน Supabase Dashboard SQL
-- Editor มาก่อนแล้ว (ดู root: PRODUCTION_DB_CATCHUP_2026-09-01.sql, 1 ก.ย. 2569)
-- แต่ไม่เคยถูกบันทึกเป็น migration file ที่ track ใน git เลย — ไฟล์นี้ทำให้
-- fix เหล่านั้นกลายเป็น migration ที่ track จริง (idempotent, ไม่ error ถ้ารันซ้ำ
-- ทับของเดิมที่มีอยู่แล้ว)
-- ---------------------------------------------------------------------------
DO $guard$ BEGIN
  EXECUTE $sp$CREATE TABLE IF NOT EXISTS public.sice_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  engine_id INTEGER NOT NULL,
  feedback_score INTEGER NOT NULL CHECK (feedback_score >= 0 AND feedback_score <= 100),
  feedback_type TEXT,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] ตารางที่ FK ชี้ไปยังไม่มี: %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE INDEX IF NOT EXISTS idx_sice_feedback_user_id ON public.sice_feedback(user_id, created_at DESC)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$ALTER TABLE public.sice_feedback ENABLE ROW LEVEL SECURITY$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "Users can view own sice feedback" ON public.sice_feedback$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "Users can view own sice feedback"
  ON public.sice_feedback FOR SELECT
  TO authenticated
  USING (user_id = auth.uid())$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "Users can insert own sice feedback" ON public.sice_feedback$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "Users can insert own sice feedback"
  ON public.sice_feedback FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid())$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$GRANT SELECT, INSERT ON public.sice_feedback TO authenticated$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;



-- ---------------------------------------------------------------------------
-- A.4 decisions — อ้างถึงจาก SICE engines ที่ live จำนวนมาก (world-routing)
-- แต่ไม่มี migration ที่ apply แล้วไฟล์ไหนสร้างเลย (มีแต่ใน
-- src/services/supabase-schema.sql ที่ไม่เคยถูก apply)
--
-- คอลัมน์อ้างอิงจากโค้ดจริง:
--   src/services/world-routing/WorldDecisionRouter.ts:48-55 (INSERT: twin_id,
--     world, title, description, created_at)
--   src/services/sice/engines/InsightEngine.ts:101-104 (SELECT outcome)
--   src/services/sice/engines/PatternDetector.ts:31-35,
--     src/services/sice/engines/EnvironmentEngine.ts:137-141,
--     src/services/sice/engines/BadgeEngine.ts:162-164,
--     src/services/sice/engines/FutureSelfEngine.ts:167-171,
--     src/services/sice/engines/DecisionIntelligenceEngineAdapter.ts:78-91
--     (SELECT ... .eq('user_id'|'twin_id', ...))
-- ---------------------------------------------------------------------------
DO $guard$ BEGIN
  EXECUTE $sp$CREATE TABLE IF NOT EXISTS public.decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL REFERENCES public.twins(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  world TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  outcome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] ตารางที่ FK ชี้ไปยังไม่มี: %', SQLERRM;
END $guard$;



-- DECISIONS-USERID-001 (จาก PRODUCTION_DB_CATCHUP): กันเคสตารางมีอยู่แล้วแบบ
-- ไม่มี user_id — เผื่อ environment ที่ table ถูกสร้างไปแล้วก่อนไฟล์นี้
DO $guard$ BEGIN
  EXECUTE $sp$ALTER TABLE public.decisions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$ALTER TABLE public.decisions ADD COLUMN IF NOT EXISTS outcome TEXT$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$UPDATE public.decisions d
SET user_id = t.user_id
FROM public.twins t
WHERE d.twin_id = t.id AND d.user_id IS NULL$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE INDEX IF NOT EXISTS idx_decisions_twin_id ON public.decisions(twin_id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE INDEX IF NOT EXISTS idx_decisions_user_id ON public.decisions(user_id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE INDEX IF NOT EXISTS idx_decisions_world ON public.decisions(world)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;



DO $guard$ BEGIN
  EXECUTE $sp$ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "Users can view own decisions" ON public.decisions$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "Users can view own decisions"
  ON public.decisions FOR SELECT
  USING (
    user_id = auth.uid()
    OR twin_id IN (SELECT id FROM public.twins WHERE user_id = auth.uid())
  )$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "Users can insert own decisions" ON public.decisions$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "Users can insert own decisions"
  ON public.decisions FOR INSERT
  WITH CHECK (
    twin_id IN (SELECT id FROM public.twins WHERE user_id = auth.uid())
  )$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$GRANT SELECT, INSERT ON public.decisions TO authenticated$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;




-- ============================================================================
-- SECTION B — คอลัมน์ที่โค้ด live เขียน/อ่านแต่หายไปจากตารางที่มีอยู่แล้ว
-- ============================================================================

-- ---------------------------------------------------------------------------
-- B.1 *** จุดที่วิกฤตที่สุดในทั้งไฟล์ *** — public.twins
--
-- src/services/TwinSupabaseService.ts:130-146 createTwinInDatabase() —
-- INSERT INTO twins(..., primary_archetype, secondary_archetype,
-- maturity_score, evolution_stage, full_analysis) — เรียกจาก
-- src/services/CoreAwakeningService.ts:303 initializeTwin() ทุกครั้งที่มีคน
-- สร้าง Twin ใหม่ (Core Awakening ceremony)
--
-- migration 024_create_twins_table.sql สร้าง twins ด้วยแค่
-- (id, user_id, name, personality_type, created_at, updated_at) — ไม่มี 4
-- คอลัมน์นี้เลย แปลว่า INSERT ข้างบนพัง "ทุกครั้ง ทุกคน" ด้วย Postgres 42703
-- (column does not exist) — Core Awakening / Twin birth ใช้งานไม่ได้เลย
-- ในโค้ดปัจจุบัน จนกว่าจะเพิ่มคอลัมน์เหล่านี้ (ดู Deliverable 4 ในรายงาน)
--
-- src/context/TwinContext.tsx:148,177,318 และ src/context/AIContext.tsx:66-70
-- ก็อ่าน twins.awakened_at ทุกครั้งที่ hydrate Twin (AIContext เลือกคอลัมน์
-- แบบเจาะจง 'id, name, awakened_at' — ถ้าคอลัมน์นี้ไม่มี PostgREST จะ 400
-- ทันที ไม่ใช่แค่ได้ค่า null)
-- ---------------------------------------------------------------------------
DO $guard$ BEGIN
  EXECUTE $sp$ALTER TABLE public.twins
  ADD COLUMN IF NOT EXISTS primary_archetype TEXT,
  ADD COLUMN IF NOT EXISTS secondary_archetype TEXT,
  ADD COLUMN IF NOT EXISTS maturity_score INTEGER DEFAULT 30
    CHECK (maturity_score >= 0 AND maturity_score <= 100),
  ADD COLUMN IF NOT EXISTS evolution_stage INTEGER DEFAULT 1
    CHECK (evolution_stage >= 1 AND evolution_stage <= 5),
  ADD COLUMN IF NOT EXISTS awakened_at TIMESTAMPTZ DEFAULT NOW()$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;



-- Twin ที่มีอยู่แล้ว (ถ้ามี) ไม่มี awakened_at มาก่อน — backfill จาก created_at
DO $guard$ BEGIN
  EXECUTE $sp$UPDATE public.twins SET awakened_at = created_at WHERE awakened_at IS NULL$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;



-- ---------------------------------------------------------------------------
-- B.2 public.decision_log — DecisionService.ts (LIVE: import โดย
-- TwinChat.tsx และ TwinContext.tsx — เส้นทางบันทึกการตัดสินใจจริงที่ผู้ใช้เห็น)
--
-- src/services/DecisionService.ts:79-90 recordDecision() —
--   INSERT INTO decision_log(twin_id, world, question, options,
--   twin_recommendation, user_choice, context) — ไม่มีคอลัมน์เหล่านี้ใน
--   migration 001_decision_log_autonomy_tracking.sql เลย (มีแต่ hub/mood/
--   decision_text/autonomy_level ฯลฯ ซึ่งเป็นคนละ feature — autonomy
--   tracking ของ /api/autonomy-log) ยิ่งไปกว่านั้น 001 กำหนด
--   hub VARCHAR NOT NULL และ user_id VARCHAR NOT NULL แต่ insert นี้ไม่ส่งทั้งคู่
--   — insert จริงจะพังด้วย NOT NULL violation ซ้อนกับ column-not-exist
--
-- ผลคือ: การบันทึก "การตัดสินใจ" ทุกจุดที่ผ่าน DecisionService.ts
-- (รวม TwinChat.tsx) พังหมด ต้องเพิ่มคอลัมน์ + ผ่อน NOT NULL สองจุดนี้
-- (ผ่อน ไม่ใช่ลบ — ปลอดภัย ไม่กระทบแถวเดิมที่มี hub/user_id อยู่แล้วจาก
-- ระบบ autonomy tracking เดิม)
-- ---------------------------------------------------------------------------
DO $guard$ BEGIN
  EXECUTE $sp$ALTER TABLE public.decision_log
  ADD COLUMN IF NOT EXISTS twin_id UUID REFERENCES public.twins(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS world TEXT,
  ADD COLUMN IF NOT EXISTS question TEXT,
  ADD COLUMN IF NOT EXISTS options JSONB,
  ADD COLUMN IF NOT EXISTS twin_recommendation TEXT,
  ADD COLUMN IF NOT EXISTS user_choice TEXT$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$ALTER TABLE public.decision_log ALTER COLUMN hub DROP NOT NULL$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$ALTER TABLE public.decision_log ALTER COLUMN user_id DROP NOT NULL$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE INDEX IF NOT EXISTS idx_decision_log_twin_id ON public.decision_log(twin_id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;



-- Autofill user_id (VARCHAR — decision_log.user_id คนละ type จากตารางอื่น
-- ที่เป็น UUID, ต้อง cast ::text) จาก twin_id เมื่อ DecisionService.ts ไม่ส่ง
-- user_id มา (เหมือน DECISIONS-USERID-001 แต่คนละตาราง/คนละ column type)


-- ---------------------------------------------------------------------------
-- B.3 selfprint.users_profiles — full_analysis_completed + goals_json/focus_areas
--
-- src/services/database-init.ts:69,101,130-131 (ensureUserProfile,
-- markFullAnalysisCompleted) และ src/services/CoreAwakeningService.ts:69
-- (checkReadyForAwakening) อ่าน/เขียน full_analysis_completed +
-- full_analysis_completed_at บนตารางนี้
--
-- src/services/sice/engines/FutureSelfEngine.ts:115-119 และ
-- src/services/sice/engines/PersonalContextBuilder.ts:76-80 (ทั้งคู่ LIVE —
-- รันเป็นส่วนหนึ่งของ SICE orchestration ทุกครั้ง) อ่าน goals_json, focus_areas
-- จาก selfprint.users_profiles (ไม่ใช่ public.user_profiles!)
--
-- ⚠️ PRODUCTION_DB_CATCHUP_2026-09-01.sql (root, ส่วน USERPROFILES-GOALS-001)
-- เคยรัน ALTER TABLE public.user_profiles ADD COLUMN goals_json/focus_areas
-- มาก่อน — แต่ "public.user_profiles" (เอกพจน์ ไม่มี schema prefix) ไม่มีโค้ด
-- live เส้นไหนอ่านเลยสักจุด (grep ทั้ง src/ ไม่พบ .from('user_profiles') ตรงๆ
-- เลยสักที่) นั่นคือ fix ของ 1 ก.ย. แก้ผิดตาราง — คอลัมน์ที่โค้ดจริงต้องการ
-- อยู่บน selfprint.users_profiles (พหูพจน์ มี schema prefix) ต่างหาก
-- เพิ่มให้ที่ตารางที่ถูกในไฟล์นี้
-- ---------------------------------------------------------------------------
DO $guard$ BEGIN
  EXECUTE $sp$ALTER TABLE selfprint.users_profiles
  ADD COLUMN IF NOT EXISTS full_analysis_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS full_analysis_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS goals_json JSONB,
  ADD COLUMN IF NOT EXISTS focus_areas JSONB$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;



-- ---------------------------------------------------------------------------
-- B.4 personal_contexts (พหูพจน์) — context_data + initialized_at
--
-- src/components/onboarding/AICreationSequence.tsx:96-104 (LIVE: ส่วนหนึ่งของ
-- onboarding flow จริง) INSERT INTO personal_contexts(user_id, context_data,
-- initialized_at) — ตารางนี้จาก migration 028 มีแค่
-- (id, user_id, awakening_essence_id, created_at, updated_at) เท่านั้น
-- insert นี้พังทุกครั้ง (มี try/catch fallback ไป sessionStorage แต่ก็ไม่ได้
-- persist ใน DB จริงตามที่ตั้งใจ)
--
-- หมายเหตุ: นี่คือคอลัมน์ที่ตั้งใจเพิ่มเข้า "personal_contexts" (พหูพจน์)
-- จริง ๆ ไม่ใช่การไปปนกับ "personal_context" (เอกพจน์ จาก migration 010) —
-- ดู Deliverable 2 ในรายงานสำหรับอีก 2 จุดที่โค้ดสะกดชื่อตารางผิด (ควรเป็น
-- เอกพจน์แต่ไปเรียกพหูพจน์) ซึ่งเป็นบั๊กฝั่งโค้ด ไม่ใช่ช่องว่างของ schema
-- ---------------------------------------------------------------------------
DO $guard$ BEGIN
  EXECUTE $sp$ALTER TABLE public.personal_contexts
  ADD COLUMN IF NOT EXISTS context_data JSONB,
  ADD COLUMN IF NOT EXISTS initialized_at TIMESTAMPTZ$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;




-- ============================================================================
-- SECTION C — 028/029 twin_memory conflict (forward-only, ไม่ลบข้อมูล)
-- ============================================================================
-- 028_consolidate_phase_a_schema.sql สร้าง twin_memories (พหูพจน์ ตัวที่โค้ด
-- ใช้จริง) แล้ว DROP TABLE twin_memory (เอกพจน์) ทิ้งท้ายไฟล์ — แต่
-- 029_phase_a_core_schema.sql เรียงหลัง 028 ตามตัวอักษร/ตัวเลข จึงรันทีหลัง
-- และ CREATE TABLE twin_memory (เอกพจน์) กลับขึ้นมาใหม่แบบว่างเปล่า
-- ผลคือปัจจุบันมีทั้งสองตารางอยู่คู่กัน: twin_memories (มีข้อมูลจริง ถูกใช้งาน)
-- และ twin_memory (ว่างเปล่า ไม่มีโค้ดจุดไหนอ่าน/เขียนเลย)
--
-- ตามกฎห้ามทำลายข้อมูล: ไม่ DROP twin_memory ในไฟล์นี้ (ต่อให้ไม่มีโค้ดใช้ก็ตาม
-- เผื่อมีข้อมูลถูกเขียนไว้จากที่อื่นที่ตรวจไม่พบ) แค่ทำให้ RLS ของมันครบถ้วน
-- ถูกต้องเท่ากับตารางข้อมูลผู้ใช้ตัวอื่น ๆ (ดู Section D) และ comment
-- อธิบายสถานะไว้ให้ชัดสำหรับคนอ่านในอนาคต — คำแนะนำจริงคือปรึกษาเจ้าของ
-- โปรเจกต์ว่าจะ DROP TABLE twin_memory ทิ้งเมื่อไหร่ (ดู Deliverable 3)
DO $guard$ BEGIN
  EXECUTE $sp$COMMENT ON TABLE twin_memory IS
  'DUPLICATE-001: ตารางนี้ถูกสร้างซ้ำโดยไม่ตั้งใจจาก race ระหว่าง migration 028 (DROP) กับ 029 (CREATE ใหม่ รันทีหลังตามลำดับตัวเลข) ปัจจุบันไม่มีโค้ด live จุดไหนอ่าน/เขียนตารางนี้เลย — ตัวจริงที่ใช้งานคือ twin_memories (พหูพจน์) ห้ามลบทิ้งจนกว่าจะยืนยันกับเจ้าของโปรเจกต์ว่าไม่มีข้อมูลสำคัญค้างอยู่ (ดู 035_forensic_consolidation_2026-09-03.sql Section C)'$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;



-- ---------------------------------------------------------------------------
-- C.2 *** อีกจุดวิกฤต *** — decision_patterns.twin_id ชี้ FK ผิดตาราง
--
-- 020_create_decision_tables.sql สร้าง decision_patterns ด้วย
--   twin_id UUID NOT NULL REFERENCES auth.users(id)   -- ❌ ผิด ควรเป็น twins(id)
-- ส่วน 030_phase_a_extended_schema.sql พยายามสร้าง decision_patterns ใหม่
-- ด้วย twin_id REFERENCES twins(id) (ถูกต้อง) แต่ใช้ CREATE TABLE IF NOT
-- EXISTS — เพราะ 020 เรียงก่อน 030 ตามตัวเลข (รันก่อน) ตารางจึงถูกสร้างไปแล้ว
-- ด้วยนิยามผิดจาก 020 และคำสั่งของ 030 กลายเป็น no-op เงียบ ๆ
--
-- ผลกระทบจริง: src/services/DecisionLearningService.ts:210-225
-- updateTwinExpertiseFromDecisions() — เรียกจริงจาก DecisionService.ts:216-220
-- (LIVE, dynamic import หลังบันทึกการตัดสินใจสำเร็จ) — upsert
-- {twin_id: <twins.id>, ...} เข้า decision_patterns ทุกครั้งจะชน FK
-- violation เพราะ twins.id แทบไม่มีทางตรงกับ auth.users.id ได้เลย
-- (คนละ UUID กันคนละความหมาย) — "เรียนรู้จาก pattern การตัดสินใจ" ของ Twin
-- จึงพังเงียบ ๆ (error ถูก catch ไว้แค่ log ไม่ throw ขึ้นไป)
--
-- แก้โดยลบ FK เดิมที่ชี้ผิด แล้วเพิ่ม FK ใหม่ชี้ twins(id) ให้ถูกต้อง —
-- ไม่กระทบข้อมูลแถวเดิม (ถ้ามี — ในทางปฏิบัติไม่น่ามีเพราะ insert เดิมพัง
-- อยู่แล้วทุกครั้ง จึงไม่มีแถวไหนผ่านมาได้ตั้งแต่แรก)
-- ---------------------------------------------------------------------------
DO $blk1$
DECLARE
  fk_name text;
BEGIN
  IF to_regclass('public.decision_patterns') IS NOT NULL THEN
    SELECT con.conname INTO fk_name
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_class frel ON frel.oid = con.confrelid
    JOIN pg_namespace fn ON fn.oid = frel.relnamespace
    WHERE rel.relname = 'decision_patterns'
      AND con.contype = 'f'
      AND frel.relname = 'users'
      AND fn.nspname = 'auth'
    LIMIT 1;

    IF fk_name IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.decision_patterns DROP CONSTRAINT %I', fk_name);
      EXECUTE 'ALTER TABLE public.decision_patterns ADD CONSTRAINT decision_patterns_twin_id_fkey FOREIGN KEY (twin_id) REFERENCES public.twins(id) ON DELETE CASCADE';
    END IF;
  END IF;
    EXCEPTION
      WHEN undefined_table OR undefined_object OR undefined_column
        OR undefined_function OR invalid_schema_name THEN
        RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $blk1$;




-- ============================================================================
-- SECTION D — RLS: เปิดครบ + policy set ที่ถูกต้องตามที่โค้ดต้องการ
-- ============================================================================

-- ---------------------------------------------------------------------------
-- D.1 twin_state — ขาด INSERT policy (มีแค่ SELECT+UPDATE จาก 029) ทำให้
-- Operation 6 ใน CoreAwakeningService.ts:489-502 (สร้าง twin_state ตอน
-- Twin เกิด รวม Visual DNA) โดน RLS บล็อกเงียบ ๆ ทุกครั้ง
-- ---------------------------------------------------------------------------
DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "users_insert_own_twin_state" ON twin_state$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "users_insert_own_twin_state" ON twin_state
  FOR INSERT WITH CHECK (auth.uid() = user_id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;



-- ---------------------------------------------------------------------------
-- D.2 twin_personality — ขาด INSERT policy (มีแค่ SELECT)
-- CoreAwakeningService.ts:508-521 Operation 8 โดนบล็อก
-- ---------------------------------------------------------------------------
DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "users_insert_own_twin_personality" ON twin_personality$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "users_insert_own_twin_personality" ON twin_personality
  FOR INSERT WITH CHECK (auth.uid() = user_id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;



-- ---------------------------------------------------------------------------
-- D.3 twin_capabilities — RLS เปิดอยู่แต่ "ไม่มี policy เลยสักอัน" (deny-all
-- โดยปริยาย) CoreAwakeningService.ts:524-532 Operation 9 โดนบล็อกเสมอ
-- ---------------------------------------------------------------------------
DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "users_view_own_twin_capabilities" ON twin_capabilities$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "users_view_own_twin_capabilities" ON twin_capabilities
  FOR SELECT USING (auth.uid() = user_id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "users_insert_own_twin_capabilities" ON twin_capabilities$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "users_insert_own_twin_capabilities" ON twin_capabilities
  FOR INSERT WITH CHECK (auth.uid() = user_id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;



-- ---------------------------------------------------------------------------
-- D.4 twin_memory (เอกพจน์, ดู Section C) — มีแค่ SELECT ปัจจุบันไม่มีโค้ด
-- เขียนตารางนี้ แต่เติม INSERT/UPDATE ให้ครบตามหลัก "ทุกตารางข้อมูลผู้ใช้ต้องมี
-- policy set ที่ถูกต้องสมบูรณ์" เผื่ออนาคตมีจุดเขียนกลับมาใช้งานตารางนี้อีก
-- ---------------------------------------------------------------------------
DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "users_insert_own_twin_memory" ON twin_memory$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "users_insert_own_twin_memory" ON twin_memory
  FOR INSERT WITH CHECK (auth.uid() = user_id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "users_update_own_twin_memory" ON twin_memory$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "users_update_own_twin_memory" ON twin_memory
  FOR UPDATE USING (auth.uid() = user_id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;



-- ---------------------------------------------------------------------------
-- D.5 conversations / messages / conversation_settings / conversation_memory
-- ปัจจุบันไม่มีโค้ด live จุดไหนเรียกตารางกลุ่มนี้เลย (ตรวจแล้วทั้ง src/ —
-- 0 caller) แต่เป็นตารางข้อมูลผู้ใช้ (มี user_id, RLS เปิดอยู่) เติม policy
-- ให้ครบตามหลักการเดียวกับ D.4 — ไม่กระทบอะไรเพราะไม่มีใครเรียกอยู่แล้ว
-- ---------------------------------------------------------------------------
DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "users_insert_own_conversations" ON conversations$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "users_insert_own_conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "users_update_own_conversations" ON conversations$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "users_update_own_conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "users_insert_own_messages" ON messages$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "users_insert_own_messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = user_id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "users_view_own_conversation_settings" ON conversation_settings$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "users_view_own_conversation_settings" ON conversation_settings
  FOR SELECT USING (auth.uid() = user_id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "users_insert_own_conversation_settings" ON conversation_settings$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "users_insert_own_conversation_settings" ON conversation_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "users_update_own_conversation_settings" ON conversation_settings$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "users_update_own_conversation_settings" ON conversation_settings
  FOR UPDATE USING (auth.uid() = user_id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "users_view_own_conversation_memory" ON conversation_memory$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "users_view_own_conversation_memory" ON conversation_memory
  FOR SELECT USING (auth.uid() = user_id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "users_insert_own_conversation_memory" ON conversation_memory$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "users_insert_own_conversation_memory" ON conversation_memory
  FOR INSERT WITH CHECK (auth.uid() = user_id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "users_update_own_conversation_memory" ON conversation_memory$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "users_update_own_conversation_memory" ON conversation_memory
  FOR UPDATE USING (auth.uid() = user_id)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;



-- ---------------------------------------------------------------------------
-- D.6 notification_queue / notification_analytics / notification_schedule /
-- follow_up_schedule — เติม INSERT policy ที่ขาด (โค้ดที่เรียกอยู่ปัจจุบัน
-- เป็น dead code เกือบทั้งหมด ยกเว้น follow_up_schedule ที่ DecisionService.ts
-- (LIVE) insert จริงที่ src/services/DecisionService.ts:364)
-- ---------------------------------------------------------------------------
DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "users_insert_own_notification_queue" ON notification_queue$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "users_insert_own_notification_queue" ON notification_queue
  FOR INSERT WITH CHECK (user_id = auth.uid())$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "users_insert_own_notification_analytics" ON notification_analytics$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "users_insert_own_notification_analytics" ON notification_analytics
  FOR INSERT WITH CHECK (user_id = auth.uid())$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "Users can insert own follow-ups" ON follow_up_schedule$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$CREATE POLICY "Users can insert own follow-ups" ON follow_up_schedule
  FOR INSERT WITH CHECK (
    decision_id IN (
      SELECT id FROM decision_log WHERE user_id = auth.uid()::text
    )
  )$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;



-- ---------------------------------------------------------------------------
-- D.7 world_stats — ยืนยันว่า migration 031 (world_stats_fixes.sql) เพิ่ม
-- INSERT policy ให้แล้วจริง ("Users can insert own world stats") ไม่ต้องแก้ซ้ำ
-- ในไฟล์นี้ — DO block นี้แค่ตรวจสอบเชิงป้องกัน เผื่อ 031 ไม่เคยถูก apply จริง
-- ---------------------------------------------------------------------------
DO $blk2$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'world_stats'
      AND policyname = 'Users can insert own world stats'
  ) THEN
    CREATE POLICY "Users can insert own world stats"
      ON public.world_stats FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
    EXCEPTION
      WHEN undefined_table OR undefined_object OR undefined_column
        OR undefined_function OR invalid_schema_name THEN
        RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $blk2$;



-- ---------------------------------------------------------------------------
-- D.8 แทนที่ทุก USING (true) — เปิดให้ anon/authenticated ทุกคนอ่าน/เขียนได้
-- ทุกแถวโดยไม่ตรวจว่าเป็นเจ้าของ
-- ---------------------------------------------------------------------------

-- 019_daily_briefs.sql:28-31 — "Service role full access" USING(true)
-- WITH CHECK(true) ไม่ได้จำกัด TO service_role เลย แปลว่า anon/authenticated
-- ก็เข้าเงื่อนไขนี้ด้วย (mask ทับ policy อื่นแบบ OR) — service_role ข้าม RLS
-- อยู่แล้วโดย default ไม่จำเป็นต้องมี policy นี้เลย ลบทิ้งอย่างเดียวปลอดภัยกว่า
DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "Service role full access" ON public.daily_briefs$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;



-- 032_twin_learning_profiles.sql:30-34 — "Service can update Twin learning
-- profiles" USING(true) WITH CHECK(true) เช่นกัน ไม่มีโค้ด client ฝั่งไหนเรียก
-- ตารางนี้เลย (ตรวจแล้ว 0 caller ใน src/) — เป็นช่องโหว่ล้วน ๆ ไม่มีประโยชน์
-- ใช้งานจริง ลบทิ้ง
DO $guard$ BEGIN
  EXECUTE $sp$DROP POLICY IF EXISTS "Service can update Twin learning profiles" ON public.twin_learning_profiles$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;



-- migrations/metrics_table.sql (selfprint.performance_metrics) และ
-- migrations/autonomy_signals_table.sql (selfprint.autonomy_signals) — อยู่ใน
-- โฟลเดอร์ migrations/ ที่ config.toml ไม่ได้ scope ให้ CLI apply เลย จึงไม่
-- ยืนยันได้ว่ามีอยู่จริงใน production หรือไม่ (ต่างจาก PRODUCTION_DB_CATCHUP
-- ที่มีหลักฐานในตัวไฟล์ว่าเคยรันจริง) — ใช้ DO block เช็คก่อนว่าตารางมีอยู่
-- จริงหรือไม่ ถ้ามีค่อยแก้ policy ให้ปลอดภัย ถ้าไม่มีก็ข้ามเงียบ ๆ ไม่ error
DO $blk3$
BEGIN
  IF to_regclass('selfprint.performance_metrics') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Service role inserts metrics" ON selfprint.performance_metrics';
    EXECUTE 'CREATE POLICY "Service role inserts metrics" ON selfprint.performance_metrics FOR INSERT TO service_role WITH CHECK (true)';
    EXECUTE 'REVOKE INSERT ON selfprint.performance_metrics FROM anon, authenticated';
  END IF;

  IF to_regclass('selfprint.autonomy_signals') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Service role inserts autonomy signals" ON selfprint.autonomy_signals';
    EXECUTE 'CREATE POLICY "Service role inserts autonomy signals" ON selfprint.autonomy_signals FOR INSERT TO service_role WITH CHECK (true)';
    EXECUTE 'REVOKE INSERT ON selfprint.autonomy_signals FROM anon, authenticated';
  END IF;
    EXCEPTION
      WHEN undefined_table OR undefined_object OR undefined_column
        OR undefined_function OR invalid_schema_name THEN
        RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $blk3$;



-- ---------------------------------------------------------------------------
-- D.9 autonomy_analytics view (001_decision_log_autonomy_tracking.sql:68-84)
-- — GRANT SELECT ให้ anon ตรง ๆ และ view เดิมไม่มี security_invoker จึงรันด้วย
-- สิทธิ์ผู้สร้าง view (definer) ทะลุ RLS ของ decision_log ทั้งหมด ทุกคน (รวม
-- anon) เห็นข้อมูล autonomy ของทุก user ได้
-- ---------------------------------------------------------------------------
DO $guard$ BEGIN
  EXECUTE $sp$ALTER VIEW public.autonomy_analytics SET (security_invoker = on)$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$REVOKE SELECT ON public.autonomy_analytics FROM anon$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;


-- authenticated ยังอ่านได้ แต่ตอนนี้วิ่งผ่าน RLS ของ decision_log ในนามผู้เรียก
-- จริง (security_invoker) จึงเห็นได้แค่แถวของตัวเอง ตรงตาม policy ของ decision_log

-- ---------------------------------------------------------------------------
-- D.10 auth_rate_limits (017_auth_rate_limits.sql:31) — DISABLE ROW LEVEL
-- SECURITY ทั้งตาราง แปลว่า anon/authenticated (ถ้ามี GRANT ใด ๆ ไปถึง) อ่าน/
-- เขียนได้ไม่มีการกรองเลย ถูกต้องคือ "เปิด RLS แต่ไม่มี policy เลย" (deny-all
-- สำหรับ anon/authenticated) แล้วให้เฉพาะ service_role ที่ bypass RLS
-- โดยธรรมชาติเป็นคนจัดการ ตามที่ comment เดิมในไฟล์ตั้งใจไว้อยู่แล้ว
-- ("service role only")
-- ---------------------------------------------------------------------------
DO $guard$ BEGIN
  EXECUTE $sp$ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;

DO $guard$ BEGIN
  EXECUTE $sp$REVOKE ALL ON public.auth_rate_limits FROM anon, authenticated$sp$;
EXCEPTION
  WHEN undefined_table OR undefined_object OR undefined_column
    OR undefined_function OR invalid_schema_name THEN
    RAISE NOTICE '[035][ข้าม] %', SQLERRM;
END $guard$;




-- ============================================================================
-- SECTION E — VERIFICATION
-- ============================================================================
-- รันทีละ block แล้วเทียบผลกับ comment ที่บอกไว้ว่า "ควรได้อะไร"

-- E.1 ตารางใหม่ทั้งหมดใน Section A ต้องมีครบ 4 แถว
-- คาดหวัง: 4 แถว (unlocked_badges, user_passkeys, sice_feedback, decisions)
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('unlocked_badges', 'user_passkeys', 'sice_feedback', 'decisions')
ORDER BY table_name;



-- E.2 คอลัมน์วิกฤตบน twins ต้องมีครบ 5 คอลัมน์
-- คาดหวัง: 5 แถว (primary_archetype, secondary_archetype, maturity_score,
-- evolution_stage, awakened_at)
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'twins'
  AND column_name IN (
    'primary_archetype', 'secondary_archetype', 'maturity_score',
    'evolution_stage', 'awakened_at'
  )
ORDER BY column_name;



-- E.3 decision_log ต้องมีคอลัมน์ใหม่ครบ 6 คอลัมน์ + hub/user_id เป็น nullable
-- คาดหวัง: 6 แถวคอลัมน์ใหม่ + is_nullable = 'YES' สำหรับ hub และ user_id
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'decision_log'
  AND column_name IN (
    'twin_id', 'world', 'question', 'options', 'twin_recommendation',
    'user_choice', 'hub', 'user_id'
  )
ORDER BY column_name;



-- E.4 selfprint.users_profiles ต้องมีคอลัมน์ใหม่ครบ 4 คอลัมน์
-- คาดหวัง: 4 แถว
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'selfprint' AND table_name = 'users_profiles'
  AND column_name IN (
    'full_analysis_completed', 'full_analysis_completed_at',
    'goals_json', 'focus_areas'
  )
ORDER BY column_name;



-- E.5 RLS enabled สำหรับทุกตารางที่แตะในไฟล์นี้
-- คาดหวัง: rowsecurity = true ทุกแถว
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE (schemaname = 'public' AND tablename IN (
    'unlocked_badges', 'user_passkeys', 'sice_feedback', 'decisions',
    'twin_state', 'twin_personality', 'twin_capabilities', 'twin_memory',
    'conversations', 'messages', 'conversation_settings', 'conversation_memory',
    'notification_queue', 'notification_analytics', 'follow_up_schedule',
    'auth_rate_limits', 'decision_log'
  ))
  OR (schemaname = 'selfprint' AND tablename = 'users_profiles')
ORDER BY schemaname, tablename;



-- E.6 จำนวน policy ต่อตารางที่แก้ใน Section D — ต้อง >= 2 ทุกตัว (SELECT+เขียน
-- อย่างน้อย 1 อย่าง) ยกเว้น auth_rate_limits ที่ตั้งใจให้ = 0 (deny-all สำหรับ
-- anon/authenticated โดยตั้งใจ)
-- คาดหวัง: twin_state/twin_personality/twin_capabilities/twin_memory >= 2,
-- auth_rate_limits = 0
SELECT tablename, COUNT(*) AS policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'twin_state', 'twin_personality', 'twin_capabilities', 'twin_memory',
    'conversations', 'messages', 'conversation_settings', 'conversation_memory',
    'auth_rate_limits', 'decisions'
  )
GROUP BY tablename
ORDER BY tablename;



-- E.7 ต้องไม่มี policy ไหนเหลือ USING(true) แบบเปิดโล่งอีกแล้ว (ยกเว้นที่ scope
-- ไปที่ TO service_role โดยเจตนา)
-- คาดหวัง: 0 แถว (หรือมีแต่ roles = '{service_role}')
SELECT schemaname, tablename, policyname, roles, qual
FROM pg_policies
WHERE qual = 'true' AND NOT ('service_role' = ANY(roles));



-- E.8 autonomy_analytics ต้อง security_invoker = on และ anon ต้องไม่มีสิทธิ์ SELECT
-- คาดหวัง: reloptions มี 'security_invoker=on'; has_table_privilege คืน false
SELECT c.relname, c.reloptions
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'autonomy_analytics';



SELECT CASE WHEN to_regclass('public.autonomy_analytics') IS NULL THEN NULL
            ELSE has_table_privilege('anon','public.autonomy_analytics','SELECT')
       END AS anon_can_select;



-- E.9 decision_patterns.twin_id ต้องชี้ไปที่ public.twins ไม่ใช่ auth.users
-- คาดหวัง: 1 แถว, foreign_table_name = 'twins', foreign_table_schema = 'public'
SELECT
  tc.constraint_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_schema = 'public' AND tc.table_name = 'decision_patterns'
  AND tc.constraint_type = 'FOREIGN KEY';



-- Success
SELECT '035_forensic_consolidation_2026-09-03 complete ✅' AS status;
