import express from "express";
import { asyncHandler } from "../utils/errorHandler.js";
import {
  getHealthStatus,
  getLivenessStatus,
  getReadinessStatus,
} from "../utils/healthCheck.js";

const router = express.Router();

/**
 * @route GET /health
 * @desc Basic liveness check
 * @access Public
 */
router.get("/", (req, res) => {
  res.status(200).json(getLivenessStatus());
});

/**
 * @route GET /health/ready
 * @desc Readiness check (includes dependency checks)
 * @access Public
 */
router.get(
  "/ready",
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
router.get(
  "/detailed",
  asyncHandler(async (req, res) => {
    const healthStatus = await getHealthStatus();
    const statusCode = healthStatus.status === "healthy" ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  }),
);

export default router;
