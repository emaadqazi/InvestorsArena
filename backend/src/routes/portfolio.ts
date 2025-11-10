import express from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getStockQuote } from '../utils/stockApi';

const router = express.Router();

// Get portfolio for a league
router.get('/league/:leagueId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { leagueId } = req.params;
    
    const portfolio = await prisma.portfolio.findUnique({
      where: {
        userId_leagueId: {
          userId: req.userId!,
          leagueId,
        },
      },
      include: {
        holdings: true,
        league: {
          select: {
            id: true,
            name: true,
            virtualBudget: true,
          },
        },
      },
    });
    
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    
    // Calculate current total value
    let totalHoldingsValue = 0;
    const holdingsWithCurrentPrice = await Promise.all(
      portfolio.holdings.map(async (holding) => {
        try {
          const quote = await getStockQuote(holding.symbol);
          const currentValue = quote.price * holding.quantity;
          totalHoldingsValue += currentValue;
          return {
            ...holding,
            currentPrice: quote.price,
            currentValue,
            gainLoss: currentValue - (holding.averagePrice * holding.quantity),
            gainLossPercent: ((quote.price - holding.averagePrice) / holding.averagePrice) * 100,
          };
        } catch (error) {
          // If stock quote fails, use average price
          const currentValue = holding.averagePrice * holding.quantity;
          totalHoldingsValue += currentValue;
          return {
            ...holding,
            currentPrice: holding.averagePrice,
            currentValue,
            gainLoss: 0,
            gainLossPercent: 0,
          };
        }
      })
    );
    
    const totalValue = portfolio.cashBalance + totalHoldingsValue;
    const totalGainLoss = totalValue - portfolio.league.virtualBudget;
    const totalGainLossPercent = (totalGainLoss / portfolio.league.virtualBudget) * 100;
    
    // Update portfolio total value
    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: { totalValue },
    });
    
    res.json({
      ...portfolio,
      holdings: holdingsWithCurrentPrice,
      totalValue,
      totalGainLoss,
      totalGainLossPercent,
    });
  } catch (error: any) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ error: 'Failed to get portfolio' });
  }
});

// Buy stock
router.post('/buy', authenticate, async (req: AuthRequest, res) => {
  try {
    const { leagueId, symbol, quantity } = req.body;
    
    if (!leagueId || !symbol || !quantity) {
      return res.status(400).json({ error: 'League ID, symbol, and quantity are required' });
    }
    
    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }
    
    // Get stock quote
    const quote = await getStockQuote(symbol);
    const totalCost = quote.price * quantity;
    
    // Get portfolio
    const portfolio = await prisma.portfolio.findUnique({
      where: {
        userId_leagueId: {
          userId: req.userId!,
          leagueId,
        },
      },
      include: {
        holdings: true,
      },
    });
    
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    
    if (portfolio.cashBalance < totalCost) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }
    
    // Start transaction
    await prisma.$transaction(async (tx) => {
      // Update cash balance
      await tx.portfolio.update({
        where: { id: portfolio.id },
        data: {
          cashBalance: {
            decrement: totalCost,
          },
        },
      });
      
      // Update or create holding
      const existingHolding = portfolio.holdings.find(h => h.symbol === symbol.toUpperCase());
      
      if (existingHolding) {
        const newQuantity = existingHolding.quantity + quantity;
        const newAveragePrice = 
          ((existingHolding.averagePrice * existingHolding.quantity) + (quote.price * quantity)) / newQuantity;
        
        await tx.holding.update({
          where: { id: existingHolding.id },
          data: {
            quantity: newQuantity,
            averagePrice: newAveragePrice,
          },
        });
      } else {
        await tx.holding.create({
          data: {
            portfolioId: portfolio.id,
            symbol: symbol.toUpperCase(),
            quantity,
            averagePrice: quote.price,
          },
        });
      }
      
      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: req.userId!,
          leagueId,
          portfolioId: portfolio.id,
          symbol: symbol.toUpperCase(),
          type: 'BUY',
          quantity,
          price: quote.price,
          totalAmount: totalCost,
        },
      });
    });
    
    // Return updated portfolio
    const updatedPortfolio = await prisma.portfolio.findUnique({
      where: { id: portfolio.id },
      include: {
        holdings: true,
      },
    });
    
    res.json({
      message: 'Stock purchased successfully',
      portfolio: updatedPortfolio,
    });
  } catch (error: any) {
    console.error('Buy stock error:', error);
    res.status(500).json({ error: error.message || 'Failed to buy stock' });
  }
});

