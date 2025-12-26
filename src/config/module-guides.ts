import { UserRole } from "@/types/api";
import {
    Package,
    Warehouse,
    ShoppingCart,
    Users,
    Bell,
    BarChart3,
    Settings,
    FileText,
    TrendingUp,
    AlertTriangle,
    ClipboardList,
    LucideIcon,
} from "lucide-react";

export interface ModuleGuide {
    id: string;
    title: string;
    icon: LucideIcon;
    description: string;
    quickActions: {
        label: string;
        href: string;
        description: string;
    }[];
    tips: string[];
    roles: UserRole[];
}

export const MODULE_GUIDES: ModuleGuide[] = [
    // Products Module
    {
        id: "products",
        title: "Product Management",
        icon: Package,
        description: "Manage your product catalog, SKUs, and stock levels",
        quickActions: [
            {
                label: "View All Products",
                href: "/dashboard/products",
                description: "Browse and search your product catalog",
            },
            {
                label: "Add New Product",
                href: "/dashboard/products?action=create",
                description: "Create a new product entry",
            },
        ],
        tips: [
            "Set minimum and maximum stock levels to enable automatic alerts",
            "Use clear, unique SKUs for easy product identification",
            "Keep product descriptions detailed for better inventory tracking",
        ],
        roles: ["admin", "inventory_manager", "procurement_officer", "sales_rep", "auditor", "executive"],
    },

    // Inventory Module
    {
        id: "inventory",
        title: "Inventory Management",
        icon: Warehouse,
        description: "Track stock levels, add/remove inventory, and manage transfers",
        quickActions: [
            {
                label: "View Current Stock",
                href: "/dashboard/inventory",
                description: "Check real-time inventory levels",
            },
            {
                label: "Add Stock",
                href: "/dashboard/inventory?action=add",
                description: "Record new inventory arrivals",
            },
            {
                label: "Remove Stock",
                href: "/dashboard/inventory?action=remove",
                description: "Record stock removals or damages",
            },
            {
                label: "Transfer Stock",
                href: "/dashboard/inventory?action=transfer",
                description: "Move inventory between warehouses",
            },
        ],
        tips: [
            "Always provide a reference (PO number, order ID) when adding or removing stock",
            "Use the 'damage' option when removing damaged items for proper tracking",
            "Check stock levels before creating sales orders to avoid overselling",
        ],
        roles: ["admin", "inventory_manager", "warehouse_supervisor", "warehouse_staff", "auditor", "executive"],
    },

    // Inventory Requests Module
    {
        id: "inventory-requests",
        title: "Inventory Requests",
        icon: ClipboardList,
        description: "Submit and approve inventory change requests",
        quickActions: [
            {
                label: "View Pending Requests",
                href: "/dashboard/inventory/requests",
                description: "Review requests awaiting approval",
            },
            {
                label: "Create New Request",
                href: "/dashboard/inventory/requests?action=create",
                description: "Submit a new inventory change request",
            },
        ],
        tips: [
            "Warehouse staff: Submit requests for stock changes that need approval",
            "Supervisors/Managers: Review and approve requests promptly to avoid delays",
            "Always include a clear reason and reference for audit purposes",
        ],
        roles: ["admin", "inventory_manager", "warehouse_supervisor", "warehouse_staff"],
    },

    // Orders Module
    {
        id: "orders",
        title: "Order Management",
        icon: ShoppingCart,
        description: "Process purchase orders and sales orders efficiently",
        quickActions: [
            {
                label: "View All Orders",
                href: "/dashboard/orders",
                description: "Browse purchase and sales orders",
            },
            {
                label: "Create New Order",
                href: "/dashboard/orders/new",
                description: "Create a purchase or sales order",
            },
        ],
        tips: [
            "Sales Reps: Link orders to customers for better tracking",
            "Procurement Officers: Track supplier orders and delivery status",
            "Use order notes to communicate special instructions",
            "Monitor payment status to manage cash flow",
        ],
        roles: ["admin", "inventory_manager", "procurement_officer", "sales_rep", "finance_officer", "auditor", "executive"],
    },

    // Suppliers Module
    {
        id: "suppliers",
        title: "Supplier Management",
        icon: Users,
        description: "Manage supplier relationships, contacts, and performance",
        quickActions: [
            {
                label: "View All Suppliers",
                href: "/dashboard/suppliers",
                description: "Browse your supplier directory",
            },
            {
                label: "Add New Supplier",
                href: "/dashboard/suppliers?action=create",
                description: "Register a new supplier",
            },
        ],
        tips: [
            "Keep supplier contact information up to date",
            "Track supplier ratings to identify reliable partners",
            "Document payment terms and credit limits clearly",
            "Use categories to organize suppliers by product type",
        ],
        roles: ["admin", "inventory_manager", "procurement_officer", "auditor", "executive"],
    },

    // Warehouses Module
    {
        id: "warehouses",
        title: "Warehouse Management",
        icon: Warehouse,
        description: "Manage warehouse locations, capacity, and operations",
        quickActions: [
            {
                label: "View All Warehouses",
                href: "/dashboard/warehouses",
                description: "See all warehouse locations",
            },
            {
                label: "Add New Warehouse",
                href: "/dashboard/warehouses?action=create",
                description: "Register a new warehouse location",
            },
        ],
        tips: [
            "Monitor warehouse capacity to prevent overcrowding",
            "Keep contact person information current for emergencies",
            "Document operating hours for scheduling deliveries",
            "Use warehouse codes for quick identification",
        ],
        roles: ["admin", "inventory_manager", "warehouse_supervisor", "auditor", "executive"],
    },

    // Alerts Module
    {
        id: "alerts",
        title: "Alerts & Notifications",
        icon: Bell,
        description: "Monitor and respond to system alerts and notifications",
        quickActions: [
            {
                label: "View Active Alerts",
                href: "/dashboard/alerts",
                description: "Check current system alerts",
            },
        ],
        tips: [
            "Acknowledge alerts promptly to keep the system organized",
            "Low stock alerts require immediate attention to prevent stockouts",
            "Configure notification preferences in your profile settings",
            "Resolve alerts once the underlying issue is addressed",
        ],
        roles: ["admin", "inventory_manager", "warehouse_supervisor", "warehouse_staff"],
    },

    // Reports Module
    {
        id: "reports",
        title: "Reports & Analytics",
        icon: BarChart3,
        description: "Generate insights with inventory, sales, and supplier reports",
        quickActions: [
            {
                label: "View Reports Dashboard",
                href: "/dashboard/reports",
                description: "Access all available reports",
            },
        ],
        tips: [
            "Inventory Managers: Use stock reports to optimize reorder points",
            "Sales Reps: Track sales performance and top-selling products",
            "Procurement Officers: Monitor supplier reliability and lead times",
            "Executives: Review high-level metrics and trends",
            "Export reports for presentations and external analysis",
        ],
        roles: ["admin", "inventory_manager", "warehouse_supervisor", "procurement_officer", "sales_rep", "finance_officer", "auditor", "executive"],
    },

    // Admin Module
    {
        id: "admin",
        title: "System Administration",
        icon: Settings,
        description: "Manage users, system settings, and monitor performance",
        quickActions: [
            {
                label: "User Management",
                href: "/dashboard/admin/users",
                description: "Manage user accounts and roles",
            },
            {
                label: "System Settings",
                href: "/dashboard/admin/settings",
                description: "Configure system preferences",
            },
            {
                label: "System Metrics",
                href: "/dashboard/admin/metrics",
                description: "Monitor system health and performance",
            },
        ],
        tips: [
            "Regularly review user access and roles for security",
            "Monitor system metrics to identify performance issues early",
            "Keep system settings documented for team reference",
            "Schedule regular backups and maintenance windows",
        ],
        roles: ["admin", "it_support"],
    },
];

/**
 * Get module guides filtered by user role
 */
export function getModuleGuidesByRole(role: UserRole): ModuleGuide[] {
    return MODULE_GUIDES.filter(guide => guide.roles.includes(role));
}

/**
 * Get a specific module guide by ID
 */
export function getModuleGuideById(id: string): ModuleGuide | undefined {
    return MODULE_GUIDES.find(guide => guide.id === id);
}
