import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UnifiedNav } from "../components/Shared/UnifiedNav/UnifiedNav";
import { Footer } from "../components/Shared/Footer/Footer";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Trophy,
  Target,
  LineChart,
  Wallet,
  Crown,
  Medal,
  Zap,
  BarChart3,
  PieChart,
  Loader2,
  Plus,
  ChevronRight,
  Flame,
  Star,
  Award,
  DollarSign,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getUserLeagues } from "../services/leagueService";
import { getUserLeagues as getFantasyLeagues } from "../services/fantasyService";
import type { LeagueWithStats } from "../types/league.types";
import type { UserLeagueMember } from "../types/fantasy.types";

interface DashboardStats {
  totalLeagues: number;
  totalPortfolioValue: number;
  totalCash: number;
  totalInvested: number;
  bestLeagueRank: number | null;
  bestLeagueName: string | null;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
}

export function Dashboard() {
  const navigate = useNavigate();
  const auth = useAuth() as any;
  const user = auth?.user;
  const authLoading = auth?.loading;

  const [loading, setLoading] = useState(true);
  const [leagues, setLeagues] = useState<LeagueWithStats[]>([]);
  const [fantasyLeagues, setFantasyLeagues] = useState<UserLeagueMember[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalLeagues: 0,
    totalPortfolioValue: 0,
    totalCash: 0,
    totalInvested: 0,
    bestLeagueRank: null,
    bestLeagueName: null,
    totalProfitLoss: 0,
    totalProfitLossPercent: 0,
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [leaguesResult, fantasyResult] = await Promise.all([
        getUserLeagues(user.uid),
        getFantasyLeagues(user.uid),
      ]);

      if (leaguesResult.data) {
        setLeagues(leaguesResult.data);
      }

      if (fantasyResult.data) {
        setFantasyLeagues(fantasyResult.data);
        calculateStats(fantasyResult.data);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (leagueData: UserLeagueMember[]) => {
    let totalPortfolioValue = 0;
    let totalCash = 0;
    let totalStartingCash = 0;
    let bestRank: number | null = null;
    let bestLeagueName: string | null = null;

    leagueData.forEach((member) => {
      totalPortfolioValue += member.portfolio_value || 0;
      totalCash += member.current_cash || 0;
      totalStartingCash += member.league?.starting_cash || 0;

      if (member.rank !== null && (bestRank === null || member.rank < bestRank)) {
        bestRank = member.rank;
        bestLeagueName = member.league?.name || null;
      }
    });

    const totalValue = totalPortfolioValue + totalCash;
    const totalProfitLoss = totalValue - totalStartingCash;
    const totalProfitLossPercent = totalStartingCash > 0 
      ? (totalProfitLoss / totalStartingCash) * 100 
      : 0;

    setStats({
      totalLeagues: leagueData.length,
      totalPortfolioValue,
      totalCash,
      totalInvested: totalPortfolioValue,
      bestLeagueRank: bestRank,
      bestLeagueName,
      totalProfitLoss,
      totalProfitLossPercent,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  const getRankBadge = (rank: number | null) => {
    if (rank === null) return null;
    if (rank === 1) return { icon: Crown, color: "text-yellow-500", bg: "bg-yellow-50", label: "1st Place" };
    if (rank === 2) return { icon: Medal, color: "text-gray-400", bg: "bg-gray-50", label: "2nd Place" };
    if (rank === 3) return { icon: Medal, color: "text-amber-600", bg: "bg-amber-50", label: "3rd Place" };
    return { icon: Award, color: "text-slate-500", bg: "bg-slate-50", label: `#${rank}` };
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-50/50 to-slate-100">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-50/50 to-slate-100">
        <Card className="p-10 text-center max-w-md border-slate-200 shadow-lg">
          <Trophy className="h-12 w-12 text-amber-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Welcome to InvestorsArena</h2>
          <p className="text-slate-600 mb-6">Sign in to start your fantasy investing journey!</p>
          <Button onClick={() => navigate("/signin")} className="bg-slate-900 hover:bg-slate-800 text-white">
            Get Started
          </Button>
        </Card>
      </div>
    );
  }

  const totalValue = stats.totalCash + stats.totalPortfolioValue;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50/50 to-slate-100">
      <UnifiedNav variant="fantasy" />

      {/* Hero Section with User Stats */}
      <section className="relative pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-emerald-600 font-medium text-sm">Welcome back!</span>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                  Trading Dashboard
                </h1>
              </div>
            </div>
            <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
              Track your performance across all leagues and dominate the leaderboards
            </p>
          </div>

          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Total Portfolio Value */}
            <Card className="bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-emerald-600" />
                </div>
                {stats.totalProfitLoss !== 0 && (
                  <Badge className={`${stats.totalProfitLoss >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {stats.totalProfitLoss >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {formatPercent(stats.totalProfitLossPercent)}
                  </Badge>
                )}
              </div>
              <p className="text-slate-500 text-sm mb-1">Total Value</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(totalValue)}</p>
              <p className={`text-sm mt-2 ${stats.totalProfitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {stats.totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(stats.totalProfitLoss)} all time
              </p>
            </Card>

            {/* Available Cash */}
            <Card className="bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-slate-500 text-sm mb-1">Available Cash</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats.totalCash)}</p>
              <p className="text-sm mt-2 text-slate-500">Across {stats.totalLeagues} leagues</p>
            </Card>

            {/* Invested Amount */}
            <Card className="bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-slate-500 text-sm mb-1">Invested</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats.totalInvested)}</p>
              <p className="text-sm mt-2 text-slate-500">In stocks</p>
            </Card>

            {/* Best Rank */}
            <Card className="bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-amber-600" />
                </div>
                {stats.bestLeagueRank === 1 && (
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                    <Crown className="h-3 w-3 mr-1" />
                    Leader
                  </Badge>
                )}
              </div>
              <p className="text-slate-500 text-sm mb-1">Best Rank</p>
              <p className="text-3xl font-bold text-slate-900">
                {stats.bestLeagueRank ? `#${stats.bestLeagueRank}` : '--'}
              </p>
              <p className="text-sm mt-2 text-slate-500 truncate">
                {stats.bestLeagueName || 'No leagues yet'}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Leagues */}
            <div className="lg:col-span-2 space-y-8">
              {/* Your Leagues */}
              <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Your Leagues</h2>
                        <p className="text-sm text-slate-500">{fantasyLeagues.length} active leagues</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => navigate("/league")}
                      className="bg-slate-900 hover:bg-slate-800 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Join League
                    </Button>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {fantasyLeagues.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No Leagues Yet</h3>
                      <p className="text-slate-600 mb-6">Join or create a league to start competing!</p>
                      <Button onClick={() => navigate("/league")} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
                        Browse Leagues
                      </Button>
                    </div>
                  ) : (
                    fantasyLeagues.slice(0, 5).map((member) => {
                      const rankInfo = getRankBadge(member.rank);
                      const leagueTotalValue = (member.current_cash || 0) + (member.portfolio_value || 0);
                      const startingCash = member.league?.starting_cash || 100000;
                      const profitLoss = leagueTotalValue - startingCash;
                      const profitLossPercent = (profitLoss / startingCash) * 100;

                      return (
                        <div
                          key={member.id}
                          className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => navigate("/fantasy")}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {rankInfo ? (
                                <div className={`w-10 h-10 rounded-lg ${rankInfo.bg} border flex items-center justify-center`}>
                                  <rankInfo.icon className={`h-5 w-5 ${rankInfo.color}`} />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                                  <Award className="h-5 w-5 text-slate-400" />
                                </div>
                              )}
                              <div>
                                <h3 className="font-semibold text-slate-900">{member.league?.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm text-slate-500">
                                    Rank: #{member.rank || '--'}
                                  </span>
                                  <span className="text-slate-300">•</span>
                                  <span className={`text-sm font-medium ${profitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {formatPercent(profitLossPercent)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-slate-900">{formatCurrency(leagueTotalValue)}</p>
                              <p className={`text-sm font-medium ${profitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {fantasyLeagues.length > 5 && (
                  <div className="p-4 border-t border-slate-200">
                    <Button 
                      variant="ghost" 
                      className="w-full text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      onClick={() => navigate("/fantasy")}
                    >
                      View All {fantasyLeagues.length} Leagues
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-6">
                <Link to="/fantasy">
                  <Card className="p-6 bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                          Manage Portfolio
                        </h3>
                        <p className="text-sm text-slate-500">Buy & sell stocks</p>
                      </div>
                    </div>
                  </Card>
                </Link>

                <Link to="/market">
                  <Card className="p-6 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <LineChart className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          Explore Market
                        </h3>
                        <p className="text-sm text-slate-500">Research stocks</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            </div>

            {/* Right Column - Stats & Achievements */}
            <div className="space-y-8">
              {/* Performance Overview */}
              <Card className="bg-white border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <PieChart className="h-5 w-5 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Portfolio Breakdown</h2>
                </div>

                <div className="space-y-6">
                  {/* Cash vs Invested */}
                  <div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-slate-600">Cash vs Invested</span>
                      <span className="text-slate-900 font-medium">
                        {totalValue > 0 ? Math.round((stats.totalCash / totalValue) * 100) : 0}% / {totalValue > 0 ? Math.round((stats.totalInvested / totalValue) * 100) : 0}%
                      </span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-blue-500 h-full transition-all duration-500"
                        style={{ width: totalValue > 0 ? `${(stats.totalCash / totalValue) * 100}%` : '50%' }}
                      />
                      <div 
                        className="bg-purple-500 h-full transition-all duration-500"
                        style={{ width: totalValue > 0 ? `${(stats.totalInvested / totalValue) * 100}%` : '50%' }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-2">
                      <span className="text-blue-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Cash
                      </span>
                      <span className="text-purple-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        Invested
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-slate-600">Active Leagues</span>
                      <span className="text-slate-900 font-semibold">{stats.totalLeagues}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Total P&L</span>
                      <span className={`font-semibold ${stats.totalProfitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {stats.totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(stats.totalProfitLoss)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Achievements */}
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Star className="h-5 w-5 text-amber-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Achievements</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-100">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <Flame className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">First Trade</p>
                      <p className="text-xs text-slate-500">Complete your first stock purchase</p>
                    </div>
                    {stats.totalInvested > 0 ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Earned</Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-500 border-slate-200">Locked</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-100">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">League Joiner</p>
                      <p className="text-xs text-slate-500">Join your first league</p>
                    </div>
                    {stats.totalLeagues > 0 ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Earned</Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-500 border-slate-200">Locked</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-100">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                      <Crown className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Top Dog</p>
                      <p className="text-xs text-slate-500">Reach #1 in any league</p>
                    </div>
                    {stats.bestLeagueRank === 1 ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Earned</Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-500 border-slate-200">Locked</Badge>
                    )}
                  </div>
                </div>

                <p className="text-center text-amber-700 text-xs mt-6 font-medium">More achievements coming soon!</p>
              </Card>

              {/* Pro Tips */}
              <Card className="bg-white border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <Target className="h-5 w-5 text-teal-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Pro Tips</h2>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <ChevronRight className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-600">Diversify across different market cap tiers for balanced risk</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <ChevronRight className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-600">Keep some cash ready for buying opportunities</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <ChevronRight className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-600">Check the market page for trending stocks</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
