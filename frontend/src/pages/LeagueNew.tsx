import "../styles/LeagueNew.css";
import { useState, useEffect } from "react";
import { UnifiedNav } from "../components/Shared/UnifiedNav/UnifiedNav";
import { Footer } from "../components/Shared/Footer/Footer";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Select, SelectItem } from "../components/ui/select";
import {
  Plus,
  Search,
  Key,
  Loader2,
  AlertCircle,
  TrendingUp,
  Users,
} from "lucide-react";
import { CreateLeagueModal } from "../components/League/CreateLeagueModal";
import { JoinLeagueModal } from "../components/League/JoinLeagueModal";
import { LeagueDetailsModal } from "../components/League/LeagueDetailsModal";
import { LeagueCard } from "../components/League/LeagueCard";
import {
  LeagueWithStats,
  LeagueMemberWithUser,
  CreateLeagueFormData,
  LeagueStatus,
} from "../types/league.types";
import {
  createLeague,
  getPublicLeagues,
  getUserLeagues,
  joinLeague,
  joinLeagueByCode,
  leaveLeague,
  getLeagueMembers,
} from "../services/leagueService";
import { sortLeagues, filterLeagues } from "../utils/leagueUtils";
import { useAuth } from "../contexts/AuthContext";
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } from "../utils/toastUtils";

