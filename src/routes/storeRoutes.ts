import { Router } from 'express';
import * as storeController from '../controllers/storeController';

const router = Router();

// PUT SPECIFIC ROUTES FIRST!
// GET /api/stores/:id/active-orders
router.get('/:id/active-orders', storeController.getActiveOrders);

// PUT DYNAMIC PARAMS LAST!
// GET /api/stores/:id
router.get('/:id', storeController.getStoreById);

export default router;