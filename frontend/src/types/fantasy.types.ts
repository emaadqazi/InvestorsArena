// ============================================
// FANTASY PORTFOLIO TYPES
// ============================================

export interface LeagueSlot {
  id: string;
  league_id: string;
  slot_name: string;
  max_count: number;
  constraint_type: 'sector' | 'market_cap' | 'wildcard';
  constraint_value: string | null;
  display_order: number;
  description: string | null;
  created_at: string;
}

export interface SlotWithUsage extends LeagueSlot {
  current_count: number;
  slots_remaining: number;
  is_full: boolean;
}

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  sector_tag: string | null;
  market_cap_tier: string | null;
  daily_change: number | null;
  daily_change_percent: number | null;
}

export interface PortfolioHolding {
  id: string;
  user_id: string;
  league_id: string;
  stock_id: string;
  slot_name: string;
  quantity: number;
  purchase_price: number;
  purchased_at: string;
  updated_at: string | null;

  // Joined data
  stock?: Stock;
  current_value?: number;
  profit_loss?: number;
  profit_loss_percent?: number;
}

export interface AddStockRequest {
  league_id: string;
  user_id: string;
  stock_id: string;
  slot_name: string;
  quantity: number;
}

export interface AddStockResponse {
  success: boolean;
  message: string;
  data?: {
    stock_symbol: string;
    slot_name: string;
    quantity: number;
    cost: number;
    remaining_cash: number;
  };
}

export interface RemoveStockResponse {
  success: boolean;
  message: string;
  data?: {
    refund_amount: number;
  };
}

export interface UserLeagueMember {
  id: string;
  league_id: string;
  user_id: string;
  current_cash: number;
  portfolio_value: number;
  total_value: number;
  rank: number | null;
  joined_at: string;

  // Joined league data
  league?: {
    id: string;
    name: string;
    is_public: boolean;
    starting_cash: number;
    max_stocks_per_portfolio: number;
  };
}

export type MarketCapTier = 'Large-Cap' | 'Mid-Cap' | 'Small-Cap';
export type SectorTag = 'Technology' | 'Healthcare' | 'Finance' | 'Energy' | 'Consumer' | 'Industrial' | 'Other';

export const MARKET_CAP_LABELS: Record<MarketCapTier, string> = {
  'Large-Cap': 'Large Cap (>$10B)',
  'Mid-Cap': 'Mid Cap ($2B-$10B)',
  'Small-Cap': 'Small Cap (<$2B)',
};

export const SECTOR_LABELS: Record<SectorTag, string> = {
  Technology: 'Technology',
  Healthcare: 'Healthcare',
  Finance: 'Finance',
  Energy: 'Energy',
  Consumer: 'Consumer Goods',
  Industrial: 'Industrial',
  Other: 'Other',
};
