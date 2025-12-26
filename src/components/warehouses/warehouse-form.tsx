"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Warehouse, CreateWarehouseDTO } from "@/types/api";

interface WarehouseFormProps {
    warehouse?: Warehouse;
    onSubmit: (data: CreateWarehouseDTO) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function WarehouseForm({
    warehouse,
    onSubmit,
    onCancel,
    isLoading,
}: WarehouseFormProps) {
    const [formData, setFormData] = useState<CreateWarehouseDTO>({
        name: "",
        code: "",
        type: "main",
        address: {
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
        },
        contactPerson: {
            name: "",
            phone: "",
            email: "",
        },
        capacity: {
            totalArea: 0,
            totalCapacity: 0,
        },
        operatingHours: {
            start: "09:00",
            end: "17:00",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
    });

    useEffect(() => {
        if (warehouse) {
            setFormData({
                name: warehouse.name,
                code: warehouse.code,
                type: warehouse.type,
                address: warehouse.address,
                contactPerson: warehouse.contactPerson,
                capacity: {
                    totalArea: warehouse.capacity.totalArea,
                    totalCapacity: warehouse.capacity.totalCapacity,
                },
                operatingHours: warehouse.operatingHours,
            });
        }
    }, [warehouse]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;

        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            setFormData((prev) => ({
                ...prev,
                [parent]: {
                    ...(prev[parent as keyof CreateWarehouseDTO] as any),
                    [child]: type === "number" ? parseFloat(value) || 0 : value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === "number" ? parseFloat(value) || 0 : value,
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Warehouse Name *</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Main Warehouse"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="code">Warehouse Code *</Label>
                        <Input
                            id="code"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            required
                            placeholder="WH-001"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="type">Warehouse Type *</Label>
                    <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange as any}
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="main">Main Warehouse</option>
                        <option value="satellite">Satellite Warehouse</option>
                        <option value="third-party">Third-Party Warehouse</option>
                    </select>
                </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Address</h3>
                <div className="space-y-2">
                    <Label htmlFor="address.street">Street *</Label>
                    <Input
                        id="address.street"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleChange}
                        required
                        placeholder="123 Main St"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="address.city">City *</Label>
                        <Input
                            id="address.city"
                            name="address.city"
                            value={formData.address.city}
                            onChange={handleChange}
                            required
                            placeholder="New York"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address.state">State *</Label>
                        <Input
                            id="address.state"
                            name="address.state"
                            value={formData.address.state}
                            onChange={handleChange}
                            required
                            placeholder="NY"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="address.postalCode">Postal Code *</Label>
                        <Input
                            id="address.postalCode"
                            name="address.postalCode"
                            value={formData.address.postalCode}
                            onChange={handleChange}
                            required
                            placeholder="10001"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address.country">Country *</Label>
                        <Input
                            id="address.country"
                            name="address.country"
                            value={formData.address.country}
                            onChange={handleChange}
                            required
                            placeholder="USA"
                        />
                    </div>
                </div>
            </div>

            {/* Contact Person */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Person</h3>
                <div className="space-y-2">
                    <Label htmlFor="contactPerson.name">Name *</Label>
                    <Input
                        id="contactPerson.name"
                        name="contactPerson.name"
                        value={formData.contactPerson.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="contactPerson.phone">Phone *</Label>
                        <Input
                            id="contactPerson.phone"
                            name="contactPerson.phone"
                            value={formData.contactPerson.phone}
                            onChange={handleChange}
                            required
                            placeholder="+1 234 567 8900"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contactPerson.email">Email *</Label>
                        <Input
                            id="contactPerson.email"
                            name="contactPerson.email"
                            type="email"
                            value={formData.contactPerson.email}
                            onChange={handleChange}
                            required
                            placeholder="contact@warehouse.com"
                        />
                    </div>
                </div>
            </div>

            {/* Capacity */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Capacity</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="capacity.totalArea">Total Area (m²) *</Label>
                        <Input
                            id="capacity.totalArea"
                            name="capacity.totalArea"
                            type="number"
                            min="0"
                            value={formData.capacity.totalArea}
                            onChange={handleChange}
                            required
                            placeholder="1000"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="capacity.totalCapacity">Total Capacity (m³) *</Label>
                        <Input
                            id="capacity.totalCapacity"
                            name="capacity.totalCapacity"
                            type="number"
                            min="0"
                            value={formData.capacity.totalCapacity}
                            onChange={handleChange}
                            required
                            placeholder="5000"
                        />
                    </div>


                </div>
            </div>

            {/* Operating Hours */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Operating Hours</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="operatingHours.start">Opening Time *</Label>
                        <Input
                            id="operatingHours.start"
                            name="operatingHours.start"
                            type="time"
                            value={formData.operatingHours.start}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="operatingHours.end">Closing Time *</Label>
                        <Input
                            id="operatingHours.end"
                            name="operatingHours.end"
                            type="time"
                            value={formData.operatingHours.end}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="operatingHours.timezone">Timezone *</Label>
                    <Input
                        id="operatingHours.timezone"
                        name="operatingHours.timezone"
                        value={formData.operatingHours.timezone}
                        onChange={handleChange}
                        required
                        placeholder="America/New_York"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : warehouse ? "Update Warehouse" : "Create Warehouse"}
                </Button>
            </div>
        </form>
    );
}
