"use client";

import { useMemo } from "react";
import OrderList from "@/components/dashboard/OrderList";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { useFirestore, useMemoFirebase } from "@/firebase/provider";
import type { JastipEvent } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const firestore = useFirestore();
  
  const eventRef = useMemoFirebase(() => {
      if (!firestore || !eventId) return null;
      return doc(firestore, "events", eventId);
  }, [firestore, eventId]);

  const { data: event, isLoading } = useDoc<JastipEvent>(eventRef);
  const eventDate = event?.date?.toDate();

  if (isLoading) {
    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-10 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2 mb-1" />
            <Skeleton className="h-5 w-1/4" />
        </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-destructive">Event not found</h1>
        <p className="text-muted-foreground">This event does not exist or has been removed.</p>
        <Link href="/" className="mt-4 inline-flex items-center text-primary hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all events
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Button asChild variant="outline" className="mb-4">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                All Events
            </Link>
        </Button>
        <h1 className="text-4xl font-bold font-headline text-foreground">{event.name}</h1>
        <p className="text-muted-foreground mt-2">{event.description}</p>
        <p className="text-sm text-primary font-semibold mt-1">{eventDate ? eventDate.toLocaleDateString() : 'Date not set'}</p>
      </div>
      
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h2 className="text-3xl font-bold font-headline text-foreground">
          Orders for this Event
        </h2>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href={`/order/new?eventId=${event.id}`}>
            <PlusCircle className="mr-2 h-5 w-5" />
            New Order
          </Link>
        </Button>
      </div>
      <OrderList eventId={event.id} />
    </div>
  );
}
