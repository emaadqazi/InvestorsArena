-- ============================================
-- FANTASY STOCK LEAGUE: SLOT-BASED PORTFOLIO SYSTEM
-- ============================================

-- 0. DEPENDENCY: CREATE STOCKS TABLE
CREATE TABLE IF NOT EXISTS stocks (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
ticker TEXT NOT NULL UNIQUE,
name TEXT NOT NULL,
updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1. ENRICH STOCKS TABLE
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS sector_tag TEXT;
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS market_cap_tier TEXT;

COMMENT ON COLUMN stocks.sector_tag IS 'Stock sector category';
COMMENT ON COLUMN stocks.market_cap_tier IS 'Market capitalization tier';

-- 2. CREATE LEAGUE_SLOTS TABLE
CREATE TABLE IF NOT EXISTS league_slots (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
slot_name TEXT NOT NULL,
max_count INTEGER NOT NULL DEFAULT 1,
constraint_type TEXT NOT NULL CHECK (constraint_type IN ('sector', 'market_cap', 'wildcard')),
constraint_value TEXT,
display_order INTEGER NOT NULL DEFAULT 0,
description TEXT,
created_at TIMESTAMPTZ DEFAULT NOW(),
CONSTRAINT unique_league_slot UNIQUE(league_id, slot_name)
);

COMMENT ON TABLE league_slots IS 'Defines portfolio slot requirements for each league';

CREATE INDEX IF NOT EXISTS idx_league_slots_league_id ON league_slots(league_id);

-- 3. ADD SLOT_NAME TO PORTFOLIO_HOLDINGS
-- NOTE: This section is now handled by fix_fantasy_schema.sql
-- Run fix_fantasy_schema.sql instead of this section to properly create portfolio_holdings

-- 4. CREATE HELPER VIEW
CREATE OR REPLACE VIEW user_slot_usage AS
SELECT
ph.user_id,
ph.league_id,
ph.slot_name,
COUNT(*) as stocks_in_slot,
ls.max_count,
(ls.max_count - COUNT(*)) as slots_remaining
FROM portfolio_holdings ph
INNER JOIN league_slots ls ON ph.league_id = ls.league_id AND ph.slot_name = ls.slot_name
WHERE ph.quantity > 0
GROUP BY ph.user_id, ph.league_id, ph.slot_name, ls.max_count;

-- 5. SEED DEFAULT SLOT FUNCTION
CREATE OR REPLACE FUNCTION add_default_slots_to_league(p_league_id UUID)
RETURNS VOID AS $$
BEGIN
DELETE FROM league_slots WHERE league_id = p_league_id;
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
END;
$$ LANGUAGE plpgsql;