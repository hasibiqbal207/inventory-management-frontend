# Backend Structure Summary

## Quick Overview

This is a **Node.js/TypeScript** backend for an **Inventory Management System** using **Express.js** and **MongoDB**.

---

## 📁 Project Structure

```
inventory-management-backend/
├── src/
│   ├── config/           # Database and environment configuration
│   ├── controllers/      # Request handlers (9 controllers)
│   │   ├── auth.controller.ts
│   │   ├── product.controller.ts
│   │   ├── inventory.controller.ts
│   │   ├── order.controller.ts
│   │   ├── supplier.controller.ts
│   │   ├── warehouse.controller.ts
│   │   ├── alert.controller.ts
│   │   ├── report.controller.ts
│   │   └── system.controller.ts
│   ├── models/           # MongoDB schemas (9 models)
│   │   ├── user.model.ts
│   │   ├── product.model.ts
│   │   ├── inventory.model.ts
│   │   ├── order.model.ts
│   │   ├── supplier.model.ts
│   │   ├── warehouse.model.ts
│   │   ├── alert.model.ts
│   │   ├── settings.model.ts
│   │   └── report.types.ts
│   ├── routes/           # API route definitions (10 route files)
│   │   ├── auth.route.ts
│   │   ├── product.route.ts
│   │   ├── inventory.route.ts
│   │   ├── order.route.ts
│   │   ├── supplier.route.ts
│   │   ├── warehouse.route.ts
│   │   ├── alert.route.ts
│   │   ├── report.route.ts
│   │   ├── system.route.ts
│   │   └── index.ts
│   ├── services/         # Business logic layer (9 services)
│   ├── middlewares/      # Authentication & validation middleware
│   ├── utils/            # Helper functions
│   └── server.ts         # Application entry point
├── docs/                 # Comprehensive documentation
│   ├── 01_project_overview.md
│   ├── 02_requirements_spec.md
│   ├── 03_architecture.md
│   ├── 04_api_documentation.md
│   ├── 05_database_schema.md
│   ├── 06_auth_and_authz.md
│   ├── 07_testing_plan.md
│   ├── 08_deployment_devops.md
│   ├── 09_monitoring_logging.md
│   └── 10_changelog.md
├── API_SPECIFICATION.md  # Complete API reference
├── README.md
└── package.json
```

---

## 🔐 Authentication

- **Type**: JWT (JSON Web Tokens)
- **Password**: bcrypt hashing (10 salt rounds)
- **Token Expiry**: 24 hours
- **Roles**: `admin` | `user`

**Auth Header Format:**
```
Authorization: Bearer <jwt_token>
```

---

## 🎯 Core Modules

### 1. **Authentication** (`/api/auth`)
- User registration
- User login
- User logout
- JWT token management

### 2. **Products** (`/api/products`)
- CRUD operations for products
- SKU-based tracking
- Category management
- Stock quantity tracking

### 3. **Inventory** (`/api/inventory`)
- Real-time stock tracking
- Multi-warehouse inventory
- Stock level management (min/max)
- Add/remove stock operations

### 4. **Warehouses** (`/api/warehouses`)
- Warehouse management
- Capacity tracking (area & volume)
- Location management
- Operating hours configuration

### 5. **Suppliers** (`/api/suppliers`)
- Supplier information management
- Contact details
- Payment terms
- Performance rating

### 6. **Orders** (`/api/orders`)
- Purchase orders
- Sales orders
- Order status tracking
- Payment status management

### 7. **Alerts** (`/api/alerts`)
- Low stock alerts
- Order delay notifications
- System alerts
- Multi-channel notifications (email, SMS, push)

### 8. **Reports** (`/api/reports`)
- Inventory reports
- Sales reports
- Analytics and insights

### 9. **System** (`/api`)
- Health check (`/health-check`)
- System metrics (`/metrics`)
- Settings management (`/settings`)

---

## 📊 Database Models

### User
```typescript
{
  email: string (unique)
  password: string (hashed)
  firstName: string
  lastName: string
  role: 'admin' | 'user'
  isActive: boolean
}
```

