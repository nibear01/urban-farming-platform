import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import config from "./config/config.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import {
  errorHandlerMiddleware,
  notFoundHandler,
} from "./utils/errorHandler.js";

// Security & Best Practices Middleware
import { applySecurityMiddleware } from "./middleware/security.js";
import { correlationIdMiddleware } from "./middleware/correlationId.js";
import { loggingMiddleware } from "./utils/logger.js";
import {
  preventRequestsDuringShutdown,
  registerShutdownHandlers,
} from "./utils/shutdown.js";
import {
  getHealthStatus,
  getLivenessStatus,
  getReadinessStatus,
} from "./utils/healthCheck.js";
import { asyncHandler } from "./utils/errorHandler.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import produceRoutes from "./routes/produceRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";

const app = express();

// ============================================
// SECURITY & CORE MIDDLEWARE (Order matters!)
// ============================================

// Apply security headers first
applySecurityMiddleware(app);

// Add correlation ID for request tracing
app.use(correlationIdMiddleware);

// Request logging
app.use(loggingMiddleware);

// Standard middleware
app.use(cors());
app.use(express.json({ limit: "16mb" }));
app.use(express.urlencoded({ limit: "16mb", extended: true }));

// HTTP request method logging
app.use(morgan("dev"));

// Note: Input validation is handled by Joi schemas in routes
// SQL injection is prevented by Prisma's parameterized queries
// XSS sanitization available via utils/sanitization.js for specific fields

// Prevent requests during shutdown
app.use(preventRequestsDuringShutdown);

// Apply general rate limiter
app.use(generalLimiter);

// ============================================
// HEALTH CHECK ROUTES (No auth required)
// ============================================

/**
 * @route GET /health
 * @desc Basic liveness check
 * @access Public
 */
app.get("/health", (req, res) => {
  res.status(200).json(getLivenessStatus());
});

/**
 * @route GET /health/ready
 * @desc Readiness check (includes dependency checks)
 * @access Public
 */
app.get(
  "/health/ready",
  asyncHandler(async (req, res) => {
    const readinessStatus = await getReadinessStatus();
    const statusCode = readinessStatus.status === "ready" ? 200 : 503;
    res.status(statusCode).json(readinessStatus);
  }),
);

/**
 * @route GET /health/detailed
 * @desc Comprehensive health status with metrics
 * @access Public (consider restricting in production)
 */
app.get(
  "/health/detailed",
  asyncHandler(async (req, res) => {
    const healthStatus = await getHealthStatus();
    const statusCode = healthStatus.status === "healthy" ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  }),
);

// ============================================
// API ROUTES
// ============================================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/produce", produceRoutes);
app.use("/api/community", communityRoutes);

// ============================================
// ERROR HANDLING (Order matters!)
// ============================================

// 404 handler
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandlerMiddleware);

// ============================================
// SERVER STARTUP
// ============================================

const server = app.listen(config.port, () => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ Server is running on port ${config.port}`);
  console.log(`🏥 Liveness Check: http://localhost:${config.port}/health`);
  console.log(
    `👍 Readiness Check: http://localhost:${config.port}/health/ready`,
  );
  console.log(
    `📊 Detailed Health: http://localhost:${config.port}/health/detailed`,
  );
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

registerShutdownHandlers(server);
