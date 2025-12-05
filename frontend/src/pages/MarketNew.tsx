import { useState, useEffect } from 'react';
import { UnifiedNav } from '../components/Shared/UnifiedNav/UnifiedNav';
import { Footer } from '../components/Shared/Footer/Footer';
import { StockSearch } from '../components/Market/StockSearch';
import { StockDetailModal } from '../components/Market/StockDetailModal';
import { useWatchlist } from '../hooks/useWatchlist';
import { usePortfolio } from '../hooks/usePortfolio';
import { TrendingUp, Star, AlertCircle, Loader2, X, Minus, Plus, DollarSign } from 'lucide-react';
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
import { getMarketCapTierString, getMarketCapTier, formatMarketCap } from '../utils/marketCapUtils';
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
  const [quantity, setQuantity] = useState(1);

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

  const handleAddToPortfolio = (symbol: string, name: string, price?: string, marketCap?: string) => {
    // Find the stock data from searched stocks (fallback if price not provided)
    const stockData = searchedStocks.find(s => s.symbol === symbol);
    const finalMarketCap = marketCap || stockData?.marketCap;
    
    // If market cap is missing and this is from a market mover, try to fetch fresh data
    if (!finalMarketCap && !stockData) {
      console.log(`🔄 Missing market cap for ${symbol}, fetching fresh data...`);
      handleSelectFromSearch(symbol, name);
      showErrorToast(`Fetching market cap data for ${symbol}. Please try adding to portfolio again in a moment.`);
      return;
    }
    
    setPendingStock({ 
      symbol, 
      name, 
      price: price || stockData?.price,
      marketCap: finalMarketCap
    });
    
    // Show Fantasy modal if user is logged in and has leagues
    if (user && userLeagues.length > 0) {
      setQuantity(1); // Reset quantity
      setShowFantasyModal(true);
    } else {
      // Fallback to local portfolio
      setShowPositionModal(true);
    }
  };

  // Sync stock to database and add to Fantasy portfolio
  const handleAddToFantasyPortfolio = async () => {
    if (!user?.uid || !pendingStock || !selectedLeagueId || !selectedSlot) {
      console.error('Missing required data:', { uid: user?.uid, pendingStock, selectedLeagueId, selectedSlot });
      return;
    }

    setAddingToFantasy(true);
    const loadingToast = showLoadingToast('Adding stock to portfolio...');

    try {
      // Step 1: Ensure stock exists in database (upsert)
      const stockPrice = pendingStock.price ? parseFloat(pendingStock.price) : 0;
      const marketCapTier = getMarketCapTierString(pendingStock.marketCap);

      console.log('🔍 Step 1: Stock classification details:', { 
        symbol: pendingStock.symbol, 
        rawMarketCap: pendingStock.marketCap,
        classifiedTier: marketCapTier,
        selectedSlotConstraint: selectedSlot.constraint_value,
        slotType: selectedSlot.constraint_type,
        formattedMarketCap: formatMarketCap(pendingStock.marketCap)
      });

      // Validate market cap classification before proceeding
      if (selectedSlot.constraint_type === 'market_cap') {
        if (!marketCapTier) {
          // Special handling for missing market cap data
          const errorMsg = pendingStock.marketCap === undefined || pendingStock.marketCap === null
            ? `No market cap data available for ${pendingStock.symbol}. This may be a newly listed stock, penny stock, or the data may not be available from our provider. Please try again later or add to a Wildcard slot.`
            : `Unable to classify market cap for ${pendingStock.symbol}. Market cap data: ${pendingStock.marketCap}. Please try searching for the stock again to get updated data.`;
          throw new Error(errorMsg);
        }

        if (marketCapTier !== selectedSlot.constraint_value) {
          throw new Error(`Stock ${pendingStock.symbol} (${marketCapTier}) does not match slot requirement: ${selectedSlot.constraint_value}. Please select a ${marketCapTier} slot or add to a Wildcard slot.`);
        }
      }

      let stockId: string;

      // Try finding by ticker using maybeSingle() to avoid errors when not found
      const { data: existingStock, error: searchError } = await supabase
        .from('stocks')
        .select('id, market_cap_tier, ticker, symbol, name')
        .eq('ticker', pendingStock.symbol)
        .maybeSingle();

      if (searchError) {
        console.error('❌ Stock search error:', searchError);
        throw searchError;
      }

      console.log('📊 Stock lookup result:', { existingStock });

      if (existingStock) {
        // Stock exists - update it with latest info
        stockId = existingStock.id;
        console.log('✅ Stock found, updating...', { 
          stockId, 
          oldTier: existingStock.market_cap_tier, 
          newTier: marketCapTier,
          stockPrice 
        });
        
        const { error: updateError } = await supabase
          .from('stocks')
          .update({ 
            current_price: stockPrice,
            market_cap_tier: marketCapTier,
            symbol: pendingStock.symbol,
            name: pendingStock.name,
            updated_at: new Date().toISOString()
          })
          .eq('id', stockId);

        if (updateError) {
          console.error('❌ Stock update error:', updateError);
          // Continue anyway - the stock exists, update isn't critical
        } else {
          console.log('✅ Stock updated successfully');
        }
      } else {
        // Stock doesn't exist - insert it
        console.log('➕ Stock not found, creating...', { 
          ticker: pendingStock.symbol, 
          marketCapTier 
        });
        
        const { data: newStock, error: insertError } = await supabase
          .from('stocks')
          .insert({
            ticker: pendingStock.symbol,
            symbol: pendingStock.symbol,
            name: pendingStock.name,
            current_price: stockPrice,
            market_cap_tier: marketCapTier,
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('❌ Stock insert error:', insertError);
          throw insertError;
        }
        stockId = newStock.id;
        console.log('✅ Stock created with ID:', stockId);
      }

      // Step 2: Add to portfolio
      console.log('📈 Step 2: Adding to portfolio...', {
        league_id: selectedLeagueId,
        stock_id: stockId,
        slot_name: selectedSlot.slot_name,
        constraint_type: selectedSlot.constraint_type,
        constraint_value: selectedSlot.constraint_value,
        stock_tier: marketCapTier,
        quantity: quantity
      });

      const { data, error } = await addStockToPortfolio(user.uid, {
        league_id: selectedLeagueId,
        user_id: user.uid,
        stock_id: stockId,
        slot_name: selectedSlot.slot_name,
        quantity: quantity,
      });

      console.log('📊 addStockToPortfolio result:', { data, error });

      dismissToast(loadingToast);

      if (error) {
        console.error('❌ Portfolio error:', error);
        showErrorToast(error.message || 'Failed to add stock to portfolio');
      } else if (!data?.success) {
        console.error('❌ Portfolio failed:', data);
        showErrorToast(data?.message || 'Failed to add stock to portfolio');
      } else {
        console.log('✅ Stock successfully added to portfolio');
        showSuccessToast(`${quantity} share${quantity > 1 ? 's' : ''} of ${pendingStock.symbol} added to ${selectedSlot.slot_name}!`);
        // Refresh slots and league data (to update cash balance)
        fetchLeagueSlots(selectedLeagueId);
        fetchUserLeagues();
      }
    } catch (err: any) {
      dismissToast(loadingToast);
      console.error('Error adding stock to Fantasy:', err);
      showErrorToast(err.message || 'An error occurred while adding the stock');
    } finally {
      setAddingToFantasy(false);
      setShowFantasyModal(false);
      setPendingStock(null);
      setSelectedSlot(null);
      setQuantity(1);
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
            {/* <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
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
            </div> */}
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
                  onAddToPortfolio={() => handleAddToPortfolio(stock.symbol, stock.name, stock.price, stock.marketCap)}
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
                  onAddToPortfolio={() => handleAddToPortfolio(mover.ticker, mover.ticker, mover.price)}
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
                  onAddToPortfolio={() => handleAddToPortfolio(mover.ticker, mover.ticker, mover.price)}
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
                  setQuantity(1);
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

            {/* Budget Display */}
            {selectedLeagueId && (() => {
              const selectedLeague = userLeagues.find(l => l.league_id === selectedLeagueId);
              const currentCash = selectedLeague?.current_cash ?? 0;
              const stockPrice = pendingStock.price ? parseFloat(pendingStock.price) : 0;
              const totalCost = stockPrice * quantity;
              const remainingAfter = currentCash - totalCost;
              const canAfford = remainingAfter >= 0;
              
              return (
                <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    <span className="font-semibold text-emerald-900">Your Budget</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-emerald-700">Available Cash</p>
                      <p className="font-bold text-lg text-emerald-900">${currentCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-emerald-700">After Purchase</p>
                      <p className={`font-bold text-lg ${canAfford ? 'text-emerald-900' : 'text-red-600'}`}>
                        ${remainingAfter.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  {!canAfford && (
                    <p className="text-xs text-red-600 mt-2 font-medium">⚠️ Insufficient funds for this purchase</p>
                  )}
                </div>
              );
            })()}

            {/* Stock Info with Quantity & Price Calculator */}
            <div className="mb-4 p-4 bg-gray-50 rounded-xl">
              {/* Stock Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-xl text-gray-900">{pendingStock.symbol}</p>
                  <p className="text-sm text-gray-600">{pendingStock.name}</p>
                  
                  {/* Market Cap Classification with Debug Info */}
                  {pendingStock.marketCap && (() => {
                    const tierInfo = getMarketCapTier(pendingStock.marketCap);
                    return (
                      <div className="mt-2 space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          tierInfo ? `${tierInfo.bg} ${tierInfo.color}` : 'bg-red-100 text-red-700'
                        }`}>
                          {tierInfo ? tierInfo.tier : 'Unknown Cap'}
                        </span>
                        
                        {/* Debug Info */}
                        <div className="text-xs text-gray-500">
                          <span>Raw: {pendingStock.marketCap}</span>
                          <span className="ml-2">Formatted: {formatMarketCap(pendingStock.marketCap)}</span>
                          {selectedSlot && selectedSlot.constraint_type === 'market_cap' && (
                            <span className="ml-2">
                              Required: 
                              <span className={`ml-1 font-semibold ${
                                tierInfo?.tier === selectedSlot.constraint_value 
                                  ? 'text-emerald-600' 
                                  : 'text-red-600'
                              }`}>
                                {selectedSlot.constraint_value}
                              </span>
                            </span>
                          )}
                        </div>
                        
                        {/* Validation Warning */}
                        {selectedSlot && selectedSlot.constraint_type === 'market_cap' && (
                          tierInfo?.tier !== selectedSlot.constraint_value ? (
                            <div className="flex items-center gap-1 text-xs text-red-600">
                              <span>⚠️</span>
                              <span>This stock doesn't match the slot requirement</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-xs text-emerald-600">
                              <span>✅</span>
                              <span>Stock matches slot requirement</span>
                            </div>
                          )
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Price per share</p>
                  <p className="font-bold text-2xl text-gray-900">
                    {pendingStock.price ? `$${parseFloat(pendingStock.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}
                  </p>
                </div>
              </div>
              
              {/* Quantity Selector */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-700">Quantity</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-9 h-9 rounded-lg border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-purple-400 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center font-bold text-xl border-2 border-gray-300 rounded-lg py-2 focus:border-purple-500 focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-9 h-9 rounded-lg border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-purple-400 hover:bg-purple-50 transition-all"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Quick Amount Buttons */}
                <div className="flex gap-2 mb-3">
                  {[1, 5, 10, 25, 50].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setQuantity(amt)}
                      className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        quantity === amt
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700'
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
                
                {/* Price Calculator */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">Total Cost</p>
                      <p className="text-sm text-purple-700">
                        {quantity} × ${pendingStock.price ? parseFloat(pendingStock.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-2xl text-purple-700">
                        ${pendingStock.price 
                          ? (parseFloat(pendingStock.price) * quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : '0.00'
                        }
                      </p>
                    </div>
                  </div>
                </div>
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
                <label className="block text-sm font-semibold text-gray-900 mb-3">
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
                  <div className="space-y-3">
                    {/* Large-Cap Row */}
                    {leagueSlots.filter(s => s.constraint_value === 'Large-Cap' && !s.is_full).length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">🛡️ Large-Cap Anchors</span>
                          <div className="flex-1 h-px bg-blue-200"></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {leagueSlots.filter(s => s.constraint_value === 'Large-Cap' && !s.is_full).map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => setSelectedSlot(slot)}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                selectedSlot?.id === slot.id
                                  ? 'border-blue-500 bg-blue-500 text-white shadow-lg scale-105'
                                  : 'border-blue-200 bg-blue-50 text-blue-900 hover:border-blue-400 hover:bg-blue-100'
                              }`}
                            >
                              <div className="font-semibold text-sm truncate">{slot.slot_name.replace('Large-Cap ', '')}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mid-Cap Row */}
                    {leagueSlots.filter(s => s.constraint_value === 'Mid-Cap' && !s.is_full).length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">📈 Mid-Cap Growth</span>
                          <div className="flex-1 h-px bg-emerald-200"></div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {leagueSlots.filter(s => s.constraint_value === 'Mid-Cap' && !s.is_full).map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => setSelectedSlot(slot)}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                selectedSlot?.id === slot.id
                                  ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg scale-105'
                                  : 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-400 hover:bg-emerald-100'
                              }`}
                            >
                              <div className="font-semibold text-sm truncate">{slot.slot_name.replace('Mid-Cap ', '')}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Small-Cap Row */}
                    {leagueSlots.filter(s => s.constraint_value === 'Small-Cap' && !s.is_full).length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">🚀 High-Risk Small-Cap</span>
                          <div className="flex-1 h-px bg-orange-200"></div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {leagueSlots.filter(s => s.constraint_value === 'Small-Cap' && !s.is_full).map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => setSelectedSlot(slot)}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                selectedSlot?.id === slot.id
                                  ? 'border-orange-500 bg-orange-500 text-white shadow-lg scale-105'
                                  : 'border-orange-200 bg-orange-50 text-orange-900 hover:border-orange-400 hover:bg-orange-100'
                              }`}
                            >
                              <div className="font-semibold text-sm truncate">{slot.slot_name.replace('High-Risk ', '')}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Wildcard Row */}
                    {leagueSlots.filter(s => s.constraint_type === 'wildcard' && !s.is_full).length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">🎯 Wildcard</span>
                          <div className="flex-1 h-px bg-purple-200"></div>
                          {!pendingStock?.marketCap && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                              ✓ Accepts any stock
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {leagueSlots.filter(s => s.constraint_type === 'wildcard' && !s.is_full).map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => setSelectedSlot(slot)}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                selectedSlot?.id === slot.id
                                  ? 'border-purple-500 bg-purple-500 text-white shadow-lg scale-105'
                                  : 'border-purple-200 bg-purple-50 text-purple-900 hover:border-purple-400 hover:bg-purple-100'
                              }`}
                            >
                              <div className="font-semibold text-sm">{slot.slot_name} — Pick any stock!</div>
                              {!pendingStock?.marketCap && (
                                <div className="text-xs opacity-75 mt-1">No market cap data required</div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
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
                  setQuantity(1);
                }}
                disabled={addingToFantasy}
                className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              {(() => {
                const selectedLeague = userLeagues.find(l => l.league_id === selectedLeagueId);
                const currentCash = selectedLeague?.current_cash ?? 0;
                const stockPrice = pendingStock.price ? parseFloat(pendingStock.price) : 0;
                const totalCost = stockPrice * quantity;
                const canAfford = currentCash >= totalCost;
                const isDisabled = !selectedSlot || addingToFantasy || !canAfford;
                
                return (
                  <button
                    onClick={handleAddToFantasyPortfolio}
                    disabled={isDisabled}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      !isDisabled
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {addingToFantasy ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Adding...
                      </>
                    ) : !canAfford ? (
                      'Insufficient Funds'
                    ) : (
                      `Add to Portfolio — $${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    )}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
