import { errorResponse, internalErrorResponse } from "./responseFormatter.js";

/**
 * Custom API Error Class
 */
export class ApiError extends Error {
  constructor(statusCode, message, errorCode = null, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors and pass them to error handler middleware
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global Error Handling Middleware
 * Should be placed at the end of all route handlers
 */
export const errorHandlerMiddleware = (err, req, res, next) => {
  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", err);
  }

  // Handle Prisma validation errors
  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] || "field";
    return errorResponse(
      res,
      409,
      `${field} already exists`,
      [`Duplicate ${field}`],
      "UNIQUE_CONSTRAINT_VIOLATION",
    );
  }

  // Handle Prisma not found errors
  if (err.code === "P2025") {
    return errorResponse(res, 404, "Resource not found", null, "NOT_FOUND");
  }

  // Handle Prisma relation errors
  if (err.code === "P2014") {
    return errorResponse(
      res,
      400,
      "Invalid relationship",
      [err.message],
      "INVALID_RELATION",
    );
  }

  // Handle custom API errors
  if (err instanceof ApiError) {
    return errorResponse(
      res,
      err.statusCode,
      err.message,
      err.errors,
      err.errorCode,
    );
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return errorResponse(res, 401, "Invalid token", null, "INVALID_TOKEN");
  }

  if (err.name === "TokenExpiredError") {
    return errorResponse(res, 401, "Token expired", null, "TOKEN_EXPIRED");
  }

  // Handle validation errors from Joi
  if (err.details && Array.isArray(err.details)) {
    const validationErrors = err.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));
    return errorResponse(
      res,
      400,
      "Validation error",
      validationErrors,
      "VALIDATION_ERROR",
    );
  }

  // Default error handler
  return internalErrorResponse(
    res,
    err.message || "Internal Server Error",
    err,
  );
};

/**
 * Not Found Handler
 * Used for undefined routes
 */
export const notFoundHandler = (req, res) => {
  return errorResponse(
    res,
    404,
    "This route does not exist",
    null,
    "ROUTE_NOT_FOUND",
  );
};
