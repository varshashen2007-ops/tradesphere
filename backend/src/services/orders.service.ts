import { v4 as uuidv4 } from 'uuid';
import { query, getClient } from '../config/database';
import { Order, Holding } from '../types';
import { AppError } from '../middleware/error.middleware';
import { WalletService } from './wallet.service';
import { io } from '../index';

interface PlaceOrderInput {
  userId: string;
  stockId: string;
  orderType: 'BUY' | 'SELL';
  orderMode: 'MARKET' | 'LIMIT';
  quantity: number;
  limitPrice?: number;
}

interface OrderResult {
  order: Order;
  executedPrice?: number;
  totalValue?: number;
}

export class OrdersService {
  static async placeOrder(input: PlaceOrderInput): Promise<OrderResult> {
    const { userId, stockId, orderType, orderMode, quantity, limitPrice } = input;

    const stocks = await query<{
      id: string;
      symbol: string;
      company_name: string;
      current_price: number;
      is_active: boolean;
    }>(
      'SELECT id, symbol, company_name, current_price, is_active FROM stocks WHERE id = $1',
      [stockId]
    );

    if (stocks.length === 0 || !stocks[0].is_active) {
      throw new AppError('Stock not found or inactive', 404);
    }

    const stock = {
      ...stocks[0],
      current_price: Number(stocks[0].current_price),
    };

    if (orderMode === 'LIMIT' && !limitPrice) {
      throw new AppError('Limit price is required for limit orders', 400);
    }

    if (orderMode === 'MARKET') {
      return this.executeOrder({
        userId,
        stock,
        orderType,
        orderMode,
        quantity,
        executionPrice: stock.current_price,
      });
    }

    const totalValue = Number((quantity * Number(limitPrice)).toFixed(2));

    if (orderType === 'BUY') {
      const wallets = await query<{ balance: number }>(
        'SELECT balance FROM wallets WHERE user_id = $1',
        [userId]
      );

      if (Number(wallets[0].balance) < totalValue) {
        throw new AppError(
          `Insufficient funds. Need ₹${totalValue.toLocaleString('en-IN')}`,
          400
        );
      }
    } else {
      await this.validateHoldingsForSell(userId, stockId, quantity);
    }

    const orderId = uuidv4();

    const order = await query<Order>(
      `INSERT INTO orders
       (id, user_id, stock_id, order_type, order_mode, quantity, price, limit_price, total_value, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING')
       RETURNING *`,
      [
        orderId,
        userId,
        stockId,
        orderType,
        orderMode,
        quantity,
        limitPrice,
        limitPrice,
        totalValue,
      ]
    );

    return { order: order[0] };
  }

