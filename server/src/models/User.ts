import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  name: string;
  email: string;
  role: "ADMIN" | "BUYER" | "SELLER";
}

const UserSchema: Schema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ["ADMIN", "BUYER", "SELLER"],
    default: "BUYER",
  },
});

export default mongoose.model<IUser>("User", UserSchema);
