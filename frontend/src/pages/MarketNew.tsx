import { useState, useEffect } from 'react';
import { UnifiedNav } from '../components/Shared/UnifiedNav/UnifiedNav';
import { Footer } from '../components/Shared/Footer/Footer';
import { StockSearch } from '../components/Market/StockSearch';
import { StockDetailModal } from '../components/Market/StockDetailModal';
import { useWatchlist } from '../hooks/useWatchlist';
import { usePortfolio } from '../hooks/usePortfolio';
import { TrendingUp, Star, AlertCircle } from 'lucide-react';
import { getRemainingAPICalls } from '../services/alphaVantage';
import { StockCard } from '../components/Market/StockCard';
import { MarketMoverCard } from '../components/Market/MarketMoverCard';
import { getQuote, getCompanyOverview, getTopGainersLosers, TopGainersLosers } from '../services/alphaVantage';
import { debugAlphaVantageSetup, testSearch } from '../utils/debugAlphaVantage';

interface SelectedStock {
  symbol: string;
  name: string;
  price?: string;
  change?: string;
  changePercent?: string;
  marketCap?: string;
  peRatio?: string;
  loading: boolean;
}

export function MarketNew() {
  const { watchlist, toggleWatchlist, isInWatchlist } = useWatchlist();
  const { addToPortfolio, isInPortfolio, getAvailableSlots } = usePortfolio();
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [searchedStocks, setSearchedStocks] = useState<SelectedStock[]>([]);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [pendingStock, setPendingStock] = useState<{ symbol: string; name: string } | null>(null);
  const [marketMovers, setMarketMovers] = useState<TopGainersLosers | null>(null);
  const [loadingMarketMovers, setLoadingMarketMovers] = useState(true);

  const remainingCalls = getRemainingAPICalls();
  const availableSlots = getAvailableSlots();

  // Debug Alpha Vantage setup on mount
  useEffect(() => {
    const hasApiKey = debugAlphaVantageSetup();

    if (!hasApiKey) {
      console.error('❌ Alpha Vantage API key not found! Check .env file.');
    }

    // Expose test function globally for debugging
    (window as any).testAlphaVantageSearch = testSearch;
    console.log('💡 Run window.testAlphaVantageSearch("AAPL") in console to test API');
  }, []);

  // Fetch market movers on mount (SINGLE API CALL, cached for 1 hour)
  useEffect(() => {
    const fetchMarketMovers = async () => {
      setLoadingMarketMovers(true);
      try {
        const data = await getTopGainersLosers();
        setMarketMovers(data);
      } catch (error) {
        console.error('Failed to fetch market movers:', error);
      } finally {
        setLoadingMarketMovers(false);
      }
    };

    fetchMarketMovers();
  }, []);

  const handleSelectFromSearch = async (symbol: string, name: string) => {
    // Check if already in searched stocks
    if (searchedStocks.some(s => s.symbol === symbol)) {
      return;
    }

    // Add to searched stocks with loading state
    const newStock: SelectedStock = { symbol, name, loading: true };
    setSearchedStocks(prev => [newStock, ...prev]);

    // Fetch stock data
    try {
      const [quote, overview] = await Promise.all([
        getQuote(symbol),
        getCompanyOverview(symbol),
      ]);

      setSearchedStocks(prev =>
        prev.map(s =>
          s.symbol === symbol
            ? {
                symbol,
                name: overview?.Name || name,
                price: quote?.price,
                change: quote?.change,
                changePercent: quote?.changePercent,
                marketCap: overview?.MarketCapitalization,
                peRatio: overview?.PERatio,
                loading: false,
              }
            : s
        )
      );
    } catch (error) {
      console.error(`Error fetching ${symbol}:`, error);
      setSearchedStocks(prev =>
        prev.map(s => (s.symbol === symbol ? { ...s, loading: false } : s))
      );
    }
  };

  const handleAddToPortfolio = (symbol: string, name: string) => {
    setPendingStock({ symbol, name });
    setShowPositionModal(true);
  };

  const handleConfirmPosition = (position: 'defender' | 'midfielder' | 'forward' | 'keeper') => {
    if (!pendingStock) return;

    const result = addToPortfolio(pendingStock.symbol, pendingStock.name, position);

    if (!result.success) {
      alert(result.message);
    }

    setShowPositionModal(false);
    setPendingStock(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <UnifiedNav variant="fantasy" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-12 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.05),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center space-y-6 mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-lg mx-auto">
              <TrendingUp className="h-8 w-8" />
            </div>
            <h1 className="text-gray-900 text-4xl lg:text-5xl font-bold">
              Stock Market
            </h1>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
              Search, research, and build your fantasy portfolio with real-time market data
            </p>
          </div>

          {/* API Status Warning */}
          {remainingCalls < 10 && (
            <div className="max-w-2xl mx-auto mb-6">
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-orange-900">
                    API Limit Warning
                  </p>
                  <p className="text-sm text-orange-700">
                    Only {remainingCalls} API calls remaining today. Cached data will be used when available.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <StockSearch
              onSelectStock={handleSelectFromSearch}
              placeholder="Search by symbol or company name..."
            />
          </div>

          {/* Portfolio Slots Info */}
          <div className="max-w-2xl mx-auto mt-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-900">
                  Available Portfolio Slots (4-3-3 Formation)
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="bg-white rounded px-2 py-1 text-center">
                  <span className="text-emerald-600 font-bold">{availableSlots.defenders}</span>
                  <span className="text-gray-600"> DEF</span>
                </div>
                <div className="bg-white rounded px-2 py-1 text-center">
                  <span className="text-emerald-600 font-bold">{availableSlots.midfielders}</span>
                  <span className="text-gray-600"> MID</span>
                </div>
                <div className="bg-white rounded px-2 py-1 text-center">
                  <span className="text-emerald-600 font-bold">{availableSlots.forwards}</span>
                  <span className="text-gray-600"> FWD</span>
                </div>
                <div className="bg-white rounded px-2 py-1 text-center">
                  <span className="text-emerald-600 font-bold">{availableSlots.keeper}</span>
                  <span className="text-gray-600"> GK</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Searched Stocks */}
      {searchedStocks.length > 0 && (
        <section className="py-12 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchedStocks.map(stock => (
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
                  onToggleWatchlist={() => toggleWatchlist(stock.symbol, stock.name)}
                  onAddToPortfolio={() => handleAddToPortfolio(stock.symbol, stock.name)}
                  onViewDetails={() => setSelectedSymbol(stock.symbol)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Watchlist */}
      {watchlist.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-6 w-6 text-emerald-600" fill="currentColor" />
              <h2 className="text-2xl font-bold text-gray-900">Your Watchlist ({watchlist.length})</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {watchlist.map((item) => (
                <div
                  key={item.symbol}
                  className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedSymbol(item.symbol)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{item.symbol}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(item.symbol, item.name);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Star className="h-4 w-4" fill="currentColor" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Market Movers - Top Gainers */}
      {marketMovers && marketMovers.top_gainers.length > 0 && (
        <section className="py-12 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">Top Gainers</h2>
              </div>
              {marketMovers.last_updated && (
                <p className="text-sm text-gray-500">
                  Updated: {new Date(marketMovers.last_updated).toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {marketMovers.top_gainers.slice(0, 8).map((mover) => (
                <MarketMoverCard
                  key={mover.ticker}
                  mover={mover}
                  isInWatchlist={isInWatchlist(mover.ticker)}
                  isInPortfolio={isInPortfolio(mover.ticker)}
                  onToggleWatchlist={() => toggleWatchlist(mover.ticker, mover.ticker)}
                  onAddToPortfolio={() => handleAddToPortfolio(mover.ticker, mover.ticker)}
                  onViewDetails={() => setSelectedSymbol(mover.ticker)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Market Movers - Most Active */}
      {marketMovers && marketMovers.most_actively_traded.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Most Active</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {marketMovers.most_actively_traded.slice(0, 8).map((mover) => (
                <MarketMoverCard
                  key={mover.ticker}
                  mover={mover}
                  isInWatchlist={isInWatchlist(mover.ticker)}
                  isInPortfolio={isInPortfolio(mover.ticker)}
                  onToggleWatchlist={() => toggleWatchlist(mover.ticker, mover.ticker)}
                  onAddToPortfolio={() => handleAddToPortfolio(mover.ticker, mover.ticker)}
                  onViewDetails={() => setSelectedSymbol(mover.ticker)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Loading State */}
      {loadingMarketMovers && (
        <section className="py-12 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Loading Market Data...</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="p-6 border border-gray-200 rounded-xl animate-pulse">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stock Detail Modal */}
      {selectedSymbol && (
        <StockDetailModal
          symbol={selectedSymbol}
          isOpen={!!selectedSymbol}
          onClose={() => setSelectedSymbol(null)}
          onToggleWatchlist={toggleWatchlist}
          onAddToPortfolio={handleAddToPortfolio}
          isInWatchlist={isInWatchlist(selectedSymbol)}
          isInPortfolio={isInPortfolio(selectedSymbol)}
        />
      )}

      {/* Position Selection Modal */}
      {showPositionModal && pendingStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Select Position for {pendingStock.symbol}
            </h3>
            <p className="text-gray-600 mb-6">
              Choose which position to assign this stock in your fantasy portfolio:
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => handleConfirmPosition('defender')}
                disabled={availableSlots.defenders === 0}
                className={`p-4 rounded-xl border-2 transition-all ${
                  availableSlots.defenders > 0
                    ? 'border-blue-200 bg-blue-50 hover:border-blue-400 hover:shadow-md'
                    : 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🛡️</div>
                  <div className="font-semibold text-gray-900">Defender</div>
                  <div className="text-xs text-gray-600">{availableSlots.defenders} slots</div>
                </div>
              </button>

              <button
                onClick={() => handleConfirmPosition('midfielder')}
                disabled={availableSlots.midfielders === 0}
                className={`p-4 rounded-xl border-2 transition-all ${
                  availableSlots.midfielders > 0
                    ? 'border-emerald-200 bg-emerald-50 hover:border-emerald-400 hover:shadow-md'
                    : 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">⚙️</div>
                  <div className="font-semibold text-gray-900">Midfielder</div>
                  <div className="text-xs text-gray-600">{availableSlots.midfielders} slots</div>
                </div>
              </button>

              <button
                onClick={() => handleConfirmPosition('forward')}
                disabled={availableSlots.forwards === 0}
                className={`p-4 rounded-xl border-2 transition-all ${
                  availableSlots.forwards > 0
                    ? 'border-purple-200 bg-purple-50 hover:border-purple-400 hover:shadow-md'
                    : 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="font-semibold text-gray-900">Forward</div>
                  <div className="text-xs text-gray-600">{availableSlots.forwards} slots</div>
                </div>
              </button>

              <button
                onClick={() => handleConfirmPosition('keeper')}
                disabled={availableSlots.keeper === 0}
                className={`p-4 rounded-xl border-2 transition-all ${
                  availableSlots.keeper > 0
                    ? 'border-yellow-200 bg-yellow-50 hover:border-yellow-400 hover:shadow-md'
                    : 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🥅</div>
                  <div className="font-semibold text-gray-900">Keeper (ETF)</div>
                  <div className="text-xs text-gray-600">{availableSlots.keeper} slot</div>
                </div>
              </button>
            </div>

            <button
              onClick={() => {
                setShowPositionModal(false);
                setPendingStock(null);
              }}
              className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
