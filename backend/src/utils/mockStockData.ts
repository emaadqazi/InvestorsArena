// Mock stock data for development/testing when API limits are reached
export const getMockStockQuote = (symbol: string) => {
  const mockStocks: { [key: string]: { name: string; price: number; change: number; changePercent: number } } = {
    'AAPL': { name: 'Apple Inc.', price: 175.50, change: 2.30, changePercent: 1.33 },
    'MSFT': { name: 'Microsoft Corporation', price: 378.85, change: -1.25, changePercent: -0.33 },
    'GOOGL': { name: 'Alphabet Inc.', price: 140.20, change: 3.10, changePercent: 2.26 },
    'AMZN': { name: 'Amazon.com Inc.', price: 145.80, change: 1.50, changePercent: 1.04 },
    'TSLA': { name: 'Tesla, Inc.', price: 248.50, change: -5.20, changePercent: -2.05 },
    'META': { name: 'Meta Platforms Inc.', price: 485.30, change: 8.70, changePercent: 1.83 },
    'NVDA': { name: 'NVIDIA Corporation', price: 875.40, change: 25.60, changePercent: 3.01 },
    'JPM': { name: 'JPMorgan Chase & Co.', price: 195.25, change: 1.75, changePercent: 0.90 },
    'V': { name: 'Visa Inc.', price: 275.80, change: 2.40, changePercent: 0.88 },
    'WMT': { name: 'Walmart Inc.', price: 165.30, change: -0.50, changePercent: -0.30 },
  };

  const stock = mockStocks[symbol.toUpperCase()];
  if (stock) {
    return {
      symbol: symbol.toUpperCase(),
      name: stock.name,
      price: stock.price,
      change: stock.change,
      changePercent: stock.changePercent,
    };
  }
  
  // Generate a random mock price for unknown symbols
  const basePrice = 50 + Math.random() * 200;
  return {
    symbol: symbol.toUpperCase(),
    name: `${symbol.toUpperCase()} Company`,
    price: Math.round(basePrice * 100) / 100,
    change: (Math.random() - 0.5) * 10,
    changePercent: (Math.random() - 0.5) * 5,
  };
};

export const getMockStockSearch = (keywords: string) => {
  const allStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Equity', region: 'United States' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'TSLA', name: 'Tesla, Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'META', name: 'Meta Platforms Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'Equity', region: 'United States' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'Equity', region: 'United States' },
    { symbol: 'V', name: 'Visa Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'WMT', name: 'Walmart Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'Equity', region: 'United States' },
    { symbol: 'PG', name: 'Procter & Gamble Co.', type: 'Equity', region: 'United States' },
    { symbol: 'MA', name: 'Mastercard Incorporated', type: 'Equity', region: 'United States' },
    { symbol: 'DIS', name: 'The Walt Disney Company', type: 'Equity', region: 'United States' },
    { symbol: 'NFLX', name: 'Netflix, Inc.', type: 'Equity', region: 'United States' },
  ];

  const query = keywords.toUpperCase();
  return allStocks.filter(stock => 
    stock.symbol.includes(query) || stock.name.toUpperCase().includes(query)
  ).slice(0, 10);
};

