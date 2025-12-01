import { Request, Response } from 'express';
import Order from '../models/Order';
import User from '../models/User';
import { getIO } from '../config/socketConfig';

// GET /api/admin/stats
export const getAdminStats = async (req: Request, res: Response) => {
    try {
        const totalOrders = await Order.countDocuments();
        
        // Group by stage to get counts (e.g., { "Packed": 5, "Delivered": 10 })
        const ordersPerStage = await Order.aggregate([
            { $group: { _id: "$stage", count: { $sum: 1 } } }
        ]);

        // Calculate average delivery time (Simple approximation)
        // Find delivered orders, subtract createdAt from updatedAt, average it.
        const deliveredOrders = await Order.find({ stage: 'Delivered' });
        let avgTime = 0;
        if (deliveredOrders.length > 0) {
            const totalTime = deliveredOrders.reduce((acc, order) => {
                return acc + (new Date(order.updatedAt).getTime() - new Date(order.createdAt).getTime());
            }, 0);
            avgTime = totalTime / deliveredOrders.length; 
            // Convert ms to hours for frontend display
        }

        res.json({
            totalOrders,
            ordersPerStage,
            avgDeliveryTime: avgTime // in milliseconds
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// GET /api/admin/orders
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        // Populate Buyer and Seller details to show names/emails in the table
        const orders = await Order.find()
            .populate('buyerId', 'name email _id')
            .populate('sellerId', 'name email _id')
            .sort({ createdAt: -1 }); // Newest first

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// GET /api/admin/buyers
export const getBuyers = async (req: Request, res: Response) => {
    try {
        const buyers = await User.find({ role: 'BUYER' }).select('name email _id');
        res.json(buyers);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// PATCH /api/orders/:id/associate-buyer
export const associateBuyer = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { buyerId } = req.body;
        // Get Admin details from the middleware (req.currentUser)
        const adminId = req.currentUser.id; 
        const adminName = req.currentUser.name;

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        // Update fields
        order.buyerId = buyerId;
        order.stage = "Buyer Associated";
        
        // Add to history log (UPDATED TO MATCH NEW SCHEMA)
        order.history.push({
            stage: "Buyer Associated",
            action: "ASSOCIATED", // Matches 'action' in schema
            actorId: adminId as any, // Matches 'actorId' in schema
            actorName: adminName,    // Matches 'actorName' in schema
            actorRole: "ADMIN",      // Matches 'actorRole' in schema
            timestamp: new Date()
        });

        await order.save();

        // --- REAL TIME SOCKET EMISSION ---
        const io = getIO();
        
        // 1. Notify the specific Buyer (so their "Active Order" updates immediately)
        io.to(`buyer_${buyerId}`).emit('order_assigned', order);
        
        // 2. Notify all Sellers (in case this order was in their list)
        // Note: The PDF says Sellers see assigned orders. If logic assigns seller later, 
        // you might emit to 'all_sellers' or just rely on Admin view updating.
        io.to('admin_room').emit('order_updated', order);

        res.json({ message: "Buyer associated successfully", order });

    } catch (error) {
        console.error("Error associating buyer:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// GET /api/orders/:id/details
export const getOrderDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id)
            .populate('buyerId', 'name email')
            .populate('sellerId', 'name email');

        if (!order) return res.status(404).json({ message: "Order not found" });

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};