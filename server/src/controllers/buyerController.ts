import { Request, Response } from 'express';
import Order from '../models/Order';
import User from '../models/User';
import { getIO } from '../config/socketConfig';

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { items } = req.body;
        const buyerId = req.currentUser.id; // <-- Fetched from Auth Middleware!
        const buyerName = req.currentUser.name;

        // 1. BUSINESS LOGIC: Check for one active order (PDF requirement)
        const activeOrder = await Order.findOne({ 
            buyerId, 
            stage: { $ne: 'Delivered' }, 
            isDeleted: false 
        });

        if (activeOrder) {
            return res.status(400).json({ 
                message: "You can only have one active order at a time." 
            });
        }

        // 2. Create the Order
        const newOrder = new Order({
            items,
            buyerId,
            stage: 'Order Placed',
            // Initial log entry
            history: [{ 
                stage: 'Order Placed', 
                action: 'CREATED', 
                actorId: buyerId, 
                actorName: buyerName,
                timestamp: new Date() 
            }],
        });

        await newOrder.save();
        
        // 3. REAL-TIME NOTIFICATION (Admin needs to see the new order)
        const io = getIO();
        io.to('admin_room').emit('order_created', newOrder);

        res.status(201).json({ message: "Order created successfully. Awaiting Admin assignment.", order: newOrder });

    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// GET /api/orders/active
export const getActiveOrder = async (req: Request, res: Response) => {
    try {
        const buyerId = req.currentUser.id;

        // Fetch the single active order
        const activeOrder = await Order.findOne({ 
            buyerId, 
            stage: { $ne: 'Delivered' }, 
            isDeleted: false 
        })
        .select('stage items createdAt'); // Only necessary fields for progress bar

        if (!activeOrder) {
            return res.status(200).json({ message: "No active order found." });
        }

        res.json(activeOrder);
    } catch (error) {
        console.error("Error fetching active order:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// GET /api/orders/history
export const getOrderHistory = async (req: Request, res: Response) => {
    try {
        const buyerId = req.currentUser.id;

        // Fetch delivered/deleted orders
        const historyOrders = await Order.find({ 
            buyerId, 
            stage: 'Delivered' 
        })
        .sort({ createdAt: -1 });

        res.json(historyOrders);
    } catch (error) {
        console.error("Error fetching order history:", error);
        res.status(500).json({ message: "Server Error" });
    }
};