import { Link, useLocation } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { Button } from "../../ui/button";
import './style/UnifiedNav.css';

interface NavItem {
  label: string;
  path: string;
}

interface UnifiedNavProps {
  variant: "home" | "fantasy";
}

const homeNavItems: NavItem[] = [
  { label: "Fantasy", path: "/fantasy" },
  { label: "Blog", path: "/blog" },
  { label: "News", path: "/news" },
];

const fantasyNavItems: NavItem[] = [
  { label: "Fantasy", path: "/fantasy" },
  { label: "League", path: "/league" },
  { label: "Challenges", path: "/challenges" },
  { label: "Market", path: "/market" },
];

export function UnifiedNav({ variant }: UnifiedNavProps) {
  const location = useLocation();
  const navItems = variant === "home" ? homeNavItems : fantasyNavItems;

  const getLogoGradient = () => {
    if (location.pathname === "/fantasy") return "from-emerald-600 to-teal-500";
    if (location.pathname === "/league") return "from-blue-600 to-indigo-500";
    if (location.pathname === "/challenges") return "from-purple-600 to-pink-500";
    if (location.pathname === "/market") return "from-orange-600 to-red-500";
    if (location.pathname === "/blog" || location.pathname === "/news")
      return "from-emerald-500 to-teal-400";
    return "from-emerald-500 to-teal-400";
  };

  const getActiveGradient = () => getLogoGradient();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/80 border-b border-gray-200/50 shadow-sm">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${getLogoGradient()} text-white shadow-lg group-hover:scale-105 transition-transform`}
            >
              <TrendingUp className="h-6 w-6" />
            </div>
            <span
              className={`hidden sm:inline-block bg-gradient-to-r ${getLogoGradient()} bg-clip-text text-transparent`}
            >
              InvestorsArena
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex gap-2 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <button
                    className={`px-6 py-2 rounded-xl transition-all ${
                      isActive
                        ? `bg-gradient-to-r ${getActiveGradient()} text-white shadow-md`
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* Auth Buttons - Home Variant */}
          {variant === "home" && (
            <div className="flex items-center gap-3">
              <Link to="/signin">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:bg-gray-100 text-base font-normal h-10 px-4 py-2"
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
          )}
        </div>
      </div>
    </header>
  );
}

