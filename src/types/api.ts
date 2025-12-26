// ============================================================================
// API Response Types
// ============================================================================

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

// ============================================================================
// User & Authentication Types
// ============================================================================

export type UserRole =
    | "admin"
    | "inventory_manager"
    | "warehouse_supervisor"
    | "warehouse_staff"
    | "procurement_officer"
    | "sales_rep"
    | "finance_officer"
    | "auditor"
    | "it_support"
    | "executive";

export interface User {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
}

export interface AuthResponse {
    user: User;
    token: string;
}

// ============================================================================
// Product Types
// ============================================================================

export interface Product {
    _id: string;
    productName: string;
    description: string;
    category: string;
    stockQuantity: number;
    minStockLevel: number;
    maxStockLevel: number;
    sku: string;
    isActive: boolean;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductDTO {
    productName: string;
    description: string;
    category: string;
    sku: string;
    stockQuantity?: number;
    minStockLevel?: number;
    maxStockLevel?: number;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> { }

// ============================================================================
// Inventory Types
// ============================================================================

export interface Inventory {
    _id: string;
    productId: string | Product;
    warehouseId: string | Warehouse;
    quantity: number;
    minimumStockLevel: number;
    maximumStockLevel: number;
    expiryDate?: string;
    supplier?: string;
    origin?: string;
    productMaterial?: string;
    lastStockUpdate: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface AddStockDTO {
    productId: string;
    warehouseId: string;
    quantity: number;
    reason: string;
    reference: string;
    expiryDate?: string;
    supplier?: string;
    origin?: string;
    productMaterial?: string;
}

export interface RemoveStockDTO {
    productId: string;
    warehouseId: string;
    quantity: number;
    reason: string;
    reference: string;
    isDamage?: boolean;
}

// ============================================================================
// Inventory Request Types (Approval Workflow)
// ============================================================================

export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type RequestType = "add" | "remove" | "transfer";

export interface InventoryRequest {
    _id: string;
    productId: string | Product;
    warehouseId: string | Warehouse;
    type: RequestType;
    quantity: number;
    fromWarehouseId?: string | Warehouse;
    toWarehouseId?: string | Warehouse;
    reason: string;
    reference: string;
    expiryDate?: string;
    supplier?: string;
    origin?: string;
    productMaterial?: string;
    requestedBy: string | User;
    status: RequestStatus;
    approvedBy?: string | User;
    approvalDate?: string;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateInventoryRequestDTO {
    productId: string;
    warehouseId: string;
    type: RequestType;
    quantity: number;
    fromWarehouseId?: string;
    toWarehouseId?: string;
    reason: string;
    reference: string;
    expiryDate?: string;
    supplier?: string;
    origin?: string;
    productMaterial?: string;
}

export interface ApproveRequestDTO {
    id: string;
}

export interface RejectRequestDTO {
    id: string;
    reason: string;
}

// ============================================================================
// Warehouse Types
// ============================================================================

export type WarehouseType = "main" | "satellite" | "third-party";

export interface Address {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface ContactPerson {
    name: string;
    phone: string;
    email: string;
}

export interface WarehouseCapacity {
    totalArea: number;
    usedArea: number;
    totalCapacity: number;
    usedCapacity: number;
}

export interface OperatingHours {
    start: string;
    end: string;
    timezone: string;
}

export interface Warehouse {
    _id: string;
    name: string;
    code: string;
    type: WarehouseType;
    address: Address;
    contactPerson: ContactPerson;
    capacity: WarehouseCapacity;
    operatingHours: OperatingHours;
    features: string[];
    notes?: string;
    isActive: boolean;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateWarehouseDTO {
    name: string;
    code?: string;
    type: WarehouseType;
    address: Address;
    contactPerson: ContactPerson;
    capacity: {
        totalArea: number;
        totalCapacity: number;
    };
    operatingHours: {
        start: string;
        end: string;
        timezone: string;
    };
    features?: string[];
    notes?: string;
}

// ============================================================================
// Supplier Types
// ============================================================================

export interface SupplierContactPerson {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
}

export interface Supplier {
    _id: string;
    companyName: string;
    contactPerson: SupplierContactPerson;
    email: string;
    phone: string;
    alternatePhone?: string;
    address: Address;
    taxId?: string;
    paymentTerms?: string;
    creditLimit?: number;
    rating?: number;
    categories: string[];
    notes?: string;
    isActive: boolean;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSupplierDTO {
    companyName: string;
    contactPerson: SupplierContactPerson;
    email: string;
    phone: string;
    alternatePhone?: string;
    address: Address;
    taxId?: string;
    paymentTerms?: string;
    creditLimit?: number;
    categories: string[];
    notes?: string;
}

// ============================================================================
// Order Types
// ============================================================================

export type OrderType = "purchase" | "sales";
export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "partial" | "paid";
export type Currency = "USD" | "EUR" | "GBP" | "BDT";

export interface OrderItem {
    productId: string | Product;
    quantity: number;
    unitPrice: number;
    subtotal?: number;
}

export interface Order {
    _id: string;
    orderNumber: string;
    orderType: OrderType;
    status: OrderStatus;
    currency: Currency;
    customerId?: string | User;
    supplierId?: string | Supplier;
    items: OrderItem[];
    totalAmount: number;
    paymentStatus: PaymentStatus;
    paymentMethod?: string;
    warehouseId: string;
    shippingAddress?: string;
    billingAddress?: string;
    notes?: string;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderDTO {
    orderType: OrderType;
    currency: Currency;
    customerId?: string;
    supplierId?: string;
    items: OrderItem[];
    warehouseId: string;
    paymentMethod?: string;
    shippingAddress?: string;
    billingAddress?: string;
    notes?: string;
}

// ============================================================================
// Alert Types
// ============================================================================

export type AlertType = "low_stock" | "order_delay" | "stock_expiry" | "price_change" | "system" | "custom";
export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type AlertStatus = "active" | "acknowledged" | "resolved";
export type NotificationChannel = "email" | "sms" | "push" | "system";

export interface AlertMetadata {
    productId?: string;
    orderId?: string;
    warehouseId?: string;
    threshold?: number;
    currentValue?: number;
}

export interface NotificationSent {
    channel: NotificationChannel;
    recipient: string;
    sentAt: string;
    status: string;
}

export interface Alert {
    _id: string;
    type: AlertType;
    severity: AlertSeverity;
    status: AlertStatus;
    title: string;
    message: string;
    metadata?: AlertMetadata;
    notificationChannels: NotificationChannel[];
    recipients: string[];
    notificationsSent: NotificationSent[];
    expiresAt?: string;
    createdBy: string;
    acknowledgedBy?: string;
    resolvedBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAlertDTO {
    type: AlertType;
    severity: AlertSeverity;
    title: string;
    message: string;
    metadata?: AlertMetadata;
    notificationChannels: NotificationChannel[];
    recipients: string[];
    expiresAt?: string;
}

// ============================================================================
// Report Types
// ============================================================================

export interface InventoryReportItem {
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
}

export interface TopProduct {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
}

export interface SalesByCategory {
    category: string;
    revenue: number;
    percentage: number;
}

export interface DailySales {
    date: string;
    revenue: number;
    orders: number;
}

export interface SalesReport {
    period: string;
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    topProducts: TopProduct[];
    salesByCategory: SalesByCategory[];
    dailySales: DailySales[];
}

// ============================================================================
// System Types
// ============================================================================

export interface SystemHealth {
    status: "healthy" | "degraded" | "unhealthy";
    details: {
        database: string;
        cache: string;
        queue: string;
    };
}

export interface SystemMetrics {
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
    };
}

export type SettingDataType = "string" | "number" | "boolean" | "object" | "array";

export interface Setting {
    category: string;
    key: string;
    value: any;
    dataType: SettingDataType;
    description: string;
    isSystem: boolean;
    updatedAt: string;
}
