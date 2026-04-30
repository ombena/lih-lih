import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { getUnreviewedOrders as getUnreviewedOrdersFromReview } from '../controllers/reviewController';

const router = Router();

// 1. Client creates order
router.post('/', orderController.createOrder);

// 2. Store accepts (moves to 'Preparing')
router.patch('/:id/store-accept', orderController.storeAcceptOrder);

// NEW: Store marks as ready (moves to 'Waiting')
router.patch('/:id/ready', orderController.markOrderReady);

// 3. Driver accepts (Assigns driver_id)
router.patch('/:id/driver-accept', orderController.driverAcceptOrder);

// 4. Driver picks up (Sets delivery_fee)
router.patch('/:id/pickup', orderController.driverPickupOrder);

// 5. Driver is arriving (Notify Client)
router.patch('/:id/arriving', orderController.arrivingNotification);

// 6. Complete Delivery (Verify PIN)
router.patch('/:id/complete', orderController.completeOrder);

// 7. General info
router.get('/:id', orderController.getOrderDetails);
router.get('/client/:id/active', orderController.getActiveClientOrders);
router.get('/client/:id/unreviewed', getUnreviewedOrdersFromReview);

export default router;