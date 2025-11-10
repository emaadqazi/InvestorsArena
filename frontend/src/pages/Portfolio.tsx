import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

interface Holding {
  id: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice?: number;
  currentValue?: number;
  gainLoss?: number;
  gainLossPercent?: number;
}

interface Portfolio {
  id: string;
  cashBalance: number;
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  holdings: Holding[];
  league: {
    id: string;
    name: string;
    virtualBudget: number;
  };
}

interface Transaction {
  id: string;
  symbol: string;
  type: string;
  quantity: number;
  price: number;
  totalAmount: number;
  timestamp: string;
}

export default function Portfolio() {
  const { id } = useParams<{ id: string }>();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeSymbol, setTradeSymbol] = useState('');
  const [tradeQuantity, setTradeQuantity] = useState('');
  const [stockQuote, setStockQuote] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [trading, setTrading] = useState(false);
  const [fetchingQuote, setFetchingQuote] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPortfolio();
      fetchTransactions();
    }
  }, [id]);

  useEffect(() => {
    if (tradeSymbol) {
      fetchStockQuote(tradeSymbol);
    }
  }, [tradeSymbol]);

  const fetchPortfolio = async () => {
    try {
      const response = await api.get(`/portfolio/league/${id}`);
      setPortfolio(response.data);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await api.get(`/portfolio/league/${id}/transactions`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const fetchStockQuote = async (symbol: string) => {
    if (!symbol || symbol.trim().length === 0) {
      return;
    }
    
    const cleanSymbol = symbol.toUpperCase().trim();
    setError('');
    setFetchingQuote(true);
    
    try {
      const response = await api.get(`/stocks/quote/${cleanSymbol}`);
      setStockQuote(response.data);
      setError('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch stock quote';
      setError(errorMessage);
      setStockQuote(null);
      console.error('Error fetching stock quote:', err);
    } finally {
      setFetchingQuote(false);
    }
  };

  const searchStocks = async (query: string) => {
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }
    
    const cleanQuery = query.toUpperCase().trim();
    
    // If it looks like a valid stock symbol (1-5 uppercase letters), try to fetch quote directly
    if (/^[A-Z]{1,5}$/.test(cleanQuery) && cleanQuery.length <= 5) {
      // For short symbols, fetch quote directly if search fails or returns no results
      try {
        const response = await api.get(`/stocks/search?q=${encodeURIComponent(cleanQuery)}`);
        const filteredResults = response.data
          .filter((stock: any) => stock.symbol && stock.name)
          .slice(0, 10);
        
        if (filteredResults.length > 0) {
          setSearchResults(filteredResults);
          setError('');
        } else {
          // No search results, but it's a valid-looking symbol - try fetching quote directly
          setSearchResults([]);
          // Don't auto-fetch here, let user press Enter or click the button
        }
      } catch (error: any) {
        console.error('Failed to search stocks:', error);
        setSearchResults([]);
        // If search fails but it's a valid symbol, don't show error - let them try fetching quote
        if (!/^[A-Z]{1,5}$/.test(cleanQuery)) {
          setError(error.response?.data?.error || 'Search failed. Try typing a stock symbol directly.');
        }
      }
    } else {
      // For longer queries (company names), do normal search
      try {
        const response = await api.get(`/stocks/search?q=${encodeURIComponent(cleanQuery)}`);
        const filteredResults = response.data
          .filter((stock: any) => stock.symbol && stock.name)
          .slice(0, 10);
        setSearchResults(filteredResults);
        setError('');
      } catch (error: any) {
        console.error('Failed to search stocks:', error);
        setSearchResults([]);
        if (query.length >= 2) {
          setError(error.response?.data?.error || 'Search failed. Try a stock symbol like AAPL, MSFT, GOOGL.');
        }
      }
    }
  };

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeSymbol || !tradeQuantity || !id) return;

    setTrading(true);
    setError('');

    try {
      if (tradeType === 'buy') {
        await api.post('/portfolio/buy', {
          leagueId: id,
          symbol: tradeSymbol,
          quantity: parseInt(tradeQuantity),
        });
      } else {
        await api.post('/portfolio/sell', {
          leagueId: id,
          symbol: tradeSymbol,
          quantity: parseInt(tradeQuantity),
        });
      }
      setShowTradeModal(false);
      setTradeSymbol('');
      setTradeQuantity('');
      setStockQuote(null);
      fetchPortfolio();
      fetchTransactions();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to execute trade');
    } finally {
      setTrading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!portfolio) {
    return <div className="flex items-center justify-center min-h-screen">Portfolio not found</div>;
  }

  const totalCost = stockQuote && tradeQuantity
    ? stockQuote.price * parseInt(tradeQuantity)
    : 0;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Portfolio - {portfolio.league.name}</h1>
          <div className="flex space-x-2">
            <Link
              to={`/leagues/${id}/leaderboard`}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            >
              Leaderboard
            </Link>
            <button
              onClick={() => setShowTradeModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Trade Stocks
            </button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm text-gray-500">Cash Balance</div>
            <div className="text-2xl font-bold text-gray-900">
              ${portfolio.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm text-gray-500">Total Value</div>
            <div className="text-2xl font-bold text-gray-900">
              ${portfolio.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm text-gray-500">Gain/Loss</div>
            <div className={`text-2xl font-bold ${portfolio.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${portfolio.totalGainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm text-gray-500">Gain/Loss %</div>
            <div className={`text-2xl font-bold ${portfolio.totalGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolio.totalGainLossPercent.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Holdings */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Holdings</h2>
          {portfolio.holdings.length === 0 ? (
            <p className="text-gray-500">No holdings yet. Start trading to build your portfolio!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gain/Loss
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {portfolio.holdings.map((holding) => (
                    <tr key={holding.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {holding.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {holding.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${holding.averagePrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${holding.currentPrice?.toFixed(2) || holding.averagePrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${holding.currentValue?.toFixed(2) || (holding.averagePrice * holding.quantity).toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        (holding.gainLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${holding.gainLoss?.toFixed(2) || '0.00'} ({holding.gainLossPercent?.toFixed(2) || '0.00'}%)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-500">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.type === 'BUY'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${transaction.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${transaction.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Trade Modal */}
      {showTradeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Trade Stocks</h3>
              <button
                onClick={() => {
                  setShowTradeModal(false);
                  setTradeSymbol('');
                  setTradeQuantity('');
                  setStockQuote(null);
                  setError('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleTrade} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setTradeType('buy')}
                    className={`flex-1 py-2 px-4 rounded ${
                      tradeType === 'buy'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => setTradeType('sell')}
                    className={`flex-1 py-2 px-4 rounded ${
                      tradeType === 'sell'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Sell
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symbol (e.g., AAPL, MSFT, GOOGL, TSLA, AMZN)
                </label>
                <input
                  type="text"
                  value={tradeSymbol}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().trim();
                    setTradeSymbol(value);
                    if (value.length >= 1) {
                      searchStocks(value);
                    } else {
                      setSearchResults([]);
                      setStockQuote(null);
                    }
                  }}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const symbol = tradeSymbol.trim().toUpperCase();
                      if (symbol && symbol.length >= 1) {
                        setSearchResults([]);
                        // Always fetch quote when Enter is pressed
                        await fetchStockQuote(symbol);
                      }
                    }
                  }}
                  onBlur={() => {
                    // Delay to allow clicking on search results
                    setTimeout(() => {
                      setSearchResults([]);
                      // Auto-fetch quote if it's a valid symbol format and no quote exists
                      const symbol = tradeSymbol.trim().toUpperCase();
                      if (symbol && /^[A-Z]{1,5}$/.test(symbol) && (!stockQuote || stockQuote.symbol !== symbol)) {
                        fetchStockQuote(symbol);
                      }
                    }, 300);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Type stock symbol or company name (e.g., AAPL, MSFT, GOOGL)"
                  required
                />
                {searchResults.length > 0 && (
                  <div className="mt-2 border border-gray-300 rounded-md max-h-40 overflow-y-auto bg-white z-10">
                    {searchResults.map((result) => (
                      <button
                        key={result.symbol}
                        type="button"
                        onClick={() => {
                          setTradeSymbol(result.symbol);
                          setSearchResults([]);
                          setError('');
                          fetchStockQuote(result.symbol);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{result.symbol}</div>
                        <div className="text-sm text-gray-500">{result.name}</div>
                      </button>
                    ))}
                  </div>
                )}
                {tradeSymbol && searchResults.length === 0 && !error && !stockQuote && tradeSymbol.length < 2 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Type a stock symbol (e.g., AAPL, MSFT, GOOGL) or company name to search
                  </p>
                )}
              </div>

              {stockQuote && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="font-medium text-gray-900">{stockQuote.name}</div>
                  <div className="text-sm text-gray-600">Current Price: ${stockQuote.price.toFixed(2)}</div>
                  <div className={`text-sm font-medium ${stockQuote.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stockQuote.change >= 0 ? '+' : ''}{stockQuote.change.toFixed(2)} ({stockQuote.changePercent >= 0 ? '+' : ''}{stockQuote.changePercent.toFixed(2)}%)
                  </div>
                </div>
              )}
              
              {/* Show loading state while fetching quote */}
              {fetchingQuote && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                  <p className="text-sm text-blue-800 font-medium">
                    Fetching quote for <strong>{tradeSymbol}</strong>...
                  </p>
                </div>
              )}

              {/* Show prompt to fetch quote if symbol is entered but no quote yet and no search results */}
              {tradeSymbol && !stockQuote && !fetchingQuote && tradeSymbol.trim().length >= 1 && searchResults.length === 0 && !error && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-blue-800 font-medium mb-1">
                        Symbol: <strong className="text-lg">{tradeSymbol}</strong>
                      </p>
                      <p className="text-xs text-blue-600 mb-2">
                        {/^[A-Z]{1,5}$/.test(tradeSymbol.trim()) 
                          ? '💡 Tip: Press Enter or click outside the field to automatically fetch the price'
                          : 'Press Enter or click the button to fetch the current price'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setError('');
                        fetchStockQuote(tradeSymbol);
                      }}
                      disabled={fetchingQuote}
                      className="ml-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium shadow-sm disabled:opacity-50"
                    >
                      {fetchingQuote ? 'Loading...' : 'Get Quote'}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={tradeQuantity}
                  onChange={(e) => setTradeQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Number of shares"
                  min="1"
                  required
                />
              </div>

              {stockQuote && tradeQuantity && (
                <div className="bg-blue-50 p-3 rounded-md">
                  <div className="text-sm font-medium text-gray-700">
                    Total Cost: ${totalCost.toFixed(2)}
                  </div>
                  {tradeType === 'buy' && portfolio && totalCost > portfolio.cashBalance && (
                    <div className="text-sm text-red-600 mt-1">
                      Insufficient funds
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={trading || !tradeSymbol || !tradeQuantity || !stockQuote}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                  {trading ? 'Processing...' : tradeType === 'buy' ? 'Buy' : 'Sell'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTradeModal(false);
                    setTradeSymbol('');
                    setTradeQuantity('');
                    setStockQuote(null);
                    setError('');
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

