-- ============================================
-- TROUBLESHOOT FANTASY PAGE ISSUES
-- ============================================
-- Run this to diagnose why portfolio slots aren't showing

-- ============================================
-- 1. CHECK IF ALL TABLES EXIST
-- ============================================
SELECT
  table_name,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t.table_name
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM (
  VALUES
    ('users'),
    ('leagues'),
    ('league_members'),
    ('league_slots'),
    ('portfolio_holdings'),
    ('stocks')
) AS t(table_name);

-- ============================================
-- 2. CHECK IF LEAGUE_MEMBERS HAS REQUIRED COLUMNS
-- ============================================
SELECT
  column_name,
  data_type,
  '✅ EXISTS' as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'league_members'
  AND column_name IN ('current_cash', 'portfolio_value', 'total_value')
ORDER BY column_name;

-- If you see less than 3 rows, the fix_fantasy_schema.sql didn't run properly

-- ============================================
-- 3. CHECK YOUR USER
-- ============================================
-- Replace 'YOUR_FIREBASE_UID' with your actual Firebase UID
-- You can find it in your browser console or Firebase Auth
SELECT
  id,
  firebase_uid,
  email,
  display_name,
  '✅ User exists' as status
FROM users
-- WHERE firebase_uid = 'YOUR_FIREBASE_UID'  -- Uncomment and add your UID
LIMIT 5;

-- ============================================
-- 4. CHECK YOUR LEAGUE MEMBERSHIPS
-- ============================================
-- Shows all your league memberships
SELECT
  u.email,
  l.name as league_name,
  lm.current_cash,
  lm.portfolio_value,
  lm.total_value,
  lm.joined_at
FROM league_members lm
JOIN users u ON lm.user_id = u.id
JOIN leagues l ON lm.league_id = l.id
-- WHERE u.firebase_uid = 'YOUR_FIREBASE_UID'  -- Uncomment and add your UID
ORDER BY lm.joined_at DESC;

-- ============================================
-- 5. CHECK IF LEAGUES HAVE SLOTS
-- ============================================
SELECT
  l.id as league_id,
  l.name as league_name,
  COUNT(ls.id) as slot_count,
  CASE
    WHEN COUNT(ls.id) = 0 THEN '❌ NO SLOTS - Run seed_slots_for_leagues.sql'
    WHEN COUNT(ls.id) = 11 THEN '✅ COMPLETE (11 slots)'
    ELSE '⚠️ PARTIAL (' || COUNT(ls.id) || ' slots)'
  END as status
FROM leagues l
LEFT JOIN league_slots ls ON l.id = ls.league_id
GROUP BY l.id, l.name
ORDER BY l.name;

-- ============================================
-- 6. CHECK IF FUNCTIONS EXIST
-- ============================================
SELECT
  proname as function_name,
  '✅ EXISTS' as status
FROM pg_proc
WHERE proname IN (
  'add_default_slots_to_league',
  'add_stock_to_portfolio',
  'get_available_slots',
  'remove_stock_from_portfolio'
)
ORDER BY proname;

-- ============================================
-- 7. TEST THE GET_AVAILABLE_SLOTS FUNCTION
-- ============================================
-- This is what the frontend calls to get slots
-- Replace with your actual user_id and league_id
DO $$
DECLARE
  test_user_id UUID;
  test_league_id UUID;
  result JSON;
BEGIN
  -- Get first user
  SELECT id INTO test_user_id FROM users LIMIT 1;

  -- Get first league
  SELECT id INTO test_league_id FROM leagues LIMIT 1;

  IF test_user_id IS NULL THEN
    RAISE NOTICE '❌ No users found in database';
    RETURN;
  END IF;

  IF test_league_id IS NULL THEN
    RAISE NOTICE '❌ No leagues found in database';
    RETURN;
  END IF;

  RAISE NOTICE 'Testing get_available_slots for user_id: % and league_id: %', test_user_id, test_league_id;

  -- Test the function
  BEGIN
    SELECT get_available_slots(test_league_id, test_user_id) INTO result;
    RAISE NOTICE '✅ Function works! Returned % slots', jsonb_array_length(result::jsonb);
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Function failed: %', SQLERRM;
  END;
