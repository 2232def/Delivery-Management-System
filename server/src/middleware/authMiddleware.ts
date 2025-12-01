import { Request, Response, NextFunction } from 'express';
// We are only using ClerkExpressRequireAuth from the SDK, so we import it directly.
// We remove unused imports 'Clerk' and 'User' for cleaner code.
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'; 
import UserModel from '../models/User'; // Import your local MongoDB User model

// Extend the Express Request type to include Clerk and local user data
declare global {
    namespace Express {
        interface Request {
            auth: any; // Clerk authentication data
            currentUser: { // Our customized user object for controllers
                id: string;      // MongoDB ObjectId (as string)
                clerkId: string; // Clerk User ID
                role: 'ADMIN' | 'SELLER' | 'BUYER';
                name: string;
            }
        }
    }
}

// 1. Middleware to verify the Clerk token and attach local DB data
export const authenticateUser = ClerkExpressRequireAuth({
    // Optional: configuration for public routes if needed, but we'll protect all
});

// 2. Middleware to attach the local MongoDB user details and role
export const attachLocalUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const clerkId = req.auth.userId; // Get Clerk ID from the verified token

        if (!clerkId) {
            return res.status(401).json({ message: "Authentication failed: No Clerk ID." });
        }

        // --- Find the corresponding user in your MongoDB ---
        const localUser = await UserModel.findOne({ clerkId: clerkId }); // Assuming you sync Clerk ID to local User model

        if (!localUser) {
            return res.status(403).json({ message: "User not found in local database." });
        }

        // Attach simplified user object to the request
        req.currentUser = {
            id: localUser._id.toString(), // The MongoDB ID we use for Order lookups
            clerkId: clerkId,
            role: localUser.role,
            name: localUser.name,
        };

        next();
    } catch (error) {
        console.error("Error attaching local user:", error);
        return res.status(500).json({ message: "Internal server error during user lookup." });
    }
};

// 3. Role-based check helpers (used on specific routes)
export const checkRole = (requiredRole: 'ADMIN' | 'SELLER' | 'BUYER') => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.currentUser) {
            return res.status(401).json({ message: "Authentication required." });
        }
        
        // Simple check: is the user's role exactly the one required?
        if (req.currentUser.role === requiredRole) {
            next();
        } else {
            return res.status(403).json({ message: `Access denied. Requires role: ${requiredRole}` });
        }
    };
};

// --- Specific Role Middleware for Routes ---
export const verifyAdmin = checkRole('ADMIN');
export const verifySeller = checkRole('SELLER');
export const verifyBuyer = checkRole('BUYER');