# Urban Farming Platform - API Testing Guide (Postman)

**Base URL:** `http://localhost:3000`

**All API routes are prefixed with `/api/` - see examples below**

---

## 📋 Table of Contents

1. [Authentication Routes](#authentication-routes)
2. [User Routes](#user-routes)
3. [Vendor Routes](#vendor-routes)
4. [Produce/Product Routes](#produceproduct-routes)
5. [Orders Routes](#orders-routes)
6. [Community Routes](#community-routes)

---

## 🔐 AUTHENTICATION ROUTES

### 1️⃣ Register User

**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/register`  
**Access:** Public

**Headers:**

```
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "confirmPassword": "SecurePass@123",
  "role": "CUSTOMER",
  "phone": "9876543210"
}
```

**Notes:**

- Password must be 8+ characters, alphanumeric with special characters (@$!%\*?&)
- confirmPassword must match password
- role: CUSTOMER (default), VENDOR, or ADMIN
- phone is optional

**Expected Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "CUSTOMER",
      "status": "ACTIVE",
      "createdAt": "2026-04-16T..."
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

---

### 2️⃣ Login User

**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/login`  
**Access:** Public

**Headers:**

```
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "email": "admin@farmingplatform.com",
  "password": "AdminPass@123"
}
```

**Test Credentials:**

- Admin: `admin@farmingplatform.com` / `AdminPass@123`
- Vendor: `greenvalley@farming.com` / `VendorPass@123`
- Customer: `customer1@example.com` / `CustomerPass@123`

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "Admin User",
      "email": "admin@farmingplatform.com",
      "role": "ADMIN",
      "status": "ACTIVE"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

---

### 3️⃣ Refresh Access Token

**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/refresh-token`  
**Access:** Public

**Headers:**

```
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed successfully",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

---

### 4️⃣ Get Current User Profile

**Method:** `GET`  
**URL:** `http://localhost:3000/api/auth/me`  
**Access:** Private (Authentication Required)

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Body:** None

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "user-uuid",
    "name": "Admin User",
    "email": "admin@farmingplatform.com",
    "role": "ADMIN",
    "status": "ACTIVE",
    "profileImage": null,
    "phone": null,
    "address": null,
    "createdAt": "2026-04-16T..."
  }
}
```

---

### 5️⃣ Change Password

**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/change-password`  
**Access:** Private (Authentication Required)

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "currentPassword": "AdminPass@123",
  "newPassword": "NewSecurePass@456",
  "confirmPassword": "NewSecurePass@456"
}
```

**Notes:**

- Current password must match existing password
- New password cannot be same as current password
- Password must be 8+ characters with special characters

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password changed successfully"
}
```

---

### 6️⃣ Logout User

**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/logout`  
**Access:** Private (Authentication Required)

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out successfully"
}
```

---

## 👥 USER ROUTES

### 7️⃣ Get All Users

**Method:** `GET`  
**URL:** `http://localhost:3000/api/users?page=1&limit=10&role=VENDOR&status=ACTIVE`  
**Access:** Admin Only

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `role` (optional): ADMIN, VENDOR, CUSTOMER
- `status` (optional): ACTIVE, INACTIVE, SUSPENDED, PENDING

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "user-uuid",
        "name": "Vendor Name",
        "email": "vendor@example.com",
        "role": "VENDOR",
        "status": "ACTIVE",
        "createdAt": "2026-04-16T..."
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

### 8️⃣ Search Users

**Method:** `GET`  
**URL:** `http://localhost:3000/api/users/search?query=farmer&role=VENDOR`  
**Access:** Admin Only

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Query Parameters:**

- `query` (required): Search term (name or email)
- `role` (optional): Filter by role

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "user-uuid",
      "name": "Green Valley Farmer",
      "email": "greenvalley@farming.com",
      "role": "VENDOR",
      "status": "ACTIVE"
    }
  ]
}
```

---

### 9️⃣ Get User Statistics

**Method:** `GET`  
**URL:** `http://localhost:3000/api/users/stats/overview`  
**Access:** Admin Only

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Body:** None

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "totalUsers": 16,
    "activeUsers": 16,
    "inactiveUsers": 0,
    "adminCount": 1,
    "vendorCount": 10,
    "customerCount": 5
  }
}
```

---

### 🔟 Get User by ID

**Method:** `GET`  
**URL:** `http://localhost:3000/api/users/user-uuid`  
**Access:** Admin Only

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**URL Parameters:**

