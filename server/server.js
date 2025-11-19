import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import connectCloudinary from './configs/cloudinary.js'
import { clerkMiddleware } from '@clerk/express'
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js'
import userRouter from './routes/userRoutes.js'
import educatorRouter from './routes/educatorRoutes.js'
import courseRouter from './routes/courseRoute.js'

// Initialize Express
const app = express()

// -------------------------------
// Connect to services
// -------------------------------
await connectDB()
await connectCloudinary()

// -------------------------------
// CORS (VERY IMPORTANT FOR DEPLOYMENT)
// -------------------------------
app.use(cors({
    origin: [
        process.env.FRONTEND_URL,   // Vercel URL
        "http://localhost:5173"     // Local frontend
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}));

// -------------------------------
// STRIPE WEBHOOK (RAW BODY) 
// MUST come BEFORE express.json()
// -------------------------------
app.post(
    '/stripe',
    express.raw({ type: 'application/json' }),
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
app.get('/', (req, res) => res.send("API Working"));

app.post('/clerk', clerkWebhooks);

app.use('/api/educator', educatorRouter);
app.use('/api/course', courseRouter);
app.use('/api/user', userRouter);

// -------------------------------
// Server start
// -------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
