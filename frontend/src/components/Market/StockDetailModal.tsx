import { useEffect, useState } from 'react';
import { X, Heart, Plus, TrendingUp, TrendingDown, Building2, DollarSign, Percent, Calendar } from 'lucide-react';
import { getQuote, getCompanyOverview } from '../../services/alphaVantage';
import { Button } from '../ui/button';

interface StockDetailModalProps {
  symbol: string;
  isOpen: boolean;
  onClose: () => void;
  onToggleWatchlist: (symbol: string, name: string) => void;
  onAddToPortfolio: (symbol: string, name: string, price?: string, marketCap?: string) => void;
  isInWatchlist: boolean;
  isInPortfolio: boolean;
}

interface StockDetails {
  quote: {
    price: string;
    change: string;
    changePercent: string;
    open: string;
    high: string;
    low: string;
    volume: string;
    previousClose: string;
  } | null;
  overview: {
    Name: string;
    Description: string;
    Sector: string;
    Industry: string;
    MarketCapitalization: string;
    PERatio: string;
    DividendYield: string;
    EPS: string;
    '52WeekHigh': string;
    '52WeekLow': string;
    Beta: string;
  } | null;
}

export function StockDetailModal({
  symbol,
  isOpen,
  onClose,
  onToggleWatchlist,
  onAddToPortfolio,
  isInWatchlist,
  isInPortfolio,
}: StockDetailModalProps) {
  const [details, setDetails] = useState<StockDetails>({ quote: null, overview: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const [quote, overview] = await Promise.all([
          getQuote(symbol),
          getCompanyOverview(symbol),
        ]);

        setDetails({ quote, overview });
      } catch (error) {
        console.error('Error fetching stock details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [symbol, isOpen]);

  if (!isOpen) return null;

  const isPositive = details.quote && parseFloat(details.quote.change) >= 0;
  const changeColor = isPositive ? 'text-emerald-600' : 'text-red-600';

  const formatMarketCap = (cap?: string) => {
    if (!cap) return 'N/A';
    const value = parseFloat(cap);
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{symbol}</h2>
            {details.overview && (
              <p className="text-gray-600">{details.overview.Name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Price Section */}
              {details.quote && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    ${parseFloat(details.quote.price).toFixed(2)}
                  </div>
                  <div className={`flex items-center gap-2 ${changeColor} text-lg font-semibold`}>
                    {isPositive ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                    <span>
                      {isPositive ? '+' : ''}
                      {parseFloat(details.quote.change).toFixed(2)} ({details.quote.changePercent})
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => onToggleWatchlist(symbol, details.overview?.Name || symbol)}
                  className={`flex-1 ${
                    isInWatchlist
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600'
                  }`}
                >
                  <Heart className="h-4 w-4 mr-2" fill={isInWatchlist ? 'currentColor' : 'none'} />
                  {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </Button>
                <Button
                  onClick={() => onAddToPortfolio(
                    symbol, 
                    details.overview?.Name || symbol,
                    details.quote?.price,
                    details.overview?.MarketCapitalization
                  )}
                  disabled={isInPortfolio}
                  className={`flex-1 ${
                    isInPortfolio
                      ? 'bg-gray-400 hover:bg-gray-500'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600'
                  }`}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isInPortfolio ? 'In Portfolio' : 'Add to Portfolio'}
                </Button>
              </div>

              {/* Company Info */}
              {details.overview && (
                <>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Company Overview</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {details.overview.Description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Building2 className="h-4 w-4" />
                        <span className="text-xs font-semibold">Sector</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{details.overview.Sector}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Building2 className="h-4 w-4" />
                        <span className="text-xs font-semibold">Industry</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{details.overview.Industry}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Key Metrics */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Key Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {details.overview && (
                    <>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-xs font-semibold">Market Cap</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {formatMarketCap(details.overview.MarketCapitalization)}
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-purple-600 mb-1">
                          <Percent className="h-4 w-4" />
                          <span className="text-xs font-semibold">P/E Ratio</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {details.overview.PERatio !== 'None' ? parseFloat(details.overview.PERatio).toFixed(2) : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-600 mb-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-xs font-semibold">EPS</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          ${details.overview.EPS !== 'None' ? parseFloat(details.overview.EPS).toFixed(2) : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-orange-600 mb-1">
                          <Percent className="h-4 w-4" />
                          <span className="text-xs font-semibold">Dividend Yield</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {details.overview.DividendYield !== 'None' ? `${(parseFloat(details.overview.DividendYield) * 100).toFixed(2)}%` : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-red-600 mb-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-xs font-semibold">52W High</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          ${details.overview['52WeekHigh'] !== 'None' ? parseFloat(details.overview['52WeekHigh']).toFixed(2) : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-pink-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-pink-600 mb-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-xs font-semibold">52W Low</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          ${details.overview['52WeekLow'] !== 'None' ? parseFloat(details.overview['52WeekLow']).toFixed(2) : 'N/A'}
                        </p>
                      </div>
                    </>
                  )}

                  {details.quote && (
                    <>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <span className="text-xs font-semibold text-gray-500">Open</span>
                        <p className="text-sm font-bold text-gray-900">${parseFloat(details.quote.open).toFixed(2)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <span className="text-xs font-semibold text-gray-500">High</span>
                        <p className="text-sm font-bold text-gray-900">${parseFloat(details.quote.high).toFixed(2)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <span className="text-xs font-semibold text-gray-500">Low</span>
                        <p className="text-sm font-bold text-gray-900">${parseFloat(details.quote.low).toFixed(2)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <span className="text-xs font-semibold text-gray-500">Prev Close</span>
                        <p className="text-sm font-bold text-gray-900">${parseFloat(details.quote.previousClose).toFixed(2)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                        <span className="text-xs font-semibold text-gray-500">Volume</span>
                        <p className="text-sm font-bold text-gray-900">{parseInt(details.quote.volume).toLocaleString()}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