### Product
```typescript
{
  productName: string
  description: string
  price: number
  category: string
  stockQuantity: number
  sku: string (unique)
  isActive: boolean
  createdBy: ObjectId
  updatedBy: ObjectId
}
```

### Inventory
```typescript
{
  productId: ObjectId (ref: Product)
  warehouseId: ObjectId (ref: Warehouse)
  quantity: number
  minimumStockLevel: number
  maximumStockLevel: number
  lastStockUpdate: Date
  updatedBy: ObjectId
}
```

### Warehouse
```typescript
{
  name: string (unique)
  code: string (unique)
  type: 'main' | 'satellite' | 'third-party'
  address: { street, city, state, postalCode, country }
  contactPerson: { name, phone, email }
  capacity: { totalArea, usedArea, totalCapacity, usedCapacity }
  operatingHours: { start, end, timezone }
  features: string[]
  isActive: boolean
}
```

### Supplier
```typescript
{
  companyName: string (unique)
  contactPerson: { firstName, lastName, position }
  email: string (unique)
  phone: string
  address: { street, city, state, postalCode, country }
  taxId: string
  paymentTerms: string
  creditLimit: number
  rating: number (0-5)
  categories: string[]
  isActive: boolean
}
```

### Order
```typescript
{
  orderNumber: string (unique)
  orderType: 'purchase' | 'sales'
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  customerId: ObjectId (for sales)
  supplierId: ObjectId (for purchase)
  items: [{ productId, quantity, unitPrice, subtotal }]
  totalAmount: number
  paymentStatus: 'pending' | 'partial' | 'paid'
  warehouseId: ObjectId
}
```

### Alert
```typescript
{
  type: 'low_stock' | 'order_delay' | 'stock_expiry' | 'price_change' | 'system' | 'custom'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'acknowledged' | 'resolved'
  title: string
  message: string
  metadata: { productId?, orderId?, warehouseId?, threshold?, currentValue? }
  notificationsSent: [{ channel, recipient, sentAt, status }]
}
```

---

## 🔑 API Endpoints Quick Reference

### Authentication (Public)
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - User login
POST   /api/auth/logout      - User logout (requires auth)
```

### Products (Auth Required)
```
GET    /api/products         - Get all products
POST   /api/products         - Create product (admin only)
PUT    /api/products/:id     - Update product (admin only)
DELETE /api/products/:id     - Delete product (admin only)
```

### Inventory (Auth Required)
```
GET    /api/inventory        - Get inventory items
POST   /api/inventory/add    - Add stock
POST   /api/inventory/remove - Remove stock
```

### Orders (Auth Required)
```
GET    /api/orders           - Get all orders (with filters)
POST   /api/orders           - Create order
PUT    /api/orders/:id       - Update order
GET    /api/orders/:id       - Get order by ID
```

### Suppliers (Auth Required)
```
GET    /api/suppliers        - Get all suppliers (with filters)
POST   /api/suppliers        - Create supplier (admin only)
PUT    /api/suppliers/:id    - Update supplier (admin only)
DELETE /api/suppliers/:id    - Delete supplier (admin only)
```

### Warehouses (Auth Required)
```
GET    /api/warehouses       - Get all warehouses (with filters)
POST   /api/warehouses       - Create warehouse (admin only)
PUT    /api/warehouses/:id   - Update warehouse (admin only)
DELETE /api/warehouses/:id   - Delete warehouse (admin only)
```

### Alerts (Auth Required)
```
GET    /api/alerts           - Get all alerts
POST   /api/alerts           - Create alert (admin only)
PUT    /api/alerts/:id       - Update alert status
DELETE /api/alerts/:id       - Delete alert (admin only)
```

### Reports (Auth Required)
```
GET    /api/reports/inventory - Get inventory report
GET    /api/reports/sales     - Get sales report (with date filters)
```

### System
```
GET    /api/health-check     - Health check (public)
GET    /api/metrics          - System metrics (admin only)
GET    /api/settings         - Get settings (admin only)
PUT    /api/settings         - Update settings (admin only)
```

---

## 🛡️ Authorization Levels

### Public Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/health-check`

