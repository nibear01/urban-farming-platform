import express from "express";
import {
  getAllUsers,
  getUserById,
  updateProfile,
  updateUserStatus,
  approveVendor,
  deleteUser,
  getUserStatistics,
  searchUsers,
} from "../controllers/userController.js";
import { authenticate, authorize, adminOnly } from "../middleware/auth.js";
import { validate } from "../utils/validators.js";
import { updateProfileValidationSchema } from "../utils/validators.js";

const router = express.Router();

// ⚠️ IMPORTANT: Specific routes MUST come BEFORE generic :id route

// Users - STATIC ROUTES (specific paths)
/**
 * @route GET /api/users/search
 * @desc Search users
 * @access Private/Admin
 */
router.get("/search", authenticate, adminOnly, searchUsers);

/**
 * @route GET /api/users/stats/overview
 * @desc Get user statistics
 * @access Private/Admin
 */
router.get("/stats/overview", authenticate, adminOnly, getUserStatistics);

// Users - MY PROFILE (specific: /me)
/**
 * @route PUT /api/users/me
 * @desc Update own user profile
 * @access Private
 */
router.put(
  "/me",
  authenticate,
  validate(updateProfileValidationSchema, "body"),
  updateProfile,
);

// Users - DYNAMIC ROUTES (by ID) - AFTER specific routes
/**
 * @route PATCH /api/users/:id/status
 * @desc Update user status (Admin only)
 * @access Private/Admin
 */
router.patch("/:id/status", authenticate, adminOnly, updateUserStatus);

/**
 * @route PATCH /api/users/:id/approve-vendor
 * @desc Approve vendor (Admin only)
 * @access Private/Admin
 */
router.patch("/:id/approve-vendor", authenticate, adminOnly, approveVendor);

/**
 * @route DELETE /api/users/:id
 * @desc Delete user (Admin only)
 * @access Private/Admin
 */
router.delete("/:id", authenticate, adminOnly, deleteUser);

// Users - GET ALL (less specific than /search or /me)
/**
 * @route GET /api/users
 * @desc Get all users (Admin only)
 * @access Private/Admin
 */
router.get("/", authenticate, adminOnly, getAllUsers);

// Users - GET BY ID (MOST generic, must be LAST)
/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private/Admin
 */
router.get("/:id", authenticate, adminOnly, getUserById);

export default router;
