import { query as expressQuery } from 'express-validator';

export const searchStocksValidator = [
  expressQuery('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search query too long'),

  expressQuery('sector')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Sector name too long'),

  expressQuery('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),

  expressQuery('offset')
    .optional()
    .isInt({ min: 0 }).withMessage('Offset must be non-negative')
    .toInt(),
];