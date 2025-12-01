import express, { Application } from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import exampleRoutes from "./routes/exampleRoutes";
import adminRoutes from "./routes/adminRoutes";
import buyerRoutes from "./routes/buyerRoutes";
import sellerRoutes from "./routes/sellerRoutes";

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app: Application = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/example", exampleRoutes);
app.use("/api/v1", adminRoutes);
app.use("/api/v1", buyerRoutes);
app.use("/api/v1", sellerRoutes);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for now, configure for production
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
