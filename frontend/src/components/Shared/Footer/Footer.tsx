import { Link, useLocation } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import './style/Footer.css';

export function Footer() {
  const location = useLocation();

  // Determine logo gradient based on current page
  const getLogoGradient = () => {
    if (location.pathname === "/fantasy") return "from-fantasy-primary to-fantasy-secondary";
    if (location.pathname === "/league") return "from-league-primary to-league-secondary";
    if (location.pathname === "/challenges") return "from-challenges-primary to-challenges-secondary";
    if (location.pathname === "/market") return "from-market-primary to-market-secondary";
    if (location.pathname === "/blog" || location.pathname === "/news")
      return "from-emerald-500 to-teal-400";
    return "from-emerald-500 to-teal-400";
  };

  return (
    <footer className="py-12 border-t border-gray-700 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800/90">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${getLogoGradient()} text-white`}
            >
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-gray-200">InvestorsArena</span>
          </div>
          <div className="flex gap-6">
            <Link to="/fantasy" className="text-gray-300 hover:text-emerald-400 transition-colors">
              Fantasy
            </Link>
            <Link to="/league" className="text-gray-300 hover:text-emerald-400 transition-colors">
              League
            </Link>
            <Link to="/challenges" className="text-gray-300 hover:text-emerald-400 transition-colors">
              Challenges
            </Link>
            <Link to="/market" className="text-gray-300 hover:text-emerald-400 transition-colors">
              Market
            </Link>
            <Link to="/blog" className="text-gray-300 hover:text-emerald-400 transition-colors">
              Blog
            </Link>
            <Link to="/news" className="text-gray-300 hover:text-emerald-400 transition-colors">
              News
            </Link>
          </div>
          <p className="text-gray-400 text-sm">© 2025 InvestorsArena. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
