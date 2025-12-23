"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Supplier, CreateSupplierDTO } from "@/types/api";

interface SupplierFormProps {
    supplier?: Supplier;
    onSubmit: (data: CreateSupplierDTO) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function SupplierForm({
    supplier,
    onSubmit,
    onCancel,
    isLoading,
}: SupplierFormProps) {
    const [formData, setFormData] = useState<CreateSupplierDTO>({
        companyName: "",
        contactPerson: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
        },
        email: "",
        phone: "",
        address: {
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
        },
        categories: [],
        paymentTerms: "",
        taxId: "",
    });

    const [categoryInput, setCategoryInput] = useState("");

    useEffect(() => {
        if (supplier) {
            setFormData({
                companyName: supplier.companyName,
                contactPerson: supplier.contactPerson,
                email: supplier.email,
                phone: supplier.phone,
                address: supplier.address,
                categories: supplier.categories,
                paymentTerms: supplier.paymentTerms,
                taxId: supplier.taxId || "",
            });
        }
    }, [supplier]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            setFormData((prev) => ({
                ...prev,
                [parent]: {
                    ...(prev[parent as keyof CreateSupplierDTO] as any),
                    [child]: value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const addCategory = () => {
        if (categoryInput.trim() && !formData.categories.includes(categoryInput.trim())) {
            setFormData((prev) => ({
                ...prev,
                categories: [...prev.categories, categoryInput.trim()],
            }));
            setCategoryInput("");
        }
    };

    const removeCategory = (category: string) => {
        setFormData((prev) => ({
            ...prev,
            categories: prev.categories.filter((c) => c !== category),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Company Information</h3>
                <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                        placeholder="ABC Supplies Inc."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Company Email *</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="contact@company.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Company Phone *</Label>
                        <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="+1 234 567 8900"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="taxId">Tax ID</Label>
                        <Input
                            id="taxId"
                            name="taxId"
                            value={formData.taxId}
                            onChange={handleChange}
                            placeholder="12-3456789"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="paymentTerms">Payment Terms *</Label>
                        <Input
                            id="paymentTerms"
                            name="paymentTerms"
                            value={formData.paymentTerms}
                            onChange={handleChange}
                            required
                            placeholder="Net 30"
                        />
                    </div>
                </div>
            </div>

            {/* Contact Person */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Person</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="contactPerson.firstName">First Name *</Label>
                        <Input
                            id="contactPerson.firstName"
                            name="contactPerson.firstName"
                            value={formData.contactPerson.firstName}
                            onChange={handleChange}
                            required
                            placeholder="John"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contactPerson.lastName">Last Name *</Label>
                        <Input
                            id="contactPerson.lastName"
                            name="contactPerson.lastName"
                            value={formData.contactPerson.lastName}
                            onChange={handleChange}
                            required
                            placeholder="Doe"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="contactPerson.email">Email *</Label>
                        <Input
                            id="contactPerson.email"
                            name="contactPerson.email"
                            type="email"
                            value={formData.contactPerson.email}
                            onChange={handleChange}
                            required
                            placeholder="john.doe@company.com"
                        />
                    </div>

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
                        placeholder="123 Business Ave"
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

            {/* Categories */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Categories</h3>
                <div className="flex gap-2">
                    <Input
                        value={categoryInput}
                        onChange={(e) => setCategoryInput(e.target.value)}
                        placeholder="Add category (e.g., Electronics)"
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addCategory();
                            }
                        }}
                    />
                    <Button type="button" onClick={addCategory}>
                        Add
                    </Button>
                </div>
                {formData.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {formData.categories.map((category) => (
                            <div
                                key={category}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                                {category}
                                <button
                                    type="button"
                                    onClick={() => removeCategory(category)}
                                    className="ml-1 hover:text-blue-900"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : supplier ? "Update Supplier" : "Create Supplier"}
                </Button>
            </div>
        </form>
    );
}
