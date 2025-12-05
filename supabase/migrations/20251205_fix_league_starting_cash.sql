-- Fix: Update create_league function to properly set current_cash from starting_cash
CREATE OR REPLACE FUNCTION public.create_league(
  p_name text, 
  p_created_by uuid, 
  p_description text DEFAULT NULL::text, 
  p_is_public boolean DEFAULT false, 
  p_max_players integer DEFAULT 20, 
  p_starting_cash numeric DEFAULT 100000, 
  p_max_stocks integer DEFAULT 15, 
  p_trade_frequency text DEFAULT 'unlimited'::text, 
  p_duration text DEFAULT 'ongoing'::text, 
  p_start_date timestamp with time zone DEFAULT now(), 
  p_allow_fractional boolean DEFAULT true
)
RETURNS json
LANGUAGE plpgsql
AS $function$
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

  -- Auto-join creator as first member with CORRECT starting cash values
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
    v_league_id, 
    p_created_by, 
    v_firebase_uid, 
    p_starting_cash,  -- current_value = starting cash
    p_starting_cash,  -- current_cash = starting cash (THIS WAS MISSING!)
    0,                -- portfolio_value starts at 0
    p_starting_cash   -- total_value = starting cash
  )
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
$function$;

-- Also fix join_league function to use league's starting_cash
CREATE OR REPLACE FUNCTION public.join_league(p_league_id uuid, p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
AS $function$
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

  -- Add user to league with CORRECT starting cash from league settings
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
    v_league.starting_cash,  -- Use league's starting_cash
    v_league.starting_cash,  -- current_cash = league's starting_cash
    0,                       -- portfolio_value starts at 0
    v_league.starting_cash   -- total_value = starting_cash
  )
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
$function$;

-- Fix existing league members that have wrong current_cash (defaulted to 100000)
-- This updates current_cash to match the league's actual starting_cash
UPDATE league_members lm
SET current_cash = l.starting_cash,
    current_value = l.starting_cash,
    total_value = l.starting_cash
FROM leagues l
WHERE lm.league_id = l.id
  AND lm.portfolio_value = 0  -- Only fix members who haven't made any trades yet
  AND lm.current_cash = 100000  -- Only fix those with the default value
  AND l.starting_cash != 100000;  -- Only where league has different starting cash
