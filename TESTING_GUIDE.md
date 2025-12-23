# Testing Guide - Inventory Management Frontend

## 🎯 Overview
This guide provides comprehensive testing instructions for the Inventory Management System frontend.

---

## 📋 Pre-Testing Checklist

### Backend Requirements
- [ ] Backend server is running on `http://localhost:6002`
- [ ] MongoDB is connected and running
- [ ] All API endpoints are operational
- [ ] Test data is seeded (recommended)

### Frontend Requirements
- [ ] Frontend dev server is running on `http://localhost:3000`
- [ ] `.env.local` file is configured correctly
- [ ] All dependencies are installed (`npm install`)
- [ ] No build errors in the console

---

## 🧪 Testing Scenarios

### 1. Authentication Flow

#### Test Case 1.1: User Registration
1. Navigate to `http://localhost:3000`
2. Click "Create an account" or go to `/register`
3. Fill in the registration form:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `test@example.com`
   - Password: `Test@1234`
   - Confirm Password: `Test@1234`
4. Click "Create Account"
5. **Expected:** Success toast, redirect to `/dashboard`

#### Test Case 1.2: User Login
1. Navigate to `/login`
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `Test@1234`
3. Click "Sign In"
4. **Expected:** Success toast, redirect to `/dashboard`

#### Test Case 1.3: Protected Routes
1. Log out from the dashboard
2. Try to access `/dashboard/products` directly
3. **Expected:** Redirect to `/login`

#### Test Case 1.4: Token Expiration
1. Login successfully
2. Wait for token to expire (24 hours) or manually delete token from localStorage
3. Try to navigate to any protected page
4. **Expected:** Redirect to `/login` with appropriate message

---

### 2. Products Module

#### Test Case 2.1: View Products List
1. Login and navigate to `/dashboard/products`
2. **Expected:** See list of all products in grid view
3. Verify each card shows:
   - Product name and SKU
   - Description (truncated)
   - Price, Category, Stock quantity
   - Active/Inactive status
   - Last updated date

#### Test Case 2.2: Search Products
1. On products page, use the search bar
2. Search for a product by name, SKU, or category
3. **Expected:** Real-time filtering of products

#### Test Case 2.3: Create Product (Admin Only)
1. Login as admin user
2. Click "Add Product" button
3. Fill in the form:
   - Product Name: `Test Product`
   - SKU: `TEST-001`
   - Description: `Test description`
   - Price: `99.99`
   - Category: `Electronics`
   - Stock Quantity: `50`
4. Click "Create Product"
5. **Expected:** Success toast, product appears in list

#### Test Case 2.4: Edit Product (Admin Only)
1. Click "Edit" on any product card
2. Modify any field
3. Click "Update Product"
4. **Expected:** Success toast, changes reflected immediately

#### Test Case 2.5: Delete Product (Admin Only)
1. Click "Delete" on any product card
2. Confirm deletion in dialog
3. **Expected:** Success toast, product removed from list

#### Test Case 2.6: View Product Details
1. Click on any product card
2. **Expected:** Navigate to `/dashboard/products/[id]`
3. Verify all product information is displayed
4. Check quick stats sidebar

---

### 3. Inventory Module

#### Test Case 3.1: View Inventory Dashboard
1. Navigate to `/dashboard/inventory`
2. **Expected:** See 4 statistics cards:
   - Total Products
   - Low Stock Items
   - Out of Stock Items
   - Total Stock Value
3. Verify inventory table shows all products

#### Test Case 3.2: Add Stock
1. Click "Add Stock" button
2. Select a product from dropdown
3. Enter quantity (e.g., `10`)
4. Click "Add Stock"
5. **Expected:** Success toast, stock quantity updated in table

#### Test Case 3.3: Remove Stock
1. Click "Remove Stock" button
2. Select a product with available stock
3. Enter quantity less than available stock
4. Click "Remove Stock"
5. **Expected:** Success toast, stock quantity decreased

#### Test Case 3.4: Remove Stock Validation
1. Try to remove more stock than available
2. **Expected:** Error message, button disabled

#### Test Case 3.5: Quick Actions from Table
1. Use the + and - buttons in the table rows
2. **Expected:** Dialog opens with product pre-selected

#### Test Case 3.6: Search Inventory
1. Use the search bar to filter products
2. **Expected:** Real-time filtering

