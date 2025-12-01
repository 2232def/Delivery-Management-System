import express, { Application, Request, Response, NextFunction } from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

// --- Imports from your Config files ---
import connectDB from "./config/db"; 
import { initSocket } from "./config/socketConfig";

// --- Route Imports ---
import exampleRoutes from "./routes/exampleRoutes";
import adminRoutes from "./routes/adminRoutes";
import buyerRoutes from "./routes/buyerRoutes";
import sellerRoutes from "./routes/sellerRoutes";
import authRoutes from "./routes/authRoutes"; 

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app: Application = express();
// Create the HTTP server
const server = http.createServer(app);

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Adjust to your client URL
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Register Routes
app.use("/api/auth", authRoutes);      
app.use("/api/v1", adminRoutes);       
app.use("/api/v1", buyerRoutes);       
app.use("/api/v1", sellerRoutes);      
app.use("/api/example", exampleRoutes);

// --- CRITICAL FIX: Initialize Socket.io using your Config ---
// This ensures that 'getIO()' inside your controllers works correctly.
initSocket(server); 

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.io initialized`);
});