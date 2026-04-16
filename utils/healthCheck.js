import prisma from "../config/db.js";

/**
 * Health Check Utilities
 * Monitors application and dependency health
 */

/**
 * Check database connection
 * @returns {Promise<object>} - Database health status
 */
export const checkDatabaseHealth = async () => {
  try {
    // Try a simple query to verify connection
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: "healthy",
      message: "Database connection OK",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "unhealthy",
      message: `Database connection failed: ${error.message}`,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Get comprehensive health status
 * @returns {Promise<object>} - Detailed health status
 */
export const getHealthStatus = async () => {
  const startTime = Date.now();

  const databaseHealth = await checkDatabaseHealth();
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  const responseTime = Date.now() - startTime;

  const overallStatus =
    databaseHealth.status === "healthy" ? "healthy" : "degraded";

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime)}s`,
    version: process.env.APP_VERSION || "1.0.0",
    responseTime: `${responseTime}ms`,
    environment: process.env.NODE_ENV || "development",
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
    },
    dependencies: {
      database: databaseHealth,
    },
  };
};

/**
 * Simple liveness check (is app running?)
 * @returns {object} - Liveness status
 */
export const getLivenessStatus = () => {
  return {
    status: "alive",
    timestamp: new Date().toISOString(),
  };
};

/**
 * Simple readiness check (is app ready to receive traffic?)
 * This could be enhanced to check dependencies
 * @returns {Promise<object>} - Readiness status
 */
export const getReadinessStatus = async () => {
  try {
    const dbHealth = await checkDatabaseHealth();

    const isReady = dbHealth.status === "healthy";

    return {
      status: isReady ? "ready" : "not-ready",
      timestamp: new Date().toISOString(),
      checks: {
        database: dbHealth.status,
      },
    };
  } catch (error) {
    return {
      status: "not-ready",
      timestamp: new Date().toISOString(),
      error: error.message,
    };
  }
};
