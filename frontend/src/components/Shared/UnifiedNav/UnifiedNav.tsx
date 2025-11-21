import { Link, useLocation, useNavigate } from "react-router-dom";
import { TrendingUp, Settings, LogOut, ChevronDown } from "lucide-react";
import { Button } from "../../ui/button";
import { useAuth } from "../../../contexts/AuthContext";
import { AuthContextType } from "../../../contexts/AuthContext.types";
import { useState, useRef, useEffect } from "react";
import './style/UnifiedNav.css';

interface NavItem {
  label: string;
  path: string;
}

interface UnifiedNavProps {
  variant: "home" | "fantasy";
}

const homeNavItems: NavItem[] = [];

const fantasyNavItems: NavItem[] = [
  { label: "Fantasy", path: "/fantasy" },
  { label: "League", path: "/league" },
  { label: "Challenges", path: "/challenges" },
  { label: "Market", path: "/market" },
];

export function UnifiedNav({ variant }: UnifiedNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = variant === "home" ? homeNavItems : fantasyNavItems;
  const { user, isAuthenticated, signOut, getUserDisplayName, getUserInitials, getUserPhotoURL } = useAuth() as AuthContextType;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setIsDropdownOpen(false);
    navigate('/');
  };

  const getLogoGradient = () => {
    if (location.pathname === "/fantasy") return "from-emerald-600 to-teal-500";
    if (location.pathname === "/league") return "from-emerald-600 to-teal-500";
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
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 group">
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

          {/* Auth Buttons / Profile Dropdown */}
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all"
              >
                {getUserPhotoURL() ? (
                  <img
                    src={getUserPhotoURL() || ''}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-semibold text-sm">
                    {getUserInitials()}
                  </div>
                )}
                <span className="hidden sm:inline text-gray-700 font-medium">
                  {getUserDisplayName()}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>

                  <button
                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors text-gray-400 cursor-not-allowed"
                    disabled
                  >
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">Profile Settings</span>
                    <span className="ml-auto text-xs bg-gray-100 px-2 py-0.5 rounded-full">Soon</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-red-50 transition-colors text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : variant === "home" && (
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

