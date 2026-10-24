import path from "path";
import { fileURLToPath } from "url";
import dns from "dns";
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

// ==========================================
// ENVIRONMENT SETUP
// ==========================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure backend .env is loaded regardless of process cwd
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config(); // fallback to cwd .env

const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

// Only configure fallback DNS in local development.
// In AWS Lambda / Vercel, overriding DNS to 8.8.8.8 fails because outbound UDP port 53 is blocked.
if (!isVercel && process.env.NODE_ENV !== "production") {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch (dnsErr) {
    console.warn("Could not set local custom DNS:", dnsErr.message);
  }
}

// Environment validation
if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET environment variable is missing. Authentication routes will fail.");
}
if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
  console.warn("WARNING: MONGO_URI / MONGODB_URI environment variable is missing.");
}

const app = express();

// ==========================================
// CORS CONFIGURATION
// ==========================================
const normalizeOrigin = (url) => (url ? url.trim().replace(/\/+$/, "") : "");

const configuredOrigins = new Set(
  [
    "https://shopease-8fpe.vercel.app",
    normalizeOrigin(process.env.FRONTEND_URL),
    normalizeOrigin(process.env.CLIENT_URL),
    ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map(normalizeOrigin) : []),
    ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map(normalizeOrigin) : []),
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:5000",
  ].filter(Boolean)
);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server, mobile apps)
    if (!origin) {
      return callback(null, true);
    }

    const cleanOrigin = normalizeOrigin(origin);

    if (
      configuredOrigins.has(cleanOrigin) ||
      cleanOrigin === "https://shopease-8fpe.vercel.app" ||
      /^https:\/\/shopease-8fpe(-[a-z0-9-]+)?\.vercel\.app$/.test(cleanOrigin) ||
      cleanOrigin.endsWith(".vercel.app") ||
      process.env.NODE_ENV !== "production"
    ) {
      return callback(null, true);
    }

    console.warn(`[CORS] Rejected unlisted origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
  ],
  exposedHeaders: ["Content-Length", "X-Vercel-Id", "Authorization"],
  maxAge: 86400,
  optionsSuccessStatus: 204,
};

// Enable CORS for all incoming requests and preflight OPTIONS
app.use(cors(corsOptions));
// Express 5 (path-to-regexp v8) requires named wildcards — bare "*" throws at startup
app.options("/{*path}", cors(corsOptions));

// Explicit preflight handler to guarantee instant 204 response without hitting DB or rate limiters
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

// Configure Helmet with cross-origin resource sharing support
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: false,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Express 5 compatible MongoDB injection sanitization
app.use((req, res, next) => {
  ["body", "params", "headers", "query"].forEach((key) => {
    if (req[key]) {
      mongoSanitize.sanitize(req[key]);
    }
  });
  next();
});

// Trust proxy for Vercel / reverse proxies
if (process.env.TRUST_PROXY) {
  const tp = process.env.TRUST_PROXY;
  app.set("trust proxy", tp === "true" ? 1 : isNaN(Number(tp)) ? tp : Number(tp));
} else {
  app.set("trust proxy", 1);
}

// Rate Limiting - Global API Limiter (skips preflights)
const isDev = process.env.NODE_ENV !== "production";
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 1500,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
});
app.use("/api/", apiLimiter);

// ==========================================
// SOCKET.IO (Local Development)
// ==========================================
let io = null;
let localServer = null;

if (!isVercel) {
  localServer = http.createServer(app);

  io = new SocketServer(localServer, {
    cors: {
      origin: Array.from(configuredOrigins),
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
// MONGODB CONNECTION WITH CACHING & FALLBACK
// ==========================================
let isDbConnected = false;
let dbConnectingPromise = null;

const directFallbackUri =
  "mongodb://Muhammad_Subhan:Subhan123456@ac-zjqpnkp-shard-00-00.3xfhbmo.mongodb.net:27017,ac-zjqpnkp-shard-00-01.3xfhbmo.mongodb.net:27017,ac-zjqpnkp-shard-00-02.3xfhbmo.mongodb.net:27017/shopease?ssl=true&replicaSet=atlas-a508fn-shard-0&authSource=admin&appName=Cluster0";

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    isDbConnected = true;
    return;
  }

  // Reuse in-flight connection promise across concurrent cold-start requests
  if (dbConnectingPromise) {
    return dbConnectingPromise;
  }

  const primaryUri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    directFallbackUri;

  const connectOptions = {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 0,
  };

  dbConnectingPromise = (async () => {
    try {
      await mongoose.connect(primaryUri, connectOptions);
      isDbConnected = true;
      console.log("MongoDB connected successfully ✅");
    } catch (primaryErr) {
      console.warn("Primary MongoDB connection failed:", primaryErr.message);

      // If SRV DNS resolution fails, automatically retry with the direct replica-set URI
      if (
        directFallbackUri &&
        primaryUri !== directFallbackUri &&
        (primaryErr.message.includes("querySrv") ||
          primaryErr.message.includes("ENOTFOUND") ||
          primaryErr.message.includes("ECONNREFUSED") ||
          primaryErr.message.includes("ETIMEDOUT"))
      ) {
        console.log("Retrying with direct replica-set MongoDB connection...");
        await mongoose.connect(directFallbackUri, connectOptions);
        isDbConnected = true;
        console.log("MongoDB connected via direct replica-set fallback ✅");
      } else {
        throw primaryErr;
      }
    } finally {
      dbConnectingPromise = null;
    }
  })();

  return dbConnectingPromise;
};

// Middleware: ensure DB is ready before request handlers execute.
// Exclude preflight OPTIONS and health check endpoints so they always respond immediately.
app.use(async (req, res, next) => {
  if (
    req.method === "OPTIONS" ||
    req.path === "/" ||
    req.path === "/health" ||
    req.path === "/api" ||
    req.path === "/api/health"
  ) {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection error:", err.message);
    res.status(503).json({
      success: false,
      message: "Database unavailable. Please try again shortly.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// ==========================================
// ROUTES (Mounted for both /api/* and root /*)
// ==========================================
const mountRoutes = (prefix = "") => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/products`, productRoutes);
  app.use(`${prefix}/categories`, categoryRoutes);
  app.use(`${prefix}/cart`, cartRoutes);
  app.use(`${prefix}/wishlist`, wishlistRoutes);
  app.use(`${prefix}/orders`, orderRoutes);
  app.use(`${prefix}/notifications`, notificationRoutes);
  app.use(`${prefix}/reviews`, reviewRoutes);
  app.use(`${prefix}/admin/email`, adminEmailRoutes);
};

// Support requests with or without /api prefix
mountRoutes("/api");
mountRoutes("");

// ==========================================
// HEALTH CHECK
// ==========================================
const healthHandler = (req, res) => {
  res.status(200).json({
    success: true,
    message: "ShopEase backend is running 🚀",
    database: mongoose.connection.readyState === 1 ? "connected" : "connecting/idle",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production",
  });
};

app.get("/", healthHandler);
app.get("/health", healthHandler);
app.get("/api", healthHandler);
app.get("/api/health", healthHandler);

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
// ==========================================
const isDirectRun = process.argv[1] ? path.resolve(process.argv[1]) === path.resolve(__filename) : false;
if (!isVercel && isDirectRun) {
  const PORT = process.env.PORT || 5000;

  connectDB()
    .then(() => {
      localServer.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT} 🚀`);
      });
    })
    .catch((error) => {
      console.error("MongoDB connection failed at local startup:", error.message);
      localServer.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT} (Database offline) ⚠️`);
      });
    });
}

// ==========================================
// EXPORTS
// ==========================================
export { io, connectDB };
export default app;