import { Router } from 'express';
import { StocksController } from '../controllers/stock.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { searchStocksValidator } from '../validators/stock.validators';

const router = Router();

// Public
router.get('/', searchStocksValidator, validate, StocksController.getAllStocks);
router.get('/movers', StocksController.getMarketMovers);
router.get('/sectors', StocksController.getSectors);
router.get('/symbol/:symbol', StocksController.getStockBySymbol);

// Protected watchlist routes MUST come before /:id
router.get('/watchlist/me', authenticate, StocksController.getWatchlist);
router.post('/watchlist/:stockId', authenticate, StocksController.addToWatchlist);
router.delete('/watchlist/:stockId', authenticate, StocksController.removeFromWatchlist);

// Dynamic route last
router.get('/:id', StocksController.getStockById);

export default router;