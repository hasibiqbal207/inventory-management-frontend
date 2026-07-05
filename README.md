# Inventory Management System - Frontend

A Next.js 15 / TypeScript frontend for the Inventory Management System, backed by
a Node/Express/MongoDB API (see the sibling `inventory-management-backend` repo).

## Features

- **Authentication** - JWT login/registration, with session rehydration on page reload
- **Role-Based Access Control** - ten distinct roles (see below), each with its own permitted actions and navigation
- **Products & Categories** - product catalog with a shared, renameable category list
- **Multi-Warehouse Inventory** - transactional add/remove/transfer stock, low-stock and out-of-stock indicators
- **Inventory Requests** - an approval workflow for Warehouse Staff stock changes, reviewed by a supervisor/manager/admin
- **Orders** - purchase and sales orders, multi-currency (USD/EUR/GBP/BDT), status workflow
- **Suppliers & Warehouses** - full CRUD, contact/location details, capacity tracking
- **Alerts** - severity-based alert feed with acknowledge/resolve/dismiss
- **Reports & Analytics** - inventory, sales, supplier performance, and damaged-stock reports, with charts (recharts) and CSV export
- **Admin** - dashboard overview, user management (role changes, deactivation), live system settings, and system metrics

## Prerequisites

- Node.js 18+ installed
- Backend server running on `http://localhost:6002`
- npm or yarn package manager

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner (toasts)

## Installation

1. **Clone the repository** (if not already done)

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:6002/api
NEXT_PUBLIC_APP_NAME=Inventory Management System
NEXT_PUBLIC_APP_VERSION=1.0.0
```

4. **Start the development server**:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── dashboard/               # Protected dashboard routes (see Available Pages)
│   ├── login/                   # Login page
│   ├── register/                # Registration page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page (redirects to dashboard or login)
│   └── providers.tsx            # App providers (React Query, Auth, Toaster)
├── components/                   # React components, grouped by feature
│   ├── auth/                    # Protected route wrapper
│   ├── products/ inventory/ orders/ warehouses/ suppliers/  # Per-module forms
│   ├── dashboard/                # Dashboard-only components (module guides)
│   ├── profile/                  # User profile dialog
│   └── ui/                       # Reusable UI primitives (button, input, dialog, select, ...)
├── contexts/
│   └── auth-context.tsx          # Auth state, session rehydration via /auth/me
├── hooks/                        # React Query hooks per module
├── lib/
│   ├── api-client.ts             # Axios instance + interceptors
│   ├── query-client.ts           # TanStack Query config
│   ├── export.ts                 # Client-side CSV export helper
│   └── utils.ts, format.ts       # Formatting utilities
├── services/                     # One file per API resource (products, inventory, orders, ...)
└── types/
    └── api.ts                    # Shared TypeScript types matching the backend API
```

## Authentication

The application uses JWT-based authentication:

1. **Register**: Create a new account at `/register`
2. **Login**: Sign in at `/login`
3. **Protected Routes**: Dashboard and all sub-pages require authentication
4. **Token Storage**: JWT stored in `localStorage`
5. **Session Rehydration**: On page load, a stored token is verified against `GET /auth/me` to restore the full user profile — an invalid/expired token clears the session and redirects to login

### User Roles

The system uses ten roles for granular access control (see the backend's `ROLES.md` for the full permission matrix):

| Role | Typical focus |
|---|---|
| `admin` | Full system access, including user management and settings |
| `inventory_manager` | Product catalog, categories, stock levels, warehouse management |
| `warehouse_supervisor` | Warehouse operations, stock transfers, request approvals |
| `warehouse_staff` | Day-to-day stock adjustments via the request/approval workflow |
| `procurement_officer` | Suppliers and purchase orders |
| `sales_rep` | Sales orders and customer-facing product info |
| `finance_officer` | Financial reports and inventory valuation |
| `auditor` | View-only access to inventory history and reports |
| `it_support` | System metrics, settings, and technical configuration |
| `executive` | High-level dashboards and performance reports |

## Available Pages

### Public Pages
- `/` - Home (redirects to dashboard or login)
- `/login` - User login
- `/register` - User registration

### Protected Pages
- `/dashboard` - Overview with role-aware quick actions
- `/dashboard/products` and `/dashboard/products/[id]` - Product catalog
- `/dashboard/categories` - Shared category list
- `/dashboard/inventory` - Multi-warehouse stock, add/remove/transfer
- `/dashboard/inventory/requests` - Approval queue for staff stock requests
- `/dashboard/orders`, `/dashboard/orders/new`, `/dashboard/orders/[id]` - Purchase & sales orders
- `/dashboard/suppliers` - Supplier directory
- `/dashboard/warehouses` - Warehouse locations and capacity
- `/dashboard/alerts` - Alert feed
- `/dashboard/reports` - Inventory/sales/supplier/damage reports with charts and CSV export

### Admin-Only Pages
- `/dashboard/admin` - Admin overview
- `/dashboard/admin/users` - User management (role changes, deactivation)
- `/dashboard/admin/settings` - System settings (admin, it_support)
- `/dashboard/admin/metrics` - Live system/database metrics (admin, it_support)

## Development

### Running the Development Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Starting Production Server
```bash
npm start
```

### Linting
```bash
npm run lint
```

## API Integration

The frontend integrates with the backend API using Axios:

- **Base URL**: `http://localhost:6002/api` (override via `NEXT_PUBLIC_API_URL`)
- **Authentication**: JWT in the `Authorization` header, injected by a request interceptor
- **Error Handling**: A response interceptor normalizes errors and logs out only on token-specific failures (expired/invalid/missing token), not on every 401
- **Caching**: TanStack Query, 1 minute stale time, automatic invalidation on mutations

See `src/services/*.service.ts` for the full list of API service modules — there is one per backend resource (auth, categories, products, inventory, inventory-requests, orders, warehouses, suppliers, alerts, reports, system, users).

## Known Gaps

Tracked in the backend repo's `docs/FEATURE_BACKLOG.md`: no automated frontend
tests yet, only the Inventory page has server-side pagination (other list
pages load their full collection client-side), and there's no bulk-action or
file import/export UI beyond the CSV report export.

## Troubleshooting

### CORS Errors
Ensure the backend has CORS configured for `http://localhost:3000`

### 401 Unauthorized
Check if:
- Backend server is running
- Token is valid and not expired
- Authorization header is being sent

### Module Not Found
Run `npm install` to ensure all dependencies are installed

## License

This project is part of the Inventory Management System.
