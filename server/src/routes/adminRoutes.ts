import { Router } from 'express';
import { 
    getAdminStats, 
    getAllOrders, 
    getBuyers, 
    associateBuyer, 
    getOrderDetails 
} from '../controllers/adminController';

// Middleware to check if user is Admin (You should implement this)
// import { verifyAdmin } from '../middleware/auth'; 

const router = Router();

// Apply verifyAdmin middleware to all routes here in a real app

router.get('/admin/stats', getAdminStats);
router.get('/admin/orders', getAllOrders);
router.get('/admin/buyers', getBuyers);
router.patch('/orders/:id/associate-buyer', associateBuyer);
router.get('/orders/:id/details', getOrderDetails);

export default router;