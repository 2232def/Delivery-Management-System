import { Router, Request, Response, NextFunction } from 'express';
import { deleteOrder, getAssignedOrders, updateOrderStage } from '../controllers/sellerController';
import { attachLocalUser, enforceSignIn, verifySeller } from '../middleware/authMiddleware';


const router = Router();

type ExpressMiddleware = (req: Request, res: Response, next: NextFunction) => void;

// Auth Chain: Verify Token -> Attach DB User -> Verify SELLER Role
const authChain: ExpressMiddleware[] = [
    enforceSignIn as unknown as ExpressMiddleware,
    attachLocalUser as ExpressMiddleware,
    verifySeller as ExpressMiddleware
];

// Seller Routes
router.get('/seller/orders', authChain, getAssignedOrders);
router.patch('/orders/:id/next-stage', authChain, updateOrderStage);
router.delete('/orders/:id', authChain, deleteOrder);


export default router;