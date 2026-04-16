import helmet from "helmet";

/**
 * Security Headers Middleware
 * Uses helmet.js to set various HTTP headers for security
 */

export const securityHeadersMiddleware = helmet({
  // Content Security Policy - prevents XSS attacks
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },

  // X-Content-Type-Options - prevents MIME sniffing
  noSniff: true,

  // X-Frame-Options - prevents clickjacking
  frameguard: {
    action: "deny",
  },

  // X-XSS-Protection - enable XSS filter in browsers
  xssFilter: true,

  // Strict-Transport-Security - enforce HTTPS
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  // Referrer-Policy - controls referrer information
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin",
  },

  // Permissions-Policy - restrict browser APIs
  permissionsPolicy: {
    features: {
      accelerometer: ["()"],
      camera: ["()"],
      geolocation: ["()"],
      gyroscope: ["()"],
      magnetometer: ["()"],
      microphone: ["()"],
      payment: ["()"],
      usb: ["()"],
    },
  },
});

/**
 * HTTPS redirect middleware
 * Redirects HTTP requests to HTTPS in production
 */
export const httpsRedirectMiddleware = (req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.header("x-forwarded-proto") !== "https"
  ) {
    return res.redirect(301, `https://${req.header("host")}${req.url}`);
  }
  next();
};

/**
 * Security middleware configuration
 * Combines all security headers
 */
export const applySecurityMiddleware = (app) => {
  // Apply helmet for comprehensive security headers
  app.use(securityHeadersMiddleware);

  // Apply HTTPS redirect
  app.use(httpsRedirectMiddleware);

  // Additional custom security headers
  app.use((req, res, next) => {
    // Disable server information
    res.removeHeader("X-Powered-By");
    res.removeHeader("Server");

    // Add custom security headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=()",
    );

    next();
  });
};

export default securityHeadersMiddleware;
