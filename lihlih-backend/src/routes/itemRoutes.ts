import { Router } from 'express';
import * as storeController from '../controllers/storeController';

const router = Router();

// PATCH /api/items/:item_id/toggle-availability
router.patch('/:item_id/toggle-availability', storeController.toggleItemAvailability);

// PUT /api/items/:item_id
router.put('/:item_id', storeController.updateMenuItem);

export default router;
