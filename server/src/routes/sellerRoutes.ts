import { Router } from 'express';
import { deleteOrder, getAssignedOrders, updateOrderStage } from '../controllers/sellerController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// Apply protection to all routes
router.use(protect);

router.get('/seller/orders', authorize('SELLER'), getAssignedOrders);
router.patch('/orders/:id/next-stage', authorize('SELLER'), updateOrderStage);
router.delete('/orders/:id', authorize('SELLER'), deleteOrder);

export default router;