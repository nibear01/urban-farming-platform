import express from "express";
import {
  createCommunityPost,
  getCommunityPosts,
  getCommunityPostById,
  updateCommunityPost,
  deleteCommunityPost,
  createReply,
  getPostReplies,
  updateReply,
  deleteReply,
  getPostsByCategory,
  getCommunityStats,
} from "../controllers/communityController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../utils/validators.js";
import {
  createCommunityPostValidationSchema,
  createForumReplyValidationSchema,
} from "../utils/validators.js";

const router = express.Router();

// ⚠️ IMPORTANT: Specific routes MUST come BEFORE generic :postId route

// Community Posts - CREATE
/**
 * @route POST /api/community
 * @desc Create new community post
 * @access Private
 */
router.post(
  "/",
  authenticate,
  validate(createCommunityPostValidationSchema, "body"),
  createCommunityPost,
);

// Community Posts - STATIC ROUTES (specific paths before generic :postId)
/**
 * @route GET /api/community/stats/overview
 * @desc Get community statistics
 * @access Public
 */
router.get("/stats/overview", getCommunityStats);

/**
 * @route GET /api/community/category/:category
 * @desc Get posts by category
 * @access Public
 */
router.get("/category/:category", getPostsByCategory);

// Community Replies - STATIC ROUTES (specific paths)
/**
 * @route PUT /api/community/replies/:replyId
 * @desc Update reply
 * @access Private
 */
router.put(
  "/replies/:replyId",
  authenticate,
  validate(createForumReplyValidationSchema, "body"),
  updateReply,
);

/**
 * @route DELETE /api/community/replies/:replyId
 * @desc Delete reply
 * @access Private
 */
router.delete("/replies/:replyId", authenticate, deleteReply);

// Community Posts - NESTED ROUTES (/:postId/replies)
/**
 * @route POST /api/community/:postId/replies
 * @desc Create reply to post
 * @access Private
 */
router.post(
  "/:postId/replies",
  authenticate,
  validate(createForumReplyValidationSchema, "body"),
  createReply,
);

/**
 * @route GET /api/community/:postId/replies
 * @desc Get post replies
 * @access Public
 */
router.get("/:postId/replies", getPostReplies);

// Community Posts - UPDATE & DELETE
/**
 * @route PUT /api/community/:postId
 * @desc Update community post
 * @access Private
 */
router.put(
  "/:postId",
  authenticate,
  validate(createCommunityPostValidationSchema, "body"),
  updateCommunityPost,
);

/**
 * @route DELETE /api/community/:postId
 * @desc Delete community post
 * @access Private
 */
router.delete("/:postId", authenticate, deleteCommunityPost);

// Community Posts - GET ALL (less specific than /stats/overview or /category/:category)
/**
 * @route GET /api/community
 * @desc Get all community posts
 * @access Public
 */
router.get("/", getCommunityPosts);

// Community Posts - GET BY ID (MOST generic, must be LAST)
/**
 * @route GET /api/community/:postId
 * @desc Get community post by ID
 * @access Public
 */
router.get("/:postId", getCommunityPostById);

export default router;
