import { Card } from '../ui/card';
import { Heart, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '../ui/button';
import { MarketMover } from '../../services/alphaVantage';
import { estimateCapTierFromVolume } from '../../utils/marketCapUtils';

interface MarketMoverCardProps {
  mover: MarketMover;
  isInWatchlist?: boolean;
  isInPortfolio?: boolean;
  onToggleWatchlist?: () => void;
  onAddToPortfolio?: () => void;
  onViewDetails?: () => void;
}

export function MarketMoverCard({
  mover,
  isInWatchlist = false,
  isInPortfolio = false,
  onToggleWatchlist,
  onAddToPortfolio,
  onViewDetails,
}: MarketMoverCardProps) {
  const changePercent = parseFloat(mover.change_percentage.replace('%', ''));
  const isPositive = changePercent >= 0;
  const changeColor = isPositive ? 'text-emerald-600' : 'text-red-600';
  const capTier = estimateCapTierFromVolume(mover.volume);

  return (
    <Card className="p-6 border-2 border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all group relative">
      {/* Market Cap Tier Badge */}
      <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${capTier.bg} ${capTier.color}`}>
        {capTier.tier}
      </div>
      
      <div className="flex flex-col h-full">
        {/* Header with Symbol and Watchlist */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{mover.ticker}</h3>
            <p className="text-xs text-gray-500">Stock</p>
          </div>

          {onToggleWatchlist && (
            <button
              onClick={onToggleWatchlist}
              className={`p-2 rounded-lg transition-all mt-4 ${
                isInWatchlist
                  ? 'text-red-500 bg-red-50 hover:bg-red-100'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Heart
                className="h-5 w-5"
                fill={isInWatchlist ? 'currentColor' : 'none'}
              />
            </button>
          )}
        </div>

        {/* Price and Change */}
        <div className="mb-4">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            ${parseFloat(mover.price).toFixed(2)}
          </div>
          <div className={`flex items-center gap-1 ${changeColor}`}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="text-sm font-semibold">
              {isPositive ? '+' : ''}
              {parseFloat(mover.change_amount).toFixed(2)} ({mover.change_percentage})
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="mb-4 bg-gray-50 rounded-lg p-3 flex-grow">
          <p className="text-xs text-gray-500 mb-1">Volume</p>
          <p className="text-sm font-semibold text-gray-900">
            {parseInt(mover.volume).toLocaleString()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {onViewDetails && (
            <Button
              variant="outline"
              className="flex-1 h-9 text-sm border-gray-300 hover:border-emerald-500 hover:bg-emerald-50"
              onClick={onViewDetails}
            >
              Details
            </Button>
          )}

          {onAddToPortfolio && (
            <Button
              className={`flex-1 h-9 text-sm ${
                isInPortfolio
                  ? 'bg-gray-400 hover:bg-gray-500'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600'
              }`}
              onClick={onAddToPortfolio}
              disabled={isInPortfolio}
            >
              <Plus className="h-4 w-4 mr-1" />
              {isInPortfolio ? 'In Portfolio' : 'Add'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
