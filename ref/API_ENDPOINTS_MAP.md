# API Endpoints Map - Quick Reference

## 🗺️ Complete API Endpoint Overview

### Base URL: `/api`

---

## 🔐 Authentication Module (`/auth`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/auth/register` | ❌ | Public | Register new user |
| POST | `/auth/login` | ❌ | Public | User login |
| POST | `/auth/logout` | ✅ | User/Admin | User logout |

**Request/Response Examples:**

```typescript
// Register
POST /api/auth/register
Body: { email, password, firstName, lastName, role? }
Response: { success, data: { user } }

// Login
POST /api/auth/login
Body: { email, password }
Response: { success, data: { user, token } }

// Logout
POST /api/auth/logout
Headers: { Authorization: Bearer <token> }
Response: { success, message }
```

---

## 📦 Products Module (`/products`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/products` | ✅ | User/Admin | Get all products |
| GET | `/products/:id` | ✅ | User/Admin | Get product by ID |
| POST | `/products` | ✅ | Admin | Create new product |
| PUT | `/products/:id` | ✅ | Admin | Update product |
| DELETE | `/products/:id` | ✅ | Admin | Delete product |

**Request/Response Examples:**

```typescript
// Get all products
GET /api/products
Response: { success, data: { products: Product[] } }

// Create product
POST /api/products
Body: { productName, description, price, category, sku, stockQuantity? }
Response: { success, data: { product: Product } }

// Update product
PUT /api/products/:id
Body: { productName?, description?, price?, category?, sku?, stockQuantity? }
Response: { success, data: { product: Product } }
```

---

## 📊 Inventory Module (`/inventory`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/inventory` | ✅ | User/Admin | Get all inventory items |
| GET | `/inventory/:id` | ✅ | User/Admin | Get inventory item by ID |
| POST | `/inventory/add` | ✅ | User/Admin | Add stock to inventory |
| POST | `/inventory/remove` | ✅ | User/Admin | Remove stock from inventory |
| PUT | `/inventory/:id` | ✅ | Admin | Update inventory item |

**Request/Response Examples:**

```typescript
// Get inventory
GET /api/inventory
Response: { 
  success, 
  data: { 
    inventory: [{
      productId: { _id, productName, sku },
      warehouseId: { _id, name, code },
      quantity,
      minimumStockLevel,
      maximumStockLevel,
      lastStockUpdate
    }]
  }
}

// Add stock
POST /api/inventory/add
Body: { productId, quantity }
Response: { success, data: { inventoryItem } }
```

---

## 🏢 Warehouses Module (`/warehouses`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/warehouses` | ✅ | User/Admin | Get all warehouses |
| GET | `/warehouses/:id` | ✅ | User/Admin | Get warehouse by ID |
| POST | `/warehouses` | ✅ | Admin | Create new warehouse |
| PUT | `/warehouses/:id` | ✅ | Admin | Update warehouse |
| DELETE | `/warehouses/:id` | ✅ | Admin | Delete warehouse |

**Query Parameters for GET /warehouses:**
- `isActive` (boolean)
- `type` ('main' | 'satellite' | 'third-party')
- `search` (string)

**Request/Response Examples:**

```typescript
// Get warehouses with filters
GET /api/warehouses?isActive=true&type=main
Response: { success, data: { warehouses: Warehouse[] } }

// Create warehouse
POST /api/warehouses
Body: {
  name, code?, type,
  address: { street, city, state, postalCode, country },
  contactPerson: { name, phone, email },
  capacity: { totalArea, totalCapacity },
  operatingHours: { start, end, timezone },
  features, notes?
}
Response: { success, data: { warehouse } }
```

---

## 🤝 Suppliers Module (`/suppliers`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/suppliers` | ✅ | User/Admin | Get all suppliers |
| GET | `/suppliers/:id` | ✅ | User/Admin | Get supplier by ID |
| POST | `/suppliers` | ✅ | Admin | Create new supplier |
| PUT | `/suppliers/:id` | ✅ | Admin | Update supplier |
| DELETE | `/suppliers/:id` | ✅ | Admin | Delete supplier |

**Query Parameters for GET /suppliers:**
- `isActive` (boolean)
- `category` (string)
- `search` (string)

**Request/Response Examples:**

