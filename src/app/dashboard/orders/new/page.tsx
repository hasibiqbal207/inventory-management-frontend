"use client";

import { useRouter } from "next/navigation";
import { useCreateOrder } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderForm } from "@/components/orders/order-form";
import { ArrowLeft } from "lucide-react";
import type { CreateOrderDTO } from "@/types/api";

export default function NewOrderPage() {
    const router = useRouter();
    const createOrder = useCreateOrder();

    const handleSubmit = async (data: CreateOrderDTO) => {
        await createOrder.mutateAsync(data);
        router.push("/dashboard/orders");
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/dashboard/orders")}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Orders
                </Button>

                <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
                <p className="text-gray-600 mt-1">
                    Create a new purchase or sales order
                </p>
            </div>

            {/* Form Card */}
            <Card className="max-w-4xl">
                <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <OrderForm
                        onSubmit={handleSubmit}
                        onCancel={() => router.push("/dashboard/orders")}
                        isLoading={createOrder.isPending}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
