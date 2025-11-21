-- ============================================
-- INVESTORS ARENA - COMPLETE DATABASE SCHEMA
-- ============================================
-- Run this entire script in your Supabase SQL Editor

-- ============================================
-- SAFE CLEANUP (Handles non-existent tables)
-- ============================================

DO $$ 
BEGIN
    -- Drop views first (they depend on tables)
    DROP VIEW IF EXISTS portfolio_summary CASCADE;
    DROP VIEW IF EXISTS user_league_memberships CASCADE;
    DROP VIEW IF EXISTS league_stats CASCADE;
    
    -- Drop tables in reverse dependency order
    DROP TABLE IF EXISTS holdings CASCADE;
    DROP TABLE IF EXISTS transactions CASCADE;
    DROP TABLE IF EXISTS portfolios CASCADE;
    DROP TABLE IF EXISTS league_members CASCADE;
    DROP TABLE IF EXISTS leagues CASCADE;
    -- Keep users table
    
    -- Drop functions
    DROP FUNCTION IF EXISTS initialize_portfolio() CASCADE;
    DROP FUNCTION IF EXISTS update_league_rankings(UUID) CASCADE;
    DROP FUNCTION IF EXISTS can_join_league(UUID, TEXT) CASCADE;
    DROP FUNCTION IF EXISTS update_league_status() CASCADE;
    DROP FUNCTION IF EXISTS set_join_code_for_private_leagues() CASCADE;
    DROP FUNCTION IF EXISTS generate_unique_join_code() CASCADE;
    DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Cleanup completed with warnings (this is normal on first run)';
END $$;

-- ============================================
-- 1. USERS TABLE (Keep existing or create)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);

-- ============================================
-- 2. LEAGUES TABLE (New comprehensive version)
-- ============================================
CREATE TABLE leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  creator_firebase_uid TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  join_code TEXT UNIQUE,
  max_players INTEGER DEFAULT 20 CHECK (max_players >= 2 AND max_players <= 50),
  starting_cash DECIMAL DEFAULT 100000 CHECK (starting_cash >= 10000 AND starting_cash <= 1000000),
  max_stocks_per_portfolio INTEGER DEFAULT 15 CHECK (max_stocks_per_portfolio >= 5 AND max_stocks_per_portfolio <= 50),
  trade_frequency TEXT DEFAULT 'unlimited' CHECK (trade_frequency IN ('unlimited', 'daily', 'weekly')),
  trade_limit INTEGER,
  duration TEXT DEFAULT 'ongoing' CHECK (duration IN ('ongoing', '1_week', '1_month', '3_months', '6_months', '1_year')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  allow_fractional BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR start_date IS NULL OR end_date > start_date)
);

-- Create indexes
CREATE INDEX idx_leagues_created_by ON leagues(created_by);
CREATE INDEX idx_leagues_creator_firebase_uid ON leagues(creator_firebase_uid);
CREATE INDEX idx_leagues_status ON leagues(status);
CREATE INDEX idx_leagues_is_public ON leagues(is_public);
CREATE INDEX idx_leagues_join_code ON leagues(join_code);

-- ============================================
-- 3. LEAGUE MEMBERS TABLE
-- ============================================
CREATE TABLE league_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  firebase_uid TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  current_value DECIMAL DEFAULT 0,
  rank INTEGER,
  total_trades INTEGER DEFAULT 0,
  
  UNIQUE(league_id, firebase_uid)
);

-- Create indexes
CREATE INDEX idx_league_members_league_id ON league_members(league_id);
CREATE INDEX idx_league_members_user_id ON league_members(user_id);
CREATE INDEX idx_league_members_firebase_uid ON league_members(firebase_uid);
CREATE INDEX idx_league_members_rank ON league_members(league_id, rank);

-- ============================================
-- 4. PORTFOLIOS TABLE
-- ============================================
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  league_member_id UUID REFERENCES league_members(id) ON DELETE CASCADE,
  cash_balance DECIMAL DEFAULT 100000,
  total_value DECIMAL DEFAULT 100000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, league_id)
);

-- Create indexes
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_league_id ON portfolios(league_id);
CREATE INDEX idx_portfolios_league_member_id ON portfolios(league_member_id);

