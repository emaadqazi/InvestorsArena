import "../styles/FantasyNew.css";
import { useState } from "react";
import { UnifiedNav } from "../components/Shared/UnifiedNav/UnifiedNav";
import { Footer } from "../components/Shared/Footer/Footer";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Trophy,
  Users,
  BarChart3,
  Newspaper,
  Shuffle,
  History,
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock data
const userTeam = {
  name: "Tech Titans",
  playerName: "John Doe",
  points: 1847,
  teamValue: 89.5,
  rank: 12453,
  hasTeam: true, // Change to false to show "Create Team" button
};

const pointsStats = {
  userPoints: 1847,
  averagePoints: 1654,
  highestPoints: 2456,
};

const formation = {
  goalkeeper: [
    { symbol: "SPY", name: "S&P 500 ETF", logo: "📊", price: 478.2, points: 12 },
  ],
  defenders: [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      logo: "🍎",
      price: 178.25,
      points: 24,
      industry: "Technology",
    },
    {
      symbol: "MSFT",
      name: "Microsoft",
      logo: "💻",
      price: 412.8,
      points: 22,
      industry: "Technology",
    },
    {
      symbol: "GOOGL",
      name: "Alphabet",
      logo: "🔍",
      price: 142.5,
      points: 18,
      industry: "Technology",
    },
    {
      symbol: "META",
      name: "Meta",
      logo: "👥",
      price: 485.2,
      points: 20,
      industry: "Technology",
    },
  ],
  midfielders: [
    {
      symbol: "JPM",
      name: "JPMorgan",
      logo: "🏦",
      price: 188.5,
      points: 19,
      industry: "Finance",
    },
    {
      symbol: "BAC",
      name: "Bank of America",
      logo: "💳",
      price: 35.6,
      points: 16,
      industry: "Finance",
    },
    {
      symbol: "GS",
      name: "Goldman Sachs",
      logo: "💰",
      price: 467.3,
      points: 21,
      industry: "Finance",
    },
  ],
  attackers: [
    {
      symbol: "JNJ",
      name: "Johnson & Johnson",
      logo: "💊",
      price: 158.9,
      points: 17,
      industry: "Healthcare",
    },
    {
      symbol: "PFE",
      name: "Pfizer",
      logo: "🧬",
      price: 28.45,
      points: 14,
      industry: "Healthcare",
    },
    {
      symbol: "UNH",
      name: "UnitedHealth",
      logo: "🏥",
      price: 524.7,
      points: 23,
      industry: "Healthcare",
    },
  ],
};

const bench = [
  { symbol: "TSLA", name: "Tesla", logo: "⚡", price: 242.8, points: 11 },
  { symbol: "NVDA", name: "NVIDIA", logo: "🎮", price: 875.3, points: 15 },
  { symbol: "V", name: "Visa", logo: "💳", price: 265.4, points: 13 },
  { symbol: "DIS", name: "Disney", logo: "🎬", price: 112.5, points: 9 },
];

const leagues = [
  { name: "Friends League", rank: 3, members: 12 },
  { name: "Office Champions", rank: 7, members: 25 },
  { name: "Family Cup", rank: 1, members: 8 },
];

const bestPerformers = [
  { symbol: "AAPL", change: 2.4, points: 24 },
  { symbol: "UNH", change: 1.9, points: 23 },
  { symbol: "MSFT", change: 1.7, points: 22 },
];

const worstPerformers = [
  { symbol: "PFE", change: -1.6, points: 14 },
  { symbol: "TSLA", change: -1.4, points: 11 },
  { symbol: "GOOGL", change: -0.8, points: 18 },
];

