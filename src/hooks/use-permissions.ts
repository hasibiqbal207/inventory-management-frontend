import { useAuth } from "@/contexts/auth-context";
import { hasPermission, type Permission } from "@/lib/permissions";

/**
 * Returns the current user's UI permission flags, computed from the shared
 * PERMISSIONS matrix in @/lib/permissions — the one place a role-matrix
 * change needs to happen.
 */
export function usePermissions() {
    const { user } = useAuth();

    const can = (permission: Permission) => hasPermission(user?.role, permission);

    return {
        isAdmin: user?.role === "admin",
        isWarehouseStaff: user?.role === "warehouse_staff",
        canManageCategories: can("manageCategories"),
        canManageProducts: can("manageProducts"),
        canManageWarehouses: can("manageWarehouses"),
        canManageSuppliers: can("manageSuppliers"),
        canManageStock: can("manageStock"),
        canTransferStock: can("transferStock"),
        canApproveInventoryRequests: can("approveInventoryRequests"),
        canCreateOrders: can("createOrders"),
        canUpdateOrderStatus: can("updateOrderStatus"),
        canDeleteOrders: can("deleteOrders"),
        canViewInventoryReport: can("viewInventoryReport"),
        canViewSalesReport: can("viewSalesReport"),
        canViewSupplierReport: can("viewSupplierReport"),
    };
}
