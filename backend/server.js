import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import express from "express";
import http from "http";
import { Server as SocketServer } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminEmailRoutes from "./routes/adminEmailRoutes.js";

dotenv.config();

// ==========================================
// ENVIRONMENT VALIDATION
// Warn (don't exit) so Vercel can still import the module.
// Requests will fail gracefully with 503/401 if env vars are missing.
// ==========================================
if (!process.env.JWT_SECRET) {
  console.error("WARNING: JWT_SECRET environment variable is missing. Auth routes will fail.");
}
if (!process.env.MONGO_URI) {
  console.error("WARNING: MONGO_URI environment variable is missing. DB will not connect.");
}

const app = express();

// ==========================================
// CORS CONFIGURATION
// ==========================================
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const frontendUrl = process.env.FRONTEND_URL || "";
const allowedOrigins = [
  clientUrl,
  frontendUrl,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5000",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps, server-to-server)
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }
    callback(new Error("CORS policy violation: Access denied for this origin."));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(helmet());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Express 5 compatible MongoDB injection sanitization (in-place mutation without reassigning req.query getter)
app.use((req, res, next) => {
  ["body", "params", "headers", "query"].forEach((key) => {
    if (req[key]) {
      mongoSanitize.sanitize(req[key]);
    }
  });
  next();
});

// Safe Trust Proxy configuration (if behind reverse proxy like Nginx/Cloudflare/Render)
if (process.env.TRUST_PROXY) {
  const tp = process.env.TRUST_PROXY;
  app.set("trust proxy", tp === "true" ? 1 : isNaN(Number(tp)) ? tp : Number(tp));
} else if (process.env.NODE_ENV === "production") {
  // Vercel always sits behind a proxy — enable trust proxy automatically in production
  app.set("trust proxy", 1);
}

// Rate Limiting - Global API Limiter
const isDev = process.env.NODE_ENV !== "production";
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10000 : 1500, // Generous dev limit, protective limit in prod
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

// ==========================================
// SOCKET.IO (Real-time updates)
// Socket.IO is only initialized in local development.
// Vercel serverless functions do not support persistent WebSocket connections.
// ==========================================
let io = null;
let localServer = null;

const isVercel = !!process.env.VERCEL;

if (!isVercel) {
  // Socket.IO only runs in local development.
  // Vercel serverless does not support persistent WebSocket connections.
  localServer = http.createServer(app);

  io = new SocketServer(localServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected via Socket.io:", socket.id);

    socket.on("join-admin", () => {
      socket.join("admin-room");
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

// Attach io to req for controllers if needed (null-safe in serverless)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ==========================================
// LAZY MONGODB CONNECTION WITH CACHING
// Vercel serverless: reuse the connection across warm function invocations.
// ==========================================
let isDbConnected = false;

const connectDB = async () => {
  if (isDbConnected && mongoose.connection.readyState === 1) return;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is not set.");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  isDbConnected = true;
  console.log("MongoDB connected ✅");
};

// Middleware: ensure DB is ready before any route handler executes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection error:", err.message);
    res.status(503).json({
      success: false,
      message: "Database unavailable. Please try again shortly.",
    });
  }
});

// ==========================================
// ROUTES
// ==========================================
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin/email", adminEmailRoutes);

// ==========================================
// HEALTH CHECK
// ==========================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ShopEase backend is running 🚀",
  });
});

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("GLOBAL SERVER ERROR:", err);

  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ==========================================
// LOCAL DEVELOPMENT SERVER STARTUP
// Vercel manages its own HTTP server lifecycle — do NOT call listen() when running on Vercel.
// ==========================================
if (!isVercel) {
  const PORT = process.env.PORT || 5000;

  connectDB()
    .then(() => {
      localServer.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT} 🚀`);
      });
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error);
      process.exit(1);
    });
}

// ==========================================
// EXPORTS
// Vercel requires the DEFAULT export to be the Express app (a handler function).
// Named export of `io` is preserved for any local consumers.
// ==========================================
export { io };
export default app;