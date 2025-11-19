-- ============================================
-- INVESTORS ARENA - LEAGUE SYSTEM DATABASE SCHEMA
-- ============================================

-- ============================================
-- 1. CREATE LEAGUES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  creator_firebase_uid TEXT NOT NULL, -- Firebase UID of the creator
  is_public BOOLEAN DEFAULT false,
  join_code TEXT UNIQUE,
  max_players INTEGER DEFAULT 20 CHECK (max_players >= 2 AND max_players <= 50),
  starting_cash DECIMAL DEFAULT 100000 CHECK (starting_cash >= 10000 AND starting_cash <= 1000000),
  max_stocks_per_portfolio INTEGER DEFAULT 15 CHECK (max_stocks_per_portfolio >= 5 AND max_stocks_per_portfolio <= 50),
  trade_frequency TEXT DEFAULT 'unlimited' CHECK (trade_frequency IN ('unlimited', 'daily', 'weekly')),
  trade_limit INTEGER, -- Only used when trade_frequency is 'daily' or 'weekly'
  duration TEXT DEFAULT 'ongoing' CHECK (duration IN ('ongoing', '1_week', '1_month', '3_months', '6_months', '1_year')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  allow_fractional BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure end_date is after start_date
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR start_date IS NULL OR end_date > start_date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_leagues_creator ON leagues(creator_firebase_uid);
CREATE INDEX IF NOT EXISTS idx_leagues_status ON leagues(status);
CREATE INDEX IF NOT EXISTS idx_leagues_is_public ON leagues(is_public);
CREATE INDEX IF NOT EXISTS idx_leagues_join_code ON leagues(join_code);

-- ============================================
-- 2. CREATE LEAGUE MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS league_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  firebase_uid TEXT NOT NULL, -- Firebase UID of the member
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  current_value DECIMAL DEFAULT 0,
  rank INTEGER,
  total_trades INTEGER DEFAULT 0,

  -- Ensure a user can only join a league once
  UNIQUE(league_id, firebase_uid)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_league_members_league_id ON league_members(league_id);
CREATE INDEX IF NOT EXISTS idx_league_members_firebase_uid ON league_members(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_league_members_rank ON league_members(league_id, rank);

-- ============================================
-- 3. CREATE FUNCTION TO AUTO-UPDATE updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for leagues table
DROP TRIGGER IF EXISTS update_leagues_updated_at ON leagues;
CREATE TRIGGER update_leagues_updated_at
    BEFORE UPDATE ON leagues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. CREATE FUNCTION TO GENERATE UNIQUE JOIN CODES
-- ============================================
CREATE OR REPLACE FUNCTION generate_unique_join_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate a random 8-character alphanumeric code (excluding ambiguous characters)
        new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));

        -- Replace potentially confusing characters
        new_code := replace(new_code, '0', 'X');
        new_code := replace(new_code, 'O', 'Y');
        new_code := replace(new_code, 'I', 'Z');
        new_code := replace(new_code, 'L', 'W');

        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM leagues WHERE join_code = new_code) INTO code_exists;

        EXIT WHEN NOT code_exists;
    END LOOP;

    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. CREATE FUNCTION TO AUTO-GENERATE JOIN CODE FOR PRIVATE LEAGUES
-- ============================================
CREATE OR REPLACE FUNCTION set_join_code_for_private_leagues()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate join code for private leagues that don't have one
    IF NEW.is_public = false AND NEW.join_code IS NULL THEN
        NEW.join_code := generate_unique_join_code();
    END IF;

    -- Clear join code for public leagues
    IF NEW.is_public = true THEN
        NEW.join_code := NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate join codes
DROP TRIGGER IF EXISTS generate_join_code_trigger ON leagues;
CREATE TRIGGER generate_join_code_trigger
    BEFORE INSERT OR UPDATE ON leagues
    FOR EACH ROW
    EXECUTE FUNCTION set_join_code_for_private_leagues();

-- ============================================
-- 6. CREATE FUNCTION TO UPDATE LEAGUE STATUS AUTOMATICALLY
-- ============================================
CREATE OR REPLACE FUNCTION update_league_status()
RETURNS void AS $$
BEGIN
    -- Set leagues to 'active' if start_date has passed
    UPDATE leagues
    SET status = 'active'
    WHERE status = 'upcoming'
    AND start_date IS NOT NULL
    AND start_date <= NOW();

    -- Set leagues to 'completed' if end_date has passed
    UPDATE leagues
    SET status = 'completed'
    WHERE status = 'active'
    AND end_date IS NOT NULL
    AND end_date <= NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on both tables
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public leagues are viewable by everyone" ON leagues;
DROP POLICY IF EXISTS "Users can view leagues they are members of" ON leagues;
DROP POLICY IF EXISTS "Users can create leagues" ON leagues;
DROP POLICY IF EXISTS "League creators can update their leagues" ON leagues;
DROP POLICY IF EXISTS "League creators can delete their leagues" ON leagues;
DROP POLICY IF EXISTS "Users can view league members" ON league_members;
DROP POLICY IF EXISTS "Users can join leagues" ON league_members;
DROP POLICY IF EXISTS "Users can leave leagues" ON league_members;
DROP POLICY IF EXISTS "League creators can remove members" ON league_members;

