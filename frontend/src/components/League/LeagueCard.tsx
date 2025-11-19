import { Users, Clock, DollarSign, Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { LeagueWithStats, STATUS_CONFIG } from "../../types/league.types";
import { formatCurrency, formatDate, formatJoinCode, copyToClipboard, isLeagueJoinable } from "../../utils/leagueUtils";
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

  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!league.join_code) return;

    const success = await copyToClipboard(league.join_code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card
      className={`p-4 bg-gradient-to-br from-white to-blue-50/30 border-2 transition-all duration-200 hover:shadow-lg hover:border-blue-300/40 cursor-pointer group ${
        league.is_member ? "border-blue-300/60" : "border-blue-200/20"
      }`}
      onClick={() => onView?.(league.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {league.name}
            </h4>
            {league.is_creator && (
              <Badge className="bg-yellow-100 text-yellow-800 text-xs border-yellow-200">
                Creator
              </Badge>
            )}
          </div>
          {league.description && (
            <p className="text-xs text-gray-600 line-clamp-2">{league.description}</p>
          )}
        </div>
        <Badge className={`${statusConfig.color} text-white ml-2 shrink-0`}>
          {statusConfig.label}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Member Count */}
        <div className="bg-white/50 rounded-lg p-2 border border-blue-100/50">
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
            <Users className="h-3 w-3" />
            <span>Members</span>
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {league.member_count}/{league.max_players}
          </div>
          <Progress
            value={memberPercentage}
            className="h-1 mt-1"
            indicatorClassName={memberPercentage >= 90 ? "bg-orange-500" : "bg-blue-600"}
          />
        </div>

        {/* Starting Cash */}
        <div className="bg-white/50 rounded-lg p-2 border border-blue-100/50">
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
            <DollarSign className="h-3 w-3" />
            <span>Starting Cash</span>
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {formatCurrency(league.starting_cash)}
          </div>
        </div>
      </div>

      {/* Start Date */}
      {league.start_date && (
        <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
          <Clock className="h-3 w-3" />
          <span>
            {league.status === "upcoming" ? "Starts" : "Started"}: {formatDate(league.start_date)}
          </span>
        </div>
      )}

      {/* Join Code (for private leagues the user is a member of) */}
      {league.is_member && !league.is_public && league.join_code && (
        <div className="bg-blue-50/50 border border-blue-200/30 rounded-lg p-2 mb-3">
          <div className="text-xs text-gray-600 mb-1">Share Code:</div>
          <div className="flex items-center justify-between">
            <code className="text-sm font-mono font-semibold text-blue-700">
              {formatJoinCode(league.join_code)}
            </code>
            <Tooltip content={copied ? "Copied!" : "Copy code"}>
              <button
                onClick={handleCopyCode}
                className="p-1 hover:bg-blue-100 rounded transition-colors"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-blue-600" />
                )}
              </button>
            </Tooltip>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {league.is_member ? (
          <>
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-500 text-white hover:from-blue-700 hover:to-indigo-600"
              onClick={(e) => {
                e.stopPropagation();
                onView?.(league.id);
              }}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Details
            </Button>
            {!league.is_creator && (
              <Button
                size="sm"
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
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
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:from-green-700 hover:to-emerald-600"
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
                className="flex-1"
                variant="outline"
                disabled
              >
                {league.is_full ? "Full" : league.status === "completed" ? "Ended" : "Can't Join"}
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
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
        <div className="mt-2 text-xs text-center text-orange-600 font-medium">
          League is full
        </div>
      )}
    </Card>
  );
}
