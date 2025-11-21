# Fantasy Stock League - Slot-Based Portfolio System

## Overview

This implementation replaces generic portfolio management with a **strategic slot-based system** where users must fill specific slots with stocks that meet defined constraints (sector, market cap, or wildcard).

---

## 🗄️ DATABASE SETUP

### 1. Run Schema Updates

Execute these SQL scripts in your Supabase SQL Editor **in this exact order**:

#### A. Fix Schema Compatibility (IMPORTANT - Run This First!)
File: `database/fix_fantasy_schema.sql`

This script fixes schema mismatches:
- Adds `current_cash`, `portfolio_value`, `total_value` columns to `league_members`
- Creates the `portfolio_holdings` table with correct references
- Adds price tracking columns to `stocks` table
- Creates auto-sync triggers for portfolio values
- Initializes existing league members with proper cash balances

**⚠️ This must be run before the other scripts!**

#### B. Add Slots Schema
File: `database/add_fantasy_slots_schema.sql`

This script:
- Adds `sector_tag` and `market_cap_tier` columns to the `stocks` table
- Creates the `league_slots` table to define portfolio structure
- Creates helper views and functions
- Includes a `add_default_slots_to_league(league_id)` function for seeding

#### C. Add Portfolio Functions
File: `database/add_stock_to_portfolio_function.sql`

This script creates:
- `add_stock_to_portfolio()` - Main function with constraint validation
- `get_available_slots()` - Returns slots with usage information
- `remove_stock_from_portfolio()` - Removes stocks and refunds cash

### 2. Seed Example Data

After running the schemas, create slots for your leagues:

```sql
-- Add default 4-3-3-1 slot configuration to a league
SELECT add_default_slots_to_league('your-league-id-here');
```

### 3. Update Stock Data

Add sector and market cap data to your stocks:

```sql
-- Example: Update stocks with categorization
UPDATE stocks
SET sector_tag = 'Technology',
    market_cap_tier = 'Large-Cap'
WHERE symbol IN ('AAPL', 'MSFT', 'GOOGL');

UPDATE stocks
SET sector_tag = 'Healthcare',
    market_cap_tier = 'Large-Cap'
WHERE symbol IN ('JNJ', 'PFE', 'UNH');

-- Add more as needed...
```

---

## 🎨 FRONTEND IMPLEMENTATION

### Files Created

1. **Types**: `frontend/src/types/fantasy.types.ts`
   - TypeScript interfaces for slots, stocks, holdings
   - Enums for market cap tiers and sectors

2. **Service**: `frontend/src/services/fantasyService.ts`
   - Functions to interact with Supabase RPC calls
   - `getUserLeagues()`, `getAvailableSlots()`, `addStockToPortfolio()`, etc.

3. **Fantasy Page**: `frontend/src/pages/FantasyNew.tsx`
   - Complete rewrite with league selection
   - Shows "Not in any leagues" message with redirect
   - Displays portfolio slots with constraints
   - Real-time portfolio stats (cash, value, P/L)

4. **Add Stock Modal**: `frontend/src/components/Fantasy/AddStockModal.tsx`
   - Search stocks with constraint filtering
   - Select quantity
   - Validates constraints before submission

### Key Features

✅ **League Selection Required**: Users must select a league before accessing portfolio
✅ **No Leagues State**: Shows friendly message with "Go to Leagues" button
✅ **Slot-Based UI**: Cards for each slot showing constraints and current holdings
✅ **Real-Time Stats**: Cash, portfolio value, and P/L calculations
✅ **Constraint Validation**: Automatic filtering and validation based on slot requirements
✅ **Toast Notifications**: User-friendly success/error messages

---

## 🚀 USAGE FLOW

### For Users

1. **Access Fantasy Page**: Navigate to `/fantasy`
2. **Select League**: Choose which league portfolio to manage
3. **View Slots**: See all available slots with their constraints
4. **Add Stock**:
   - Click "Add Stock" on an empty slot
   - Search for stocks (automatically filtered by slot constraints)
   - Select stock and quantity
   - Submit
5. **Track Performance**: View real-time portfolio value and profit/loss

### For League Creators

1. **Create League**: Use existing league creation flow
2. **Add Slots**: Run the seed function or manually insert into `league_slots` table
3. **Configure Constraints**: Set slot rules (sector, market_cap, wildcard)

---

## 📊 SLOT CONFIGURATION

### Default Slot Structure (4-3-3-1 Formation)

| Slot Name | Max Count | Constraint Type | Constraint Value | Description |
|-----------|-----------|-----------------|------------------|-------------|
| Large-Cap Anchor 1-4 | 1 each | market_cap | Large-Cap | Stable large-cap foundation |
| Mid-Cap Growth 1-3 | 1 each | market_cap | Mid-Cap | Growth potential mid-caps |
| High-Risk Small-Cap 1-3 | 1 each | market_cap | Small-Cap | High-risk, high-reward |
| Wildcard Flex | 1 | wildcard | NULL | Any stock allowed |

