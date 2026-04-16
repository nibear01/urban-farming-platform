import prisma from "../config/db.js";
import {
  successResponse,
  paginatedResponse,
} from "../utils/responseFormatter.js";
import { ApiError, asyncHandler } from "../utils/errorHandler.js";
import { getPaginationFromQuery } from "../utils/pagination.js";

/**
 * Create produce/product
 * POST /produce
 */
export const createProduce = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { name, description, price, category, availableQuantity, unit } =
    req.body;

  // Get vendor profile
  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: { userId },
  });

  if (!vendorProfile) {
    throw new ApiError(404, "Vendor profile not found", "VENDOR_NOT_FOUND");
  }

  const produce = await prisma.produce.create({
    data: {
      vendorId: vendorProfile.id,
      name,
      description,
      price: parseFloat(price),
      category,
      availableQuantity: parseInt(availableQuantity),
      unit,
      certificationStatus: "PENDING",
    },
    include: {
      vendor: {
        select: {
          farmName: true,
          certificationStatus: true,
        },
      },
    },
  });

  return successResponse(res, 201, "Product created successfully", produce);
});

/**
 * Get all produce with filters and pagination
 * GET /produce
 */
export const getAllProduce = asyncHandler(async (req, res) => {
  const { category, vendor, minPrice, maxPrice, certification } = req.query;

  // Use best practice pagination helper
  const { page, limit, skip } = getPaginationFromQuery(req.query, 10, 100);

  const whereClause = {
    AND: [
      certification ? { certificationStatus: certification } : {},
      minPrice || maxPrice
        ? {
            price: {
              ...(minPrice && { gte: parseFloat(minPrice) }),
              ...(maxPrice && { lte: parseFloat(maxPrice) }),
            },
          }
        : {},
      category ? { category } : {},
      vendor
        ? { vendor: { farmName: { contains: vendor, mode: "insensitive" } } }
        : {},
    ].filter((condition) => Object.keys(condition).length > 0),
  };

  const [total, produces] = await Promise.all([
    prisma.produce.count({ where: whereClause }),
    prisma.produce.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        vendor: {
          select: {
            id: true,
            farmName: true,
            farmLocation: true,
            certificationStatus: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return paginatedResponse(
    res,
    produces,
    total,
    page,
    limit,
    "Products fetched successfully",
  );
});

/**
 * Get produce by ID
 * GET /produce/:produceId
 */
export const getProduceById = asyncHandler(async (req, res) => {
  const { produceId } = req.params;

  const produce = await prisma.produce.findUnique({
    where: { id: produceId },
    include: {
      vendor: {
        select: {
          id: true,
          farmName: true,
          farmLocation: true,
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
  });

  if (!produce) {
    throw new ApiError(404, "Product not found", "PRODUCT_NOT_FOUND");
  }

  return successResponse(res, 200, "Product retrieved successfully", produce);
});

/**
 * Update produce
 * PUT /produce/:produceId
 */
export const updateProduce = asyncHandler(async (req, res) => {
  const { produceId } = req.params;
  const userId = req.user.userId;
  const { name, description, price, availableQuantity, unit } = req.body;

  // Verify ownership
  const produce = await prisma.produce.findUnique({
    where: { id: produceId },
    include: { vendor: true },
  });

  if (!produce) {
    throw new ApiError(404, "Product not found", "PRODUCT_NOT_FOUND");
  }

  if (produce.vendor.userId !== userId) {
    throw new ApiError(
      403,
      "You do not have permission to update this product",
      "UNAUTHORIZED",
    );
  }

  const updated = await prisma.produce.update({
    where: { id: produceId },
    data: {
      ...(name && { name }),
      ...(description && { description }),
      ...(price && { price: parseFloat(price) }),
      ...(availableQuantity && {
        availableQuantity: parseInt(availableQuantity),
      }),
      ...(unit && { unit }),
    },
    include: {
      vendor: {
        select: {
          farmName: true,
        },
      },
    },
  });

  return successResponse(res, 200, "Product updated successfully", updated);
});

/**
 * Delete produce
 * DELETE /produce/:produceId
 */
export const deleteProduce = asyncHandler(async (req, res) => {
  const { produceId } = req.params;
  const userId = req.user.userId;

  // Verify ownership
  const produce = await prisma.produce.findUnique({
    where: { id: produceId },
    include: { vendor: true },
  });

  if (!produce) {
    throw new ApiError(404, "Product not found", "PRODUCT_NOT_FOUND");
  }

  if (produce.vendor.userId !== userId) {
    throw new ApiError(
      403,
      "You do not have permission to delete this product",
      "UNAUTHORIZED",
    );
  }

  await prisma.produce.delete({ where: { id: produceId } });

  return successResponse(res, 200, "Product deleted successfully");
});

/**
 * Get vendor's products
 * GET /produce/vendor/:vendorId
 */
export const getVendorProduce = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [total, produces] = await Promise.all([
    prisma.produce.count({ where: { vendorId } }),
    prisma.produce.findMany({
      where: { vendorId },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return paginatedResponse(
    res,
    produces,
    total,
    parseInt(page),
    parseInt(limit),
    "Vendor products fetched",
  );
});

/**
 * Create order
 * POST /orders
 */
export const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { produceId, quantity } = req.body;

  // Get produce details
  const produce = await prisma.produce.findUnique({
    where: { id: produceId },
  });

  if (!produce) {
    throw new ApiError(404, "Product not found", "PRODUCT_NOT_FOUND");
  }

  if (produce.availableQuantity < quantity) {
    throw new ApiError(
      400,
      "Insufficient product quantity",
      "INSUFFICIENT_QUANTITY",
    );
  }

  // Create order
  const order = await prisma.order.create({
    data: {
      userId,
      produceId,
      vendorId: produce.vendorId,
      quantity: parseInt(quantity),
      totalPrice: produce.price * quantity,
      status: "PENDING",
    },
    include: {
      user: {
        select: { name: true, email: true },
      },
      produce: {
        select: { name: true, price: true },
      },
    },
  });

  // Decrease available quantity
  await prisma.produce.update({
    where: { id: produceId },
    data: {
      availableQuantity: {
        decrement: quantity,
      },
    },
  });

  return successResponse(res, 201, "Order created successfully", order);
});

/**
 * Get all orders (with filters)
 * GET /orders
 */
export const getOrders = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { page = 1, limit = 10, status, role } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  let whereClause = {};

  // If user is VENDOR, show only their vendor orders
  // If user is CUSTOMER, show only their orders
  // If user is ADMIN, show all
  if (role !== "ADMIN") {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.role === "VENDOR") {
      const vendorProfile = await prisma.vendorProfile.findUnique({
        where: { userId },
      });
      whereClause.vendorId = vendorProfile?.id;
    } else {
      whereClause.userId = userId;
    }
  }

  if (status) whereClause.status = status;

  const [total, orders] = await Promise.all([
    prisma.order.count({ where: whereClause }),
    prisma.order.findMany({
      where: whereClause,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        user: { select: { name: true, email: true } },
        produce: { select: { name: true, price: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return paginatedResponse(
    res,
    orders,
    total,
    parseInt(page),
    parseInt(limit),
    "Orders fetched",
  );
});

/**
 * Get order by ID
 * GET /orders/:orderId
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      produce: { select: { name: true, price: true, description: true } },
    },
  });

  if (!order) {
    throw new ApiError(404, "Order not found", "ORDER_NOT_FOUND");
  }

  return successResponse(res, 200, "Order retrieved successfully", order);
});

/**
 * Update order status
 * PATCH /orders/:orderId/status
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    throw new ApiError(404, "Order not found", "ORDER_NOT_FOUND");
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      user: { select: { name: true, email: true } },
      produce: { select: { name: true } },
    },
  });

  return successResponse(res, 200, "Order status updated", updated);
});

/**
 * Get marketplace statistics
 * GET /orders/stats/marketplace
 */
export const getMarketplaceStats = asyncHandler(async (req, res) => {
  const [totalOrders, totalProducts, totalRevenue, ordersByStatus] =
    await Promise.all([
      prisma.order.count(),
      prisma.produce.count(),
      prisma.order.aggregate({
        _sum: { totalPrice: true },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

  const stats = {
    totalOrders,
    totalProducts,
    totalRevenue: ordersByStatus._sum?.totalPrice || 0,
    ordersByStatus: ordersByStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {}),
  };

  return successResponse(res, 200, "Marketplace statistics fetched", stats);
});