-- ============================================
-- 5. TRANSACTIONS TABLE
-- ============================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  stock_symbol TEXT NOT NULL,
  stock_name TEXT,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  quantity DECIMAL NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_transactions_portfolio_id ON transactions(portfolio_id);
CREATE INDEX idx_transactions_stock_symbol ON transactions(stock_symbol);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);

-- ============================================
-- 6. HOLDINGS TABLE
-- ============================================
CREATE TABLE holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  stock_symbol TEXT NOT NULL,
  stock_name TEXT,
  quantity DECIMAL NOT NULL,
  average_price DECIMAL(12, 2) NOT NULL,
  current_price DECIMAL(12, 2),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(portfolio_id, stock_symbol)
);

CREATE INDEX idx_holdings_portfolio_id ON holdings(portfolio_id);
CREATE INDEX idx_holdings_stock_symbol ON holdings(stock_symbol);

-- ============================================
-- 7. AUTO-UPDATE FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leagues_updated_at ON leagues;
CREATE TRIGGER update_leagues_updated_at
    BEFORE UPDATE ON leagues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_portfolios_updated_at ON portfolios;
CREATE TRIGGER update_portfolios_updated_at
    BEFORE UPDATE ON portfolios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_holdings_updated_at ON holdings;
CREATE TRIGGER update_holdings_updated_at
    BEFORE UPDATE ON holdings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. JOIN CODE GENERATION
-- ============================================

CREATE OR REPLACE FUNCTION generate_unique_join_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
    chars TEXT := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    LOOP
        result := '';
        FOR i IN 1..8 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
        END LOOP;
        
        new_code := result;
        SELECT EXISTS(SELECT 1 FROM leagues WHERE join_code = new_code) INTO code_exists;
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_join_code_for_private_leagues()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_public = false AND NEW.join_code IS NULL THEN
        NEW.join_code := generate_unique_join_code();
    END IF;
    
    IF NEW.is_public = true THEN
        NEW.join_code := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_join_code_trigger ON leagues;
CREATE TRIGGER generate_join_code_trigger
    BEFORE INSERT OR UPDATE ON leagues
    FOR EACH ROW
    EXECUTE FUNCTION set_join_code_for_private_leagues();

-- ============================================
-- 9. LEAGUE STATUS MANAGEMENT
-- ============================================

CREATE OR REPLACE FUNCTION update_league_status()
RETURNS void AS $$
BEGIN
    UPDATE leagues
    SET status = 'active'
    WHERE status = 'upcoming'
    AND start_date IS NOT NULL
    AND start_date <= NOW();
    
    UPDATE leagues
    SET status = 'completed'
    WHERE status = 'active'
    AND end_date IS NOT NULL
    AND end_date <= NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. PORTFOLIO INITIALIZATION
-- ============================================

CREATE OR REPLACE FUNCTION initialize_portfolio()
RETURNS TRIGGER AS $$
DECLARE
    league_starting_cash DECIMAL;
BEGIN
    SELECT starting_cash INTO league_starting_cash
    FROM leagues
    WHERE id = NEW.league_id;
    
    INSERT INTO portfolios (user_id, league_id, league_member_id, cash_balance, total_value)
    VALUES (NEW.user_id, NEW.league_id, NEW.id, league_starting_cash, league_starting_cash);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_portfolio_on_join ON league_members;
CREATE TRIGGER create_portfolio_on_join
    AFTER INSERT ON league_members
    FOR EACH ROW
    EXECUTE FUNCTION initialize_portfolio();

-- ============================================
-- 11. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies safely
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('users', 'leagues', 'league_members', 'portfolios', 'transactions', 'holdings')) LOOP
        EXECUTE format('DROP POLICY IF EXISTS dev_all_access_%I ON %I', r.tablename, r.tablename);
    END LOOP;
END $$;

-- Create permissive policies for development
CREATE POLICY "dev_all_access_users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_access_leagues" ON leagues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_access_league_members" ON league_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_access_portfolios" ON portfolios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_access_transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_all_access_holdings" ON holdings FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 12. HELPER VIEWS
-- ============================================

