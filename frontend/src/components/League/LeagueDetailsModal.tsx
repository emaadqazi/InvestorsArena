import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Calendar,
  Settings,
  Copy,
  Check,
  Trophy,
  Loader2,
  Share2,
  LogOut,
  Trash2,
} from "lucide-react";
import {
  LeagueWithStats,
  LeagueMemberWithUser,
  STATUS_CONFIG,
  DURATION_LABELS,
  TRADE_FREQUENCY_LABELS,
} from "../../types/league.types";
import {
  formatCurrency,
  formatDate,
  formatJoinCode,
  copyToClipboard,
  generateShareableUrl,
  getTimeRemaining,
} from "../../utils/leagueUtils";
import { showSuccessToast } from "../../utils/toastUtils";

interface LeagueDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  league: LeagueWithStats | null;
  members: LeagueMemberWithUser[];
  onJoin?: () => void;
  onLeave?: () => void;
  onDisband?: () => void;
  isLoading?: boolean;
  loadingMembers?: boolean;
}

export function LeagueDetailsModal({
  open,
  onOpenChange,
  league,
  members,
  onJoin,
  onLeave,
  onDisband,
  isLoading,
  loadingMembers,
}: LeagueDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);

  // Map status colors to modern palette
  const getStatusColor = (color: string) => {
    switch (color) {
      case 'bg-green-600':
        return 'bg-emerald-500';
      case 'bg-gray-600':
        return 'bg-gray-500';
      case 'bg-yellow-600':
        return 'bg-amber-500';
      default:
        return color;
    }
  };

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setActiveTab("overview");
      setCopied(false);
    }
  }, [open]);

  if (!league) return null;

  const statusConfig = STATUS_CONFIG[league.status];
  const memberPercentage = (league.member_count / league.max_players) * 100;

  const handleCopyCode = async () => {
    if (!league.join_code) return;

    const success = await copyToClipboard(league.join_code);
    if (success) {
      setCopied(true);
      showSuccessToast("Join code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareLink = async () => {
    if (!league.join_code) return;

    const url = generateShareableUrl(league.join_code);
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      showSuccessToast("Share link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-8">
        <DialogHeader className="space-y-4 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div>
                <DialogTitle className="text-3xl font-bold text-slate-900 mb-3">{league.name}</DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`${getStatusColor(statusConfig.color)} text-white rounded-full px-3 py-1`}
                  >
                    {statusConfig.label}
                  </Badge>
                  {league.is_creator && (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1">
                      Creator
                    </Badge>
                  )}
                </div>
              </div>
              {league.description && (
                <p className="text-base text-slate-600 leading-relaxed">{league.description}</p>
              )}
            </div>
          </div>
          <DialogClose onClick={() => onOpenChange(false)} />
        </DialogHeader>

        {/* Member Progress */}
        <div className="bg-blue-50 rounded-xl p-7 border border-blue-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-base font-semibold text-slate-900">
                {league.member_count} / {league.max_players} Members
              </span>
            </div>
            <span className="text-sm text-slate-600 font-medium">{Math.round(memberPercentage)}% Full</span>
          </div>
          <Progress
            value={memberPercentage}
            className="h-3"
            indicatorClassName={memberPercentage >= 90 ? "bg-amber-500" : "bg-blue-600"}
          />
        </div>

        {/* Share Code (for private leagues) */}
        {!league.is_public && league.join_code && league.is_member && (
          <div className="bg-purple-50 rounded-xl p-7 border border-purple-100 mb-8">
            <div className="mb-5">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2.5 text-base mb-2">
                <Share2 className="h-5 w-5 text-purple-600" />
                Private League - Share Code
              </h4>
              <p className="text-sm text-slate-600">
                Share this code with others to invite them
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 bg-white rounded-lg border border-purple-200 px-5 py-4 shadow-sm">
                <code className="text-xl font-mono font-bold text-purple-700 tracking-wider">
                  {formatJoinCode(league.join_code)}
                </code>
              </div>
              <Button
                size="lg"
                variant="outline"
                onClick={handleCopyCode}
                className="border-purple-200 hover:bg-purple-100 transition-colors px-4"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Copy className="h-5 w-5 text-purple-600" />
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleShareLink}
                className="border-purple-200 hover:bg-purple-100 transition-colors px-4"
              >
                <Share2 className="h-5 w-5 text-purple-600" />
              </Button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1.5 mb-8">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="rules"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
            >
              Rules
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
            >
              Members ({league.member_count})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                <div className="flex items-center gap-2.5 mb-3">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-600">Starting Cash</span>
                </div>
                <div className="text-3xl font-bold text-slate-900">
                  {formatCurrency(league.starting_cash)}
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center gap-2.5 mb-3">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600">Max Stocks</span>
                </div>
                <div className="text-3xl font-bold text-slate-900">
                  {league.max_stocks_per_portfolio}
                </div>
              </div>

              {league.start_date && (
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-slate-600">Start Date</span>
                  </div>
                  <div className="text-xl font-semibold text-slate-900">
                    {formatDate(league.start_date)}
                  </div>
                </div>
              )}

              {league.end_date && (
                <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <span className="text-sm font-medium text-slate-600">Time Remaining</span>
                  </div>
                  <div className="text-xl font-semibold text-slate-900">
                    {getTimeRemaining(league.end_date)}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2.5 text-base">
                <Settings className="h-5 w-5 text-slate-600" />
                Quick Stats
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-600 font-medium">League Type</span>
                  <span className="font-semibold text-slate-900">
                    {league.is_public ? "Public" : "Private"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-600 font-medium">Duration</span>
                  <span className="font-semibold text-slate-900">{DURATION_LABELS[league.duration]}</span>
                </div>
                <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-600 font-medium">Trade Frequency</span>
                  <span className="font-semibold text-slate-900">
                    {TRADE_FREQUENCY_LABELS[league.trade_frequency]}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-600 font-medium">Fractional Shares</span>
                  <span className="font-semibold text-slate-900">
                    {league.allow_fractional ? "Allowed" : "Not Allowed"}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-7">
              <h4 className="font-semibold text-slate-900 mb-6 text-lg">League Configuration</h4>
              <div className="space-y-0">
                <div className="flex justify-between items-center py-4 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Maximum Players</span>
                  <span className="font-semibold text-slate-900">{league.max_players}</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Starting Cash</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(league.starting_cash)}</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Max Stocks per Portfolio</span>
                  <span className="font-semibold text-slate-900">{league.max_stocks_per_portfolio}</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Trade Frequency</span>
                  <span className="font-semibold text-slate-900">
                    {TRADE_FREQUENCY_LABELS[league.trade_frequency]}
                    {league.trade_limit && ` (${league.trade_limit} max)`}
                  </span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">League Duration</span>
                  <span className="font-semibold text-slate-900">{DURATION_LABELS[league.duration]}</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Fractional Shares</span>
                  <span className="font-semibold text-slate-900">
                    {league.allow_fractional ? "Allowed" : "Not Allowed"}
                  </span>
                </div>
                {league.start_date && (
                  <div className="flex justify-between items-center py-4 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Start Date</span>
                    <span className="font-semibold text-slate-900">{formatDate(league.start_date)}</span>
                  </div>
                )}
                {league.end_date && (
                  <div className="flex justify-between items-center py-4">
                    <span className="text-slate-600 font-medium">End Date</span>
                    <span className="font-semibold text-slate-900">{formatDate(league.end_date)}</span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            {loadingMembers ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-7 w-7 animate-spin text-slate-600" />
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-200">
                <Users className="h-14 w-14 mx-auto mb-4 text-slate-400" />
                <p className="font-semibold text-slate-900 text-base">No members yet</p>
                <p className="text-sm mt-2 text-slate-600">Be the first to join this league!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member, index) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-4">
                      {member.rank && member.rank <= 3 && (
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full shadow-sm ${
                            member.rank === 1
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white"
                              : member.rank === 2
                              ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white"
                              : "bg-gradient-to-br from-orange-400 to-orange-500 text-white"
                          }`}
                        >
                          <Trophy className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-slate-900 text-base flex items-center gap-2">
                          {member.user_name || member.user_email || `User ${index + 1}`}
                          {member.firebase_uid === league.creator_firebase_uid && (
                            <Badge className="bg-amber-50 text-amber-700 text-xs border-amber-200 px-2 py-0.5">
                              Creator
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-slate-500 mt-1">
                          Joined {formatDate(member.joined_at)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {member.rank && (
                        <div className="text-base font-bold text-slate-900">#{member.rank}</div>
                      )}
                      <div className="text-sm text-slate-600 font-medium mt-1">
                        {formatCurrency(member.current_value)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-6 pt-8 mt-8 border-t border-slate-200">
          {league.is_member ? (
            <>
              {!league.is_creator && onLeave && (
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-medium transition-colors h-12"
                  onClick={onLeave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Leaving...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-5 w-5 mr-2" />
                      Leave League
                    </>
                  )}
                </Button>
              )}
              {league.is_creator && onDisband && (
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-medium transition-colors h-12"
                  onClick={onDisband}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Disbanding...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-5 w-5 mr-2" />
                      Disband League
                    </>
                  )}
                </Button>
              )}
            </>
          ) : (
            onJoin && (
              <Button
                size="lg"
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 font-medium shadow-sm hover:shadow-md transition-all h-12"
                onClick={onJoin}
                disabled={isLoading || league.is_full || league.status === "completed"}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : league.is_full ? (
                  "League Full"
                ) : league.status === "completed" ? (
                  "League Ended"
                ) : (
                  "Join League"
                )}
              </Button>
            )
          )}
          <Button
            size="lg"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-300 hover:bg-slate-50 text-slate-700 font-medium transition-colors h-12 px-8"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
