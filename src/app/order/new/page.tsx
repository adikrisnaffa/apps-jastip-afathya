"use client";

import { OrderForm } from "@/components/order/OrderForm";
import { useSearchParams } from 'next/navigation';
import { mockEvents } from '@/lib/mock-data';
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewOrderPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  const event = mockEvents.find(e => e.id === eventId);

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
      <OrderForm eventId={eventId}/>
    </div>
  );
}
