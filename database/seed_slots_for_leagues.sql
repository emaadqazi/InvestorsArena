-- ============================================
-- SEED SLOTS FOR YOUR LEAGUES
-- ============================================
-- This script helps you add the default slot configuration
-- to all your existing leagues

-- ============================================
-- STEP 1: Check if league_slots table exists and is empty
-- ============================================
SELECT
  'league_slots table exists: ' || EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'league_slots'
  ) as table_status;

SELECT
  'Current slot count: ' || COUNT(*) as slot_count
FROM league_slots;

-- ============================================
-- STEP 2: View all your leagues
-- ============================================
SELECT
  id as league_id,
  name as league_name,
  created_at,
  (SELECT COUNT(*) FROM league_members WHERE league_id = leagues.id) as member_count,
  (SELECT COUNT(*) FROM league_slots WHERE league_id = leagues.id) as slot_count
FROM leagues
ORDER BY created_at DESC;

-- ============================================
-- STEP 3: Add default slots to ALL leagues
-- ============================================
-- This will add the 4-3-3-1 slot formation to every league
DO $$
DECLARE
  league_record RECORD;
  slot_count INTEGER;
BEGIN
  FOR league_record IN SELECT id, name FROM leagues LOOP
    -- Check if league already has slots
    SELECT COUNT(*) INTO slot_count
    FROM league_slots
    WHERE league_id = league_record.id;

    IF slot_count = 0 THEN
      -- Add default slots
      PERFORM add_default_slots_to_league(league_record.id);
      RAISE NOTICE 'Added slots to league: % (ID: %)', league_record.name, league_record.id;
    ELSE
      RAISE NOTICE 'League already has % slots: % (ID: %)', slot_count, league_record.name, league_record.id;
    END IF;
  END LOOP;
END $$;

-- ============================================
-- STEP 4: Verify slots were created
-- ============================================
SELECT
  l.name as league_name,
  ls.slot_name,
  ls.constraint_type,
  ls.constraint_value,
  ls.max_count,
  ls.display_order
FROM league_slots ls
JOIN leagues l ON ls.league_id = l.id
ORDER BY l.name, ls.display_order;

-- ============================================
-- STEP 5: Summary
-- ============================================
SELECT
  l.id as league_id,
  l.name as league_name,
  COUNT(ls.id) as total_slots,
  SUM(CASE WHEN ls.constraint_type = 'market_cap' AND ls.constraint_value = 'Large-Cap' THEN 1 ELSE 0 END) as large_cap_slots,
  SUM(CASE WHEN ls.constraint_type = 'market_cap' AND ls.constraint_value = 'Mid-Cap' THEN 1 ELSE 0 END) as mid_cap_slots,
  SUM(CASE WHEN ls.constraint_type = 'market_cap' AND ls.constraint_value = 'Small-Cap' THEN 1 ELSE 0 END) as small_cap_slots,
  SUM(CASE WHEN ls.constraint_type = 'wildcard' THEN 1 ELSE 0 END) as wildcard_slots
FROM leagues l
LEFT JOIN league_slots ls ON l.id = ls.league_id
GROUP BY l.id, l.name
ORDER BY l.name;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
DECLARE
  total_leagues INTEGER;
  total_slots INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_leagues FROM leagues;
  SELECT COUNT(*) INTO total_slots FROM league_slots;

  RAISE NOTICE '✅ Slot seeding complete!';
  RAISE NOTICE '📊 Total leagues: %', total_leagues;
  RAISE NOTICE '🎯 Total slots created: %', total_slots;
  RAISE NOTICE '💡 Each league should have 11 slots (4 Large-Cap + 3 Mid-Cap + 3 Small-Cap + 1 Wildcard)';
END $$;

SELECT
  'SUCCESS! 🎉' as status,
  'Slots have been added to all leagues' as message,
  COUNT(DISTINCT league_id) as leagues_with_slots,
  COUNT(*) as total_slots_created
FROM league_slots;
