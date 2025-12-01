import { Router } from 'express';
import { 
    getAdminStats, 
    getAllOrders, 
    getBuyers, 
    getSellers,
    associateBuyer, 
    assignSeller,
    getOrderDetails 
} from '../controllers/adminController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// Apply protection to all routes
router.use(protect);

router.get('/admin/stats', authorize('ADMIN'), getAdminStats);
router.get('/admin/orders', authorize('ADMIN'), getAllOrders);
router.get('/admin/buyers', authorize('ADMIN'), getBuyers);
router.get('/admin/sellers', authorize('ADMIN'), getSellers);
router.patch('/orders/:id/associate-buyer', authorize('ADMIN'), associateBuyer);
router.patch('/orders/:id/assign-seller', authorize('ADMIN'), assignSeller);
router.get('/orders/:id/details', authorize('ADMIN'), getOrderDetails);

export default router;