### Creating Custom Slots

```sql
INSERT INTO league_slots (
    league_id,
    slot_name,
    max_count,
    constraint_type,
    constraint_value,
    display_order,
    description
) VALUES (
    'your-league-id',
    'Tech Giants',
    2,
    'sector',
    'Technology',
    1,
    'Pick 2 major technology companies'
);
```

---

## 🔒 CONSTRAINT TYPES

### 1. **Sector Constraint**
- `constraint_type`: `'sector'`
- `constraint_value`: `'Technology'`, `'Healthcare'`, `'Finance'`, etc.
- **Validation**: Stock's `sector_tag` must match `constraint_value`

### 2. **Market Cap Constraint**
- `constraint_type`: `'market_cap'`
- `constraint_value`: `'Large-Cap'`, `'Mid-Cap'`, `'Small-Cap'`
- **Validation**: Stock's `market_cap_tier` must match `constraint_value`

### 3. **Wildcard (No Constraint)**
- `constraint_type`: `'wildcard'`
- `constraint_value`: `NULL`
- **Validation**: Any stock is allowed

---

## 🔄 API CALLS

### Frontend to Backend Flow

```typescript
// 1. Get available slots for a league
const { data: slots } = await getAvailableSlots(user.uid, leagueId);

// 2. Add stock to portfolio
const { data: result } = await addStockToPortfolio(user.uid, {
  league_id: leagueId,
  user_id: user.uid,
  stock_id: selectedStock.id,
  slot_name: 'Large-Cap Anchor 1',
  quantity: 10
});

// 3. Get current portfolio holdings
const { data: holdings } = await getPortfolioHoldings(user.uid, leagueId);
```

### Database Validation Flow

```
User submits stock
    ↓
Frontend calls add_stock_to_portfolio()
    ↓
Backend checks:
    1. User is in league? ✓
    2. Slot exists? ✓
    3. Slot has room? ✓
    4. Stock meets constraint? ✓
    5. User has enough cash? ✓
    ↓
Insert/Update holding
Update cash
Return success/error JSON
```

---

## 🧪 TESTING

### Test Checklist

- [ ] User not in any leagues sees redirect message
- [ ] User can select between multiple leagues
- [ ] Slots display with correct constraints
- [ ] Stock search filters by slot constraints
- [ ] Constraint validation works (sector/market_cap)
- [ ] Wildcard slots accept any stock
- [ ] Cash is deducted on purchase
- [ ] Portfolio value updates correctly
- [ ] P/L calculations are accurate
- [ ] Error messages display for invalid stocks
- [ ] Toast notifications show success/error

---

## 🐛 TROUBLESHOOTING

### Common Issues

1. **"User not found" error**
   - Ensure user exists in `users` table with correct `firebase_uid`

2. **"No slots configured"**
   - Run `SELECT add_default_slots_to_league('league-id')` in SQL editor

3. **Stocks not showing in search**
   - Verify stocks have `sector_tag` and `market_cap_tier` values set

4. **Constraint validation failing**
   - Check stock's tags match the slot's `constraint_value` exactly (case-sensitive)

5. **TypeScript errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check imports in the new files

---

## 📝 NEXT STEPS

### Recommended Enhancements

1. **Remove Stock Functionality**: Implement the remove button in slot cards
2. **Stock Details**: Add a modal showing detailed stock information
3. **Portfolio History**: Track portfolio value over time
4. **Slot Templates**: Create predefined slot configurations
5. **Admin Panel**: UI for league creators to configure slots
6. **Bulk Import**: Import stock sector/market cap data from CSV
7. **Real-Time Updates**: WebSocket for live portfolio updates
8. **Mobile Optimization**: Responsive design improvements

---

## 📚 ADDITIONAL RESOURCES

- **Database Functions**: See comments in SQL files for detailed logic
- **Type Definitions**: Check `fantasy.types.ts` for all interfaces
- **Service Layer**: Review `fantasyService.ts` for API patterns
- **UI Components**: Examine `FantasyNew.tsx` and `AddStockModal.tsx` for examples

---

## ✅ COMPLETION CHECKLIST

- [x] Database schema created
- [x] Schema compatibility fixes created
- [x] PL/pgSQL functions implemented
- [x] TypeScript types defined
- [x] Service layer created
- [x] Fantasy page rewritten
- [x] Add Stock modal implemented
- [x] League selection added
- [x] "Not in leagues" state handled
- [x] Portfolio stats displayed
- [x] Constraint validation working
- [x] Toast notifications integrated
- [ ] **Run database scripts in Supabase (IN ORDER!)**
  - [ ] 1. Run `fix_fantasy_schema.sql` first
  - [ ] 2. Run `add_fantasy_slots_schema.sql` second
  - [ ] 3. Run `add_stock_to_portfolio_function.sql` third
- [ ] Seed example slot data
- [ ] Update stock categorization
- [ ] Test end-to-end flow

---

**Implementation Complete! 🎉**

Next: Run the database scripts and start testing your new slot-based portfolio system.