- `id` (required): User UUID

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER",
    "status": "ACTIVE",
    "phone": "9876543210",
    "address": null,
    "createdAt": "2026-04-16T..."
  }
}
```

---

### 1️⃣1️⃣ Update Own Profile

**Method:** `PUT`  
**URL:** `http://localhost:3000/api/users/me`  
**Access:** Private (Any Authenticated User)

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "name": "Updated Name",
  "phone": "9876543210",
  "address": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA"
}
```

**Notes:**

- All fields are optional
- Only fields provided will be updated

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile updated successfully",
  "data": {
    "id": "user-uuid",
    "name": "Updated Name",
    "email": "user@example.com",
    "phone": "9876543210",
    "address": "123 Main Street",
    "city": "New York"
  }
}
```

---

### 1️⃣2️⃣ Update User Status

**Method:** `PATCH`  
**URL:** `http://localhost:3000/api/users/user-uuid/status`  
**Access:** Admin Only

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "status": "SUSPENDED"
}
```

**Status Options:**

- ACTIVE
- INACTIVE
- SUSPENDED
- PENDING

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User status updated successfully"
}
```

---

### 1️⃣3️⃣ Approve Vendor

**Method:** `PATCH`  
**URL:** `http://localhost:3000/api/users/user-uuid/approve-vendor`  
**Access:** Admin Only

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Body:** None

**Notes:**

- Updates vendor certification status to APPROVED

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Vendor approved successfully"
}
```

---

### 1️⃣4️⃣ Delete User

**Method:** `DELETE`  
**URL:** `http://localhost:3000/api/users/user-uuid`  
**Access:** Admin Only

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Body:** None

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User deleted successfully"
}
```

---

## 🧑‍🌾 VENDOR ROUTES

### 1️⃣5️⃣ Create Vendor Profile

**Method:** `POST`  
**URL:** `http://localhost:3000/api/vendors`  
**Access:** Private (Non-vendor users only)

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "farmName": "Green Valley Farms",
  "farmDescription": "Organic farming with sustainable practices",
  "farmLocation": "Willow Creek Road, California",
  "latitude": 34.0522,
  "longitude": -118.2437
}
```

**Notes:**

- farmName: 3-100 characters (required)
- farmDescription: max 500 characters (optional)
- farmLocation: required
- latitude/longitude: optional

**Expected Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Vendor profile created successfully",
  "data": {
    "id": "vendor-uuid",
    "userId": "user-uuid",
    "farmName": "Green Valley Farms",
    "farmDescription": "Organic farming with sustainable practices",
    "farmLocation": "Willow Creek Road, California",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "certificationStatus": "PENDING",
    "createdAt": "2026-04-16T..."
  }
}
```

---

### 1️⃣6️⃣ Get All Vendors

**Method:** `GET`  
**URL:** `http://localhost:3000/api/vendors?page=1&limit=10&status=APPROVED`  
**Access:** Public

**Headers:**

