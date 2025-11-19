# InvestorsArena Database Schema Reference

**Last Updated:** November 19, 2024  
**Status:** Production Schema - Use this as source of truth

---

## ⚠️ CRITICAL: How to Reference Users

**Single Source of Truth:** `users.firebase_uid`

**Foreign Key Pattern:**
- `leagues.created_by` → `users.id` (UUID)
- `league_members.user_id` → `users.id` (UUID)
- `portfolios.user_id` → `users.id` (UUID)

**❌ These columns DO NOT exist:**
- ~~`leagues.creator_firebase_uid`~~ (removed)
- ~~`league_members.firebase_uid`~~ (removed)

**✅ To get firebase_uid:**
- Use views: `league_stats`, `user_league_memberships`, `portfolio_summary`
- Or JOIN with users table manually

---

## 🗄️ Database Tables

### 1. users
**Purpose:** Store user profile information

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| firebase_uid | TEXT | UNIQUE, NOT NULL | Firebase Auth ID |
| email | TEXT | NOT NULL | User email |
| first_name | TEXT | | |
| last_name | TEXT | | |
| display_name | TEXT | | |
| photo_url | TEXT | | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Auto-updated |

**Indexes:** `firebase_uid`

---

### 2. leagues
**Purpose:** Fantasy stock league configurations

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| id | UUID | PRIMARY KEY | auto | |
| name | TEXT | NOT NULL | | League name |
| description | TEXT | | | Optional description |
| created_by | UUID | FK→users.id, NOT NULL | | Creator's user ID |
| is_public | BOOLEAN | | false | Public/private league |
| join_code | TEXT | UNIQUE | auto | Auto-gen for private |
| max_players | INTEGER | CHECK (2-50) | 20 | Max members |
| starting_cash | DECIMAL | CHECK (10k-1M) | 100000 | Starting balance |
| max_stocks_per_portfolio | INTEGER | CHECK (5-50) | 15 | Max stock positions |
| trade_frequency | TEXT | CHECK | 'unlimited' | unlimited/daily/weekly |
| trade_limit | INTEGER | | | For daily/weekly |
| duration | TEXT | CHECK | 'ongoing' | ongoing/1_week/1_month/3_months/6_months/1_year |
| start_date | TIMESTAMPTZ | | | When league starts |
| end_date | TIMESTAMPTZ | | | When league ends |
| allow_fractional | BOOLEAN | | true | Allow fractional shares |
| status | TEXT | CHECK | 'upcoming' | upcoming/active/completed |
| created_at | TIMESTAMPTZ | | NOW() | |
| updated_at | TIMESTAMPTZ | | NOW() | Auto-updated |

**Indexes:** `created_by`, `status`, `is_public`, `join_code`  
**Triggers:** Auto-generates join_code for private leagues

---

### 3. league_members
**Purpose:** Track league membership and performance

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| id | UUID | PRIMARY KEY | auto | |
| league_id | UUID | FK→leagues.id, NOT NULL | | |
| user_id | UUID | FK→users.id, NOT NULL | | |
| joined_at | TIMESTAMPTZ | | NOW() | |
| current_value | DECIMAL | | 0 | Portfolio value |
| rank | INTEGER | | | Position in league |
| total_trades | INTEGER | | 0 | Trade count |

**Indexes:** `league_id`, `user_id`, `(league_id, rank)`  
**Constraints:** UNIQUE(league_id, user_id)  
**Triggers:** Auto-creates portfolio on insert

---

### 4. portfolios
**Purpose:** User portfolios within leagues

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| id | UUID | PRIMARY KEY | auto | |
| user_id | UUID | FK→users.id, NOT NULL | | |
| league_id | UUID | FK→leagues.id, NOT NULL | | |
| league_member_id | UUID | FK→league_members.id | | |
| cash_balance | DECIMAL | | 100000 | Available cash |
| total_value | DECIMAL | | 100000 | Cash + holdings |
| created_at | TIMESTAMPTZ | | NOW() | |
| updated_at | TIMESTAMPTZ | | NOW() | Auto-updated |

