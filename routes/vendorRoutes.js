import express from "express";
import {
  createVendorProfile,
  getVendorProfile,
  getMyVendorProfile,
  updateVendorProfile,
  getAllVendors,
  createRentalSpace,
  getRentalSpaces,
  updateRentalSpace,
  deleteRentalSpace,
} from "../controllers/vendorController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../utils/validators.js";
import {
  createVendorValidationSchema,
  updateVendorValidationSchema,
  createRentalSpaceValidationSchema,
  updateRentalSpaceValidationSchema,
} from "../utils/validators.js";

const router = express.Router();

// ⚠️ IMPORTANT: Specific routes MUST come BEFORE generic :vendorId route

// Vendor Profiles - CREATE
/**
 * @route POST /api/vendors
 * @desc Create vendor profile
 * @access Private/Not Vendor
 */
router.post(
  "/",
  authenticate,
  validate(createVendorValidationSchema, "body"),
  createVendorProfile,
);

// Vendor Profiles - MY PROFILE (specific: /me)
/**
 * @route GET /api/vendors/me
 * @desc Get my vendor profile
 * @access Private/Vendor
 */
router.get("/me", authenticate, authorize("VENDOR"), getMyVendorProfile);

/**
 * @route PUT /api/vendors/me
 * @desc Update my vendor profile
 * @access Private/Vendor
 */
router.put(
  "/me",
  authenticate,
  authorize("VENDOR"),
  validate(updateVendorValidationSchema, "body"),
  updateVendorProfile,
);

// Rental Space Routes - SPECIFIC ROUTES (before generic :vendorId)
/**
 * @route GET /api/vendors/rental-spaces
 * @desc Get rental spaces with filters
 * @access Public
 */
router.get("/rental-spaces", getRentalSpaces);

/**
 * @route POST /api/vendors/rental-spaces
 * @desc Create rental space
 * @access Private/Vendor
 */
router.post(
  "/rental-spaces",
  authenticate,
  authorize("VENDOR"),
  validate(createRentalSpaceValidationSchema, "body"),
  createRentalSpace,
);

/**
 * @route PUT /api/vendors/rental-spaces/:spaceId
 * @desc Update rental space
 * @access Private/Vendor
 */
router.put(
  "/rental-spaces/:spaceId",
  authenticate,
  authorize("VENDOR"),
  validate(updateRentalSpaceValidationSchema, "body"),
  updateRentalSpace,
);

/**
 * @route DELETE /api/vendors/rental-spaces/:spaceId
 * @desc Delete rental space
 * @access Private/Vendor
 */
router.delete(
  "/rental-spaces/:spaceId",
  authenticate,
  authorize("VENDOR"),
  deleteRentalSpace,
);

// Vendor Profiles - GET ALL (less specific than /me or /rental-spaces)
/**
 * @route GET /api/vendors
 * @desc Get all vendors
 * @access Public
 */
router.get("/", getAllVendors);

// Vendor Profiles - GET BY ID (MOST generic, must be LAST)
/**
 * @route GET /api/vendors/:vendorId
 * @desc Get vendor profile by ID
 * @access Public
 */
router.get("/:vendorId", getVendorProfile);

export default router;
