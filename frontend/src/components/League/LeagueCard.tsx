import { Users, Clock, DollarSign, Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { LeagueWithStats, STATUS_CONFIG } from "../../types/league.types";
import { formatCurrency, formatDate, formatJoinCode, copyToClipboard, isLeagueJoinable } from "../../utils/leagueUtils";
import { showSuccessToast } from "../../utils/toastUtils";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { Tooltip } from "../ui/tooltip";

interface LeagueCardProps {
  league: LeagueWithStats;
  onJoin?: (leagueId: string) => void;
  onView?: (leagueId: string) => void;
  onLeave?: (leagueId: string) => void;
  isLoading?: boolean;
}

export function LeagueCard({ league, onJoin, onView, onLeave, isLoading }: LeagueCardProps) {
  const [copied, setCopied] = useState(false);
  const statusConfig = STATUS_CONFIG[league.status];
  const memberPercentage = (league.member_count / league.max_players) * 100;
  const canJoin = isLeagueJoinable(league);

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

  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!league.join_code) return;

    const success = await copyToClipboard(league.join_code);
    if (success) {
      setCopied(true);
      showSuccessToast("Join code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card
      className={`group relative p-6 bg-white border transition-all duration-300 hover:shadow-xl cursor-pointer overflow-hidden ${
        league.is_member
          ? "border-emerald-200 hover:border-emerald-300"
          : "border-gray-100 hover:border-blue-200"
      }`}
      onClick={() => onView?.(league.id)}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/30 pointer-events-none" />

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className="font-semibold text-lg text-gray-900 group-hover:text-emerald-600 transition-colors truncate">
                {league.name}
              </h4>
              {league.is_creator && (
                <Badge className="bg-amber-50 text-amber-700 text-xs border-amber-200 font-medium px-2 py-0.5">
                  Creator
                </Badge>
              )}
            </div>
            {league.description && (
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{league.description}</p>
            )}
          </div>
          <Badge
            className={`${getStatusColor(statusConfig.color)} text-white ml-3 shrink-0 rounded-full px-3 py-1 text-xs font-medium shadow-sm`}
          >
            {statusConfig.label}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Member Count */}
          <div className="bg-gradient-to-br from-blue-50 to-transparent rounded-xl p-3 border border-blue-100/50">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1.5">
              <Users className="h-3.5 w-3.5 text-blue-600" />
              <span className="font-medium">Members</span>
            </div>
            <div className="text-base font-semibold text-gray-900 mb-1.5">
              {league.member_count}/{league.max_players}
            </div>
            <Progress
              value={memberPercentage}
              className="h-1.5"
              indicatorClassName={memberPercentage >= 90 ? "bg-amber-500" : "bg-blue-600"}
            />
          </div>

          {/* Starting Cash */}
          <div className="bg-gradient-to-br from-emerald-50 to-transparent rounded-xl p-3 border border-emerald-100/50">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1.5">
              <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-medium">Starting Cash</span>
            </div>
            <div className="text-base font-semibold text-gray-900">
              {formatCurrency(league.starting_cash)}
            </div>
          </div>
        </div>

        {/* Start Date */}
        {league.start_date && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-4 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {league.status === "upcoming" ? "Starts" : "Started"}: {formatDate(league.start_date)}
            </span>
          </div>
        )}

        {/* Join Code (for private leagues the user is a member of) */}
        {league.is_member && !league.is_public && league.join_code && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200/50 rounded-xl p-3 mb-4">
            <div className="text-xs text-gray-600 mb-1.5 font-medium">Share Code:</div>
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm font-mono font-bold text-purple-700 tracking-wider">
                {formatJoinCode(league.join_code)}
              </code>
              <Tooltip content={copied ? "Copied!" : "Copy code"}>
                <button
                  onClick={handleCopyCode}
                  className="p-2 hover:bg-white/80 rounded-lg transition-colors flex-shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-purple-600" />
                  )}
                </button>
              </Tooltip>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2.5 mt-4">
          {league.is_member ? (
            <>
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-sm hover:shadow-md transition-all font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.(league.id);
                }}
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                View Details
              </Button>
              {!league.is_creator && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLeave?.(league.id);
                  }}
                  disabled={isLoading}
                >
                  Leave
                </Button>
              )}
            </>
          ) : (
            <>
              {canJoin ? (
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-sm hover:shadow-md transition-all font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    onJoin?.(league.id);
                  }}
                  disabled={isLoading}
                >
                  Join League
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="flex-1 bg-gray-100 text-gray-500 cursor-not-allowed font-medium"
                  variant="outline"
                  disabled
                >
                  {league.is_full ? "Full" : league.status === "completed" ? "Ended" : "Can't Join"}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="border-gray-200 hover:bg-gray-50 transition-colors font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.(league.id);
                }}
              >
                View
              </Button>
            </>
          )}
        </div>

        {/* Full indicator */}
        {league.is_full && !league.is_member && (
          <div className="mt-3 text-xs text-center text-amber-600 font-medium bg-amber-50 rounded-lg py-2 border border-amber-200/50">
            This league is currently full
          </div>
        )}
      </div>
    </Card>
  );
}
