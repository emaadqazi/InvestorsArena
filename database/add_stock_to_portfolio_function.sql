-- ============================================
-- ADD STOCK TO PORTFOLIO WITH SLOT CONSTRAINTS
-- ============================================
-- This function replaces simple stock trading with slot-based constraint checking

CREATE OR REPLACE FUNCTION add_stock_to_portfolio(
    p_league_id UUID,
    p_user_id UUID,
    p_stock_id UUID,
    p_slot_name TEXT,
    p_quantity DECIMAL
)
RETURNS JSON AS $$
DECLARE
    v_league_member_id UUID;
    v_slot_record RECORD;
    v_stock_record RECORD;
    v_current_slot_count INTEGER;
    v_user_cash DECIMAL;
    v_stock_price DECIMAL;
    v_total_cost DECIMAL;
    v_existing_holding_id UUID;
BEGIN
    -- 1. VALIDATION: Check if user is a member of the league
    SELECT id INTO v_league_member_id
    FROM league_members
    WHERE league_id = p_league_id AND user_id = p_user_id;

    IF v_league_member_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'You are not a member of this league.'
        );
    END IF;

    -- 2. SLOT CHECK: Verify the slot exists for this league
    SELECT * INTO v_slot_record
    FROM league_slots
    WHERE league_id = p_league_id AND slot_name = p_slot_name;

    IF v_slot_record IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Invalid slot name for this league.'
        );
    END IF;

    -- 3. COUNT CHECK: Verify slot isn't full (excluding the current stock if updating)
    SELECT COUNT(*) INTO v_current_slot_count
    FROM portfolio_holdings
    WHERE user_id = p_user_id
      AND league_id = p_league_id
      AND slot_name = p_slot_name
      AND stock_id != p_stock_id
      AND quantity > 0;

    IF v_current_slot_count >= v_slot_record.max_count THEN
        RETURN json_build_object(
            'success', false,
            'message', 'This slot is already full. Remove a stock first or choose a different slot.'
        );
    END IF;

    -- 4. GET STOCK INFORMATION
    SELECT * INTO v_stock_record
    FROM stocks
    WHERE id = p_stock_id;

    IF v_stock_record IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Stock not found.'
        );
    END IF;

    -- 5. CONSTRAINT ENFORCEMENT
    IF v_slot_record.constraint_type = 'sector' THEN
        IF v_stock_record.sector_tag IS NULL OR v_stock_record.sector_tag != v_slot_record.constraint_value THEN
            RETURN json_build_object(
                'success', false,
                'message', format('Stock does not meet the %s criteria. Required sector: %s, Stock sector: %s',
                    p_slot_name, v_slot_record.constraint_value, COALESCE(v_stock_record.sector_tag, 'Unknown'))
            );
        END IF;
    END IF;

    IF v_slot_record.constraint_type = 'market_cap' THEN
        IF v_stock_record.market_cap_tier IS NULL OR v_stock_record.market_cap_tier != v_slot_record.constraint_value THEN
            RETURN json_build_object(
                'success', false,
                'message', format('Stock does not meet the %s criteria. Required tier: %s, Stock tier: %s',
                    p_slot_name, v_slot_record.constraint_value, COALESCE(v_stock_record.market_cap_tier, 'Unknown'))
            );
        END IF;
    END IF;

    -- Wildcard slots have no constraints

    -- 6. FINANCIAL VALIDATION: Check if user has enough cash
    SELECT current_cash INTO v_user_cash
    FROM league_members
    WHERE id = v_league_member_id;

    v_stock_price := v_stock_record.current_price;
    v_total_cost := v_stock_price * p_quantity;

    -- Check if updating existing holding
    SELECT id INTO v_existing_holding_id
    FROM portfolio_holdings
    WHERE user_id = p_user_id
      AND league_id = p_league_id
      AND stock_id = p_stock_id
      AND slot_name = p_slot_name;

    IF v_existing_holding_id IS NULL THEN
        -- New purchase
        IF v_user_cash < v_total_cost THEN
            RETURN json_build_object(
                'success', false,
                'message', format('Insufficient funds. Cost: $%.2f, Available: $%.2f', v_total_cost, v_user_cash)
            );
        END IF;
    ELSE
        -- Updating existing - calculate additional cost
        DECLARE
            v_current_quantity DECIMAL;
            v_quantity_diff DECIMAL;
            v_additional_cost DECIMAL;
        BEGIN
            SELECT quantity INTO v_current_quantity
            FROM portfolio_holdings
            WHERE id = v_existing_holding_id;

            v_quantity_diff := p_quantity - v_current_quantity;
            v_additional_cost := v_stock_price * v_quantity_diff;

            IF v_additional_cost > 0 AND v_user_cash < v_additional_cost THEN
                RETURN json_build_object(
                    'success', false,
                    'message', format('Insufficient funds for additional shares. Cost: $%.2f, Available: $%.2f', v_additional_cost, v_user_cash)
                );
            END IF;

            v_total_cost := v_additional_cost; -- Adjust for deduction
        END;
    END IF;

    -- 7. EXECUTION: Insert or update the holding
    IF v_existing_holding_id IS NULL THEN
        -- Insert new holding
        INSERT INTO portfolio_holdings (
            user_id,
            league_id,
            stock_id,
            slot_name,
            quantity,
            purchase_price,
            purchased_at
        ) VALUES (
            p_user_id,
            p_league_id,
            p_stock_id,
            p_slot_name,
            p_quantity,
            v_stock_price,
            NOW()
        );
    ELSE
        -- Update existing holding
        UPDATE portfolio_holdings
        SET quantity = p_quantity,
            updated_at = NOW()
        WHERE id = v_existing_holding_id;
    END IF;

    -- 8. UPDATE USER CASH
    UPDATE league_members
    SET current_cash = current_cash - v_total_cost
    WHERE id = v_league_member_id;

    -- 9. SUCCESS RETURN
    RETURN json_build_object(
        'success', true,
        'message', 'Stock added to portfolio successfully!',
        'data', json_build_object(
            'stock_symbol', v_stock_record.symbol,
            'slot_name', p_slot_name,
            'quantity', p_quantity,
            'cost', v_total_cost,
            'remaining_cash', v_user_cash - v_total_cost
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', format('Error adding stock to portfolio: %s', SQLERRM)
        );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION add_stock_to_portfolio IS 'Adds a stock to a users portfolio with slot constraint validation';


-- ============================================
-- HELPER FUNCTION: GET AVAILABLE SLOTS
-- ============================================
-- Returns slots for a league with current usage information

CREATE OR REPLACE FUNCTION get_available_slots(
    p_league_id UUID,
    p_user_id UUID
)
RETURNS TABLE (
    slot_name TEXT,
    max_count INTEGER,
    constraint_type TEXT,
    constraint_value TEXT,
    description TEXT,
    display_order INTEGER,
    current_count BIGINT,
    slots_remaining INTEGER,
    is_full BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ls.slot_name,
        ls.max_count,
        ls.constraint_type,
        ls.constraint_value,
        ls.description,
        ls.display_order,
        COALESCE(COUNT(ph.id) FILTER (WHERE ph.quantity > 0), 0) as current_count,
        (ls.max_count - COALESCE(COUNT(ph.id) FILTER (WHERE ph.quantity > 0), 0))::INTEGER as slots_remaining,
        (COALESCE(COUNT(ph.id) FILTER (WHERE ph.quantity > 0), 0) >= ls.max_count) as is_full
    FROM league_slots ls
    LEFT JOIN portfolio_holdings ph ON
        ph.league_id = ls.league_id
        AND ph.slot_name = ls.slot_name
        AND ph.user_id = p_user_id
    WHERE ls.league_id = p_league_id
    GROUP BY ls.slot_name, ls.max_count, ls.constraint_type, ls.constraint_value, ls.description, ls.display_order
    ORDER BY ls.display_order;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_available_slots IS 'Returns all slots for a league with current usage counts for a user';


-- ============================================
-- HELPER FUNCTION: REMOVE STOCK FROM SLOT
-- ============================================

CREATE OR REPLACE FUNCTION remove_stock_from_portfolio(
    p_league_id UUID,
    p_user_id UUID,
    p_stock_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_holding_record RECORD;
    v_refund_amount DECIMAL;
BEGIN
    -- Get the holding
    SELECT * INTO v_holding_record
    FROM portfolio_holdings
    WHERE league_id = p_league_id
      AND user_id = p_user_id
      AND stock_id = p_stock_id
      AND quantity > 0;

    IF v_holding_record IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Stock not found in your portfolio.'
        );
    END IF;

    -- Calculate refund (at current price)
    SELECT current_price * v_holding_record.quantity INTO v_refund_amount
    FROM stocks
    WHERE id = p_stock_id;

    -- Remove the holding
    DELETE FROM portfolio_holdings WHERE id = v_holding_record.id;

    -- Refund cash
    UPDATE league_members
    SET current_cash = current_cash + v_refund_amount
    WHERE league_id = p_league_id AND user_id = p_user_id;

    RETURN json_build_object(
        'success', true,
        'message', 'Stock removed from portfolio successfully!',
        'data', json_build_object(
            'refund_amount', v_refund_amount
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', format('Error removing stock: %s', SQLERRM)
        );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION remove_stock_from_portfolio IS 'Removes a stock from portfolio and refunds cash';
