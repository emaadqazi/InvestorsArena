import { useState, useEffect } from 'react';

const PORTFOLIO_KEY = 'investors_arena_portfolio';

export interface PortfolioStock {
  symbol: string;
  name: string;
  position: 'defender' | 'midfielder' | 'forward' | 'keeper';
  addedAt: number;
}

export interface Portfolio {
  defenders: PortfolioStock[];
  midfielders: PortfolioStock[];
  forwards: PortfolioStock[];
  keeper: PortfolioStock | null;
}

const FORMATION_LIMITS = {
  defenders: 4,
  midfielders: 3,
  forwards: 3,
  keeper: 1,
};

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<Portfolio>({
    defenders: [],
    midfielders: [],
    forwards: [],
    keeper: null,
  });

  // Load portfolio from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(PORTFOLIO_KEY);
    if (stored) {
      try {
        setPortfolio(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse portfolio:', error);
        setPortfolio({
          defenders: [],
          midfielders: [],
          forwards: [],
          keeper: null,
        });
      }
    }
  }, []);

  // Save portfolio to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio));
  }, [portfolio]);

  const addToPortfolio = (
    symbol: string,
    name: string,
    position: 'defender' | 'midfielder' | 'forward' | 'keeper'
  ): { success: boolean; message: string } => {
    // Check if symbol already exists in portfolio
    const allStocks = [
      ...portfolio.defenders,
      ...portfolio.midfielders,
      ...portfolio.forwards,
      ...(portfolio.keeper ? [portfolio.keeper] : []),
    ];

    if (allStocks.some(stock => stock.symbol === symbol)) {
      return { success: false, message: 'Stock already in portfolio' };
    }

    // Check formation limits
    if (position === 'keeper') {
      if (portfolio.keeper) {
        return { success: false, message: 'Keeper position already filled' };
      }
      setPortfolio(prev => ({
        ...prev,
        keeper: { symbol, name, position, addedAt: Date.now() },
      }));
      return { success: true, message: 'Added as keeper' };
    }

    const currentCount = portfolio[`${position}s` as keyof Portfolio] as PortfolioStock[];
    const limit = FORMATION_LIMITS[`${position}s` as keyof typeof FORMATION_LIMITS];

    if (currentCount.length >= limit) {
      return {
        success: false,
        message: `${position} position is full (${limit}/${limit})`,
      };
    }

    setPortfolio(prev => ({
      ...prev,
      [`${position}s`]: [...currentCount, { symbol, name, position, addedAt: Date.now() }],
    }));

    return { success: true, message: `Added as ${position}` };
  };

  const removeFromPortfolio = (symbol: string) => {
    setPortfolio(prev => ({
      defenders: prev.defenders.filter(s => s.symbol !== symbol),
      midfielders: prev.midfielders.filter(s => s.symbol !== symbol),
      forwards: prev.forwards.filter(s => s.symbol !== symbol),
      keeper: prev.keeper?.symbol === symbol ? null : prev.keeper,
    }));
  };

  const isInPortfolio = (symbol: string): boolean => {
    return (
      portfolio.defenders.some(s => s.symbol === symbol) ||
      portfolio.midfielders.some(s => s.symbol === symbol) ||
      portfolio.forwards.some(s => s.symbol === symbol) ||
      portfolio.keeper?.symbol === symbol
    );
  };

  const getAvailableSlots = () => {
    return {
      defenders: FORMATION_LIMITS.defenders - portfolio.defenders.length,
      midfielders: FORMATION_LIMITS.midfielders - portfolio.midfielders.length,
      forwards: FORMATION_LIMITS.forwards - portfolio.forwards.length,
      keeper: portfolio.keeper ? 0 : 1,
    };
  };

  const getTotalCount = () => {
    return (
      portfolio.defenders.length +
      portfolio.midfielders.length +
      portfolio.forwards.length +
      (portfolio.keeper ? 1 : 0)
    );
  };

  const isComplete = () => {
    return (
      portfolio.defenders.length === FORMATION_LIMITS.defenders &&
      portfolio.midfielders.length === FORMATION_LIMITS.midfielders &&
      portfolio.forwards.length === FORMATION_LIMITS.forwards &&
      portfolio.keeper !== null
    );
  };

  const clearPortfolio = () => {
    setPortfolio({
      defenders: [],
      midfielders: [],
      forwards: [],
      keeper: null,
    });
  };

  return {
    portfolio,
    addToPortfolio,
    removeFromPortfolio,
    isInPortfolio,
    getAvailableSlots,
    getTotalCount,
    isComplete,
    clearPortfolio,
  };
}
