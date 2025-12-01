import { Router, Request, Response, NextFunction } from 'express';
import {
    createOrder,
    getActiveOrder,
    getOrderHistory
} from '../controllers/buyerController';
import { authenticateUser, attachLocalUser, verifyBuyer } from '../middleware/authMiddleware';

type ExpressMiddleware = (req: Request, res: Response, next: NextFunction) => void;

const router = Router();

const authChain: ExpressMiddleware[] = [
    authenticateUser as unknown as ExpressMiddleware,
    attachLocalUser as ExpressMiddleware,
    verifyBuyer as ExpressMiddleware
];

// Core Buyer Routes
router.post('/orders', createOrder);
router.get('/orders/active', getActiveOrder);
router.get('/orders/history', getOrderHistory);

export default router;