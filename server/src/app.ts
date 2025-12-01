import express, { Application, Request, Response, NextFunction } from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import { clerkMiddleware } from '@clerk/express';

// --- Imports from your Config files ---
import connectDB from "./config/db"; 
import { initSocket } from "./config/socketConfig";

// --- Route Imports ---
import exampleRoutes from "./routes/exampleRoutes";
import adminRoutes from "./routes/adminRoutes";
import buyerRoutes from "./routes/buyerRoutes";
import sellerRoutes from "./routes/sellerRoutes";
import authRoutes from "./routes/authRoutes"; // Don't forget this one!

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app: Application = express();
// Create the HTTP server
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Clerk Global Middleware
app.use(clerkMiddleware()); 

// Register Routes
app.use("/api/auth", authRoutes);      // For Syncing Users
app.use("/api/v1", adminRoutes);       // Admin
app.use("/api/v1", buyerRoutes);       // Buyer
app.use("/api/v1", sellerRoutes);      // Seller
app.use("/api/example", exampleRoutes);

// Global Error Handler (for Clerk)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.clerkError) {
        console.error("Clerk Error:", err.message);
        return res.status(401).json({ error: "Authentication Failed" });
    }
    next(err);
});

// --- CRITICAL FIX: Initialize Socket.io using your Config ---
// This ensures that 'getIO()' inside your controllers works correctly.
initSocket(server); 

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.io initialized`);
});