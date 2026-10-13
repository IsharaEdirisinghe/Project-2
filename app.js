
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import productRouter from "./routes/productRouter.js";
import userRouter from "./routes/userRouter.js";
import orderRouter from "./routes/orderRouter.js";
import dashboardRouter from "./routes/dashboardRouter.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection reuse
let connectionPromise;

async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return;
    }

    if (!connectionPromise) {
        connectionPromise = mongoose
            .connect(process.env.MONGODB_URL)
            .catch((error) => {
                connectionPromise = null;
                throw error;
            });
    }

    await connectionPromise;
}

// Connect to MongoDB before processing API requests
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);

        res.status(503).json({
            message: "Database connection failed"
        });
    }
});

// JWT Authentication Middleware
app.use((req, res, next) => {
    const tokenString = req.header("Authorization");

    // Allow requests without a token to continue.
    // Protected routes should enforce authentication
    // in their own verifyToken middleware.
    if (!tokenString) {
        return next();
    }

    const token = tokenString.replace(/^Bearer\s+/i, "");

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                message: "Invalid token"
            });
        }

        req.user = decoded;
        next();
    });
});

// API Routes
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);
app.use("/api/dashboard", dashboardRouter);

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Velora backend is running"
    });
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error("Server error:", err);

    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({
        message: "Internal server error"
    });
});

export default app;
