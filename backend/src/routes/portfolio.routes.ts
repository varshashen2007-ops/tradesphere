import { Router } from 'express';
import { PortfolioController } from '../controllers/portfolio.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/holdings', PortfolioController.getHoldings);
router.get('/sectors', PortfolioController.getSectorAllocation);

export default router;