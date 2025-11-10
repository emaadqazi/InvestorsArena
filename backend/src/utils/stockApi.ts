// Use dynamic import for yahoo-finance2 to avoid ESM/CommonJS issues at startup
let yahooFinance: any = null;

const getYahooFinance = async () => {
  if (!yahooFinance) {
    yahooFinance = (await import('yahoo-finance2')).default;
  }
  return yahooFinance;
};

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export const getStockQuote = async (symbol: string): Promise<StockQuote> => {
  const cleanSymbol = symbol.toUpperCase().trim();
  
  try {
    // Fetch quote using Yahoo Finance API
    const yf = await getYahooFinance();
    const quote = await yf.quote(cleanSymbol);
    
    if (!quote) {
      throw new Error(`Stock not found: ${cleanSymbol}`);
    }
    
    // Extract price data - yahoo-finance2 returns different property names
    const price = quote.regularMarketPrice || quote.price || quote.currentPrice || 0;
    const previousClose = quote.regularMarketPreviousClose || quote.previousClose || price;
    const change = price - previousClose;
    const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;
    
    // Extract company name
    const name = quote.longName || quote.shortName || quote.displayName || quote.name || cleanSymbol;
    
    return {
      symbol: cleanSymbol,
      name: name,
      price: price,
      change: change,
      changePercent: changePercent,
    };
  } catch (error: any) {
    console.error('Error fetching stock quote from Yahoo Finance:', error);
    
    if (error.message?.includes('NotFound') || error.message?.includes('not found')) {
      throw new Error(`Stock not found: ${cleanSymbol}. Please check the symbol and try again.`);
    }
    
    if (error.message) {
      throw new Error(`Failed to fetch stock data: ${error.message}`);
    }
    
    throw new Error(`Failed to fetch stock data for ${symbol.toUpperCase()}`);
  }
};

export const searchStocks = async (keywords: string): Promise<any[]> => {
  try {
    const query = keywords.trim();
    
    if (!query || query.length < 1) {
      return [];
    }
    
    // Use Yahoo Finance search
    const yf = await getYahooFinance();
    const searchResults = await yf.search(query, {
      newsCount: 0,
      quotesCount: 20,
    });
    
    if (!searchResults || !searchResults.quotes) {
      return [];
    }
    
    // Filter and format results
    const stockMatches = searchResults.quotes
      .filter((quote: any) => {
        // Filter out ETFs, mutual funds, and other non-stock securities
        const quoteType = quote.quoteType?.toLowerCase() || '';
        const isStock = quoteType === 'equity' || quoteType === 'stock';
        const isETF = quoteType === 'etf';
        const isFund = quoteType === 'mutualfund';
        
        // Only include stocks, exclude ETFs and mutual funds
        return isStock && !isETF && !isFund && quote.symbol;
      })
      .slice(0, 20)
      .map((quote: any) => ({
        symbol: quote.symbol,
        name: quote.longname || quote.shortname || quote.name || quote.symbol,
        type: quote.quoteType || 'Equity',
        region: quote.region || 'United States',
      }));
    
    return stockMatches;
  } catch (error: any) {
    console.error('Error searching stocks with Yahoo Finance:', error);
    
    if (error.message) {
      throw new Error(`Failed to search stocks: ${error.message}`);
    }
    
    throw new Error('Failed to search stocks. Please try again.');
  }
};