```
Content-Type: application/json
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): PENDING, APPROVED, REJECTED

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "vendor-uuid",
        "farmName": "Green Valley Farms",
        "farmDescription": "Organic farming",
        "farmLocation": "California",
        "certificationStatus": "APPROVED",
        "user": {
          "name": "Farmer John"
        }
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

### 1️⃣7️⃣ Get My Vendor Profile

**Method:** `GET`  
**URL:** `http://localhost:3000/api/vendors/me`  
**Access:** Private (Vendor only)

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Body:** None

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "vendor-uuid",
    "farmName": "Green Valley Farms",
    "farmDescription": "Organic farming with sustainable practices",
    "farmLocation": "Willow Creek Road, California",
    "certificationStatus": "APPROVED",
    "produces": [
      {
        "id": "produce-uuid",
        "name": "Organic Tomatoes",
        "price": 5.99
      }
    ]
  }
}
```

---

### 1️⃣8️⃣ Update My Vendor Profile

**Method:** `PUT`  
**URL:** `http://localhost:3000/api/vendors/me`  
**Access:** Private (Vendor only)

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "farmName": "Updated Farm Name",
  "farmDescription": "Updated description",
  "farmLocation": "New Location",
  "latitude": 34.0522,
  "longitude": -118.2437
}
```

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Vendor profile updated successfully",
  "data": {
    "id": "vendor-uuid",
    "farmName": "Updated Farm Name",
    "farmDescription": "Updated description",
    "farmLocation": "New Location"
  }
}
```

---

### 1️⃣9️⃣ Get Vendor Profile by ID

**Method:** `GET`  
**URL:** `http://localhost:3000/api/vendors/vendor-uuid`  
**Access:** Public

**Headers:**

```
Content-Type: application/json
```

**URL Parameters:**

- `vendorId` (required): Vendor profile UUID

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "vendor-uuid",
    "farmName": "Green Valley Farms",
    "farmDescription": "Organic farming",
    "farmLocation": "California",
    "certificationStatus": "APPROVED",
    "user": {
      "name": "Farmer John",
      "email": "john@farming.com"
    }
  }
}
```

---

### 2️⃣0️⃣ Get Rental Spaces

**Method:** `GET`  
**URL:** `http://localhost:3000/api/vendors/rental-spaces?page=1&limit=10&location=California&availabilityStatus=AVAILABLE`  
**Access:** Public

**Headers:**

```
Content-Type: application/json
```

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `location` (optional): Filter by location
- `availabilityStatus` (optional): AVAILABLE, RENTED, MAINTENANCE, UNAVAILABLE

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "space-uuid",
        "location": "Sunset Boulevard, Los Angeles",
        "size": 5000,
        "price": 500,
        "description": "Large rental space",
        "status": "AVAILABLE"
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

### 2️⃣1️⃣ Create Rental Space

**Method:** `POST`  
**URL:** `http://localhost:3000/api/vendors/rental-spaces`  
**Access:** Private (Vendor only)

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "location": "Downtown Los Angeles",
  "size": 5000,
  "price": 500,
  "description": "Premium rental space near downtown",
  "latitude": 34.0522,
  "longitude": -118.2437
}
```

**Notes:**

- size: in square feet (required)
- price: monthly rental price (required)
- location/size/price are required

**Expected Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Rental space created successfully",
  "data": {
    "id": "space-uuid",
    "vendorId": "vendor-uuid",
    "location": "Downtown Los Angeles",
    "size": 5000,
    "price": 500,
    "description": "Premium rental space",
    "status": "AVAILABLE",
    "createdAt": "2026-04-16T..."
  }
}
```

---

### 2️⃣2️⃣ Update Rental Space

**Method:** `PUT`  
**URL:** `http://localhost:3000/api/vendors/rental-spaces/space-uuid`  
**Access:** Private (Vendor only)

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "location": "Updated Location",
  "size": 6000,
  "price": 550,
  "description": "Updated description",
  "availability": "RENTED"
}
```

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Rental space updated successfully",
  "data": {
    "id": "space-uuid",
    "location": "Updated Location",
    "size": 6000,
    "price": 550,
    "status": "RENTED"
  }
}
```

---

### 2️⃣3️⃣ Delete Rental Space

