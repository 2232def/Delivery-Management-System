import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      currentUser: {
        id: string;
        role: 'ADMIN' | 'SELLER' | 'BUYER';
        name: string;
        email: string;
      };
    }
  }
}

// Protect Middleware
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as any;

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'No user found with this id' });
    }

    req.currentUser = {
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    if (!roles.includes(req.currentUser.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.currentUser.role} is not authorized to access this route`,
      });
    }
    next();
  };
};