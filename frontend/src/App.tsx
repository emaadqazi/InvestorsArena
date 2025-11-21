import { HashRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { HomeNew } from "./pages/HomeNew";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import { AuthProvider } from "./contexts/AuthContext";
import { Dashboard } from "./pages/Dashboard";
import { FantasyNew } from "./pages/FantasyNew";
import { LeagueNew } from "./pages/LeagueNew";
import { CreateTeam } from "./pages/CreateTeam";
import { PickTeamNew } from "./pages/PickTeamNew";
import { TeamDetails } from "./pages/TeamDetails";
import { TeamValueRank } from "./pages/TeamValueRank";
import { Transfers } from "./pages/Transfers";
import { ChallengesNew } from "./pages/ChallengesNew";
import { MarketNew } from "./pages/MarketNew";
import { BlogNew } from "./pages/BlogNew";
import { NewsNew } from "./pages/NewsNew";

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomeNew />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/fantasy" element={<FantasyNew />} />
          <Route path="/league" element={<LeagueNew />} />
          <Route path="/create-team" element={<CreateTeam />} />
          <Route path="/pick-team" element={<PickTeamNew />} />
          <Route path="/team-details" element={<TeamDetails />} />
          <Route path="/team-value-rank" element={<TeamValueRank />} />
          <Route path="/transfers" element={<Transfers />} />
          <Route path="/challenges" element={<ChallengesNew />} />
          <Route path="/market" element={<MarketNew />} />
          <Route path="/blog" element={<BlogNew />} />
          <Route path="/news" element={<NewsNew />} />
        </Routes>
      </HashRouter>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            maxWidth: '500px',
          },
        }}
      />
    </AuthProvider>
  );
}

