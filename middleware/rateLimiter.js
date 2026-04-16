import rateLimit from "express-rate-limit";
import config from "../config/config.js";
import { errorResponse } from "../utils/responseFormatter.js";

/**
 * General Rate Limiter
 * Applied to all routes
 */
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(
      res,
      429,
      "Too many requests. Please try again later.",
      null,
      "RATE_LIMIT_EXCEEDED",
    );
  },
});

/**
 * Strict Rate Limiter for Authentication
 * Used for login and registration endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per 15 minutes
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  message: "Too many authentication attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(
      res,
      429,
      "Too many authentication attempts. Please try again later.",
      null,
      "AUTH_RATE_LIMIT_EXCEEDED",
    );
  },
});

/**
 * Strict Rate Limiter for Sensitive Operations
 * Used for password changes and profile updates
 */
export const sensitiveOperationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  skipSuccessfulRequests: false,
  message: "Too many sensitive operations, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(
      res,
      429,
      "Too many sensitive operations. Please try again later.",
      null,
      "SENSITIVE_OP_RATE_LIMIT_EXCEEDED",
    );
  },
});

/**
 * Create Rate Limiter for Product Creation
 */
export const createProductLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 products per hour
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    return errorResponse(
      res,
      429,
      "Exceeded product creation limit",
      null,
      "PRODUCT_CREATION_RATE_LIMIT_EXCEEDED",
    );
  },
});

/**
 * API Call Rate Limiter
 * Used for general API calls (GET, POST, etc.)
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(
      res,
      429,
      "Too many API requests. Please try again later.",
      null,
      "API_RATE_LIMIT_EXCEEDED",
    );
  },
});
