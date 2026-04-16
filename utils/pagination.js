/**
 * Pagination Utilities
 * Provides safe and normalized pagination parameters
 */

/**
 * Validate and normalize pagination parameters
 * @param {number} page - Current page (default 1)
 * @param {number} limit - Items per page (default 10)
 * @param {number} maxLimit - Maximum items allowed per page (default 100)
 * @param {number} minLimit - Minimum items per page (default 1)
 * @returns {object} - Normalized pagination params {page, limit, skip}
 */
export const normalizePaginationParams = (
  page = 1,
  limit = 10,
  maxLimit = 100,
  minLimit = 1,
) => {
  // Convert to integers and validate
  let validPage = parseInt(page);
  let validLimit = parseInt(limit);

  // Set defaults if invalid
  validPage = isNaN(validPage) || validPage < 1 ? 1 : validPage;
  validLimit =
    isNaN(validLimit) || validLimit < minLimit ? minLimit : validLimit;

  // Enforce maximum limit
  if (validLimit > maxLimit) {
    validLimit = maxLimit;
  }

  const skip = (validPage - 1) * validLimit;

  return {
    page: validPage,
    limit: validLimit,
    skip,
  };
};

/**
 * Calculate pagination metadata
 * @param {number} total - Total count of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} - Pagination metadata
 */
export const calculatePaginationMetadata = (total, page, limit) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
  };
};

/**
 * Get safe pagination params from request query
 * @param {object} reqQuery - Express request.query object
 * @param {number} defaultLimit - Default items per page
 * @param {number} maxLimit - Maximum items allowed per page
 * @returns {object} - Normalized pagination params
 */
export const getPaginationFromQuery = (
  reqQuery,
  defaultLimit = 10,
  maxLimit = 100,
) => {
  const { page = 1, limit = defaultLimit } = reqQuery;
  return normalizePaginationParams(page, limit, maxLimit);
};

/**
 * Validate sort parameters
 * @param {string} sortBy - Field to sort by
 * @param {array} allowedFields - List of allowed fields
 * @param {string} defaultSort - Default sort field
 * @returns {string} - Validated sort field or default
 */
export const validateSortField = (
  sortBy,
  allowedFields,
  defaultSort = "createdAt",
) => {
  if (!sortBy || !allowedFields.includes(sortBy)) {
    return defaultSort;
  }
  return sortBy;
};

/**
 * Validate sort order
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {string} - 'asc' or 'desc'
 */
export const validateSortOrder = (order) => {
  const normalizedOrder = String(order).toLowerCase();
  return normalizedOrder === "desc" ? "desc" : "asc";
};
