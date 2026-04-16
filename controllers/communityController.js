import prisma from "../config/db.js";
import {
  successResponse,
  paginatedResponse,
} from "../utils/responseFormatter.js";
import { ApiError, asyncHandler } from "../utils/errorHandler.js";
import { getPaginationFromQuery } from "../utils/pagination.js";

/**
 * Create community post
 * POST /community
 */
export const createCommunityPost = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { title, content, category } = req.body;

  const post = await prisma.communityPost.create({
    data: {
      userId,
      title,
      content,
      category: category || "general",
    },
    include: {
      user: {
        select: {
          name: true,
          role: true,
        },
      },
    },
  });

  return successResponse(res, 201, "Post created successfully", post);
});

/**
 * Get all community posts with pagination
 * GET /community
 */
export const getCommunityPosts = asyncHandler(async (req, res) => {
  const { category, search } = req.query;

  // Use best practice pagination helper
  const { page, limit, skip } = getPaginationFromQuery(req.query, 10, 100);

  const whereClause = {};
  if (category) whereClause.category = category;
  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  const [total, posts] = await Promise.all([
    prisma.communityPost.count({ where: whereClause }),
    prisma.communityPost.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        replies: {
          select: {
            id: true,
            content: true,
            user: {
              select: {
                name: true,
                role: true,
              },
            },
            createdAt: true,
          },
          take: 3,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Add reply count to each post
  const postsWithCount = posts.map((post) => ({
    ...post,
    replyCount: post.replies.length,
  }));

  return paginatedResponse(
    res,
    postsWithCount,
    total,
    page,
    limit,
    "Posts fetched successfully",
  );
});

/**
 * Get post by ID with all replies
 * GET /community/:postId
 */
export const getCommunityPostById = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      replies: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!post) {
    throw new ApiError(404, "Post not found", "POST_NOT_FOUND");
  }

  return successResponse(res, 200, "Post retrieved successfully", post);
});

/**
 * Update community post
 * PUT /community/:postId
 */
export const updateCommunityPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.userId;
  const { title, content, category } = req.body;

  // Verify ownership
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new ApiError(404, "Post not found", "POST_NOT_FOUND");
  }

  if (post.userId !== userId) {
    throw new ApiError(
      403,
      "You do not have permission to update this post",
      "UNAUTHORIZED",
    );
  }

  const updated = await prisma.communityPost.update({
    where: { id: postId },
    data: {
      ...(title && { title }),
      ...(content && { content }),
      ...(category && { category }),
    },
    include: {
      user: {
        select: {
          name: true,
          role: true,
        },
      },
    },
  });

  return successResponse(res, 200, "Post updated successfully", updated);
});

/**
 * Delete community post
 * DELETE /community/:postId
 */
export const deleteCommunityPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.userId;

  // Verify ownership
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new ApiError(404, "Post not found", "POST_NOT_FOUND");
  }

  if (post.userId !== userId) {
    throw new ApiError(
      403,
      "You do not have permission to delete this post",
      "UNAUTHORIZED",
    );
  }

  await prisma.communityPost.delete({ where: { id: postId } });

  return successResponse(res, 200, "Post deleted successfully");
});

/**
 * Create reply to post
 * POST /community/:postId/replies
 */
export const createReply = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.userId;
  const { content } = req.body;

  // Check if post exists
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new ApiError(404, "Post not found", "POST_NOT_FOUND");
  }

  const reply = await prisma.forumPost.create({
    data: {
      postId,
      userId,
      content,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  return successResponse(res, 201, "Reply created successfully", reply);
});

/**
 * Get post replies
 * GET /community/:postId/replies
 */
export const getPostReplies = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Check if post exists
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new ApiError(404, "Post not found", "POST_NOT_FOUND");
  }

  const [total, replies] = await Promise.all([
    prisma.forumPost.count({ where: { postId } }),
    prisma.forumPost.findMany({
      where: { postId },
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return paginatedResponse(
    res,
    replies,
    total,
    parseInt(page),
    parseInt(limit),
    "Replies fetched",
  );
});

/**
 * Update reply
 * PUT /community/replies/:replyId
 */
export const updateReply = asyncHandler(async (req, res) => {
  const { replyId } = req.params;
  const userId = req.user.userId;
  const { content } = req.body;

  // Verify ownership
  const reply = await prisma.forumPost.findUnique({
    where: { id: replyId },
  });

  if (!reply) {
    throw new ApiError(404, "Reply not found", "REPLY_NOT_FOUND");
  }

  if (reply.userId !== userId) {
    throw new ApiError(
      403,
      "You do not have permission to update this reply",
      "UNAUTHORIZED",
    );
  }

  const updated = await prisma.forumPost.update({
    where: { id: replyId },
    data: { content },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  return successResponse(res, 200, "Reply updated successfully", updated);
});

/**
 * Delete reply
 * DELETE /community/replies/:replyId
 */
export const deleteReply = asyncHandler(async (req, res) => {
  const { replyId } = req.params;
  const userId = req.user.userId;

  // Verify ownership
  const reply = await prisma.forumPost.findUnique({
    where: { id: replyId },
  });

  if (!reply) {
    throw new ApiError(404, "Reply not found", "REPLY_NOT_FOUND");
  }

  if (reply.userId !== userId) {
    throw new ApiError(
      403,
      "You do not have permission to delete this reply",
      "UNAUTHORIZED",
    );
  }

  await prisma.forumPost.delete({ where: { id: replyId } });

  return successResponse(res, 200, "Reply deleted successfully");
});

/**
 * Get posts by category
 * GET /community/category/:category
 */
export const getPostsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [total, posts] = await Promise.all([
    prisma.communityPost.count({ where: { category } }),
    prisma.communityPost.findMany({
      where: { category },
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        user: {
          select: {
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return paginatedResponse(
    res,
    posts,
    total,
    parseInt(page),
    parseInt(limit),
    `Posts in ${category} category`,
  );
});

/**
 * Get community statistics
 * GET /community/stats/overview
 */
export const getCommunityStats = asyncHandler(async (req, res) => {
  const [totalPosts, totalReplies, totalUsers, categories] = await Promise.all([
    prisma.communityPost.count(),
    prisma.forumPost.count(),
    prisma.communityPost.findMany({
      distinct: ["userId"],
      select: { userId: true },
    }),
    prisma.communityPost.groupBy({
      by: ["category"],
      _count: true,
    }),
  ]);

  const stats = {
    totalPosts,
    totalReplies,
    totalActiveUsers: totalUsers.length,
    postsByCategory: categories.reduce((acc, item) => {
      acc[item.category] = item._count;
      return acc;
    }, {}),
  };

  return successResponse(res, 200, "Community statistics fetched", stats);
});
