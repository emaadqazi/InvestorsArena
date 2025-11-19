import { useState, useEffect } from 'react';
import { StockCard } from './StockCard';
import { getQuote, getCompanyOverview } from '../../services/alphaVantage';

interface PopularStocksProps {
  symbols: string[];
  onToggleWatchlist: (symbol: string, name: string) => void;
  onAddToPortfolio: (symbol: string, name: string) => void;
  onViewDetails: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;
  isInPortfolio: (symbol: string) => boolean;
}

interface StockData {
  symbol: string;
  name: string;
  price?: string;
  change?: string;
  changePercent?: string;
  marketCap?: string;
  peRatio?: string;
  loading: boolean;
  error: boolean;
}

export function PopularStocks({
  symbols,
  onToggleWatchlist,
  onAddToPortfolio,
  onViewDetails,
  isInWatchlist,
  isInPortfolio,
}: PopularStocksProps) {
  const [stocks, setStocks] = useState<StockData[]>([]);

  useEffect(() => {
    // Initialize stocks with loading state
    setStocks(
      symbols.map(symbol => ({
        symbol,
        name: '',
        loading: true,
        error: false,
      }))
    );

    // Fetch data for each stock
    const fetchStockData = async () => {
      for (const symbol of symbols) {
        try {
          // Fetch quote and overview in parallel
          const [quote, overview] = await Promise.all([
            getQuote(symbol),
            getCompanyOverview(symbol),
          ]);

          setStocks(prev =>
            prev.map(stock =>
              stock.symbol === symbol
                ? {
                    symbol,
                    name: overview?.Name || symbol,
                    price: quote?.price,
                    change: quote?.change,
                    changePercent: quote?.changePercent,
                    marketCap: overview?.MarketCapitalization,
                    peRatio: overview?.PERatio,
                    loading: false,
                    error: !quote && !overview,
                  }
                : stock
            )
          );

          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error);
          setStocks(prev =>
            prev.map(stock =>
              stock.symbol === symbol
                ? { ...stock, loading: false, error: true }
                : stock
            )
          );
        }
      }
    };

    fetchStockData();
  }, [symbols]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {stocks.map(stock => (
        <StockCard
          key={stock.symbol}
          symbol={stock.symbol}
          name={stock.name}
          price={stock.price}
          change={stock.change}
          changePercent={stock.changePercent}
          marketCap={stock.marketCap}
          peRatio={stock.peRatio}
          loading={stock.loading}
          isInWatchlist={isInWatchlist(stock.symbol)}
          isInPortfolio={isInPortfolio(stock.symbol)}
          onToggleWatchlist={() => onToggleWatchlist(stock.symbol, stock.name)}
          onAddToPortfolio={() => onAddToPortfolio(stock.symbol, stock.name)}
          onViewDetails={() => onViewDetails(stock.symbol)}
        />
      ))}
    </div>
  );
}
