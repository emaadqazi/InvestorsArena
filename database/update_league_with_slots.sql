-- ============================================
-- UPDATE CREATE_LEAGUE TO AUTO-SEED SLOTS
-- ============================================
-- Run this after the main schema scripts
-- This updates the create_league function to automatically add default slots

-- Update the create_league function to also seed slots
CREATE OR REPLACE FUNCTION create_league(
  p_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_created_by UUID,
  p_is_public BOOLEAN DEFAULT false,
  p_max_players INTEGER DEFAULT 20,
  p_starting_cash DECIMAL DEFAULT 100000,
  p_max_stocks INTEGER DEFAULT 15,
  p_trade_frequency TEXT DEFAULT 'unlimited',
  p_duration TEXT DEFAULT 'ongoing',
  p_start_date TIMESTAMPTZ DEFAULT NOW(),
  p_allow_fractional BOOLEAN DEFAULT true
)
RETURNS JSON AS $$
DECLARE
  v_league_id UUID;
  v_join_code TEXT;
  v_member_id UUID;
  v_end_date TIMESTAMPTZ;
  v_firebase_uid TEXT;
BEGIN
  -- Validate inputs
  IF p_name IS NULL OR trim(p_name) = '' THEN
    RETURN json_build_object(
      'success', false,
      'message', 'League name is required'
    );
  END IF;

  IF p_created_by IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Creator user ID is required'
    );
  END IF;

  -- Check if user exists and get firebase_uid
  SELECT firebase_uid INTO v_firebase_uid FROM users WHERE id = p_created_by;
  IF v_firebase_uid IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User not found in database'
    );
  END IF;

  -- Calculate end date based on duration
  CASE p_duration
    WHEN '1_week' THEN v_end_date := p_start_date + INTERVAL '1 week';
    WHEN '1_month' THEN v_end_date := p_start_date + INTERVAL '1 month';
    WHEN '3_months' THEN v_end_date := p_start_date + INTERVAL '3 months';
    WHEN '6_months' THEN v_end_date := p_start_date + INTERVAL '6 months';
    WHEN '1_year' THEN v_end_date := p_start_date + INTERVAL '1 year';
    ELSE v_end_date := NULL;
  END CASE;

  -- Create league
  INSERT INTO leagues (
    name,
    description,
    created_by,
    creator_firebase_uid,
    is_public,
    max_players,
    starting_cash,
    max_stocks_per_portfolio,
    trade_frequency,
    duration,
    start_date,
    end_date,
    allow_fractional,
    status
  )
  VALUES (
    trim(p_name),
    p_description,
    p_created_by,
    v_firebase_uid,
    p_is_public,
    p_max_players,
    p_starting_cash,
    p_max_stocks,
    p_trade_frequency,
    p_duration,
    p_start_date,
    v_end_date,
    p_allow_fractional,
    CASE WHEN p_start_date <= NOW() THEN 'active' ELSE 'upcoming' END
  )
  RETURNING id, join_code INTO v_league_id, v_join_code;

  -- Auto-join creator as first member with proper cash balance
  INSERT INTO league_members (league_id, user_id, firebase_uid, current_value, current_cash, portfolio_value, total_value)
  VALUES (v_league_id, p_created_by, v_firebase_uid, p_starting_cash, p_starting_cash, 0, p_starting_cash)
  RETURNING id INTO v_member_id;

  -- ============================================
  -- AUTO-SEED DEFAULT SLOTS (4-3-3-1 Formation)
  -- ============================================
  INSERT INTO league_slots (league_id, slot_name, max_count, constraint_type, constraint_value, display_order, description) VALUES
    (v_league_id, 'Large-Cap Anchor 1', 1, 'market_cap', 'Large-Cap', 1, 'A stable large-cap stock for portfolio foundation'),
    (v_league_id, 'Large-Cap Anchor 2', 1, 'market_cap', 'Large-Cap', 2, 'A stable large-cap stock for portfolio foundation'),
    (v_league_id, 'Large-Cap Anchor 3', 1, 'market_cap', 'Large-Cap', 3, 'A stable large-cap stock for portfolio foundation'),
    (v_league_id, 'Large-Cap Anchor 4', 1, 'market_cap', 'Large-Cap', 4, 'A stable large-cap stock for portfolio foundation'),
    (v_league_id, 'Mid-Cap Growth 1', 1, 'market_cap', 'Mid-Cap', 5, 'A mid-cap stock with growth potential'),
    (v_league_id, 'Mid-Cap Growth 2', 1, 'market_cap', 'Mid-Cap', 6, 'A mid-cap stock with growth potential'),
    (v_league_id, 'Mid-Cap Growth 3', 1, 'market_cap', 'Mid-Cap', 7, 'A mid-cap stock with growth potential'),
    (v_league_id, 'High-Risk Small-Cap 1', 1, 'market_cap', 'Small-Cap', 8, 'A high-risk, high-reward small-cap stock'),
    (v_league_id, 'High-Risk Small-Cap 2', 1, 'market_cap', 'Small-Cap', 9, 'A high-risk, high-reward small-cap stock'),
    (v_league_id, 'High-Risk Small-Cap 3', 1, 'market_cap', 'Small-Cap', 10, 'A high-risk, high-reward small-cap stock'),
    (v_league_id, 'Wildcard Flex', 1, 'wildcard', NULL, 11, 'Any stock of your choice - no restrictions');

  -- Return success with league details
  RETURN json_build_object(
    'success', true,
    'message', 'League created successfully with default slots',
    'league_id', v_league_id,
    'join_code', v_join_code,
    'member_id', v_member_id,
    'slots_created', 11
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Failed to create league: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- UPDATE JOIN_LEAGUE TO INCLUDE CASH COLUMNS
-- ============================================
CREATE OR REPLACE FUNCTION join_league(
  p_league_id UUID,
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_league RECORD;
  v_member_id UUID;
  v_firebase_uid TEXT;
BEGIN
  -- Validate league exists and get details
  SELECT * INTO v_league FROM leagues WHERE id = p_league_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'League not found'
    );
  END IF;

  -- Check league status
  IF v_league.status NOT IN ('upcoming', 'active') THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Cannot join a completed league'
    );
  END IF;

  -- Get firebase_uid for the user
  SELECT firebase_uid INTO v_firebase_uid FROM users WHERE id = p_user_id;
  IF v_firebase_uid IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User not found'
    );
  END IF;

  -- Check if already a member
  IF EXISTS (SELECT 1 FROM league_members WHERE league_id = p_league_id AND user_id = p_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'You are already a member of this league'
    );
  END IF;

  -- Check if league is full
  IF (SELECT COUNT(*) FROM league_members WHERE league_id = p_league_id) >= v_league.max_players THEN
    RETURN json_build_object(
      'success', false,
      'message', 'League is full'
    );
  END IF;

  -- Add member with proper cash columns
  INSERT INTO league_members (
    league_id, 
    user_id, 
    firebase_uid, 
    current_value, 
    current_cash, 
    portfolio_value, 
    total_value
  )
  VALUES (
    p_league_id, 
    p_user_id, 
    v_firebase_uid, 
    v_league.starting_cash, 
    v_league.starting_cash, 
    0, 
    v_league.starting_cash
  )
  RETURNING id INTO v_member_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Successfully joined league',
    'member_id', v_member_id,
    'starting_cash', v_league.starting_cash
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Failed to join league: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ADD MISSING COLUMNS TO LEAGUE_MEMBERS IF NEEDED
-- ============================================
DO $$
BEGIN
  -- Add current_cash column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'league_members' AND column_name = 'current_cash') THEN
    ALTER TABLE league_members ADD COLUMN current_cash DECIMAL DEFAULT 100000;
  END IF;
  
  -- Add portfolio_value column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'league_members' AND column_name = 'portfolio_value') THEN
    ALTER TABLE league_members ADD COLUMN portfolio_value DECIMAL DEFAULT 0;
  END IF;
  
  -- Add total_value column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'league_members' AND column_name = 'total_value') THEN
    ALTER TABLE league_members ADD COLUMN total_value DECIMAL DEFAULT 100000;
  END IF;
END $$;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$ 
BEGIN
    RAISE NOTICE '✅ create_league and join_league functions updated!';
    RAISE NOTICE '📊 New leagues will automatically get 11 default slots (4-3-3-1 formation)';
    RAISE NOTICE '💰 League members will have proper cash balance columns';
END $$;