```typescript
// Get suppliers with filters
GET /api/suppliers?isActive=true&category=electronics
Response: { success, data: { suppliers: Supplier[] } }

// Create supplier
POST /api/suppliers
Body: {
  companyName,
  contactPerson: { firstName, lastName, position },
  email, phone, alternatePhone?,
  address: { street, city, state, postalCode, country },
  taxId?, paymentTerms?, creditLimit?,
  categories, notes?
}
Response: { success, data: { supplier } }
```

---

## 📋 Orders Module (`/orders`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/orders` | ✅ | User/Admin | Get all orders |
| GET | `/orders/:id` | ✅ | User/Admin | Get order by ID |
| POST | `/orders` | ✅ | User/Admin | Create new order |
| PUT | `/orders/:id` | ✅ | User/Admin | Update order |
| DELETE | `/orders/:id` | ✅ | Admin | Cancel/delete order |

**Query Parameters for GET /orders:**
- `status` ('pending' | 'processing' | 'completed' | 'cancelled')
- `orderType` ('purchase' | 'sales')

**Request/Response Examples:**

```typescript
// Get orders with filters
GET /api/orders?status=pending&orderType=sales
Response: { success, data: { orders: Order[] } }

// Create order
POST /api/orders
Body: {
  orderType: 'purchase' | 'sales',
  customerId?,    // Required for sales
  supplierId?,    // Required for purchase
  items: [{ productId, quantity, unitPrice }],
  warehouseId,
  paymentMethod?, shippingAddress?, billingAddress?, notes?
}
Response: { 
  success, 
  data: { 
    order: {
      orderNumber,
      orderType,
      status,
      items,
      totalAmount,
      paymentStatus,
      ...
    }
  }
}
```

---

## 🔔 Alerts Module (`/alerts`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/alerts` | ✅ | User/Admin | Get all alerts |
| GET | `/alerts/:id` | ✅ | User/Admin | Get alert by ID |
| POST | `/alerts` | ✅ | Admin | Create new alert |
| PUT | `/alerts/:id` | ✅ | User/Admin | Update alert status |
| DELETE | `/alerts/:id` | ✅ | Admin | Delete alert |

**Request/Response Examples:**

```typescript
// Get alerts
GET /api/alerts
Response: { success, data: { alerts: Alert[] } }

// Create alert
POST /api/alerts
Body: {
  type: 'low_stock' | 'order_delay' | 'stock_expiry' | 'price_change' | 'system' | 'custom',
  severity: 'low' | 'medium' | 'high' | 'critical',
  title, message,
  metadata?: { productId?, orderId?, warehouseId?, threshold?, currentValue? },
  notificationChannels: ['email' | 'sms' | 'push' | 'system'],
  recipients: string[],
  expiresAt?
}
Response: { success, data: { alert } }

// Update alert status
PUT /api/alerts/:id
Body: { status: 'active' | 'acknowledged' | 'resolved' }
Response: { success, data: { alert } }
```

---

## 📈 Reports Module (`/reports`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/reports/inventory` | ✅ | User/Admin | Get inventory report |
| GET | `/reports/sales` | ✅ | User/Admin | Get sales report |

**Request/Response Examples:**

```typescript
// Get inventory report
GET /api/reports/inventory
Response: { 
  success, 
  data: { 
    report: [{
      productId, productName, sku,
      currentStock, minimumStockLevel, maximumStockLevel,
      reorderPoint, averageMonthlyUsage,
      lastRestockDate, category,
      warehouseId, warehouseName, value
    }]
  }
}

// Get sales report
GET /api/reports/sales?startDate=2024-01-01&endDate=2024-12-31
Response: { 
  success, 
  data: { 
    report: {
      period, totalSales, totalOrders, averageOrderValue,
      topProducts: [{ productId, productName, quantity, revenue }],
      salesByCategory: [{ category, revenue, percentage }],
      dailySales: [{ date, revenue, orders }]
    }
  }
}
```

---

## ⚙️ System Module

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/health-check` | ❌ | Public | System health check |
| GET | `/metrics` | ✅ | Admin | Get system metrics |
| GET | `/settings` | ✅ | Admin | Get system settings |
| PUT | `/settings` | ✅ | Admin | Update system settings |

**Request/Response Examples:**

```typescript
// Health check
GET /api/health-check
Response: { 
  success, 
  data: { 
    health: {
      status: 'healthy' | 'degraded' | 'unhealthy',
      details: { database, cache, queue }
    }
  }
}

