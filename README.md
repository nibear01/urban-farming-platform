# Urban Farming Platform - Backend API

A comprehensive, production-ready backend API for an interactive urban farming platform built with **Node.js, Express.js, PostgreSQL, and Prisma ORM**.

## Features

### Core Functionality

- [x] **User Authentication**: JWT-based (Access + Refresh Token pattern)
- [x] **Role-Based Access Control**: Admin, Vendor, Customer roles
- [x] **Farm Space Rental System**: Location-based search and booking
- [x] **Organic Marketplace**: Buy/sell locally-grown produce
- [x] **Community Forum**: Share gardening tips and best practices
- [x] **Sustainability Certification**: Vendor certification management
- [x] **Rate Limiting**: Protect endpoints from abuse
- [x] **Standardized API Responses**: Consistent JSON structure
- [x] **Comprehensive Error Handling**: Detailed error messages with error codes

### Security & Best Practices

- [x] **Security Headers**: Helmet.js (CSP, X-Frame-Options, HSTS, etc.)
- [x] **Request Tracing**: Correlation IDs for tracking requests
- [x] **Structured Logging**: JSON-based logging with request metadata
- [x] **XSS Protection**: Selective sanitization utilities
- [x] **SQL Injection Prevention**: Prisma parameterized queries
- [x] **Password Security**: bcryptjs with 10 salt rounds
- [x] **Graceful Shutdown**: Proper database & resource cleanup
- [x] **Health Monitoring**: Liveness, readiness, and detailed health endpoints

### Production Features

- [x] **Safe Pagination**: Normalized params with limits
- [x] **Request Logging**: Correlation IDs, timing, status codes
- [x] **Error Middleware**: Centralized error handling
- [x] **Database Pooling**: Prisma connection management
- [x] **Rate Limiting**: Auth (5/15min), Sensitive ops (10/hour), API (100/15min)

---

## Technology Stack

| Layer              | Technology         | Version |
| ------------------ | ------------------ | ------- |
| **Runtime**        | Node.js            | 20+     |
| **Framework**      | Express.js         | 5.x     |
| **Database**       | PostgreSQL         | 14+     |
| **ORM**            | Prisma             | 7.x     |
| **Authentication** | JWT (jsonwebtoken) | 9.0.3   |
| **Password Hash**  | bcryptjs           | 2.4.3   |
| **Validation**     | Joi                | 17.12.2 |
| **Rate Limiting**  | express-rate-limit | 7.1.5   |
| **Security**       | helmet             | 8.1.0   |
| **XSS Protection** | xss                | 1.0.15  |
| **Logging**        | morgan             | 1.10.1  |

---

## Project Structure

```
urban-farming-platform/
├── config/
│   ├── config.js                 # App configuration & env variables
│   └── db.js                     # Prisma client setup
│
├── controllers/
│   ├── authController.js         # Authentication (register, login, tokens)
│   ├── userController.js         # User profile & admin operations
│   ├── vendorController.js       # Vendor profiles & rental spaces
│   ├── produceController.js      # Products & orders
│   └── communityController.js    # Forum posts & discussions
│
├── routes/
│   ├── authRoutes.js             # /api/auth/* endpoints
│   ├── userRoutes.js             # /api/users/* endpoints
│   ├── vendorRoutes.js           # /api/vendors/* endpoints
│   ├── produceRoutes.js          # /api/produce/* endpoints
│   └── communityRoutes.js        # /api/community/* endpoints
│
├── middleware/
│   ├── auth.js                   # Authentication & authorization
│   ├── rateLimiter.js            # Rate limiting strategies
│   ├── security.js               # Security headers (Helmet)
│   ├── correlationId.js          # Request tracing
│   └── sanitization.js           # XSS protection (optional use)
│
├── utils/
│   ├── jwtUtils.js               # JWT token generation & verification
│   ├── responseFormatter.js      # Standardized response formats
│   ├── errorHandler.js           # Error classes & middleware
│   ├── validators.js             # Joi validation schemas
│   ├── pagination.js             # Safe pagination helpers
│   ├── sanitization.js           # XSS sanitization utilities
│   ├── logger.js                 # Structured logging
│   ├── healthCheck.js            # Health monitoring utilities
│   └── shutdown.js               # Graceful shutdown handlers
│
├── prisma/
│   ├── schema.prisma             # Database schema definition
│   ├── seed.cjs                  # Database seeding script
│   ├── seed.js                   # JavaScript seed helpers
│   └── migrations/               # Database migrations
│
├── server.js                      # Application entry point
├── package.json                  # Dependencies & scripts
├── .env                          # Environment variables
├── .gitignore                    # Git ignore rules
└── README.md                     # This file
```

