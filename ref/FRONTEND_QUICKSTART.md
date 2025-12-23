# Frontend Developer Quick Start Guide

## 🚀 Getting Started in 5 Minutes

This guide will help you quickly understand and start integrating with the Inventory Management Backend.

---

## 📋 Prerequisites

- **Backend Running**: Ensure the backend is running on `http://localhost:6002`
- **Node.js**: Version 18+ installed
- **Package Manager**: npm, yarn, or pnpm

---

## 🎯 Step 1: Understand the System (2 minutes)

### What This Backend Does
- **Inventory Management**: Track products across multiple warehouses
- **Order Processing**: Handle purchase and sales orders
- **Supplier Management**: Manage supplier relationships
- **Alerts & Reports**: Real-time notifications and analytics

### Core Concepts
1. **Authentication**: JWT-based with 24-hour token expiry
2. **Roles**: `admin` (full access) and `user` (limited access)
3. **Multi-Warehouse**: Products can exist in multiple warehouse locations
4. **Order Types**: `purchase` (from suppliers) and `sales` (to customers)

---

## 🔧 Step 2: Set Up Your Frontend Project (3 minutes)

### Install Dependencies

```bash
# For React/Next.js
npm install axios react-query @tanstack/react-query
# or
npm install axios swr

# For state management (optional)
npm install zustand
# or
npm install @reduxjs/toolkit react-redux
```

### Create Environment File

```bash
# .env.local (for Next.js) or .env (for React)
NEXT_PUBLIC_API_URL=http://localhost:6002/api
# or
REACT_APP_API_URL=http://localhost:6002/api
```

---

## 💻 Step 3: Create API Client

### Basic API Client Setup

```typescript
// lib/api-client.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6002/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response.data, // Return only data
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);
```

---

## 🔐 Step 4: Implement Authentication

### Auth Service

```typescript
// services/auth.service.ts
import { apiClient } from '@/lib/api-client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  isActive: boolean;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await apiClient.post('/auth/login', credentials);
    const { user, token } = response.data;
    localStorage.setItem('auth_token', token);
    return { user, token };
  },

  async register(data: RegisterData) {
    const response = await apiClient.post('/auth/register', data);
    return response.data.user;
  },

  async logout() {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('auth_token');
  },

  getToken() {
    return localStorage.getItem('auth_token');
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};
```

### Auth Context (React)

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authService, User } from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = authService.getToken();
    if (token) {
      // Optionally fetch user data
      // fetchCurrentUser();
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { user } = await authService.login({ email, password });
    setUser(user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## 📦 Step 5: Create API Services for Each Module

### Products Service

```typescript
// services/products.service.ts
import { apiClient } from '@/lib/api-client';

export interface Product {
  _id: string;
  productName: string;
  description: string;
  price: number;
  category: string;
  stockQuantity: number;
  sku: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDTO {
  productName: string;
  description: string;
  price: number;
  category: string;
  sku: string;
  stockQuantity?: number;
}

export const productsService = {
  async getAll(): Promise<Product[]> {
    const response = await apiClient.get('/products');
    return response.data.products;
  },

  async getById(id: string): Promise<Product> {
    const response = await apiClient.get(`/products/${id}`);
    return response.data.product;
  },

  async create(data: CreateProductDTO): Promise<Product> {
    const response = await apiClient.post('/products', data);
    return response.data.product;
  },

  async update(id: string, data: Partial<CreateProductDTO>): Promise<Product> {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data.product;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },
};
```

### Orders Service

```typescript
// services/orders.service.ts
import { apiClient } from '@/lib/api-client';

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  orderType: 'purchase' | 'sales';
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  createdAt: string;
}

export interface CreateOrderDTO {
  orderType: 'purchase' | 'sales';
  customerId?: string;
  supplierId?: string;
  items: OrderItem[];
  warehouseId: string;
  paymentMethod?: string;
  shippingAddress?: string;
  billingAddress?: string;
  notes?: string;
}

export const ordersService = {
  async getAll(filters?: { status?: string; orderType?: string }): Promise<Order[]> {
    const params = new URLSearchParams(filters as any);
    const response = await apiClient.get(`/orders?${params}`);
    return response.data.orders;
  },

  async getById(id: string): Promise<Order> {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data.order;
  },

  async create(data: CreateOrderDTO): Promise<Order> {
    const response = await apiClient.post('/orders', data);
    return response.data.order;
  },

  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    const response = await apiClient.put(`/orders/${id}`, { status });
    return response.data.order;
  },
};
```

---

## 🎨 Step 6: Create Your First Component

### Login Page

```typescript
// pages/login.tsx or app/login/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.error?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>
        
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div>
          <label className="block mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}
```

### Products List Component

```typescript
// components/ProductsList.tsx
'use client';

import { useEffect, useState } from 'react';
import { productsService, Product } from '@/services/products.service';

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsService.getAll();
      setProducts(data);
    } catch (err: any) {
      setError(err.error?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Products</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product._id} className="p-4 border rounded shadow">
            <h3 className="font-bold">{product.productName}</h3>
            <p className="text-sm text-gray-600">{product.description}</p>
            <p className="mt-2">
              <span className="font-semibold">Price:</span> ${product.price}
            </p>
            <p>
              <span className="font-semibold">Stock:</span> {product.stockQuantity}
            </p>
            <p className="text-xs text-gray-500">SKU: {product.sku}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🛡️ Step 7: Implement Protected Routes

### Protected Route Component

```typescript
// components/ProtectedRoute.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (requiredRole && user?.role !== requiredRole) {
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, user, isLoading, requiredRole, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
```

### Usage

```typescript
// app/dashboard/page.tsx
import ProtectedRoute from '@/components/ProtectedRoute';
import ProductsList from '@/components/ProductsList';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <ProductsList />
      </div>
    </ProtectedRoute>
  );
}

