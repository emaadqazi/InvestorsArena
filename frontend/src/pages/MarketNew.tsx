import { useState, useEffect } from 'react';
import { UnifiedNav } from '../components/Shared/UnifiedNav/UnifiedNav';
import { Footer } from '../components/Shared/Footer/Footer';
import { StockSearch } from '../components/Market/StockSearch';
import { StockDetailModal } from '../components/Market/StockDetailModal';
import { useWatchlist } from '../hooks/useWatchlist';
import { usePortfolio } from '../hooks/usePortfolio';
import { TrendingUp, Star, AlertCircle, Clock, Loader2, X } from 'lucide-react';
import { getRemainingAPICalls } from '../services/alphaVantage';
import { StockCard } from '../components/Market/StockCard';
import { MarketMoverCard } from '../components/Market/MarketMoverCard';
import { getQuote, getCompanyOverview, getTopGainersLosers, TopGainersLosers } from '../services/alphaVantage';
import { debugAlphaVantageSetup, testSearch } from '../utils/debugAlphaVantage';
import { getMarketStatus, type MarketStatus } from '../utils/marketHours';
import { useAuth } from '../contexts/AuthContext';
import { getUserLeagues, getAvailableSlots, addStockToPortfolio } from '../services/fantasyService';
import { supabase } from '../services/supabase';
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } from '../utils/toastUtils';
import type { UserLeagueMember, SlotWithUsage } from '../types/fantasy.types';

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

// Helper to determine market cap tier from market cap value
function getMarketCapTier(marketCap: string | undefined): 'Large-Cap' | 'Mid-Cap' | 'Small-Cap' | null {
  if (!marketCap) return null;
  const value = parseFloat(marketCap);
  if (isNaN(value)) return null;
  
  if (value >= 10_000_000_000) return 'Large-Cap';
  if (value >= 2_000_000_000) return 'Mid-Cap';
  return 'Small-Cap';
}

