# Data Management Guide

## How to Add/Edit/Delete Data

This guide explains how to manage different types of data in the Inventory Management System.

---

## User Roles

The system has **ten roles** (see the backend's `ROLES.md` for the full permission matrix):

| Role | Can generally |
|---|---|
| **admin** | Everything — full CRUD on all modules, user management, settings |
| **inventory_manager** | Manage products, categories, stock levels, warehouses |
| **warehouse_supervisor** | Manage warehouses, stock transfers, approve staff requests |
| **warehouse_staff** | Request stock add/remove/transfer (requires supervisor approval), acknowledge alerts, update order status |
| **procurement_officer** | Manage suppliers and purchase orders |
| **sales_rep** | Create and manage sales orders |
| **finance_officer** | View financial/inventory-value reports |
| **auditor** | View-only access to inventory history and reports |
| **it_support** | System settings and metrics |
| **executive** | High-level dashboards and reports across all areas |

Every module below lists exactly which roles can create/edit/delete it — it is
no longer a simple admin-vs-everyone-else split.

---

## Managing Products

**Who can do this:** admin, inventory_manager (create/edit/delete). Everyone else with dashboard access can view.

### Create a Product
1. Navigate to `/dashboard/products`
2. Click "Add Product"
3. Fill in the form: Product Name, SKU, Description, Category (select from the managed list), Unit Price, Min/Max Stock Level
4. Click "Create Product"

Stock quantity is **not** set here — Product is a catalog entry only; actual
stock levels live per-warehouse under Inventory.

### Edit / Delete a Product
Use "Edit" or "Delete" on any product card.

---

## Managing Categories

**Who can do this:** admin, inventory_manager (create/edit/delete). Everyone else can view.

Categories are a shared list used by both Products and Suppliers.

1. Navigate to `/dashboard/categories`
2. "Add Category" to create one (name + optional description)
3. **Renaming a category cascades automatically** — every product and supplier
   already tagged with the old name is updated to the new one
4. Deleting a category only removes it from the managed list; products/suppliers
   that already used the name keep it as plain text

---

## Managing Inventory

**Who can do this (direct add/remove/transfer):** admin, inventory_manager, warehouse_supervisor.
**warehouse_staff** submits a **request** instead, which one of the above must approve.

### Add / Remove / Transfer Stock
1. Navigate to `/dashboard/inventory`
2. Use "Add Stock", "Remove Stock", or "Transfer Stock" (or the quick-action buttons on a table row)
3. Select product and warehouse(s), enter quantity and a reason/reference
4. Submit

### Staff Requests (warehouse_staff)
1. Submitting the form above as warehouse_staff creates a **pending request** instead of moving stock immediately
2. A supervisor/manager/admin reviews it at `/dashboard/inventory/requests` and approves or rejects (with a reason)
3. Approval executes the actual stock movement; rejection does not

---

## Managing Orders

**Who can create:** admin, sales_rep, procurement_officer.
**Who can update status:** the above, plus warehouse_staff.
**Who can delete:** admin (pending orders only).

### Create an Order
1. Navigate to `/dashboard/orders`, click "New Order"
2. Select order type: **Sales** (to a customer) or **Purchase** (from a supplier)
3. Add line items (product, quantity, unit price) — subtotal/total calculate automatically
4. Choose a currency (USD, EUR, GBP, or BDT)
5. Fill optional fields: payment method, shipping/billing address, notes
6. Click "Create Order"

### Update Order Status
Use the status action on the order detail page. Orders cannot be edited once
`completed` or `cancelled`. Completing an order automatically applies the
corresponding stock movement.

---

## Managing Warehouses

**Who can do this:** admin, inventory_manager, warehouse_supervisor (create/edit). admin only for delete.

1. Navigate to `/dashboard/warehouses`, click "Add Warehouse"
2. Fill in: Name, Code (auto-generated if left blank), Address, Contact Person, Capacity (area/volume), Operating Hours, Features
3. Edit/Delete from the warehouse card as needed

---

## Managing Suppliers

**Who can do this:** admin, procurement_officer (create/edit). admin only for delete. Everyone else can view.

Full CRUD is available (this used to be view-only — that's no longer the case).

1. Navigate to `/dashboard/suppliers`, click "Add Supplier"
2. Fill in company info, contact person, address, categories (from the shared category list), payment terms, tax ID
3. Edit/Delete from the supplier card as needed

---

## Managing Alerts

**Who can create:** admin, inventory_manager, warehouse_supervisor.
**Who can acknowledge:** the above, plus warehouse_staff.

Alerts are **not** auto-generated on a schedule today — they only exist once
created through the API (there is no background job watching stock levels
yet; see the backend's `docs/FEATURE_BACKLOG.md` for that gap).

### What You Can Do
1. **View Alerts** - `/dashboard/alerts`
2. **Filter** - "All" or "Unread"
3. **Acknowledge / Resolve** - per alert
4. **Dismiss** - removes an alert

---

## Viewing Reports

**Who can view which report** varies by report — see the table below.

| Report | Who can view |
|---|---|
| Inventory | admin, inventory_manager, warehouse_supervisor, finance_officer, auditor, executive |
| Sales | admin, sales_rep, finance_officer, executive |
| Supplier Performance | admin, procurement_officer, executive |
| Damaged Stock | admin, inventory_manager, warehouse_supervisor, auditor, executive |

1. Navigate to `/dashboard/reports` and pick a tab (only the tabs your role can see are shown)
2. Each report includes a chart alongside the stats/table
3. "Export Report" downloads the current tab's data as CSV

---

## Admin Panel

**Who can do this:** admin (all), it_support (Settings and Metrics only).

### System Settings
1. Navigate to `/dashboard/admin/settings`
2. Settings are grouped by category (General, Backup, Security, Notifications) and are backed by the real settings API — toggles and fields reflect the database, and "Save Changes" persists them

### System Metrics
1. Navigate to `/dashboard/admin/metrics`
2. Live data: API/database status, uptime, DB response time, Node version, environment, memory usage, and real database statistics (collection/document counts, size)

### Users
1. Navigate to `/dashboard/admin/users` (admin only)
2. Change a user's role or deactivate/delete an account

---

## Quick Reference

| Module | Create | Edit | Delete | View |
|--------|--------|------|--------|------|
| **Products** | admin, inventory_manager | admin, inventory_manager | admin, inventory_manager | all |
| **Categories** | admin, inventory_manager | admin, inventory_manager | admin, inventory_manager | all |
| **Inventory** | admin, inv. mgr, wh. supervisor (staff via request) | — | — | all |
| **Orders** | admin, sales_rep, procurement_officer | status: + warehouse_staff | admin (pending only) | all |
| **Warehouses** | admin, inv. mgr, wh. supervisor | same | admin | all |
| **Suppliers** | admin, procurement_officer | same | admin | all |
| **Alerts** | admin, inv. mgr, wh. supervisor | acknowledge: + wh. staff | dismiss: creator roles | all |
| **Reports** | system-generated | — | — | role-gated per report (see above) |
| **Admin Settings/Metrics** | — | admin, it_support | — | admin, it_support |
| **Users** | admin (register) | admin (role) | admin | admin |

---

## Tips

1. **Admin Access:** Register normally, then update the role via `/dashboard/admin/users` (or directly in MongoDB) if no admin account exists yet
2. **Backend Required:** Make sure the backend is running on `http://localhost:6002`
3. **Data Persistence:** All data is stored in MongoDB via the backend API
4. **Real-time Updates:** The UI refetches via TanStack Query after every mutation

---

## Troubleshooting

### "Cannot create/edit/delete"
Check your role against the Quick Reference table above — most modules are
now restricted to specific roles, not just admin-vs-everyone.

### "No data showing"
Run the backend's seed script (`npm run seed`) or create records via the UI. Verify the backend is reachable at the configured `NEXT_PUBLIC_API_URL`.

### "Permission denied"
Your role doesn't include the action you're trying to perform — see the Quick Reference table, or log in as admin to confirm the feature itself works.

---

**Need help? Check `TESTING_GUIDE.md` for testing scenarios.**
