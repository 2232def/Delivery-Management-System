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
router.post('/orders', authChain, createOrder);
router.get('/orders/active', authChain, getActiveOrder);
router.get('/orders/history', authChain, getOrderHistory);

export default router;