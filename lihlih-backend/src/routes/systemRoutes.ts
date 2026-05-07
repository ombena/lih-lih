import { Router } from 'express';
import * as systemController from '../controllers/systemController';

const router = Router();

router.get('/regions', systemController.getActiveRegions);

export default router;
