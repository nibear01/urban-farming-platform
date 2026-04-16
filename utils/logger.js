/**
 * Logging Utilities
 * Provides consistent structured logging across the application
 */

const LOG_LEVELS = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
};

/**
 * Format log message with metadata
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {object} meta - Additional metadata
 * @returns {string} - Formatted log message
 */
const formatLogMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const correlationId = meta.correlationId || "N/A";
  const userId = meta.userId || "N/A";
  const endpoint = meta.endpoint || "N/A";
  const method = meta.method || "N/A";

  const logObject = {
    timestamp,
    level,
    correlationId,
    userId,
    endpoint,
    method,
    message,
    ...meta,
  };

  return JSON.stringify(logObject);
};

/**
 * Log error
 * @param {string} message - Error message
 * @param {object} meta - Additional metadata (err object, req, etc.)
 */
export const logError = (message, meta = {}) => {
  const logMessage = formatLogMessage(LOG_LEVELS.ERROR, message, meta);
  console.error(logMessage);
};

/**
 * Log warning
 * @param {string} message - Warning message
 * @param {object} meta - Additional metadata
 */
export const logWarn = (message, meta = {}) => {
  const logMessage = formatLogMessage(LOG_LEVELS.WARN, message, meta);
  console.warn(logMessage);
};

/**
 * Log info
 * @param {string} message - Info message
 * @param {object} meta - Additional metadata
 */
export const logInfo = (message, meta = {}) => {
  const logMessage = formatLogMessage(LOG_LEVELS.INFO, message, meta);
  console.log(logMessage);
};

/**
 * Log debug (only in development)
 * @param {string} message - Debug message
 * @param {object} meta - Additional metadata
 */
export const logDebug = (message, meta = {}) => {
  if (process.env.NODE_ENV === "development") {
    const logMessage = formatLogMessage(LOG_LEVELS.DEBUG, message, meta);
    console.log(logMessage);
  }
};

/**
 * Extract request metadata for logging
 * @param {object} req - Express request
 * @returns {object} - Request metadata
 */
export const extractRequestMetadata = (req) => {
  return {
    correlationId: req.correlationId || "N/A",
    userId: req.user?.userId || "anonymous",
    method: req.method,
    endpoint: req.path,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get("user-agent"),
  };
};

/**
 * Logging middleware for request/response tracking
 */
export const loggingMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const metadata = extractRequestMetadata(req);

  // Log incoming request
  if (process.env.NODE_ENV === "development") {
    logDebug(`Incoming ${req.method} ${req.path}`, metadata);
  }

  // Track response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const logMetadata = {
      ...metadata,
      statusCode,
      duration: `${duration}ms`,
    };

    // Log based on status code
    if (statusCode >= 500) {
      logError(`${req.method} ${req.path} - ${statusCode}`, logMetadata);
    } else if (statusCode >= 400) {
      logWarn(`${req.method} ${req.path} - ${statusCode}`, logMetadata);
    } else if (process.env.NODE_ENV === "development") {
      logDebug(`${req.method} ${req.path} - ${statusCode}`, logMetadata);
    }

    res.send = originalSend;
    return res.send(data);
  };

  next();
};

export default {
  logError,
  logWarn,
  logInfo,
  logDebug,
  extractRequestMetadata,
  loggingMiddleware,
};
