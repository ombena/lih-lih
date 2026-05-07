import { Router } from 'express';
import * as authController from '../controllers/authController';

const router = Router();

router.get('/me', authController.getMe);
router.post('/login', authController.login);

export default router;
