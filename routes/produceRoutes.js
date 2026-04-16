import express from "express";
import {
  createProduce,
  getAllProduce,
  getProduceById,
  updateProduce,
  deleteProduce,
  getVendorProduce,
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getMarketplaceStats,
} from "../controllers/produceController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../utils/validators.js";
import {
  createProduceValidationSchema,
  updateProduceValidationSchema,
  createOrderValidationSchema,
  updateOrderStatusValidationSchema,
} from "../utils/validators.js";
import { createProductLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// ⚠️ IMPORTANT: Order matters! More specific routes MUST come BEFORE generic :id routes

// Products/Produce Routes - CREATE
/**
 * @route POST /api/produce
 * @desc Create new produce/product
 * @access Private/Vendor
 */
router.post(
  "/",
  authenticate,
  authorize("VENDOR"),
  createProductLimiter,
  validate(createProduceValidationSchema, "body"),
  createProduce,
);

// Products/Produce Routes - Specific static routes BEFORE generic :id routes
/**
 * @route GET /api/produce/vendor/:vendorId
 * @desc Get vendor's products
 * @access Public
 */
router.get("/vendor/:vendorId", getVendorProduce);

// Orders Routes - STATS
/**
 * @route GET /api/produce/stats/marketplace
 * @desc Get marketplace statistics
 * @access Public (changed from Admin to Public)
 */
router.get("/stats/marketplace", getMarketplaceStats);

// Orders Routes - CREATE
/**
 * @route POST /api/produce/orders
 * @desc Create new order
 * @access Private
 */
router.post(
  "/orders",
  authenticate,
  validate(createOrderValidationSchema, "body"),
  createOrder,
);

// Orders Routes - GET LIST & SPECIFIC
/**
 * @route GET /api/produce/orders
 * @desc Get orders (filtered by user role)
 * @access Private
 */
router.get("/orders", authenticate, getOrders);

/**
 * @route PATCH /api/produce/orders/:orderId/status
 * @desc Update order status
 * @access Private/Vendor/Admin
 */
router.patch(
  "/orders/:orderId/status",
  authenticate,
  validate(updateOrderStatusValidationSchema, "body"),
  updateOrderStatus,
);

/**
 * @route GET /api/produce/orders/:orderId
 * @desc Get order by ID
 * @access Private
 */
router.get("/orders/:orderId", authenticate, getOrderById);

// Products/Produce Routes - UPDATE & DELETE (specific operations before generic gets)
/**
 * @route PUT /api/produce/:produceId
 * @desc Update product
 * @access Private/Vendor
 */
router.put(
  "/:produceId",
  authenticate,
  authorize("VENDOR"),
  validate(updateProduceValidationSchema, "body"),
  updateProduce,
);

/**
 * @route DELETE /api/produce/:produceId
 * @desc Delete product
 * @access Private/Vendor
 */
router.delete("/:produceId", authenticate, authorize("VENDOR"), deleteProduce);

// Products/Produce Routes - GET ALL (least specific, must be AFTER /vendor/:vendorId)
/**
 * @route GET /api/produce
 * @desc Get all products with filters
 * @access Public
 */
router.get("/", getAllProduce);

// Products/Produce Routes - GET BY ID (MOST generic, must be LAST)
/**
 * @route GET /api/produce/:produceId
 * @desc Get product by ID
 * @access Public
 */
router.get("/:produceId", getProduceById);

export default router;