export function LeagueNew() {
  // Get current user from Firebase Auth (must be first - before any conditional returns)
  const auth = useAuth() as any;
  const user = auth.user;
  const authLoading = auth.loading;

  const [activeTab, setActiveTab] = useState("public");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<LeagueWithStats | null>(null);
  const [leagueMembers, setLeagueMembers] = useState<LeagueMemberWithUser[]>([]);

  // Data states
  const [publicLeagues, setPublicLeagues] = useState<LeagueWithStats[]>([]);
  const [myLeagues, setMyLeagues] = useState<LeagueWithStats[]>([]);
  const [loadingPublic, setLoadingPublic] = useState(true);
  const [loadingMy, setLoadingMy] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeagueStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "most_members">("newest");

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Load leagues on mount (only when user is available)
  useEffect(() => {
    if (user) {
      loadPublicLeagues();
      loadMyLeagues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Show loading state while authenticating
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="p-10 text-center max-w-md border-slate-200 shadow-lg">
          <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Authentication Required</h2>
          <p className="text-slate-600 mb-6 text-base leading-relaxed">Please sign in to view and create leagues.</p>
          <Button
            className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
            onClick={() => window.location.href = '/signin'}
          >
            Go to Sign In
          </Button>
        </Card>
      </div>
    );
  }

  const loadPublicLeagues = async () => {
    if (!user) return;
    setLoadingPublic(true);
    setError(null);
    try {
      const { data, error: err } = await getPublicLeagues(user.uid);
      if (err) {
        if (err.message?.includes('User not found')) {
          setError("Your account is not in the database. Please contact support.");
        } else {
          throw err;
        }
        return;
      }
      setPublicLeagues(data || []);
    } catch (err: any) {
      console.error("Error loading public leagues:", err);
      setError("Failed to load public leagues. Please check your Supabase configuration.");
    } finally {
      setLoadingPublic(false);
    }
  };

  const loadMyLeagues = async () => {
    if (!user) return;
    setLoadingMy(true);
    setError(null);
    try {
      const { data, error: err } = await getUserLeagues(user.uid);
      if (err) throw err;
      setMyLeagues(data || []);
    } catch (err: any) {
      console.error("Error loading my leagues:", err);
      setError("Failed to load your leagues.");
    } finally {
      setLoadingMy(false);
    }
  };

  const loadLeagueMembers = async (leagueId: string) => {
    if (!user) return;
    setLoadingMembers(true);
    try {
      const { data, error: err } = await getLeagueMembers(user.uid, leagueId);
      if (err) throw err;
      setLeagueMembers(data || []);
    } catch (err: any) {
      console.error("Error loading league members:", err);
      setLeagueMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleCreateLeague = async (formData: CreateLeagueFormData) => {
    if (!user) return;

    const loadingToast = showLoadingToast('Creating league...');
    setActionLoading(true);

    try {
      const { data, error: err } = await createLeague(user.uid, formData);

      dismissToast(loadingToast);

      if (err) {
        // Check for specific error messages
        if (err.message?.includes('User not found')) {
          showErrorToast("Cannot create league: Your account is not in the database. Please contact support.");
        } else {
          showErrorToast(err.message || 'Failed to create league. Please try again.');
        }
        throw err;
      }

      // Refresh leagues
      await loadMyLeagues();
      if (formData.is_public) {
        await loadPublicLeagues();
      }

      // Show success message
      showSuccessToast(`League "${data?.name}" created successfully!`);
      console.log("✅ League created successfully:", data?.name);
    } catch (err: any) {
      console.error("Error creating league:", err);
      throw new Error("Failed to create league. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinLeague = async (leagueId: string) => {
    if (!user) return;

    const loadingToast = showLoadingToast('Joining league...');
    setActionLoading(true);

    try {
      const { data, error: err } = await joinLeague(user.uid, leagueId);

      dismissToast(loadingToast);

      if (err) {
        showErrorToast(err.message || "Failed to join league");
        throw err;
      }

      // Refresh leagues
      await loadMyLeagues();
      await loadPublicLeagues();

      // Close details modal if open
      setShowDetailsModal(false);

      showSuccessToast("Successfully joined league!");
      console.log("✅ Successfully joined league");
    } catch (err: any) {
      console.error("Error joining league:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinByCode = async (joinCode: string) => {
    if (!user) return;

    const loadingToast = showLoadingToast('Joining league...');
    setActionLoading(true);

    try {
      const { error: err } = await joinLeagueByCode(user.uid, joinCode);

      dismissToast(loadingToast);

      if (err) {
        showErrorToast(err.message || "Invalid join code or failed to join league");
        throw err;
      }

      // Refresh leagues
      await loadMyLeagues();

      showSuccessToast("Successfully joined league with code!");
      console.log("✅ Successfully joined league with code");
    } catch (err: any) {
      console.error("Error joining league by code:", err);
      throw new Error(err.message || "Invalid join code or failed to join league");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveLeague = async (leagueId: string) => {
    if (!user) return;
    // eslint-disable-next-line no-restricted-globals
    if (!confirm("Are you sure you want to leave this league?")) return;

    const loadingToast = showLoadingToast('Leaving league...');
    setActionLoading(true);

    try {
      const { error: err } = await leaveLeague(user.uid, leagueId);

      dismissToast(loadingToast);

      if (err) {
        showErrorToast("Failed to leave league");
        throw err;
      }

      // Refresh leagues
      await loadMyLeagues();
      await loadPublicLeagues();

      // Close details modal if open
      setShowDetailsModal(false);

      showSuccessToast("Successfully left league");
      console.log("✅ Successfully left league");
    } catch (err: any) {
      console.error("Error leaving league:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewLeague = (leagueId: string) => {
    const league =
      publicLeagues.find((l) => l.id === leagueId) ||
      myLeagues.find((l) => l.id === leagueId);

    if (league) {
      setSelectedLeague(league);
      loadLeagueMembers(leagueId);
      setShowDetailsModal(true);
    }
  };

  // Filter and sort leagues
  const getFilteredLeagues = (leagues: LeagueWithStats[]) => {
    let filtered = leagues;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filterLeagues(filtered, { search: searchQuery });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filterLeagues(filtered, { status: [statusFilter] });
    }

    // Apply sorting
    filtered = sortLeagues(filtered, sortBy);

    return filtered;
  };

  const filteredPublicLeagues = getFilteredLeagues(publicLeagues);
  const filteredMyLeagues = getFilteredLeagues(myLeagues);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-slate-50/50 to-slate-100">
      <UnifiedNav variant="fantasy" />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-start justify-between mb-8">
              <div className="flex-1">
                <h1 className="text-5xl font-bold text-slate-900 mb-3 tracking-tight">Leagues</h1>
                <p className="text-lg text-slate-600 max-w-4xl leading-relaxed">
                  Compete with investors, showcase your strategy, and climb the leaderboard in fantasy stock leagues.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-300 hover:bg-slate-100 text-slate-700 shadow-sm"
                  onClick={() => setShowJoinModal(true)}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Join with Code
                </Button>
                <Button
                  size="lg"
                  className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create League
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6">
              <Card className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-slate-700" />
                  </div>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-0">
                    Active
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{myLeagues.length}</div>
                <div className="text-sm text-slate-600 font-medium">My Leagues</div>
              </Card>

              <Card className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-emerald-600" />
                  </div>
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-0">
                    Open
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{publicLeagues.length}</div>
                <div className="text-sm text-slate-600 font-medium">Public Leagues</div>
              </Card>

              <Card className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center">
                    <Key className="h-6 w-6 text-violet-600" />
                  </div>
                  <Badge variant="secondary" className="bg-violet-50 text-violet-700 border-0">
                    Private
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {myLeagues.filter((l) => !l.is_public).length}
                </div>
                <div className="text-sm text-slate-600 font-medium">Private Leagues</div>
              </Card>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 shadow-sm">
              <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-rose-900 font-semibold">Error loading leagues</p>
                <p className="text-rose-700 text-sm mt-1.5">{error}</p>
                <p className="text-rose-600 text-sm mt-2">
                  Make sure you've run the database schema SQL and configured your Supabase
                  environment variables.
                </p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8 bg-white border border-slate-200 p-1 shadow-sm">
              <TabsTrigger
                value="my"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=inactive]:text-slate-600 font-medium"
              >
                My Leagues
                {myLeagues.length > 0 && (
                  <Badge className="ml-2 bg-slate-100 text-slate-700 data-[state=active]:bg-slate-800 data-[state=active]:text-white border-0">
                    {myLeagues.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="public"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=inactive]:text-slate-600 font-medium"
              >
                Public Leagues
                {publicLeagues.length > 0 && (
                  <Badge className="ml-2 bg-slate-100 text-slate-700 data-[state=active]:bg-slate-800 data-[state=active]:text-white border-0">
                    {publicLeagues.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="flex gap-4 mb-8">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search leagues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-slate-400 h-11"
                  />
                </div>
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as LeagueStatus | "all")}
              >
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </Select>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as "newest" | "most_members")}
              >
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="most_members">Most Members</SelectItem>
              </Select>
            </div>

            {/* My Leagues Tab */}
            <TabsContent value="my">
              {loadingMy ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
                </div>
              ) : filteredMyLeagues.length === 0 ? (
                <Card className="p-12 text-center bg-white border-slate-200 shadow-sm">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                      <Plus className="h-8 w-8 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {searchQuery || statusFilter !== "all"
                        ? "No leagues found"
                        : "No leagues yet"}
                    </h3>
                    <p className="text-slate-600 text-base mb-7 leading-relaxed">
                      {searchQuery || statusFilter !== "all"
                        ? "Try adjusting your search or filters"
                        : "Create your first league or join an existing one to get started"}
                    </p>
                    {!searchQuery && statusFilter === "all" && (
                      <div className="flex gap-3 justify-center">
                        <Button
                          className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                          onClick={() => setShowCreateModal(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create League
                        </Button>
                        <Button
                          variant="outline"
                          className="border-slate-300 text-slate-700 hover:bg-slate-50"
                          onClick={() => setActiveTab("public")}
                        >
                          Browse Public Leagues
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredMyLeagues.map((league) => (
                    <LeagueCard
                      key={league.id}
                      league={league}
                      onView={handleViewLeague}
                      onLeave={handleLeaveLeague}
                      isLoading={actionLoading}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Public Leagues Tab */}
            <TabsContent value="public">
              {loadingPublic ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
                </div>
              ) : filteredPublicLeagues.length === 0 ? (
                <Card className="p-12 text-center bg-white border-slate-200 shadow-sm">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                      <Search className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No public leagues found</h3>
                    <p className="text-slate-600 text-base mb-7 leading-relaxed">
                      {searchQuery || statusFilter !== "all"
                        ? "Try adjusting your search or filters"
                        : "Be the first to create a public league!"}
                    </p>
                    {!searchQuery && statusFilter === "all" && (
                      <Button
                        className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                        onClick={() => setShowCreateModal(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Public League
                      </Button>
                    )}
                  </div>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredPublicLeagues.map((league) => (
                    <LeagueCard
                      key={league.id}
                      league={league}
                      onJoin={handleJoinLeague}
                      onView={handleViewLeague}
                      onLeave={handleLeaveLeague}
                      isLoading={actionLoading}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* Modals */}
      <CreateLeagueModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateLeague}
      />

      <JoinLeagueModal
        open={showJoinModal}
        onOpenChange={setShowJoinModal}
        onSubmit={handleJoinByCode}
      />

      <LeagueDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        league={selectedLeague}
        members={leagueMembers}
        onJoin={selectedLeague && !selectedLeague.is_member ? () => handleJoinLeague(selectedLeague.id) : undefined}
        onLeave={selectedLeague && selectedLeague.is_member && !selectedLeague.is_creator ? () => handleLeaveLeague(selectedLeague.id) : undefined}
        isLoading={actionLoading}
        loadingMembers={loadingMembers}
      />
    </div>
  );
}