END $$;

-- ============================================
-- 8. VIEW DETAILED SLOT INFORMATION
-- ============================================
SELECT
  l.name as league_name,
  ls.slot_name,
  ls.constraint_type,
  ls.constraint_value,
  ls.max_count,
  ls.description,
  COALESCE(
    (SELECT COUNT(*)
     FROM portfolio_holdings ph
     WHERE ph.league_id = ls.league_id
       AND ph.slot_name = ls.slot_name
       AND ph.quantity > 0
    ), 0
  ) as stocks_in_use
FROM league_slots ls
JOIN leagues l ON ls.league_id = l.id
ORDER BY l.name, ls.display_order;

-- ============================================
-- 9. CHECK STOCKS TABLE
-- ============================================
SELECT
  COUNT(*) as total_stocks,
  SUM(CASE WHEN sector_tag IS NOT NULL THEN 1 ELSE 0 END) as stocks_with_sector,
  SUM(CASE WHEN market_cap_tier IS NOT NULL THEN 1 ELSE 0 END) as stocks_with_market_cap,
  SUM(CASE WHEN current_price > 0 THEN 1 ELSE 0 END) as stocks_with_price
FROM stocks;

-- If you see 0 stocks, you need to add stock data

-- ============================================
-- 10. SAMPLE QUERY THAT FRONTEND USES
-- ============================================
-- This simulates what getUserLeagues() does
SELECT
  lm.id,
  lm.league_id,
  lm.user_id,
  lm.current_cash,
  lm.portfolio_value,
  lm.total_value,
  lm.rank,
  lm.joined_at,
  jsonb_build_object(
    'id', l.id,
    'name', l.name,
    'is_public', l.is_public,
    'starting_cash', l.starting_cash,
    'max_stocks_per_portfolio', l.max_stocks_per_portfolio
  ) as league
FROM league_members lm
JOIN leagues l ON lm.league_id = l.id
JOIN users u ON lm.user_id = u.id
-- WHERE u.firebase_uid = 'YOUR_FIREBASE_UID'  -- Uncomment and add your UID
LIMIT 5;

-- ============================================
-- SUMMARY & NEXT STEPS
-- ============================================
DO $$
DECLARE
  user_count INTEGER;
  league_count INTEGER;
  member_count INTEGER;
  slot_count INTEGER;
  stock_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO league_count FROM leagues;
  SELECT COUNT(*) INTO member_count FROM league_members;
  SELECT COUNT(*) INTO slot_count FROM league_slots;
  SELECT COUNT(*) INTO stock_count FROM stocks;

  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '📊 DATABASE SUMMARY';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'Users: %', user_count;
  RAISE NOTICE 'Leagues: %', league_count;
  RAISE NOTICE 'League Members: %', member_count;
  RAISE NOTICE 'Portfolio Slots: %', slot_count;
  RAISE NOTICE 'Stocks: %', stock_count;
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

  IF slot_count = 0 THEN
    RAISE NOTICE '❌ NO SLOTS FOUND!';
    RAISE NOTICE '📝 ACTION: Run seed_slots_for_leagues.sql to create slots';
  ELSIF slot_count < (league_count * 11) THEN
    RAISE NOTICE '⚠️  Some leagues are missing slots';
    RAISE NOTICE '📝 ACTION: Run seed_slots_for_leagues.sql to fill missing slots';
  ELSE
    RAISE NOTICE '✅ All leagues have slots configured';
  END IF;

  IF stock_count = 0 THEN
    RAISE NOTICE '❌ NO STOCKS FOUND!';
    RAISE NOTICE '📝 ACTION: Add stock data to the stocks table';
  ELSE
    RAISE NOTICE '✅ Stock data exists';
  END IF;
END $$;