**Method:** `DELETE`  
**URL:** `http://localhost:3000/api/vendors/rental-spaces/space-uuid`  
**Access:** Private (Vendor only)

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Body:** None

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Rental space deleted successfully"
}
```

---

## 🥕 PRODUCE/PRODUCT ROUTES

### 2️⃣4️⃣ Create Product

**Method:** `POST`  
**URL:** `http://localhost:3000/api/produce`  
**Access:** Private (Vendor only)

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "name": "Organic Tomatoes",
  "description": "Fresh organic tomatoes grown without pesticides",
  "price": 5.99,
  "category": "VEGETABLES",
  "availableQuantity": 100,
  "unit": "kg"
}
```

**Notes:**

- name: 2-100 characters (required)
- price: must be positive (required)
- category: VEGETABLES, FRUITS, ORGANIC_SEEDS, GARDENING_TOOLS, COMPOST, FERTILIZERS, PESTICIDES_ORGANIC, HERBS, FLOWERS, OTHER (required)
- availableQuantity: must be positive (required)
- unit: kg (default), but optional

**Expected Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Product created successfully",
  "data": {
    "id": "produce-uuid",
    "vendorId": "vendor-uuid",
    "name": "Organic Tomatoes",
    "description": "Fresh organic tomatoes",
    "price": 5.99,
    "category": "VEGETABLES",
    "availableQuantity": 100,
    "unit": "kg",
    "createdAt": "2026-04-16T..."
  }
}
```

---

### 2️⃣5️⃣ Get All Products

**Method:** `GET`  
**URL:** `http://localhost:3000/api/produce?page=1&limit=10&category=VEGETABLES&minPrice=0&maxPrice=50&search=tomato`  
**Access:** Public

**Headers:**

```
Content-Type: application/json
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Product category
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `search` (optional): Search by product name

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "produce-uuid",
        "name": "Organic Tomatoes",
        "price": 5.99,
        "category": "VEGETABLES",
        "availableQuantity": 100,
        "vendor": {
          "farmName": "Green Valley Farms"
        }
      }
    ],
    "pagination": {
      "total": 70,
      "page": 1,
      "limit": 10,
      "pages": 7
    }
  }
}
```

---

### 2️⃣6️⃣ Get Product by ID

**Method:** `GET`  
**URL:** `http://localhost:3000/api/produce/produce-uuid`  
**Access:** Public

**Headers:**

```
Content-Type: application/json
```

**URL Parameters:**

- `produceId` (required): Product UUID

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "produce-uuid",
    "name": "Organic Tomatoes",
    "description": "Fresh organic tomatoes",
    "price": 5.99,
    "category": "VEGETABLES",
    "availableQuantity": 100,
    "unit": "kg",
    "vendor": {
      "farmName": "Green Valley Farms",
      "farmLocation": "California"
    }
  }
}
```

---

### 2️⃣7️⃣ Get Vendor's Products

**Method:** `GET`  
**URL:** `http://localhost:3000/api/produce/vendor/vendor-uuid?page=1&limit=10`  
**Access:** Public

**Headers:**

```
Content-Type: application/json
```

**URL Parameters:**

- `vendorId` (required): Vendor UUID

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "produce-uuid",
        "name": "Organic Tomatoes",
        "price": 5.99,
        "category": "VEGETABLES",
        "availableQuantity": 100
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

### 2️⃣8️⃣ Update Product

**Method:** `PUT`  
**URL:** `http://localhost:3000/api/produce/produce-uuid`  
**Access:** Private (Vendor only - owner of product)

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "name": "Premium Organic Tomatoes",
  "description": "Updated description",
  "price": 6.99,
  "availableQuantity": 150,
  "unit": "kg"
}
```

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Product updated successfully",
  "data": {
    "id": "produce-uuid",
    "name": "Premium Organic Tomatoes",
    "price": 6.99,
    "availableQuantity": 150
  }
}
```

---

### 2️⃣9️⃣ Delete Product

