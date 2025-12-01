import { Router, Request, Response, NextFunction } from 'express';
import { 
    getAdminStats, 
    getAllOrders, 
    getBuyers, 
    associateBuyer, 
    getOrderDetails 
} from '../controllers/adminController';
import { authenticateUser, attachLocalUser, verifyAdmin } from '../middleware/authMiddleware';

// Middleware to check if user is Admin (You should implement this)
// import { verifyAdmin } from '../middleware/auth'; 

type ExpressMiddleware = (req: Request, res: Response, next: NextFunction) => void;

const router = Router();

const authChain: ExpressMiddleware[] = [
    authenticateUser as unknown as ExpressMiddleware,
    attachLocalUser as ExpressMiddleware,
    verifyAdmin as ExpressMiddleware
];
// Apply verifyAdmin middleware to all routes here in a real app

router.get('/admin/stats', authChain, getAdminStats);
router.get('/admin/orders', authChain, getAllOrders);
router.get('/admin/buyers', authChain, getBuyers);
router.patch('/orders/:id/associate-buyer', authChain, associateBuyer);
router.get('/orders/:id/details', authChain, getOrderDetails);

export default router;