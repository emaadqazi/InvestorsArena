-- ============================================
-- SUPABASE LEAGUE SETUP - RUN IN ORDER
-- ============================================
-- Run each section separately in Supabase SQL Editor

-- ============================================
-- PART 1: Add missing columns to league_members
-- ============================================
ALTER TABLE league_members ADD COLUMN IF NOT EXISTS current_cash DECIMAL DEFAULT 100000;
ALTER TABLE league_members ADD COLUMN IF NOT EXISTS portfolio_value DECIMAL DEFAULT 0;
ALTER TABLE league_members ADD COLUMN IF NOT EXISTS total_value DECIMAL DEFAULT 100000;

-- ============================================
-- PART 2: Create league_slots table if not exists
-- ============================================
CREATE TABLE IF NOT EXISTS league_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  slot_name TEXT NOT NULL,
  max_count INTEGER DEFAULT 1,
  constraint_type TEXT NOT NULL CHECK (constraint_type IN ('market_cap', 'sector', 'wildcard')),
  constraint_value TEXT,
  display_order INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_league_slots_league_id ON league_slots(league_id);

-- ============================================
-- PART 3: DROP existing function first, then recreate
-- ============================================
DROP FUNCTION IF EXISTS get_available_slots(uuid, uuid);

CREATE OR REPLACE FUNCTION get_available_slots(p_league_id UUID, p_user_id UUID)
RETURNS TABLE (
  id UUID,
  league_id UUID,
  slot_name TEXT,
  max_count INTEGER,
  constraint_type TEXT,
  constraint_value TEXT,
  display_order INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ,
  current_count BIGINT,
  slots_remaining INTEGER,
  is_full BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ls.id,
    ls.league_id,
    ls.slot_name,
    ls.max_count,
    ls.constraint_type,
    ls.constraint_value,
    ls.display_order,
    ls.description,
    ls.created_at,
    COALESCE(COUNT(ph.id), 0)::BIGINT as current_count,
    (ls.max_count - COALESCE(COUNT(ph.id), 0))::INTEGER as slots_remaining,
    (COALESCE(COUNT(ph.id), 0) >= ls.max_count) as is_full
  FROM league_slots ls
  LEFT JOIN portfolio_holdings ph ON ph.league_id = ls.league_id 
    AND ph.slot_name = ls.slot_name 
    AND ph.user_id = p_user_id
    AND ph.quantity > 0
  WHERE ls.league_id = p_league_id
  GROUP BY ls.id, ls.league_id, ls.slot_name, ls.max_count, ls.constraint_type, 
           ls.constraint_value, ls.display_order, ls.description, ls.created_at
  ORDER BY ls.display_order;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 4: Function to seed slots for a league
-- ============================================
CREATE OR REPLACE FUNCTION seed_league_slots(p_league_id UUID)
RETURNS JSON AS $$
BEGIN
  -- Check if slots already exist
  IF EXISTS (SELECT 1 FROM league_slots WHERE league_id = p_league_id) THEN
    RETURN json_build_object('success', false, 'message', 'Slots already exist for this league');
  END IF;

  -- Insert default slots (4-3-3-1 formation)
  INSERT INTO league_slots (league_id, slot_name, max_count, constraint_type, constraint_value, display_order, description) VALUES
    (p_league_id, 'Large-Cap Anchor 1', 1, 'market_cap', 'Large-Cap', 1, 'A stable large-cap stock for portfolio foundation'),
    (p_league_id, 'Large-Cap Anchor 2', 1, 'market_cap', 'Large-Cap', 2, 'A stable large-cap stock for portfolio foundation'),
    (p_league_id, 'Large-Cap Anchor 3', 1, 'market_cap', 'Large-Cap', 3, 'A stable large-cap stock for portfolio foundation'),
    (p_league_id, 'Large-Cap Anchor 4', 1, 'market_cap', 'Large-Cap', 4, 'A stable large-cap stock for portfolio foundation'),
    (p_league_id, 'Mid-Cap Growth 1', 1, 'market_cap', 'Mid-Cap', 5, 'A mid-cap stock with growth potential'),
    (p_league_id, 'Mid-Cap Growth 2', 1, 'market_cap', 'Mid-Cap', 6, 'A mid-cap stock with growth potential'),
    (p_league_id, 'Mid-Cap Growth 3', 1, 'market_cap', 'Mid-Cap', 7, 'A mid-cap stock with growth potential'),
    (p_league_id, 'High-Risk Small-Cap 1', 1, 'market_cap', 'Small-Cap', 8, 'A high-risk, high-reward small-cap stock'),
    (p_league_id, 'High-Risk Small-Cap 2', 1, 'market_cap', 'Small-Cap', 9, 'A high-risk, high-reward small-cap stock'),
    (p_league_id, 'High-Risk Small-Cap 3', 1, 'market_cap', 'Small-Cap', 10, 'A high-risk, high-reward small-cap stock'),
    (p_league_id, 'Wildcard Flex', 1, 'wildcard', NULL, 11, 'Any stock of your choice - no restrictions');

  RETURN json_build_object('success', true, 'message', 'Slots created successfully', 'slots_created', 11);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 5: Seed slots for existing leagues
-- ============================================
-- Run this to add slots to any existing leagues that don't have them
DO $$
DECLARE
  league_record RECORD;
BEGIN
  FOR league_record IN SELECT id FROM leagues WHERE id NOT IN (SELECT DISTINCT league_id FROM league_slots)
  LOOP
    PERFORM seed_league_slots(league_record.id);
    RAISE NOTICE 'Seeded slots for league %', league_record.id;
  END LOOP;
END $$;

-- ============================================
-- PART 6: Create stocks table if not exists
-- ============================================
CREATE TABLE IF NOT EXISTS stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  current_price DECIMAL DEFAULT 0,
  daily_change DECIMAL,
  daily_change_percent DECIMAL,
  market_cap_tier TEXT CHECK (market_cap_tier IN ('Large-Cap', 'Mid-Cap', 'Small-Cap')),
  sector_tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster symbol lookups
CREATE INDEX IF NOT EXISTS idx_stocks_symbol ON stocks(symbol);
CREATE INDEX IF NOT EXISTS idx_stocks_market_cap ON stocks(market_cap_tier);

-- ============================================
-- DONE! 
-- ============================================
-- After running this, you should have:
-- 1. league_slots table with proper structure
-- 2. get_available_slots function for fetching slot data
-- 3. seed_league_slots function for manually adding slots
-- 4. All existing leagues should have 11 default slots