**Method:** `DELETE`  
**URL:** `http://localhost:3000/api/produce/produce-uuid`  
**Access:** Private (Vendor only - owner of product)

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Body:** None

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Product deleted successfully"
}
```

---

### 3️⃣0️⃣ Get Marketplace Statistics

**Method:** `GET`  
**URL:** `http://localhost:3000/api/produce/stats/marketplace`  
**Access:** Public

**Headers:**

```
Content-Type: application/json
```

**Body:** None

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "totalProducts": 70,
    "totalVendors": 10,
    "averagePrice": 15.5,
    "categoriesCount": 8,
    "topCategory": "VEGETABLES",
    "totalOrders": 25
  }
}
```

---

## 📦 ORDERS ROUTES

### 3️⃣1️⃣ Create Order

**Method:** `POST`  
**URL:** `http://localhost:3000/api/produce/orders`  
**Access:** Private (Any authenticated user)

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "produceId": "produce-uuid",
  "quantity": 5
}
```

**Notes:**

- produceId: UUID of the product (required)
- quantity: positive integer (required)

**Expected Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Order created successfully",
  "data": {
    "id": "order-uuid",
    "userId": "user-uuid",
    "produceId": "produce-uuid",
    "quantity": 5,
    "totalPrice": 29.95,
    "status": "PENDING",
    "createdAt": "2026-04-16T..."
  }
}
```

---

### 3️⃣2️⃣ Get Orders

**Method:** `GET`  
**URL:** `http://localhost:3000/api/produce/orders?page=1&limit=10&status=PENDING&sortBy=createdAt`  
**Access:** Private (Authentication required)

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED, RETURNED
- `sortBy` (optional): createdAt, updatedAt

**Notes:**

- For VENDOR role: shows orders for their products
- For CUSTOMER role: shows their orders
- For ADMIN role: shows all orders

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "order-uuid",
        "user": {
          "name": "Customer Name",
          "email": "customer@example.com"
        },
        "produce": {
          "name": "Organic Tomatoes",
          "price": 5.99
        },
        "quantity": 5,
        "totalPrice": 29.95,
        "status": "PENDING",
        "createdAt": "2026-04-16T..."
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "pages": 3
    }
  }
}
```

---

### 3️⃣3️⃣ Get Order by ID

**Method:** `GET`  
**URL:** `http://localhost:3000/api/produce/orders/order-uuid`  
**Access:** Private (Order owner, vendor with product, or admin)

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**URL Parameters:**

- `orderId` (required): Order UUID

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "order-uuid",
    "user": {
      "name": "Customer Name",
      "email": "customer@example.com"
    },
    "produce": {
      "name": "Organic Tomatoes",
      "price": 5.99,
      "description": "Fresh organic tomatoes"
    },
    "quantity": 5,
    "totalPrice": 29.95,
    "status": "PENDING",
    "createdAt": "2026-04-16T..."
  }
}
```

---

### 3️⃣4️⃣ Update Order Status

**Method:** `PATCH`  
**URL:** `http://localhost:3000/api/produce/orders/order-uuid/status`  replace order-uuid with an original order-uuid
**Access:** Private (Vendor - product owner, or admin)

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "status": "CONFIRMED"
}
```

**Valid Status Transitions:**

- PENDING → CONFIRMED, CANCELLED
- CONFIRMED → SHIPPED, CANCELLED
- SHIPPED → DELIVERED
- DELIVERED → RETURNED

**Status Options:**

- PENDING
- CONFIRMED
- SHIPPED
- DELIVERED
- CANCELLED
- RETURNED

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Order status updated successfully",
  "data": {
    "id": "order-uuid",
    "status": "CONFIRMED",
    "updatedAt": "2026-04-16T..."
  }
}
```

---

## 💬 COMMUNITY ROUTES

### 3️⃣5️⃣ Create Community Post

