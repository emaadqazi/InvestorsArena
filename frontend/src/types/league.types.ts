// ============================================
// LEAGUE SYSTEM - TYPE DEFINITIONS
// ============================================

export type LeagueStatus = 'upcoming' | 'active' | 'completed';
export type TradeFrequency = 'unlimited' | 'daily' | 'weekly';
export type LeagueDuration = 'ongoing' | '1_week' | '1_month' | '3_months' | '6_months' | '1_year';

// Database table types
export interface League {
  id: string;
  name: string;
  description: string | null;
  creator_firebase_uid: string;
  is_public: boolean;
  join_code: string | null;
  max_players: number;
  starting_cash: number;
  max_stocks_per_portfolio: number;
  trade_frequency: TradeFrequency;
  trade_limit: number | null;
  duration: LeagueDuration;
  start_date: string | null;
  end_date: string | null;
  allow_fractional: boolean;
  status: LeagueStatus;
  created_at: string;
  updated_at: string;
}

export interface LeagueMember {
  id: string;
  league_id: string;
  firebase_uid: string;
  joined_at: string;
  current_value: number;
  rank: number | null;
  total_trades: number;
}

// Extended types with computed fields
export interface LeagueWithStats extends League {
  member_count: number;
  is_full?: boolean;
  is_member?: boolean;
  is_creator?: boolean;
  creator_name?: string;
}

export interface LeagueMemberWithUser extends LeagueMember {
  user_email?: string;
  user_name?: string;
}

// Form data types
export interface CreateLeagueFormData {
  // Step 1: Basic Info
  name: string;
  description: string;
  is_public: boolean;

  // Step 2: Rules Configuration
  max_players: number;
  starting_cash: number;
  max_stocks_per_portfolio: number;
  trade_frequency: TradeFrequency;
  trade_limit: number | null;
  duration: LeagueDuration;
  start_date: string | null;
  allow_fractional: boolean;
}

export interface JoinLeagueFormData {
  join_code: string;
}

// API Response types
export interface LeagueApiResponse {
  data: League | null;
  error: Error | null;
}

export interface LeaguesApiResponse {
  data: LeagueWithStats[] | null;
  error: Error | null;
}

export interface LeagueMemberApiResponse {
  data: LeagueMember | null;
  error: Error | null;
}

export interface LeagueMembersApiResponse {
  data: LeagueMemberWithUser[] | null;
  error: Error | null;
}

// Validation error types
export interface ValidationError {
  field: keyof CreateLeagueFormData;
  message: string;
}

// Filter and sort types
export interface LeagueFilters {
  status?: LeagueStatus[];
  is_public?: boolean;
  search?: string;
  min_members?: number;
  max_members?: number;
}

export type LeagueSortBy = 'newest' | 'oldest' | 'most_members' | 'least_members' | 'starting_soon';

// Constants
export const LEAGUE_CONSTANTS = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 50,
  DEFAULT_PLAYERS: 20,

  MIN_STARTING_CASH: 10000,
  MAX_STARTING_CASH: 1000000,
  DEFAULT_STARTING_CASH: 100000,

  MIN_STOCKS: 5,
  MAX_STOCKS: 50,
  DEFAULT_STOCKS: 15,

  MIN_TRADE_LIMIT_DAILY: 1,
  MAX_TRADE_LIMIT_DAILY: 10,

  MIN_TRADE_LIMIT_WEEKLY: 1,
  MAX_TRADE_LIMIT_WEEKLY: 50,

  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 200,

  JOIN_CODE_LENGTH: 8,
} as const;

export const DURATION_LABELS: Record<LeagueDuration, string> = {
  ongoing: 'Ongoing',
  '1_week': '1 Week',
  '1_month': '1 Month',
  '3_months': '3 Months',
  '6_months': '6 Months',
  '1_year': '1 Year',
};

export const TRADE_FREQUENCY_LABELS: Record<TradeFrequency, string> = {
  unlimited: 'Unlimited',
  daily: 'Daily Limit',
  weekly: 'Weekly Limit',
};

export const STATUS_CONFIG = {
  active: {
    label: 'Active',
    color: 'bg-green-600',
    textColor: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  upcoming: {
    label: 'Upcoming',
    color: 'bg-yellow-600',
    textColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  completed: {
    label: 'Completed',
    color: 'bg-gray-600',
    textColor: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
} as const;
