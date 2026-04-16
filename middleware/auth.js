import { verifyAccessToken, verifyRefreshToken } from "../utils/jwtUtils.js";
import {
  forbiddenResponse,
  unauthorizedResponse,
} from "../utils/responseFormatter.js";

/**
 * Authentication Middleware
 * Verifies that the user has a valid access token
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return unauthorizedResponse(
        res,
        "Missing or invalid authorization header",
      );
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return unauthorizedResponse(res, "Invalid or expired access token");
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return unauthorizedResponse(res, "Authentication failed");
  }
};

/**
 * Authorization Middleware
 * Checks if the user has the required role(s)
 * @param {array|string} allowedRoles - Role(s) that are allowed to access the route
 */
export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return unauthorizedResponse(res, "User not authenticated");
    }

    const rolesToCheck = Array.isArray(allowedRoles)
      ? allowedRoles
      : [allowedRoles];

    if (!rolesToCheck.includes(req.user.role)) {
      return forbiddenResponse(
        res,
        "You do not have permission to access this resource",
      );
    }

    next();
  };
};

/**
 * Optional Authentication Middleware
 * Verifies access token if provided, but doesn't fail if missing
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const decoded = verifyAccessToken(token);

      if (decoded) {
        req.user = {
          userId: decoded.userId,
          role: decoded.role,
        };
      }
    }

    next();
  } catch (error) {
    // Continue without user context
    next();
  }
};

/**
 * Admin Only Middleware
 * Shorthand for authorizing only admins
 */
export const adminOnly = authorize("ADMIN");

/**
 * Vendor Only Middleware
 * Shorthand for authorizing only vendors
 */
export const vendorOnly = authorize("VENDOR");

/**
 * Customer Only Middleware
 * Shorthand for authorizing only customers
 */
export const customerOnly = authorize("CUSTOMER");
