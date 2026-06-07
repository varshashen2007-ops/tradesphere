import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { WalletService } from '../services/wallet.service';
import { ApiResponse } from '../utils/ApiResponse';

export class WalletController {
  static async getWallet(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const wallet = await WalletService.getWallet(req.user!.id);

      ApiResponse.success(res, { wallet });
    } catch (error) {
      next(error);
    }
  }

  static async getTransactionHistory(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { limit, offset } = req.query;

      const result = await WalletService.getTransactionHistory(
        req.user!.id,
        limit ? parseInt(limit as string) : 20,
        offset ? parseInt(offset as string) : 0
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}