**Indexes:** `user_id`, `league_id`, `league_member_id`  
**Constraints:** UNIQUE(user_id, league_id)

---

### 5. holdings
**Purpose:** Current stock positions

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | |
| portfolio_id | UUID | FK→portfolios.id, NOT NULL | |
| stock_symbol | TEXT | NOT NULL | e.g., 'AAPL' |
| stock_name | TEXT | | e.g., 'Apple Inc.' |
| quantity | DECIMAL | NOT NULL | Shares owned |
| average_price | DECIMAL(12,2) | NOT NULL | Avg buy price |
| current_price | DECIMAL(12,2) | | Latest price |
| updated_at | TIMESTAMPTZ | | Auto-updated |

**Indexes:** `portfolio_id`, `stock_symbol`  
**Constraints:** UNIQUE(portfolio_id, stock_symbol)

---

### 6. transactions
**Purpose:** Buy/sell transaction history

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | |
| portfolio_id | UUID | FK→portfolios.id, NOT NULL | |
| stock_symbol | TEXT | NOT NULL | |
| stock_name | TEXT | | |
| transaction_type | TEXT | CHECK (buy/sell), NOT NULL | |
| quantity | DECIMAL | NOT NULL | |
| price | DECIMAL(12,2) | NOT NULL | Price per share |
| total_amount | DECIMAL(12,2) | NOT NULL | quantity × price |
| transaction_date | TIMESTAMPTZ | DEFAULT NOW() | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**Indexes:** `portfolio_id`, `stock_symbol`, `transaction_date`

---

## 👁️ Views (Unrestricted)

### league_stats
Aggregated league info with member counts and creator details.

**Key Columns:**
- All league columns +
- `creator_firebase_uid` (via JOIN)
- `creator_name` (via JOIN)
- `creator_email` (via JOIN)
- `member_count` (aggregated)
- `is_full` (calculated)

**Example Query:**
```sql
SELECT * FROM league_stats WHERE is_public = true AND status = 'active';
```

---

### user_league_memberships
User's league participations with performance.

**Key Columns:**
- All league_member columns +
- `firebase_uid` (via JOIN)
- `display_name` (via JOIN)
- `league_name`, `league_status`, `is_public`
- `cash_balance`, `portfolio_value`

**Example Query:**
```sql
SELECT * FROM user_league_memberships WHERE firebase_uid = 'abc123';
```

---

### portfolio_summary
Portfolio overview with holdings summary.

**Key Columns:**
- Portfolio details +
- User info (firebase_uid, display_name, email)
- `total_holdings` (count)
- `holdings_value` (sum)
- League info

---

## 🔧 Database Functions

### create_league(...)
Creates league and auto-joins creator.

**Parameters:**
```typescript
p_name: string (required)
p_description: string
p_created_by: UUID (required) // users.id, NOT firebase_uid!
p_is_public: boolean = false
p_max_players: number = 20
p_starting_cash: number = 100000
p_max_stocks: number = 15
p_trade_frequency: string = 'unlimited'
p_duration: string = 'ongoing'
p_start_date: timestamp = NOW()
p_allow_fractional: boolean = true
```

**Returns:** `{ success, message, league_id, join_code }`

---

### join_league(p_league_id, p_user_id)
Joins user to league with validation.

**Returns:** `{ success, message, member_id }`

---

### can_join_league(p_league_id, p_user_id)
Checks if user can join.

**Returns:** boolean

---

### update_league_rankings(p_league_id)
Updates member ranks based on portfolio values.

---

