import "../styles/LeagueNew.css";
import { useState } from "react";
import { UnifiedNav } from "../components/Shared/UnifiedNav/UnifiedNav";
import { Footer } from "../components/Shared/Footer/Footer";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Users,
  Plus,
  Trophy,
  TrendingUp,
  TrendingDown,
  Crown,
  Medal,
  Award,
  Target,
} from "lucide-react";

const publicLeagues = [
  {
    id: 1,
    name: "Global Champions",
    creator: "Admin",
    members: 150,
    maxMembers: 200,
    status: "Active",
  },
  {
    id: 2,
    name: "Tech Stock Masters",
    creator: "Sarah K.",
    members: 45,
    maxMembers: 50,
    status: "Active",
  },
  {
    id: 3,
    name: "Wall Street Warriors",
    creator: "Mike R.",
    members: 89,
    maxMembers: 100,
    status: "Active",
  },
  {
    id: 4,
    name: "Dividend Hunters",
    creator: "Alex T.",
    members: 67,
    maxMembers: 75,
    status: "Upcoming",
  },
  {
    id: 5,
    name: "Growth Seekers",
    creator: "Emma L.",
    members: 32,
    maxMembers: 50,
    status: "Active",
  },
  {
    id: 6,
    name: "Value Investors",
    creator: "John D.",
    members: 28,
    maxMembers: 40,
    status: "Upcoming",
  },
];

const myLeagues = [
  { id: 1, name: "Friends & Family", rank: 3, totalPoints: 2450, members: 12, status: "Active" },
  { id: 2, name: "Office Champions", rank: 7, totalPoints: 1820, members: 25, status: "Active" },
  { id: 3, name: "College Crew", rank: 1, totalPoints: 3120, members: 8, status: "Completed" },
];

const leaderboardData = [
  {
    rank: 1,
    username: "MarketMaven",
    teamName: "The Bulls",
    weeklyPoints: 540,
    totalPoints: 15840,
    trend: "up",
  },
  {
    rank: 2,
    username: "StockSage",
    teamName: "Wall St Wizards",
    weeklyPoints: 520,
    totalPoints: 14920,
    trend: "up",
  },
  {
    rank: 3,
    username: "BullRunner",
    teamName: "Tech Titans",
    weeklyPoints: 485,
    totalPoints: 14350,
    trend: "down",
  },
  {
    rank: 4,
    username: "WallStreetWiz",
    teamName: "Fortune 500",
    weeklyPoints: 470,
    totalPoints: 13780,
    trend: "up",
  },
  {
    rank: 5,
    username: "PortfolioPro",
    teamName: "Dividend Kings",
    weeklyPoints: 450,
    totalPoints: 13240,
    trend: "same",
  },
  {
    rank: 6,
    username: "You",
    teamName: "My Dream Team",
    weeklyPoints: 420,
    totalPoints: 12890,
    trend: "up",
    isCurrentUser: true,
  },
];

const topPerformers = [
  { username: "MarketMaven", league: "Global Champions", points: 15840, change: 120 },
  { username: "StockSage", league: "Tech Stock Masters", points: 14920, change: 95 },
  { username: "BullRunner", league: "Wall Street Warriors", points: 14350, change: 85 },
];

export function LeagueNew() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background decorative shapes */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />

      <UnifiedNav variant="fantasy" />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            {/* Left Column - My Leagues & Stats */}
            <div className="space-y-6">
              {/* My Leagues */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden border-blue-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900 flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-blue-600" />
                      My Leagues
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {myLeagues.map((league) => (
                      <div
                        key={league.id}
                        className="p-3 rounded-lg bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer border border-blue-200/10"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-900">{league.name}</span>
                          <Badge className="bg-blue-600 text-white">#{league.rank}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {league.members} members
                          </div>
                          <span>{league.totalPoints} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-500 text-white"
                    onClick={() => setShowCreateForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New League
                  </Button>
                </div>
              </Card>

              {/* Top Performers */}
              <Card className="bg-white/80 backdrop-blur-sm shadow p-4 border-blue-200">
                <h3 className="text-gray-900 mb-3 flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-blue-600" />
                  Top Performers
                </h3>
                <div className="space-y-2">
                  {topPerformers.map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div>
                        <div className="text-gray-900">{user.username}</div>
                        <div className="text-xs text-gray-600">{user.league}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-900">{user.points.toLocaleString()}</div>
                        <div className="text-xs text-green-600">+{user.change}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* League Stats */}
              <Card className="bg-white/80 backdrop-blur-sm shadow p-4 border-blue-200">
                <h3 className="text-gray-900 mb-3 flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-blue-600" />
                  Your Stats
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Leagues</span>
                    <span className="text-gray-900">3</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Best Rank</span>
                    <span className="text-gray-900">#1</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Points</span>
                    <span className="text-gray-900">7,390</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Public Leagues & Leaderboard (Wider) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Public Leagues */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg p-6 border-blue-200">
                <h3 className="text-gray-900 mb-4">Public Leagues</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {publicLeagues.map((league) => (
                    <div
                      key={league.id}
                      className="p-4 bg-blue-50/30 rounded-lg border border-blue-200/20 hover:border-blue-300/40 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-gray-900">{league.name}</h4>
                        <Badge
                          className={
                            league.status === "Active"
                              ? "bg-green-600 text-white"
                              : "bg-yellow-600 text-white"
                          }
                        >
                          {league.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 mb-3">by {league.creator}</div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Users className="h-3 w-3" />
                          {league.members}/{league.maxMembers}
                        </div>
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white">
                          Join
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Global Leaderboard */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg p-6 border-blue-200">
                <h3 className="text-gray-900 mb-4">Global Leaderboard</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-blue-200/10">
                        <th className="px-4 py-3 text-left text-sm text-gray-600">Rank</th>
                        <th className="px-4 py-3 text-left text-sm text-gray-600">Player</th>
                        <th className="px-4 py-3 text-left text-sm text-gray-600">Team</th>
                        <th className="px-4 py-3 text-right text-sm text-gray-600">Weekly</th>
                        <th className="px-4 py-3 text-right text-sm text-gray-600">Total</th>
                        <th className="px-4 py-3 text-center text-sm text-gray-600">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboardData.map((player) => (
                        <tr
                          key={player.rank}
                          className={`border-b border-blue-200/5 hover:bg-blue-50/30 transition-colors ${
                            player.isCurrentUser ? "bg-blue-50/50" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {player.rank === 1 && <Crown className="h-4 w-4 text-yellow-500" />}
                              {player.rank === 2 && <Medal className="h-4 w-4 text-gray-400" />}
                              {player.rank === 3 && <Medal className="h-4 w-4 text-orange-600" />}
                              <span className="text-gray-900">{player.rank}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-900">{player.username}</td>
                          <td className="px-4 py-3 text-gray-600 text-sm">{player.teamName}</td>
                          <td className="px-4 py-3 text-right text-gray-900">{player.weeklyPoints}</td>
                          <td className="px-4 py-3 text-right text-gray-900">
                            {player.totalPoints.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center">
                              {player.trend === "up" && <TrendingUp className="h-4 w-4 text-green-600" />}
                              {player.trend === "down" && <TrendingDown className="h-4 w-4 text-red-600" />}
                              {player.trend === "same" && <span className="text-gray-400">—</span>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
