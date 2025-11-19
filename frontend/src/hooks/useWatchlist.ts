import { useState, useEffect } from 'react';

const WATCHLIST_KEY = 'investors_arena_watchlist';

export interface WatchlistItem {
  symbol: string;
  name: string;
  addedAt: number;
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(WATCHLIST_KEY);
    if (stored) {
      try {
        setWatchlist(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse watchlist:', error);
        setWatchlist([]);
      }
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = (symbol: string, name: string) => {
    setWatchlist(prev => {
      // Check if already in watchlist
      if (prev.some(item => item.symbol === symbol)) {
        return prev;
      }

      return [...prev, { symbol, name, addedAt: Date.now() }];
    });
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
  };

  const isInWatchlist = (symbol: string): boolean => {
    return watchlist.some(item => item.symbol === symbol);
  };

  const toggleWatchlist = (symbol: string, name: string) => {
    if (isInWatchlist(symbol)) {
      removeFromWatchlist(symbol);
    } else {
      addToWatchlist(symbol, name);
    }
  };

  const clearWatchlist = () => {
    setWatchlist([]);
  };

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist,
    clearWatchlist,
  };
}
