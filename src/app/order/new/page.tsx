"use client";

import { useMemo } from 'react';
import { OrderForm } from "@/components/order/OrderForm";
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import type { JastipEvent } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewOrderPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  const customerName = searchParams.get('customerName');
  const firestore = useFirestore();

  const eventRef = useMemoFirebase(() => {
    if (!firestore || !eventId) return null;
    return doc(firestore, "events", eventId);
  }, [firestore, eventId]);

  const { data: event, isLoading } = useDoc<JastipEvent>(eventRef);
  
  if (isLoading) {
    return (
        <div className="container mx-auto max-w-2xl py-12 px-4">
            <div className="relative text-center mb-8">
              <Skeleton className="h-10 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
            </div>
            <div className="space-y-8">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    )
  }

  if (!eventId || !event) {
      return (
          <div className="container mx-auto text-center py-12">
              <h1 className="text-2xl font-bold text-destructive">Event not found</h1>
              <p className="text-muted-foreground">This event does not exist or has been removed.</p>
              <Link href="/" className="mt-4 inline-flex items-center text-primary hover:underline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to all events
              </Link>
          </div>
      )
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <div className="relative text-center mb-8">
        <div>
          <h1 className="text-4xl font-bold font-headline text-primary">
            Submit a New Order
          </h1>
          <p className="text-muted-foreground mt-2">
            for event: <span className="font-semibold text-foreground">{event.name}</span>
          </p>
        </div>
      </div>
      <OrderForm eventId={eventId} defaultCustomerName={customerName || ''} />
    </div>
  );
}
