import express from 'express';
import { getStockQuote, searchStocks } from '../utils/stockApi';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Search stocks
router.get('/search', authenticate, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    if (q.length < 1) {
      return res.status(400).json({ error: 'Search query must be at least 1 character' });
    }
    
    const results = await searchStocks(q);
    res.json(results);
  } catch (error: any) {
    console.error('Search stocks error:', error);
    res.status(500).json({ error: error.message || 'Failed to search stocks' });
  }
});

// Get stock quote
router.get('/quote/:symbol', authenticate, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
    
    const quote = await getStockQuote(symbol);
    res.json(quote);
  } catch (error: any) {
    console.error('Get stock quote error:', error);
    res.status(500).json({ error: error.message || 'Failed to get stock quote' });
  }
});

export default router;

