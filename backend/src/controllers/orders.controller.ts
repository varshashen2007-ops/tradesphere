import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { OrdersService } from '../services/orders.service';
import { ApiResponse } from '../utils/ApiResponse';

export class OrdersController {
  static async placeOrder(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { stockId, orderType, orderMode, quantity, limitPrice } = req.body;

      const result = await OrdersService.placeOrder({
        userId: req.user!.id,
        stockId,
        orderType,
        orderMode,
        quantity,
        limitPrice,
      });

      ApiResponse.created(res, result, `${orderType} order placed successfully`);
    } catch (error) {
      next(error);
    }
  }

  static async getOrderHistory(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { status, limit, offset } = req.query;

      const result = await OrdersService.getOrderHistory(
        req.user!.id,
        status as string | undefined,
        limit ? parseInt(limit as string) : 20,
        offset ? parseInt(offset as string) : 0
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async cancelOrder(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const orderId = req.params.orderId as string;

      const order = await OrdersService.cancelOrder(req.user!.id, orderId);

      ApiResponse.success(res, { order }, 'Order cancelled');
    } catch (error) {
      next(error);
    }
  }
}