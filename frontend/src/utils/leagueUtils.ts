// ============================================
// LEAGUE UTILITY FUNCTIONS
// ============================================

import {
  CreateLeagueFormData,
  ValidationError,
  LEAGUE_CONSTANTS,
  LeagueDuration,
  LeagueWithStats,
  LeagueSortBy,
  LeagueFilters,
} from '../types/league.types';

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validates league creation form data
 * @param data Form data to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateLeagueForm(data: Partial<CreateLeagueFormData>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate name
  if (!data.name || data.name.trim().length < LEAGUE_CONSTANTS.NAME_MIN_LENGTH) {
    errors.push({
      field: 'name',
      message: `League name must be at least ${LEAGUE_CONSTANTS.NAME_MIN_LENGTH} characters`,
    });
  }

  if (data.name && data.name.length > LEAGUE_CONSTANTS.NAME_MAX_LENGTH) {
    errors.push({
      field: 'name',
      message: `League name cannot exceed ${LEAGUE_CONSTANTS.NAME_MAX_LENGTH} characters`,
    });
  }

  // Validate description
  if (data.description && data.description.length > LEAGUE_CONSTANTS.DESCRIPTION_MAX_LENGTH) {
    errors.push({
      field: 'description',
      message: `Description cannot exceed ${LEAGUE_CONSTANTS.DESCRIPTION_MAX_LENGTH} characters`,
    });
  }

  // Validate max_players
  if (
    data.max_players !== undefined &&
    (data.max_players < LEAGUE_CONSTANTS.MIN_PLAYERS || data.max_players > LEAGUE_CONSTANTS.MAX_PLAYERS)
  ) {
    errors.push({
      field: 'max_players',
      message: `Max players must be between ${LEAGUE_CONSTANTS.MIN_PLAYERS} and ${LEAGUE_CONSTANTS.MAX_PLAYERS}`,
    });
  }

  // Validate starting_cash
  if (
    data.starting_cash !== undefined &&
    (data.starting_cash < LEAGUE_CONSTANTS.MIN_STARTING_CASH ||
      data.starting_cash > LEAGUE_CONSTANTS.MAX_STARTING_CASH)
  ) {
    errors.push({
      field: 'starting_cash',
      message: `Starting cash must be between $${LEAGUE_CONSTANTS.MIN_STARTING_CASH.toLocaleString()} and $${LEAGUE_CONSTANTS.MAX_STARTING_CASH.toLocaleString()}`,
    });
  }

  // Validate max_stocks_per_portfolio
  if (
    data.max_stocks_per_portfolio !== undefined &&
    (data.max_stocks_per_portfolio < LEAGUE_CONSTANTS.MIN_STOCKS ||
      data.max_stocks_per_portfolio > LEAGUE_CONSTANTS.MAX_STOCKS)
  ) {
    errors.push({
      field: 'max_stocks_per_portfolio',
      message: `Max stocks must be between ${LEAGUE_CONSTANTS.MIN_STOCKS} and ${LEAGUE_CONSTANTS.MAX_STOCKS}`,
    });
  }

  // Validate trade_limit based on frequency
  if (data.trade_frequency === 'daily' && data.trade_limit) {
    if (
      data.trade_limit < LEAGUE_CONSTANTS.MIN_TRADE_LIMIT_DAILY ||
      data.trade_limit > LEAGUE_CONSTANTS.MAX_TRADE_LIMIT_DAILY
    ) {
      errors.push({
        field: 'trade_limit',
        message: `Daily trade limit must be between ${LEAGUE_CONSTANTS.MIN_TRADE_LIMIT_DAILY} and ${LEAGUE_CONSTANTS.MAX_TRADE_LIMIT_DAILY}`,
      });
    }
  }

  if (data.trade_frequency === 'weekly' && data.trade_limit) {
    if (
      data.trade_limit < LEAGUE_CONSTANTS.MIN_TRADE_LIMIT_WEEKLY ||
      data.trade_limit > LEAGUE_CONSTANTS.MAX_TRADE_LIMIT_WEEKLY
    ) {
      errors.push({
        field: 'trade_limit',
        message: `Weekly trade limit must be between ${LEAGUE_CONSTANTS.MIN_TRADE_LIMIT_WEEKLY} and ${LEAGUE_CONSTANTS.MAX_TRADE_LIMIT_WEEKLY}`,
      });
    }
  }

  // Validate start_date
  if (data.start_date) {
    const startDate = new Date(data.start_date);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset time to start of day

    if (startDate < now) {
      errors.push({
        field: 'start_date',
        message: 'Start date cannot be in the past',
      });
    }
  }

  return errors;
}

/**
 * Validates a join code format
 * @param code Join code to validate
 * @returns True if valid, false otherwise
 */
export function validateJoinCode(code: string): boolean {
  if (!code || code.length !== LEAGUE_CONSTANTS.JOIN_CODE_LENGTH) {
    return false;
  }

  // Should only contain uppercase letters and numbers
  return /^[A-Z0-9]+$/.test(code);
}

// ============================================
// DATE/TIME HELPER FUNCTIONS
// ============================================

/**
 * Calculates end date based on duration and start date
 * @param startDate Start date of the league
 * @param duration Duration of the league
 * @returns End date or null for ongoing leagues
 */
