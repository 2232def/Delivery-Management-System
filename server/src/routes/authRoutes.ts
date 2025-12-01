import { NextFunction, Request, Response, Router } from 'express';
import { syncUser } from '../controllers/authController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

type ExpressMiddleware = (req: Request, res: Response, next: NextFunction) => void;

const authenticate: ExpressMiddleware[] = [
    authenticateUser as unknown as ExpressMiddleware
];

router.post('/auth/sync', authenticate, syncUser);

export default router;