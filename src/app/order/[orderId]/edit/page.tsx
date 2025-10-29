"use client";

import { useMemo } from 'react';
import { OrderForm } from "@/components/order/OrderForm";
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useFirestore, useMemoFirebase, useUser } from '@/firebase/provider';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import type { Order } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditOrderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.orderId as string;
  const eventId = searchParams.get('eventId');
  const firestore = useFirestore();
  const { user } = useUser();

  const orderRef = useMemoFirebase(() => {
    if (!firestore || !user || !orderId) return null;
    return doc(firestore, `users/${user.uid}/orders`, orderId);
  }, [firestore, user, orderId]);

  const { data: order, isLoading } = useDoc<Order>(orderRef);
  
  if (isLoading) {
    return (
        <div className="container mx-auto max-w-2xl py-12 px-4">
            <Skeleton className="h-10 w-1/3 mb-4" />
            <div className="space-y-8">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    )
  }

  if (!order) {
      return (
          <div className="container mx-auto max-w-2xl py-12 px-4 text-center">
              <h1 className="text-2xl font-bold text-destructive">Order Not Found</h1>
              <p className="text-muted-foreground">This order does not exist or you do not have permission to view it.</p>
               <Button asChild variant="link" className="mt-4">
                <Link href={eventId ? `/events/${eventId}` : '/'}>
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Back to Event
                </Link>
            </Button>
          </div>
      )
  }
   if (!eventId) {
      return (
          <div className="container mx-auto max-w-2xl py-12 px-4">
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Missing Event ID</AlertTitle>
                <AlertDescription>
                    The event ID is missing from the URL. Cannot process this request.
                </AlertDescription>
             </Alert>
              <Button asChild variant="link" className="mt-4">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Back to Home
                </Link>
            </Button>
          </div>
      )
   }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <div className="relative text-center mb-8">
        <div>
          <h1 className="text-4xl font-bold font-headline text-primary">
            Edit Order
          </h1>
          <p className="text-muted-foreground mt-2">
            Order ID: <span className="font-semibold text-foreground">{order.id}</span>
          </p>
        </div>
      </div>
      <OrderForm eventId={eventId} order={order} />
    </div>
  );
}
