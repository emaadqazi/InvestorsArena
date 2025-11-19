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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to view and create leagues.</p>
          <Button onClick={() => window.location.href = '/signin'}>
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
    setActionLoading(true);
    try {
      const { data, error: err } = await createLeague(user.uid, formData);
      if (err) {
        // Check for specific error messages
        if (err.message?.includes('User not found')) {
          alert("Cannot create league: Your account is not in the database. Please contact support.");
        } else {
          alert(`Error creating league: ${err.message || 'Unknown error'}`);
        }
        throw err;
      }

      // Refresh leagues
      await loadMyLeagues();
      if (formData.is_public) {
        await loadPublicLeagues();
      }

      // Show success message
      alert(`✅ League "${data?.name}" created successfully!`);
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
    setActionLoading(true);
    try {
      const { error: err } = await joinLeague(user.uid, leagueId);
      if (err) throw err;

      // Refresh leagues
      await loadMyLeagues();
      await loadPublicLeagues();

      // Close details modal if open
      setShowDetailsModal(false);

      console.log("✅ Successfully joined league");
    } catch (err: any) {
      console.error("Error joining league:", err);
      alert(err.message || "Failed to join league");
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinByCode = async (joinCode: string) => {
    if (!user) return;
    setActionLoading(true);
    try {
      const { error: err } = await joinLeagueByCode(user.uid, joinCode);
      if (err) throw err;

      // Refresh leagues
      await loadMyLeagues();

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

    setActionLoading(true);
    try {
      const { error: err } = await leaveLeague(user.uid, leagueId);
      if (err) throw err;

      // Refresh leagues
      await loadMyLeagues();
      await loadPublicLeagues();

      // Close details modal if open
      setShowDetailsModal(false);

      console.log("✅ Successfully left league");
    } catch (err: any) {
      console.error("Error leaving league:", err);
      alert("Failed to leave league");
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background decorative shapes */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />

      <UnifiedNav variant="fantasy" />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-[1600px] px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Leagues</h1>
                <p className="text-gray-600">
                  Compete with other investors in fantasy stock leagues
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  className="bg-gradient-to-r from-purple-600 to-pink-500 text-white"
                  onClick={() => setShowJoinModal(true)}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Join with Code
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create League
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-white border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">My Leagues</div>
                    <div className="text-2xl font-bold text-gray-900">{myLeagues.length}</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-green-50 to-white border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Plus className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Public Leagues</div>
                    <div className="text-2xl font-bold text-gray-900">{publicLeagues.length}</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-purple-50 to-white border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Key className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Private Leagues</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {myLeagues.filter((l) => !l.is_public).length}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Error loading leagues</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <p className="text-red-600 text-sm mt-2">
                  Make sure you've run the database schema SQL and configured your Supabase
                  environment variables.
                </p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="my">
                My Leagues
                {myLeagues.length > 0 && (
                  <Badge className="ml-2 bg-blue-600 text-white">{myLeagues.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="public">
                Public Leagues
                {publicLeagues.length > 0 && (
                  <Badge className="ml-2 bg-green-600 text-white">{publicLeagues.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search leagues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
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
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : filteredMyLeagues.length === 0 ? (
                <Card className="p-12 text-center bg-white/80 backdrop-blur-sm">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {searchQuery || statusFilter !== "all"
                        ? "No leagues found"
                        : "No leagues yet"}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchQuery || statusFilter !== "all"
                        ? "Try adjusting your search or filters"
                        : "Create your first league or join an existing one to get started"}
                    </p>
                    {!searchQuery && statusFilter === "all" && (
                      <div className="flex gap-3 justify-center">
                        <Button onClick={() => setShowCreateModal(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create League
                        </Button>
                        <Button variant="outline" onClick={() => setActiveTab("public")}>
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
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : filteredPublicLeagues.length === 0 ? (
                <Card className="p-12 text-center bg-white/80 backdrop-blur-sm">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No public leagues found</h3>
                    <p className="text-gray-600 mb-6">
                      {searchQuery || statusFilter !== "all"
                        ? "Try adjusting your search or filters"
                        : "Be the first to create a public league!"}
                    </p>
                    {!searchQuery && statusFilter === "all" && (
                      <Button onClick={() => setShowCreateModal(true)}>
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
