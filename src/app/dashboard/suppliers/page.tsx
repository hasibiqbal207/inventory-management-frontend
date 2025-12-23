"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { suppliersService } from "@/services/suppliers.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Phone, MapPin, Star } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function SuppliersPage() {
    const { user } = useAuth();
    const { data: suppliers, isLoading } = useQuery({
        queryKey: ["suppliers"],
        queryFn: () => suppliersService.getAll(),
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
                    <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
                    <p className="text-gray-600 mt-1">Manage supplier relationships and contacts</p>
                </div>
            </div>

            {suppliers && suppliers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suppliers.map((supplier) => (
                        <Card key={supplier._id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{supplier.companyName}</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {supplier.contactPerson.firstName} {supplier.contactPerson.lastName}
                                        </p>
                                    </div>
                                    <Badge variant={supplier.isActive ? "success" : "default"}>
                                        {supplier.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-900">{supplier.email}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-900">{supplier.phone}</span>
                                </div>

                                <div className="flex items-start gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-gray-900">{supplier.address.city}, {supplier.address.state}</p>
                                        <p className="text-gray-600">{supplier.address.country}</p>
                                    </div>
                                </div>

                                {supplier.rating && (
                                    <div className="flex items-center gap-2 text-sm pt-2 border-t">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <span className="font-semibold">{supplier.rating.toFixed(1)}</span>
                                        <span className="text-gray-600">/ 5.0</span>
                                    </div>
                                )}

                                <div className="pt-2">
                                    <p className="text-xs text-gray-600 mb-2">Categories</p>
                                    <div className="flex flex-wrap gap-1">
                                        {supplier.categories.slice(0, 3).map((cat, idx) => (
                                            <Badge key={idx} variant="default" className="text-xs">
                                                {cat}
                                            </Badge>
                                        ))}
                                        {supplier.categories.length > 3 && (
                                            <Badge variant="default" className="text-xs">
                                                +{supplier.categories.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers yet</h3>
                    <p className="text-gray-600">Add suppliers to manage your supply chain</p>
                </div>
            )}
        </div>
    );
}
