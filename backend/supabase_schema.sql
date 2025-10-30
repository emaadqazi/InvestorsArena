-- Supabase Database Schema for InvestorsArena

-- Create users table to store user profiles
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on firebase_uid for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);

-- Create leagues table for stock market leagues
CREATE TABLE IF NOT EXISTS leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create portfolios table for user portfolios within leagues
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, league_id)
);

-- Create transactions table for stock purchases/sales
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  stock_symbol TEXT NOT NULL,
  stock_name TEXT,
  transaction_type TEXT NOT NULL, -- 'buy' or 'sell'
  quantity INTEGER NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_league_id ON portfolios(league_id);
CREATE INDEX IF NOT EXISTS idx_transactions_portfolio_id ON transactions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stock_symbol ON transactions(stock_symbol);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
-- Users can only see and update their own data
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.jwt() ->> 'firebase_uid'::text = firebase_uid);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.jwt() ->> 'firebase_uid'::text = firebase_uid);

-- Create policies for leagues table
-- Anyone can view leagues, only owners can edit
CREATE POLICY "Anyone can view leagues"
  ON leagues FOR SELECT
  USING (true);

CREATE POLICY "Owners can update their leagues"
  ON leagues FOR UPDATE
  USING (created_by IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'firebase_uid'));

-- Note: For now, policies are basic. We'll implement proper Firebase JWT verification
-- in the backend. For development, you may need to temporarily disable RLS

