
"use client";

import { useMemo, useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, writeBatch } from "firebase/firestore";
import OrderCard from "./OrderCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Truck, User, ChevronDown, PlusCircle, Receipt, Trash2 } from "lucide-react";
import type { Order } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import Link from 'next/link';
import { NotaDialog } from './NotaDialog';
import { useToast } from '@/hooks/use-toast';

type OrderListProps = {
  eventId: string;
};

export default function OrderList({ eventId }: OrderListProps) {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

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

  const handleDeleteCustomerOrders = async (customerName: string) => {
    if (!firestore || !user || !groupedOrders[customerName]) return;
    
    setIsDeleting(customerName);
    try {
      const batch = writeBatch(firestore);
      const ordersToDelete = groupedOrders[customerName];

      ordersToDelete.forEach(order => {
        const orderRef = doc(firestore, `users/${user.uid}/orders`, order.id);
        batch.delete(orderRef);
      });

      await batch.commit();

      toast({
        title: "Orders Deleted",
        description: `All orders for ${customerName} have been removed.`,
      });
    } catch (error: any) {
       toast({
        title: "Error Deleting Orders",
        description: error.message || `Could not delete orders for ${customerName}.`,
        variant: "destructive",
      });
    } finally {
        setIsDeleting(null);
    }
  }


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
        <AccordionItem value={customerName} key={customerName} className="border-b-0 rounded-lg bg-card text-card-foreground shadow-md transition-all">
            <div className="flex items-center justify-between w-full p-4 font-semibold text-left">
                <AccordionTrigger className="flex-1 p-0 hover:no-underline">
                    <div className="flex items-center gap-4">
                      <User className="h-5 w-5 text-primary" />
                      <span className="text-lg font-headline">{customerName}</span>
                      <Badge variant="secondary">{customerOrders.length} Order(s)</Badge>
                    </div>
                </AccordionTrigger>
                <div className="flex items-center gap-2 pl-4" onClick={(e) => e.stopPropagation()}>
                  <NotaDialog orders={customerOrders} customerName={customerName}>
                    <Button variant="outline" size="sm">
                      <Receipt className="mr-2 h-4 w-4" />
                      View Receipt
                    </Button>
                  </NotaDialog>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                  >
                    <Link
                      href={`/order/new?eventId=${eventId}&customerName=${encodeURIComponent(customerName)}`}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Order
                    </Link>
                  </Button>
                   <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={isDeleting === customerName}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                {isDeleting === customerName ? "..." : "Delete"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete all {customerOrders.length} orders for <strong>{customerName}</strong>. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCustomerOrders(customerName)}>
                                    Yes, delete all
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            <AccordionContent className="pt-0 p-4">
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-4 border-t">
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
