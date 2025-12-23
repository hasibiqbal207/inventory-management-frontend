"use client";

import { Package, Warehouse, ShoppingCart, Bell } from "lucide-react";

export default function DashboardPage() {
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
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">
                    Welcome to your Inventory Management System
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="bg-white rounded-lg shadow p-6 border border-gray-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
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
            <div className="bg-white rounded-lg shadow p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Getting Started
                </h2>
                <p className="text-gray-600 mb-6">
                    Your inventory management system is ready to use. Here are some quick
                    actions to get started:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            📦 Add Products
                        </h3>
                        <p className="text-sm text-gray-600">
                            Start by adding products to your inventory catalog.
                        </p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            🏢 Create Warehouses
                        </h3>
                        <p className="text-sm text-gray-600">
                            Set up warehouse locations to track inventory.
                        </p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            🤝 Add Suppliers
                        </h3>
                        <p className="text-sm text-gray-600">
                            Manage your supplier relationships and contacts.
                        </p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            📋 Create Orders
                        </h3>
                        <p className="text-sm text-gray-600">
                            Process purchase and sales orders efficiently.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
