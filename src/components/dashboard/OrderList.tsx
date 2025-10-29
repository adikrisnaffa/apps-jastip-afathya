"use client";

import { useMemo, useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, writeBatch, doc } from "firebase/firestore";
import OrderCard from "./OrderCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Truck, User, PlusCircle, Receipt, Trash2, CreditCard } from "lucide-react";
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
  isOwner: boolean;
};

export default function OrderList({ eventId, isOwner }: OrderListProps) {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  // The query depends on whether the user is the owner of the event
  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;

    let ordersCollectionRef = collection(firestore, `users/${user.uid}/orders`);

    // If the user is the owner, they see all orders for the event.
    // If not, they only see their own orders for the event.
    // NOTE: This assumes orders are stored under the event owner's user ID.
    // A more robust solution might have a top-level `orders` collection.
    // For this implementation, we will query based on who is viewing.
    
    // The current structure is `users/{userId}/orders`. This means an owner
    // can only see their own orders. To let owners see all orders, we'd need
    // to change the data model. Let's assume for now the owner is also the one
    // creating orders on behalf of others, so they are all under their UID.
    // A regular user would have their *own* `users/{theirId}/orders` collection.

    let q = query(
      ordersCollectionRef,
      where("eventId", "==", eventId),
    );

    // If the user is NOT the owner, we further filter to show only orders
    // created BY them (assuming a userId field on the order)
    if (!isOwner) {
      q = query(q, where("userId", "==", user.uid));
    }
    
    return q;
  }, [firestore, user?.uid, eventId, isOwner]);

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
    if (!firestore || !user || !groupedOrders[customerName] || !isOwner) return;
    
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

  const handleMarkAllPaid = async (customerName: string) => {
    if (!firestore || !user || !groupedOrders[customerName] || !isOwner) return;
    
    setIsUpdatingStatus(customerName);
    try {
      const batch = writeBatch(firestore);
      const ordersToUpdate = groupedOrders[customerName];

      ordersToUpdate.forEach(order => {
        const orderRef = doc(firestore, `users/${user.uid}/orders`, order.id);
        batch.update(orderRef, { status: "Paid" });
      });

      await batch.commit();

      toast({
        title: "Orders Updated",
        description: `All orders for ${customerName} have been marked as Paid.`,
      });
    } catch (error: any) {
       toast({
        title: "Error Updating Orders",
        description: error.message || `Could not update orders for ${customerName}.`,
        variant: "destructive",
      });
    } finally {
        setIsUpdatingStatus(null);
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
          {isOwner ? "No one has placed an order for this event yet." : "You haven't placed any orders for this event yet."}
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
                
                {isOwner && (
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
                    <Button variant="outline" size="sm" onClick={() => handleMarkAllPaid(customerName)} disabled={isUpdatingStatus === customerName}>
                          <CreditCard className="mr-2 h-4 w-4" />
                          {isUpdatingStatus === customerName ? "Paying..." : "Paid"}
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
                )}
            </div>
            <AccordionContent className="pt-0 p-4">
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-4 border-t">
                    {customerOrders.map((order) => (
                        <OrderCard key={order.id} order={order} isOwner={isOwner}/>
                    ))}
                </div>
            </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
