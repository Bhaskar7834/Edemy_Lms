import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/mongodb.js";
import connectCloudinary from "./configs/cloudinary.js";
import { clerkMiddleware } from "@clerk/express";
import { clerkWebhooks, stripeWebhooks } from "./controllers/webhooks.js";
import userRouter from "./routes/userRoutes.js";
import educatorRouter from "./routes/educatorRoutes.js";
import courseRouter from "./routes/courseRoute.js";

const app = express();

// -------------------------------
// Connect Database + Cloudinary
// -------------------------------
await connectDB();
await connectCloudinary();

// -------------------------------
// CORS — UNIVERSAL, WORKS FOR EVERYTHING
// -------------------------------
app.use((req, res, next) => {
  const origin = req.headers.origin || "*";

  // Allow any frontend domain
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// -------------------------------
// Stripe Webhook (RAW BODY) — MUST BE BEFORE express.json()
// -------------------------------
app.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

// -------------------------------
// JSON Parser
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
  console.log(`Backend running on port ${PORT}`);
});
