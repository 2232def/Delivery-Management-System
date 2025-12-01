import { Request, Response, NextFunction } from "express";
import { clerkMiddleware, requireAuth } from '@clerk/express'; 
import UserModel from "../models/User"; 


// Extend the Express Request type to include Clerk and local user data
declare global {
    namespace Express {
        interface Request {
            // Clerk provides auth data via the clerkMiddleware
            auth: any; 
            currentUser: { // Our customized user object for controllers
                id: string;      // MongoDB ObjectId (as string)
                clerkId: string; // Clerk User ID
                role: 'ADMIN' | 'SELLER' | 'BUYER';
                name: string;
            }
        }
    }
}

// 1. Clerk's main global middleware. This runs BEFORE any custom logic.
// This is now applied in app.ts, but we keep this exported for reference if needed.
// For now, we will use requireAuth() on specific routes.
export const clerkAuthMiddleware = clerkMiddleware();

// 2. We use requireAuth() on specific routes to enforce sign-in.
// This function ensures a user is signed in before proceeding.
export const enforceSignIn = requireAuth({ 
    // This is equivalent to your old ClerkExpressRequireAuth()
    // By default, it requires a session.
});


// 3. Middleware to attach the local MongoDB user details and role
// This must run *after* 'enforceSignIn'
export const attachLocalUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Clerk places user data on req.auth
        const clerkId = req.auth.userId; 

        if (!clerkId) {
            // Should be caught by requireAuth(), but safety check remains
            return res.status(401).json({ message: "Authentication failed: No Clerk ID." });
        }

        // --- Find the corresponding user in your MongoDB ---
        const localUser = await UserModel.findOne({ clerkId: clerkId }); 

        if (!localUser) {
            return res.status(403).json({ message: "User not found in local database." });
        }

        // Attach simplified user object to the request
        req.currentUser = {
            id: localUser._id.toString(), 
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

// 4. Role-based check helpers (used on specific routes)
export const checkRole = (requiredRole: 'ADMIN' | 'SELLER' | 'BUYER') => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.currentUser) {
            return res.status(401).json({ message: "Authentication required." });
        }
        
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