  private static async executeOrder(params: {
    userId: string;
    stock: {
      id: string;
      symbol: string;
      company_name: string;
      current_price: number;
    };
    orderType: 'BUY' | 'SELL';
    orderMode: 'MARKET' | 'LIMIT';
    quantity: number;
    executionPrice: number;
    existingOrderId?: string;
  }): Promise<OrderResult> {
    const {
      userId,
      stock,
      orderType,
      orderMode,
      quantity,
      executionPrice,
      existingOrderId,
    } = params;

    const totalValue = Number((quantity * executionPrice).toFixed(2));
    const client = await getClient();

    try {
      await client.query('BEGIN');

      const orderId = existingOrderId ?? uuidv4();

      if (!existingOrderId) {
        await client.query(
          `INSERT INTO orders
           (id, user_id, stock_id, order_type, order_mode, quantity, price, total_value, status, executed_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'EXECUTED', NOW())`,
          [
            orderId,
            userId,
            stock.id,
            orderType,
            orderMode,
            quantity,
            executionPrice,
            totalValue,
          ]
        );
      } else {
        await client.query(
          `UPDATE orders
           SET status = 'EXECUTED',
               price = $1,
               total_value = $2,
               executed_at = NOW()
           WHERE id = $3`,
          [executionPrice, totalValue, orderId]
        );
      }

      if (orderType === 'BUY') {
        await WalletService.debitWallet(
          client,
          userId,
          totalValue,
          `Bought ${quantity} shares of ${stock.symbol} @ ₹${executionPrice}`,
          orderId
        );

        await this.updateHoldingsBuy(
          client,
          userId,
          stock.id,
          quantity,
          executionPrice,
          totalValue
        );
      } else {
        await this.validateHoldingsForSell(userId, stock.id, quantity, client);

        await WalletService.creditWallet(
          client,
          userId,
          totalValue,
          `Sold ${quantity} shares of ${stock.symbol} @ ₹${executionPrice}`,
          orderId
        );

        await this.updateHoldingsSell(client, userId, stock.id, quantity);
      }

      await client.query(
        `UPDATE leaderboard
         SET trades_count = trades_count + 1,
             updated_at = NOW()
         WHERE user_id = $1`,
        [userId]
      );

      await client.query('COMMIT');

      const orders = await query<Order>('SELECT * FROM orders WHERE id = $1', [
        orderId,
      ]);

      io.to(`portfolio:${userId}`).emit('order:executed', {
        orderId,
        symbol: stock.symbol,
        orderType,
        quantity,
        executionPrice,
        totalValue,
      });

      return {
        order: orders[0],
        executedPrice: executionPrice,
        totalValue,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private static async updateHoldingsBuy(
    client: Awaited<ReturnType<typeof getClient>>,
    userId: string,
    stockId: string,
    quantity: number,
    price: number,
    totalValue: number
  ): Promise<void> {
    const existing = await client.query(
      'SELECT * FROM holdings WHERE user_id = $1 AND stock_id = $2',
      [userId, stockId]
    );

    if (existing.rows.length === 0) {
      await client.query(
        `INSERT INTO holdings
         (user_id, stock_id, quantity, average_buy_price, total_invested)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, stockId, quantity, price, totalValue]
      );
    } else {
      const holding = existing.rows[0] as Holding;

      const oldQuantity = Number(holding.quantity);
      const oldTotalInvested = Number(holding.total_invested);

      const newQuantity = oldQuantity + quantity;
      const newTotalInvested = Number((oldTotalInvested + totalValue).toFixed(2));
      const newAveragePrice = Number((newTotalInvested / newQuantity).toFixed(2));

      await client.query(
        `UPDATE holdings
         SET quantity = $1,
             average_buy_price = $2,
             total_invested = $3,
             updated_at = NOW()
         WHERE user_id = $4 AND stock_id = $5`,
        [newQuantity, newAveragePrice, newTotalInvested, userId, stockId]
      );
    }
  }

  private static async updateHoldingsSell(
    client: Awaited<ReturnType<typeof getClient>>,
    userId: string,
    stockId: string,
    quantity: number
  ): Promise<void> {
    const existing = await client.query(
      'SELECT * FROM holdings WHERE user_id = $1 AND stock_id = $2',
      [userId, stockId]
    );

    const holding = existing.rows[0] as Holding;

    const oldQuantity = Number(holding.quantity);
    const oldTotalInvested = Number(holding.total_invested);

    const newQuantity = oldQuantity - quantity;

    if (newQuantity === 0) {
      await client.query(
        'DELETE FROM holdings WHERE user_id = $1 AND stock_id = $2',
        [userId, stockId]
      );
    } else {
      const soldRatio = quantity / oldQuantity;
      const newTotalInvested = Number(
        (oldTotalInvested * (1 - soldRatio)).toFixed(2)
      );

      await client.query(
        `UPDATE holdings
         SET quantity = $1,
             total_invested = $2,
             updated_at = NOW()
         WHERE user_id = $3 AND stock_id = $4`,
        [newQuantity, newTotalInvested, userId, stockId]
      );
    }
  }

  private static async validateHoldingsForSell(
  userId: string,
  stockId: string,
  quantity: number,
  client?: Awaited<ReturnType<typeof getClient>>
): Promise<void> {
  let rows: { quantity: number }[];

  if (client) {
    const result = await client.query<{ quantity: number }>(
      'SELECT quantity FROM holdings WHERE user_id = $1 AND stock_id = $2',
      [userId, stockId]
    );

    rows = result.rows;
  } else {
    rows = await query<{ quantity: number }>(
      'SELECT quantity FROM holdings WHERE user_id = $1 AND stock_id = $2',
      [userId, stockId]
    );
  }

  const availableQuantity = rows.length > 0 ? Number(rows[0].quantity) : 0;

  if (availableQuantity < quantity) {
    throw new AppError(
      `Insufficient shares. You hold ${availableQuantity} shares.`,
      400
    );
  }
}

  static async getOrderHistory(
    userId: string,
    status?: string,
    limit = 20,
    offset = 0
  ): Promise<{ orders: Order[]; total: number }> {
    let whereClause = 'WHERE o.user_id = $1';
    const params: unknown[] = [userId];
    let paramIndex = 2;

    if (status) {
      whereClause += ` AND o.status = $${paramIndex}`;
      params.push(status.toUpperCase());
      paramIndex++;
    }

    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM orders o ${whereClause}`,
      params
    );

    params.push(limit, offset);

    const orders = await query<Order>(
      `SELECT 
        o.*,
        s.symbol,
        s.company_name,
        s.sector
      FROM orders o
      JOIN stocks s ON s.id = o.stock_id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return {
      orders,
      total: parseInt(countResult[0].count, 10),
    };
  }

  static async cancelOrder(userId: string, orderId: string): Promise<Order> {
    const orders = await query<Order>(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );

    if (orders.length === 0) {
      throw new AppError('Order not found', 404);
    }

    const order = orders[0];

    if (order.status !== 'PENDING') {
      throw new AppError(`Cannot cancel an order with status: ${order.status}`, 400);
    }

    const updated = await query<Order>(
      `UPDATE orders
       SET status = 'CANCELLED'
       WHERE id = $1
       RETURNING *`,
      [orderId]
    );

    return updated[0];
  }

  static async processLimitOrders(
    currentPrices: Map<string, number>
  ): Promise<void> {
    const pendingOrders = await query<
      Order & {
        symbol: string;
        company_name: string;
        current_price: number;
      }
    >(
      `SELECT 
        o.*, 
        s.symbol, 
        s.company_name, 
        s.current_price
      FROM orders o
      JOIN stocks s ON s.id = o.stock_id
      WHERE o.status = 'PENDING'
        AND o.order_mode = 'LIMIT'`
    );

    for (const order of pendingOrders) {
      const livePrice =
        currentPrices.get(order.symbol) ?? Number(order.current_price);

      const limitPrice = Number(order.limit_price);

      const shouldExecute =
        (order.order_type === 'BUY' && livePrice <= limitPrice) ||
        (order.order_type === 'SELL' && livePrice >= limitPrice);

      if (shouldExecute) {
        try {
          await this.executeOrder({
            userId: order.user_id,
            stock: {
              id: order.stock_id,
              symbol: order.symbol,
              company_name: order.company_name,
              current_price: livePrice,
            },
            orderType: order.order_type,
            orderMode: 'LIMIT',
            quantity: Number(order.quantity),
            executionPrice: livePrice,
            existingOrderId: order.id,
          });
        } catch (error) {
          await query(`UPDATE orders SET status = 'FAILED' WHERE id = $1`, [
            order.id,
          ]);

          console.error(`Limit order ${order.id} failed:`, error);
        }
      }
    }
  }
}