import jwt from "jsonwebtoken";
import config from "../config/config.js";

/**
 * Generate Access Token
 * @param {string} userId - User ID
 * @param {string} role - User role (ADMIN, VENDOR, CUSTOMER)
 * @returns {string} - JWT access token
 */
export const generateAccessToken = (userId, role) => {
  return jwt.sign({ userId, role }, config.jwt.accessTokenSecret, {
    expiresIn: config.jwt.accessTokenExpiry,
  });
};

/**
 * Generate Refresh Token
 * @param {string} userId - User ID
 * @returns {string} - JWT refresh token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, config.jwt.refreshTokenSecret, {
    expiresIn: config.jwt.refreshTokenExpiry,
  });
};

/**
 * Generate Both Access and Refresh Tokens
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {object} - Object containing both tokens
 */
export const generateTokens = (userId, role) => {
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId);

  return {
    accessToken,
    refreshToken,
  };
};

/**
 * Verify Access Token
 * @param {string} token - JWT access token
 * @returns {object|null} - Decoded token or null if invalid
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.accessTokenSecret);
  } catch (error) {
    return null;
  }
};

/**
 * Verify Refresh Token
 * @param {string} token - JWT refresh token
 * @returns {object|null} - Decoded token or null if invalid
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshTokenSecret);
  } catch (error) {
    return null;
  }
};

/**
 * Decode Token Without Verification (for utility purposes)
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded token or null if invalid
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};
