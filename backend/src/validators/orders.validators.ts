import { body, param, query as expressQuery } from 'express-validator';

export const placeOrderValidator = [
  body('stockId')
    .notEmpty()
    .withMessage('Stock ID is required')
    .isUUID()
    .withMessage('Invalid stock ID'),

  body('orderType')
    .notEmpty()
    .withMessage('Order type is required')
    .isIn(['BUY', 'SELL'])
    .withMessage('Order type must be BUY or SELL'),

  body('orderMode')
    .notEmpty()
    .withMessage('Order mode is required')
    .isIn(['MARKET', 'LIMIT'])
    .withMessage('Order mode must be MARKET or LIMIT'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1, max: 100000 })
    .withMessage('Quantity must be between 1 and 100,000')
    .toInt(),

  body('limitPrice')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Limit price must be a positive number')
    .toFloat(),
];

export const cancelOrderValidator = [
  param('orderId').isUUID().withMessage('Invalid order ID'),
];

export const orderHistoryValidator = [
  expressQuery('status')
    .optional()
    .isIn(['PENDING', 'EXECUTED', 'CANCELLED', 'FAILED'])
    .withMessage('Invalid status filter'),

  expressQuery('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be 1–100')
    .toInt(),

  expressQuery('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be non-negative')
    .toInt(),
];