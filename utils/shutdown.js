import prisma from "../config/db.js";

/**
 * Graceful Shutdown Utilities
 * Handles proper cleanup when server is shutting down
 */

let isShuttingDown = false;

/**
 * Check if server is shutting down
 * @returns {boolean}
 */
export const isServerShuttingDown = () => isShuttingDown;

/**
 * Set shutdown flag
 */
export const setShuttingDown = () => {
  isShuttingDown = true;
};

/**
 * Gracefully shut down the server
 * @param {object} server - Express server instance
 * @param {string} signal - Signal that triggered shutdown (SIGTERM, SIGINT)
 */
export const gracefulShutdown = async (server, signal = "SIGTERM") => {
  console.log(`\n📛 ${signal} received, starting graceful shutdown...`);

  setShuttingDown();

  // Stop accepting new requests
  server.close(async () => {
    console.log("✅ HTTP server closed");

    try {
      // Close database connections
      await prisma.$disconnect();
      console.log("✅ Database connection closed");
    } catch (error) {
      console.error("Error closing database:", error);
      process.exit(1);
    }

    console.log("Server shutdown complete");
    process.exit(0);
  });

  // Force shutdown after timeout
  const shutdownTimeout = setTimeout(() => {
    console.error("Graceful shutdown timeout, forcing exit");
    process.exit(1);
  }, 30000); // 30 seconds

  shutdownTimeout.unref();
};

/**
 * Register graceful shutdown handlers
 * @param {object} server - Express server instance
 */
export const registerShutdownHandlers = (server) => {
  const signals = ["SIGTERM", "SIGINT"];

  signals.forEach((signal) => {
    process.on(signal, () => {
      gracefulShutdown(server, signal);
    });
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    gracefulShutdown(server, "UNCAUGHT_EXCEPTION");
  });

  // Handle unhandled rejections
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    gracefulShutdown(server, "UNHANDLED_REJECTION");
  });
};

/**
 * Middleware to prevent requests during shutdown
 */
export const preventRequestsDuringShutdown = (req, res, next) => {
  if (isServerShuttingDown()) {
    return res.status(503).json({
      success: false,
      message: "Server is shutting down",
      statusCode: 503,
    });
  }
  next();
};
