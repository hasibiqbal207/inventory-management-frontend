"use client";

import { Package, Warehouse, ShoppingCart, Bell } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/protected-route";

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardPageContent />
        </ProtectedRoute>
    );
}

function DashboardPageContent() {
    const stats = [
        {
            name: "Total Products",
            value: "0",
            icon: Package,
            color: "bg-blue-500",
        },
        {
            name: "Warehouses",
            value: "0",
            icon: Warehouse,
            color: "bg-green-500",
        },
        {
            name: "Pending Orders",
            value: "0",
            icon: ShoppingCart,
            color: "bg-yellow-500",
        },
        {
            name: "Active Alerts",
            value: "0",
            icon: Bell,
            color: "bg-red-500",
        },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Welcome to your Inventory Management System
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="bg-card rounded-lg shadow p-6 border border-border"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                                <p className="text-3xl font-bold text-foreground mt-2">
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`${stat.color} p-3 rounded-lg`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Welcome Card */}
            <div className="bg-card rounded-lg shadow p-8 border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                    Getting Started
                </h2>
                <p className="text-muted-foreground mb-6">
                    Your inventory management system is ready to use. Here are some quick
                    actions to get started:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-border rounded-lg p-4">
                        <h3 className="font-semibold text-foreground mb-2">
                            📦 Add Products
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Start by adding products to your inventory catalog.
                        </p>
                    </div>
                    <div className="border border-border rounded-lg p-4">
                        <h3 className="font-semibold text-foreground mb-2">
                            🏢 Create Warehouses
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Set up warehouse locations to track inventory.
                        </p>
                    </div>
                    <div className="border border-border rounded-lg p-4">
                        <h3 className="font-semibold text-foreground mb-2">
                            🤝 Add Suppliers
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Manage your supplier relationships and contacts.
                        </p>
                    </div>
                    <div className="border border-border rounded-lg p-4">
                        <h3 className="font-semibold text-foreground mb-2">
                            📋 Create Orders
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Process purchase and sales orders efficiently.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
