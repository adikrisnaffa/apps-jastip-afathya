"use client";

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import OrderCard from "./OrderCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Truck } from "lucide-react";
import type { Order } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";

type OrderListProps = {
  eventId?: string;
};

export default function OrderList({ eventId }: OrderListProps) {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    let q = query(collection(firestore, `users/${user.uid}/orders`));
    if (eventId) {
      q = query(q, where("eventId", "==", eventId));
    }
    return q;
  }, [firestore, user?.uid, eventId]);

  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  if (isUserLoading || (isLoading && !orders)) {
     return (
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         <Skeleton className="h-64 w-full" />
         <Skeleton className="h-64 w-full" />
         <Skeleton className="h-64 w-full" />
       </div>
     );
  }
  
  if (!user) {
    return (
        <Alert>
            <Truck className="h-4 w-4" />
            <AlertTitle>Please Log In</AlertTitle>
            <AlertDescription>
                You need to be logged in to see your orders for this event.
            </AlertDescription>
        </Alert>
    )
  }

  if (orders && orders.length === 0) {
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
      {orders?.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
