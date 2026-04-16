/**
 * Standard API Response Formatter
 * Provides consistent response structure across all API endpoints
 */

/**
 * Success Response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Response message
 * @param {object|array} data - Response data
 * @param {object} meta - Optional metadata (pagination, etc.)
 */
export const successResponse = (
  res,
  statusCode,
  message,
  data = null,
  meta = null,
) => {
  const response = {
    success: true,
    statusCode,
    message,
    timestamp: new Date().toISOString(),
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Error Response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {array|string} errors - Error details
 * @param {string} errorCode - Optional error code
 */
export const errorResponse = (
  res,
  statusCode,
  message,
  errors = null,
  errorCode = null,
) => {
  const response = {
    success: false,
    statusCode,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    response.errors = Array.isArray(errors) ? errors : [errors];
  }

  if (errorCode) {
    response.errorCode = errorCode;
  }

  return res.status(statusCode).json(response);
};

/**
 * Paginated Response
 * @param {object} res - Express response object
 * @param {array} data - Response data array
 * @param {number} total - Total count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {string} message - Success message
 */
export const paginatedResponse = (
  res,
  data,
  total,
  page,
  limit,
  message = "Success",
) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return successResponse(res, 200, message, data, {
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  });
};

/**
 * Custom error response for validation
 */
export const validationErrorResponse = (res, errors) => {
  return errorResponse(
    res,
    400,
    "Validation Error",
    errors,
    "VALIDATION_ERROR",
  );
};

/**
 * Unauthorized response
 */
export const unauthorizedResponse = (res, message = "Unauthorized") => {
  return errorResponse(res, 401, message, null, "UNAUTHORIZED");
};

/**
 * Forbidden response
 */
export const forbiddenResponse = (res, message = "Forbidden") => {
  return errorResponse(res, 403, message, null, "FORBIDDEN");
};

/**
 * Not found response
 */
export const notFoundResponse = (res, message = "Resource not found") => {
  return errorResponse(res, 404, message, null, "NOT_FOUND");
};

/**
 * Internal server error response
 */
export const internalErrorResponse = (
  res,
  message = "Internal Server Error",
  error = null,
) => {
  const errors = error ? [error.message] : null;
  return errorResponse(res, 500, message, errors, "INTERNAL_ERROR");
};