#### Test Case 3.7: Stock Level Indicators
1. Check color coding:
   - Red: Out of stock (0)
   - Yellow: Low stock (< 10)
   - Green: In stock (≥ 10)
2. **Expected:** Correct colors for each stock level

---

### 4. Orders Module

#### Test Case 4.1: View Orders List
1. Navigate to `/dashboard/orders`
2. **Expected:** See 5 statistics cards and list of orders
3. Verify order cards show:
   - Order number
   - Type (Sales/Purchase) and Status badges
   - Total amount, items count
   - Payment status, created date

#### Test Case 4.2: Filter Orders
1. Use status filter dropdown
2. Select "Pending"
3. **Expected:** Only pending orders shown
4. Use type filter
5. Select "Sales"
6. **Expected:** Only sales orders shown

#### Test Case 4.3: Create Sales Order
1. Click "New Order"
2. Select "Sales Order"
3. Add order items:
   - Select products
   - Enter quantities
   - Verify auto-filled prices
4. Fill optional fields (customer ID, payment method, etc.)
5. Click "Create Order"
6. **Expected:** Success toast, redirect to orders list

#### Test Case 4.4: Create Purchase Order
1. Click "New Order"
2. Select "Purchase Order"
3. Add items and fill supplier ID
4. Submit
5. **Expected:** Order created successfully

#### Test Case 4.5: Update Order Status
1. From orders list, use status dropdown on any order
2. Change status (e.g., Pending → Processing)
3. **Expected:** Success toast, status updated immediately

#### Test Case 4.6: Delete Order (Admin Only)
1. Click delete button on any order
2. Confirm deletion
3. **Expected:** Success toast, order removed

#### Test Case 4.7: Dynamic Order Items
1. In new order form, click "Add Item"
2. **Expected:** New item row added
3. Click remove icon on an item
4. **Expected:** Item removed (minimum 1 item)

#### Test Case 4.8: Order Total Calculation
1. Add multiple items to an order
2. Change quantities and prices
3. **Expected:** Total updates in real-time

---

### 5. Warehouses Module

#### Test Case 5.1: View Warehouses
1. Navigate to `/dashboard/warehouses`
2. **Expected:** See grid of warehouse cards
3. Verify each card shows:
   - Name, code, active status
   - Full address
   - Contact person (phone, email)
   - Capacity (area and volume)

#### Test Case 5.2: Empty State
1. If no warehouses exist
2. **Expected:** Helpful empty state message

---

### 6. Suppliers Module

#### Test Case 6.1: View Suppliers
1. Navigate to `/dashboard/suppliers`
2. **Expected:** See grid of supplier cards
3. Verify each card shows:
   - Company name, contact person
   - Email, phone, address
   - Rating (if available)
   - Category badges

#### Test Case 6.2: Supplier Ratings
1. Check suppliers with ratings
2. **Expected:** Star icon with rating out of 5.0

---

### 7. Alerts Module

#### Test Case 7.1: View All Alerts
1. Navigate to `/dashboard/alerts`
2. **Expected:** See list of all alerts
3. Verify unread count in header

#### Test Case 7.2: Filter Unread Alerts
1. Click "Unread" tab
2. **Expected:** Only unread alerts shown

#### Test Case 7.3: Mark Alert as Read
1. Click "Mark as Read" on any unread alert
2. **Expected:** Success toast, alert styling changes

#### Test Case 7.4: Mark All as Read
1. Click "Mark All Read" button
2. **Expected:** All alerts marked as read

#### Test Case 7.5: Dismiss Alert
1. Click "Dismiss" on any alert
2. **Expected:** Alert removed from list

#### Test Case 7.6: Alert Severity Indicators
1. Check alerts with different severities
2. **Expected:** Correct icons and badge colors:
   - Critical: Red X icon
   - High: Orange warning icon
   - Medium: Yellow info icon
   - Low: Blue check icon

---

### 8. Reports Module

#### Test Case 8.1: View Inventory Report
1. Navigate to `/dashboard/reports`
2. Ensure "Inventory Report" is selected
3. **Expected:** See 4 statistics cards:
   - Total Products
   - Total Value
   - Low Stock Items
   - Out of Stock Items
4. Verify "Inventory by Category" section

#### Test Case 8.2: View Sales Report
1. Click "Sales Report" tab
2. **Expected:** See 3 statistics cards:
   - Total Orders
   - Total Revenue
   - Average Order Value
3. Verify "Top Selling Products" section

