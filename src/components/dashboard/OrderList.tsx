"use client";

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import OrderCard from "./OrderCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Truck, User, ChevronDown } from "lucide-react";
import type { Order } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from '../ui/badge';

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

  const groupedOrders = useMemo(() => {
    if (!orders) return {};
    return orders.reduce((acc, order) => {
      const customerName = order.customerName || 'Unnamed Customer';
      if (!acc[customerName]) {
        acc[customerName] = [];
      }
      acc[customerName].push(order);
      return acc;
    }, {} as Record<string, Order[]>);
  }, [orders]);


  if (isUserLoading || (isLoading && !orders)) {
     return (
       <div className="space-y-4">
         <Skeleton className="h-14 w-full" />
         <Skeleton className="h-14 w-full" />
         <Skeleton className="h-14 w-full" />
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
    <Accordion type="multiple" className="w-full space-y-4">
      {Object.entries(groupedOrders).map(([customerName, customerOrders]) => (
        <AccordionItem value={customerName} key={customerName} className="border-b-0">
            <AccordionTrigger className="flex items-center justify-between w-full p-4 font-semibold text-left bg-card text-card-foreground rounded-lg shadow-md hover:bg-card/90 transition-all [&[data-state=open]>svg]:rotate-180">
                <div className='flex items-center gap-4'>
                    <User className="h-5 w-5 text-primary" />
                    <span className='text-lg font-headline'>{customerName}</span>
                    <Badge variant="secondary">{customerOrders.length} Order(s)</Badge>
                </div>
                <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200 text-primary" />
            </AccordionTrigger>
            <AccordionContent className="pt-4">
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {customerOrders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
