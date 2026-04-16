/**
 * Request Sanitization Middleware
 *
 * NOTE: Global sanitization is NOT recommended
 * - Can corrupt valid user data
 * - May break legitimate use cases
 *
 * BEST PRACTICE:
 * - Use Joi validation (already in place)
 * - Sanitize specific fields in controllers when needed
 * - Use sanitization utilities from utils/sanitization.js
 *
 * This middleware is kept for optional use but NOT applied globally in server.js
 */

import { sanitizeEmail, sanitizeText } from "../utils/sanitization.js";

/**
 * Selective sanitization middleware
 * Only sanitizes specific fields that are known to need it
 *
 * Can be applied to individual routes if needed
 */
export const selectiveSanitizationMiddleware = (req, res, next) => {
  try {
    // Only sanitize specific known fields
    if (req.body?.email) {
      req.body.email = sanitizeEmail(req.body.email);
    }
    if (req.body?.name) {
      req.body.name = sanitizeText(req.body.name);
    }
    next();
  } catch (error) {
    console.error("Sanitization error:", error);
    next();
  }
};
