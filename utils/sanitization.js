import xss from "xss";

/**
 * Sanitization Utilities
 *
 * IMPORTANT: Sanitization is NOT validation
 * - Validation (via Joi) checks if input is valid
 * - Sanitization only escapes unsafe content for storage/display
 *
 * SQL Injection: Protected by Prisma's parameterized queries
 * XSS Protection: Use these utilities for specific fields when needed
 */

/**
 * Sanitize string against XSS attacks
 * Removes HTML/script tags from strings
 *
 * Use for: user comments, descriptions, content fields
 * Don't use blindly on all input
 *
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeXSS = (str) => {
  if (typeof str !== "string") return str;

  // Escape HTML without removing content
  return xss(str, {
    whiteList: {},
    stripIgnoredTag: true,
    stripLeadingSlash: false,
  });
};

/**
 * Sanitize email address
 * Removes whitespace and converts to lowercase
 *
 * Use for: email fields before database storage
 *
 * @param {string} email - Email to sanitize
 * @returns {string} - Sanitized and normalized email
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== "string") return email;
  return email.toLowerCase().trim();
};

/**
 * Sanitize URL
 * Validates and normalizes URL format
 *
 * Use for: URL fields (links, images, etc)
 *
 * @param {string} url - URL to sanitize
 * @returns {string} - Sanitized URL or original string if invalid
 */
export const sanitizeURL = (url) => {
  if (typeof url !== "string") return url;

  try {
    const parsedURL = new URL(url);
    return parsedURL.href;
  } catch (error) {
    // Return original if not a valid URL
    return url;
  }
};

/**
 * Sanitize plain text (whitespace only)
 * Removes leading/trailing whitespace
 *
 * Use for: names, titles, short text fields
 *
 * @param {string} text - Text to sanitize
 * @returns {string} - Trimmed text
 */
export const sanitizeText = (text) => {
  if (typeof text !== "string") return text;
  return text.trim();
};

/**
 * Sanitize numeric string
 * Removes non-numeric characters
 *
 * Use for: phone numbers, IDs after validation
 *
 * @param {string} str - String to sanitize
 * @returns {string} - Only numeric characters
 */
export const sanitizeNumeric = (str) => {
  if (typeof str !== "string") return str;
  return str.replace(/\D/g, "");
};