---

## Quick Start Guide

### Prerequisites

- **Node.js**: v20.0 or higher
- **npm**: v10.0 or higher
- **PostgreSQL**: v14 or higher
- **RAM**: 2GB minimum (4GB recommended)

### 1. Verify Installation

```bash
node --version      # Should be v20+
npm --version       # Should be v10+
psql --version      # PostgreSQL client
```

### 2. Clone & Install

```bash
git clone <repo-url>
cd urban-farming-platform

npm install         # 2-5 minutes
```

### 3. Configure PostgreSQL

#### Connection Setup

```bash
# Create database user
psql -U postgres
CREATE USER farming_user WITH PASSWORD 'secure_password_123';
ALTER ROLE farming_user WITH CREATEDB;
\q

# Create database
createdb -U farming_user urban_farming_db
```

#### Environment Variables

Create `.env` file:

```bash
# Database
DATABASE_URL="postgresql://farming_user:secure_password_123@localhost:5432/urban_farming_db"

# Server
PORT=3000
NODE_ENV=development

# JWT Tokens
JWT_ACCESS_TOKEN_SECRET=your_super_secret_access_key_2024
JWT_REFRESH_TOKEN_SECRET=your_super_secret_refresh_key_2024
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**WARNING - Security Notes:**

- Use strong random secrets in production (32+ characters)
- Never commit `.env` to version control
- Use environment-specific values for production

### 4. Database Setup

```bash
# Create tables from schema
npx prisma migrate dev --name init

# View database in visual browser (optional)
npx prisma studio     # Opens http://localhost:5555
```

### 5. Seed Sample Data

```bash
npm run seed

# Creates:
# - 1 Admin user
# - 10 Vendor users with farms
# - 100+ products (vegetables, fruits, seeds, tools, etc.)
# - 5 Customer users
# - 30+ rental spaces
# - 25+ sample orders
# - Community posts with replies
```

### 6. Start Development Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

**Expected Output:**

```
================================================
[OK] Server is running on port 3000
[LIVE] Liveness Check: http://localhost:3000/health
[READY] Readiness Check: http://localhost:3000/health/ready
[HEALTH] Detailed Health: http://localhost:3000/health/detailed
[ENV] Environment: development
================================================
```

### 7. Test the API

```bash
# Basic health check
curl http://localhost:3000/health

# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass@123",
    "confirmPassword": "SecurePass@123",
    "role": "CUSTOMER"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass@123"}'