#### Test Case 8.3: Export Report (UI)
1. Click "Export Report" button
2. **Expected:** Button is visible (functionality TBD)

---

### 9. Admin Features

#### Test Case 9.1: Access Admin Settings (Admin Only)
1. Login as admin
2. Navigate to `/dashboard/admin/settings`
3. **Expected:** See system settings page
4. Verify sections:
   - General Settings
   - Database Settings
   - User Management
   - Notifications

#### Test Case 9.2: Access Admin Metrics (Admin Only)
1. Navigate to `/dashboard/admin/metrics`
2. **Expected:** See system metrics dashboard
3. Verify:
   - API Status, Database status
   - Uptime, Response time
   - System information
   - Database statistics

#### Test Case 9.3: Admin-Only Access
1. Login as regular user
2. Try to access `/dashboard/admin/settings`
3. **Expected:** Redirect or access denied

---

### 10. UI/UX Testing

#### Test Case 10.1: Responsive Design
1. Resize browser window to mobile size (< 768px)
2. Navigate through all pages
3. **Expected:** All pages are mobile-friendly
4. Sidebar should adapt or collapse

#### Test Case 10.2: Loading States
1. On any page with data fetching
2. Refresh the page
3. **Expected:** See loading spinner while data loads

#### Test Case 10.3: Error States
1. Stop the backend server
2. Try to fetch data on any page
3. **Expected:** User-friendly error message

#### Test Case 10.4: Empty States
1. Navigate to a module with no data
2. **Expected:** Helpful empty state with CTA

#### Test Case 10.5: Toast Notifications
1. Perform any CRUD operation
2. **Expected:** Toast notification appears
3. Success: Green toast
4. Error: Red toast

#### Test Case 10.6: Form Validation
1. Try to submit any form with empty required fields
2. **Expected:** Validation errors shown
3. Submit button disabled until valid

---

## 🐛 Common Issues & Solutions

### Issue 1: "No refresh token found"
**Solution:** Clear localStorage and login again

### Issue 2: CORS errors
**Solution:** Ensure backend has CORS configured for `http://localhost:3000`

### Issue 3: 401 Unauthorized
**Solution:** Check if token is expired, login again

### Issue 4: Products not showing
**Solution:** Ensure backend has products seeded in database

### Issue 5: Module not found errors
**Solution:** Run `npm install` to ensure all dependencies are installed

---

## ✅ Testing Completion Checklist

### Authentication
- [ ] Registration works
- [ ] Login works
- [ ] Logout works
- [ ] Protected routes redirect correctly
- [ ] Token expiration handled

### Products
- [ ] List view works
- [ ] Search works
- [ ] Create works (admin)
- [ ] Edit works (admin)
- [ ] Delete works (admin)
- [ ] Detail view works

### Inventory
- [ ] Dashboard statistics correct
- [ ] Add stock works
- [ ] Remove stock works
- [ ] Validation works
- [ ] Search works
- [ ] Color coding correct

### Orders
- [ ] List view works
- [ ] Filters work
- [ ] Create sales order works
- [ ] Create purchase order works
- [ ] Status updates work
- [ ] Delete works (admin)
- [ ] Total calculation correct

### Warehouses
- [ ] List view works
- [ ] All information displayed

### Suppliers
- [ ] List view works
- [ ] Ratings displayed
- [ ] Categories shown

### Alerts
- [ ] List view works
- [ ] Filters work
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Dismiss works
- [ ] Severity indicators correct

### Reports
- [ ] Inventory report works
- [ ] Sales report works
- [ ] Statistics correct

### Admin
- [ ] Settings page accessible (admin only)
- [ ] Metrics page accessible (admin only)
- [ ] Regular users blocked

### UI/UX
- [ ] Responsive on mobile
- [ ] Loading states work
- [ ] Error states work
- [ ] Empty states work
- [ ] Toasts work
- [ ] Form validation works

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________
Backend Version: ___________
Frontend Version: ___________

Modules Tested:
- [ ] Authentication
- [ ] Products
- [ ] Inventory
- [ ] Orders
- [ ] Warehouses
- [ ] Suppliers
- [ ] Alerts
- [ ] Reports
- [ ] Admin

Issues Found: ___________
Critical Bugs: ___________
Minor Bugs: ___________

Overall Status: [ ] Pass [ ] Fail
```

---

**Happy Testing! 🚀**
