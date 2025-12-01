drop extension if exists "pg_net";


  create table "public"."holdings" (
    "id" uuid not null default gen_random_uuid(),
    "portfolio_id" uuid,
    "stock_symbol" text not null,
    "stock_name" text,
    "quantity" numeric not null,
    "average_price" numeric(12,2) not null,
    "current_price" numeric(12,2),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."holdings" enable row level security;


  create table "public"."league_members" (
    "id" uuid not null default gen_random_uuid(),
    "league_id" uuid not null,
    "user_id" uuid,
    "firebase_uid" text not null,
    "joined_at" timestamp with time zone default now(),
    "current_value" numeric default 0,
    "rank" integer,
    "total_trades" integer default 0,
    "current_cash" numeric default 100000,
    "portfolio_value" numeric default 0,
    "total_value" numeric default 100000
      );


alter table "public"."league_members" enable row level security;


  create table "public"."league_slots" (
    "id" uuid not null default gen_random_uuid(),
    "league_id" uuid not null,
    "slot_name" text not null,
    "max_count" integer not null default 1,
    "constraint_type" text not null,
    "constraint_value" text,
    "display_order" integer not null default 0,
    "description" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."league_slots" enable row level security;


  create table "public"."leagues" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "created_by" uuid,
    "creator_firebase_uid" text not null,
    "is_public" boolean default false,
    "join_code" text,
    "max_players" integer default 20,
    "starting_cash" numeric default 100000,
    "max_stocks_per_portfolio" integer default 15,
    "trade_frequency" text default 'unlimited'::text,
    "trade_limit" integer,
    "duration" text default 'ongoing'::text,
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "allow_fractional" boolean default true,
    "status" text default 'upcoming'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."leagues" enable row level security;


  create table "public"."portfolio_holdings" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "league_id" uuid not null,
    "stock_id" uuid not null,
    "slot_name" text,
    "quantity" numeric not null default 0,
    "purchase_price" numeric(12,2) not null,
    "purchased_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."portfolio_holdings" enable row level security;


  create table "public"."portfolios" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "league_id" uuid,
    "league_member_id" uuid,
    "cash_balance" numeric default 100000,
    "total_value" numeric default 100000,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."portfolios" enable row level security;


  create table "public"."stocks" (
    "id" uuid not null default gen_random_uuid(),
    "ticker" text not null,
    "name" text not null,
    "updated_at" timestamp with time zone default now(),
    "sector_tag" text,
    "market_cap_tier" text,
    "symbol" text,
    "current_price" numeric(12,2) default 0,
    "daily_change" numeric(12,2),
    "daily_change_percent" numeric(8,4)
      );


alter table "public"."stocks" enable row level security;


  create table "public"."transactions" (
    "id" uuid not null default gen_random_uuid(),
    "portfolio_id" uuid,
    "stock_symbol" text not null,
    "stock_name" text,
    "transaction_type" text not null,
    "quantity" numeric not null,
    "price" numeric(12,2) not null,
    "total_amount" numeric(12,2) not null,
    "transaction_date" timestamp with time zone default now(),
    "created_at" timestamp with time zone default now()
      );


alter table "public"."transactions" enable row level security;


  create table "public"."users" (
    "id" uuid not null default gen_random_uuid(),
    "firebase_uid" text not null,
    "email" text not null,
    "first_name" text,
    "last_name" text,
    "display_name" text,
    "photo_url" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX holdings_pkey ON public.holdings USING btree (id);

CREATE UNIQUE INDEX holdings_portfolio_id_stock_symbol_key ON public.holdings USING btree (portfolio_id, stock_symbol);

CREATE INDEX idx_holdings_portfolio_id ON public.holdings USING btree (portfolio_id);

CREATE INDEX idx_holdings_stock_symbol ON public.holdings USING btree (stock_symbol);

CREATE INDEX idx_league_members_firebase_uid ON public.league_members USING btree (firebase_uid);

CREATE INDEX idx_league_members_league_id ON public.league_members USING btree (league_id);

CREATE INDEX idx_league_members_rank ON public.league_members USING btree (league_id, rank);

CREATE INDEX idx_league_members_user_id ON public.league_members USING btree (user_id);

CREATE INDEX idx_league_slots_league_id ON public.league_slots USING btree (league_id);

CREATE INDEX idx_leagues_created_by ON public.leagues USING btree (created_by);

CREATE INDEX idx_leagues_creator_firebase_uid ON public.leagues USING btree (creator_firebase_uid);

CREATE INDEX idx_leagues_is_public ON public.leagues USING btree (is_public);

CREATE INDEX idx_leagues_join_code ON public.leagues USING btree (join_code);

CREATE INDEX idx_leagues_status ON public.leagues USING btree (status);

CREATE INDEX idx_portfolio_holdings_league ON public.portfolio_holdings USING btree (league_id);

CREATE INDEX idx_portfolio_holdings_slot ON public.portfolio_holdings USING btree (user_id, league_id, slot_name) WHERE (slot_name IS NOT NULL);

CREATE INDEX idx_portfolio_holdings_stock ON public.portfolio_holdings USING btree (stock_id);

CREATE INDEX idx_portfolio_holdings_user ON public.portfolio_holdings USING btree (user_id);

CREATE INDEX idx_portfolio_holdings_user_league ON public.portfolio_holdings USING btree (user_id, league_id);

CREATE INDEX idx_portfolios_league_id ON public.portfolios USING btree (league_id);

CREATE INDEX idx_portfolios_league_member_id ON public.portfolios USING btree (league_member_id);

CREATE INDEX idx_portfolios_user_id ON public.portfolios USING btree (user_id);

CREATE INDEX idx_transactions_date ON public.transactions USING btree (transaction_date);

CREATE INDEX idx_transactions_portfolio_id ON public.transactions USING btree (portfolio_id);

CREATE INDEX idx_transactions_stock_symbol ON public.transactions USING btree (stock_symbol);

CREATE INDEX idx_users_firebase_uid ON public.users USING btree (firebase_uid);

CREATE UNIQUE INDEX league_members_league_id_firebase_uid_key ON public.league_members USING btree (league_id, firebase_uid);

CREATE UNIQUE INDEX league_members_pkey ON public.league_members USING btree (id);

CREATE UNIQUE INDEX league_slots_pkey ON public.league_slots USING btree (id);

CREATE UNIQUE INDEX leagues_join_code_key ON public.leagues USING btree (join_code);

CREATE UNIQUE INDEX leagues_pkey ON public.leagues USING btree (id);

CREATE UNIQUE INDEX portfolio_holdings_pkey ON public.portfolio_holdings USING btree (id);

CREATE UNIQUE INDEX portfolios_pkey ON public.portfolios USING btree (id);

CREATE UNIQUE INDEX portfolios_user_id_league_id_key ON public.portfolios USING btree (user_id, league_id);

CREATE UNIQUE INDEX stocks_pkey ON public.stocks USING btree (id);

CREATE UNIQUE INDEX stocks_symbol_key ON public.stocks USING btree (symbol);

CREATE UNIQUE INDEX stocks_ticker_key ON public.stocks USING btree (ticker);

CREATE UNIQUE INDEX transactions_pkey ON public.transactions USING btree (id);

CREATE UNIQUE INDEX unique_league_slot ON public.league_slots USING btree (league_id, slot_name);

CREATE UNIQUE INDEX unique_user_league_stock_slot ON public.portfolio_holdings USING btree (user_id, league_id, stock_id, slot_name);

CREATE UNIQUE INDEX users_firebase_uid_key ON public.users USING btree (firebase_uid);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."holdings" add constraint "holdings_pkey" PRIMARY KEY using index "holdings_pkey";

alter table "public"."league_members" add constraint "league_members_pkey" PRIMARY KEY using index "league_members_pkey";

alter table "public"."league_slots" add constraint "league_slots_pkey" PRIMARY KEY using index "league_slots_pkey";

alter table "public"."leagues" add constraint "leagues_pkey" PRIMARY KEY using index "leagues_pkey";

alter table "public"."portfolio_holdings" add constraint "portfolio_holdings_pkey" PRIMARY KEY using index "portfolio_holdings_pkey";

alter table "public"."portfolios" add constraint "portfolios_pkey" PRIMARY KEY using index "portfolios_pkey";

alter table "public"."stocks" add constraint "stocks_pkey" PRIMARY KEY using index "stocks_pkey";

alter table "public"."transactions" add constraint "transactions_pkey" PRIMARY KEY using index "transactions_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."holdings" add constraint "holdings_portfolio_id_fkey" FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE not valid;

alter table "public"."holdings" validate constraint "holdings_portfolio_id_fkey";

alter table "public"."holdings" add constraint "holdings_portfolio_id_stock_symbol_key" UNIQUE using index "holdings_portfolio_id_stock_symbol_key";

alter table "public"."league_members" add constraint "league_members_league_id_firebase_uid_key" UNIQUE using index "league_members_league_id_firebase_uid_key";

alter table "public"."league_members" add constraint "league_members_league_id_fkey" FOREIGN KEY (league_id) REFERENCES public.leagues(id) ON DELETE CASCADE not valid;

alter table "public"."league_members" validate constraint "league_members_league_id_fkey";

alter table "public"."league_members" add constraint "league_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."league_members" validate constraint "league_members_user_id_fkey";

alter table "public"."league_slots" add constraint "league_slots_constraint_type_check" CHECK ((constraint_type = ANY (ARRAY['sector'::text, 'market_cap'::text, 'wildcard'::text]))) not valid;

alter table "public"."league_slots" validate constraint "league_slots_constraint_type_check";

alter table "public"."league_slots" add constraint "league_slots_league_id_fkey" FOREIGN KEY (league_id) REFERENCES public.leagues(id) ON DELETE CASCADE not valid;

alter table "public"."league_slots" validate constraint "league_slots_league_id_fkey";

alter table "public"."league_slots" add constraint "unique_league_slot" UNIQUE using index "unique_league_slot";

alter table "public"."leagues" add constraint "leagues_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."leagues" validate constraint "leagues_created_by_fkey";

alter table "public"."leagues" add constraint "leagues_duration_check" CHECK ((duration = ANY (ARRAY['ongoing'::text, '1_week'::text, '1_month'::text, '3_months'::text, '6_months'::text, '1_year'::text]))) not valid;

alter table "public"."leagues" validate constraint "leagues_duration_check";

alter table "public"."leagues" add constraint "leagues_join_code_key" UNIQUE using index "leagues_join_code_key";

alter table "public"."leagues" add constraint "leagues_max_players_check" CHECK (((max_players >= 2) AND (max_players <= 50))) not valid;

alter table "public"."leagues" validate constraint "leagues_max_players_check";

alter table "public"."leagues" add constraint "leagues_max_stocks_per_portfolio_check" CHECK (((max_stocks_per_portfolio >= 5) AND (max_stocks_per_portfolio <= 50))) not valid;

alter table "public"."leagues" validate constraint "leagues_max_stocks_per_portfolio_check";

alter table "public"."leagues" add constraint "leagues_starting_cash_check" CHECK (((starting_cash >= (10000)::numeric) AND (starting_cash <= (1000000)::numeric))) not valid;

alter table "public"."leagues" validate constraint "leagues_starting_cash_check";

alter table "public"."leagues" add constraint "leagues_status_check" CHECK ((status = ANY (ARRAY['upcoming'::text, 'active'::text, 'completed'::text]))) not valid;

alter table "public"."leagues" validate constraint "leagues_status_check";

alter table "public"."leagues" add constraint "leagues_trade_frequency_check" CHECK ((trade_frequency = ANY (ARRAY['unlimited'::text, 'daily'::text, 'weekly'::text]))) not valid;

alter table "public"."leagues" validate constraint "leagues_trade_frequency_check";

alter table "public"."leagues" add constraint "valid_date_range" CHECK (((end_date IS NULL) OR (start_date IS NULL) OR (end_date > start_date))) not valid;

alter table "public"."leagues" validate constraint "valid_date_range";

alter table "public"."portfolio_holdings" add constraint "portfolio_holdings_league_id_fkey" FOREIGN KEY (league_id) REFERENCES public.leagues(id) ON DELETE CASCADE not valid;

alter table "public"."portfolio_holdings" validate constraint "portfolio_holdings_league_id_fkey";

alter table "public"."portfolio_holdings" add constraint "portfolio_holdings_stock_id_fkey" FOREIGN KEY (stock_id) REFERENCES public.stocks(id) ON DELETE CASCADE not valid;

alter table "public"."portfolio_holdings" validate constraint "portfolio_holdings_stock_id_fkey";

alter table "public"."portfolio_holdings" add constraint "portfolio_holdings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."portfolio_holdings" validate constraint "portfolio_holdings_user_id_fkey";

alter table "public"."portfolio_holdings" add constraint "unique_user_league_stock_slot" UNIQUE using index "unique_user_league_stock_slot";

alter table "public"."portfolios" add constraint "portfolios_league_id_fkey" FOREIGN KEY (league_id) REFERENCES public.leagues(id) ON DELETE CASCADE not valid;

alter table "public"."portfolios" validate constraint "portfolios_league_id_fkey";

alter table "public"."portfolios" add constraint "portfolios_league_member_id_fkey" FOREIGN KEY (league_member_id) REFERENCES public.league_members(id) ON DELETE CASCADE not valid;

alter table "public"."portfolios" validate constraint "portfolios_league_member_id_fkey";

alter table "public"."portfolios" add constraint "portfolios_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."portfolios" validate constraint "portfolios_user_id_fkey";

alter table "public"."portfolios" add constraint "portfolios_user_id_league_id_key" UNIQUE using index "portfolios_user_id_league_id_key";

alter table "public"."stocks" add constraint "stocks_symbol_key" UNIQUE using index "stocks_symbol_key";

alter table "public"."stocks" add constraint "stocks_ticker_key" UNIQUE using index "stocks_ticker_key";

alter table "public"."transactions" add constraint "transactions_portfolio_id_fkey" FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE not valid;

alter table "public"."transactions" validate constraint "transactions_portfolio_id_fkey";

alter table "public"."transactions" add constraint "transactions_transaction_type_check" CHECK ((transaction_type = ANY (ARRAY['buy'::text, 'sell'::text]))) not valid;

alter table "public"."transactions" validate constraint "transactions_transaction_type_check";

alter table "public"."users" add constraint "users_firebase_uid_key" UNIQUE using index "users_firebase_uid_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_default_slots_to_league(p_league_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
DELETE FROM league_slots WHERE league_id = p_league_id;
INSERT INTO league_slots (league_id, slot_name, max_count, constraint_type, constraint_value, display_order, description) VALUES
(p_league_id, 'Large-Cap Anchor 1', 1, 'market_cap', 'Large-Cap', 1, 'A stable large-cap stock for portfolio foundation'),
(p_league_id, 'Large-Cap Anchor 2', 1, 'market_cap', 'Large-Cap', 2, 'A stable large-cap stock for portfolio foundation'),
(p_league_id, 'Large-Cap Anchor 3', 1, 'market_cap', 'Large-Cap', 3, 'A stable large-cap stock for portfolio foundation'),
(p_league_id, 'Large-Cap Anchor 4', 1, 'market_cap', 'Large-Cap', 4, 'A stable large-cap stock for portfolio foundation'),
(p_league_id, 'Mid-Cap Growth 1', 1, 'market_cap', 'Mid-Cap', 5, 'A mid-cap stock with growth potential'),
(p_league_id, 'Mid-Cap Growth 2', 1, 'market_cap', 'Mid-Cap', 6, 'A mid-cap stock with growth potential'),
(p_league_id, 'Mid-Cap Growth 3', 1, 'market_cap', 'Mid-Cap', 7, 'A mid-cap stock with growth potential'),
(p_league_id, 'High-Risk Small-Cap 1', 1, 'market_cap', 'Small-Cap', 8, 'A high-risk, high-reward small-cap stock'),
(p_league_id, 'High-Risk Small-Cap 2', 1, 'market_cap', 'Small-Cap', 9, 'A high-risk, high-reward small-cap stock'),
(p_league_id, 'High-Risk Small-Cap 3', 1, 'market_cap', 'Small-Cap', 10, 'A high-risk, high-reward small-cap stock'),
(p_league_id, 'Wildcard Flex', 1, 'wildcard', NULL, 11, 'Any stock of your choice - no restrictions');
END;
$function$
;

CREATE OR REPLACE FUNCTION public.add_stock_to_portfolio(p_league_id uuid, p_user_id uuid, p_stock_id uuid, p_slot_name text, p_quantity integer DEFAULT 1)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
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
    IF COALESCE(v_league_member.current_cash, 0) < v_total_cost THEN
        RETURN json_build_object(
            'success', false,
            'message', format('Insufficient funds. Cost: $%.2f, Available: $%.2f', 
                v_total_cost, COALESCE(v_league_member.current_cash, 0))
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
    SET current_cash = COALESCE(current_cash, 0) - v_total_cost,
        portfolio_value = COALESCE(portfolio_value, 0) + v_total_cost,
        total_value = COALESCE(current_cash, 0) - v_total_cost + COALESCE(portfolio_value, 0) + v_total_cost
    WHERE league_id = p_league_id AND user_id = p_user_id;

    -- 11. Return success
    RETURN json_build_object(
        'success', true,
        'message', format('%s added to %s!', v_stock_record.ticker, p_slot_name),
        'data', json_build_object(
            'stock_ticker', v_stock_record.ticker,
            'stock_name', v_stock_record.name,
            'slot_name', p_slot_name,
            'quantity', p_quantity,
            'cost', v_total_cost,
            'remaining_cash', COALESCE(v_league_member.current_cash, 0) - v_total_cost
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Database error: ' || SQLERRM
        );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.can_join_league(p_league_id uuid, p_firebase_uid text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.can_join_league(p_league_id uuid, p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
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
    WHERE league_id = p_league_id AND user_id = p_user_id
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
$function$
;

CREATE OR REPLACE FUNCTION public.create_league(p_name text, p_created_by uuid, p_description text DEFAULT NULL::text, p_is_public boolean DEFAULT false, p_max_players integer DEFAULT 20, p_starting_cash numeric DEFAULT 100000, p_max_stocks integer DEFAULT 15, p_trade_frequency text DEFAULT 'unlimited'::text, p_duration text DEFAULT 'ongoing'::text, p_start_date timestamp with time zone DEFAULT now(), p_allow_fractional boolean DEFAULT true)
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
$function$
;

CREATE OR REPLACE FUNCTION public.generate_unique_join_code()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_available_slots(p_league_id uuid, p_user_id uuid)
 RETURNS TABLE(id uuid, league_id uuid, slot_name text, max_count integer, constraint_type text, constraint_value text, display_order integer, description text, created_at timestamp with time zone, current_count bigint, slots_remaining integer, is_full boolean)
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.initialize_portfolio()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

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
$function$
;

create or replace view "public"."league_stats" as  SELECT l.id,
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
    count(lm.id) AS member_count,
        CASE
            WHEN (count(lm.id) >= l.max_players) THEN true
            ELSE false
        END AS is_full
   FROM (public.leagues l
     LEFT JOIN public.league_members lm ON ((l.id = lm.league_id)))
  GROUP BY l.id;


create or replace view "public"."portfolio_summary" as  SELECT p.id AS portfolio_id,
    p.user_id,
    p.league_id,
    p.cash_balance,
    p.total_value,
    count(h.id) AS total_holdings,
    COALESCE(sum((h.quantity * h.current_price)), (0)::numeric) AS holdings_value,
    l.name AS league_name,
    l.starting_cash
   FROM ((public.portfolios p
     LEFT JOIN public.holdings h ON ((p.id = h.portfolio_id)))
     JOIN public.leagues l ON ((p.league_id = l.id)))
  GROUP BY p.id, p.user_id, p.league_id, p.cash_balance, p.total_value, l.name, l.starting_cash;


CREATE OR REPLACE FUNCTION public.remove_stock_from_portfolio(p_league_id uuid, p_user_id uuid, p_stock_id uuid)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.set_join_code_for_private_leagues()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW.is_public = false AND NEW.join_code IS NULL THEN
        NEW.join_code := generate_unique_join_code();
    END IF;
    
    IF NEW.is_public = true THEN
        NEW.join_code := NULL;
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.sync_league_member_portfolio_values()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_holdings_value DECIMAL;
  v_cash DECIMAL;
BEGIN
  -- Calculate total holdings value for this user in this league
  SELECT COALESCE(SUM(ph.quantity * s.current_price), 0)
  INTO v_holdings_value
  FROM portfolio_holdings ph
  JOIN stocks s ON ph.stock_id = s.id
  WHERE ph.user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND ph.league_id = COALESCE(NEW.league_id, OLD.league_id)
    AND ph.quantity > 0;

  -- Get current cash
  SELECT current_cash INTO v_cash
  FROM league_members
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND league_id = COALESCE(NEW.league_id, OLD.league_id);

  -- Update league_members
  UPDATE league_members
  SET
    portfolio_value = v_holdings_value,
    total_value = v_cash + v_holdings_value,
    current_value = v_cash + v_holdings_value
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND league_id = COALESCE(NEW.league_id, OLD.league_id);

  RETURN COALESCE(NEW, OLD);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_league_rankings(p_league_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_league_status()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

create or replace view "public"."user_league_memberships" as  SELECT lm.id,
    lm.league_id,
    lm.user_id,
    lm.firebase_uid,
    lm.joined_at,
    lm.current_value,
    lm.rank,
    lm.total_trades,
    l.name AS league_name,
    l.status AS league_status,
    l.is_public,
    p.cash_balance,
    p.total_value AS portfolio_value
   FROM ((public.league_members lm
     JOIN public.leagues l ON ((lm.league_id = l.id)))
     LEFT JOIN public.portfolios p ON ((p.league_member_id = lm.id)));


grant delete on table "public"."holdings" to "anon";

grant insert on table "public"."holdings" to "anon";

grant references on table "public"."holdings" to "anon";

grant select on table "public"."holdings" to "anon";

grant trigger on table "public"."holdings" to "anon";

grant truncate on table "public"."holdings" to "anon";

grant update on table "public"."holdings" to "anon";

grant delete on table "public"."holdings" to "authenticated";

grant insert on table "public"."holdings" to "authenticated";

grant references on table "public"."holdings" to "authenticated";

grant select on table "public"."holdings" to "authenticated";

grant trigger on table "public"."holdings" to "authenticated";

grant truncate on table "public"."holdings" to "authenticated";

grant update on table "public"."holdings" to "authenticated";

grant delete on table "public"."holdings" to "service_role";

grant insert on table "public"."holdings" to "service_role";

grant references on table "public"."holdings" to "service_role";

grant select on table "public"."holdings" to "service_role";

grant trigger on table "public"."holdings" to "service_role";

grant truncate on table "public"."holdings" to "service_role";

grant update on table "public"."holdings" to "service_role";

grant delete on table "public"."league_members" to "anon";

grant insert on table "public"."league_members" to "anon";

grant references on table "public"."league_members" to "anon";

grant select on table "public"."league_members" to "anon";

grant trigger on table "public"."league_members" to "anon";

grant truncate on table "public"."league_members" to "anon";

grant update on table "public"."league_members" to "anon";

grant delete on table "public"."league_members" to "authenticated";

grant insert on table "public"."league_members" to "authenticated";

grant references on table "public"."league_members" to "authenticated";

grant select on table "public"."league_members" to "authenticated";

grant trigger on table "public"."league_members" to "authenticated";

grant truncate on table "public"."league_members" to "authenticated";

grant update on table "public"."league_members" to "authenticated";

grant delete on table "public"."league_members" to "service_role";

grant insert on table "public"."league_members" to "service_role";

grant references on table "public"."league_members" to "service_role";

grant select on table "public"."league_members" to "service_role";

grant trigger on table "public"."league_members" to "service_role";

grant truncate on table "public"."league_members" to "service_role";

grant update on table "public"."league_members" to "service_role";

grant delete on table "public"."league_slots" to "anon";

grant insert on table "public"."league_slots" to "anon";

grant references on table "public"."league_slots" to "anon";

grant select on table "public"."league_slots" to "anon";

grant trigger on table "public"."league_slots" to "anon";

grant truncate on table "public"."league_slots" to "anon";

grant update on table "public"."league_slots" to "anon";

grant delete on table "public"."league_slots" to "authenticated";

grant insert on table "public"."league_slots" to "authenticated";

grant references on table "public"."league_slots" to "authenticated";

grant select on table "public"."league_slots" to "authenticated";

grant trigger on table "public"."league_slots" to "authenticated";

grant truncate on table "public"."league_slots" to "authenticated";

grant update on table "public"."league_slots" to "authenticated";

grant delete on table "public"."league_slots" to "service_role";

grant insert on table "public"."league_slots" to "service_role";

grant references on table "public"."league_slots" to "service_role";

grant select on table "public"."league_slots" to "service_role";

grant trigger on table "public"."league_slots" to "service_role";

grant truncate on table "public"."league_slots" to "service_role";

grant update on table "public"."league_slots" to "service_role";

grant delete on table "public"."leagues" to "anon";

grant insert on table "public"."leagues" to "anon";

grant references on table "public"."leagues" to "anon";

grant select on table "public"."leagues" to "anon";

grant trigger on table "public"."leagues" to "anon";

grant truncate on table "public"."leagues" to "anon";

grant update on table "public"."leagues" to "anon";

grant delete on table "public"."leagues" to "authenticated";

grant insert on table "public"."leagues" to "authenticated";

grant references on table "public"."leagues" to "authenticated";

grant select on table "public"."leagues" to "authenticated";

grant trigger on table "public"."leagues" to "authenticated";

grant truncate on table "public"."leagues" to "authenticated";

grant update on table "public"."leagues" to "authenticated";

grant delete on table "public"."leagues" to "service_role";

grant insert on table "public"."leagues" to "service_role";

grant references on table "public"."leagues" to "service_role";

grant select on table "public"."leagues" to "service_role";

grant trigger on table "public"."leagues" to "service_role";

grant truncate on table "public"."leagues" to "service_role";

grant update on table "public"."leagues" to "service_role";

grant delete on table "public"."portfolio_holdings" to "anon";

grant insert on table "public"."portfolio_holdings" to "anon";

grant references on table "public"."portfolio_holdings" to "anon";

grant select on table "public"."portfolio_holdings" to "anon";

grant trigger on table "public"."portfolio_holdings" to "anon";

grant truncate on table "public"."portfolio_holdings" to "anon";

grant update on table "public"."portfolio_holdings" to "anon";

grant delete on table "public"."portfolio_holdings" to "authenticated";

grant insert on table "public"."portfolio_holdings" to "authenticated";

grant references on table "public"."portfolio_holdings" to "authenticated";

grant select on table "public"."portfolio_holdings" to "authenticated";

grant trigger on table "public"."portfolio_holdings" to "authenticated";

grant truncate on table "public"."portfolio_holdings" to "authenticated";

grant update on table "public"."portfolio_holdings" to "authenticated";

grant delete on table "public"."portfolio_holdings" to "service_role";

grant insert on table "public"."portfolio_holdings" to "service_role";

grant references on table "public"."portfolio_holdings" to "service_role";

grant select on table "public"."portfolio_holdings" to "service_role";

grant trigger on table "public"."portfolio_holdings" to "service_role";

grant truncate on table "public"."portfolio_holdings" to "service_role";

grant update on table "public"."portfolio_holdings" to "service_role";

grant delete on table "public"."portfolios" to "anon";

grant insert on table "public"."portfolios" to "anon";

grant references on table "public"."portfolios" to "anon";

grant select on table "public"."portfolios" to "anon";

grant trigger on table "public"."portfolios" to "anon";

grant truncate on table "public"."portfolios" to "anon";

grant update on table "public"."portfolios" to "anon";

grant delete on table "public"."portfolios" to "authenticated";

grant insert on table "public"."portfolios" to "authenticated";

grant references on table "public"."portfolios" to "authenticated";

grant select on table "public"."portfolios" to "authenticated";

grant trigger on table "public"."portfolios" to "authenticated";

grant truncate on table "public"."portfolios" to "authenticated";

grant update on table "public"."portfolios" to "authenticated";

grant delete on table "public"."portfolios" to "service_role";

grant insert on table "public"."portfolios" to "service_role";

grant references on table "public"."portfolios" to "service_role";

grant select on table "public"."portfolios" to "service_role";

grant trigger on table "public"."portfolios" to "service_role";

grant truncate on table "public"."portfolios" to "service_role";

grant update on table "public"."portfolios" to "service_role";

grant delete on table "public"."stocks" to "anon";

grant insert on table "public"."stocks" to "anon";

grant references on table "public"."stocks" to "anon";

grant select on table "public"."stocks" to "anon";

grant trigger on table "public"."stocks" to "anon";

grant truncate on table "public"."stocks" to "anon";

grant update on table "public"."stocks" to "anon";

grant delete on table "public"."stocks" to "authenticated";

grant insert on table "public"."stocks" to "authenticated";

grant references on table "public"."stocks" to "authenticated";

grant select on table "public"."stocks" to "authenticated";

grant trigger on table "public"."stocks" to "authenticated";

grant truncate on table "public"."stocks" to "authenticated";

grant update on table "public"."stocks" to "authenticated";

grant delete on table "public"."stocks" to "service_role";

grant insert on table "public"."stocks" to "service_role";

grant references on table "public"."stocks" to "service_role";

grant select on table "public"."stocks" to "service_role";

grant trigger on table "public"."stocks" to "service_role";

grant truncate on table "public"."stocks" to "service_role";

grant update on table "public"."stocks" to "service_role";

grant delete on table "public"."transactions" to "anon";

grant insert on table "public"."transactions" to "anon";

grant references on table "public"."transactions" to "anon";

grant select on table "public"."transactions" to "anon";

grant trigger on table "public"."transactions" to "anon";

grant truncate on table "public"."transactions" to "anon";

grant update on table "public"."transactions" to "anon";

grant delete on table "public"."transactions" to "authenticated";

grant insert on table "public"."transactions" to "authenticated";

grant references on table "public"."transactions" to "authenticated";

grant select on table "public"."transactions" to "authenticated";

grant trigger on table "public"."transactions" to "authenticated";

grant truncate on table "public"."transactions" to "authenticated";

grant update on table "public"."transactions" to "authenticated";

grant delete on table "public"."transactions" to "service_role";

grant insert on table "public"."transactions" to "service_role";

grant references on table "public"."transactions" to "service_role";

grant select on table "public"."transactions" to "service_role";

grant trigger on table "public"."transactions" to "service_role";

grant truncate on table "public"."transactions" to "service_role";

grant update on table "public"."transactions" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";


  create policy "dev_all_access_holdings"
  on "public"."holdings"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "dev_all_access_league_members"
  on "public"."league_members"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "dev_all_access_league_slots"
  on "public"."league_slots"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "dev_all_access_leagues"
  on "public"."leagues"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "dev_all_access_portfolio_holdings"
  on "public"."portfolio_holdings"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "dev_all_access_portfolios"
  on "public"."portfolios"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "dev_all_access_stocks"
  on "public"."stocks"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "dev_all_access_transactions"
  on "public"."transactions"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "Users can insert their own profile"
  on "public"."users"
  as permissive
  for insert
  to public
with check (true);



  create policy "Users can update their own profile"
  on "public"."users"
  as permissive
  for update
  to public
using (true);



  create policy "Users can view their own profile"
  on "public"."users"
  as permissive
  for select
  to public
using (true);



  create policy "dev_all_access_users"
  on "public"."users"
  as permissive
  for all
  to public
using (true)
with check (true);


CREATE TRIGGER update_holdings_updated_at BEFORE UPDATE ON public.holdings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER create_portfolio_on_join AFTER INSERT ON public.league_members FOR EACH ROW EXECUTE FUNCTION public.initialize_portfolio();

CREATE TRIGGER generate_join_code_trigger BEFORE INSERT OR UPDATE ON public.leagues FOR EACH ROW EXECUTE FUNCTION public.set_join_code_for_private_leagues();

CREATE TRIGGER update_leagues_updated_at BEFORE UPDATE ON public.leagues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER sync_portfolio_values_on_holdings_change AFTER INSERT OR DELETE OR UPDATE ON public.portfolio_holdings FOR EACH ROW EXECUTE FUNCTION public.sync_league_member_portfolio_values();

CREATE TRIGGER update_portfolio_holdings_updated_at BEFORE UPDATE ON public.portfolio_holdings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON public.portfolios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


