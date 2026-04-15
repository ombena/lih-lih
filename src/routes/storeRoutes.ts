import { Router } from 'express';
import * as storeController from '../controllers/storeController';

const router = Router();

// GET /api/stores
router.get('/', storeController.getAllStores);

// GET /api/stores/:id
router.get('/:id', storeController.getStoreById);

export default router;