-- LEAGUES TABLE POLICIES

-- Anyone can view public leagues
CREATE POLICY "Public leagues are viewable by everyone"
ON leagues FOR SELECT
USING (is_public = true);

-- Users can view private leagues they are members of
CREATE POLICY "Users can view leagues they are members of"
ON leagues FOR SELECT
USING (
  is_public = false
  AND (
    creator_firebase_uid = current_setting('app.current_user_uid', true)
    OR EXISTS (
      SELECT 1 FROM league_members
      WHERE league_id = leagues.id
      AND firebase_uid = current_setting('app.current_user_uid', true)
    )
  )
);

-- Any authenticated user can create a league
CREATE POLICY "Users can create leagues"
ON leagues FOR INSERT
WITH CHECK (creator_firebase_uid = current_setting('app.current_user_uid', true));

-- League creators can update their own leagues (before they start)
CREATE POLICY "League creators can update their leagues"
ON leagues FOR UPDATE
USING (
  creator_firebase_uid = current_setting('app.current_user_uid', true)
  AND status = 'upcoming'
);

-- League creators can delete their leagues if they have no members
CREATE POLICY "League creators can delete their leagues"
ON leagues FOR DELETE
USING (
  creator_firebase_uid = current_setting('app.current_user_uid', true)
  AND NOT EXISTS (
    SELECT 1 FROM league_members WHERE league_id = leagues.id
  )
);

-- LEAGUE MEMBERS TABLE POLICIES

-- Users can view members of leagues they are part of
CREATE POLICY "Users can view league members"
ON league_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM leagues
    WHERE id = league_members.league_id
    AND (
      is_public = true
      OR creator_firebase_uid = current_setting('app.current_user_uid', true)
      OR EXISTS (
        SELECT 1 FROM league_members lm2
        WHERE lm2.league_id = leagues.id
        AND lm2.firebase_uid = current_setting('app.current_user_uid', true)
      )
    )
  )
);

-- Users can join leagues (if not full and not already a member)
CREATE POLICY "Users can join leagues"
ON league_members FOR INSERT
WITH CHECK (
  firebase_uid = current_setting('app.current_user_uid', true)
  AND EXISTS (
    SELECT 1 FROM leagues
    WHERE id = league_members.league_id
    AND status IN ('upcoming', 'active')
    AND (
      SELECT COUNT(*) FROM league_members lm2
      WHERE lm2.league_id = leagues.id
    ) < leagues.max_players
  )
);

-- Users can leave leagues they are members of
CREATE POLICY "Users can leave leagues"
ON league_members FOR DELETE
USING (firebase_uid = current_setting('app.current_user_uid', true));

-- League creators can remove members from their leagues
CREATE POLICY "League creators can remove members"
ON league_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM leagues
    WHERE id = league_members.league_id
    AND creator_firebase_uid = current_setting('app.current_user_uid', true)
  )
);

-- ============================================
-- 8. HELPER VIEWS
-- ============================================

-- View to get league stats with member count
CREATE OR REPLACE VIEW league_stats AS
SELECT
  l.id,
  l.name,
  l.description,
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
  COUNT(lm.id) as member_count
FROM leagues l
LEFT JOIN league_members lm ON l.id = lm.league_id
GROUP BY l.id;

-- ============================================
-- 9. SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ============================================

-- Uncomment below to insert sample data for testing

-- INSERT INTO leagues (name, description, creator_firebase_uid, is_public, max_players, starting_cash, status)
-- VALUES
--   ('Global Champions', 'Join the best traders worldwide', 'test_user_1', true, 200, 100000, 'active'),
--   ('Tech Stock Masters', 'Focus on technology stocks only', 'test_user_2', true, 50, 100000, 'active'),
--   ('Wall Street Warriors', 'For serious traders only', 'test_user_3', true, 100, 100000, 'active'),
--   ('Dividend Hunters', 'Long-term dividend investing', 'test_user_4', true, 75, 100000, 'upcoming'),
--   ('Growth Seekers', 'High-growth stocks', 'test_user_5', true, 50, 100000, 'active'),
--   ('Private League Example', 'Invite-only league', 'test_user_1', false, 20, 100000, 'upcoming');

-- ============================================
-- SETUP COMPLETE
-- ============================================

-- To use RLS with Firebase Auth in your application:
-- Before each request, set the current user's Firebase UID:
--
-- await supabase.rpc('set_config', {
--   name: 'app.current_user_uid',
--   value: firebaseUser.uid
-- });
--
-- Or use the helper function below:

CREATE OR REPLACE FUNCTION set_current_user(uid TEXT)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_uid', uid, false);
END;
$$ LANGUAGE plpgsql;

-- Usage in your app:
-- await supabase.rpc('set_current_user', { uid: firebaseUser.uid });

COMMENT ON TABLE leagues IS 'Stores fantasy stock league information';
COMMENT ON TABLE league_members IS 'Stores league membership data';
COMMENT ON FUNCTION generate_unique_join_code() IS 'Generates unique 8-character join codes for private leagues';
COMMENT ON FUNCTION update_league_status() IS 'Updates league status based on start/end dates. Run this periodically via a cron job';
