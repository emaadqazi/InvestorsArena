-- ============================================
-- COMPLETE FANTASY PORTFOLIO SETUP
-- ============================================
-- Run this entire file in Supabase SQL Editor
-- This creates all necessary tables and functions

-- ============================================
-- STEP 1: Create portfolio_holdings table
-- ============================================
CREATE TABLE IF NOT EXISTS portfolio_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  slot_name TEXT NOT NULL,
  quantity DECIMAL NOT NULL DEFAULT 0,
  purchase_price DECIMAL NOT NULL DEFAULT 0,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id, league_id, stock_id, slot_name)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_user ON portfolio_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_league ON portfolio_holdings(league_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_slot ON portfolio_holdings(slot_name);

-- ============================================
-- STEP 2: Drop existing functions to avoid conflicts
-- ============================================
DROP FUNCTION IF EXISTS add_stock_to_portfolio(uuid, uuid, uuid, text, decimal);
DROP FUNCTION IF EXISTS add_stock_to_portfolio(uuid, uuid, uuid, text, integer);
DROP FUNCTION IF EXISTS remove_stock_from_portfolio(uuid, uuid, uuid);
DROP FUNCTION IF EXISTS get_available_slots(uuid, uuid);

-- ============================================
-- STEP 3: Create add_stock_to_portfolio function
-- ============================================
CREATE OR REPLACE FUNCTION add_stock_to_portfolio(
    p_league_id UUID,
    p_user_id UUID,
    p_stock_id UUID,
    p_slot_name TEXT,
    p_quantity INTEGER
)
RETURNS JSON AS $$
DECLARE
    v_league_member RECORD;
    v_slot_record RECORD;
    v_stock_record RECORD;
    v_current_slot_count INTEGER;
    v_stock_price DECIMAL;
    v_total_cost DECIMAL;
    v_existing_holding_id UUID;
BEGIN
    -- 1. Check if user is a member of the league
    SELECT * INTO v_league_member
    FROM league_members
    WHERE league_id = p_league_id AND user_id = p_user_id;

    IF v_league_member IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'You are not a member of this league.'
        );
    END IF;

    -- 2. Verify the slot exists for this league
    SELECT * INTO v_slot_record
    FROM league_slots
    WHERE league_id = p_league_id AND slot_name = p_slot_name;

    IF v_slot_record IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Invalid slot name for this league: ' || p_slot_name
        );
    END IF;

    -- 3. Count current holdings in this slot
    SELECT COUNT(*) INTO v_current_slot_count
    FROM portfolio_holdings
    WHERE user_id = p_user_id
      AND league_id = p_league_id
      AND slot_name = p_slot_name
      AND quantity > 0;

    IF v_current_slot_count >= v_slot_record.max_count THEN
        RETURN json_build_object(
            'success', false,
            'message', 'This slot is already full. Remove a stock first.'
        );
    END IF;

    -- 4. Get stock information
    SELECT * INTO v_stock_record
    FROM stocks
    WHERE id = p_stock_id;

    IF v_stock_record IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Stock not found in database.'
        );
    END IF;

    -- 5. Check market cap constraint (if applicable)
    IF v_slot_record.constraint_type = 'market_cap' THEN
        IF v_stock_record.market_cap_tier IS NULL OR v_stock_record.market_cap_tier != v_slot_record.constraint_value THEN
            RETURN json_build_object(
                'success', false,
                'message', format('Stock must be %s. This stock is %s.', 
                    v_slot_record.constraint_value, 
                    COALESCE(v_stock_record.market_cap_tier, 'unclassified'))
            );
        END IF;
    END IF;

    -- 6. Check sector constraint (if applicable)
    IF v_slot_record.constraint_type = 'sector' THEN
        IF v_stock_record.sector_tag IS NULL OR v_stock_record.sector_tag != v_slot_record.constraint_value THEN
            RETURN json_build_object(
                'success', false,
                'message', format('Stock must be in %s sector. This stock is in %s.', 
                    v_slot_record.constraint_value, 
                    COALESCE(v_stock_record.sector_tag, 'unknown'))
            );
        END IF;
    END IF;

    -- 7. Calculate cost
    v_stock_price := COALESCE(v_stock_record.current_price, 0);
    v_total_cost := v_stock_price * p_quantity;

    -- 8. Check if user has enough cash
    IF v_league_member.current_cash < v_total_cost THEN
        RETURN json_build_object(
            'success', false,
            'message', format('Insufficient funds. Cost: $%.2f, Available: $%.2f', 
                v_total_cost, v_league_member.current_cash)
        );
    END IF;

    -- 9. Check if already holding this stock in this slot
    SELECT id INTO v_existing_holding_id
    FROM portfolio_holdings
    WHERE user_id = p_user_id
      AND league_id = p_league_id
      AND stock_id = p_stock_id
      AND slot_name = p_slot_name;

    IF v_existing_holding_id IS NOT NULL THEN
        -- Update existing holding
        UPDATE portfolio_holdings
        SET quantity = quantity + p_quantity,
            updated_at = NOW()
        WHERE id = v_existing_holding_id;
    ELSE
        -- Insert new holding
        INSERT INTO portfolio_holdings (
            user_id, league_id, stock_id, slot_name, 
            quantity, purchase_price, purchased_at
        ) VALUES (
            p_user_id, p_league_id, p_stock_id, p_slot_name,
            p_quantity, v_stock_price, NOW()
        );
    END IF;

    -- 10. Deduct cash from user
    UPDATE league_members
    SET current_cash = current_cash - v_total_cost,
        portfolio_value = portfolio_value + v_total_cost,
        total_value = current_cash - v_total_cost + portfolio_value + v_total_cost
    WHERE league_id = p_league_id AND user_id = p_user_id;

    -- 11. Return success
    RETURN json_build_object(
        'success', true,
        'message', format('%s added to %s!', v_stock_record.symbol, p_slot_name),
        'data', json_build_object(
            'stock_symbol', v_stock_record.symbol,
            'slot_name', p_slot_name,
            'quantity', p_quantity,
            'cost', v_total_cost,
            'remaining_cash', v_league_member.current_cash - v_total_cost
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Database error: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 4: Create remove_stock_from_portfolio function
-- ============================================
CREATE OR REPLACE FUNCTION remove_stock_from_portfolio(
    p_league_id UUID,
    p_user_id UUID,
    p_stock_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_holding RECORD;
    v_current_price DECIMAL;
    v_refund_amount DECIMAL;
BEGIN
    -- Get the holding
    SELECT * INTO v_holding
    FROM portfolio_holdings
    WHERE league_id = p_league_id
      AND user_id = p_user_id
      AND stock_id = p_stock_id
      AND quantity > 0;

    IF v_holding IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Stock not found in your portfolio.'
        );
    END IF;

    -- Get current stock price for refund
    SELECT current_price INTO v_current_price
    FROM stocks
    WHERE id = p_stock_id;

    v_refund_amount := COALESCE(v_current_price, v_holding.purchase_price) * v_holding.quantity;

    -- Delete the holding
    DELETE FROM portfolio_holdings WHERE id = v_holding.id;

    -- Refund cash
    UPDATE league_members
    SET current_cash = current_cash + v_refund_amount,
        portfolio_value = GREATEST(portfolio_value - v_refund_amount, 0)
    WHERE league_id = p_league_id AND user_id = p_user_id;

    RETURN json_build_object(
        'success', true,
        'message', 'Stock sold successfully!',
        'data', json_build_object(
            'refund_amount', v_refund_amount
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Database error: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 5: Create get_available_slots function
-- ============================================
CREATE OR REPLACE FUNCTION get_available_slots(p_league_id UUID, p_user_id UUID)
RETURNS TABLE (
  id UUID,
  league_id UUID,
  slot_name TEXT,
  max_count INTEGER,
  constraint_type TEXT,
  constraint_value TEXT,
  display_order INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ,
  current_count BIGINT,
  slots_remaining INTEGER,
  is_full BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ls.id,
    ls.league_id,
    ls.slot_name,
    ls.max_count,
    ls.constraint_type,
    ls.constraint_value,
    ls.display_order,
    ls.description,
    ls.created_at,
    COALESCE(COUNT(ph.id), 0)::BIGINT as current_count,
    (ls.max_count - COALESCE(COUNT(ph.id), 0))::INTEGER as slots_remaining,
    (COALESCE(COUNT(ph.id), 0) >= ls.max_count) as is_full
  FROM league_slots ls
  LEFT JOIN portfolio_holdings ph ON ph.league_id = ls.league_id 
    AND ph.slot_name = ls.slot_name 
    AND ph.user_id = p_user_id
    AND ph.quantity > 0
  WHERE ls.league_id = p_league_id
  GROUP BY ls.id, ls.league_id, ls.slot_name, ls.max_count, ls.constraint_type, 
           ls.constraint_value, ls.display_order, ls.description, ls.created_at
  ORDER BY ls.display_order;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DONE!
-- ============================================
-- After running this, you should be able to:
-- 1. Add stocks to portfolio slots
-- 2. Remove stocks from portfolio
-- 3. Get available slots with usage info
