# Frontend Integration Guide - Inventory Management Backend

## Table of Contents
1. [Overview](#overview)
2. [API Base Configuration](#api-base-configuration)
3. [Authentication & Authorization](#authentication--authorization)
4. [API Endpoints Reference](#api-endpoints-reference)
5. [Data Models & Types](#data-models--types)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

---

## Overview

This backend provides a comprehensive **Inventory Management System** with the following core modules:

- **Authentication** - User registration, login, logout with JWT tokens
- **Products** - Product catalog management with SKU tracking
- **Inventory** - Real-time stock tracking across multiple warehouses
- **Warehouses** - Multi-location warehouse operations
- **Suppliers** - Supplier relationship management
- **Orders** - Purchase and sales order processing
- **Alerts** - Real-time notifications for stock levels and system events
- **Reports** - Analytics for inventory and sales
- **System** - Health checks, metrics, and settings

**Technology Stack:**
- Runtime: Node.js 18+ with TypeScript
- Framework: Express.js
- Database: MongoDB with Mongoose ODM
- Authentication: JWT with bcrypt password hashing

---

## API Base Configuration

### Base URL
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:6002/api';
```

### Standard Response Format
All API responses follow this structure:

**Success Response:**
```typescript
{
  success: true,
  data: {
    // Response data here
  }
}
```

**Error Response:**
```typescript
{
  success: false,
  error: {
    code: string,        // Error code (e.g., 'TOKEN_EXPIRED')
    message: string,     // Human-readable error message
    details?: any        // Optional additional error details
  }
}
```

### HTTP Status Codes
- `200` - OK (successful GET, PUT)
- `201` - Created (successful POST)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Authentication & Authorization

### 1. JWT Token Authentication

#### Token Structure
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  iat: number;    // Issued at timestamp
  exp: number;    // Expiration timestamp (24 hours)
}
```

#### Authorization Header
All protected endpoints require the following header:
```typescript
headers: {
  'Authorization': `Bearer ${token}`
}
```

### 2. User Roles

- **admin**: Full system access, user management, system configuration
- **user**: Standard access, limited to assigned operations

### 3. Auth Endpoints

#### Register New User
```typescript
POST /api/auth/register

Request Body:
{
  email: string;           // Valid email format, must be unique
  password: string;        // Minimum 6 characters
  firstName: string;       // Required
  lastName: string;        // Required
  role?: 'user' | 'admin'; // Optional, defaults to 'user'
}

Response (201):
{
  success: true,
  data: {
    user: {
      _id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: 'user' | 'admin';
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    }
  }
}
```

#### User Login
```typescript
POST /api/auth/login

Request Body:
{
  email: string;
  password: string;
}

Response (200):
{
  success: true,
  data: {
    user: {
      _id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: 'user' | 'admin';
      isActive: boolean;
    },
    token: string;  // JWT token - store this for subsequent requests
  }
}
```

#### User Logout
```typescript
POST /api/auth/logout
Headers: { Authorization: Bearer <token> }

Response (200):
{
  success: true,
  message: "Logged out successfully"
}
```

---

## API Endpoints Reference

### Products

#### Get All Products
```typescript
GET /api/products
Headers: { Authorization: Bearer <token> }

Response (200):
{
  success: true,
  data: {
    products: Product[]
  }
}
```

#### Create Product (Admin Only)
```typescript
POST /api/products
Headers: { Authorization: Bearer <token> }

Request Body:
{
  productName: string;
  description: string;
  price: number;           // Must be >= 0
  category: string;
  stockQuantity?: number;  // Optional, defaults to 0
  sku: string;            // Unique SKU identifier
}

Response (201):
{
  success: true,
  data: {
    product: Product
  }
}
```

#### Update Product (Admin Only)
```typescript
PUT /api/products/:id
Headers: { Authorization: Bearer <token> }

Request Body: (all fields optional)
{
  productName?: string;
  description?: string;
  price?: number;
  category?: string;
  stockQuantity?: number;
  sku?: string;
}

Response (200):
{
  success: true,
  data: {
    product: Product
  }
}
```

### Inventory

#### Get Inventory Items
```typescript
GET /api/inventory
Headers: { Authorization: Bearer <token> }

Response (200):
{
  success: true,
  data: {
    inventory: Array<{
      productId: {
        _id: string;
        productName: string;
        sku: string;
      };
      warehouseId: {
        _id: string;
        name: string;
        code: string;
      };
      quantity: number;
      minimumStockLevel: number;
      maximumStockLevel: number;
      lastStockUpdate: string;
      updatedBy: string;
    }>
  }
}
```

#### Add Stock
```typescript
POST /api/inventory/add
Headers: { Authorization: Bearer <token> }

Request Body:
{
  productId: string;
  quantity: number;
}

Response (200):
{
  success: true,
  data: {
    inventoryItem: InventoryItem
  }
}
```

### Orders

#### Create Order
```typescript
POST /api/orders
Headers: { Authorization: Bearer <token> }

Request Body:
{
  orderType: 'purchase' | 'sales';
  customerId?: string;      // Required for sales orders
  supplierId?: string;      // Required for purchase orders
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  warehouseId: string;
  paymentMethod?: string;
  shippingAddress?: string;
  billingAddress?: string;
  notes?: string;
}

Response (201):
{
  success: true,
  data: {
    order: Order
  }
}
```

#### Get All Orders
```typescript
GET /api/orders?status=pending&orderType=sales
Headers: { Authorization: Bearer <token> }

Query Parameters:
- status?: 'pending' | 'processing' | 'completed' | 'cancelled'
- orderType?: 'purchase' | 'sales'

Response (200):
{
  success: true,
  data: {
    orders: Order[]
  }
}
```

### Suppliers

#### Create Supplier (Admin Only)
```typescript
POST /api/suppliers
Headers: { Authorization: Bearer <token> }

Request Body:
{
  companyName: string;
  contactPerson: {
    firstName: string;
    lastName: string;
    position: string;
  };
  email: string;
  phone: string;
  alternatePhone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  taxId?: string;
  paymentTerms?: string;
  creditLimit?: number;
  categories: string[];
  notes?: string;
}

Response (201):
{
  success: true,
  data: {
    supplier: Supplier
  }
}
```

#### Get All Suppliers
```typescript
GET /api/suppliers?isActive=true&category=electronics
Headers: { Authorization: Bearer <token> }

Query Parameters:
- isActive?: boolean
- category?: string
- search?: string

Response (200):
{
  success: true,
  data: {
    suppliers: Supplier[]
  }
}
```

### Warehouses

#### Create Warehouse (Admin Only)
```typescript
POST /api/warehouses
Headers: { Authorization: Bearer <token> }

Request Body:
{
  name: string;
  code?: string;  // Auto-generated if not provided
  type: 'main' | 'satellite' | 'third-party';
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contactPerson: {
    name: string;
    phone: string;
    email: string;
  };
  capacity: {
    totalArea: number;      // Square meters
    totalCapacity: number;  // Cubic meters
  };
  operatingHours: {
    start: string;    // e.g., "08:00"
    end: string;      // e.g., "18:00"
    timezone: string; // e.g., "America/New_York"
  };
  features: string[];
  notes?: string;
}

Response (201):
{
  success: true,
  data: {
    warehouse: Warehouse
  }
}
```

#### Get All Warehouses
```typescript
GET /api/warehouses?isActive=true&type=main
Headers: { Authorization: Bearer <token> }

Query Parameters:
- isActive?: boolean
- type?: 'main' | 'satellite' | 'third-party'
- search?: string

Response (200):
{
  success: true,
  data: {
    warehouses: Warehouse[]
  }
}
```

### Alerts

#### Create Alert (Admin Only)
```typescript
POST /api/alerts
Headers: { Authorization: Bearer <token> }

Request Body:
{
  type: 'low_stock' | 'order_delay' | 'stock_expiry' | 'price_change' | 'system' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  metadata?: {
    productId?: string;
    orderId?: string;
    warehouseId?: string;
    threshold?: number;
    currentValue?: number;
  };
  notificationChannels: Array<'email' | 'sms' | 'push' | 'system'>;
  recipients: string[];
  expiresAt?: string;  // ISO date string
}

Response (201):
{
  success: true,
  data: {
    alert: Alert
  }
}
```

### Reports

#### Get Inventory Report
```typescript
GET /api/reports/inventory
Headers: { Authorization: Bearer <token> }

Response (200):
{
  success: true,
  data: {
    report: Array<{
      productId: string;
      productName: string;
      sku: string;
      currentStock: number;
      minimumStockLevel: number;
      maximumStockLevel: number;
      reorderPoint: number;
      averageMonthlyUsage: number;
      lastRestockDate: string;
      category: string;
      warehouseId: string;
      warehouseName: string;
      value: number;
    }>
  }
}
```

#### Get Sales Report
```typescript
GET /api/reports/sales?startDate=2024-01-01&endDate=2024-12-31
Headers: { Authorization: Bearer <token> }

Query Parameters:
- startDate?: string (ISO date)
- endDate?: string (ISO date)

Response (200):
{
  success: true,
  data: {
    report: {
      period: string;
      totalSales: number;
      totalOrders: number;
      averageOrderValue: number;
      topProducts: Array<{
        productId: string;
        productName: string;
        quantity: number;
        revenue: number;
      }>;
      salesByCategory: Array<{
        category: string;
        revenue: number;
        percentage: number;
      }>;
      dailySales: Array<{
        date: string;
        revenue: number;
        orders: number;
      }>;
    }
  }
}
```

### System

#### Health Check (Public)
```typescript
GET /api/health-check

Response (200):
{
  success: true,
  data: {
    health: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      details: {
        database: string;
        cache: string;
        queue: string;
      }
    }
  }
}
```

#### Get System Metrics (Admin Only)
```typescript
GET /api/metrics
Headers: { Authorization: Bearer <token> }

Response (200):
{
  success: true,
  data: {
    metrics: {
      activeUsers: number;
      pendingOrders: number;
      lowStockItems: number;
      activeAlerts: number;
      systemLoad: number;
      performance: {
        responseTime: number;
        errorRate: number;
        uptime: number;
      };
      storage: {
        total: number;
        used: number;
        free: number;
      }
    }
  }
}
```

#### Get System Settings (Admin Only)
```typescript
GET /api/settings?category=inventory
Headers: { Authorization: Bearer <token> }

Query Parameters:
- category?: string

Response (200):
{
  success: true,
  data: {
    settings: Array<{
      category: string;
      key: string;
      value: any;
      dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
      description: string;
      isSystem: boolean;
      updatedAt: string;
    }>
  }
}
```

#### Update System Settings (Admin Only)
```typescript
PUT /api/settings
Headers: { Authorization: Bearer <token> }

Request Body:
{
  settings: Array<{
    key: string;
    value: any;
  }>
}

Response (200):
{
  success: true,
  data: {
    settings: Array<{
      key: string;
      value: any;
      updatedAt: string;
    }>
  }
}
```

---

## Data Models & Types

### TypeScript Interfaces

```typescript
// User
interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product
interface Product {
  _id: string;
  productName: string;
  description: string;
  price: number;
  category: string;
  stockQuantity: number;
  sku: string;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

// Inventory
interface Inventory {
  _id: string;
  productId: string | Product;
  warehouseId: string | Warehouse;
  quantity: number;
  minimumStockLevel: number;
  maximumStockLevel: number;
  lastStockUpdate: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

// Warehouse
interface Warehouse {
  _id: string;
  name: string;
  code: string;
  type: 'main' | 'satellite' | 'third-party';
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contactPerson: {
    name: string;
    phone: string;
    email: string;
  };
  capacity: {
    totalArea: number;
    usedArea: number;
    totalCapacity: number;
    usedCapacity: number;
  };
  isActive: boolean;
  operatingHours: {
    start: string;
    end: string;
    timezone: string;
  };
  features: string[];
  notes?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

// Supplier
interface Supplier {
  _id: string;
  companyName: string;
  contactPerson: {
    firstName: string;
    lastName: string;
    position: string;
  };
  email: string;
  phone: string;
  alternatePhone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  taxId?: string;
  paymentTerms?: string;
  creditLimit?: number;
  isActive: boolean;
  rating?: number;
  categories: string[];
  notes?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

// Order
interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  orderType: 'purchase' | 'sales';
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  customerId?: string;
  supplierId?: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentMethod?: string;
  shippingAddress?: string;
  billingAddress?: string;
  notes?: string;
  warehouseId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

// Alert
interface Alert {
  _id: string;
  type: 'low_stock' | 'order_delay' | 'stock_expiry' | 'price_change' | 'system' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  title: string;
  message: string;
  metadata?: {
    productId?: string;
    orderId?: string;
    warehouseId?: string;
    threshold?: number;
    currentValue?: number;
    [key: string]: any;
  };
  notificationsSent: Array<{
    channel: 'email' | 'sms' | 'push' | 'system';
    recipient: string;
    sentAt: string;
    status: 'sent' | 'failed';
  }>;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdBy: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## Error Handling

### Common Error Codes

#### Authentication Errors
- `TOKEN_MISSING` - No authorization header provided
- `TOKEN_INVALID` - Malformed or invalid token
- `TOKEN_EXPIRED` - Token has expired (24h expiration)
- `USER_NOT_FOUND` - User not found in database
- `USER_INACTIVE` - User account is deactivated
- `INVALID_CREDENTIALS` - Wrong email or password
- `EMAIL_EXISTS` - Email already registered

#### Authorization Errors
- `UNAUTHORIZED` - No valid authentication token
- `FORBIDDEN` - Insufficient permissions (e.g., user trying to access admin endpoint)
- `RESOURCE_NOT_FOUND` - Requested resource not found
- `ACCESS_DENIED` - Access denied to specific resource

#### Validation Errors
- `VALIDATION_ERROR` - Input validation failed
- `INVALID_INPUT` - Invalid input data format

### Error Handling Example

```typescript
// API Service Example
async function fetchProducts(token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error codes
      switch (data.error?.code) {
        case 'TOKEN_EXPIRED':
          // Redirect to login or refresh token
          handleTokenExpired();
          break;
        case 'FORBIDDEN':
          // Show permission denied message
          showPermissionError();
          break;
        default:
          // Show generic error
          showError(data.error?.message || 'An error occurred');
      }
      throw new Error(data.error?.message);
    }

    return data.data.products;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
}
```

---

## Best Practices

### 1. Token Management

```typescript
// Store token securely
const storeToken = (token: string) => {
  // Use httpOnly cookies for production
  localStorage.setItem('auth_token', token);
};

// Retrieve token
const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Clear token on logout
const clearToken = () => {
  localStorage.removeItem('auth_token');
};

// Check token expiration
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};
```

### 2. API Service Layer

```typescript
// api/client.ts
class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        data.error?.message || 'Request failed',
        data.error?.code,
        response.status
      );
    }

    return data.data;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Custom error class
class APIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Usage
const apiClient = new APIClient(API_BASE_URL);
```

### 3. React Hook Example

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for stored token on mount
    const token = getToken();
    if (token && !isTokenExpired(token)) {
      // Optionally fetch user data
      fetchCurrentUser(token);
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { user, token } = response;
    
    storeToken(token);
    apiClient.setToken(token);
    
    setAuthState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = async () => {
    await apiClient.post('/auth/logout', {});
    clearToken();
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return { ...authState, login, logout };
};
```

### 4. Protected Route Example

```typescript
// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

### 5. State Management Example (Redux Toolkit)

```typescript
// store/slices/productsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as RootState;
      const products = await apiClient.get<Product[]>('/products');
      return products;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [] as Product[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default productsSlice.reducer;
```

---

## Additional Resources

- **Full API Specification**: See `API_SPECIFICATION.md` for complete endpoint details
- **Database Schema**: See `docs/05_database_schema.md` for data model details
- **Authentication Details**: See `docs/06_auth_and_authz.md` for security implementation
- **Swagger Documentation**: Available at `/api-docs` when server is running

---

## Quick Start Checklist

- [ ] Set up API base URL in environment variables
- [ ] Implement authentication service with token management
- [ ] Create API client with request/response interceptors
- [ ] Set up error handling for common error codes
- [ ] Implement protected routes based on user roles
- [ ] Create TypeScript interfaces for all data models
- [ ] Set up state management for API data
- [ ] Implement token refresh mechanism
- [ ] Add loading states for async operations
- [ ] Test all CRUD operations for each module

---

**Last Updated**: December 2024  
**Backend Version**: 1.0.0  
**API Version**: v1
