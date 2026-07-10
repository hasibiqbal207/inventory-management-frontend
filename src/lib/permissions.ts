import type { UserRole } from "@/types/api";

/**
 * Single source of truth for "which roles can do X" in the UI. Previously
 * each page computed its own `user?.role === "admin" || ...` checks inline,
 * so a role-matrix change meant hunting through every page to update them
 * all consistently.
 *
 * These lists describe UI visibility, not backend authorization — the API
 * is the actual enforcement point. A couple of entries are intentionally
 * broader than the backend's write-access list (e.g. stock actions are
 * visible to warehouse_staff, who then go through the approval-request
 * flow instead of a direct mutation).
 */
export const PERMISSIONS = {
    manageCategories: ["admin", "inventory_manager"],
    manageProducts: ["admin", "inventory_manager"],
    manageWarehouses: ["admin", "inventory_manager", "warehouse_supervisor"],
    manageSuppliers: ["admin", "procurement_officer"],
    manageStock: ["admin", "inventory_manager", "warehouse_supervisor", "warehouse_staff"],
    transferStock: ["admin", "inventory_manager", "warehouse_supervisor", "warehouse_staff"],
    approveInventoryRequests: ["admin", "inventory_manager", "warehouse_supervisor"],
    createOrders: ["admin", "sales_rep", "procurement_officer"],
    manageReturns: ["admin", "inventory_manager", "warehouse_supervisor", "sales_rep", "procurement_officer"],
    receiveReturns: ["admin", "inventory_manager", "warehouse_supervisor", "warehouse_staff"],
    updateOrderStatus: ["admin", "warehouse_staff", "warehouse_supervisor", "sales_rep", "procurement_officer"],
    deleteOrders: ["admin"],
    viewInventoryReport: ["admin", "inventory_manager", "warehouse_supervisor", "auditor", "executive"],
    viewSalesReport: ["admin", "sales_rep", "finance_officer", "executive"],
    viewSupplierReport: ["admin", "procurement_officer", "finance_officer", "executive"],
} as const satisfies Record<string, UserRole[]>;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
    if (!role) return false;
    return (PERMISSIONS[permission] as readonly UserRole[]).includes(role);
}
