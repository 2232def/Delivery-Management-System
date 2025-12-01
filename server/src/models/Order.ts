import mongoose, { Schema, Document } from 'mongoose';

// -----------------------------------------------------------------------------
// CONSTANTS
// -----------------------------------------------------------------------------
export const ORDER_STAGES = [
    'Order Placed',
    'Buyer Associated',
    'Processing',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered'
] as const;

export type OrderStage = typeof ORDER_STAGES[number];

export interface IOrder extends Document {
    items: string[];
    stage: OrderStage;
    
    // Relationships
    buyerId?: mongoose.Types.ObjectId;   
    sellerId?: mongoose.Types.ObjectId; 
    
    // --- MISSING IN YOUR VERSION ---
    // Essential for Admin "Time taken between stages"
    stageTimestamps: Map<string, Date>; 

    // --- UPDATED STRUCTURE ---
    // Detailed log for Admin "View Details"
    history: {
        stage: string;
        action: string;      
        actorId: mongoose.Types.ObjectId; 
        actorName: string;   
        actorRole: string;
        timestamp: Date;
    }[];

    // --- MISSING IN YOUR VERSION ---
    // Essential for "Soft Delete"
    isDeleted: boolean; 
    
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
    items: { type: [String], required: true },
    stage: {
        type: String,
        enum: ORDER_STAGES,
        default: 'Order Placed',
        required: true
    },
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    
    // FIX 1: Add stageTimestamps
    stageTimestamps: {
        type: Map,
        of: Date,
        default: {}
    },

    // FIX 2: Update History to store full actor details
    history: [{
        stage: { type: String, required: true },
        action: { type: String, required: true },
        actorId: { type: Schema.Types.ObjectId, ref: 'User' },
        actorName: { type: String }, 
        actorRole: { type: String }, 
        timestamp: { type: Date, default: Date.now }
    }],

    // FIX 3: Add isDeleted flag
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Helper to set initial timestamp
OrderSchema.pre('save', function() {
    if (this.isNew) {
        (this as any).stageTimestamps.set('Order Placed', new Date());
    }
});

export default mongoose.model<IOrder>('Order', OrderSchema);