export function FantasyNew() {
  const [showTeamValue, setShowTeamValue] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      {/* Background decorative shapes */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl" />

      <UnifiedNav variant="fantasy" />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            {/* Left Column - Points & Leagues */}
            <div className="space-y-6">
              {/* Points Performance Card - FPL Style */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden border-emerald-200">
                <div className="p-6 bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
                  {/* Team and Manager Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl mb-1 text-gray-900">{userTeam.name}</h2>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        {userTeam.playerName} 🇨🇦
                      </div>
                    </div>
                    <Link to="/team-value-rank">
                      <Button size="sm" variant="ghost" className="text-gray-700 hover:bg-emerald-50">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <div className="h-px bg-emerald-200 mb-4" />

                  {/* Gameweek */}
                  <div className="text-center mb-4">
                    <div className="text-sm text-gray-600">Gameweek 7</div>
                  </div>

                  {/* Points Display */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {/* Average */}
                    <div className="text-center">
                      <div className="text-3xl mb-1 text-gray-700">60</div>
                      <div className="text-xs text-gray-500">Average</div>
                    </div>
                    {/* Your Points */}
                    <div className="text-center">
                      <div className="text-4xl mb-1 text-emerald-600">72</div>
                      <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                        Points <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                    {/* Highest */}
                    <div className="text-center">
                      <div className="text-3xl mb-1 text-gray-700">135</div>
                      <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                        Highest <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/pick-team" className="block">
                      <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white border-0">
                        <Shuffle className="h-4 w-4 mr-2" />
                        Pick Team
                      </Button>
                    </Link>
                    <Link to="/transfers" className="block">
                      <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white border-0">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Transfers
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>

              {/* My Leagues */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg p-5 border-emerald-200">
                <h3 className="text-gray-900 mb-3 flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-emerald-600" />
                  My Leagues
                </h3>
                <div className="space-y-2">
                  {leagues.map((league, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="text-gray-900 text-sm">{league.name}</div>
                        <div className="text-xs text-gray-600">{league.members} members</div>
                      </div>
                      <Badge className="bg-emerald-600 text-white text-xs">#{league.rank}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Performance Cards Row */}
              <div className="grid grid-cols-1 gap-4">
                {/* Best Performers */}
                <Card className="bg-white/80 backdrop-blur-sm shadow p-4 border-emerald-200">
                  <h3 className="text-gray-900 mb-3 flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Best Performers
                  </h3>
                  <div className="space-y-2">
                    {bestPerformers.map((stock, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-900">{stock.symbol}</span>
                        <div className="text-right">
                          <div className="text-green-600 text-xs">+{stock.change}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Underperformers */}
                <Card className="bg-white/80 backdrop-blur-sm shadow p-4 border-emerald-200">
                  <h3 className="text-gray-900 mb-3 flex items-center gap-2 text-sm">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    Underperformers
                  </h3>
                  <div className="space-y-2">
                    {worstPerformers.map((stock, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-900">{stock.symbol}</span>
                        <div className="text-right">
                          <div className="text-red-600 text-xs">{stock.change}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Market Intelligence */}
                <Card className="bg-white/80 backdrop-blur-sm shadow p-4 border-emerald-200">
                  <h3 className="text-gray-900 mb-3 flex items-center gap-2 text-sm">
                    <BarChart3 className="h-4 w-4 text-emerald-600" />
                    Market Intelligence
                  </h3>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600">💡 Tech stocks trending up</div>
                    <div className="text-xs text-gray-600">📈 Healthcare shows strength</div>
                    <div className="text-xs text-gray-600">⚡ Energy sector volatile</div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Right Column - Team Formation (Wider) */}
            <div className="lg:col-span-2 flex flex-col">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg p-6 border-emerald-200 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-gray-900">Starting XI</h3>
                  {userTeam.hasTeam ? (
                    <Link to="/team-details">
                      <Button className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white gap-2">
                        <History className="h-4 w-4" />
                        Performance History
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/create-team">
                      <Button className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white">
                        Create Team
                      </Button>
                    </Link>
                  )}
                </div>

                {/* 4-3-3 Formation */}
                <div className="space-y-8 flex-1 flex flex-col justify-center">
                  {/* Attackers - 3 */}
                  <div className="grid grid-cols-3 gap-4">
                    {formation.attackers.map((stock, idx) => (
                      <div key={idx} className="relative group">
                        <div className="bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-xl p-4 text-center border-2 border-emerald-300/30 hover:border-emerald-500 transition-all cursor-pointer">
                          <div className="text-4xl mb-2">{stock.logo}</div>
                          <div className="text-sm text-gray-900 mb-1">{stock.symbol}</div>
                          <div className="text-xs text-gray-600 mb-2">${stock.price.toFixed(0)}</div>
                          <Badge className="bg-emerald-600 text-white text-xs">{stock.points} pts</Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Midfielders - 3 */}
                  <div className="grid grid-cols-3 gap-4">
                    {formation.midfielders.map((stock, idx) => (
                      <div key={idx} className="relative group">
                        <div className="bg-gradient-to-br from-teal-200/20 to-emerald-300/20 rounded-xl p-4 text-center border-2 border-teal-300/30 hover:border-teal-500 transition-all cursor-pointer">
                          <div className="text-4xl mb-2">{stock.logo}</div>
                          <div className="text-sm text-gray-900 mb-1">{stock.symbol}</div>
                          <div className="text-xs text-gray-600 mb-2">${stock.price.toFixed(0)}</div>
                          <Badge className="bg-teal-500 text-white text-xs">{stock.points} pts</Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Defenders - 4 */}
                  <div className="grid grid-cols-4 gap-4">
                    {formation.defenders.map((stock, idx) => (
                      <div key={idx} className="relative group">
                        <div className="bg-gradient-to-br from-emerald-300/30 to-teal-50/50 rounded-xl p-4 text-center border-2 border-emerald-400/40 hover:border-emerald-500 transition-all cursor-pointer">
                          <div className="text-4xl mb-2">{stock.logo}</div>
                          <div className="text-sm text-gray-900 mb-1">{stock.symbol}</div>
                          <div className="text-xs text-gray-600 mb-2">${stock.price.toFixed(0)}</div>
                          <Badge className="bg-emerald-400 text-gray-900 text-xs">{stock.points} pts</Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Goalkeeper - 1 */}
                  <div className="flex justify-center">
                    {formation.goalkeeper.map((stock, idx) => (
                      <div key={idx} className="relative group w-1/3">
                        <div className="bg-gradient-to-br from-teal-50 to-emerald-200/20 rounded-xl p-4 text-center border-2 border-emerald-400/50 hover:border-emerald-500 transition-all cursor-pointer">
                          <div className="text-4xl mb-2">{stock.logo}</div>
                          <div className="text-sm text-gray-900 mb-1">{stock.symbol}</div>
                          <div className="text-xs text-gray-600 mb-2">${stock.price.toFixed(0)}</div>
                          <Badge className="bg-emerald-400 text-gray-900 text-xs">{stock.points} pts</Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bench */}
                  <div className="pt-4 border-t border-emerald-200">
                    <div className="text-sm text-gray-600 mb-3">Bench</div>
                    <div className="grid grid-cols-4 gap-3">
                      {bench.map((stock, idx) => (
                        <div
                          key={idx}
                          className="bg-emerald-50/50 rounded-lg p-3 flex flex-col items-center gap-2 border border-emerald-200/10"
                        >
                          <div className="text-2xl">{stock.logo}</div>
                          <div className="text-center">
                            <div className="text-sm text-gray-900">{stock.symbol}</div>
                            <div className="text-xs text-gray-600">{stock.points} pts</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Recent News Section */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg p-6 border-emerald-200">
            <h3 className="text-gray-900 mb-4 flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-emerald-600" />
              Recent News
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-200/10 hover:border-emerald-300/30 transition-colors cursor-pointer">
                <div className="text-sm text-gray-900 mb-2">Tech stocks surge on AI breakthroughs</div>
                <div className="text-xs text-gray-600">2 hours ago</div>
              </div>
              <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-200/10 hover:border-emerald-300/30 transition-colors cursor-pointer">
                <div className="text-sm text-gray-900 mb-2">Federal Reserve maintains interest rates</div>
                <div className="text-xs text-gray-600">5 hours ago</div>
              </div>
              <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-200/10 hover:border-emerald-300/30 transition-colors cursor-pointer">
                <div className="text-sm text-gray-900 mb-2">Healthcare sector rallies on new approvals</div>
                <div className="text-xs text-gray-600">1 day ago</div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