**Method:** `POST`  
**URL:** `http://localhost:3000/api/community`  
**Access:** Private (Authentication required)

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "title": "Best Practices for Organic Farming",
  "content": "I would like to share some insights on organic farming techniques that have worked well for my farm. Starting with soil preparation...",
  "category": "farming-tips"
}
```

**Notes:**

- title: 5-200 characters (required)
- content: 10-5000 characters (required)
- category: optional (default: "general")

**Expected Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Post created successfully",
  "data": {
    "id": "post-uuid",
    "title": "Best Practices for Organic Farming",
    "content": "I would like to share...",
    "category": "farming-tips",
    "user": {
      "name": "Farmer John",
      "role": "VENDOR"
    },
    "createdAt": "2026-04-16T..."
  }
}
```

---

### 3️⃣6️⃣ Get All Community Posts

**Method:** `GET`  
**URL:** `http://localhost:3000/api/community?page=1&limit=10&sort=-createdAt&category=general`  
**Access:** Public

**Headers:**

```
Content-Type: application/json
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort` (optional): createdAt, -createdAt (newest first)
- `category` (optional): Filter by category

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "post-uuid",
        "title": "Best Practices for Organic Farming",
        "content": "Discussion about organic farming...",
        "category": "farming-tips",
        "user": {
          "name": "Farmer John",
          "role": "VENDOR"
        },
        "repliesCount": 3,
        "createdAt": "2026-04-16T..."
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 10,
      "pages": 2
    }
  }
}
```

---

### 3️⃣7️⃣ Get Community Statistics

**Method:** `GET`  
**URL:** `http://localhost:3000/api/community/stats/overview`  
**Access:** Public

**Headers:**

```
Content-Type: application/json
```

**Body:** None

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "totalPosts": 15,
    "totalReplies": 45,
    "totalCategories": 4,
    "mostActiveCategory": "general",
    "activeUsers": 12,
    "postsThisMonth": 8
  }
}
```

---

### 3️⃣8️⃣ Get Posts by Category

**Method:** `GET`  
**URL:** `http://localhost:3000/api/community/category/farming-tips?page=1&limit=10`  
**Access:** Public

**Headers:**

```
Content-Type: application/json
```

**URL Parameters:**

- `category` (required): Category name

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "post-uuid",
        "title": "Best Practices for Organic Farming",
        "content": "Discussion about...",
        "category": "farming-tips",
        "user": {
          "name": "Farmer John"
        },
        "repliesCount": 3
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

### 3️⃣9️⃣ Get Community Post by ID

**Method:** `GET`  
**URL:** `http://localhost:3000/api/community/post-uuid`  
**Access:** Public

**Headers:**

```
Content-Type: application/json
```

**URL Parameters:**

- `postId` (required): Post UUID

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "post-uuid",
    "title": "Best Practices for Organic Farming",
    "content": "I would like to share insights...",
    "category": "farming-tips",
    "user": {
      "name": "Farmer John",
      "email": "john@farming.com",
      "role": "VENDOR"
    },
    "createdAt": "2026-04-16T...",
    "updatedAt": "2026-04-16T..."
  }
}
```

---

### 4️⃣0️⃣ Update Community Post

**Method:** `PUT`  
**URL:** `http://localhost:3000/api/community/post-uuid`  
**Access:** Private (Post owner or admin)

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "title": "Updated Title: Best Practices for Organic Farming",
  "content": "Updated content with more details...",
  "category": "farming-tips"
}
```

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Post updated successfully",
  "data": {
    "id": "post-uuid",
    "title": "Updated Title: Best Practices for Organic Farming",
    "content": "Updated content with more details...",
    "updatedAt": "2026-04-16T..."
  }
}
```

---

### 4️⃣1️⃣ Delete Community Post

**Method:** `DELETE`  
**URL:** `http://localhost:3000/api/community/post-uuid`  
**Access:** Private (Post owner or admin)

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Body:** None

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Post deleted successfully"
}
```

---

### 4️⃣2️⃣ Create Reply to Post

**Method:** `POST`  
**URL:** `http://localhost:3000/api/community/post-uuid/replies`  
**Access:** Private (Authentication required)

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**URL Parameters:**

