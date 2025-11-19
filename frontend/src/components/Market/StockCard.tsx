import { useState } from 'react';
import { Card } from '../ui/card';
import { Heart, Plus, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { Button } from '../ui/button';

interface StockCardProps {
  symbol: string;
  name: string;
  price?: string;
  change?: string;
  changePercent?: string;
  marketCap?: string;
  peRatio?: string;
  isInWatchlist?: boolean;
  isInPortfolio?: boolean;
  onToggleWatchlist?: () => void;
  onAddToPortfolio?: () => void;
  onViewDetails?: () => void;
  loading?: boolean;
}

export function StockCard({
  symbol,
  name,
  price,
  change,
  changePercent,
  marketCap,
  peRatio,
  isInWatchlist = false,
  isInPortfolio = false,
  onToggleWatchlist,
  onAddToPortfolio,
  onViewDetails,
  loading = false,
}: StockCardProps) {
  const [imageError, setImageError] = useState(false);

  const isPositive = change && parseFloat(change) >= 0;
  const changeColor = isPositive ? 'text-emerald-600' : 'text-red-600';
  const bgChangeColor = isPositive ? 'bg-emerald-50' : 'bg-red-50';

  const formatMarketCap = (cap?: string) => {
    if (!cap) return 'N/A';
    const value = parseFloat(cap);
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
  };

  if (loading) {
    return (
      <Card className="p-6 border border-gray-200 animate-pulse">
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-2 border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all group">
      <div className="flex flex-col h-full">
        {/* Header with Symbol and Watchlist */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Logo */}
            {!imageError ? (
              <img
                src={`https://logo.clearbit.com/${symbol.toLowerCase()}.com`}
                alt={symbol}
                className="h-10 w-10 rounded-lg object-cover bg-gray-100"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm">
                {symbol.slice(0, 2)}
              </div>
            )}

            <div>
              <h3 className="text-lg font-bold text-gray-900">{symbol}</h3>
              <p className="text-xs text-gray-500 truncate max-w-[150px]">{name}</p>
            </div>
          </div>

          {onToggleWatchlist && (
            <button
              onClick={onToggleWatchlist}
              className={`p-2 rounded-lg transition-all ${
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
          {price ? (
            <>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ${parseFloat(price).toFixed(2)}
              </div>
              {change && changePercent && (
                <div className={`flex items-center gap-1 ${changeColor}`}>
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="text-sm font-semibold">
                    {isPositive ? '+' : ''}
                    {parseFloat(change).toFixed(2)} ({changePercent})
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-gray-500">Price unavailable</div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4 flex-grow">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-500 mb-1">Market Cap</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatMarketCap(marketCap)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-500 mb-1">P/E Ratio</p>
            <p className="text-sm font-semibold text-gray-900">
              {peRatio && peRatio !== 'None' ? parseFloat(peRatio).toFixed(2) : 'N/A'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {onViewDetails && (
            <Button
              variant="outline"
              className="flex-1 h-9 text-sm border-gray-300 hover:border-emerald-500 hover:bg-emerald-50"
              onClick={onViewDetails}
            >
              <Info className="h-4 w-4 mr-1" />
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
