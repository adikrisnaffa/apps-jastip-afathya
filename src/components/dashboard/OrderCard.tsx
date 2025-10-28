"use client";

import type { Order, OrderStatus } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NotaDialog } from "./NotaDialog";

type OrderCardProps = {
  order: Order;
};

const statusConfig: Record<
  OrderStatus,
  { color: string; progress: number; label: string }
> = {
  Placed: { color: "bg-gray-500", progress: 10, label: "Order Placed" },
  Processing: { color: "bg-orange-500", progress: 40, label: "Processing" },
  Shipped: { color: "bg-blue-500", progress: 75, label: "Shipped" },
  Completed: { color: "bg-green-600", progress: 100, label: "Completed" },
  Cancelled: { color: "bg-red-600", progress: 0, label: "Cancelled" },
};

export default function OrderCard({ order }: OrderCardProps) {
  const config = statusConfig[order.status];

  return (
    <Card className="flex flex-col transform hover:-translate-y-1 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline text-lg">{order.itemDescription}</CardTitle>
                <CardDescription>Order ID: {order.id}</CardDescription>
            </div>
          <Badge
            className={cn(
              "text-white whitespace-nowrap",
              config.color
            )}
          >
            {order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{config.label}</span>
                <span>{config.progress}%</span>
            </div>
          <Progress value={config.progress} aria-label={`Order status: ${order.status}`} />
          <p className="text-sm text-muted-foreground pt-2">
            Quantity: <span className="font-semibold text-foreground">{order.quantity}</span>
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <NotaDialog order={order}>
          <Button variant="outline" className="w-full">
            View Receipt
          </Button>
        </NotaDialog>
      </CardFooter>
    </Card>
  );
}