```

---

## API Overview

### Health Check Endpoints

| Endpoint               | Purpose                        | Returns                    |
| ---------------------- | ------------------------------ | -------------------------- |
| `GET /health`          | Liveness (is app running?)     | `{ status: "alive" }`      |
| `GET /health/ready`    | Readiness (ready for traffic?) | Status + dependency checks |
| `GET /health/detailed` | Full metrics                   | Uptime, memory, DB status  |

### Authentication Routes (`/api/auth`)

| Method | Endpoint           | Description              |
| ------ | ------------------ | ------------------------ |
| POST   | `/register`        | Register new user        |
| POST   | `/login`           | Login user               |
| POST   | `/refresh-token`   | Refresh access token     |
| GET    | `/me`              | Get current user profile |
| POST   | `/change-password` | Change password          |

### Users Routes (`/api/users`)

| Method | Endpoint          | Description                |
| ------ | ----------------- | -------------------------- |
| GET    | `/`               | List all users (Admin)     |
| GET    | `/search`         | Search users (Admin)       |
| GET    | `/stats/overview` | User statistics (Admin)    |
| GET    | `/:id`            | Get user details (Admin)   |
| PUT    | `/me`             | Update own profile         |
| PATCH  | `/:id/status`     | Change user status (Admin) |

### Vendors Routes (`/api/vendors`)

| Method | Endpoint         | Description                    |
| ------ | ---------------- | ------------------------------ |
| POST   | `/`              | Create vendor profile          |
| GET    | `/`              | List all vendors               |
| GET    | `/me`            | Get my vendor profile (Vendor) |
| PUT    | `/me`            | Update vendor profile (Vendor) |
| POST   | `/rental-spaces` | Create rental space (Vendor)   |
| GET    | `/rental-spaces` | List rental spaces             |

### Produce/Marketplace Routes (`/api/produce`)

| Method | Endpoint             | Description             |
| ------ | -------------------- | ----------------------- |
| POST   | `/`                  | Create product (Vendor) |
| GET    | `/`                  | List all products       |
| GET    | `/vendor/:vendorId`  | Get vendor's products   |
| PUT    | `/:id`               | Update product (Vendor) |
| DELETE | `/:id`               | Delete product (Vendor) |
| POST   | `/orders`            | Create order (Customer) |
| GET    | `/orders`            | Get orders              |
| PATCH  | `/orders/:id/status` | Update order status     |

### Community Routes (`/api/community`)

| Method | Endpoint           | Description           |
| ------ | ------------------ | --------------------- |
| POST   | `/`                | Create post           |
| GET    | `/`                | List posts            |
| GET    | `/:postId`         | Get post with replies |
| PUT    | `/:postId`         | Update post           |
| DELETE | `/:postId`         | Delete post           |
| POST   | `/:postId/replies` | Add reply             |

---

## Security Architecture

### Authentication Flow

```
1. User Login
   |
2. Validate credentials (email + bcrypt password)
   |
3. Issue Tokens
   - Access Token (15 min) - For API requests
   - Refresh Token (7 days) - Stored in database
   |
4. Client stores tokens
   - Access Token: Memory or local storage
   - Refresh Token: Secure httpOnly cookie (recommended)
   |
5. API Request with Access Token
   Authorization: Bearer <accessToken>
   |
6. Server validates token
   - Check signature
   - Verify expiry
   - Attach user data
   |
7. If expired, use Refresh Token
   - Validate against database
   - Issue new Access Token
```

### Request Security Pipeline

```
Request
  |
  ├─ Security Headers (Helmet)
  |  └─ CSP, X-Frame-Options, HSTS, etc.
  |
  ├─ Correlation ID Middleware
  |  └─ Generate unique ID for tracing
  |
  ├─ Logging Middleware
  |  └─ Log incoming request
  |
  ├─ Rate Limiter
  |  └─ Check quota
  |
  ├─ Route Handler
  |  ├─ Authentication (if required)
  |  ├─ Authorization (role check)
  |  ├─ Input Validation (Joi)
  |  └─ Business Logic
  |
  ├─ Response Formatting
  |
  └─ Error Handling (if error)
