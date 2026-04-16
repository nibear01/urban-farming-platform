import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import { generateTokens, verifyRefreshToken } from "../utils/jwtUtils.js";
import { successResponse, errorResponse } from "../utils/responseFormatter.js";
import { ApiError, asyncHandler } from "../utils/errorHandler.js";

/**
 * Register a new user
 * POST /auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError(409, "Email already registered", "EMAIL_ALREADY_EXISTS");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || "CUSTOMER",
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  // Generate tokens
  const tokens = generateTokens(user.id, user.role);

  // Save refresh token to database
  const resetTime = new Date();
  resetTime.setDate(resetTime.getDate() + 7); // 7 days expiry

  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: resetTime,
    },
  });

  return successResponse(res, 201, "User registered successfully", {
    user,
    tokens,
  });
});

/**
 * Login user
 * POST /auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  // Check if user account is active
  if (user.status !== "ACTIVE") {
    throw new ApiError(403, "Account is not active", "ACCOUNT_INACTIVE");
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  // Generate tokens
  const tokens = generateTokens(user.id, user.role);

  // Save refresh token to database
  const resetTime = new Date();
  resetTime.setDate(resetTime.getDate() + 7); // 7 days expiry

  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: resetTime,
    },
  });

  return successResponse(res, 200, "Login successful", {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    tokens,
  });
});

/**
 * Refresh Access Token
 * POST /auth/refresh-token
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new ApiError(
      401,
      "Refresh token is required",
      "REFRESH_TOKEN_REQUIRED",
    );
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(token);
  if (!decoded) {
    throw new ApiError(
      401,
      "Invalid or expired refresh token",
      "INVALID_REFRESH_TOKEN",
    );
  }

  // Check if refresh token exists in database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new ApiError(
      401,
      "Refresh token not found or expired",
      "REFRESH_TOKEN_NOT_FOUND",
    );
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user || user.status !== "ACTIVE") {
    throw new ApiError(
      403,
      "User not found or account is inactive",
      "USER_INACTIVE",
    );
  }

  // Generate new tokens
  const newTokens = generateTokens(user.id, user.role);

  // Delete old refresh token
  await prisma.refreshToken.delete({
    where: { token },
  });

  // Save new refresh token
  const resetTime = new Date();
  resetTime.setDate(resetTime.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token: newTokens.refreshToken,
      userId: user.id,
      expiresAt: resetTime,
    },
  });

  return successResponse(res, 200, "Token refreshed successfully", {
    tokens: newTokens,
  });
});

/**
 * Logout user
 * POST /auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (token) {
    await prisma.refreshToken.deleteMany({
      where: {
        token,
      },
    });
  }

  return successResponse(res, 200, "Logout successful");
});

/**
 * Get current user profile
 * GET /auth/me
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      profileImage: true,
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

  return successResponse(res, 200, "User fetched successfully", user);
});

/**
 * Change password
 * POST /auth/change-password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId;

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found", "USER_NOT_FOUND");
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new ApiError(
      401,
      "Current password is incorrect",
      "INVALID_PASSWORD",
    );
  }

  // Check if new password is different from current
  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    throw new ApiError(
      400,
      "New password must be different from current password",
      "SAME_PASSWORD",
    );
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  // Invalidate all existing refresh tokens
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });

  return successResponse(
    res,
    200,
    "Password changed successfully. Please login again.",
  );
});
