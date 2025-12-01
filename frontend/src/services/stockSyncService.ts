// ============================================
// STOCK SYNC SERVICE
// Syncs stock prices from Alpha Vantage to Supabase
// ============================================

import { supabase } from './supabase';
import { getQuote, getCompanyOverview } from './alphaVantage';

interface SyncResult {
  success: boolean;
  symbol: string;
  message: string;
  price?: number;
}

/**
 * Sync a single stock's price from Alpha Vantage to the database
 */
export async function syncStockPrice(symbol: string): Promise<SyncResult> {
  try {
    const quote = await getQuote(symbol);
    
    if (!quote || !quote.price) {
      return {
        success: false,
        symbol,
        message: 'Failed to fetch quote from Alpha Vantage',
      };
    }

    const price = parseFloat(quote.price);
    const change = quote.change ? parseFloat(quote.change) : null;
    const changePercent = quote.changePercent 
      ? parseFloat(quote.changePercent.replace('%', '')) 
      : null;

    // Update stock in database
    const { error } = await supabase
      .from('stocks')
      .update({
        current_price: price,
        daily_change: change,
        daily_change_percent: changePercent,
        updated_at: new Date().toISOString(),
      })
      .eq('symbol', symbol);

    if (error) {
      console.error(`Error updating ${symbol} in database:`, error);
      return {
        success: false,
        symbol,
        message: `Database update failed: ${error.message}`,
      };
    }

    return {
      success: true,
      symbol,
      message: 'Price synced successfully',
      price,
    };
  } catch (err: any) {
    console.error(`Error syncing ${symbol}:`, err);
    return {
      success: false,
      symbol,
      message: err.message || 'Unknown error',
    };
  }
}

/**
 * Sync a stock from Alpha Vantage - creates if not exists, updates if exists
 */