### User Endpoints (Authenticated)
- All `GET` endpoints for products, inventory, orders, suppliers, warehouses
- `POST /api/orders` (create order)
- `POST /api/auth/logout`

### Admin Only Endpoints
- All `POST`, `PUT`, `DELETE` for products, suppliers, warehouses
- `POST /api/alerts`
- `GET /api/metrics`
- `GET/PUT /api/settings`

---

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}  // Optional
  }
}
```

---

## 🚀 Common Error Codes

### Authentication
- `TOKEN_MISSING` - No authorization header
- `TOKEN_INVALID` - Invalid token format
- `TOKEN_EXPIRED` - Token expired (24h)
- `INVALID_CREDENTIALS` - Wrong email/password
- `EMAIL_EXISTS` - Email already registered

### Authorization
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Insufficient permissions
- `ACCESS_DENIED` - Resource access denied

### Validation
- `VALIDATION_ERROR` - Input validation failed
- `RESOURCE_NOT_FOUND` - Resource doesn't exist

---

## 🔧 Environment Variables

```bash
# Server
PORT=6002
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/inventory-management

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Security
BCRYPT_SALT_ROUNDS=10
ALLOWED_ORIGINS=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 📚 Key Features for Frontend

### 1. **Multi-Warehouse Support**
- Track inventory across multiple locations
- Warehouse-specific stock levels
- Transfer stock between warehouses

### 2. **Role-Based Access**
- Admin: Full CRUD access
- User: Read access + limited operations

### 3. **Real-Time Alerts**
- Low stock notifications
- Order status updates
- System alerts

### 4. **Comprehensive Reporting**
- Inventory analytics
- Sales reports with date filters
- Top products and category breakdowns

### 5. **Order Management**
- Purchase orders (from suppliers)
- Sales orders (to customers)
- Order status tracking
- Payment status tracking

### 6. **Supplier Management**
- Supplier information
- Performance ratings
- Payment terms
- Category associations

---

## 🎨 Frontend Implementation Tips

### 1. **State Management**
Consider managing these state slices:
- `auth` - User authentication state
- `products` - Product catalog
- `inventory` - Inventory items
- `orders` - Order list
- `suppliers` - Supplier list
- `warehouses` - Warehouse list
- `alerts` - Active alerts
- `reports` - Report data

### 2. **Key UI Components Needed**
- Login/Register forms
- Product list/grid with CRUD
- Inventory dashboard with stock levels
- Order management interface
- Warehouse selector
- Alert notifications panel
- Reports with charts/graphs
- Admin panel for user/settings management

### 3. **Data Visualization**
- Stock level indicators (low/medium/high)
- Warehouse capacity gauges
- Sales charts (daily/monthly)
- Top products rankings
- Alert severity indicators

### 4. **User Flows**
- **Admin**: Full access to all modules
- **User**: View products/inventory, create orders, view reports

---

## 📖 Documentation Files

For detailed information, refer to:

1. **`FRONTEND_INTEGRATION_GUIDE.md`** - Complete API integration guide
2. **`API_SPECIFICATION.md`** - Full API endpoint specifications
3. **`docs/05_database_schema.md`** - Database schema details
4. **`docs/06_auth_and_authz.md`** - Authentication & authorization
5. **`docs/03_architecture.md`** - System architecture

---

## 🏁 Getting Started with Frontend

1. **Set up API client** with base URL and authentication
2. **Implement authentication** (login/register/logout)
3. **Create protected routes** based on user roles
4. **Build core modules**:
   - Products management
   - Inventory tracking
   - Order processing
   - Warehouse management
5. **Add reporting** and analytics
6. **Implement alerts** and notifications
7. **Test all CRUD operations**

---

**Backend Port**: `6002`  
**API Base**: `/api`  
**Database**: MongoDB  
**Authentication**: JWT (24h expiry)
