// Alpha Vantage API Service with Smart Caching
import { isMarketOpen } from '../utils/marketHours';

const API_KEY = process.env.REACT_APP_ALPHAVANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

// Dynamic cache duration based on market hours
const getDynamicCacheDuration = (): number => {
  if (isMarketOpen()) {
    return 15 * 60 * 1000; // 15 minutes during market hours
  } else {
    return 60 * 60 * 1000; // 1 hour after market hours
  }
};

const MAX_DAILY_CALLS = 25;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface Quote {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  volume: string;
  previousClose: string;
  open: string;
  high: string;
  low: string;
}

interface CompanyOverview {
  Symbol: string;
  Name: string;
  Description: string;
  Sector: string;
  Industry: string;
  MarketCapitalization: string;
  PERatio: string;
  DividendYield: string;
  EPS: string;
  '52WeekHigh': string;
  '52WeekLow': string;
  Beta: string;
}

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
}

export interface MarketMover {
  ticker: string;
  price: string;
  change_amount: string;
  change_percentage: string;
  volume: string;
}

export interface TopGainersLosers {
  top_gainers: MarketMover[];
  top_losers: MarketMover[];
  most_actively_traded: MarketMover[];
  last_updated: string;
}

// Cache Management
class CacheManager {
  private getCache<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(`av_cache_${key}`);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();
      const cacheDuration = getDynamicCacheDuration();

      // Check if cache is expired
      if (now - entry.timestamp > cacheDuration) {
        localStorage.removeItem(`av_cache_${key}`);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  private setCache<T>(key: string, data: T): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(`av_cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  get<T>(key: string): T | null {
    return this.getCache<T>(key);
  }

  set<T>(key: string, data: T): void {
    this.setCache(key, data);
  }

  clear(key: string): void {
    localStorage.removeItem(`av_cache_${key}`);
  }

  clearAll(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('av_cache_')) {
        localStorage.removeItem(key);
      }
    });
  }
}

// API Call Tracker
class APICallTracker {
  private getCallLog(): number[] {
    const log = localStorage.getItem('av_call_log');
    return log ? JSON.parse(log) : [];
  }

  private setCallLog(log: number[]): void {
    localStorage.setItem('av_call_log', JSON.stringify(log));
  }

  logCall(): void {
    const log = this.getCallLog();
    const now = Date.now();

    // Remove calls older than 24 hours
    const last24Hours = log.filter(timestamp => now - timestamp < 24 * 60 * 60 * 1000);
    last24Hours.push(now);

    this.setCallLog(last24Hours);
  }

  getCallCount(): number {
    const log = this.getCallLog();
    const now = Date.now();

    // Count calls in last 24 hours
    return log.filter(timestamp => now - timestamp < 24 * 60 * 60 * 1000).length;
  }

  canMakeCall(): boolean {
    return this.getCallCount() < MAX_DAILY_CALLS;
  }

  getRemainingCalls(): number {
    return Math.max(0, MAX_DAILY_CALLS - this.getCallCount());
  }

  reset(): void {
    localStorage.removeItem('av_call_log');
  }
}

const cache = new CacheManager();
const tracker = new APICallTracker();

// API Functions
export async function searchSymbol(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 1) return [];

  const cacheKey = `search_${query.toLowerCase()}`;
  const cached = cache.get<SearchResult[]>(cacheKey);
  if (cached) return cached;

  if (!tracker.canMakeCall()) {
    console.warn('API rate limit reached. Using cached data only.');
    return [];
  }

  try {
    const url = `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data['Error Message'] || data['Note']) {
      throw new Error(data['Error Message'] || 'API rate limit exceeded');
    }

    const results: SearchResult[] = (data.bestMatches || []).map((match: any) => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: match['3. type'],
      region: match['4. region'],
      currency: match['8. currency'],
    }));

    cache.set(cacheKey, results);
    tracker.logCall();

    return results;
  } catch (error) {
    console.error('Symbol search error:', error);
    throw error;
  }
}

