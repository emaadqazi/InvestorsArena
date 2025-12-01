// ============================================
// MARKET HOURS UTILITY
// ============================================

/**
 * Check if the US stock market is currently open
 * Market hours: 9:30 AM - 4:00 PM Eastern Time, Monday-Friday
 * Does not account for holidays
 */
export function isMarketOpen(): boolean {
  const now = new Date();
  
  // Convert to Eastern Time
  const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  
  const day = estTime.getDay(); // 0 = Sunday, 6 = Saturday
  const hours = estTime.getHours();
  const minutes = estTime.getMinutes();
  const currentMinutes = hours * 60 + minutes;
  
  // Market hours: 9:30 AM (570 minutes) to 4:00 PM (960 minutes)
  const marketOpen = 9 * 60 + 30; // 9:30 AM in minutes
  const marketClose = 16 * 60; // 4:00 PM in minutes
  
  // Check if it's a weekday (Monday = 1, Friday = 5) and within market hours
  const isWeekday = day >= 1 && day <= 5;
  const isDuringMarketHours = currentMinutes >= marketOpen && currentMinutes < marketClose;
  
  return isWeekday && isDuringMarketHours;
}

/**
 * Get the current Eastern Time as a formatted string
 */
export function getCurrentEasternTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { 
    timeZone: 'America/New_York',
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

/**
 * Get market status info
 */
export interface MarketStatus {
  isOpen: boolean;
  currentTime: string;
  nextOpenTime: string | null;
  message: string;
}

export function getMarketStatus(): MarketStatus {
  const now = new Date();
  const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  
  const day = estTime.getDay();
  const hours = estTime.getHours();
  const minutes = estTime.getMinutes();
  const currentMinutes = hours * 60 + minutes;
  
  const marketOpen = 9 * 60 + 30;
  const marketClose = 16 * 60;
  
  const isWeekday = day >= 1 && day <= 5;
  const isDuringMarketHours = currentMinutes >= marketOpen && currentMinutes < marketClose;
  const isOpen = isWeekday && isDuringMarketHours;
  
  const currentTime = estTime.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  let nextOpenTime: string | null = null;
  let message = '';
  
  if (isOpen) {
    message = 'Market is open for trading';
    const minutesUntilClose = marketClose - currentMinutes;
    const hoursRemaining = Math.floor(minutesUntilClose / 60);
    const minsRemaining = minutesUntilClose % 60;
    message += ` (closes in ${hoursRemaining}h ${minsRemaining}m)`;
  } else {
    if (isWeekday && currentMinutes < marketOpen) {
      // Before market open today
      nextOpenTime = '9:30 AM ET today';
      message = 'Market opens at 9:30 AM ET';
    } else if (day === 0) {
      // Sunday
      nextOpenTime = '9:30 AM ET Monday';
      message = 'Market opens Monday at 9:30 AM ET';
    } else if (day === 6) {
      // Saturday
      nextOpenTime = '9:30 AM ET Monday';
      message = 'Market opens Monday at 9:30 AM ET';
    } else if (day === 5 && currentMinutes >= marketClose) {
      // Friday after market close
      nextOpenTime = '9:30 AM ET Monday';
      message = 'Market opens Monday at 9:30 AM ET';
    } else {
      // Weekday after market close
      nextOpenTime = '9:30 AM ET tomorrow';
      message = 'Market opens tomorrow at 9:30 AM ET';
    }
  }
  
  return {
    isOpen,
    currentTime,
    nextOpenTime,
    message,
  };
}

/**
 * US Market holidays (approximate - should be updated yearly)
 * Returns true if the given date is a market holiday
 */
export function isMarketHoliday(date: Date = new Date()): boolean {
  const month = date.getMonth(); // 0-indexed
  const day = date.getDate();
  
  // Major US market holidays (approximate dates)
  const holidays = [
    // New Year's Day (or observed)
    { month: 0, day: 1 },
    // MLK Day (3rd Monday of January) - simplified check
    // Presidents Day (3rd Monday of February) - simplified check
    // Good Friday (varies) - not included, requires complex calculation
    // Memorial Day (last Monday of May) - simplified check
    // Independence Day
    { month: 6, day: 4 },
    // Labor Day (1st Monday of September) - simplified check
    // Thanksgiving Day (4th Thursday of November) - simplified check
    // Christmas Day
    { month: 11, day: 25 },
  ];
  
  return holidays.some(h => h.month === month && h.day === day);
}

/**
 * Format time until market opens
 */
export function getTimeUntilMarketOpen(): string {
  const status = getMarketStatus();
  if (status.isOpen) {
    return 'Market is currently open';
  }
  return status.message;
}