```

### Security Features

| Feature              | Implementation                  | Status |
| -------------------- | ------------------------------- | ------ |
| **Passwords**        | bcryptjs (10 salt rounds)       | [x]    |
| **JWT Tokens**       | Access (15min) + Refresh (7day) | [x]    |
| **Token Validation** | Database checks on refresh      | [x]    |
| **HTTPS**            | HSTS header (1 year)            | [x]    |
| **XSS Prevention**   | CSP headers + xss package       | [x]    |
| **SQL Injection**    | Prisma parameterized queries    | [x]    |
| **Clickjacking**     | X-Frame-Options: DENY           | [x]    |
| **CORS**             | Whitelist configuration         | [x]    |
| **Input Validation** | Joi schemas                     | [x]    |
| **Rate Limiting**    | Per-endpoint strategies         | [x]    |
| **Error Handling**   | No sensitive data leaked        | [x]    |
| **Logging**          | Structured with correlation IDs | [x]    |
| **Shutdown**         | Graceful cleanup                | [x]    |

---

## Database Schema

### Core Entities

**User**

```
- id (UUID)
- name, email (unique)
- password (bcrypt)
- role (ADMIN, VENDOR, CUSTOMER)
- status (ACTIVE, INACTIVE)
- phone, address, city, state, country
```

**VendorProfile**

```
- id (UUID)
- userId (FK)
- farmName, farmDescription, farmLocation
- latitude, longitude
- certificationStatus
```

**Produce**

```
- id (UUID)
- vendorId (FK)
- name, description, price
- category, quantity, unit
- certificationStatus
```

**Order**

```
- id (UUID)
- userId, produceId, vendorId (FK)
- quantity, totalPrice
- status (PENDING, DELIVERED, CANCELLED)
```

**CommunityPost**

```
- id (UUID)
- userId (FK)
- title, content, category
```

**RentalSpace**

```
- id (UUID)
- vendorId (FK)
- location, size, price
- availability
```

---

## Health Monitoring

### Three-Tier Health Check Strategy

#### 1. Liveness Check (`/health`)

- Is the app running?
- Use: Docker/Kubernetes liveness probes
- Response Time: <10ms

#### 2. Readiness Check (`/health/ready`)

- Is the app ready to accept traffic?
- Includes dependency checks (database)
- Use: Load balancer health checks
- Response Time: <100ms

#### 3. Detailed Health (`/health/detailed`)

- Full system metrics
- Memory usage, uptime, response times
- Use: Monitoring dashboards
- Response Time: <50ms

### Request Logging

All requests logged with correlation IDs:

```json
{
  "timestamp": "2026-04-17T10:30:45.123Z",
  "level": "DEBUG",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-123",
  "method": "GET",
  "endpoint": "/api/produce",
  "statusCode": 200,
  "duration": "45ms"
}
```

---

## npm Scripts

```bash
# Development
npm run dev              # Start with nodemon

# Production
npm start               # Start server

# Database
npm run seed           # Populate sample data

# Prisma
npx prisma migrate dev --name <name>   # Create migration
npx prisma migrate reset               # Reset database
npx prisma studio                      # Open visual DB browser
```

---

## Testing

See **[POSTMAN_TESTING_GUIDE.md](./POSTMAN_TESTING_GUIDE.md)** for API testing instructions.

### Default Test Credentials

```
Admin:
  Email: admin@farmingplatform.com
  Password: AdminPass@123

Vendor:
  Email: greenvalley@farming.com
  Password: VendorPass@123

Customer:
  Email: customer1@example.com
  Password: CustomerPass@123
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Verify PostgreSQL is running
psql -U farming_user -d urban_farming_db

# Check DATABASE_URL in .env
# Run migrations
npx prisma db push
```

### Port Already in Use

```bash
# Windows
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Change PORT in .env
```

### Seeding Fails

```bash
# Reset database completely
npx prisma migrate reset
```

### JWT Token Errors

```bash
# Check JWT_ACCESS_TOKEN_SECRET in .env
# Verify token expiry settings
# Clear old refresh tokens via npx prisma studio
```

### CORS Errors

```bash
# Update CORS_ORIGIN in .env to match your frontend URL
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

---

## Resources

- **Prisma**: https://www.prisma.io/docs/
- **Express.js**: https://expressjs.com/
- **JWT**: https://jwt.io/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Joi**: https://joi.dev/