export async function syncOrCreateStock(
  symbol: string,
  name: string,
  price?: number,
  marketCap?: string
): Promise<{ stockId: string | null; error: any }> {
  try {
    // Check if stock exists
    const { data: existingStock } = await supabase
      .from('stocks')
      .select('id')
      .eq('symbol', symbol.toUpperCase())
      .single();

    if (existingStock) {
      // Update existing stock
      if (price) {
        await supabase
          .from('stocks')
          .update({
            current_price: price,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingStock.id);
      }
      return { stockId: existingStock.id, error: null };
    }

    // Determine market cap tier
    let marketCapTier: 'Large-Cap' | 'Mid-Cap' | 'Small-Cap' | null = null;
    if (marketCap) {
      const value = parseFloat(marketCap);
      if (!isNaN(value)) {
        if (value >= 10_000_000_000) marketCapTier = 'Large-Cap';
        else if (value >= 2_000_000_000) marketCapTier = 'Mid-Cap';
        else marketCapTier = 'Small-Cap';
      }
    }

    // Create new stock
    const { data: newStock, error: insertError } = await supabase
      .from('stocks')
      .insert({
        symbol: symbol.toUpperCase(),
        name,
        current_price: price || 0,
        market_cap_tier: marketCapTier,
      })
      .select('id')
      .single();

    if (insertError) {
      return { stockId: null, error: insertError };
    }

    return { stockId: newStock.id, error: null };
  } catch (err: any) {
    console.error('Error syncing/creating stock:', err);
    return { stockId: null, error: err };
  }
}

/**
 * Sync multiple stocks' prices (with rate limiting for Alpha Vantage API)
 * Alpha Vantage free tier: 5 calls per minute, 500 per day
 */
export async function syncMultipleStocks(
  symbols: string[],
  delayMs: number = 12000 // 12 seconds between calls to stay under 5/min limit
): Promise<SyncResult[]> {
  const results: SyncResult[] = [];

  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    console.log(`Syncing ${symbol} (${i + 1}/${symbols.length})...`);
    
    const result = await syncStockPrice(symbol);
    results.push(result);

    // Add delay between API calls (except for the last one)
    if (i < symbols.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * Get all unique stock symbols from portfolio holdings
 */
export async function getPortfolioStockSymbols(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('portfolio_holdings')
      .select(`
        stock_id,
        stocks:stock_id (symbol)
      `)
      .gt('quantity', 0);

    if (error) throw error;

    // Extract unique symbols
    const symbolsSet = new Set<string>();
    (data || []).forEach((holding: any) => {
      if (holding.stocks?.symbol) {
        symbolsSet.add(holding.stocks.symbol);
      }
    });

    return Array.from(symbolsSet);
  } catch (err: any) {
    console.error('Error fetching portfolio symbols:', err);
    return [];
  }
}

/**
 * Sync all stocks currently in user portfolios
 * Use this sparingly due to API rate limits!
 */
export async function syncAllPortfolioStocks(): Promise<{
  total: number;
  successful: number;
  failed: number;
  results: SyncResult[];
}> {
  const symbols = await getPortfolioStockSymbols();
  console.log(`Found ${symbols.length} unique stocks in portfolios`);

  if (symbols.length === 0) {
    return { total: 0, successful: 0, failed: 0, results: [] };
  }

  const results = await syncMultipleStocks(symbols);
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return {
    total: symbols.length,
    successful,
    failed,
    results,
  };
}

/**
 * Sync stock with full company data from Alpha Vantage
 */
export async function syncStockWithOverview(symbol: string): Promise<{
  success: boolean;
  message: string;
  stockId?: string;
}> {
  try {
    // Fetch quote and overview in parallel
    const [quote, overview] = await Promise.all([
      getQuote(symbol),
      getCompanyOverview(symbol),
    ]);

    if (!quote && !overview) {
      return {
        success: false,
        message: 'Failed to fetch data from Alpha Vantage',
      };
    }

    const price = quote?.price ? parseFloat(quote.price) : 0;
    const change = quote?.change ? parseFloat(quote.change) : null;
    const changePercent = quote?.changePercent 
      ? parseFloat(quote.changePercent.replace('%', '')) 
      : null;
    const name = overview?.Name || symbol;
    const sector = overview?.Sector || null;
    const marketCap = overview?.MarketCapitalization 
      ? parseFloat(overview.MarketCapitalization) 
      : null;

    // Determine market cap tier
    let marketCapTier: 'Large-Cap' | 'Mid-Cap' | 'Small-Cap' | null = null;
    if (marketCap) {
      if (marketCap >= 10_000_000_000) marketCapTier = 'Large-Cap';
      else if (marketCap >= 2_000_000_000) marketCapTier = 'Mid-Cap';
      else marketCapTier = 'Small-Cap';
    }

    // Map Alpha Vantage sector to our sector tags
    let sectorTag: string | null = null;
    if (sector) {
      const sectorLower = sector.toLowerCase();
      if (sectorLower.includes('technology') || sectorLower.includes('information')) {
        sectorTag = 'Technology';
      } else if (sectorLower.includes('health') || sectorLower.includes('pharma')) {
        sectorTag = 'Healthcare';
      } else if (sectorLower.includes('financ') || sectorLower.includes('bank')) {
        sectorTag = 'Finance';
      } else if (sectorLower.includes('energy') || sectorLower.includes('oil')) {
        sectorTag = 'Energy';
      } else if (sectorLower.includes('consumer') || sectorLower.includes('retail')) {
        sectorTag = 'Consumer';
      } else if (sectorLower.includes('industrial') || sectorLower.includes('manufacturing')) {
        sectorTag = 'Industrial';
      } else {
        sectorTag = 'Other';
      }
    }

    // Upsert stock
    const { data, error } = await supabase
      .from('stocks')
      .upsert({
        symbol: symbol.toUpperCase(),
        name,
        current_price: price,
        daily_change: change,
        daily_change_percent: changePercent,
        market_cap_tier: marketCapTier,
        sector_tag: sectorTag,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'symbol' })
      .select('id')
      .single();

    if (error) {
      return {
        success: false,
        message: `Database error: ${error.message}`,
      };
    }

    return {
      success: true,
      message: `Synced ${symbol} successfully`,
      stockId: data.id,
    };
  } catch (err: any) {
    console.error(`Error syncing ${symbol}:`, err);
    return {
      success: false,
      message: err.message || 'Unknown error',
    };
  }
}
