import { Request, Response } from 'express';
import Order from '../models/Order';
import User from '../models/User';
import { getIO } from '../config/socketConfig';
import { ORDER_STAGES } from '../models/Order';

// GET /api/seller/orders
// Desc: Get all orders assigned to this specific seller
export const getAssignedOrders = async (req: Request, res: Response) => {
    try {
        const sellerId = req.currentUser.id;

        // Fetch orders and Populate Buyer details for the table
        const orders = await Order.find({ 
            sellerId, 
            isDeleted: false 
        })
        .populate('buyerId', 'name email _id') // Get Buyer Name, Email, ID
        .sort({ updatedAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error("Error fetching seller orders:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// PATCH /api/orders/:id/next-stage
// Desc: Move order to the next stage (Strict 1-step progression)
export const updateOrderStage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const sellerId = req.currentUser.id;
        const sellerName = req.currentUser.name;

        const order = await Order.findOne({ _id: id, sellerId, isDeleted: false });

        if (!order) {
            return res.status(404).json({ message: "Order not found or not assigned to you." });
        }

        // --- STAGE PROGRESSION LOGIC ---
        const currentStageIndex = ORDER_STAGES.indexOf(order.stage);
        
        if (currentStageIndex === -1) {
            return res.status(400).json({ message: "Invalid current stage." });
        }

        if (currentStageIndex >= ORDER_STAGES.length - 1) {
            return res.status(400).json({ message: "Order is already Delivered." });
        }

        const nextStage = ORDER_STAGES[currentStageIndex + 1];

        // 1. Update Stage
        order.stage = nextStage;
        
        // 2. Add Timestamp for new stage (for Admin "View Details")
        // We use .set() because stageTimestamps is a Mongoose Map
        order.stageTimestamps.set(nextStage, new Date());

        // 3. Add to History Log
        order.history.push({
            stage: nextStage,
            action: 'MOVED_NEXT',
            actorId: sellerId as any, // Cast if necessary based on your model types
            actorName: sellerName,
            actorRole: 'SELLER',
            timestamp: new Date()
        });

        await order.save();

        // --- REAL-TIME SOCKET EMISSION ---
        const io = getIO();
        
        // 1. Notify the Buyer (so their Progress Bar moves)
        // Ensure your Buyer connects to a room named `buyer_{buyerId}` or `order_{orderId}`
        // Using buyerId is safer for general notifications
        if (order.buyerId) {
            io.to(`buyer_${order.buyerId.toString()}`).emit('stage_updated', order);
        }

        // 2. Notify Admin (Dashboard updates instantly)
        io.to('admin_room').emit('order_updated', order);

        res.json({ message: `Order moved to ${nextStage}`, order });

    } catch (error) {
        console.error("Error updating stage:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// DELETE /api/orders/:id
// Desc: Soft delete an order
export const deleteOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const sellerId = req.currentUser.id;
        const sellerName = req.currentUser.name;

        const order = await Order.findOne({ _id: id, sellerId, isDeleted: false });

        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        // Soft Delete
        order.isDeleted = true;
        
        // Log the deletion
        order.history.push({
            stage: order.stage,
            action: 'DELETED',
            actorId: sellerId as any,
            actorName: sellerName,
            actorRole: 'SELLER',
            timestamp: new Date()
        });

        await order.save();

        // --- REAL-TIME NOTIFICATION ---
        const io = getIO();
        
        // Notify Admin to remove from table
        io.to('admin_room').emit('order_deleted', id);
        
        // Notify Buyer (e.g., show "Order Cancelled")
        if (order.buyerId) {
            io.to(`buyer_${order.buyerId.toString()}`).emit('order_deleted', id);
        }

        res.json({ message: "Order deleted successfully" });

    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ message: "Server Error" });
    }
};