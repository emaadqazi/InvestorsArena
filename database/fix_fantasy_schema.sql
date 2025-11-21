-- ============================================
-- FIX FANTASY SCHEMA ISSUES
-- ============================================
-- Run this script to fix the schema mismatches between
-- complete_schema.sql and the Fantasy service requirements

-- ============================================
-- 1. UPDATE LEAGUE_MEMBERS TABLE
-- ============================================
-- Add missing columns that Fantasy service expects
ALTER TABLE league_members
  ADD COLUMN IF NOT EXISTS current_cash DECIMAL DEFAULT 100000,
  ADD COLUMN IF NOT EXISTS portfolio_value DECIMAL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_value DECIMAL DEFAULT 100000;

-- Update existing records to have correct values
-- Set current_cash = current_value for existing members
UPDATE league_members
SET
  current_cash = COALESCE(current_value, 100000),
  portfolio_value = 0,
  total_value = COALESCE(current_value, 100000)
WHERE current_cash IS NULL;

COMMENT ON COLUMN league_members.current_cash IS 'Available cash for stock purchases';
COMMENT ON COLUMN league_members.portfolio_value IS 'Current value of stock holdings';
COMMENT ON COLUMN league_members.total_value IS 'Total portfolio value (cash + holdings)';

-- ============================================
-- 2. FIX PORTFOLIO_HOLDINGS TABLE REFERENCE
-- ============================================
-- Drop the old table if it exists with wrong reference
DROP TABLE IF EXISTS portfolio_holdings CASCADE;

-- Recreate with correct reference to users table
CREATE TABLE portfolio_holdings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  slot_name TEXT,
  quantity DECIMAL NOT NULL DEFAULT 0,
  purchase_price DECIMAL(12, 2) NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_user_league_stock_slot UNIQUE(user_id, league_id, stock_id, slot_name)
);

CREATE INDEX idx_portfolio_holdings_user_league ON portfolio_holdings(user_id, league_id);
CREATE INDEX idx_portfolio_holdings_stock ON portfolio_holdings(stock_id);
CREATE INDEX idx_portfolio_holdings_slot ON portfolio_holdings(user_id, league_id, slot_name) WHERE slot_name IS NOT NULL;

COMMENT ON TABLE portfolio_holdings IS 'Tracks stock holdings in slot-based fantasy portfolios';

-- Enable RLS
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS dev_all_access_portfolio_holdings ON portfolio_holdings;

-- Create permissive policy for development
CREATE POLICY dev_all_access_portfolio_holdings ON portfolio_holdings
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 3. ENSURE STOCKS TABLE HAS REQUIRED COLUMNS
-- ============================================
ALTER TABLE stocks
  ADD COLUMN IF NOT EXISTS symbol TEXT,
  ADD COLUMN IF NOT EXISTS current_price DECIMAL(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_change DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS daily_change_percent DECIMAL(8, 4);

-- If ticker exists but symbol doesn't, copy ticker to symbol
UPDATE stocks
SET symbol = ticker
WHERE symbol IS NULL AND ticker IS NOT NULL;

-- Make symbol unique if not already
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'stocks_symbol_key'
  ) THEN
    ALTER TABLE stocks ADD CONSTRAINT stocks_symbol_key UNIQUE (symbol);
  END IF;
END $$;

COMMENT ON COLUMN stocks.symbol IS 'Stock ticker symbol (e.g., AAPL, GOOGL)';
COMMENT ON COLUMN stocks.current_price IS 'Current market price of the stock';
COMMENT ON COLUMN stocks.daily_change IS 'Daily price change in dollars';
COMMENT ON COLUMN stocks.daily_change_percent IS 'Daily price change percentage';

-- ============================================
-- 4. UPDATE LEAGUE_SLOTS IF NEEDED
-- ============================================
-- Ensure league_slots table has RLS enabled
ALTER TABLE league_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS dev_all_access_league_slots ON league_slots;
CREATE POLICY dev_all_access_league_slots ON league_slots
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 5. UPDATE TRIGGER FOR PORTFOLIO_HOLDINGS
-- ============================================
DROP TRIGGER IF EXISTS update_portfolio_holdings_updated_at ON portfolio_holdings;
CREATE TRIGGER update_portfolio_holdings_updated_at
    BEFORE UPDATE ON portfolio_holdings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. CREATE FUNCTION TO SYNC LEAGUE MEMBER VALUES
-- ============================================
CREATE OR REPLACE FUNCTION sync_league_member_portfolio_values()
RETURNS TRIGGER AS $$
DECLARE
  v_holdings_value DECIMAL;
  v_cash DECIMAL;
BEGIN
  -- Calculate total holdings value for this user in this league
  SELECT COALESCE(SUM(ph.quantity * s.current_price), 0)
  INTO v_holdings_value
  FROM portfolio_holdings ph
  JOIN stocks s ON ph.stock_id = s.id
  WHERE ph.user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND ph.league_id = COALESCE(NEW.league_id, OLD.league_id)
    AND ph.quantity > 0;

  -- Get current cash
  SELECT current_cash INTO v_cash
  FROM league_members
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND league_id = COALESCE(NEW.league_id, OLD.league_id);

  -- Update league_members
  UPDATE league_members
  SET
    portfolio_value = v_holdings_value,
    total_value = v_cash + v_holdings_value,
    current_value = v_cash + v_holdings_value
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND league_id = COALESCE(NEW.league_id, OLD.league_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to sync portfolio values
DROP TRIGGER IF EXISTS sync_portfolio_values_on_holdings_change ON portfolio_holdings;
CREATE TRIGGER sync_portfolio_values_on_holdings_change
  AFTER INSERT OR UPDATE OR DELETE ON portfolio_holdings
  FOR EACH ROW
  EXECUTE FUNCTION sync_league_member_portfolio_values();

-- ============================================
-- 7. INITIALIZE EXISTING LEAGUE MEMBERS
-- ============================================
-- For any existing league members, set their initial cash from league settings
UPDATE league_members lm
SET
  current_cash = l.starting_cash,
  total_value = l.starting_cash,
  portfolio_value = 0
FROM leagues l
WHERE lm.league_id = l.id
  AND (lm.current_cash IS NULL OR lm.current_cash = 0);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Fantasy schema fixes applied successfully!';
    RAISE NOTICE '📊 league_members table updated with cash/portfolio columns';
    RAISE NOTICE '📦 portfolio_holdings table recreated with correct references';
    RAISE NOTICE '📈 stocks table enriched with price data columns';
    RAISE NOTICE '🔄 Auto-sync triggers created for portfolio values';
END $$;

SELECT
  'SUCCESS! 🎉' as status,
  'Fantasy schema is now compatible' as message;