export async function getQuote(symbol: string): Promise<Quote | null> {
  const cacheKey = `quote_${symbol}`;
  const cached = cache.get<Quote>(cacheKey);
  if (cached) return cached;

  if (!tracker.canMakeCall()) {
    console.warn(`API rate limit reached for ${symbol}. Using cached data only.`);
    return null;
  }

  try {
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data['Error Message'] || data['Note']) {
      throw new Error(data['Error Message'] || 'API rate limit exceeded');
    }

    const globalQuote = data['Global Quote'];
    if (!globalQuote || Object.keys(globalQuote).length === 0) {
      return null;
    }

    const quote: Quote = {
      symbol: globalQuote['01. symbol'],
      price: globalQuote['05. price'],
      change: globalQuote['09. change'],
      changePercent: globalQuote['10. change percent'],
      volume: globalQuote['06. volume'],
      previousClose: globalQuote['08. previous close'],
      open: globalQuote['02. open'],
      high: globalQuote['03. high'],
      low: globalQuote['04. low'],
    };

    cache.set(cacheKey, quote);
    tracker.logCall();

    return quote;
  } catch (error) {
    console.error(`Quote fetch error for ${symbol}:`, error);
    throw error;
  }
}

export async function getCompanyOverview(symbol: string): Promise<CompanyOverview | null> {
  const cacheKey = `overview_${symbol}`;
  const cached = cache.get<CompanyOverview>(cacheKey);
  if (cached) return cached;

  if (!tracker.canMakeCall()) {
    console.warn(`API rate limit reached for ${symbol}. Using cached data only.`);
    return null;
  }

  try {
    const url = `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data['Error Message'] || data['Note']) {
      throw new Error(data['Error Message'] || 'API rate limit exceeded');
    }

    if (!data.Symbol) {
      return null;
    }

    cache.set(cacheKey, data);
    tracker.logCall();

    return data;
  } catch (error) {
    console.error(`Company overview fetch error for ${symbol}:`, error);
    throw error;
  }
}

// Utility functions
export function getRemainingAPICalls(): number {
  return tracker.getRemainingCalls();
}

export function getAPICallCount(): number {
  return tracker.getCallCount();
}

export function clearCache(): void {
  cache.clearAll();
}

export function resetAPITracker(): void {
  tracker.reset();
}

// Batch fetch quotes for multiple symbols (sequential to avoid rate limiting)
export async function batchGetQuotes(symbols: string[]): Promise<Map<string, Quote>> {
  const quotes = new Map<string, Quote>();

  for (const symbol of symbols) {
    try {
      const quote = await getQuote(symbol);
      if (quote) {
        quotes.set(symbol, quote);
      }
      // Small delay between requests to be respectful to API
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Failed to fetch quote for ${symbol}:`, error);
    }
  }

  return quotes;
}

// Get top gainers, losers, and most actively traded (SINGLE API CALL)
export async function getTopGainersLosers(): Promise<TopGainersLosers | null> {
  const cacheKey = 'market_movers';
  const cached = cache.get<TopGainersLosers>(cacheKey);
  if (cached) {
    console.log('📊 Using cached market movers data');
    return cached;
  }

  if (!tracker.canMakeCall()) {
    console.warn('API rate limit reached. Using cached data only.');
    return null;
  }

  try {
    const url = `${BASE_URL}?function=TOP_GAINERS_LOSERS&apikey=${API_KEY}`;
    console.log('📊 Fetching fresh market movers data...');

    const response = await fetch(url);
    const data = await response.json();

    if (data['Error Message'] || data['Note']) {
      throw new Error(data['Error Message'] || 'API rate limit exceeded');
    }

    if (!data.top_gainers && !data.most_actively_traded) {
      console.error('Unexpected response format:', data);
      return null;
    }

    const result: TopGainersLosers = {
      top_gainers: data.top_gainers || [],
      top_losers: data.top_losers || [],
      most_actively_traded: data.most_actively_traded || [],
      last_updated: data.last_updated || new Date().toISOString(),
    };

    cache.set(cacheKey, result);
    tracker.logCall();

    console.log('✅ Market movers data cached for 1 hour');
    return result;
  } catch (error) {
    console.error('Market movers fetch error:', error);
    throw error;
  }
}
