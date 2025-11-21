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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50/50 to-slate-100">
      <UnifiedNav variant="fantasy" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-slate-900 mb-3 tracking-tight">
              Dashboard
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
              Manage your portfolio, compete in leagues, and track your performance
            </p>
          </div>
        </div>
      </section>

      {/* Main Dashboard Grid */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Fantasy */}
            <Link to="/fantasy">
              <Card className="p-7 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all group cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-slate-900 text-lg font-semibold mb-2">Fantasy Portfolio</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Build and manage your stock portfolio. Pick your team and track real-time performance.
                </p>
              </Card>
            </Link>

            {/* League */}
            <Link to="/league">
              <Card className="p-7 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all group cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-slate-900 text-lg font-semibold mb-2">Leagues</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Join or create leagues with friends. Compete for the top spot on the leaderboard.
                </p>
              </Card>
            </Link>

            {/* Challenges */}
            <Link to="/challenges">
              <Card className="p-7 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all group cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-slate-900 text-lg font-semibold mb-2">Challenges</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Complete weekly challenges to earn bonus points and test your investment strategies.
                </p>
              </Card>
            </Link>

            {/* Market */}
            <Link to="/market">
              <Card className="p-7 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all group cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                    <LineChart className="h-6 w-6 text-orange-600" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-slate-900 text-lg font-semibold mb-2">Market</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Explore stock prices, trends, and market data to make informed decisions.
                </p>
              </Card>
            </Link>

            {/* Blog */}
            <Link to="/blog">
              <Card className="p-7 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all group cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-teal-600" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-slate-900 text-lg font-semibold mb-2">Blog</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Read insights, strategies, and tips from our expert investors and analysts.
                </p>
              </Card>
            </Link>

            {/* News */}
            <Link to="/news">
              <Card className="p-7 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all group cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <Newspaper className="h-6 w-6 text-indigo-600" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-slate-900 text-lg font-semibold mb-2">News</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Stay updated with the latest market news and financial updates.
                </p>
              </Card>
            </Link>

            {/* Leaderboard */}
            <Link to="/fantasy">
              <Card className="p-7 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all group cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-amber-600" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-slate-900 text-lg font-semibold mb-2">Leaderboard</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Check your global ranking and see how you compare to other players.
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
