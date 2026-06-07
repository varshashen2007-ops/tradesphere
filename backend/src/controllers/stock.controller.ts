import { Response, NextFunction, Request } from 'express';
import { AuthenticatedRequest } from '../types';
import { StocksService } from '../services/stock.service';
import { ApiResponse } from '../utils/ApiResponse';

export class StocksController {
  static async getAllStocks(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { search, sector, limit, offset } = req.query;

      const result = await StocksService.getAllStocks(
        search as string | undefined,
        sector as string | undefined,
        limit ? parseInt(limit as string) : 50,
        offset ? parseInt(offset as string) : 0
      );

      ApiResponse.success(res, {
        stocks: result.stocks,
        pagination: {
          total: result.total,
          limit: limit ? parseInt(limit as string) : 50,
          offset: offset ? parseInt(offset as string) : 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStockBySymbol(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const symbol = req.params.symbol as string;
      const stock = await StocksService.getStockBySymbol(symbol);

      ApiResponse.success(res, { stock });
    } catch (error) {
      next(error);
    }
  }

  static async getStockById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const stock = await StocksService.getStockById(id);

      ApiResponse.success(res, { stock });
    } catch (error) {
      next(error);
    }
  }

  static async getMarketMovers(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const movers = await StocksService.getMarketMovers();

      ApiResponse.success(res, movers);
    } catch (error) {
      next(error);
    }
  }

  static async getSectors(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sectors = await StocksService.getSectors();

      ApiResponse.success(res, { sectors });
    } catch (error) {
      next(error);
    }
  }

  static async getWatchlist(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const watchlist = await StocksService.getWatchlist(req.user!.id);

      ApiResponse.success(res, { watchlist });
    } catch (error) {
      next(error);
    }
  }

  static async addToWatchlist(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stockId = req.params.stockId as string;

      await StocksService.addToWatchlist(req.user!.id, stockId);

      ApiResponse.created(res, null, 'Added to watchlist');
    } catch (error) {
      next(error);
    }
  }

  static async removeFromWatchlist(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stockId = req.params.stockId as string;

      await StocksService.removeFromWatchlist(req.user!.id, stockId);

      ApiResponse.success(res, null, 'Removed from watchlist');
    } catch (error) {
      next(error);
    }
  }
}