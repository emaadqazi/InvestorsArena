-- ============================================
-- ADD MISSING LEAGUE FUNCTIONS
-- ============================================
-- Run this in a new Supabase SQL Editor tab
-- This adds the missing create_league and join_league functions
-- that your code is calling but don't exist in complete_schema.sql

-- ============================================
-- 1. CREATE_LEAGUE FUNCTION
-- ============================================
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

  -- Get firebase_uid from user_id and check if user exists
  SELECT firebase_uid INTO v_firebase_uid
  FROM users
  WHERE id = p_created_by;

  IF NOT FOUND THEN
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

  -- Auto-join creator as first member
  INSERT INTO league_members (league_id, user_id, firebase_uid, current_value)
  VALUES (v_league_id, p_created_by, v_firebase_uid, p_starting_cash)
  RETURNING id INTO v_member_id;

  -- Return success with league details
  RETURN json_build_object(
    'success', true,
    'message', 'League created successfully',
    'league_id', v_league_id,
    'join_code', v_join_code,
    'member_id', v_member_id
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
-- 2. JOIN_LEAGUE FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION join_league(
  p_league_id UUID,
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_league RECORD;
  v_member_count INTEGER;
  v_already_member BOOLEAN;
  v_member_id UUID;
  v_firebase_uid TEXT;
BEGIN
  -- Get firebase_uid from user_id
  SELECT firebase_uid INTO v_firebase_uid
  FROM users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User not found in database'
    );
  END IF;

  -- Check if league exists
  SELECT * INTO v_league FROM leagues WHERE id = p_league_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'League not found'
    );
  END IF;

  -- Check if league is accepting members (upcoming or active)
  IF v_league.status NOT IN ('upcoming', 'active') THEN
    RETURN json_build_object(
      'success', false,
      'message', 'This league is not accepting new members'
    );
  END IF;

  -- Check if user is already a member
  SELECT EXISTS(
    SELECT 1 FROM league_members
    WHERE league_id = p_league_id AND firebase_uid = v_firebase_uid
  ) INTO v_already_member;

  IF v_already_member THEN
    RETURN json_build_object(
      'success', false,
      'message', 'You are already a member of this league'
    );
  END IF;

  -- Check if league is full
  SELECT COUNT(*) INTO v_member_count
  FROM league_members
  WHERE league_id = p_league_id;

  IF v_member_count >= v_league.max_players THEN
    RETURN json_build_object(
      'success', false,
      'message', 'This league is full'
    );
  END IF;

  -- Add user to league
  INSERT INTO league_members (league_id, user_id, firebase_uid, current_value)
  VALUES (p_league_id, p_user_id, v_firebase_uid, v_league.starting_cash)
  RETURNING id INTO v_member_id;

  -- Return success
  RETURN json_build_object(
    'success', true,
    'message', 'Successfully joined league',
    'member_id', v_member_id
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
-- 3. ADD FUNCTION COMMENTS
-- ============================================
COMMENT ON FUNCTION create_league IS 'Creates a new league and automatically adds creator as first member. Returns: { success, message, league_id, join_code, member_id }';
COMMENT ON FUNCTION join_league IS 'Joins a user to a league with validation checks. Returns: { success, message, member_id }';

-- ============================================
-- 4. VERIFY FUNCTIONS WERE CREATED
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Functions added successfully!';
    RAISE NOTICE '📝 create_league() - Creates leagues and auto-joins creator';
    RAISE NOTICE '📝 join_league() - Joins users to leagues with validation';
END $$;

SELECT
  'SUCCESS! 🎉' as status,
  'Functions are ready to use' as message,
  COUNT(*) as functions_created
FROM pg_proc
WHERE proname IN ('create_league', 'join_league');