// Get metrics
GET /api/metrics
Response: { 
  success, 
  data: { 
    metrics: {
      activeUsers, pendingOrders, lowStockItems, activeAlerts,
      systemLoad,
      performance: { responseTime, errorRate, uptime },
      storage: { total, used, free }
    }
  }
}

// Get settings
GET /api/settings?category=inventory
Response: { 
  success, 
  data: { 
    settings: [{
      category, key, value, dataType,
      description, isSystem, updatedAt
    }]
  }
}

// Update settings
PUT /api/settings
Body: { settings: [{ key, value }] }
Response: { success, data: { settings: [{ key, value, updatedAt }] } }
```

---

## 📊 Endpoint Summary by Module

### Total Endpoints: ~40+

| Module | Endpoints | Auth Required | Admin Only |
|--------|-----------|---------------|------------|
| Authentication | 3 | 1 | 0 |
| Products | 5 | 5 | 3 |
| Inventory | 5 | 5 | 1 |
| Warehouses | 5 | 5 | 3 |
| Suppliers | 5 | 5 | 3 |
| Orders | 5 | 5 | 1 |
| Alerts | 5 | 5 | 2 |
| Reports | 2 | 2 | 0 |
| System | 4 | 3 | 3 |

---

## 🎯 Common Patterns

### 1. List Endpoints (GET)
```typescript
GET /api/{module}
Query Params: ?isActive=true&search=keyword&category=value
Response: { success, data: { [module]: Array } }
```

### 2. Get by ID (GET)
```typescript
GET /api/{module}/:id
Response: { success, data: { [singular]: Object } }
```

### 3. Create (POST)
```typescript
POST /api/{module}
Body: { ...required fields }
Response: { success, data: { [singular]: Object } }
```

### 4. Update (PUT)
```typescript
PUT /api/{module}/:id
Body: { ...fields to update }
Response: { success, data: { [singular]: Object } }
```

### 5. Delete (DELETE)
```typescript
DELETE /api/{module}/:id
Response: { success, message: "Deleted successfully" }
```

---

## 🔑 Authorization Matrix

| Endpoint Pattern | User | Admin |
|-----------------|------|-------|
| `GET /api/*` | ✅ | ✅ |
| `POST /api/orders` | ✅ | ✅ |
| `POST /api/inventory/add` | ✅ | ✅ |
| `POST /api/products` | ❌ | ✅ |
| `POST /api/suppliers` | ❌ | ✅ |
| `POST /api/warehouses` | ❌ | ✅ |
| `POST /api/alerts` | ❌ | ✅ |
| `PUT /api/products/:id` | ❌ | ✅ |
| `PUT /api/suppliers/:id` | ❌ | ✅ |
| `PUT /api/warehouses/:id` | ❌ | ✅ |
| `PUT /api/alerts/:id` | ✅ | ✅ |
| `DELETE /api/*` | ❌ | ✅ |
| `GET /api/metrics` | ❌ | ✅ |
| `GET/PUT /api/settings` | ❌ | ✅ |

---

## 🚦 HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation errors, invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server-side errors |

---

## 💡 Frontend Implementation Tips

### 1. Create API Service Functions

```typescript
// services/api/products.ts
export const productAPI = {
  getAll: () => apiClient.get<Product[]>('/products'),
  getById: (id: string) => apiClient.get<Product>(`/products/${id}`),
  create: (data: CreateProductDTO) => apiClient.post<Product>('/products', data),
  update: (id: string, data: UpdateProductDTO) => apiClient.put<Product>(`/products/${id}`, data),
  delete: (id: string) => apiClient.delete(`/products/${id}`),
};
```

### 2. Use TypeScript for Type Safety

```typescript
// types/api.ts
export interface APIResponse<T> {
  success: boolean;
  data: T;
}

export interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### 3. Implement Request Interceptors

```typescript
// Add auth token to all requests
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.error?.code === 'TOKEN_EXPIRED') {
      // Redirect to login
      logout();
    }
    return Promise.reject(error);
  }
);
```

---

## 📝 Testing Checklist

- [ ] Test authentication flow (register, login, logout)
- [ ] Test token expiration handling
- [ ] Test role-based access (user vs admin)
- [ ] Test CRUD operations for each module
- [ ] Test query parameters and filtering
- [ ] Test error handling for all endpoints
- [ ] Test file uploads (if applicable)
- [ ] Test pagination (if implemented)
- [ ] Test real-time updates (if using WebSockets)

---

**Last Updated**: December 2024  
**API Version**: v1  
**Base URL**: `http://localhost:6002/api`
