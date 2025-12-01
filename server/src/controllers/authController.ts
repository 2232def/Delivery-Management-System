import { Request, Response } from 'express';
import User from '../models/User';

// POST /api/auth/sync
// Desc: Ensures the Clerk User exists in our MongoDB
export const syncUser = async (req: Request, res: Response) => {
    try {
        // req.auth is provided by ClerkExpressRequireAuth
        const { userId } = req.auth; 
        const { name, email, role } = req.body; // Sent from Frontend after Clerk Login

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Check if user exists
        let user = await User.findOne({ clerkId: userId });

        if (!user) {
            // Create new user in MongoDB
            user = new User({
                clerkId: userId,
                name,
                email,
                role: role || 'BUYER' // Default to Buyer if not specified
            });
            await user.save();
            console.log(`New user synced: ${email} (${role})`);
        } else {
            // Optional: Update details if they changed
            // user.name = name;
            // await user.save();
        }

        res.status(200).json({ message: "User synced", user });
    } catch (error) {
        console.error("Sync Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};