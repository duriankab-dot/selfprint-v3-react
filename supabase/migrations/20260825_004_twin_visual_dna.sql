-- Phase A: Twin Visual DNA Persistence
-- Created: 2026-08-25
-- Purpose: Store and retrieve Visual DNA per Twin for consistent visual representation across worlds

BEGIN TRANSACTION;

-- ============================================================================
-- TABLE: twin_visual_dna
-- Stores the generated visual DNA (visual characteristics) for each Twin
-- Generated at Twin birth time, persisted for consistent rendering
-- ============================================================================
CREATE TABLE IF NOT EXISTS twin_visual_dna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id UUID NOT NULL UNIQUE REFERENCES twins(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Core visual attributes (persisted from birth)
  color_primary VARCHAR(7) NOT NULL, -- Hex color for primary theme
  color_secondary VARCHAR(7) NOT NULL, -- Hex color for secondary accent
  color_accent VARCHAR(7) NOT NULL, -- Hex color for highlights/accents

  -- Visual style
  visual_style TEXT NOT NULL CHECK (visual_style IN ('ethereal', 'grounded', 'vibrant', 'subtle')),

  -- Visual accessories / adornments (JSON array)
  accessories JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Expression baseline
  base_expression TEXT NOT NULL DEFAULT 'serene' CHECK (base_expression IN ('serene', 'curious', 'contemplative', 'bright')),

  -- Visual metadata (animation preference, particle effects, etc.)
  visual_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Timestamp
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_twin_visual_dna_twin_id ON twin_visual_dna(twin_id);
CREATE INDEX IF NOT EXISTS idx_twin_visual_dna_user_id ON twin_visual_dna(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE twin_visual_dna ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_visual_dna" ON twin_visual_dna
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_update_own_visual_dna" ON twin_visual_dna
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE twin_visual_dna IS 'Persisted visual DNA for consistent Twin rendering across all worlds';
COMMENT ON COLUMN twin_visual_dna.color_primary IS 'Primary color (hex) - dominant visual theme';
COMMENT ON COLUMN twin_visual_dna.color_secondary IS 'Secondary color (hex) - supporting visual element';
COMMENT ON COLUMN twin_visual_dna.color_accent IS 'Accent color (hex) - highlights and interactions';
COMMENT ON COLUMN twin_visual_dna.visual_style IS 'Overall visual aesthetic style';
COMMENT ON COLUMN twin_visual_dna.accessories IS 'JSON array of accessory definitions (name, color, position, etc.)';
COMMENT ON COLUMN twin_visual_dna.base_expression IS 'Baseline facial expression for the Twin';
COMMENT ON COLUMN twin_visual_dna.visual_metadata IS 'Additional visual settings (animation speed, particle effects, etc.)';

COMMIT;

SELECT 'Twin Visual DNA persistence layer created ✅' as status;
