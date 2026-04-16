import Joi from "joi";

/**
 * Authentication Validation Schemas
 */

export const registerValidationSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  email: Joi.string().email().required(),
  password: Joi.string()
    .required()
    .min(8)
    .pattern(new RegExp("^[a-zA-Z0-9@$!%*?&]{8,}$")),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  role: Joi.string().valid("ADMIN", "VENDOR", "CUSTOMER").default("CUSTOMER"),
  phone: Joi.string().optional(),
});

export const loginValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const refreshTokenValidationSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

/**
 * User Profile Validation Schemas
 */

export const updateProfileValidationSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  zipCode: Joi.string().optional(),
  country: Joi.string().optional(),
});

export const changePasswordValidationSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .required()
    .min(8)
    .pattern(new RegExp("^[a-zA-Z0-9@$!%*?&]{8,}$"))
    .invalid(Joi.ref("currentPassword")),
  confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
});

/**
 * Vendor Profile Validation Schemas
 */

export const createVendorValidationSchema = Joi.object({
  farmName: Joi.string().required().min(3).max(100),
  farmDescription: Joi.string().optional().max(500),
  farmLocation: Joi.string().required(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
});

export const updateVendorValidationSchema = Joi.object({
  farmName: Joi.string().min(3).max(100).optional(),
  farmDescription: Joi.string().max(500).optional(),
  farmLocation: Joi.string().optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
});

/**
 * Produce Validation Schemas
 */

export const createProduceValidationSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().optional().max(500),
  price: Joi.number().required().positive(),
  category: Joi.string()
    .valid(
      "VEGETABLES",
      "FRUITS",
      "ORGANIC_SEEDS",
      "GARDENING_TOOLS",
      "COMPOST",
      "FERTILIZERS",
      "PESTICIDES_ORGANIC",
      "HERBS",
      "FLOWERS",
      "OTHER",
    )
    .required(),
  availableQuantity: Joi.number().required().positive(),
  unit: Joi.string().optional().default("kg"),
});

export const updateProduceValidationSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(500).optional(),
  price: Joi.number().positive().optional(),
  availableQuantity: Joi.number().positive().optional(),
  unit: Joi.string().optional(),
});

/**
 * Rental Space Validation Schemas
 */

export const createRentalSpaceValidationSchema = Joi.object({
  location: Joi.string().required(),
  size: Joi.number().required().positive(),
  price: Joi.number().required().positive(),
  description: Joi.string().optional().max(500),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
});

export const updateRentalSpaceValidationSchema = Joi.object({
  location: Joi.string().optional(),
  size: Joi.number().positive().optional(),
  price: Joi.number().positive().optional(),
  description: Joi.string().max(500).optional(),
  availability: Joi.string()
    .valid("AVAILABLE", "RENTED", "MAINTENANCE", "UNAVAILABLE")
    .optional(),
});

/**
 * Order Validation Schemas
 */

export const createOrderValidationSchema = Joi.object({
  produceId: Joi.string().required(),
  quantity: Joi.number().required().positive().integer(),
});

export const updateOrderStatusValidationSchema = Joi.object({
  status: Joi.string()
    .valid(
      "PENDING",
      "CONFIRMED",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "RETURNED",
    )
    .required(),
});

/**
 * Community Post Validation Schemas
 */

export const createCommunityPostValidationSchema = Joi.object({
  title: Joi.string().required().min(5).max(200),
  content: Joi.string().required().min(10).max(5000),
  category: Joi.string().optional().default("general"),
});

export const createForumReplyValidationSchema = Joi.object({
  content: Joi.string().required().min(5).max(5000),
});

/**
 * Certification Validation Schemas
 */

export const createCertificationValidationSchema = Joi.object({
  certifyingAgency: Joi.string().required(),
  certificationNumber: Joi.string().required(),
  certificationDate: Joi.date().required(),
  expiryDate: Joi.date().optional(),
});

/**
 * Pagination Validation Schema
 */

export const paginationValidationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().optional(),
});

/**
 * Validation Middleware Generator
 * @param {object} schema - Joi validation schema
 * @param {string} source - 'body', 'query', 'params'
 * @returns {function} - Express middleware
 */
export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const { value, error } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Validation Error",
        timestamp: new Date().toISOString(),
        errors,
        errorCode: "VALIDATION_ERROR",
      });
    }

    req[source] = value;
    next();
  };
};
