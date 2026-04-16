import { randomUUID } from "crypto";

/**
 * Request Correlation ID Middleware
 * Adds a unique ID to each request for tracing and logging
 */
export const correlationIdMiddleware = (req, res, next) => {
  // Check if correlation ID already exists (from upstream service)
  const correlationId =
    req.headers["x-correlation-id"] ||
    req.headers["x-request-id"] ||
    randomUUID();

  req.id = correlationId;
  req.correlationId = correlationId;

  // Add to response headers for client to track
  res.setHeader("X-Correlation-ID", correlationId);
  res.setHeader("X-Request-ID", correlationId);

  next();
};

/**
 * Add correlation ID to all logs
 */
export const getCorrelationId = (req) => {
  return req.correlationId || "no-id";
};

/**
 * Log with correlation ID
 */
export const logWithCorrelationId = (req, message, level = "info") => {
  const correlationId = getCorrelationId(req);
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${correlationId}] [${level}] ${message}`);
};
