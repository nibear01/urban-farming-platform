import express from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  changePassword,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../utils/validators.js";
import {
  registerValidationSchema,
  loginValidationSchema,
  refreshTokenValidationSchema,
  changePasswordValidationSchema,
} from "../utils/validators.js";

const router = express.Router();

/**
 * @route POST /auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  "/register",
  authLimiter,
  validate(registerValidationSchema, "body"),
  register,
);

/**
 * @route POST /auth/login
 * @desc Login user and get tokens
 * @access Public
 */
router.post(
  "/login",
  authLimiter,
  validate(loginValidationSchema, "body"),
  login,
);

/**
 * @route POST /auth/refresh-token
 * @desc Refresh access token using refresh token
 * @access Public
 */
router.post(
  "/refresh-token",
  validate(refreshTokenValidationSchema, "body"),
  refreshToken,
);

/**
 * @route POST /auth/logout
 * @desc Logout user
 * @access Private
 */
router.post("/logout", authenticate, logout);

/**
 * @route GET /auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get("/me", authenticate, getCurrentUser);

/**
 * @route POST /auth/change-password
 * @desc Change user password
 * @access Private
 */
router.post(
  "/change-password",
  authenticate,
  validate(changePasswordValidationSchema, "body"),
  changePassword,
);

export default router;
