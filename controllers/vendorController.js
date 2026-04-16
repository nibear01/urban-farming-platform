import prisma from "../config/db.js";
import {
  successResponse,
  paginatedResponse,
} from "../utils/responseFormatter.js";
import { ApiError, asyncHandler } from "../utils/errorHandler.js";

/**
 * Create vendor profile
 * POST /vendors
 */
export const createVendorProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { farmName, farmDescription, farmLocation, latitude, longitude } =
    req.body;

  // Check if vendor profile already exists
  const existingProfile = await prisma.vendorProfile.findUnique({
    where: { userId },
  });

  if (existingProfile) {
    throw new ApiError(409, "Vendor profile already exists", "PROFILE_EXISTS");
  }

  // Update user role to VENDOR if not already
  if (req.user.role !== "VENDOR") {
    await prisma.user.update({
      where: { id: userId },
      data: { role: "VENDOR" },
    });
  }

  const vendorProfile = await prisma.vendorProfile.create({
    data: {
      userId,
      farmName,
      farmDescription,
      farmLocation,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      certificationStatus: "PENDING",
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return successResponse(
    res,
    201,
    "Vendor profile created successfully",
    vendorProfile,
  );
});

/**
 * Get vendor profile
 * GET /vendors/:vendorId
 */
export const getVendorProfile = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;

  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: { id: vendorId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
      produces: { take: 5 },
      rentalSpaces: { take: 5 },
      sustainabilityCerts: {
        where: { status: "APPROVED" },
        select: { certifyingAgency: true, certificationDate: true },
      },
    },
  });

  if (!vendorProfile) {
    throw new ApiError(404, "Vendor profile not found", "VENDOR_NOT_FOUND");
  }

  return successResponse(res, 200, "Vendor profile retrieved", vendorProfile);
});

/**
 * Get my vendor profile
 * GET /vendors/me
 */
export const getMyVendorProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!vendorProfile) {
    throw new ApiError(404, "Vendor profile not found", "VENDOR_NOT_FOUND");
  }

  return successResponse(res, 200, "Vendor profile retrieved", vendorProfile);
});

/**
 * Update vendor profile
 * PUT /vendors/me
 */
export const updateVendorProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { farmName, farmDescription, farmLocation, latitude, longitude } =
    req.body;

  const vendorProfile = await prisma.vendorProfile.update({
    where: { userId },
    data: {
      ...(farmName && { farmName }),
      ...(farmDescription && { farmDescription }),
      ...(farmLocation && { farmLocation }),
      ...(latitude && { latitude: parseFloat(latitude) }),
      ...(longitude && { longitude: parseFloat(longitude) }),
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return successResponse(res, 200, "Vendor profile updated", vendorProfile);
});

/**
 * Get all vendors with pagination
 * GET /vendors
 */
export const getAllVendors = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    certification = "APPROVED",
    location,
  } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const whereClause = {};
  if (certification) whereClause.certificationStatus = certification;
  if (location)
    whereClause.farmLocation = { contains: location, mode: "insensitive" };

  const [total, vendors] = await Promise.all([
    prisma.vendorProfile.count({ where: whereClause }),
    prisma.vendorProfile.findMany({
      where: whereClause,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        sustainabilityCerts: {
          where: { status: "APPROVED" },
          select: { certifyingAgency: true, certificationDate: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return paginatedResponse(
    res,
    vendors,
    total,
    parseInt(page),
    parseInt(limit),
    "Vendors fetched successfully",
  );
});

/**
 * Create rental space
 * POST /vendors/rental-spaces
 */
export const createRentalSpace = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { location, size, price, description, latitude, longitude } = req.body;

  // Get vendor profile
  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: { userId },
  });

  if (!vendorProfile) {
    throw new ApiError(404, "Vendor profile not found", "VENDOR_NOT_FOUND");
  }

  const rentalSpace = await prisma.rentalSpace.create({
    data: {
      vendorId: vendorProfile.id,
      location,
      size: parseFloat(size),
      price: parseFloat(price),
      description,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      availability: "AVAILABLE",
    },
  });

  return successResponse(
    res,
    201,
    "Rental space created successfully",
    rentalSpace,
  );
});

/**
 * Get rental spaces
 * GET /vendors/rental-spaces
 */
export const getRentalSpaces = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, vendorId, availability } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const whereClause = {};
  if (vendorId) whereClause.vendorId = vendorId;
  if (availability) whereClause.availability = availability;

  const [total, spaces] = await Promise.all([
    prisma.rentalSpace.count({ where: whereClause }),
    prisma.rentalSpace.findMany({
      where: whereClause,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        vendor: {
          select: {
            farmName: true,
            farmLocation: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return paginatedResponse(
    res,
    spaces,
    total,
    parseInt(page),
    parseInt(limit),
    "Rental spaces fetched",
  );
});

/**
 * Update rental space
 * PUT /vendors/rental-spaces/:spaceId
 */
export const updateRentalSpace = asyncHandler(async (req, res) => {
  const { spaceId } = req.params;
  const userId = req.user.userId;
  const { location, size, price, description, availability } = req.body;

  // Verify ownership
  const space = await prisma.rentalSpace.findUnique({
    where: { id: spaceId },
    include: { vendor: true },
  });

  if (!space) {
    throw new ApiError(404, "Rental space not found", "SPACE_NOT_FOUND");
  }

  if (space.vendor.userId !== userId) {
    throw new ApiError(
      403,
      "You do not have permission to update this space",
      "UNAUTHORIZED",
    );
  }

  const updated = await prisma.rentalSpace.update({
    where: { id: spaceId },
    data: {
      ...(location && { location }),
      ...(size && { size: parseFloat(size) }),
      ...(price && { price: parseFloat(price) }),
      ...(description && { description }),
      ...(availability && { availability }),
    },
  });

  return successResponse(res, 200, "Rental space updated", updated);
});

/**
 * Delete rental space
 * DELETE /vendors/rental-spaces/:spaceId
 */
export const deleteRentalSpace = asyncHandler(async (req, res) => {
  const { spaceId } = req.params;
  const userId = req.user.userId;

  // Verify ownership
  const space = await prisma.rentalSpace.findUnique({
    where: { id: spaceId },
    include: { vendor: true },
  });

  if (!space) {
    throw new ApiError(404, "Rental space not found", "SPACE_NOT_FOUND");
  }

  if (space.vendor.userId !== userId) {
    throw new ApiError(
      403,
      "You do not have permission to delete this space",
      "UNAUTHORIZED",
    );
  }

  await prisma.rentalSpace.delete({ where: { id: spaceId } });

  return successResponse(res, 200, "Rental space deleted successfully");
});
