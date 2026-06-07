import { Router } from 'express';
import { StocksController } from '../controllers/stock.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { searchStocksValidator } from '../validators/stock.validators';

const router = Router();

// Public — no auth needed to browse stocks
router.get('/', searchStocksValidator, validate, StocksController.getAllStocks);
router.get('/movers', StocksController.getMarketMovers);
router.get('/sectors', StocksController.getSectors);
router.get('/symbol/:symbol', StocksController.getStockBySymbol);
router.get('/:id', StocksController.getStockById);

// Protected — watchlist requires login
router.get('/watchlist/me', authenticate, StocksController.getWatchlist);
router.post('/watchlist/:stockId', authenticate, StocksController.addToWatchlist);
router.delete('/watchlist/:stockId', authenticate, StocksController.removeFromWatchlist);

export default router;