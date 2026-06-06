import { authRateLimiter } from '../middleware/rateLimit.middleware';
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
} from '../validators/auth.validators';

const router = Router();

// Public routes (no authentication required) with rate limiting
router.post('/register', authRateLimiter, registerValidator, validate, AuthController.register);
router.post('/login',    authRateLimiter, loginValidator,    validate, AuthController.login);

// Protected routes (token required)
router.get('/me', authenticate, AuthController.getMe);
router.patch('/profile', authenticate, updateProfileValidator, validate, AuthController.updateProfile);
router.patch('/change-password', authenticate, changePasswordValidator, validate, AuthController.changePassword);

export default router;