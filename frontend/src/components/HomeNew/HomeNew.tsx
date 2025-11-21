import "../../styles/HomeNew.css";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UnifiedNav } from "../Shared/UnifiedNav/UnifiedNav";
import { Footer } from "../Shared/Footer/Footer";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ArrowRight, Users, Trophy, Target, CheckCircle2 } from "lucide-react";
import { TimelineStep } from "./TimelineStep/TimelineStep";
import { LiveMarketWidget } from "./LiveMarketWidget/LiveMarketWidget";
import { useAuth } from "../../contexts/AuthContext";

export function HomeNew() {
  const navigate = useNavigate();
  const auth = useAuth() as any;
  const user = auth?.user;

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Don't render landing page if user is logged in
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <UnifiedNav variant="home" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.05),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-gray-900 text-5xl lg:text-6xl leading-tight">
                  Fantasy Sports <br />
                  Meets the <br />
                  <span className="text-emerald-700">Stock Market</span>
                </h1>
                <p className="text-gray-600 text-xl leading-relaxed max-w-xl">
                  Build your portfolio like a fantasy team. Pick stocks in a 4-3-3 formation, compete with friends, and prove your market instincts every week.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button
                    size="lg"
                    className="h-12 px-8 bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-800 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    Start Playing Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/news">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 border-2 border-gray-300 text-gray-700 hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all"
                  >
                    Recent News
                  </Button>
                </Link>
              </div>
              {/* Trust indicators */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm text-gray-600">No real money</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm text-gray-600">100% free to play</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm text-gray-600">Real market data</span>
                </div>
              </div>
            </div>

            {/* Right: Live Market Widget */}
            <div className="relative">
              <LiveMarketWidget />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Timeline */}
      <section className="py-24 bg-gradient-to-b from-gray-100 to-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-gray-900 text-4xl">How It Works</h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
              Three simple steps to start competing. Build your portfolio and join the action.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Timeline */}
            <div className="space-y-0">
              <TimelineStep
                number="1"
                title="Pick Your Stocks"
                description="Choose 11 stocks across 3 industries plus 1 ETF. Build your portfolio in a 4-3-3 formation with your ETF as the keeper. Focus on companies you believe will perform well this week."
                icon={Target}
              />
              <TimelineStep
                number="2"
                title="Join Leagues"
                description="Compete in public leagues or create private ones with friends. Set up head-to-head matchups or join season-long competitions. The choice is yours."
                icon={Users}
              />
              <TimelineStep
                number="3"
                title="Earn Points"
                description="Watch your stocks perform in real-time. Gain points based on price movements and climb the leaderboard. Use strategy chips like Wild Card to maximize your advantage."
                icon={Trophy}
                isLast
              />
            </div>

            {/* Visual representation - 11 stocks + 1 ETF */}
            <div className="lg:sticky lg:top-8">
              <div className="p-10 bg-white rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col justify-center max-w-2xl ml-auto">
                <div className="space-y-5">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-gray-900">Your Formation</h3>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                      4-3-3 + Keeper
                    </span>
                  </div>
                  {/* Formation visualization */}
                  <div className="space-y-5">
                    {/* Row 1 - 4 defenders */}
                    <div className="grid grid-cols-4 gap-4">
                      {["AAPL", "GOOGL", "MSFT", "NVDA"].map((stock) => (
                        <div
                          key={stock}
                          className="px-5 py-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg text-center"
                        >
                          <p className="text-sm text-gray-900">{stock}</p>
                        </div>
                      ))}
                    </div>
                    {/* Row 2 - 3 midfielders */}
                    <div className="grid grid-cols-3 gap-4">
                      {["JPM", "BAC", "GS"].map((stock) => (
                        <div
                          key={stock}
                          className="px-5 py-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg text-center"
                        >
                          <p className="text-sm text-gray-900">{stock}</p>
                        </div>
                      ))}
                    </div>
                    {/* Row 3 - 3 forwards */}
                    <div className="grid grid-cols-3 gap-4">
                      {["JNJ", "PFE", "UNH"].map((stock) => (
                        <div
                          key={stock}
                          className="px-5 py-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg text-center"
                        >
                          <p className="text-sm text-gray-900">{stock}</p>
                        </div>
                      ))}
                    </div>
                    {/* Keeper - ETF */}
                    <div className="flex justify-center">
                      <div className="px-8 py-5 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-lg text-center shadow-md min-w-[140px]">
                        <p className="text-gray-900">SPY</p>
                        <p className="text-xs text-gray-600 mt-1">ETF</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Features */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-gray-900 text-4xl">Game Features</h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
              Everything you need to compete and dominate the market
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Leagues */}
            <Card className="p-8 border border-gray-200 hover:border-emerald-200 hover:shadow-lg transition-all group">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-emerald-700" />
              </div>
              <h3 className="text-gray-900 mb-2">Leagues</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Create private leagues with friends or join public competitions. Customize rules and compete throughout the season.
              </p>
            </Card>

            {/* Challenges */}
            <Card className="p-8 border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all group">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 mb-4 group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6 text-purple-700" />
              </div>
              <h3 className="text-gray-900 mb-2">Challenges</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Complete weekly challenges to earn bonus points. Test your skills with specific stock picking scenarios.
              </p>
            </Card>

            {/* Leaderboards */}
            <Card className="p-8 border border-gray-200 hover:border-indigo-200 hover:shadow-lg transition-all group">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="h-6 w-6 text-indigo-700" />
              </div>
              <h3 className="text-gray-900 mb-2">Global Leaderboards</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Track your rank globally and within your leagues. See how you stack up against top performers worldwide.
              </p>
            </Card>
          </div>

          {/* Get Started CTA Block */}
          <div className="max-w-4xl mx-auto">
            <Card className="relative overflow-hidden border-2 border-pink-200 bg-gradient-to-br from-pink-50 via-fuchsia-50 to-rose-50">
              <div className="px-12 py-6 text-center space-y-4">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 mx-auto">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-gray-900 text-2xl">Get Started Now</h3>
                  <p className="text-gray-600 max-w-xl mx-auto">
                    Join thousands of players competing every week. Sign up free and build your first portfolio in minutes.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center pt-1">
                  <Link to="/signup">
                    <Button
                      size="lg"
                      className="h-11 px-8 bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-800 hover:to-teal-700 text-white shadow-lg"
                    >
                      Create Free Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/fantasy">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-11 px-8 border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-100"
                    >
                      View Demo
                    </Button>
                  </Link>
                </div>
                <p className="text-gray-500 text-sm">
                  No credit card required · Sign up with Google or Apple ID
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