export function calculateEndDate(startDate: Date, duration: LeagueDuration): Date | null {
  if (duration === 'ongoing') {
    return null;
  }

  const endDate = new Date(startDate);

  switch (duration) {
    case '1_week':
      endDate.setDate(endDate.getDate() + 7);
      break;
    case '1_month':
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case '3_months':
      endDate.setMonth(endDate.getMonth() + 3);
      break;
    case '6_months':
      endDate.setMonth(endDate.getMonth() + 6);
      break;
    case '1_year':
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
  }

  return endDate;
}

/**
 * Formats a date for display
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return 'Not set';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Gets time remaining until a date
 * @param dateString ISO date string
 * @returns Human-readable time remaining
 */
export function getTimeRemaining(dateString: string | null): string {
  if (!dateString) return 'No end date';

  const now = new Date();
  const end = new Date(dateString);
  const diff = end.getTime() - now.getTime();

  if (diff < 0) return 'Ended';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''} remaining`;
  }

  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} remaining`;
  }

  return 'Less than 1 hour remaining';
}

// ============================================
// FORMATTING FUNCTIONS
// ============================================

/**
 * Formats currency values
 * @param value Currency value
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats join code with separators for readability
 * @param code Join code
 * @returns Formatted join code (e.g., "ABCD-EFGH")
 */
export function formatJoinCode(code: string): string {
  if (code.length !== LEAGUE_CONSTANTS.JOIN_CODE_LENGTH) {
    return code;
  }

  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

/**
 * Removes formatting from join code
 * @param code Formatted join code
 * @returns Clean join code
 */
export function cleanJoinCode(code: string): string {
  return code.replace(/[^A-Z0-9]/g, '').toUpperCase();
}

// ============================================
// SORTING AND FILTERING FUNCTIONS
// ============================================

/**
 * Sorts leagues based on sort criteria
 * @param leagues Array of leagues to sort
 * @param sortBy Sort criteria
 * @returns Sorted array of leagues
 */
export function sortLeagues(leagues: LeagueWithStats[], sortBy: LeagueSortBy): LeagueWithStats[] {
  const sorted = [...leagues];

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    case 'oldest':
      return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    case 'most_members':
      return sorted.sort((a, b) => b.member_count - a.member_count);

    case 'least_members':
      return sorted.sort((a, b) => a.member_count - b.member_count);

    case 'starting_soon':
      return sorted.sort((a, b) => {
        if (!a.start_date) return 1;
        if (!b.start_date) return -1;
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      });

    default:
      return sorted;
  }
}

/**
 * Filters leagues based on filter criteria
 * @param leagues Array of leagues to filter
 * @param filters Filter criteria
 * @returns Filtered array of leagues
 */
export function filterLeagues(leagues: LeagueWithStats[], filters: LeagueFilters): LeagueWithStats[] {
  let filtered = [...leagues];

  // Filter by status
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter((league) => filters.status!.includes(league.status));
  }

  // Filter by public/private
  if (filters.is_public !== undefined) {
    filtered = filtered.filter((league) => league.is_public === filters.is_public);
  }

  // Filter by search query
  if (filters.search && filters.search.trim().length > 0) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (league) =>
        league.name.toLowerCase().includes(searchLower) ||
        league.description?.toLowerCase().includes(searchLower) ||
        league.creator_name?.toLowerCase().includes(searchLower)
    );
  }

  // Filter by member count
  if (filters.min_members !== undefined) {
    filtered = filtered.filter((league) => league.member_count >= filters.min_members!);
  }

  if (filters.max_members !== undefined) {
    filtered = filtered.filter((league) => league.member_count <= filters.max_members!);
  }

  return filtered;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generates a shareable league URL
 * @param joinCode Join code for the league
 * @returns Shareable URL
 */
export function generateShareableUrl(joinCode: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/join/${joinCode}`;
}

/**
 * Copies text to clipboard
 * @param text Text to copy
 * @returns Promise that resolves when text is copied
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Generates a QR code URL for a league join code
 * @param joinCode Join code
 * @returns URL to QR code image
 */
export function generateQRCodeUrl(joinCode: string): string {
  const url = generateShareableUrl(joinCode);
  // Using a free QR code API
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
}

/**
 * Checks if a league is joinable
 * @param league League to check
 * @returns True if league can be joined
 */
export function isLeagueJoinable(league: LeagueWithStats): boolean {
  return (
    league.status !== 'completed' &&
    league.member_count < league.max_players &&
    !league.is_member
  );
}

/**
 * Gets default form values for league creation
 * @returns Default form values
 */
export function getDefaultLeagueFormValues(): CreateLeagueFormData {
  return {
    name: '',
    description: '',
    is_public: true,
    max_players: LEAGUE_CONSTANTS.DEFAULT_PLAYERS,
    starting_cash: LEAGUE_CONSTANTS.DEFAULT_STARTING_CASH,
    max_stocks_per_portfolio: LEAGUE_CONSTANTS.DEFAULT_STOCKS,
    trade_frequency: 'unlimited',
    trade_limit: null,
    duration: 'ongoing',
    start_date: null,
    allow_fractional: true,
  };
}
