# Inventory Management System - Frontend

A modern, production-ready frontend for the Inventory Management System built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Authentication System** - Secure login and registration with JWT tokens
- **Dashboard** - Overview with key metrics and statistics
- **Multi-Warehouse Support** - Track inventory across multiple locations
- **Order Management** - Handle purchase and sales orders
- **Supplier Management** - Manage supplier relationships
- **Real-time Alerts** - Notifications for low stock and system events
- **Reports & Analytics** - Data visualization and insights
- **Role-Based Access Control** - Admin and user roles with different permissions

## 📋 Prerequisites

- Node.js 18+ installed
- Backend server running on `http://localhost:6002`
- npm or yarn package manager

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Validation**: Zod
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📦 Installation

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

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── providers.tsx      # App providers
├── components/            # React components
│   ├── auth/             # Authentication components
│   └── ui/               # Reusable UI components
├── contexts/             # React contexts
│   └── auth-context.tsx  # Authentication context
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
│   ├── api-client.ts    # Axios instance
│   ├── query-client.ts  # TanStack Query config
│   └── utils.ts         # Utility functions
├── services/            # API service layer
│   └── auth.service.ts  # Authentication service
└── types/               # TypeScript type definitions
    └── api.ts           # API types and interfaces
```

## 🔐 Authentication

The application uses JWT-based authentication:

1. **Register**: Create a new account at `/register`
2. **Login**: Sign in at `/login`
3. **Protected Routes**: Dashboard and all sub-pages require authentication
4. **Token Storage**: JWT tokens are stored in localStorage
5. **Auto-redirect**: Unauthenticated users are redirected to login

### User Roles

- **Admin**: Full access to all features including settings and user management
- **User**: Standard access to view and manage inventory, orders, etc.

## 📱 Available Pages

### Public Pages
- `/` - Home (redirects to dashboard or login)
- `/login` - User login
- `/register` - User registration

### Protected Pages
- `/dashboard` - Main dashboard with overview
- `/dashboard/products` - Product management (coming soon)
- `/dashboard/inventory` - Inventory tracking (coming soon)
- `/dashboard/orders` - Order management (coming soon)
- `/dashboard/suppliers` - Supplier management (coming soon)
- `/dashboard/warehouses` - Warehouse management (coming soon)
- `/dashboard/alerts` - Alert notifications (coming soon)
- `/dashboard/reports` - Reports and analytics (coming soon)

### Admin-Only Pages
- `/dashboard/admin/settings` - System settings (coming soon)
- `/dashboard/admin/metrics` - System metrics (coming soon)

## 🔧 Development

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

## 🎨 UI Components

The application uses custom UI components built with Tailwind CSS:

- **Button** - Reusable button with variants (default, destructive, outline, ghost)
- **Input** - Form input with consistent styling
- **Label** - Form label component
- More components will be added as needed

## 📡 API Integration

The frontend integrates with the backend API using Axios:

- **Base URL**: `http://localhost:6002/api`
- **Authentication**: JWT tokens in Authorization header
- **Error Handling**: Automatic token expiration handling and redirects
- **Interceptors**: Request/response interceptors for auth and error handling

### API Services

- `authService` - Authentication (login, register, logout)
- More services will be added for each module

## 🚧 Current Status

### ✅ Completed
- [x] Project setup and dependencies
- [x] Environment configuration
- [x] API client with interceptors
- [x] TypeScript type definitions
- [x] Authentication system (login/register)
- [x] Auth context and protected routes
- [x] Dashboard layout with sidebar
- [x] Basic UI components
- [x] Home page with auto-redirect

### 🔄 In Progress
- [ ] Products module
- [ ] Inventory module
- [ ] Orders module
- [ ] Warehouses module
- [ ] Suppliers module
- [ ] Alerts module
- [ ] Reports module
- [ ] Admin features

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 Notes

- Ensure the backend server is running before starting the frontend
- The application uses localStorage for token storage
- All protected routes automatically redirect to login if not authenticated
- Admin-only routes check user role before allowing access

## 🐛 Troubleshooting

### CORS Errors
Ensure the backend has CORS configured for `http://localhost:3000`

### 401 Unauthorized
Check if:
- Backend server is running
- Token is valid and not expired
- Authorization header is being sent

### Module Not Found
Run `npm install` to ensure all dependencies are installed

## 📄 License

This project is part of the Inventory Management System.

---

**Version**: 1.0.0  
**Last Updated**: December 2024