## 📝 TypeScript Types
```typescript
export interface User {
  id: string; // UUID
  firebase_uid: string;
  email: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface League {
  id: string;
  name: string;
  description?: string;
  created_by: string; // UUID - users.id
  is_public: boolean;
  join_code?: string;
  max_players: number;
  starting_cash: number;
  max_stocks_per_portfolio: number;
  trade_frequency: 'unlimited' | 'daily' | 'weekly';
  trade_limit?: number;
  duration: 'ongoing' | '1_week' | '1_month' | '3_months' | '6_months' | '1_year';
  start_date?: string;
  end_date?: string;
  allow_fractional: boolean;
  status: 'upcoming' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface LeagueMember {
  id: string;
  league_id: string;
  user_id: string; // UUID - users.id
  joined_at: string;
  current_value: number;
  rank?: number;
  total_trades: number;
}

export interface Portfolio {
  id: string;
  user_id: string;
  league_id: string;
  league_member_id: string;
  cash_balance: number;
  total_value: number;
  created_at: string;
  updated_at: string;
}

export interface Holding {
  id: string;
  portfolio_id: string;
  stock_symbol: string;
  stock_name?: string;
  quantity: number;
  average_price: number;
  current_price?: number;
  updated_at: string;
}

export interface Transaction {
  id: string;
  portfolio_id: string;
  stock_symbol: string;
  stock_name?: string;
  transaction_type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total_amount: number;
  transaction_date: string;
  created_at: string;
}

// View Types
export interface LeagueStats extends League {
  creator_firebase_uid: string;
  creator_name?: string;
  creator_email: string;
  member_count: number;
  is_full: boolean;
}

export interface UserLeagueMembership extends LeagueMember {
  firebase_uid: string;
  display_name?: string;
  email: string;
  league_name: string;
  league_status: League['status'];
  is_public: boolean;
  cash_balance?: number;
  portfolio_value?: number;
}

export interface PortfolioSummary {
  portfolio_id: string;
  user_id: string;
  firebase_uid: string;
  display_name?: string;
  email: string;
  league_id: string;
  cash_balance: number;
  total_value: number;
  total_holdings: number;
  holdings_value: number;
  league_name: string;
  starting_cash: number;
}
```

---

## 🚨 Common Mistakes to Avoid

### ❌ WRONG: Using firebase_uid directly
```javascript
// This will fail - these columns don't exist!
await supabase.from('leagues').insert({
  creator_firebase_uid: firebaseUid
});

await supabase.from('league_members').insert({
  firebase_uid: firebaseUid
});
```

### ✅ CORRECT: Get user.id first, then use it
```javascript
// Step 1: Get user UUID from firebase_uid
const { data: user } = await supabase
  .from('users')
  .select('id')
  .eq('firebase_uid', auth.currentUser.uid)
  .single();

// Step 2: Use user.id (UUID) for relationships
const { data } = await supabase.rpc('create_league', {
  p_name: 'My League',
  p_created_by: user.id // ✅ UUID, not firebase_uid
});
```

### ✅ CORRECT: Query with views
```javascript
// Views provide firebase_uid via JOIN
const { data } = await supabase
  .from('league_stats')
  .select('*')
  .eq('creator_firebase_uid', currentUserFirebaseUid);
```

---

## 📋 Common Query Patterns

### Get current user's ID:
```javascript
const { data: user } = await supabase
  .from('users')
  .select('id')
  .eq('firebase_uid', auth.currentUser.uid)
  .single();

const userId = user.id; // Use this for all FK relationships
```

### Get user's leagues:
```javascript
const { data } = await supabase
  .from('user_league_memberships')
  .select('*')
  .eq('firebase_uid', auth.currentUser.uid);
```

### Get public leagues:
```javascript
const { data } = await supabase
  .from('league_stats')
  .select('*')
  .eq('is_public', true)
  .order('created_at', { ascending: false });
```

### Create league:
```javascript
const { data } = await supabase.rpc('create_league', {
  p_name: 'Tech Titans',
  p_description: 'Trade tech stocks',
  p_created_by: userId, // users.id (UUID)
  p_is_public: true
});
```

### Join league:
```javascript
const { data } = await supabase.rpc('join_league', {
  p_league_id: leagueId,
  p_user_id: userId // users.id (UUID)
});
```

---