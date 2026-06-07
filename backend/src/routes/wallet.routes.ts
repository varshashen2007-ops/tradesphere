import { Router } from 'express';
import { WalletController } from '../controllers/wallet.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', WalletController.getWallet);
router.get('/transactions', WalletController.getTransactionHistory);

export default router;