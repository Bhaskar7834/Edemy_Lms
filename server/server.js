import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/mongodb.js';
import connectCloudinary from './configs/cloudinary.js';
import { clerkMiddleware } from '@clerk/express';
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js';
import userRouter from './routes/userRoutes.js';
import educatorRouter from './routes/educatorRoutes.js';
import courseRouter from './routes/courseRoute.js';

const app = express();

// -------------------------------
// Connect to services
// -------------------------------
await connectDB();
await connectCloudinary();

// -------------------------------
// CORS — FINAL FIX (WORKS FOR RENDER + VERCEL)
// -------------------------------
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL, // Vercel frontend
];

app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

// -------------------------------
// Stripe Webhook (MUST BE BEFORE express.json())
// -------------------------------
app.post(
    "/stripe",
    express.raw({ type: "application/json" }),
    stripeWebhooks
);

// -------------------------------
// JSON Body Parser
// -------------------------------
app.use(express.json());

// -------------------------------
// Clerk Middleware
// -------------------------------
app.use(clerkMiddleware());

// -------------------------------
// Routes
// -------------------------------
app.get("/", (req, res) => res.send("API Working"));
app.post("/clerk", clerkWebhooks);

app.use("/api/educator", educatorRouter);
app.use("/api/course", courseRouter);
app.use("/api/user", userRouter);

// -------------------------------
// Start Server
// -------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
