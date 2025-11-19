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

interface LeagueDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  league: LeagueWithStats | null;
  members: LeagueMemberWithUser[];
  onJoin?: () => void;
  onLeave?: () => void;
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
  isLoading,
  loadingMembers,
}: LeagueDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);

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
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareLink = async () => {
    if (!league.join_code) return;

    const url = generateShareableUrl(league.join_code);
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <DialogTitle className="text-2xl">{league.name}</DialogTitle>
                <Badge className={`${statusConfig.color} text-white`}>
                  {statusConfig.label}
                </Badge>
                {league.is_creator && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    Creator
                  </Badge>
                )}
              </div>
              {league.description && (
                <p className="text-sm text-gray-600">{league.description}</p>
              )}
            </div>
          </div>
          <DialogClose onClick={() => onOpenChange(false)} />
        </DialogHeader>

        {/* Member Progress */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-gray-700">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">
                {league.member_count} / {league.max_players} Members
              </span>
            </div>
            <span className="text-sm text-gray-600">{Math.round(memberPercentage)}% Full</span>
          </div>
          <Progress
            value={memberPercentage}
            className="h-2"
            indicatorClassName={memberPercentage >= 90 ? "bg-orange-500" : "bg-blue-600"}
          />
        </div>

        {/* Share Code (for private leagues) */}
        {!league.is_public && league.join_code && league.is_member && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-purple-600" />
                  Private League - Share Code
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  Share this code with others to invite them
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-white rounded border border-gray-300 px-4 py-2">
                <code className="text-lg font-mono font-semibold text-purple-700">
                  {formatJoinCode(league.join_code)}
                </code>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyCode}
                className="border-purple-300"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleShareLink}
                className="border-purple-300"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="members">
              Members ({league.member_count})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Starting Cash</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(league.starting_cash)}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="text-sm">Max Stocks</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {league.max_stocks_per_portfolio}
                </div>
              </div>

              {league.start_date && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">Start Date</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDate(league.start_date)}
                  </div>
                </div>
              )}

              {league.end_date && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <span className="text-sm">Time Remaining</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {getTimeRemaining(league.end_date)}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Quick Stats
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">League Type:</span>
                  <span className="ml-2 font-medium">
                    {league.is_public ? "Public" : "Private"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <span className="ml-2 font-medium">{DURATION_LABELS[league.duration]}</span>
                </div>
                <div>
                  <span className="text-gray-600">Trade Frequency:</span>
                  <span className="ml-2 font-medium">
                    {TRADE_FREQUENCY_LABELS[league.trade_frequency]}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Fractional Shares:</span>
                  <span className="ml-2 font-medium">
                    {league.allow_fractional ? "Allowed" : "Not Allowed"}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4">League Configuration</h4>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Maximum Players</span>
                  <span className="font-medium">{league.max_players}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Starting Cash</span>
                  <span className="font-medium">{formatCurrency(league.starting_cash)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Max Stocks per Portfolio</span>
                  <span className="font-medium">{league.max_stocks_per_portfolio}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Trade Frequency</span>
                  <span className="font-medium">
                    {TRADE_FREQUENCY_LABELS[league.trade_frequency]}
                    {league.trade_limit && ` (${league.trade_limit} max)`}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">League Duration</span>
                  <span className="font-medium">{DURATION_LABELS[league.duration]}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Fractional Shares</span>
                  <span className="font-medium">
                    {league.allow_fractional ? "Allowed" : "Not Allowed"}
                  </span>
                </div>
                {league.start_date && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Start Date</span>
                    <span className="font-medium">{formatDate(league.start_date)}</span>
                  </div>
                )}
                {league.end_date && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">End Date</span>
                    <span className="font-medium">{formatDate(league.end_date)}</span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            {loadingMembers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No members yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member, index) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {member.rank && member.rank <= 3 && (
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full ${
                            member.rank === 1
                              ? "bg-yellow-100 text-yellow-600"
                              : member.rank === 2
                              ? "bg-gray-100 text-gray-600"
                              : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          <Trophy className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {member.user_name || member.user_email || `User ${index + 1}`}
                          {member.firebase_uid === league.creator_firebase_uid && (
                            <Badge className="ml-2 bg-yellow-100 text-yellow-800 text-xs">
                              Creator
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          Joined {formatDate(member.joined_at)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {member.rank && (
                        <div className="text-sm font-semibold text-gray-900">#{member.rank}</div>
                      )}
                      <div className="text-xs text-gray-600">
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
        <div className="flex gap-3 pt-4 border-t">
          {league.is_member ? (
            <>
              {!league.is_creator && onLeave && (
                <Button
                  variant="outline"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={onLeave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Leaving...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-2" />
                      Leave League
                    </>
                  )}
                </Button>
              )}
            </>
          ) : (
            onJoin && (
              <Button
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 text-white"
                onClick={onJoin}
                disabled={isLoading || league.is_full || league.status === "completed"}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
