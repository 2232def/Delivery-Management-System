import mongoose, { Document, Schema } from "mongoose";

export interface IOrder extends Document {
    items: string[];
    stage:
    | "Order Placed"
    | "Buyer Associated"
    | "Processing"
    | "Packed"
    | "Shipped"
    | "Out for Delivery"
    | "Delivered";
    buyerId?: mongoose.Types.ObjectId;
    sellerId?: mongoose.Types.ObjectId;
    history: {
        stage: string;
        timestamp: Date;
        actor: string; // e.g., "Admin", "Seller", "System"
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
    {
        items: { type: [String], required: true },
        stage: {
            type: String,
            enum: [
                "Order Placed",
                "Buyer Associated",
                "Processing",
                "Packed",
                "Shipped",
                "Out for Delivery",
                "Delivered",
            ],
            default: "Order Placed",
        },
        buyerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
        sellerId: { type: Schema.Types.ObjectId, ref: "User", default: null },

        // Detailed log for "View Details"
        history: [
            {
                stage: { type: String, required: true },
                timestamp: { type: Date, default: Date.now },
                actor: { type: String, required: true },
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model<IOrder>("Order", OrderSchema);
