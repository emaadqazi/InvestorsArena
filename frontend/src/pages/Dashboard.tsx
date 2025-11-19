import { Link } from "react-router-dom";
import { UnifiedNav } from "../components/Shared/UnifiedNav/UnifiedNav";
import { Footer } from "../components/Shared/Footer/Footer";
import { Card } from "../components/ui/card";
import {
  TrendingUp,
  Users,
  Trophy,
  Target,
  LineChart,
  FileText,
  Newspaper,
  ArrowRight,
  LayoutDashboard
} from "lucide-react";

export function Dashboard() {
  return (
    <div className="min-h-screen bg-white">
      <UnifiedNav variant="fantasy" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.05),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-lg mx-auto mb-4">
              <LayoutDashboard className="h-8 w-8" />
            </div>
            <h1 className="text-gray-900 text-4xl lg:text-5xl font-bold">
              Welcome to Your Dashboard
            </h1>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
              Manage your portfolio, compete in leagues, and track your performance
            </p>
          </div>
        </div>
      </section>

      {/* Main Dashboard Grid */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Fantasy */}
            <Link to="/fantasy">
              <Card className="p-8 border-2 border-gray-200 hover:border-emerald-300 hover:shadow-xl transition-all group cursor-pointer h-full">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-7 w-7 text-emerald-700" />
                </div>
                <h3 className="text-gray-900 text-xl font-bold mb-2">Fantasy Portfolio</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Build and manage your stock portfolio. Pick your team and track real-time performance.
                </p>
                <div className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-sm group-hover:gap-2 transition-all">
                  Manage Portfolio
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Card>
            </Link>

            {/* League */}
            <Link to="/league">
              <Card className="p-8 border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all group cursor-pointer h-full">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-7 w-7 text-blue-700" />
                </div>
                <h3 className="text-gray-900 text-xl font-bold mb-2">Leagues</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Join or create leagues with friends. Compete for the top spot on the leaderboard.
                </p>
                <div className="inline-flex items-center gap-1 text-blue-700 font-semibold text-sm group-hover:gap-2 transition-all">
                  View Leagues
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Card>
            </Link>

            {/* Challenges */}
            <Link to="/challenges">
              <Card className="p-8 border-2 border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all group cursor-pointer h-full">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 mb-4 group-hover:scale-110 transition-transform">
                  <Target className="h-7 w-7 text-purple-700" />
                </div>
                <h3 className="text-gray-900 text-xl font-bold mb-2">Challenges</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Complete weekly challenges to earn bonus points and test your investment strategies.
                </p>
                <div className="inline-flex items-center gap-1 text-purple-700 font-semibold text-sm group-hover:gap-2 transition-all">
                  View Challenges
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Card>
            </Link>

            {/* Market */}
            <Link to="/market">
              <Card className="p-8 border-2 border-gray-200 hover:border-orange-300 hover:shadow-xl transition-all group cursor-pointer h-full">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 mb-4 group-hover:scale-110 transition-transform">
                  <LineChart className="h-7 w-7 text-orange-700" />
                </div>
                <h3 className="text-gray-900 text-xl font-bold mb-2">Market</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Explore stock prices, trends, and market data to make informed decisions.
                </p>
                <div className="inline-flex items-center gap-1 text-orange-700 font-semibold text-sm group-hover:gap-2 transition-all">
                  Browse Market
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Card>
            </Link>

            {/* Blog */}
            <Link to="/blog">
              <Card className="p-8 border-2 border-gray-200 hover:border-teal-300 hover:shadow-xl transition-all group cursor-pointer h-full">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="h-7 w-7 text-teal-700" />
                </div>
                <h3 className="text-gray-900 text-xl font-bold mb-2">Blog</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Read insights, strategies, and tips from our expert investors and analysts.
                </p>
                <div className="inline-flex items-center gap-1 text-teal-700 font-semibold text-sm group-hover:gap-2 transition-all">
                  Read Articles
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Card>
            </Link>

            {/* News */}
            <Link to="/news">
              <Card className="p-8 border-2 border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all group cursor-pointer h-full">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 mb-4 group-hover:scale-110 transition-transform">
                  <Newspaper className="h-7 w-7 text-indigo-700" />
                </div>
                <h3 className="text-gray-900 text-xl font-bold mb-2">News</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Stay updated with the latest market news and financial updates.
                </p>
                <div className="inline-flex items-center gap-1 text-indigo-700 font-semibold text-sm group-hover:gap-2 transition-all">
                  Read News
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Card>
            </Link>

            {/* Leaderboard */}
            <Link to="/fantasy">
              <Card className="p-8 border-2 border-gray-200 hover:border-yellow-300 hover:shadow-xl transition-all group cursor-pointer h-full">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 mb-4 group-hover:scale-110 transition-transform">
                  <Trophy className="h-7 w-7 text-yellow-700" />
                </div>
                <h3 className="text-gray-900 text-xl font-bold mb-2">Leaderboard</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Check your global ranking and see how you compare to other players.
                </p>
                <div className="inline-flex items-center gap-1 text-yellow-700 font-semibold text-sm group-hover:gap-2 transition-all">
                  View Rankings
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
