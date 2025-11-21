-- ============================================
-- LEAGUE SYSTEM - DATABASE FUNCTIONS
-- ============================================
-- Run this in Supabase SQL Editor
-- These functions work with the existing schema documented in database_schema.md

-- ============================================
-- 1. FUNCTION: join_league
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
BEGIN
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
    WHERE league_id = p_league_id AND user_id = p_user_id
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
  INSERT INTO league_members (league_id, user_id, current_value)
  VALUES (p_league_id, p_user_id, v_league.starting_cash)
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
-- 2. FUNCTION: create_league
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

  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_created_by) THEN
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
  INSERT INTO league_members (league_id, user_id, current_value)
  VALUES (v_league_id, p_created_by, p_starting_cash)
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
-- 3. FUNCTION: can_join_league (helper function)
-- ============================================
CREATE OR REPLACE FUNCTION can_join_league(
  p_league_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_league RECORD;
  v_member_count INTEGER;
  v_is_member BOOLEAN;
BEGIN
  -- Get league details
  SELECT * INTO v_league FROM leagues WHERE id = p_league_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Check league status
  IF v_league.status NOT IN ('upcoming', 'active') THEN
    RETURN false;
  END IF;

  -- Check if already a member
  SELECT EXISTS(
    SELECT 1 FROM league_members
    WHERE league_id = p_league_id AND user_id = p_user_id
  ) INTO v_is_member;

  IF v_is_member THEN
    RETURN false;
  END IF;

  -- Check if full
  SELECT COUNT(*) INTO v_member_count
  FROM league_members
  WHERE league_id = p_league_id;

  IF v_member_count >= v_league.max_players THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DOCUMENTATION
-- ============================================
COMMENT ON FUNCTION create_league IS 'Creates a new league and automatically adds creator as first member. Returns: { success, message, league_id, join_code, member_id }';
COMMENT ON FUNCTION join_league IS 'Joins a user to a league with validation checks. Returns: { success, message, member_id }';
COMMENT ON FUNCTION can_join_league IS 'Checks if a user can join a league. Returns: boolean';

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Run this entire file in Supabase SQL Editor to create the missing functions
