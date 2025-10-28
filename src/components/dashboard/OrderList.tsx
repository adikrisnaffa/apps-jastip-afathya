import { mockOrders } from "@/lib/mock-data";
import OrderCard from "./OrderCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Truck } from "lucide-react";

type OrderListProps = {
  eventId?: string;
};

export default function OrderList({ eventId }: OrderListProps) {
  const allOrders = mockOrders;
  const orders = eventId
    ? allOrders.filter((order) => order.eventId === eventId)
    : allOrders;

  if (orders.length === 0) {
    return (
      <Alert>
        <Truck className="h-4 w-4" />
        <AlertTitle>No Orders Yet!</AlertTitle>
        <AlertDescription>
          Be the first to place an order for this event.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
