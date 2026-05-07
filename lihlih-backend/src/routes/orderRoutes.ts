import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { getUnreviewedOrders as getUnreviewedOrdersFromReview } from '../controllers/reviewController';

const router = Router();

// NEW: 5-Second Pulse for Driver Feed (High Priority Route)
router.get('/pulse', orderController.getPulse);

// 1. Client creates order
router.post('/', orderController.createOrder);

// 2. Store accepts (moves to 'Preparing')
router.patch('/:id/store-accept', orderController.storeAcceptOrder);

// 3. Store marks as ready (moves to 'Waiting')
router.patch('/:id/ready', orderController.markOrderReady);

// 4. Driver accepts (Assigns driver_id)
router.patch('/:id/driver-accept', orderController.driverAcceptOrder);

// 5. Driver claims specific order via PIN
router.patch('/:id/claim', orderController.claimSpecificOrder);

// 6. Driver picks up (Sets delivery_fee)
router.patch('/:id/pickup', orderController.driverPickupOrder);

// 7. Driver is arriving (Notify Client)
router.patch('/:id/arriving', orderController.arrivingNotification);

// 8. Complete Delivery (Verify PIN)
router.patch('/:id/complete', orderController.completeOrder);

// 9. Archive Order (Hide from active list)
router.patch('/:id/archive', orderController.archiveOrder);

// ==========================================
// 🚨 BUG FIX: MISSION ROUTE 🚨
// MUST BE PLACED BEFORE '/:id'
// ==========================================
router.get('/active-missions', orderController.getActiveMissions);

// 9. General info (Dynamic ID catching MUST be last)
router.get('/:id', orderController.getOrderDetails);
router.get('/client/:id/active', orderController.getActiveClientOrders);
router.get('/client/:id/unreviewed', getUnreviewedOrdersFromReview);

export default router;