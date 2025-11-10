import { Link, useLocation } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { Button } from "../../ui/button";
import './style/HomeNav.css';

const navItems = [
  { label: "Fantasy", path: "/fantasy" },
  { label: "Blog", path: "/blog" },
  { label: "News", path: "/news" },
];

export function HomeNav() {
  const location = useLocation();

  return (
    <header className="fixed top-0 z-50 w-full bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800/90 backdrop-blur-md border-b border-gray-600">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-md group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6" />
            </div>
            <span className="hidden sm:inline-block text-base text-gray-200">InvestorArena</span>
          </Link>

          {/* Middle: Nav Items */}
          <nav className="flex gap-6">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <button
                    className={`px-3 py-2 rounded-md text-base font-normal transition-all ${
                      isActive
                        ? "text-emerald-400 border-b-2 border-emerald-400"
                        : "text-gray-300 hover:text-emerald-400"
                    }`}
                  >
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* Right: Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link to="/signin">
              <Button
                variant="ghost"
                className="text-gray-200 hover:bg-gray-700 text-base font-normal h-10 px-4 py-2"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-400 text-white hover:opacity-90 shadow-md text-base font-normal h-10 px-4 py-2">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
