import { Router } from 'express';
import {
    createOrder,
    getActiveOrder,
    getOrderHistory
} from '../controllers/buyerController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// Apply protection to all routes
router.use(protect);

router.post('/orders', authorize('BUYER'), createOrder);
router.get('/orders/active', authorize('BUYER'), getActiveOrder);
router.get('/orders/history', authorize('BUYER'), getOrderHistory);

export default router;