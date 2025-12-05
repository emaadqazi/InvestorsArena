/**
 * Market Cap Classification Utilities
 * Shared functions for consistently classifying stocks by market cap across the application
 */

export interface MarketCapTier {
  tier: 'Large-Cap' | 'Mid-Cap' | 'Small-Cap';
  color: string;
  bg: string;
}

/**
 * Parse market cap value from Alpha Vantage format
 * Handles formats like: "10.5B", "2.3M", "500.2K", "1000000000"
 */
export function parseMarketCap(marketCap: string | undefined): number | null {
  if (!marketCap) return null;
  
  const cleanValue = marketCap.toString().toUpperCase().trim();
  
  // Handle Alpha Vantage abbreviated format: "10.5B", "2.3M", "500.2K", etc.
  const match = cleanValue.match(/^([0-9.]+)([BMK]?)$/);
  if (!match) {
    // Try parsing as plain number
    const value = parseFloat(cleanValue);
    if (isNaN(value)) return null;
    return value;
  }
  
  const [, numberStr, multiplier] = match;
  let value = parseFloat(numberStr);
  
  // Apply multiplier
  switch (multiplier) {
    case 'B': // Billions
      value *= 1_000_000_000;
      break;
    case 'M': // Millions  
      value *= 1_000_000;
      break;
    case 'K': // Thousands
      value *= 1_000;
      break;
    // No multiplier means the value is already in actual amount
  }
  
  return value;
}

/**
 * Classify market cap into tier with styling information
 */
export function getMarketCapTier(marketCap: string | undefined): MarketCapTier | null {
  const value = parseMarketCap(marketCap);
  if (value === null) return null;
  
  // Standard market cap classifications
  if (value >= 10_000_000_000) {
    return { 
      tier: 'Large-Cap', 
      color: 'text-blue-700', 
      bg: 'bg-blue-100' 
    };
  }
  
  if (value >= 2_000_000_000) {
    return { 
      tier: 'Mid-Cap', 
      color: 'text-emerald-700', 
      bg: 'bg-emerald-100' 
    };
  }
  
  return { 
    tier: 'Small-Cap', 
    color: 'text-orange-700', 
    bg: 'bg-orange-100' 
  };
}

/**
 * Get just the tier string for database storage
 */
export function getMarketCapTierString(marketCap: string | undefined): 'Large-Cap' | 'Mid-Cap' | 'Small-Cap' | null {
  const tierInfo = getMarketCapTier(marketCap);
  return tierInfo ? tierInfo.tier : null;
}

/**
 * Format market cap value for display
 */
export function formatMarketCap(marketCap: string | undefined): string {
  const value = parseMarketCap(marketCap);
  if (value === null) return 'N/A';
  
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  
  return `$${value.toFixed(0)}`;
}

/**
 * Estimate market cap tier from volume (for market movers without market cap data)
 */
export function estimateCapTierFromVolume(volume: string): MarketCapTier {
  const vol = parseInt(volume);
  
  // Use volume as a rough heuristic (high volume stocks tend to be larger)
  if (vol >= 50_000_000) {
    return { 
      tier: 'Large-Cap', 
      color: 'text-blue-700', 
      bg: 'bg-blue-100' 
    };
  }
  
  if (vol >= 10_000_000) {
    return { 
      tier: 'Mid-Cap', 
      color: 'text-emerald-700', 
      bg: 'bg-emerald-100' 
    };
  }
  
  return { 
    tier: 'Small-Cap', 
    color: 'text-orange-700', 
    bg: 'bg-orange-100' 
  };
}