import { Router } from 'express';
import { OrdersController } from '../controllers/orders.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  placeOrderValidator,
  cancelOrderValidator,
  orderHistoryValidator,
} from '../validators/orders.validators';

const router = Router();

router.use(authenticate);

router.post('/', placeOrderValidator, validate, OrdersController.placeOrder);
router.get('/', orderHistoryValidator, validate, OrdersController.getOrderHistory);
router.delete('/:orderId', cancelOrderValidator, validate, OrdersController.cancelOrder);

export default router;