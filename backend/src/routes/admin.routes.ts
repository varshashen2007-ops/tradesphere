import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { AdminController } from '../controllers/admin.controller';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Admin route working',
    data: {
      access: 'ADMIN',
      timestamp: new Date().toISOString(),
    },
  });
});

router.get('/dashboard', AdminController.getDashboard);
router.get('/users', AdminController.getUsers);
router.patch('/users/:userId/role', AdminController.updateUserRole);
router.get('/orders', AdminController.getOrders);
router.get('/stocks', AdminController.getStocks);

export default router;