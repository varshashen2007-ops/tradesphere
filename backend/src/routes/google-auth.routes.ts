import { Router } from 'express';
import { GoogleAuthController } from '../controllers/google-auth.controller';

const router = Router();

router.post('/login', GoogleAuthController.login);
router.post('/register', GoogleAuthController.register);

export default router;