export function MarketNew() {
  const auth = useAuth() as any;
  const user = auth?.user;

  const { watchlist, toggleWatchlist, isInWatchlist } = useWatchlist();
  const { addToPortfolio, isInPortfolio, getAvailableSlots: getLocalSlots } = usePortfolio();
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [searchedStocks, setSearchedStocks] = useState<SelectedStock[]>([]);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [pendingStock, setPendingStock] = useState<{ symbol: string; name: string; price?: string; marketCap?: string } | null>(null);
  const [marketMovers, setMarketMovers] = useState<TopGainersLosers | null>(null);
  const [loadingMarketMovers, setLoadingMarketMovers] = useState(true);

  // Market hours state
  const [marketStatus, setMarketStatus] = useState<MarketStatus>(getMarketStatus());

  // Fantasy integration state
  const [userLeagues, setUserLeagues] = useState<UserLeagueMember[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [leagueSlots, setLeagueSlots] = useState<SlotWithUsage[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotWithUsage | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [addingToFantasy, setAddingToFantasy] = useState(false);
  const [showFantasyModal, setShowFantasyModal] = useState(false);

  const remainingCalls = getRemainingAPICalls();
  const availableSlots = getLocalSlots();

  // Update market status every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketStatus(getMarketStatus());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserLeagues = async () => {
    if (!user?.uid) return;
    const { data, error } = await getUserLeagues(user.uid);
    if (error) {
      console.error('Error fetching leagues:', error);
    } else {
      setUserLeagues(data || []);
      // Auto-select first league if only one
      if (data && data.length === 1) {
        setSelectedLeagueId(data[0].league_id);
      }
    }
  };

  const fetchLeagueSlots = async (leagueId: string) => {
    if (!user?.uid) return;
    setLoadingSlots(true);
    const { data, error } = await getAvailableSlots(user.uid, leagueId);
    if (error) {
      console.error('Error fetching slots:', error);
    } else {
      setLeagueSlots(data || []);
    }
    setLoadingSlots(false);
  };

  // Fetch user's leagues when authenticated
  useEffect(() => {
    if (user?.uid) {
      fetchUserLeagues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // Fetch slots when a league is selected
  useEffect(() => {
    if (selectedLeagueId && user?.uid) {
      fetchLeagueSlots(selectedLeagueId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeagueId, user?.uid]);

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
    // Find the stock data from searched stocks
    const stockData = searchedStocks.find(s => s.symbol === symbol);
    setPendingStock({ 
      symbol, 
      name, 
      price: stockData?.price,
      marketCap: stockData?.marketCap 
    });
    
    // Show Fantasy modal if user is logged in and has leagues
    if (user && userLeagues.length > 0) {
      setShowFantasyModal(true);
    } else {
      // Fallback to local portfolio
      setShowPositionModal(true);
    }
  };

  // Sync stock to database and add to Fantasy portfolio
  const handleAddToFantasyPortfolio = async () => {
    if (!user?.uid || !pendingStock || !selectedLeagueId || !selectedSlot) return;

    setAddingToFantasy(true);
    const loadingToast = showLoadingToast('Adding stock to portfolio...');

    try {
      // Step 1: Ensure stock exists in database (upsert)
      const stockPrice = pendingStock.price ? parseFloat(pendingStock.price) : 0;
      const marketCapTier = getMarketCapTier(pendingStock.marketCap);

      const { data: existingStock } = await supabase
        .from('stocks')
        .select('id, market_cap_tier')
        .eq('symbol', pendingStock.symbol)
        .single();

      let stockId: string;

      if (existingStock) {
        stockId = existingStock.id;
        // Update the price
        await supabase
          .from('stocks')
          .update({ 
            current_price: stockPrice,
            market_cap_tier: marketCapTier || (existingStock as any).market_cap_tier
          })
          .eq('id', stockId);
      } else {
        // Insert new stock
        const { data: newStock, error: insertError } = await supabase
          .from('stocks')
          .insert({
            symbol: pendingStock.symbol,
            name: pendingStock.name,
            current_price: stockPrice,
            market_cap_tier: marketCapTier,
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        stockId = newStock.id;
      }

      // Step 2: Add to portfolio
      const { data, error } = await addStockToPortfolio(user.uid, {
        league_id: selectedLeagueId,
        user_id: user.uid,
        stock_id: stockId,
        slot_name: selectedSlot.slot_name,
        quantity: 1,
      });

      dismissToast(loadingToast);

      if (error || !data?.success) {
        showErrorToast(data?.message || 'Failed to add stock to portfolio');
      } else {
        showSuccessToast(`${pendingStock.symbol} added to ${selectedSlot.slot_name}!`);
        // Refresh slots
        fetchLeagueSlots(selectedLeagueId);
      }
    } catch (err: any) {
      dismissToast(loadingToast);
      console.error('Error adding stock to Fantasy:', err);
      showErrorToast('An error occurred while adding the stock');
    } finally {
      setAddingToFantasy(false);
      setShowFantasyModal(false);
      setPendingStock(null);
      setSelectedSlot(null);
    }
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

            {/* Market Status Banner */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              marketStatus.isOpen 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-amber-100 text-amber-800'
            }`}>
              <Clock className="h-4 w-4" />
              <span className="font-medium">
                {marketStatus.isOpen ? '🟢 Market Open' : '🔴 Market Closed'}
              </span>
              <span className="text-sm opacity-75">
                {marketStatus.message}
              </span>
            </div>
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

          {/* Fantasy League Slots Info */}
          {user && userLeagues.length > 0 && (
            <div className="max-w-2xl mx-auto mt-4">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎯</span>
                    <span className="text-sm font-semibold text-purple-900">
                      Fantasy League Slots
                    </span>
                  </div>
                  {userLeagues.length > 1 && (
                    <select
                      value={selectedLeagueId || ''}
                      onChange={(e) => setSelectedLeagueId(e.target.value || null)}
                      className="text-sm border border-purple-300 rounded-lg px-2 py-1 bg-white text-purple-900"
                    >
                      <option value="">Select League</option>
                      {userLeagues.map((lm) => (
                        <option key={lm.league_id} value={lm.league_id}>
                          {lm.league?.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                  </div>
                ) : selectedLeagueId && leagueSlots.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {leagueSlots.map((slot) => (
                      <div 
                        key={slot.id}
                        className={`bg-white rounded px-2 py-1.5 text-center ${
                          slot.is_full ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="font-semibold text-purple-700 truncate">
                          {slot.slot_name}
                        </div>
                        <div className={`text-xs ${slot.is_full ? 'text-gray-500' : 'text-emerald-600'}`}>
                          {slot.slots_remaining}/{slot.max_count} open
                        </div>
                      </div>
                    ))}
                  </div>
                ) : selectedLeagueId ? (
                  <p className="text-sm text-purple-700 text-center py-2">
                    No slots configured for this league
                  </p>
                ) : (
                  <p className="text-sm text-purple-700 text-center py-2">
                    Select a league to view available slots
                  </p>
                )}
              </div>
            </div>
          )}
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

      {/* Fantasy Portfolio Modal */}
      {showFantasyModal && pendingStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Add {pendingStock.symbol} to Fantasy Portfolio
              </h3>
              <button
                onClick={() => {
                  setShowFantasyModal(false);
                  setPendingStock(null);
                  setSelectedSlot(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Market Status Warning */}
            {!marketStatus.isOpen && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Market is Closed</p>
                  <p className="text-xs text-amber-700">
                    Trading is only available during market hours (9:30 AM - 4:00 PM ET, Mon-Fri)
                  </p>
                </div>
              </div>
            )}

            {/* Stock Info */}
            <div className="mb-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg text-gray-900">{pendingStock.symbol}</p>
                  <p className="text-sm text-gray-600">{pendingStock.name}</p>
                </div>
                {pendingStock.price && (
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">${pendingStock.price}</p>
                    {pendingStock.marketCap && (
                      <p className="text-xs text-gray-500">
                        {getMarketCapTier(pendingStock.marketCap) || 'Unknown Cap'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* League Selection */}
            {userLeagues.length > 1 && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Select League
                </label>
                <select
                  value={selectedLeagueId || ''}
                  onChange={(e) => {
                    setSelectedLeagueId(e.target.value || null);
                    setSelectedSlot(null);
                  }}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-900"
                >
                  <option value="">Choose a league...</option>
                  {userLeagues.map((lm) => (
                    <option key={lm.league_id} value={lm.league_id}>
                      {lm.league?.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Slot Selection */}
            {selectedLeagueId && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Select Slot
                </label>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  </div>
                ) : leagueSlots.length === 0 ? (
                  <p className="text-sm text-gray-600 py-4 text-center">
                    No slots available in this league
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {leagueSlots.filter(slot => !slot.is_full).map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedSlot?.id === slot.id
                            ? 'border-purple-500 bg-purple-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-purple-300'
                        }`}
                      >
                        <div className="font-semibold text-gray-900 mb-1">
                          {slot.slot_name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {slot.slots_remaining} of {slot.max_count} available
                        </div>
                        {slot.constraint_type !== 'wildcard' && (
                          <div className={`text-xs mt-1 px-2 py-0.5 rounded inline-block ${
                            slot.constraint_type === 'market_cap' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {slot.constraint_value}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowFantasyModal(false);
                  setPendingStock(null);
                  setSelectedSlot(null);
                }}
                disabled={addingToFantasy}
                className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToFantasyPortfolio}
                disabled={!selectedSlot || addingToFantasy}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  selectedSlot && !addingToFantasy
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {addingToFantasy ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add to Portfolio'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