- `postId` (required): Post UUID

**Body (JSON):**

```json
{
  "content": "Great tips! I've been using similar techniques and they really work. One additional tip I would add is..."
}
```

**Notes:**

- content: 5-5000 characters (required)

**Expected Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Reply created successfully",
  "data": {
    "id": "reply-uuid",
    "postId": "post-uuid",
    "content": "Great tips! I've been using...",
    "user": {
      "name": "Customer Name",
      "role": "CUSTOMER"
    },
    "createdAt": "2026-04-16T..."
  }
}
```

---

### 4️⃣3️⃣ Get Post Replies

**Method:** `GET`  
**URL:** `http://localhost:3000/api/community/post-uuid/replies?page=1&limit=10`  
**Access:** Public

**Headers:**

```
Content-Type: application/json
```

**URL Parameters:**

- `postId` (required): Post UUID

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "reply-uuid",
        "content": "Great tips! I've been using...",
        "user": {
          "name": "Customer Name",
          "role": "CUSTOMER"
        },
        "createdAt": "2026-04-16T..."
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

### 4️⃣4️⃣ Update Reply

**Method:** `PUT`  
**URL:** `http://localhost:3000/api/community/replies/reply-uuid`  
**Access:** Private (Reply owner or admin)

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "content": "Updated reply content with more details..."
}
```

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Reply updated successfully",
  "data": {
    "id": "reply-uuid",
    "content": "Updated reply content...",
    "updatedAt": "2026-04-16T..."
  }
}
```

---

### 4️⃣5️⃣ Delete Reply

**Method:** `DELETE`  
**URL:** `http://localhost:3000/api/community/replies/reply-uuid`  
**Access:** Private (Reply owner or admin)

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

**Body:** None

**Expected Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Reply deleted successfully"
}
```

---

## 🔒 AUTHENTICATION NOTES

### Bearer Token Usage

All private routes require the Authorization header with Bearer token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Getting Tokens

1. Call `/auth/register` or `/auth/login`
2. Extract `accessToken` from response
3. Use in Authorization header for protected routes

### Token Expiry

- Access Token: 15 minutes (then use refresh token to get new one)
- Refresh Token: 7 days

### Refreshing Token

When access token expires:

1. Call `/auth/refresh-token` with refresh token
2. Get new access token
3. Continue with new token

---

## ⚡ QUICK TESTING FLOW

**Step 1: Register & Login**

1. POST `/auth/register` - Create new account
2. POST `/auth/login` - Get tokens (or use test credentials)
3. Copy `accessToken`

**Step 2: User & Profile (if Vendor)**

1. GET `/auth/me` - See profile
2. PUT `/users/me` - Update profile
3. POST `/vendors` - Create vendor profile (if vendor)

**Step 3: Test Products**

1. GET `/produce` - Browse products
2. POST `/produce` - Create product (vendor only)
3. PUT `/produce/id` - Update product
4. DELETE `/produce/id` - Delete product

**Step 4: Test Orders**

1. GET `/produce` - Find product ID
2. POST `/produce/orders` - Create order
3. GET `/produce/orders` - List orders
4. PATCH `/produce/orders/id` - Update order status

**Step 5: Community**

1. POST `/community` - Create post
2. GET `/community` - List posts
3. POST `/community/postId/replies` - Reply to post
4. GET `/community/postId/replies` - See replies

---

## ✅ RESPONSE FORMAT

All responses follow this format:

**Success (2xx):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": {
    /* response data */
  }
}
```

**Error (4xx/5xx):**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "errorCode": "ERROR_CODE",
  "errors": [
    /* validation errors */
  ]
}
```

---

## 📝 NOTES

- All timestamps are in ISO 8601 format (UTC)
- UUIDs are used for all entity IDs
- Pagination defaults: page=1, limit=10
- Rate limiting applies to auth endpoints
- Soft deletes may be used for audit trail
