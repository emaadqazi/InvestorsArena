import "../styles/FantasyNew.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UnifiedNav } from "../components/Shared/UnifiedNav/UnifiedNav";
import { Footer } from "../components/Shared/Footer/Footer";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plus,
  Search,
  Loader2,
  DollarSign,
  BarChart3,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getUserLeagues, getAvailableSlots, getPortfolioHoldings, getLeagueMemberInfo, removeStockFromPortfolio } from "../services/fantasyService";
import { AddStockModal } from "../components/Fantasy/AddStockModal";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { getMarketStatus, MarketStatus } from "../utils/marketHours";
import type { UserLeagueMember, SlotWithUsage, PortfolioHolding } from "../types/fantasy.types";

export function FantasyNew() {
  const navigate = useNavigate();
  const auth = useAuth() as any;
  const user = auth?.user;

  // State
  const [userLeagues, setUserLeagues] = useState<UserLeagueMember[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<UserLeagueMember | null>(null);
  const [slots, setSlots] = useState<SlotWithUsage[]>([]);
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [memberInfo, setMemberInfo] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotWithUsage | null>(null);
  const [removingStockId, setRemovingStockId] = useState<string | null>(null);
  const [marketStatus, setMarketStatus] = useState<MarketStatus>(getMarketStatus());

  // Load user's leagues on mount
  useEffect(() => {
    if (user) {
      loadUserLeagues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Load slot and portfolio data when league is selected
  useEffect(() => {
    if (selectedLeague && user) {
      loadLeagueData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeague, user]);

  // Update market status every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketStatus(getMarketStatus());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadUserLeagues = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await getUserLeagues(user.uid);

    if (error) {
      console.error("Error loading leagues:", error);
      showErrorToast("Failed to load your leagues");
    } else {
      setUserLeagues(data || []);

      // Auto-select first league if available
      if (data && data.length > 0) {
        setSelectedLeague(data[0]);
      }
    }

    setLoading(false);
  };

  const loadLeagueData = async () => {
    if (!user || !selectedLeague) return;
    setLoadingSlots(true);

    try {
      // Load in parallel
      const [slotsResult, holdingsResult, memberResult] = await Promise.all([
        getAvailableSlots(user.uid, selectedLeague.league_id),
        getPortfolioHoldings(user.uid, selectedLeague.league_id),
        getLeagueMemberInfo(user.uid, selectedLeague.league_id),
      ]);

      if (slotsResult.error) {
        console.error("Error loading slots:", slotsResult.error);
      } else {
        setSlots(slotsResult.data || []);
      }

      if (holdingsResult.error) {
        console.error("Error loading holdings:", holdingsResult.error);
      } else {
        setHoldings(holdingsResult.data || []);
      }

      if (memberResult.error) {
        console.error("Error loading member info:", memberResult.error);
      } else {
        setMemberInfo(memberResult.data);
      }
    } catch (err) {
      console.error("Error loading league data:", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleAddStock = (slot: SlotWithUsage) => {
    setSelectedSlot(slot);
    setShowAddStockModal(true);
  };

  const handleStockAdded = () => {
    setShowAddStockModal(false);
    setSelectedSlot(null);
    loadLeagueData(); // Refresh data
    showSuccessToast("Stock added successfully!");
  };

  const handleRemoveStock = async (holding: PortfolioHolding) => {
    if (!user || !selectedLeague) return;
    
    const stockId = holding.stock_id;
    setRemovingStockId(stockId);
    
    try {
      const { data, error } = await removeStockFromPortfolio(
        user.uid,
        selectedLeague.league_id,
        stockId
      );
      
      if (error) {
        showErrorToast("Failed to remove stock: " + error.message);
        return;
      }
      
      if (data && !data.success) {
        showErrorToast(data.message || "Failed to remove stock");
        return;
      }
      
      showSuccessToast("Stock removed successfully!");
      loadLeagueData(); // Refresh data
    } catch (err: any) {
      console.error("Error removing stock:", err);
      showErrorToast("An error occurred while removing stock");
    } finally {
      setRemovingStockId(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50/50 to-slate-100">
        <UnifiedNav variant="fantasy" />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
        </div>
      </div>
    );
  }

  // Show "not in any leagues" state
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50/50 to-slate-100">
        <UnifiedNav variant="fantasy" />
        <div className="flex items-center justify-center py-32">
          <Card className="p-12 text-center max-w-md border-slate-200 shadow-lg">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Sign In Required</h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Please sign in to access your fantasy portfolio.
            </p>
            <Button
              className="bg-slate-900 hover:bg-slate-800 text-white"
              onClick={() => navigate("/signin")}
            >
              Go to Sign In
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (userLeagues.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50/50 to-slate-100">
        <UnifiedNav variant="fantasy" />
        <main className="flex-1 py-32">
          <div className="mx-auto max-w-2xl px-6">
            <Card className="p-12 text-center border-slate-200 shadow-lg">
              <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                <TrendingUp className="h-10 w-10 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Not in any leagues yet!</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Join or create a league to start building your fantasy stock portfolio and compete with others.
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm h-12 px-8"
                onClick={() => navigate("/league")}
              >
                Go to Leagues
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate portfolio stats
  const totalPortfolioValue = holdings.reduce((sum, h) => sum + (h.current_value || 0), 0);
  const totalProfitLoss = holdings.reduce((sum, h) => sum + (h.profit_loss || 0), 0);
  const totalProfitLossPercent = holdings.length > 0
    ? (totalProfitLoss / holdings.reduce((sum, h) => sum + (h.purchase_price * h.quantity), 0)) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50/50 to-slate-100">
      <UnifiedNav variant="fantasy" />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Header with League Selector */}
          <div className="mb-12">
            <div className="flex items-start justify-between mb-8">
              <div className="flex-1">
                <h1 className="text-5xl font-bold text-slate-900 mb-3 tracking-tight">Fantasy Portfolio</h1>
                <p className="text-lg text-slate-600 max-w-4xl leading-relaxed">
                  Build your portfolio by selecting stocks for each slot
                </p>
              </div>
            </div>

            {/* League Selector */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-900 mb-3">Select League:</label>
              <div className="grid md:grid-cols-3 gap-4">
                {userLeagues.map((league) => (
                  <Card
                    key={league.id}
                    className={`p-5 cursor-pointer transition-all border-2 ${
                      selectedLeague?.id === league.id
                        ? "border-emerald-500 bg-emerald-50 shadow-md"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                    onClick={() => setSelectedLeague(league)}
                  >
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {league.league?.name || "Unknown League"}
                    </h3>
                    <p className="text-sm text-slate-600">
                      Cash: {formatCurrency(league.current_cash)}
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Market Status Banner */}
            <div className={`mb-6 rounded-xl p-4 flex items-center justify-between ${
              marketStatus.isOpen 
                ? "bg-emerald-50 border border-emerald-200" 
                : "bg-amber-50 border border-amber-200"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  marketStatus.isOpen ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`} />
                <div>
                  <p className={`font-semibold ${
                    marketStatus.isOpen ? "text-emerald-800" : "text-amber-800"
                  }`}>
                    {marketStatus.isOpen ? "🟢 Market Open" : "🔴 Market Closed"}
                  </p>
                  <p className={`text-sm ${
                    marketStatus.isOpen ? "text-emerald-600" : "text-amber-600"
                  }`}>
                    {marketStatus.message}
                  </p>
                </div>
              </div>
              <div className={`text-sm font-medium ${
                marketStatus.isOpen ? "text-emerald-700" : "text-amber-700"
              }`}>
                {marketStatus.currentTime} ET
              </div>
            </div>

            {/* Stats Cards */}
            {selectedLeague && memberInfo && (
              <div className="grid grid-cols-3 gap-6">
                <Card className="p-6 bg-white border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    {formatCurrency(memberInfo.current_cash)}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">Available Cash</div>
                </Card>

                <Card className="p-6 bg-white border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    {formatCurrency(totalPortfolioValue)}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">Portfolio Value</div>
                </Card>

                <Card className="p-6 bg-white border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      totalProfitLoss >= 0 ? "bg-emerald-50" : "bg-rose-50"
                    }`}>
                      {totalProfitLoss >= 0 ? (
                        <TrendingUp className="h-6 w-6 text-emerald-600" />
                      ) : (
                        <TrendingDown className="h-6 w-6 text-rose-600" />
                      )}
                    </div>
                  </div>
                  <div className={`text-3xl font-bold mb-1 ${
                    totalProfitLoss >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}>
                    {formatCurrency(Math.abs(totalProfitLoss))}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">
                    Total P/L ({formatPercent(totalProfitLossPercent)})
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Slots Grid */}
          {selectedLeague && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Portfolio Slots</h2>

                {loadingSlots ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
                  </div>
                ) : slots.length === 0 ? (
                  <Card className="p-12 text-center border-slate-200">
                    <p className="text-slate-600">No slots configured for this league yet.</p>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {slots.map((slot) => {
                      const slotHolding = holdings.find((h) => h.slot_name === slot.slot_name);

                      return (
                        <Card
                          key={slot.slot_name}
                          className={`p-6 border-2 transition-all ${
                            slot.is_full
                              ? "border-emerald-200 bg-emerald-50"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="mb-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-slate-900 text-base mb-1">
                                  {slot.slot_name}
                                </h3>
                                {slot.description && (
                                  <p className="text-sm text-slate-600 leading-relaxed">
                                    {slot.description}
                                  </p>
                                )}
                              </div>
                              <Badge
                                className={`${
                                  slot.is_full
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
                                } border-0 ml-2 shrink-0`}
                              >
                                {slot.current_count}/{slot.max_count}
                              </Badge>
                            </div>

                            {/* Constraint Badge */}
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold mb-3 ${
                              slot.constraint_type === "wildcard"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : slot.constraint_type === "market_cap"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            }`}>
                              {slot.constraint_type === "wildcard" ? (
                                <>
                                  <span>🎯</span>
                                  <span>Any stock allowed</span>
                                </>
                              ) : slot.constraint_type === "market_cap" ? (
                                <>
                                  <span>📊</span>
                                  <span>Required: {slot.constraint_value}</span>
                                </>
                              ) : (
                                <>
                                  <span>🏢</span>
                                  <span>Required: {slot.constraint_value} sector</span>
                                </>
                              )}
                            </div>
                          </div>

                          {slotHolding ? (
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-3">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {slotHolding.stock?.symbol}
                                  </p>
                                  <p className="text-xs text-slate-600">{slotHolding.stock?.name}</p>
                                </div>
                                <button
                                  className="p-1 hover:bg-rose-100 rounded transition-colors disabled:opacity-50"
                                  onClick={() => handleRemoveStock(slotHolding)}
                                  disabled={removingStockId === slotHolding.stock_id}
                                  title="Remove stock"
                                >
                                  {removingStockId === slotHolding.stock_id ? (
                                    <Loader2 className="h-4 w-4 text-slate-500 animate-spin" />
                                  ) : (
                                    <X className="h-4 w-4 text-rose-500" />
                                  )}
                                </button>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">
                                  {slotHolding.quantity} shares
                                </span>
                                <span
                                  className={`font-semibold ${
                                    (slotHolding.profit_loss || 0) >= 0
                                      ? "text-emerald-600"
                                      : "text-rose-600"
                                  }`}
                                >
                                  {formatPercent(slotHolding.profit_loss_percent || 0)}
                                </span>
                              </div>
                            </div>
                          ) : null}

                          {!slot.is_full && !slotHolding && (
                            <div className="bg-slate-50 rounded-lg p-4 border-2 border-dashed border-slate-300 mb-3 text-center">
                              <p className="text-sm text-slate-600 mb-2">
                                {slot.constraint_type === "wildcard"
                                  ? "Choose any stock to fill this flex slot"
                                  : `Select a ${slot.constraint_value} stock`}
                              </p>
                            </div>
                          )}

                          {!slot.is_full && (
                            <Button
                              size="sm"
                              className="w-full shadow-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                              onClick={() => handleAddStock(slot)}
                            >
                              <Plus className="h-4 w-4 mr-1.5" />
                              {slotHolding ? "Add Another Stock" : "Add Stock"}
                            </Button>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />

      {/* Add Stock Modal */}
      {showAddStockModal && selectedSlot && selectedLeague && (
        <AddStockModal
          open={showAddStockModal}
          onOpenChange={setShowAddStockModal}
          slot={selectedSlot}
          leagueId={selectedLeague.league_id}
          onStockAdded={handleStockAdded}
        />
      )}
    </div>
  );
}
