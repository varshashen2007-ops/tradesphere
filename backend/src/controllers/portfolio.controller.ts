import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { PortfolioService } from '../services/portfolio.service';
import { ApiResponse } from '../utils/ApiResponse';

export class PortfolioController {
  static async getHoldings(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const portfolio = await PortfolioService.getHoldings(req.user!.id);

      ApiResponse.success(res, portfolio);
    } catch (error) {
      next(error);
    }
  }

  static async getSectorAllocation(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sectors = await PortfolioService.getSectorAllocation(req.user!.id);

      ApiResponse.success(res, { sectors });
    } catch (error) {
      next(error);
    }
  }
}