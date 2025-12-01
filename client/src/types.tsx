export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'SELLER' | 'BUYER';
    createdAt: string;
}

export interface Order {
    _id: string;
    items: string[];
    stage: 'Order Placed' | 'Buyer Associated' | 'Processing' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered';
    buyerId?: User; // Populated
    sellerId?: User; // Populated
    createdAt: string;
    updatedAt: string;
    history: OrderHistory[];
}

export interface OrderHistory {
    stage: string;
    action: string;
    actorName: string;
    actorRole: string;
    timestamp: string;
}

export interface AdminStats {
    totalOrders: number;
    ordersPerStage: Record<string, number>;
    avgDeliveryTime: number; // in milliseconds
}