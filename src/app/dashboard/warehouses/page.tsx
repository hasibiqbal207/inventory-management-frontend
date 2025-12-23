"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { warehousesService } from "@/services/warehouses.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Warehouse, MapPin, Phone, Mail } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function WarehousesPage() {
    const { user } = useAuth();
    const { data: warehouses, isLoading } = useQuery({
        queryKey: ["warehouses"],
        queryFn: () => warehousesService.getAll(),
    });

    const isAdmin = user?.role === "admin";

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Warehouses</h1>
                    <p className="text-gray-600 mt-1">Manage warehouse locations and capacity</p>
                </div>
            </div>

            {warehouses && warehouses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {warehouses.map((warehouse) => (
                        <Card key={warehouse._id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">Code: {warehouse.code}</p>
                                    </div>
                                    <Badge variant={warehouse.isActive ? "success" : "default"}>
                                        {warehouse.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-gray-900">{warehouse.address.street}</p>
                                        <p className="text-gray-600">
                                            {warehouse.address.city}, {warehouse.address.state} {warehouse.address.postalCode}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-900">{warehouse.contactPerson.phone}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-900">{warehouse.contactPerson.email}</span>
                                </div>

                                <div className="pt-3 border-t">
                                    <p className="text-xs text-gray-600 mb-2">Capacity</p>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <p className="text-gray-600">Area</p>
                                            <p className="font-semibold">{warehouse.capacity.totalArea} m²</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Volume</p>
                                            <p className="font-semibold">{warehouse.capacity.totalCapacity} m³</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Warehouse className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No warehouses yet</h3>
                    <p className="text-gray-600">Add warehouses to track inventory locations</p>
                </div>
            )}
        </div>
    );
}