// Sell stock
router.post('/sell', authenticate, async (req: AuthRequest, res) => {
  try {
    const { leagueId, symbol, quantity } = req.body;
    
    if (!leagueId || !symbol || !quantity) {
      return res.status(400).json({ error: 'League ID, symbol, and quantity are required' });
    }
    
    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }
    
    // Get stock quote
    const quote = await getStockQuote(symbol);
    const totalRevenue = quote.price * quantity;
    
    // Get portfolio
    const portfolio = await prisma.portfolio.findUnique({
      where: {
        userId_leagueId: {
          userId: req.userId!,
          leagueId,
        },
      },
      include: {
        holdings: true,
      },
    });
    
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    
    const holding = portfolio.holdings.find(h => h.symbol === symbol.toUpperCase());
    
    if (!holding) {
      return res.status(400).json({ error: 'You do not own this stock' });
    }
    
    if (holding.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient shares' });
    }
    
    // Start transaction
    await prisma.$transaction(async (tx) => {
      // Update cash balance
      await tx.portfolio.update({
        where: { id: portfolio.id },
        data: {
          cashBalance: {
            increment: totalRevenue,
          },
        },
      });
      
      // Update or delete holding
      if (holding.quantity === quantity) {
        await tx.holding.delete({
          where: { id: holding.id },
        });
      } else {
        await tx.holding.update({
          where: { id: holding.id },
          data: {
            quantity: {
              decrement: quantity,
            },
          },
        });
      }
      
      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: req.userId!,
          leagueId,
          portfolioId: portfolio.id,
          symbol: symbol.toUpperCase(),
          type: 'SELL',
          quantity,
          price: quote.price,
          totalAmount: totalRevenue,
        },
      });
    });
    
    // Return updated portfolio
    const updatedPortfolio = await prisma.portfolio.findUnique({
      where: { id: portfolio.id },
      include: {
        holdings: true,
      },
    });
    
    res.json({
      message: 'Stock sold successfully',
      portfolio: updatedPortfolio,
    });
  } catch (error: any) {
    console.error('Sell stock error:', error);
    res.status(500).json({ error: error.message || 'Failed to sell stock' });
  }
});

// Get transaction history
router.get('/league/:leagueId/transactions', authenticate, async (req: AuthRequest, res) => {
  try {
    const { leagueId } = req.params;
    const { limit = 50 } = req.query;
    
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId!,
        leagueId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: parseInt(limit as string),
    });
    
    res.json(transactions);
  } catch (error: any) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// Get league leaderboard
router.get('/league/:leagueId/leaderboard', authenticate, async (req: AuthRequest, res) => {
  try {
    const { leagueId } = req.params;
    
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        portfolios: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            holdings: true,
          },
        },
      },
    });
    
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }
    
    // Calculate current values for each portfolio
    const leaderboard = await Promise.all(
      league.portfolios.map(async (portfolio) => {
        let totalHoldingsValue = 0;
        
        for (const holding of portfolio.holdings) {
          try {
            const quote = await getStockQuote(holding.symbol);
            totalHoldingsValue += quote.price * holding.quantity;
          } catch (error) {
            totalHoldingsValue += holding.averagePrice * holding.quantity;
          }
        }
        
        const totalValue = portfolio.cashBalance + totalHoldingsValue;
        const gainLoss = totalValue - league.virtualBudget;
        const gainLossPercent = (gainLoss / league.virtualBudget) * 100;
        
        return {
          userId: portfolio.userId,
          user: portfolio.user,
          totalValue,
          cashBalance: portfolio.cashBalance,
          gainLoss,
          gainLossPercent,
        };
      })
    );
    
    // Sort by total value (descending)
    leaderboard.sort((a, b) => b.totalValue - a.totalValue);
    
    res.json(leaderboard);
  } catch (error: any) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

export default router;

