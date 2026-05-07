import { Router } from 'express';
import * as storeController from '../controllers/storeController';

const router = Router();

// PUT SPECIFIC ROUTES FIRST!
router.get('/version', storeController.getStoreVersion);
router.get('/directory', storeController.getStoreDirectory);
router.get('/feed', storeController.getDiscoveryFeed);
router.post('/hydrate', storeController.hydrateStores);
router.get('/:id/active-orders', storeController.getActiveOrders);

// PUT DYNAMIC PARAMS LAST!
// POST /api/stores/:id/items
router.post('/:id/items', storeController.createMenuItem);

// PUT /api/stores/:id
router.put('/:id', storeController.updateStoreProfile);

// PATCH /api/stores/:id/status
router.patch('/:id/status', storeController.toggleStoreStatus);

// GET /api/stores/:id
router.get('/:id', storeController.getStoreById);

export default router;