CREATE OR REPLACE VIEW league_stats AS
SELECT
  l.id,
  l.name,
  l.description,
  l.created_by,
  l.creator_firebase_uid,
  l.is_public,
  l.join_code,
  l.max_players,
  l.starting_cash,
  l.max_stocks_per_portfolio,
  l.trade_frequency,
  l.trade_limit,
  l.duration,
  l.start_date,
  l.end_date,
  l.allow_fractional,
  l.status,
  l.created_at,
  l.updated_at,
  COUNT(lm.id) as member_count,
  CASE 
    WHEN COUNT(lm.id) >= l.max_players THEN true 
    ELSE false 
  END as is_full
FROM leagues l
LEFT JOIN league_members lm ON l.id = lm.league_id
GROUP BY l.id;

CREATE OR REPLACE VIEW user_league_memberships AS
SELECT
  lm.id,
  lm.league_id,
  lm.user_id,
  lm.firebase_uid,
  lm.joined_at,
  lm.current_value,
  lm.rank,
  lm.total_trades,
  l.name as league_name,
  l.status as league_status,
  l.is_public,
  p.cash_balance,
  p.total_value as portfolio_value
FROM league_members lm
JOIN leagues l ON lm.league_id = l.id
LEFT JOIN portfolios p ON p.league_member_id = lm.id;

CREATE OR REPLACE VIEW portfolio_summary AS
SELECT
  p.id as portfolio_id,
  p.user_id,
  p.league_id,
  p.cash_balance,
  p.total_value,
  COUNT(h.id) as total_holdings,
  COALESCE(SUM(h.quantity * h.current_price), 0) as holdings_value,
  l.name as league_name,
  l.starting_cash
FROM portfolios p
LEFT JOIN holdings h ON p.id = h.portfolio_id
JOIN leagues l ON p.league_id = l.id
GROUP BY p.id, p.user_id, p.league_id, p.cash_balance, p.total_value, l.name, l.starting_cash;

-- ============================================
-- 13. UTILITY FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION can_join_league(
  p_league_id UUID,
  p_firebase_uid TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  league_full BOOLEAN;
  already_member BOOLEAN;
  league_status TEXT;
BEGIN
  SELECT status INTO league_status FROM leagues WHERE id = p_league_id;
  IF league_status = 'completed' THEN
    RETURN false;
  END IF;
  
  SELECT EXISTS(
    SELECT 1 FROM league_members 
    WHERE league_id = p_league_id AND firebase_uid = p_firebase_uid
  ) INTO already_member;
  
  IF already_member THEN
    RETURN false;
  END IF;
  
  SELECT (COUNT(*) >= max_players) INTO league_full
  FROM league_members lm
  JOIN leagues l ON lm.league_id = l.id
  WHERE l.id = p_league_id
  GROUP BY l.max_players;
  
  RETURN NOT COALESCE(league_full, false);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_league_rankings(p_league_id UUID)
RETURNS void AS $$
BEGIN
  WITH ranked_members AS (
    SELECT 
      lm.id,
      ROW_NUMBER() OVER (ORDER BY p.total_value DESC) as new_rank
    FROM league_members lm
    JOIN portfolios p ON p.league_member_id = lm.id
    WHERE lm.league_id = p_league_id
  )
  UPDATE league_members lm
  SET rank = rm.new_rank,
      current_value = p.total_value
  FROM ranked_members rm
  JOIN portfolios p ON p.league_member_id = lm.id
  WHERE lm.id = rm.id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 14. COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'Stores user profile information';
COMMENT ON TABLE leagues IS 'Stores fantasy stock league configurations';
COMMENT ON TABLE league_members IS 'Tracks league membership and performance';
COMMENT ON TABLE portfolios IS 'Stores user portfolios within leagues';
COMMENT ON TABLE transactions IS 'Records all buy/sell transactions';
COMMENT ON TABLE holdings IS 'Tracks current stock positions in portfolios';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$ 
BEGIN
    RAISE NOTICE '✅ Database schema successfully created!';
    RAISE NOTICE '📊 Tables created: users, leagues, league_members, portfolios, transactions, holdings';
    RAISE NOTICE '👁️ Views created: league_stats, user_league_memberships, portfolio_summary';
    RAISE NOTICE '🔧 All triggers and functions are active';
    RAISE NOTICE '🔓 RLS enabled with permissive policies for development';
END $$;

SELECT 
  'SUCCESS! 🎉' as status,
  'Database schema is ready to use' as message,
  COUNT(*) as tables_created
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'leagues', 'league_members', 'portfolios', 'transactions', 'holdings');