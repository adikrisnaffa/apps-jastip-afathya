"use client";

import { useCollection, useUser } from "@/firebase";
import { collection, query, orderBy, where } from "firebase/firestore";
import { useFirestore, useMemoFirebase } from "@/firebase/provider";
import EventCard from "@/components/events/EventCard";
import type { JastipEvent } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function Home() {
  const firestore = useFirestore();
  const { user } = useUser();

  // For now, let's assume any logged in user can create an event.
  // A future improvement would be to have specific roles.
  const canCreateEvents = !!user;

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "events"), orderBy("date", "desc"));
  }, [firestore]);

  const { data: events, isLoading } = useCollection<JastipEvent>(eventsQuery);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline text-primary">
          Upcoming Jastip Events
        </h1>
        <p className="text-muted-foreground mt-2">
          Choose an event to start your shopping journey.
        </p>
      </div>

      {canCreateEvents && (
          <div className="text-center mb-12">
            <Button asChild>
                <Link href="/events/new">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create New Event
                </Link>
            </Button>
          </div>
      )}

      {isLoading && (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      )}

      {!isLoading && events && (
         <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {!isLoading && !events?.length && (
        <div className="text-center text-muted-foreground mt-8">
          <p>No events found. {canCreateEvents && "Create a new one to get started!"}</p>
        </div>
      )}
    </div>
  );
}