// Admin-only page
// app/admin/settings/page.tsx
export default function SettingsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Admin Settings</h1>
        {/* Admin settings content */}
      </div>
    </ProtectedRoute>
  );
}
```

---

## 📊 Step 8: Using React Query (Recommended)

### Setup React Query

```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

### Custom Hooks with React Query

```typescript
// hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService, CreateProductDTO } from '@/services/products.service';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => productsService.getAll(),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateProductDTO) => productsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProductDTO> }) =>
      productsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => productsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
```

### Using the Hooks

```typescript
// components/ProductsList.tsx (with React Query)
'use client';

import { useProducts } from '@/hooks/useProducts';

export default function ProductsList() {
  const { data: products, isLoading, error } = useProducts();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products?.map((product) => (
        <div key={product._id} className="p-4 border rounded">
          <h3 className="font-bold">{product.productName}</h3>
          <p className="text-gray-600">{product.description}</p>
          <p className="mt-2">Price: ${product.price}</p>
          <p>Stock: {product.stockQuantity}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎯 Common Tasks Cheat Sheet

### 1. Get All Products
```typescript
const products = await productsService.getAll();
```

### 2. Create a Product (Admin)
```typescript
const newProduct = await productsService.create({
  productName: 'Laptop',
  description: 'High-performance laptop',
  price: 999.99,
  category: 'Electronics',
  sku: 'LAP-001',
  stockQuantity: 50
});
```

### 3. Create an Order
```typescript
const order = await ordersService.create({
  orderType: 'sales',
  customerId: 'customer-id',
  items: [
    { productId: 'product-id', quantity: 2, unitPrice: 999.99 }
  ],
  warehouseId: 'warehouse-id',
  paymentMethod: 'credit_card'
});
```

### 4. Get Inventory
```typescript
const inventory = await apiClient.get('/inventory');
```

### 5. Add Stock
```typescript
await apiClient.post('/inventory/add', {
  productId: 'product-id',
  quantity: 100
});
```

---

## 🚨 Common Errors & Solutions

### 1. 401 Unauthorized
**Problem**: Token missing or expired  
**Solution**: Check if token exists and is valid, redirect to login

### 2. 403 Forbidden
**Problem**: User doesn't have permission  
**Solution**: Check user role, show appropriate message

### 3. CORS Error
**Problem**: Backend not allowing frontend origin  
**Solution**: Ensure backend CORS is configured for your frontend URL

### 4. Network Error
**Problem**: Backend not running  
**Solution**: Start backend server on port 6002

---

## 📚 Next Steps

1. **Explore Documentation**:
   - `FRONTEND_INTEGRATION_GUIDE.md` - Complete API reference
   - `API_ENDPOINTS_MAP.md` - All endpoints at a glance
   - `SYSTEM_ARCHITECTURE.md` - System design and data flow

2. **Implement Remaining Modules**:
   - Inventory management
   - Warehouse management
   - Supplier management
   - Alerts and notifications
   - Reports and analytics

3. **Add Features**:
   - Search and filtering
   - Pagination
   - Real-time updates (WebSockets)
   - File uploads
   - Export functionality

4. **Improve UX**:
   - Loading states
   - Error boundaries
   - Toast notifications
   - Optimistic updates
   - Skeleton screens

---

## 🔗 Quick Links

- **Backend Repository**: Check README.md for setup instructions
- **API Documentation**: `API_SPECIFICATION.md`
- **Database Schema**: `docs/05_database_schema.md`
- **Authentication Details**: `docs/06_auth_and_authz.md`

---

## 💡 Pro Tips

1. **Use TypeScript**: Type safety prevents many runtime errors
2. **Use React Query**: Simplifies data fetching and caching
3. **Implement Error Boundaries**: Graceful error handling
4. **Add Loading States**: Better user experience
5. **Use Environment Variables**: Never hardcode API URLs
6. **Implement Token Refresh**: Better security
7. **Add Request Cancellation**: Prevent memory leaks
8. **Use Optimistic Updates**: Faster perceived performance

---

## 🆘 Need Help?

1. Check the comprehensive documentation files
2. Review the existing backend code in `src/` directory
3. Test endpoints using the Swagger docs at `/api-docs`
4. Use Postman/Thunder Client to test API calls

---

**Happy Coding! 🚀**

---

**Last Updated**: December 2024  
**Backend Version**: 1.0.0
