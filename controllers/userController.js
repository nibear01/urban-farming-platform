import prisma from "../config/db.js";
import {
  successResponse,
  paginatedResponse,
} from "../utils/responseFormatter.js";
import { ApiError, asyncHandler } from "../utils/errorHandler.js";
import { getPaginationFromQuery } from "../utils/pagination.js";

/**
 * Get all users (Admin only)
 * GET /users
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, status } = req.query;

  // Use best practice pagination helper
  const { page, limit, skip } = getPaginationFromQuery(req.query, 10, 100);

  const whereClause = {};
  if (role) whereClause.role = role;
  if (status) whereClause.status = status;

  const [total, users] = await Promise.all([
    prisma.user.count({ where: whereClause }),
    prisma.user.findMany({
      where: whereClause,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        city: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return paginatedResponse(
    res,
    users,
    total,
    page,
    limit,
    "Users fetched successfully",
  );
});

/**
 * Get user by ID (Admin only)
 * GET /users/:id
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      address: true,
      city: true,
      state: true,
      zipCode: true,
      country: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found", "USER_NOT_FOUND");
  }

  return successResponse(res, 200, "User retrieved successfully", user);
});

/**
 * Update user profile
 * PUT /users/me
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { name, phone, address, city, state, zipCode, country } = req.body;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(address && { address }),
      ...(city && { city }),
      ...(state && { state }),
      ...(zipCode && { zipCode }),
      ...(country && { country }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      address: true,
      city: true,
      state: true,
      zipCode: true,
      country: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return successResponse(res, 200, "Profile updated successfully", updatedUser);
});

/**
 * Update user status (Admin only)
 * PATCH /users/:id/status
 */
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status", "INVALID_STATUS");
  }

  const user = await prisma.user.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });

  return successResponse(res, 200, "User status updated successfully", user);
});

/**
 * Approve vendor (Admin only)
 * PATCH /users/:id/approve-vendor
 */
export const approveVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });

  if (!user) {
    throw new ApiError(404, "User not found", "USER_NOT_FOUND");
  }

  if (user.role !== "VENDOR") {
    throw new ApiError(400, "User is not a vendor", "NOT_A_VENDOR");
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });

  return successResponse(res, 200, "Vendor approved successfully", updatedUser);
});

/**
 * Delete user (Admin only)
 * DELETE /users/:id
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ApiError(404, "User not found", "USER_NOT_FOUND");
  }

  // Delete user and related data (cascade delete is handled by Prisma)
  await prisma.user.delete({ where: { id } });

  return successResponse(res, 200, "User deleted successfully");
});

/**
 * Get user statistics (Admin only)
 * GET /users/stats/overview
 */
export const getUserStatistics = asyncHandler(async (req, res) => {
  const [totalUsers, activeUsers, vendorCount, customerCount, adminCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { role: "VENDOR" } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
    ]);

  const stats = {
    totalUsers,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers,
    byRole: {
      vendors: vendorCount,
      customers: customerCount,
      admins: adminCount,
    },
  };

  return successResponse(
    res,
    200,
    "User statistics retrieved successfully",
    stats,
  );
});

/**
 * Search users (Admin only)
 * GET /users/search
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;

  console.log(req.query);

  if (!q || q.length < 2) {
    throw new ApiError(
      400,
      "Search query must be at least 2 characters",
      "INVALID_SEARCH_QUERY",
    );
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [total, users] = await Promise.all([
    prisma.user.count({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    }),
  ]);

  return paginatedResponse(
    res,
    users,
    total,
    parseInt(page),
    parseInt(limit),
    "Search results",
  );
});
